import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import DebateSession from '../models/DebateSession.js';
import User from '../models/User.js';
import { createDebateSEGEntries } from '../services/seg.service.js';
import { debateOpponentSpeak } from '../config/elevenlabs.js';
import { getIO } from '../config/socket.js';

async function selectTopic(state) {
  const s = Date.now();
  const { sessionId } = state;
  const session = await DebateSession.findById(sessionId);
  if (!session) throw new Error('Debate session not found');

  return { ...state, session: session.toObject(), topic: session.topic, studentId: session.studentId, stance: session.side || 'for', turns: [], turnIndex: 0, maxTurns: 4, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'selectTopic', durationMs: Date.now() - s, status: 'success' }] };
}

async function prepareArguments(state) {
  const s = Date.now();
  const { topic, stance, userId } = state;
  const aiStance = stance === 'for' ? 'against' : 'for';

  const prompt = `Prepare 3 debate arguments ${aiStance} the topic: "${topic}". Be articulate and use evidence-based reasoning. Return JSON array of strings: ["argument1", "argument2", "argument3"]. Return ONLY the JSON.`;

  let aiArguments = [`The opposing view on "${topic}" presents valid concerns...`];
  try {
    const result = await otariCallWithRetry({ route: 'debate.coach', prompt, userId, options: { temperature: 0.7, maxTokens: 1024 } });
    const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    aiArguments = JSON.parse(jsonStr);
  } catch { /* use fallback */ }

  return { ...state, aiStance, aiArguments, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'prepareArguments', durationMs: Date.now() - s, status: 'success' }] };
}

async function generateAIOpening(state) {
  const s = Date.now();
  const { topic, aiStance, aiArguments, sessionId, studentId } = state;

  const opening = `I'll be arguing ${aiStance} the topic "${topic}". ${aiArguments[0]}`;
  const audio = await debateOpponentSpeak(opening);

  try {
    getIO().to(`student:${studentId}`).emit('debate:ai-turn', { sessionId, text: opening, turnType: 'opening', hasAudio: !!audio });
  } catch (e) { console.error('Debate socket fail:', e.message); }

  return { ...state, turns: [...state.turns, { speaker: 'ai', text: opening, turnType: 'opening' }], nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateAIOpening', durationMs: Date.now() - s, status: 'success' }] };
}

async function analyzeStudentArgument(state) {
  const s = Date.now();
  const { studentTurn, topic, aiStance, userId } = state;

  if (!studentTurn) {
    return { ...state, studentAnalysis: { strengths: [], weaknesses: ['No argument provided'] }, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'analyzeStudentArgument', durationMs: Date.now() - s, status: 'no_input' }] };
  }

  const prompt = `Analyze this student's debate argument on "${topic}". They argue "${state.stance}". Identify strengths and weaknesses.
Student says: "${studentTurn}"
Return JSON: {"strengths": ["..."], "weaknesses": ["..."], "logicalScore": <0-100>}. Return ONLY JSON.`;

  let analysis = { strengths: [], weaknesses: [], logicalScore: 50 };
  try {
    const result = await otariCallWithRetry({ route: 'debate.coach', prompt, userId, options: { temperature: 0.3, maxTokens: 1024 } });
    analysis = JSON.parse(result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch { /* use fallback */ }

  return { ...state, studentAnalysis: analysis, turns: [...state.turns, { speaker: 'student', text: studentTurn, turnType: 'argument', analysis }], nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'analyzeStudentArgument', durationMs: Date.now() - s, status: 'success' }] };
}

async function generateAIRebuttal(state) {
  const s = Date.now();
  const { studentTurn, aiArguments, turnIndex, topic, userId, sessionId, studentId } = state;

  const prompt = `You are debating ${state.aiStance} "${topic}". The student said: "${studentTurn}". Counter their argument using this point: "${aiArguments[Math.min(turnIndex, aiArguments.length - 1)]}". Be persuasive but respectful. Keep it under 100 words.`;

  let rebuttal = 'That is an interesting perspective, however...';
  try {
    const result = await otariCallWithRetry({ route: 'debate.coach', prompt, userId, options: { temperature: 0.7, maxTokens: 512 } });
    rebuttal = result.text.trim();
  } catch { /* use fallback */ }

  const audio = await debateOpponentSpeak(rebuttal);

  try {
    getIO().to(`student:${studentId}`).emit('debate:ai-turn', { sessionId, text: rebuttal, turnType: 'rebuttal', hasAudio: !!audio });
  } catch (e) { console.error('Debate socket fail:', e.message); }

  return { ...state, turns: [...state.turns, { speaker: 'ai', text: rebuttal, turnType: 'rebuttal' }], turnIndex: state.turnIndex + 1, studentTurn: null, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateAIRebuttal', durationMs: Date.now() - s, status: 'success' }] };
}

function decideNext(state) {
  return state.turnIndex >= state.maxTurns ? 'scoreDebate' : 'analyzeStudentArgument';
}

async function scoreDebate(state) {
  const s = Date.now();
  const { turns, topic, stance, userId } = state;

  const studentTurns = turns.filter(t => t.speaker === 'student');
  const fullTranscript = turns.map(t => `${t.speaker.toUpperCase()} (${t.turnType}): ${t.text}`).join('\n\n');

  const prompt = `You are a professional debate judge evaluating a debate on topic "${topic}".
Candidate stance: ${stance}

Full Debate Transcript:
${fullTranscript}

Evaluate candidate performance across 5 key dimensions (0 to 100 integer score):
1. logicalReasoning
2. evidenceUsage
3. communication
4. counterArguments
5. overall

Return JSON object:
{"logicalReasoning": 0-100, "evidenceUsage": 0-100, "communication": 0-100, "counterArguments": 0-100, "overall": 0-100}
Return ONLY the JSON object.`;

  let scores = { logicalReasoning: 50, evidenceUsage: 50, communication: 50, counterArguments: 50, overall: 50 };
  let result;
  try {
    result = await otariCallWithRetry({ route: 'debate.coach', prompt, userId, options: { temperature: 0.3, maxTokens: 512 } });
    const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    scores = JSON.parse(jsonStr);
  } catch {
    const jsonMatch = result?.text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      scores = JSON.parse(jsonMatch[0]);
    } else {
      const avgLogical = studentTurns.reduce((sum, t) => sum + (t.analysis?.logicalScore || 50), 0) / Math.max(studentTurns.length, 1);
      scores = {
        logicalReasoning: Math.round(avgLogical),
        evidenceUsage: Math.round(avgLogical),
        communication: Math.round(avgLogical),
        counterArguments: Math.round(avgLogical),
        overall: Math.round(avgLogical),
      };
    }
  }

  await DebateSession.findByIdAndUpdate(state.sessionId, { status: 'completed', report: { scores, turns } });

  return { ...state, scores, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'scoreDebate', durationMs: Date.now() - s, status: 'success' }] };
}

async function extractSkillsAndCommit(state) {
  const s = Date.now();
  const { scores, studentId, sessionId } = state;

  const student = await User.findById(studentId).select('institutionId');

  const skillScores = [
    { skillId: 'soft.communication', score: scores.communication, feedback: 'Debate communication assessment' },
    { skillId: 'soft.critical_thinking', score: scores.logicalReasoning, feedback: 'Logical reasoning assessment' },
    { skillId: 'soft.presentation', score: scores.overall, feedback: 'Overall debate performance' },
  ];

  await createDebateSEGEntries({ studentId, institutionId: student?.institutionId, sessionId, skillScores });

  return { ...state, segWritten: true, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'extractSkillsAndCommit', durationMs: Date.now() - s, status: 'success' }] };
}

function buildGraph() {
  const ch = d => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({
    channels: {
      sessionId: ch(null), userId: ch(null), studentId: ch(null), session: ch(null),
      topic: ch(''), stance: ch('for'), aiStance: ch('against'), aiArguments: ch([]),
      turns: ch([]), turnIndex: ch(0), maxTurns: ch(4), studentTurn: ch(null),
      studentAnalysis: ch(null), scores: ch(null), segWritten: ch(false), nodesExecuted: ch([]),
    },
  });

  graph.addNode('selectTopic', selectTopic);
  graph.addNode('prepareArguments', prepareArguments);
  graph.addNode('generateAIOpening', generateAIOpening);
  graph.addNode('analyzeStudentArgument', analyzeStudentArgument);
  graph.addNode('generateAIRebuttal', generateAIRebuttal);
  graph.addNode('scoreDebate', scoreDebate);
  graph.addNode('extractSkillsAndCommit', extractSkillsAndCommit);

  graph.setEntryPoint('selectTopic');
  graph.addEdge('selectTopic', 'prepareArguments');
  graph.addEdge('prepareArguments', 'generateAIOpening');
  graph.addEdge('generateAIOpening', 'analyzeStudentArgument');
  graph.addEdge('analyzeStudentArgument', 'generateAIRebuttal');
  graph.addConditionalEdges('generateAIRebuttal', decideNext, { analyzeStudentArgument: 'analyzeStudentArgument', scoreDebate: 'scoreDebate' });
  graph.addEdge('scoreDebate', 'extractSkillsAndCommit');
  graph.addEdge('extractSkillsAndCommit', END);
  return graph.compile();
}

let compiled = null;

export async function runDebateCoach({ sessionId, userId, studentTurns = [] }) {
  if (!compiled) compiled = buildGraph();
  const startTime = Date.now();
  const agentRun = await AgentRun.create({ agentName: 'debate_coach', otariRouteTag: 'debate.coach', triggeredBy: userId, input: { sessionId }, status: 'running', modelUsed: 'gemini-1.5-pro' });

  try {
    const result = await compiled.invoke({ sessionId, userId });
    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'success', nodesExecuted: result.nodesExecuted, output: { scores: result.scores }, durationMs });
    return { scores: result.scores, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'failed', error: error.message, durationMs: Date.now() - startTime });
    throw error;
  }
}

export default { runDebateCoach };
