import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import Course from '../models/Course.js';
import TechnologyDemand from '../models/TechnologyDemand.js';

async function parseSyllabus(state) {
  const s = Date.now();
  const { courseId } = state;
  const course = await Course.findById(courseId);
  if (!course) throw new Error('Course not found');
  const topics = course.syllabus?.topics?.map(t => ({ name: t.name, subtopics: t.subtopics, skillIds: t.skillIds })) || [];
  return { ...state, course: { title: course.title, code: course.code }, syllabusTopics: topics, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'parseSyllabus', durationMs: Date.now() - s, status: 'success' }] };
}

async function fetchJobDemand(state) {
  const s = Date.now();
  const demands = await TechnologyDemand.find({ isActive: true }).sort({ demandScore: -1 }).limit(50).lean();
  const demandMap = {};
  for (const d of demands) { demandMap[d.skillId] = d.demandScore; }
  return { ...state, demandMap, demands, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'fetchJobDemand', durationMs: Date.now() - s, status: 'success' }] };
}

async function classifyGaps(state) {
  const s = Date.now();
  const { syllabusTopics, demandMap, course, userId } = state;

  const syllabusSkills = [...new Set(syllabusTopics.flatMap(t => t.skillIds || []))];
  const highDemandSkills = Object.entries(demandMap).filter(([, score]) => score >= 70).map(([id]) => id);
  const coveredHighDemand = syllabusSkills.filter(sk => highDemandSkills.includes(sk));
  const missingHighDemand = highDemandSkills.filter(sk => !syllabusSkills.includes(sk));

  const prompt = `Analyze curriculum gaps for course "${course.title}":
Skills taught: ${syllabusSkills.join(', ')}
High-demand skills NOT taught: ${missingHighDemand.join(', ')}

Classify each gap as: critical (must add immediately), moderate (should add next semester), minor (nice to have).
Return JSON: [{"skillId": "...", "gapSeverity": "critical|moderate|minor", "recommendation": "..."}]
Return ONLY the JSON array.`;

  let gaps = missingHighDemand.map(sk => ({ skillId: sk, gapSeverity: 'moderate', recommendation: `Consider adding ${sk} to curriculum` }));
  try {
    const result = await otariCallWithRetry({ route: 'gap.analyze', prompt, userId, options: { temperature: 0.3, maxTokens: 2048 } });
    const parsed = JSON.parse(result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    if (Array.isArray(parsed)) gaps = parsed;
  } catch { /* use fallback */ }

  const alignmentScore = syllabusSkills.length > 0 ? Math.round((coveredHighDemand.length / Math.max(highDemandSkills.length, 1)) * 100) : 0;

  return {
    ...state,
    gaps, alignmentScore,
    report: { courseName: course.title, totalSyllabusSkills: syllabusSkills.length, coveredHighDemand: coveredHighDemand.length, missingHighDemand: missingHighDemand.length, alignmentScore, gaps },
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'classifyGaps', durationMs: Date.now() - s, status: 'success' }],
  };
}

function buildGraph() {
  const ch = d => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({ channels: { courseId: ch(null), userId: ch(null), course: ch(null), syllabusTopics: ch([]), demandMap: ch({}), demands: ch([]), gaps: ch([]), alignmentScore: ch(0), report: ch(null), nodesExecuted: ch([]) } });
  graph.addNode('parseSyllabus', parseSyllabus);
  graph.addNode('fetchJobDemand', fetchJobDemand);
  graph.addNode('classifyGaps', classifyGaps);
  graph.setEntryPoint('parseSyllabus');
  graph.addEdge('parseSyllabus', 'fetchJobDemand');
  graph.addEdge('fetchJobDemand', 'classifyGaps');
  graph.addEdge('classifyGaps', END);
  return graph.compile();
}

let compiled = null;

export async function runCurriculumGap({ courseId, userId }) {
  if (!compiled) compiled = buildGraph();
  const startTime = Date.now();
  const agentRun = await AgentRun.create({ agentName: 'curriculum_gap', otariRouteTag: 'gap.analyze', triggeredBy: userId, input: { courseId }, status: 'running', modelUsed: 'gemini-1.5-flash' });
  try {
    const result = await compiled.invoke({ courseId, userId });
    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'success', nodesExecuted: result.nodesExecuted, output: { alignmentScore: result.alignmentScore }, durationMs });
    return { report: result.report, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'failed', error: error.message, durationMs: Date.now() - startTime });
    throw error;
  }
}

export default { runCurriculumGap };
