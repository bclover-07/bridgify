import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import FacultyResource from '../models/FacultyResource.js';
import Course from '../models/Course.js';

async function extractContent(state) {
  const s = Date.now();
  const { input, courseId } = state;
  const course = courseId ? await Course.findById(courseId).select('title').lean() : null;
  return { ...state, rawContent: input.content || input.url || '', sourceType: input.type || 'text', courseTitle: course?.title || '', nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'extractContent', durationMs: Date.now() - s, status: 'success' }] };
}

async function chunkContent(state) {
  const s = Date.now();
  const { rawContent } = state;
  const chunks = [];
  const words = rawContent.split(/\s+/);
  for (let i = 0; i < words.length; i += 500) {
    chunks.push(words.slice(i, i + 500).join(' '));
  }
  return { ...state, chunks: chunks.length > 0 ? chunks : [rawContent], nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'chunkContent', durationMs: Date.now() - s, status: 'success' }] };
}

async function generateNotes(state) {
  const s = Date.now();
  const { chunks, courseTitle, userId, input } = state;

  const contentPreview = chunks.slice(0, 3).join('\n\n').substring(0, 3000);
  const prompt = `Generate comprehensive study notes from this content${courseTitle ? ` for the course "${courseTitle}"` : ''}.
  Syllabus alignment: ${state.syllabusMapped ? 'Yes' : 'No'}

Content: ${contentPreview}

Create well-structured notes.
Format in Markdown. Be thorough and student-friendly.`;

  let notesText = '## Notes\n\nProcessing...';
  try {
    const result = await otariCallWithRetry({ route: 'notes.generate', prompt, userId, options: { temperature: 0.5, maxTokens: 4096 } });
    notesText = result.text;
  } catch { notesText = `## Study Notes\n\nBased on the provided content:\n\n${contentPreview.substring(0, 500)}`; }

  return { ...state, notesText, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateNotes', durationMs: Date.now() - s, status: 'success' }] };
}

async function mapToSyllabus(state) {
  const s = Date.now();
  // Placeholder logic for mapping content to course syllabus
  return { ...state, syllabusMapped: true, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'mapToSyllabus', durationMs: Date.now() - s, status: 'success' }] };
}

async function synthesize(state) {
  const s = Date.now();
  // Synthesize chunks if needed, currently we use notesText
  return { ...state, synthesizedNotes: state.notesText, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'synthesize', durationMs: Date.now() - s, status: 'success' }] };
}

async function extractKeyTerms(state) {
  const s = Date.now();
  // Extract key terms
  const terms = ["Term 1", "Term 2"];
  return { ...state, keyTerms: terms, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'extractKeyTerms', durationMs: Date.now() - s, status: 'success' }] };
}

async function generatePractice(state) {
  const s = Date.now();
  // Generate practice questions
  const practice = ["Question 1?", "Question 2?"];
  return { ...state, practiceQuestions: practice, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generatePractice', durationMs: Date.now() - s, status: 'success' }] };
}

async function formatAndStore(state) {
  const s = Date.now();
  const { notesText, synthesizedNotes, keyTerms, practiceQuestions, userId, courseId, input, institutionId } = state;

  const finalContent = `${synthesizedNotes}\n\n## Key Terms\n${keyTerms.join(', ')}\n\n## Practice Questions\n${practiceQuestions.join('\n')}`;

  const resource = await FacultyResource.create({
    facultyId: userId,
    institutionId,
    courseId,
    type: 'notes',
    title: input.title || 'Generated Notes',
    content: finalContent,
    sourceUrl: input.url || '',
    status: 'published',
  });

  return { ...state, resource, nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'formatAndStore', durationMs: Date.now() - s, status: 'success' }] };
}

function buildGraph() {
  const ch = d => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({
    channels: {
      input: ch({}), courseId: ch(null), userId: ch(null), institutionId: ch(null),
      rawContent: ch(''), sourceType: ch('text'), courseTitle: ch(''),
      chunks: ch([]), syllabusMapped: ch(false), notesText: ch(''), synthesizedNotes: ch(''), keyTerms: ch([]), practiceQuestions: ch([]), resource: ch(null), nodesExecuted: ch([]),
    },
  });

  graph.addNode('extractContent', extractContent);
  graph.addNode('chunkContent', chunkContent);
  graph.addNode('mapToSyllabus', mapToSyllabus);
  graph.addNode('generateNotes', generateNotes);
  graph.addNode('synthesize', synthesize);
  graph.addNode('extractKeyTerms', extractKeyTerms);
  graph.addNode('generatePractice', generatePractice);
  graph.addNode('formatAndStore', formatAndStore);

  graph.setEntryPoint('extractContent');
  graph.addEdge('extractContent', 'chunkContent');
  graph.addEdge('chunkContent', 'mapToSyllabus');
  graph.addEdge('mapToSyllabus', 'generateNotes');
  graph.addEdge('generateNotes', 'synthesize');
  
  // Parallel nodes
  graph.addEdge('synthesize', 'extractKeyTerms');
  graph.addEdge('synthesize', 'generatePractice');
  
  // Join parallel nodes back to formatAndStore
  // LangGraph executes them based on readiness, but state updates accumulate
  graph.addEdge('extractKeyTerms', 'formatAndStore');
  graph.addEdge('generatePractice', 'formatAndStore');
  
  graph.addEdge('formatAndStore', END);
  return graph.compile();
}

let compiled = null;

export async function runNotesExplainer({ input, courseId, userId, institutionId }) {
  if (!compiled) compiled = buildGraph();
  const startTime = Date.now();
  const agentRun = await AgentRun.create({ agentName: 'notes_explainer', otariRouteTag: 'notes.generate', triggeredBy: userId, input: { title: input.title }, status: 'running', modelUsed: 'gemini-1.5-flash' });

  try {
    const result = await compiled.invoke({ input, courseId, userId, institutionId });
    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'success', nodesExecuted: result.nodesExecuted, durationMs });
    return { resource: result.resource, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, { status: 'failed', error: error.message, durationMs: Date.now() - startTime });
    throw error;
  }
}

export default { runNotesExplainer };
