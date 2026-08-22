import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import { createRecruiterFeedbackSEGEntries } from '../services/seg.service.js';

async function parseRecruiterFeedback(state) {
  const s = Date.now();
  const { feedback } = state;
  return { ...state, feedbackText: feedback.text || '', studentId: feedback.studentId, driveId: feedback.driveId, company: feedback.company || 'Unknown', round: feedback.round || 'general', nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'parseRecruiterFeedback', durationMs: Date.now() - s, status: 'success' }] };
}

async function extractSkillSignals(state) {
  const s = Date.now();
  const { feedbackText, userId } = state;

  const prompt = `Analyze this recruiter interview feedback and extract skill signals:
"${feedbackText}"

For each skill mentioned or implied, provide:
- skillId (from standard taxonomy like "python.basics", "soft.communication", "dsa.arrays")
- score (0-100 based on sentiment)
- feedback (brief rationale)

Return JSON array: [{"skillId": "...", "score": 0-100, "feedback": "..."}]
Return ONLY the JSON.`;

  let signals = [];
  try {
    const result = await otariCallWithRetry({ route: 'feedback.analyze', prompt, userId, options: { temperature: 0.3, maxTokens: 1024 } });
    signals = JSON.parse(result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    signals = [{ skillId: 'soft.communication', score: 50, feedback: 'Feedback received but analysis unavailable.' }];
  }

  return { ...state, skillSignals: signals, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'extractSkillSignals', durationMs: Date.now() - s, status: 'success' }] };
}

async function reconcileWithSEG(state) {
  const s = Date.now();
  const { skillSignals, studentId, institutionId } = state;
  // Reconcile with existing SEG entries. E.g. find current scores.
  const existingSEG = await SkillEvidenceGraph.find({ studentId, institutionId, skillId: { $in: skillSignals.map(sig => sig.skillId) } }).lean();
  
  const reconciledSignals = skillSignals.map(sig => {
    const existing = existingSEG.find(e => e.skillId === sig.skillId);
    if (existing) {
      // Adjust score slightly based on existing confidence
      sig.adjustedScore = Math.round((sig.score + existing.confidenceScore) / 2);
    } else {
      sig.adjustedScore = sig.score;
    }
    return sig;
  });

  return { ...state, skillSignals: reconciledSignals, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'reconcileWithSEG', durationMs: Date.now() - s, status: 'success' }] };
}

async function commitFeedback(state) {
  const s = Date.now();
  const { skillSignals, studentId, driveId, company, userId, institutionId } = state;

  const entries = await createRecruiterFeedbackSEGEntries({
    studentId, institutionId, driveId, company, skillSignals, recruiterId: userId,
  });

  return { ...state, segEntriesCreated: entries.length, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'commitFeedback', durationMs: Date.now() - s, status: 'success' }] };
}

function buildGraph() {
  const ch = d => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({ channels: { feedback: ch({}), userId: ch(null), institutionId: ch(null), feedbackText: ch(''), studentId: ch(null), driveId: ch(null), company: ch(''), round: ch(''), skillSignals: ch([]), segEntriesCreated: ch(0), nodesExecuted: ch([]) } });
  graph.addNode('parseRecruiterFeedback', parseRecruiterFeedback);
  graph.addNode('extractSkillSignals', extractSkillSignals);
  graph.addNode('reconcileWithSEG', reconcileWithSEG);
  graph.addNode('commitFeedback', commitFeedback);
  graph.setEntryPoint('parseRecruiterFeedback');
  graph.addEdge('parseRecruiterFeedback', 'extractSkillSignals');
  graph.addEdge('extractSkillSignals', 'reconcileWithSEG');
  graph.addEdge('reconcileWithSEG', 'commitFeedback');
  graph.addEdge('commitFeedback', END);
  return graph.compile();
}

let compiled = null;

export async function runFeedbackAnalyzer({ feedback, userId, institutionId }) {
  if (!compiled) compiled = buildGraph();
  const startTime = Date.now();
  const agentRun = await AgentRun.create({ agentName: 'feedback_analyzer', otariRouteTag: 'feedback.analyze', triggeredBy: userId, input: { studentId: feedback.studentId }, status: 'running', modelUsed: 'gemini-1.5-flash' });
  try {
    const result = await compiled.invoke({ feedback, userId, institutionId });
    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'success', nodesExecuted: result.nodesExecuted, output: { segEntries: result.segEntriesCreated }, durationMs });
    return { segEntriesCreated: result.segEntriesCreated, skillSignals: result.skillSignals, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'failed', error: error.message, durationMs: Date.now() - startTime });
    throw error;
  }
}

export default { runFeedbackAnalyzer };
