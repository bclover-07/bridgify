import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import Assessment from '../models/Assessment.js';
import Submission from '../models/Submission.js';
import { createAssessmentSEGEntries } from '../services/seg.service.js';
import { createNotification } from '../services/notification.service.js';
import { getSkill } from '../utils/skillTaxonomy.js';

/**
 * Agent 02: Grading Agent
 * 
 * LangGraph StateGraph with nodes:
 * loadContext → [gradeObjective, gradeSubjective] (parallel-like) → extractSkillScores
 *   → computeTotalScore → prepareSEGEntries → commitResults
 * 
 * Otari route: assessment.grade → Gemini Flash
 * Writes SEG: Yes — batch SEG evidence write with embeddings
 * Fires: seg:updated, notification:new
 */

async function loadContext(state) {
  const startTime = Date.now();
  const { submissionId } = state;

  const submission = await Submission.findById(submissionId).lean();
  if (!submission) throw new Error('Submission not found');

  const assessment = await Assessment.findById(submission.assessmentId).lean();
  if (!assessment) throw new Error('Assessment not found');

  const objectiveQuestions = [];
  const subjectiveQuestions = [];

  for (const question of assessment.questions) {
    const answer = submission.answers.find(a => String(a.questionId) === String(question._id));
    const pair = { question, answer: answer || null };

    if (question.type === 'mcq' || question.type === 'true_false') {
      objectiveQuestions.push(pair);
    } else {
      subjectiveQuestions.push(pair);
    }
  }

  return {
    ...state,
    submission,
    assessment,
    objectiveQuestions,
    subjectiveQuestions,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'loadContext', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function gradeObjective(state) {
  const startTime = Date.now();
  const { objectiveQuestions } = state;

  const gradedObjective = [];

  for (const { question, answer } of objectiveQuestions) {
    if (!answer || !answer.response) {
      gradedObjective.push({
        questionId: question._id,
        autoScore: 0,
        feedback: 'No answer provided.',
        skillId: question.skillId,
      });
      continue;
    }

    let score = 0;
    let feedback = '';

    if (question.type === 'mcq') {
      const correctOption = question.options.find(o => o.isCorrect);
      if (correctOption && answer.response === correctOption.text) {
        score = question.maxMarks;
        feedback = 'Correct answer.';
      } else {
        score = 0;
        feedback = `Incorrect. The correct answer is: "${correctOption?.text || 'N/A'}"`;
      }
    } else if (question.type === 'true_false') {
      const expected = question.options?.find(o => o.isCorrect)?.text || '';
      if (answer.response.toLowerCase() === expected.toLowerCase()) {
        score = question.maxMarks;
        feedback = 'Correct.';
      } else {
        score = 0;
        feedback = `Incorrect. Expected: ${expected}`;
      }
    }

    gradedObjective.push({
      questionId: question._id,
      autoScore: score,
      feedback,
      skillId: question.skillId,
      maxMarks: question.maxMarks,
    });
  }

  return {
    ...state,
    gradedObjective,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'gradeObjective', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function gradeSubjective(state) {
  const startTime = Date.now();
  const { subjectiveQuestions, assessment, userId } = state;

  if (subjectiveQuestions.length === 0) {
    return {
      ...state,
      gradedSubjective: [],
      nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'gradeSubjective', durationMs: Date.now() - startTime, status: 'success' }],
    };
  }

  const qaBlocks = subjectiveQuestions.map(({ question, answer }, i) => {
    const skillData = getSkill(question.skillId);
    return `
Question ${i + 1} (${question.type}, ${question.maxMarks} marks, Bloom's: ${question.bloomLevel}, Skill: ${skillData?.label || question.skillId}):
${question.questionText}

Rubric: ${question.rubric || 'Evaluate for accuracy, depth, and clarity.'}

Student Answer:
${answer?.response || '[NO ANSWER PROVIDED]'}`;
  }).join('\n---\n');

  const prompt = `You are an expert academic grader for the assessment "${assessment.title}" on topic "${assessment.topic}".

Grade each student answer below. For each question, provide:
1. A score (integer, 0 to maxMarks)
2. Specific, constructive feedback
3. A skill competency score (0-100) for the tagged skill

${qaBlocks}

Return a JSON array with this exact shape:
[{
  "questionIndex": 0,
  "score": <integer>,
  "feedback": "<specific feedback>",
  "skillCompetency": <0-100>
}]

Be fair but rigorous. Partial credit for partially correct answers. Penalize vague or off-topic responses.
Return ONLY the JSON array.`;

  let gradedSubjective = [];

  try {
    const result = await otariCallWithRetry({
      route: 'assessment.grade',
      prompt,
      userId,
      options: { temperature: 0.3, maxTokens: 4096 },
    });

    let parsed;
    try {
      const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    }

    if (Array.isArray(parsed)) {
      gradedSubjective = parsed.map(g => {
        const qi = g.questionIndex;
        const { question } = subjectiveQuestions[qi] || subjectiveQuestions[0];
        return {
          questionId: question._id,
          autoScore: Math.min(question.maxMarks, Math.max(0, g.score || 0)),
          feedback: g.feedback || '',
          skillId: question.skillId,
          skillCompetency: g.skillCompetency || 0,
          maxMarks: question.maxMarks,
        };
      });
    }

    state.agentRunId = result.agentRunId;
    state.tokensUsed = result.tokensUsed;
  } catch (error) {
    console.error('AI grading failed, using zero scores:', error.message);
    gradedSubjective = subjectiveQuestions.map(({ question }) => ({
      questionId: question._id,
      autoScore: 0,
      feedback: 'AI grading unavailable. Manual review required.',
      skillId: question.skillId,
      skillCompetency: 0,
      maxMarks: question.maxMarks,
    }));
  }

  return {
    ...state,
    gradedSubjective,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'gradeSubjective', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function extractSkillScores(state) {
  const startTime = Date.now();
  const { gradedObjective = [], gradedSubjective = [] } = state;

  const allGraded = [...gradedObjective, ...gradedSubjective];

  const skillScoreMap = {};
  for (const g of allGraded) {
    if (!g.skillId) continue;
    const normalizedScore = g.maxMarks > 0 ? Math.round((g.autoScore / g.maxMarks) * 100) : 0;

    if (!skillScoreMap[g.skillId]) {
      skillScoreMap[g.skillId] = { total: 0, count: 0 };
    }
    skillScoreMap[g.skillId].total += normalizedScore;
    skillScoreMap[g.skillId].count += 1;
  }

  return {
    ...state,
    skillScoreMap,
    allGraded,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'extractSkillScores', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function computeTotalScore(state) {
  const startTime = Date.now();
  const { allGraded, assessment } = state;

  const totalScore = allGraded.reduce((sum, g) => sum + (g.autoScore || 0), 0);
  const percentage = assessment.totalMarks > 0
    ? Math.round((totalScore / assessment.totalMarks) * 100)
    : 0;

  return {
    ...state,
    totalScore,
    percentage,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'computeTotalScore', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function prepareSEGEntries(state) {
  const startTime = Date.now();
  const {
    skillScoreMap, submission, assessment,
    institutionId, userId,
  } = state;

  const segEntries = await createAssessmentSEGEntries({
    studentId: submission.studentId,
    institutionId,
    courseId: assessment.courseId,
    assessmentId: assessment._id,
    assessmentTitle: assessment.title,
    submissionId: submission._id,
    skillScoreMap,
    verifierId: userId,
  });

  return {
    ...state,
    segEntries,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'prepareSEGEntries', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function commitResults(state) {
  const startTime = Date.now();
  const {
    submissionId, allGraded, totalScore, percentage,
    submission, assessment, segEntries,
  } = state;

  const updateData = {
    totalScore,
    percentage,
    gradingStatus: 'auto_graded',
  };

  const answersUpdate = {};
  for (const g of allGraded) {
    const idx = submission.answers.findIndex(a => String(a.questionId) === String(g.questionId));
    if (idx !== -1) {
      answersUpdate[`answers.${idx}.autoScore`] = g.autoScore;
      answersUpdate[`answers.${idx}.finalScore`] = g.autoScore;
      answersUpdate[`answers.${idx}.feedback`] = g.feedback;
    }
  }

  await Submission.findByIdAndUpdate(submissionId, {
    ...updateData,
    ...answersUpdate,
  });

  await createNotification({
    userId: submission.studentId,
    type: 'assessment_graded',
    title: 'Assessment Graded',
    body: `Your submission for "${assessment.title}" has been auto-graded. Score: ${percentage}%`,
    metadata: { submissionId, assessmentId: assessment._id, percentage },
    actionUrl: `/student/submissions/${submissionId}`,
  });

  return {
    ...state,
    committed: true,
    segEntriesCount: segEntries.length,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'commitResults', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

function buildGradingGraph() {
  const graph = new StateGraph({
    channels: {
      submissionId: { value: (a, b) => b ?? a, default: () => null },
      userId: { value: (a, b) => b ?? a, default: () => null },
      institutionId: { value: (a, b) => b ?? a, default: () => null },
      pushToSEG: { value: (a, b) => b ?? a, default: () => true },
      submission: { value: (a, b) => b ?? a, default: () => null },
      assessment: { value: (a, b) => b ?? a, default: () => null },
      objectiveQuestions: { value: (a, b) => b ?? a, default: () => [] },
      subjectiveQuestions: { value: (a, b) => b ?? a, default: () => [] },
      gradedObjective: { value: (a, b) => b ?? a, default: () => [] },
      gradedSubjective: { value: (a, b) => b ?? a, default: () => [] },
      allGraded: { value: (a, b) => b ?? a, default: () => [] },
      skillScoreMap: { value: (a, b) => b ?? a, default: () => {} },
      totalScore: { value: (a, b) => b ?? a, default: () => 0 },
      percentage: { value: (a, b) => b ?? a, default: () => 0 },
      segEntries: { value: (a, b) => b ?? a, default: () => [] },
      committed: { value: (a, b) => b ?? a, default: () => false },
      segEntriesCount: { value: (a, b) => b ?? a, default: () => 0 },
      agentRunId: { value: (a, b) => b ?? a, default: () => null },
      tokensUsed: { value: (a, b) => b ?? a, default: () => {} },
      nodesExecuted: { value: (a, b) => b ?? a, default: () => [] },
    },
  });

  graph.addNode('loadContext', loadContext);
  graph.addNode('gradeObjective', gradeObjective);
  graph.addNode('gradeSubjective', gradeSubjective);
  graph.addNode('extractSkillScores', extractSkillScores);
  graph.addNode('computeTotalScore', computeTotalScore);
  graph.addNode('prepareSEGEntries', prepareSEGEntries);
  graph.addNode('commitResults', commitResults);

  graph.setEntryPoint('loadContext');
  graph.addEdge('loadContext', 'gradeObjective');
  graph.addEdge('gradeObjective', 'gradeSubjective');
  graph.addEdge('gradeSubjective', 'extractSkillScores');
  graph.addEdge('extractSkillScores', 'computeTotalScore');
  graph.addEdge('computeTotalScore', 'prepareSEGEntries');
  graph.addEdge('prepareSEGEntries', 'commitResults');
  graph.addEdge('commitResults', END);

  return graph.compile();
}

let compiledGraph = null;

/**
 * Run the Grading Agent.
 */
export async function runGradingAgent({ submissionId, userId, institutionId, pushToSEG = true }) {
  if (!compiledGraph) {
    compiledGraph = buildGradingGraph();
  }

  const overallStart = Date.now();

  const agentRun = await AgentRun.create({
    agentName: 'grading',
    otariRouteTag: 'assessment.grade',
    triggeredBy: userId,
    input: { submissionId },
    status: 'running',
    modelUsed: 'gemini-1.5-flash',
  });

  try {
    const result = await compiledGraph.invoke({
      submissionId,
      userId,
      institutionId,
      pushToSEG,
    });

    const durationMs = Date.now() - overallStart;

    await AgentRun.findByIdAndUpdate(agentRun._id, {
      status: 'success',
      nodesExecuted: result.nodesExecuted,
      output: {
        totalScore: result.totalScore,
        percentage: result.percentage,
        segEntriesCount: result.segEntriesCount,
      },
      tokensUsed: result.tokensUsed || {},
      durationMs,
    });

    return {
      totalScore: result.totalScore,
      percentage: result.percentage,
      segEntriesCount: result.segEntriesCount,
      nodesExecuted: result.nodesExecuted,
      durationMs,
      agentRunId: agentRun._id,
    };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, {
      status: 'failed',
      error: error.message,
      durationMs: Date.now() - overallStart,
    });
    throw error;
  }
}

export default { runGradingAgent };
