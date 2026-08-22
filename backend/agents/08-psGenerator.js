import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import ProblemStatement from '../models/ProblemStatement.js';
import { embedText } from '../utils/embeddings.js';

async function parseIdea(state) {
  const s = Date.now();
  const { input } = state;
  return { ...state, idea: input.idea || '', domain: input.domain || 'general', difficulty: input.difficulty || 'medium', nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'parseIdea', durationMs: Date.now() - s, status: 'success' }] };
}

async function searchSimilarPS(state) {
  const s = Date.now();
  const { idea } = state;
  let similarPS = [];
  try {
    const embedding = await embedText(idea);
    similarPS = await ProblemStatement.aggregate([
      { $vectorSearch: {
          index: 'ps_vector_index', path: 'embedding', queryVector: embedding,
          numCandidates: 20, limit: 3
      }},
      { $project: { title: 1, description: 1 } }
    ]);
  } catch(e) { console.error('Vector search failed', e); }
  return { ...state, similarPS, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'searchSimilarPS', durationMs: Date.now() - s, status: 'success' }] };
}

async function inferSkills(state) {
  const s = Date.now();
  const { idea, domain, userId } = state;
  const prompt = `Based on the idea "${idea}" for a project in ${domain}, infer the top 5 technical skills required. Return a JSON array of skill names: ["skill1", "skill2"].`;
  
  let requiredSkills = [];
  try {
    const result = await otariCallWithRetry({ route: 'ps.generate', prompt, userId, options: { temperature: 0.4, maxTokens: 512 } });
    const parsed = JSON.parse(result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    if (Array.isArray(parsed)) requiredSkills = parsed;
  } catch { /* use fallback */ }

  return { ...state, inferredSkills: requiredSkills, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'inferSkills', durationMs: Date.now() - s, status: 'success' }] };
}

async function draftPS(state) {
  const s = Date.now();
  const { idea, domain, difficulty, inferredSkills, similarPS, userId } = state;

  const prompt = `Create a detailed Problem Statement for student projects.
Idea: "${idea}"
Domain: ${domain}
Difficulty: ${difficulty}
Inferred Skills: ${inferredSkills.join(', ')}
${similarPS.length > 0 ? `Avoid duplicating these existing projects: ${similarPS.map(p => p.title).join(', ')}` : ''}

Generate a complete problem statement with:
1. Title (clear, actionable)
2. Problem Description (2-3 paragraphs)
3. Objectives (4-5 bullet points)
4. Expected Deliverables

Return JSON: {"title": "...", "description": "...", "objectives": ["..."], "deliverables": ["..."]}
Return ONLY the JSON.`;

  let psData = { title: idea, description: `Problem statement for: ${idea}`, objectives: [], deliverables: [] };
  try {
    const result = await otariCallWithRetry({ route: 'ps.generate', prompt, userId, options: { temperature: 0.7, maxTokens: 2048 } });
    const parsed = JSON.parse(result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    psData = { ...psData, ...parsed };
  } catch { /* use fallback */ }

  return { ...state, psData, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'draftPS', durationMs: Date.now() - s, status: 'success' }] };
}

async function generateRubric(state) {
  const s = Date.now();
  const { psData, userId } = state;
  const prompt = `Generate an evaluation rubric for a project titled "${psData.title}".
Return a JSON array of 5 criteria: [{"criterion": "...", "weight": 0.2, "description": "..."}]`;
  let rubric = [];
  try {
    const result = await otariCallWithRetry({ route: 'ps.generate', prompt, userId, options: { temperature: 0.4, maxTokens: 1024 } });
    rubric = JSON.parse(result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch { /* use fallback */ }
  
  return { ...state, generatedRubric: rubric, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateRubric', durationMs: Date.now() - s, status: 'success' }] };
}

async function estimateDifficulty(state) {
  const s = Date.now();
  const { difficulty } = state;
  let estimatedWeeks = difficulty === 'hard' ? 8 : difficulty === 'medium' ? 4 : 2;
  return { ...state, estimatedWeeks, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'estimateDifficulty', durationMs: Date.now() - s, status: 'success' }] };
}

async function formatAndSave(state) {
  const s = Date.now();
  const { psData, inferredSkills, generatedRubric, estimatedWeeks, userId, institutionId } = state;

  const embedding = await embedText(`${psData.title} ${psData.description}`);

  const ps = await ProblemStatement.create({
    recruiterId: userId,
    rawIdea: state.idea || 'Project Idea',
    targetInstitutionId: institutionId || null,
    refined: {
      title: psData.title || state.idea,
      background: psData.description || `Problem statement for ${state.idea}`,
      objective: Array.isArray(psData.objectives) ? psData.objectives.join('\n') : (psData.objectives || ''),
      deliverables: psData.deliverables || [],
      skillsRequired: inferredSkills,
      evaluationRubric: generatedRubric,
      estimatedHours: (estimatedWeeks || 4) * 10,
      difficulty: ['beginner', 'intermediate', 'advanced', 'expert'].includes(state.difficulty) ? state.difficulty : 'intermediate',
    },
    status: 'draft',
    embedding,
  });

  return { ...state, problemStatement: ps, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'formatAndSave', durationMs: Date.now() - s, status: 'success' }] };
}

function buildGraph() {
  const ch = d => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({ channels: { input: ch({}), userId: ch(null), institutionId: ch(null), idea: ch(''), domain: ch('general'), difficulty: ch('medium'), psData: ch(null), inferredSkills: ch([]), similarPS: ch([]), generatedRubric: ch([]), estimatedWeeks: ch(4), problemStatement: ch(null), nodesExecuted: ch([]) } });
  graph.addNode('parseIdea', parseIdea);
  graph.addNode('searchSimilarPS', searchSimilarPS);
  graph.addNode('inferSkills', inferSkills);
  graph.addNode('draftPS', draftPS);
  graph.addNode('generateRubric', generateRubric);
  graph.addNode('estimateDifficulty', estimateDifficulty);
  graph.addNode('formatAndSave', formatAndSave);
  
  graph.setEntryPoint('parseIdea');
  graph.addEdge('parseIdea', 'searchSimilarPS');
  graph.addEdge('searchSimilarPS', 'inferSkills');
  graph.addEdge('inferSkills', 'draftPS');
  graph.addEdge('draftPS', 'generateRubric');
  graph.addEdge('generateRubric', 'estimateDifficulty');
  graph.addEdge('estimateDifficulty', 'formatAndSave');
  graph.addEdge('formatAndSave', END);
  return graph.compile();
}

let compiled = null;

export async function runPSGenerator({ input, userId, institutionId }) {
  if (!compiled) compiled = buildGraph();
  const startTime = Date.now();
  const agentRun = await AgentRun.create({ agentName: 'ps_generator', otariRouteTag: 'ps.generate', triggeredBy: userId, input: { idea: input.idea }, status: 'running', modelUsed: 'gemini-1.5-flash' });
  try {
    const result = await compiled.invoke({ input, userId, institutionId });
    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'success', nodesExecuted: result.nodesExecuted, output: { title: result.problemStatement?.title }, durationMs });
    return { problemStatement: result.problemStatement, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'failed', error: error.message, durationMs: Date.now() - startTime });
    throw error;
  }
}

export default { runPSGenerator };
