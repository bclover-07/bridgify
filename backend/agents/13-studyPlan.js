import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import { computeReadiness } from '../services/readiness.service.js';
import { createNotification } from '../services/notification.service.js';

async function analyzeGaps(state) {
  const s = Date.now();
  const { studentId, targetRole } = state;

  const readiness = await computeReadiness(studentId, targetRole);
  const gaps = readiness.recommendations || [];

  return { ...state, readiness, gaps, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'analyzeGaps', durationMs: Date.now() - s, status: 'success' }] };
}

async function generateWeeklyPlan(state) {
  const s = Date.now();
  const { gaps, targetRole, readiness, userId } = state;

  const gapsSummary = gaps.map(g => `${g.label}: ${g.currentScore}/100 (target: ${g.targetScore})`).join('\n');

  const prompt = `Create a 4-week study plan for a student targeting the "${targetRole}" role (current readiness: ${readiness.overallReadiness}%).

Skill gaps to address:
${gapsSummary}

For each week, provide:
1. Focus skill(s)
2. Specific learning activities (with estimated hours)
3. Practice exercises
4. Milestones to hit

Return JSON: {"weeks": [{"weekNumber": 1, "focusSkills": ["..."], "activities": [{"title": "...", "hours": 2, "type": "learning|practice|project"}], "milestone": "..."}]}
Return ONLY the JSON.`;

  let plan = { weeks: [] };
  try {
    const result = await otariCallWithRetry({ route: 'study.plan', prompt, userId, options: { temperature: 0.5, maxTokens: 3072 } });
    plan = JSON.parse(result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    plan = { weeks: gaps.map((g, i) => ({ weekNumber: i + 1, focusSkills: [g.skillId], activities: [{ title: `Study ${g.label}`, hours: 5, type: 'learning' }], milestone: `Reach ${g.targetScore}% in ${g.label}` })) };
  }

  return { ...state, plan, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateWeeklyPlan', durationMs: Date.now() - s, status: 'success' }] };
}

async function saveAndNotify(state) {
  const s = Date.now();
  const { plan, studentId, targetRole, readiness } = state;

  await createNotification({
    userId: studentId,
    type: 'study_plan_generated',
    title: 'Study Plan Ready',
    body: `Your personalized ${plan.weeks?.length || 4}-week study plan for "${targetRole}" is ready.`,
    metadata: { targetRole, currentReadiness: readiness.overallReadiness },
    actionUrl: '/student/study-hub',
  });

  return { ...state, saved: true, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'saveAndNotify', durationMs: Date.now() - s, status: 'success' }] };
}

function buildGraph() {
  const ch = d => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({ channels: { studentId: ch(null), targetRole: ch('sde_1'), userId: ch(null), readiness: ch(null), gaps: ch([]), plan: ch(null), saved: ch(false), nodesExecuted: ch([]) } });
  graph.addNode('analyzeGaps', analyzeGaps);
  graph.addNode('generateWeeklyPlan', generateWeeklyPlan);
  graph.addNode('saveAndNotify', saveAndNotify);
  graph.setEntryPoint('analyzeGaps');
  graph.addEdge('analyzeGaps', 'generateWeeklyPlan');
  graph.addEdge('generateWeeklyPlan', 'saveAndNotify');
  graph.addEdge('saveAndNotify', END);
  return graph.compile();
}

let compiled = null;

export async function runStudyPlan({ studentId, targetRole, userId }) {
  if (!compiled) compiled = buildGraph();
  const startTime = Date.now();
  const agentRun = await AgentRun.create({ agentName: 'study_plan', otariRouteTag: 'study.plan', triggeredBy: userId, input: { studentId, targetRole }, status: 'running', modelUsed: 'gemini-1.5-flash' });
  try {
    const result = await compiled.invoke({ studentId, targetRole, userId });
    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'success', nodesExecuted: result.nodesExecuted, output: { weeks: result.plan?.weeks?.length }, durationMs });
    return { plan: result.plan, readiness: result.readiness, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'failed', error: error.message, durationMs: Date.now() - startTime });
    throw error;
  }
}

export default { runStudyPlan };
