import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import User from '../models/User.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import DriveEvent from '../models/DriveEvent.js';
import { computeReadiness } from '../services/readiness.service.js';

async function aggregateReadinessData(state) {
  const s = Date.now();
  const { institutionId } = state;

  const students = await User.find({ institutionId, role: 'student' }).select('name email student').lean();
  const drives = await DriveEvent.find({ institutionId, status: { $in: ['upcoming', 'active'] } }).lean();

  const readinessData = [];
  for (const student of students.slice(0, 50)) {
    try {
      const readiness = await computeReadiness(student._id, 'sde_1');
      readinessData.push({ student, readiness: readiness.overallReadiness, breakdown: readiness.skillBreakdown.slice(0, 5) });
    } catch {
      readinessData.push({ student, readiness: 0, breakdown: [] });
    }
  }

  return { ...state, readinessData, drives, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'aggregateReadinessData', durationMs: Date.now() - s, status: 'success' }] };
}

async function computeMatchMatrix(state) {
  const s = Date.now();
  const { readinessData, drives } = state;

  const matrix = drives.map(drive => {
    const eligibleStudents = readinessData.filter(r => r.readiness >= 40).sort((a, b) => b.readiness - a.readiness);
    return {
      driveId: drive._id,
      company: drive.company,
      date: drive.date,
      eligibleCount: eligibleStudents.length,
      topCandidates: eligibleStudents.slice(0, 10).map(s => ({
        studentId: s.student._id,
        name: s.student.name,
        readiness: s.readiness,
        branch: s.student.student?.branch,
      })),
    };
  });

  return { ...state, matchMatrix: matrix, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'computeMatchMatrix', durationMs: Date.now() - s, status: 'success' }] };
}

async function formatDashboardData(state) {
  const s = Date.now();
  const { readinessData, matchMatrix, drives } = state;

  const readinessDistribution = { high: 0, medium: 0, low: 0 };
  readinessData.forEach(r => {
    if (r.readiness >= 70) readinessDistribution.high++;
    else if (r.readiness >= 40) readinessDistribution.medium++;
    else readinessDistribution.low++;
  });

  return {
    ...state,
    dashboard: {
      totalStudents: readinessData.length,
      avgReadiness: Math.round(readinessData.reduce((s, r) => s + r.readiness, 0) / Math.max(readinessData.length, 1)),
      readinessDistribution,
      upcomingDrives: drives.length,
      matchMatrix,
      interventions: state.interventions || [],
      drivePrepRecommendations: state.drivePrepRecommendations || []
    },
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'formatDashboardData', durationMs: Date.now() - s, status: 'success' }],
  };
}

async function recommendDrivePrep(state) {
  const s = Date.now();
  const { matchMatrix, userId } = state;
  // Recommend preparation modules based on weak areas of eligible candidates
  const prompt = `Based on this placement match matrix: ${JSON.stringify(matchMatrix.map(m => m.company))}, recommend 3 specific drive preparation modules or workshops to conduct. Return JSON array: [{"title": "...", "focusArea": "...", "targetAudience": "..."}]`;
  let recommendations = [];
  try {
    const result = await otariCallWithRetry({ route: 'placement.strategy', prompt, userId, options: { temperature: 0.5, maxTokens: 1024 } });
    recommendations = JSON.parse(result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch { /* fallback */ }

  return { ...state, drivePrepRecommendations: recommendations, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'recommendDrivePrep', durationMs: Date.now() - s, status: 'success' }] };
}

async function identifyInterventions(state) {
  const s = Date.now();
  const { readinessData, userId } = state;
  // Identify at-risk students who need interventions
  const atRiskCount = readinessData.filter(r => r.readiness < 40).length;
  const prompt = `We have ${atRiskCount} out of ${readinessData.length} students at high risk of unplacement. Suggest 3 targeted interventions. Return JSON array: [{"type": "...", "description": "...", "expectedImpact": "..."}]`;
  
  let interventions = [];
  try {
    const result = await otariCallWithRetry({ route: 'placement.strategy', prompt, userId, options: { temperature: 0.5, maxTokens: 1024 } });
    interventions = JSON.parse(result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch { /* fallback */ }

  return { ...state, interventions, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'identifyInterventions', durationMs: Date.now() - s, status: 'success' }] };
}

function buildGraph() {
  const ch = d => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({ channels: { institutionId: ch(null), userId: ch(null), readinessData: ch([]), drives: ch([]), matchMatrix: ch([]), drivePrepRecommendations: ch([]), interventions: ch([]), dashboard: ch(null), nodesExecuted: ch([]) } });
  graph.addNode('aggregateReadinessData', aggregateReadinessData);
  graph.addNode('computeMatchMatrix', computeMatchMatrix);
  graph.addNode('recommendDrivePrep', recommendDrivePrep);
  graph.addNode('identifyInterventions', identifyInterventions);
  graph.addNode('formatDashboardData', formatDashboardData);
  
  graph.setEntryPoint('aggregateReadinessData');
  graph.addEdge('aggregateReadinessData', 'computeMatchMatrix');
  graph.addEdge('computeMatchMatrix', 'recommendDrivePrep');
  graph.addEdge('recommendDrivePrep', 'identifyInterventions');
  graph.addEdge('identifyInterventions', 'formatDashboardData');
  graph.addEdge('formatDashboardData', END);
  return graph.compile();
}

let compiled = null;

export async function runPlacementStrategy({ institutionId, userId }) {
  if (!compiled) compiled = buildGraph();
  const startTime = Date.now();
  const agentRun = await AgentRun.create({ agentName: 'placement_strategy', otariRouteTag: 'placement.strategy', triggeredBy: userId, input: {}, status: 'running', modelUsed: 'gemini-1.5-pro' });
  try {
    const result = await compiled.invoke({ institutionId, userId });
    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'success', nodesExecuted: result.nodesExecuted, output: { avgReadiness: result.dashboard?.avgReadiness }, durationMs });
    return { dashboard: result.dashboard, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'failed', error: error.message, durationMs: Date.now() - startTime });
    throw error;
  }
}

export default { runPlacementStrategy };
