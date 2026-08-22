import { StateGraph, END } from '@langchain/langgraph';
import AgentRun from '../models/AgentRun.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';

const DECAY_FACTOR = 0.03;
const ANOMALY_THRESHOLD = 30;

async function scanForAnomalies(state) {
  const s = Date.now();
  const { institutionId } = state;

  const entries = await SkillEvidenceGraph.find(
    institutionId ? { institutionId } : {}
  ).select('studentId skillId confidenceScore evidenceType evidenceWeight lastReinforced verificationMethod').lean();

  const anomalies = [];
  const studentSkillMap = {};

  for (const entry of entries) {
    const key = `${entry.studentId}:${entry.skillId}`;
    if (!studentSkillMap[key]) studentSkillMap[key] = [];
    studentSkillMap[key].push(entry);
  }

  for (const [key, entries_arr] of Object.entries(studentSkillMap)) {
    if (entries_arr.length < 2) continue;
    const scores = entries_arr.map(e => e.confidenceScore);
    const maxDiff = Math.max(...scores) - Math.min(...scores);
    if (maxDiff > ANOMALY_THRESHOLD) {
      anomalies.push({ key, maxDiff, entryCount: entries_arr.length, scores });
    }
  }

  return { ...state, entries, anomalies, studentSkillMap, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'scanForAnomalies', durationMs: Date.now() - s, status: 'success' }] };
}

async function applyDecay(state) {
  const s = Date.now();
  const { entries } = state;

  const now = new Date();
  let decayedCount = 0;

  for (const entry of entries) {
    if (!entry.lastReinforced) continue;
    const daysSince = (now - new Date(entry.lastReinforced)) / (1000 * 60 * 60 * 24);
    if (daysSince < 30) continue;

    const decayPeriods = Math.floor(daysSince / 30);
    const decayMultiplier = Math.pow(1 - DECAY_FACTOR, decayPeriods);
    const newScore = Math.max(0, Math.round(entry.confidenceScore * decayMultiplier));

    if (newScore !== entry.confidenceScore) {
      await SkillEvidenceGraph.findByIdAndUpdate(entry._id, { confidenceScore: newScore });
      decayedCount++;
    }
  }

  return { ...state, decayedCount, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'applyDecay', durationMs: Date.now() - s, status: 'success' }] };
}

async function generateReport(state) {
  const s = Date.now();
  const { anomalies, decayedCount, entries } = state;

  return {
    ...state,
    report: {
      totalEntries: entries.length,
      anomaliesFound: anomalies.length,
      entriesDecayed: decayedCount,
      anomalyDetails: anomalies.slice(0, 20),
      runAt: new Date().toISOString(),
    },
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateReport', durationMs: Date.now() - s, status: 'success' }],
  };
}

function buildGraph() {
  const ch = d => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({ channels: { institutionId: ch(null), entries: ch([]), anomalies: ch([]), studentSkillMap: ch({}), decayedCount: ch(0), report: ch(null), nodesExecuted: ch([]) } });
  graph.addNode('scanForAnomalies', scanForAnomalies);
  graph.addNode('applyDecay', applyDecay);
  graph.addNode('generateReport', generateReport);
  graph.setEntryPoint('scanForAnomalies');
  graph.addEdge('scanForAnomalies', 'applyDecay');
  graph.addEdge('applyDecay', 'generateReport');
  graph.addEdge('generateReport', END);
  return graph.compile();
}

let compiled = null;

export async function runSEGConsistency({ institutionId }) {
  if (!compiled) compiled = buildGraph();
  const startTime = Date.now();
  const agentRun = await AgentRun.create({ agentName: 'seg_consistency', otariRouteTag: 'seg.audit', input: {}, status: 'running', modelUsed: 'system' });
  try {
    const result = await compiled.invoke({ institutionId });
    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'success', nodesExecuted: result.nodesExecuted, output: { anomalies: result.report.anomaliesFound, decayed: result.report.entriesDecayed }, durationMs });
    return { report: result.report, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'failed', error: error.message, durationMs: Date.now() - startTime });
    throw error;
  }
}

export async function runSegConsistency(params) {
  return runSEGConsistency(params);
}

export default { runSEGConsistency, runSegConsistency };
