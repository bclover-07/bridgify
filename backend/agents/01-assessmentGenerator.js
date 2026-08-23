import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import Assessment from '../models/Assessment.js';
import Course from '../models/Course.js';
import { getSkill, getSkillsByDomain } from '../utils/skillTaxonomy.js';

/**
 * Agent 01: Assessment Generator
 * 
 * LangGraph StateGraph with nodes:
 * parseSyllabus → mapToSkillTaxonomy → planBloomsSpread → generateQuestions
 *   → classifyBlooms → tagSkills → validateQuality → (conditional retry, max 2)
 *   → formatOutput
 * 
 * Otari route: assessment.generate → Gemini Flash
 * Writes: Draft Assessment document
 * SEG: No (creates draft Assessment)
 */

const BLOOMS_LEVELS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
const QUESTION_TYPES = ['mcq', 'short_answer', 'long_answer', 'code', 'true_false'];

async function parseSyllabus(state) {
  const startTime = Date.now();
  const { courseId, topic } = state;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  let relevantTopics = course.syllabus?.topics?.filter(
    t => t.name.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(t.name.toLowerCase()) ||
      t.subtopics.some(st => st.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(st.toLowerCase()))
  ) || [];

  if (relevantTopics.length === 0 && course.syllabus?.topics) {
    relevantTopics = course.syllabus.topics;
  }

  const allTopicNames = relevantTopics.flatMap(t => [t.name, ...t.subtopics]);
  const allSkillIds = [...new Set(relevantTopics.flatMap(t => t.skillIds || []))];

  return {
    ...state,
    course: { title: course.title, code: course.code },
    parsedTopics: allTopicNames,
    syllabusSkillIds: allSkillIds,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'parseSyllabus', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function mapToSkillTaxonomy(state) {
  const startTime = Date.now();
  const { syllabusSkillIds, topic } = state;

  let mappedSkills = syllabusSkillIds
    .map(sid => getSkill(sid))
    .filter(Boolean);

  if (mappedSkills.length === 0) {
    const domainSkills = getSkillsByDomain('programming')
      .concat(getSkillsByDomain('web'))
      .concat(getSkillsByDomain('core-cs'));

    const topicLower = topic.toLowerCase();
    mappedSkills = domainSkills.filter(s =>
      s.label.toLowerCase().includes(topicLower) ||
      s.id.toLowerCase().includes(topicLower.replace(/\s+/g, '.'))
    ).slice(0, 8);

    if (mappedSkills.length === 0) {
      mappedSkills = domainSkills.slice(0, 4);
    }
  }

  return {
    ...state,
    mappedSkills,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'mapToSkillTaxonomy', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function planBloomsSpread(state) {
  const startTime = Date.now();
  const { questionCount = 10, difficulty = 'mixed' } = state;

  const bloomsPlan = [];
  const difficultyDistribution = {
    easy: { remember: 0.35, understand: 0.3, apply: 0.2, analyze: 0.1, evaluate: 0.05, create: 0 },
    medium: { remember: 0.15, understand: 0.2, apply: 0.25, analyze: 0.2, evaluate: 0.15, create: 0.05 },
    hard: { remember: 0.05, understand: 0.1, apply: 0.2, analyze: 0.25, evaluate: 0.2, create: 0.2 },
    mixed: { remember: 0.15, understand: 0.2, apply: 0.2, analyze: 0.2, evaluate: 0.15, create: 0.1 },
  };

  const dist = difficultyDistribution[difficulty] || difficultyDistribution.mixed;

  for (const [level, proportion] of Object.entries(dist)) {
    const count = Math.max(0, Math.round(questionCount * proportion));
    for (let i = 0; i < count; i++) {
      bloomsPlan.push(level);
    }
  }

  while (bloomsPlan.length < questionCount) {
    bloomsPlan.push('apply');
  }
  while (bloomsPlan.length > questionCount) {
    bloomsPlan.pop();
  }

  const typePlan = bloomsPlan.map(level => {
    if (level === 'remember' || level === 'understand') return Math.random() > 0.5 ? 'mcq' : 'true_false';
    if (level === 'apply') return Math.random() > 0.4 ? 'short_answer' : 'code';
    if (level === 'analyze') return Math.random() > 0.5 ? 'long_answer' : 'code';
    if (level === 'evaluate') return 'long_answer';
    return 'code';
  });

  return {
    ...state,
    bloomsPlan,
    typePlan,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'planBloomsSpread', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function generateQuestions(state) {
  const startTime = Date.now();
  const { topic, mappedSkills, bloomsPlan, typePlan, questionCount = 10, userId } = state;

  const skillsStr = mappedSkills.map(s => `${s.id}: ${s.label} (${s.category})`).join('\n');

  const prompt = `You are an expert academic assessment creator. Generate exactly ${questionCount} questions on the topic "${topic}".

Skills to assess:
${skillsStr}

For each question, follow this Bloom's level and question type plan:
${bloomsPlan.map((bl, i) => `Q${i + 1}: Bloom's="${bl}", Type="${typePlan[i]}"`).join('\n')}

Rules:
- MCQ questions MUST have exactly 4 options with one correct answer
- Code questions must be language-specific and testable
- Each question must clearly assess one of the listed skills
- Questions should progress from basic recall to higher-order thinking
- Include detailed rubrics for subjective questions

Return a JSON array of objects with this exact shape:
[{
  "questionText": "...",
  "type": "mcq|short_answer|long_answer|code|true_false",
  "bloomLevel": "remember|understand|apply|analyze|evaluate|create",
  "skillId": "exact.skill.id.from.the.list",
  "maxMarks": 10,
  "rubric": "Evaluation criteria...",
  "options": [{"text":"...","isCorrect":true/false}] // only for mcq
}]

Return ONLY the JSON array, no additional text.`;

  const result = await otariCallWithRetry({
    route: 'assessment.generate',
    prompt,
    userId,
    options: { temperature: 0.7, maxTokens: 4096 },
  });

  let questions = [];
  try {
    const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    questions = JSON.parse(jsonStr);
  } catch (parseErr) {
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        // Strip trailing commas before closing brackets
        const sanitized = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
        questions = JSON.parse(sanitized);
      } catch (err) {
        console.warn('Failed to parse LLM questions JSON:', err.message);
        questions = [];
      }
    }
  }

  return {
    ...state,
    rawQuestions: questions,
    agentRunId: result.agentRunId,
    tokensUsed: result.tokensUsed,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateQuestions', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function classifyBlooms(state) {
  const startTime = Date.now();
  const { rawQuestions, bloomsPlan } = state;

  const questions = rawQuestions.map((q, i) => ({
    ...q,
    bloomLevel: BLOOMS_LEVELS.includes(q.bloomLevel) ? q.bloomLevel : (bloomsPlan[i] || 'apply'),
  }));

  return {
    ...state,
    classifiedQuestions: questions,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'classifyBlooms', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function tagSkills(state) {
  const startTime = Date.now();
  const { classifiedQuestions, mappedSkills } = state;

  const validSkillIds = new Set(mappedSkills.map(s => s.id));

  const questions = classifiedQuestions.map((q, i) => {
    if (validSkillIds.has(q.skillId)) return q;
    const fallbackSkill = mappedSkills[i % mappedSkills.length];
    return { ...q, skillId: fallbackSkill.id };
  });

  return {
    ...state,
    taggedQuestions: questions,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'tagSkills', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function validateQuality(state) {
  const startTime = Date.now();
  const { taggedQuestions, questionCount = 10 } = state;

  const issues = [];

  if (taggedQuestions.length < questionCount * 0.7) {
    issues.push(`Only ${taggedQuestions.length}/${questionCount} questions generated`);
  }

  for (let i = 0; i < taggedQuestions.length; i++) {
    const q = taggedQuestions[i];
    if (!q.questionText || q.questionText.length < 10) {
      issues.push(`Q${i + 1}: Question text too short`);
    }
    if (q.type === 'mcq' && (!q.options || q.options.length < 4)) {
      issues.push(`Q${i + 1}: MCQ has fewer than 4 options`);
    }
    if (q.type === 'mcq' && q.options && !q.options.some(o => o.isCorrect)) {
      issues.push(`Q${i + 1}: MCQ has no correct answer`);
    }
    if (!q.maxMarks || q.maxMarks <= 0) {
      taggedQuestions[i].maxMarks = 10;
    }
  }

  return {
    ...state,
    validatedQuestions: taggedQuestions,
    validationIssues: issues,
    retryCount: (state.retryCount || 0),
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'validateQuality', durationMs: Date.now() - startTime, status: issues.length > 0 ? 'issues_found' : 'success' }],
  };
}

function shouldRetry(state) {
  const { validationIssues = [], retryCount = 0 } = state;
  if (retryCount >= 2) return 'formatOutput';
  if (validationIssues.length > 2) return 'generateQuestions';
  return 'formatOutput';
}

async function formatOutput(state) {
  const startTime = Date.now();
  const {
    validatedQuestions, topic, courseId, course,
    userId, institutionId, difficulty = 'mixed',
  } = state;

  const totalMarks = validatedQuestions.reduce((sum, q) => sum + (q.maxMarks || 10), 0);

  const assessment = await Assessment.create({
    facultyId: userId,
    institutionId,
    courseId,
    title: `Assessment: ${topic}`,
    topic,
    questions: validatedQuestions.map(q => ({
      questionText: q.questionText,
      type: q.type || 'short_answer',
      options: q.options || [],
      rubric: q.rubric || '',
      skillId: q.skillId,
      bloomLevel: q.bloomLevel,
      maxMarks: q.maxMarks || 10,
    })),
    difficulty,
    totalMarks,
    status: 'draft',
    duration: Math.max(30, validatedQuestions.length * 6),
  });

  return {
    ...state,
    assessment,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'formatOutput', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

/**
 * Build and compile the Assessment Generator LangGraph.
 */
function buildAssessmentGeneratorGraph() {
  const graph = new StateGraph({
    channels: {
      courseId: { value: (a, b) => b ?? a, default: () => null },
      topic: { value: (a, b) => b ?? a, default: () => '' },
      difficulty: { value: (a, b) => b ?? a, default: () => 'mixed' },
      questionCount: { value: (a, b) => b ?? a, default: () => 10 },
      userId: { value: (a, b) => b ?? a, default: () => null },
      institutionId: { value: (a, b) => b ?? a, default: () => null },
      course: { value: (a, b) => b ?? a, default: () => null },
      parsedTopics: { value: (a, b) => b ?? a, default: () => [] },
      syllabusSkillIds: { value: (a, b) => b ?? a, default: () => [] },
      mappedSkills: { value: (a, b) => b ?? a, default: () => [] },
      bloomsPlan: { value: (a, b) => b ?? a, default: () => [] },
      typePlan: { value: (a, b) => b ?? a, default: () => [] },
      rawQuestions: { value: (a, b) => b ?? a, default: () => [] },
      classifiedQuestions: { value: (a, b) => b ?? a, default: () => [] },
      taggedQuestions: { value: (a, b) => b ?? a, default: () => [] },
      validatedQuestions: { value: (a, b) => b ?? a, default: () => [] },
      validationIssues: { value: (a, b) => b ?? a, default: () => [] },
      retryCount: { value: (a, b) => b ?? a, default: () => 0 },
      assessment: { value: (a, b) => b ?? a, default: () => null },
      agentRunId: { value: (a, b) => b ?? a, default: () => null },
      tokensUsed: { value: (a, b) => b ?? a, default: () => {} },
      nodesExecuted: { value: (a, b) => b ?? a, default: () => [] },
    },
  });

  graph.addNode('parseSyllabus', parseSyllabus);
  graph.addNode('mapToSkillTaxonomy', mapToSkillTaxonomy);
  graph.addNode('planBloomsSpread', planBloomsSpread);
  graph.addNode('generateQuestions', generateQuestions);
  graph.addNode('classifyBlooms', classifyBlooms);
  graph.addNode('tagSkills', tagSkills);
  graph.addNode('validateQuality', validateQuality);
  graph.addNode('formatOutput', formatOutput);

  graph.setEntryPoint('parseSyllabus');
  graph.addEdge('parseSyllabus', 'mapToSkillTaxonomy');
  graph.addEdge('mapToSkillTaxonomy', 'planBloomsSpread');
  graph.addEdge('planBloomsSpread', 'generateQuestions');
  graph.addEdge('generateQuestions', 'classifyBlooms');
  graph.addEdge('classifyBlooms', 'tagSkills');
  graph.addEdge('tagSkills', 'validateQuality');
  graph.addConditionalEdges('validateQuality', shouldRetry, {
    generateQuestions: 'generateQuestions',
    formatOutput: 'formatOutput',
  });
  graph.addEdge('formatOutput', END);

  return graph.compile();
}

let compiledGraph = null;

/**
 * Run the Assessment Generator agent.
 */
export async function runAssessmentGenerator({ courseId, topic, difficulty, questionCount, userId, institutionId }) {
  if (!compiledGraph) {
    compiledGraph = buildAssessmentGeneratorGraph();
  }

  const startTime = Date.now();

  const result = await compiledGraph.invoke({
    courseId,
    topic,
    difficulty: difficulty || 'mixed',
    questionCount: questionCount || 10,
    userId,
    institutionId,
  });

  const durationMs = Date.now() - startTime;

  await AgentRun.findByIdAndUpdate(result.agentRunId, {
    nodesExecuted: result.nodesExecuted,
    durationMs,
  });

  return {
    assessment: result.assessment,
    nodesExecuted: result.nodesExecuted,
    durationMs,
    agentRunId: result.agentRunId,
  };
}

export default { runAssessmentGenerator };
