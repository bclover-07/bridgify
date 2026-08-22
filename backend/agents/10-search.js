import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import User from '../models/User.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import { embedText } from '../utils/embeddings.js';
import { semanticCandidateSearch } from '../utils/vectorSearch.js';

async function parseSearchQuery(state) {
  const s = Date.now();
  const { query } = state;
  const structuredFilters = { skills: query.skills || [], minCGPA: query.minCGPA, branch: query.branch, year: query.year };
  return { ...state, structuredFilters, searchText: query.jobDescription || query.searchText || '', nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'parseSearchQuery', durationMs: Date.now() - s, status: 'success' }] };
}

async function executeStructuredSearch(state) {
  const s = Date.now();
  const { structuredFilters } = state;
  const filter = { role: 'student' };
  if (structuredFilters.branch) filter['student.branch'] = structuredFilters.branch;
  if (structuredFilters.year) filter['student.year'] = structuredFilters.year;
  if (structuredFilters.minCGPA) filter['student.cgpa'] = { $gte: structuredFilters.minCGPA };

  const students = await User.find(filter).select('name email student institutionId').limit(100).lean();
  return { ...state, structuredResults: students, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'executeStructuredSearch', durationMs: Date.now() - s, status: 'success' }] };
}

async function executeSemanticSearch(state) {
  const s = Date.now();
  const { searchText, query } = state;
  if (!searchText) {
    return { ...state, semanticResults: [], nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'executeSemanticSearch', durationMs: Date.now() - s, status: 'skipped' }] };
  }

  const embedding = await embedText(searchText);
  const results = await semanticCandidateSearch(embedding, {}, query.limit || 20);
  return { ...state, semanticResults: results, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'executeSemanticSearch', durationMs: Date.now() - s, status: 'success' }] };
}

async function mergeAndRank(state) {
  const s = Date.now();
  const { structuredResults, semanticResults } = state;
  const candidateMap = {};

  for (const student of structuredResults) {
    candidateMap[String(student._id)] = { ...student, matchScore: 50, matchType: 'structured' };
  }

  for (const sem of semanticResults) {
    const sid = String(sem.studentId);
    if (candidateMap[sid]) {
      candidateMap[sid].matchScore = Math.max(candidateMap[sid].matchScore, sem.matchScore);
      candidateMap[sid].matchType = 'both';
      candidateMap[sid].matchedSkills = sem.matchedSkills;
    } else {
      candidateMap[sid] = { _id: sem.studentId, matchScore: sem.matchScore, matchType: 'semantic', matchedSkills: sem.matchedSkills };
    }
  }

  const ranked = Object.values(candidateMap).sort((a, b) => b.matchScore - a.matchScore);
  return { ...state, rankedCandidates: ranked, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'mergeAndRank', durationMs: Date.now() - s, status: 'success' }] };
}

function buildGraph() {
  const ch = d => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({ channels: { query: ch({}), userId: ch(null), structuredFilters: ch({}), searchText: ch(''), structuredResults: ch([]), semanticResults: ch([]), rankedCandidates: ch([]), nodesExecuted: ch([]) } });
  graph.addNode('parseSearchQuery', parseSearchQuery);
  graph.addNode('executeStructuredSearch', executeStructuredSearch);
  graph.addNode('executeSemanticSearch', executeSemanticSearch);
  graph.addNode('mergeAndRank', mergeAndRank);
  graph.setEntryPoint('parseSearchQuery');
  graph.addEdge('parseSearchQuery', 'executeStructuredSearch');
  graph.addEdge('executeStructuredSearch', 'executeSemanticSearch');
  graph.addEdge('executeSemanticSearch', 'mergeAndRank');
  graph.addEdge('mergeAndRank', END);
  return graph.compile();
}

let compiled = null;

export async function runSearch({ query, userId }) {
  if (!compiled) compiled = buildGraph();
  const startTime = Date.now();
  const agentRun = await AgentRun.create({ agentName: 'search', otariRouteTag: 'search.match', triggeredBy: userId, input: { searchText: query.jobDescription }, status: 'running', modelUsed: 'gemini-1.5-flash' });
  try {
    const result = await compiled.invoke({ query, userId });
    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'success', nodesExecuted: result.nodesExecuted, output: { candidateCount: result.rankedCandidates.length }, durationMs });
    return { candidates: result.rankedCandidates, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'failed', error: error.message, durationMs: Date.now() - startTime });
    throw error;
  }
}

export default { runSearch };
