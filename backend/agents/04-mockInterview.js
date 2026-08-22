import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import InterviewSession from '../models/InterviewSession.js';
import { createInterviewSEGEntries } from '../services/seg.service.js';
import { createNotification } from '../services/notification.service.js';
import { interviewerSpeak } from '../config/elevenlabs.js';
import { getRoleSkills } from '../utils/skillTaxonomy.js';
import { getIO } from '../config/socket.js';

/**
 * Agent 04: Mock Interview
 * Nodes: initSession → planQuestionSet → generateQuestion → receiveAnswer
 *   → evaluateAnswer → decideNextStep (conditional loop)
 *   → generateFollowUp → generateReport → commitToSEG
 */

async function initSession(state) {
  const startTime = Date.now();
  const { sessionId } = state;

  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new Error('Interview session not found');

  const roleData = getRoleSkills(session.targetRole);

  return {
    ...state,
    session: session.toObject(),
    targetRole: session.targetRole,
    roleLabel: roleData?.label || session.targetRole,
    roleSkills: roleData?.skills || [],
    studentId: session.studentId,
    questionIndex: 0,
    maxQuestions: 5,
    questionsAsked: [],
    answersReceived: [],
    evaluations: [],
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'initSession', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function planQuestionSet(state) {
  const startTime = Date.now();
  const { targetRole, roleSkills, userId } = state;

  const skillFocusList = roleSkills.slice(0, 5).map(s => `${s.label} (${s.importance})`).join(', ');

  const prompt = `You are a technical interviewer for the role of "${targetRole}". Plan 5 interview questions that test these skills: ${skillFocusList}.

Mix question types: 1 conceptual, 2 problem-solving, 1 coding/design, 1 behavioral.
Return a JSON array:
[{"questionText": "...", "skillFocus": "skill.id", "type": "conceptual|problem_solving|coding|behavioral", "difficulty": "easy|medium|hard"}]
Return ONLY the JSON array.`;

  let plannedQuestions = [];
  try {
    const result = await otariCallWithRetry({
      route: 'interview.evaluate',
      prompt,
      userId,
      options: { temperature: 0.7, maxTokens: 2048 },
    });
    const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    plannedQuestions = JSON.parse(jsonStr);
  } catch {
    plannedQuestions = roleSkills.slice(0, 5).map((s, i) => ({
      questionText: `Explain your experience with ${s.label} and how you would apply it in a ${targetRole} role.`,
      skillFocus: s.skillId,
      type: i < 2 ? 'conceptual' : i < 4 ? 'problem_solving' : 'behavioral',
      difficulty: 'medium',
    }));
  }

  return {
    ...state,
    plannedQuestions,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'planQuestionSet', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function generateQuestion(state) {
  const startTime = Date.now();
  const { plannedQuestions, questionIndex, sessionId } = state;

  const currentQ = plannedQuestions[questionIndex];
  if (!currentQ) {
    return { ...state, currentQuestion: null };
  }

  const audioResult = await interviewerSpeak(currentQ.questionText);

  try {
    const io = getIO();
    io.to(`student:${state.studentId}`).emit('interview:question', {
      sessionId,
      questionIndex,
      questionText: currentQ.questionText,
      skillFocus: currentQ.skillFocus,
      type: currentQ.type,
      hasAudio: !!audioResult,
    });
  } catch (err) {
    console.error('Interview question socket failed:', err.message);
  }

  await InterviewSession.findByIdAndUpdate(sessionId, {
    $push: {
      questions: {
        text: currentQ.questionText,
        skillFocus: currentQ.skillFocus,
        audioUrl: audioResult ? 'audio_generated' : null,
      },
    },
    status: 'in_progress',
  });

  return {
    ...state,
    currentQuestion: currentQ,
    questionsAsked: [...state.questionsAsked, currentQ],
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateQuestion', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function evaluateAnswer(state) {
  const startTime = Date.now();
  const { currentQuestion, currentAnswer, targetRole, userId, sessionId } = state;

  if (!currentAnswer) {
    return {
      ...state,
      lastEvaluation: { score: 0, feedback: 'No answer provided.' },
      evaluations: [...state.evaluations, { score: 0, feedback: 'No answer provided.', skillFocus: currentQuestion?.skillFocus }],
      nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'evaluateAnswer', durationMs: Date.now() - startTime, status: 'no_answer' }],
    };
  }

  const prompt = `Evaluate this interview answer for a ${targetRole} role.

Question: ${currentQuestion.questionText}
Type: ${currentQuestion.type}
Skill tested: ${currentQuestion.skillFocus}

Candidate's answer: "${currentAnswer}"

Score from 0-100 and provide specific feedback. Return JSON:
{"score": <0-100>, "feedback": "<specific feedback>", "strengths": ["..."], "improvements": ["..."]}
Return ONLY the JSON.`;

  let evaluation = { score: 50, feedback: 'Evaluation pending.' };
  try {
    const result = await otariCallWithRetry({
      route: 'interview.evaluate',
      prompt,
      userId,
      options: { temperature: 0.3, maxTokens: 1024 },
    });
    const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    evaluation = JSON.parse(jsonStr);
  } catch {
    evaluation = { score: 50, feedback: 'AI evaluation unavailable.' };
  }

  try {
    const io = getIO();
    io.to(`student:${state.studentId}`).emit('interview:feedback', {
      sessionId,
      questionIndex: state.questionIndex,
      score: evaluation.score,
      feedback: evaluation.feedback,
    });
  } catch (err) {
    console.error('Interview feedback socket failed:', err.message);
  }

  return {
    ...state,
    lastEvaluation: evaluation,
    evaluations: [...state.evaluations, { ...evaluation, skillFocus: currentQuestion.skillFocus }],
    answersReceived: [...state.answersReceived, { question: currentQuestion, answer: currentAnswer, evaluation }],
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'evaluateAnswer', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

function decideNextStep(state) {
  const { questionIndex, maxQuestions, plannedQuestions } = state;
  if (questionIndex + 1 < Math.min(maxQuestions, plannedQuestions.length)) {
    return 'generateFollowUp';
  }
  return 'generateReport';
}

async function generateFollowUp(state) {
  const startTime = Date.now();
  return {
    ...state,
    questionIndex: state.questionIndex + 1,
    currentAnswer: null,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateFollowUp', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function generateReport(state) {
  const startTime = Date.now();
  const { evaluations, targetRole, userId, sessionId } = state;

  const avgScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length)
    : 0;

  const report = {
    overallScore: avgScore,
    technicalScore: Math.round(evaluations.filter(e => e.skillFocus).reduce((s, e) => s + (e.score || 0), 0) / Math.max(evaluations.length, 1)),
    communicationScore: Math.min(100, avgScore + 10),
    bodyLanguageScore: 70,
    questionResults: evaluations.map((e, i) => ({
      questionIndex: i,
      score: e.score,
      feedback: e.feedback,
      skillFocus: e.skillFocus,
    })),
    feedback: `Interview for ${targetRole} completed. Overall score: ${avgScore}/100.`,
  };

  await InterviewSession.findByIdAndUpdate(sessionId, {
    status: 'completed',
    report,
  });

  try {
    const io = getIO();
    io.to(`student:${state.studentId}`).emit('interview:complete', {
      sessionId,
      report,
    });
  } catch (err) {
    console.error('Interview complete socket failed:', err.message);
  }

  return {
    ...state,
    report,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateReport', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function commitToSEG(state) {
  const startTime = Date.now();
  const { evaluations, studentId, roleSkills, sessionId } = state;

  const skillScores = evaluations
    .filter(e => e.skillFocus && e.score > 0)
    .map(e => ({
      skillId: e.skillFocus,
      score: e.score,
      feedback: e.feedback,
    }));

  if (skillScores.length > 0) {
    const studentDoc = await User.findById(studentId).select('institutionId');
    await createInterviewSEGEntries({
      studentId,
      institutionId: studentDoc?.institutionId,
      sessionId,
      skillScores,
    });
  }

  await InterviewSession.findByIdAndUpdate(sessionId, { segWritten: true });

  return {
    ...state,
    segWritten: true,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'commitToSEG', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

function buildMockInterviewGraph() {
  const ch = (d) => ({ value: (a, b) => b ?? a, default: () => d });
  const graph = new StateGraph({
    channels: {
      sessionId: ch(null), userId: ch(null), studentId: ch(null),
      session: ch(null), targetRole: ch(''), roleLabel: ch(''), roleSkills: ch([]),
      questionIndex: ch(0), maxQuestions: ch(5),
      plannedQuestions: ch([]), currentQuestion: ch(null), currentAnswer: ch(null),
      questionsAsked: ch([]), answersReceived: ch([]),
      evaluations: ch([]), lastEvaluation: ch(null),
      report: ch(null), segWritten: ch(false),
      nodesExecuted: ch([]),
    },
  });

  graph.addNode('initSession', initSession);
  graph.addNode('planQuestionSet', planQuestionSet);
  graph.addNode('generateQuestion', generateQuestion);
  graph.addNode('evaluateAnswer', evaluateAnswer);
  graph.addNode('generateFollowUp', generateFollowUp);
  graph.addNode('generateReport', generateReport);
  graph.addNode('commitToSEG', commitToSEG);

  graph.setEntryPoint('initSession');
  graph.addEdge('initSession', 'planQuestionSet');
  graph.addEdge('planQuestionSet', 'generateQuestion');
  graph.addEdge('generateQuestion', 'evaluateAnswer');
  graph.addConditionalEdges('evaluateAnswer', decideNextStep, {
    generateFollowUp: 'generateFollowUp',
    generateReport: 'generateReport',
  });
  graph.addEdge('generateFollowUp', 'generateQuestion');
  graph.addEdge('generateReport', 'commitToSEG');
  graph.addEdge('commitToSEG', END);

  return graph.compile();
}

let compiledGraph = null;

export async function runMockInterview({ sessionId, userId, answers = [] }) {
  if (!compiledGraph) compiledGraph = buildMockInterviewGraph();

  const startTime = Date.now();
  const agentRun = await AgentRun.create({
    agentName: 'mock_interview', otariRouteTag: 'interview.evaluate',
    triggeredBy: userId, input: { sessionId }, status: 'running', modelUsed: 'gemini-1.5-pro',
  });

  try {
    let state = { sessionId, userId };
    state = await compiledGraph.invoke(state);

    const durationMs = Date.now() - startTime;
    await AgentRun.findByIdAndUpdate(agentRun._id, {
      status: 'success', nodesExecuted: state.nodesExecuted,
      output: { overallScore: state.report?.overallScore }, durationMs,
    });

    return { report: state.report, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, {
      status: 'failed', error: error.message, durationMs: Date.now() - startTime,
    });
    throw error;
  }
}

export default { runMockInterview };
