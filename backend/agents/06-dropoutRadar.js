import { StateGraph, END } from '@langchain/langgraph';
import { otariCallWithRetry } from '../utils/otariCall.js';
import AgentRun from '../models/AgentRun.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Submission from '../models/Submission.js';
import Assessment from '../models/Assessment.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import Course from '../models/Course.js';
import { createNotification } from '../services/notification.service.js';
import { getIO } from '../config/socket.js';

/**
 * Agent 06: Dropout Radar
 * Nodes: fetchCohortData → computeSignals → scoreRisk → rankCohort
 *   → generateNarratives (HIGH only) → triggerAlerts → logResults
 */

async function fetchCohortData(state) {
  const startTime = Date.now();
  const { courseId } = state;

  const course = await Course.findById(courseId);
  if (!course) throw new Error('Course not found');

  const students = await User.find({
    _id: { $in: course.enrolledStudentIds },
    role: 'student',
  }).select('name email student').lean();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const cohortData = [];
  for (const student of students) {
    const [attendance, submissions, segEntries] = await Promise.all([
      Attendance.find({ studentId: student._id, courseId, date: { $gte: thirtyDaysAgo } }).lean(),
      Submission.find({ studentId: student._id }).populate('assessmentId', 'courseId').lean(),
      SkillEvidenceGraph.find({ studentId: student._id, courseId }).lean(),
    ]);

    cohortData.push({ student, attendance, submissions, segEntries });
  }

  return {
    ...state,
    course: { _id: course._id, title: course.title },
    cohortData,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'fetchCohortData', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function computeSignals(state) {
  const startTime = Date.now();
  const { cohortData, courseId } = state;

  const totalPublishedAssessments = await Assessment.countDocuments({ courseId, status: 'published' });

  const signals = cohortData.map(({ student, attendance, submissions, segEntries }) => {
    const totalDays = Math.max(attendance.length, 1);
    const presentDays = attendance.filter(a => a.isPresent).length;
    const attendanceRate = presentDays / totalDays;
    const attendanceDrop = 1 - attendanceRate;

    const courseSubmissions = submissions.filter(s => String(s.assessmentId?.courseId) === String(courseId));
    const recentScores = courseSubmissions.slice(-3).map(s => s.percentage || 0);
    const olderScores = courseSubmissions.slice(-6, -3).map(s => s.percentage || 0);
    const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 50;
    const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : 50;
    const scoreDecline = Math.max(0, (olderAvg - recentAvg) / 100);

    const submissionGap = totalPublishedAssessments > 0
      ? Math.max(0, 1 - courseSubmissions.length / totalPublishedAssessments)
      : 0;

    const avgConfidence = segEntries.length > 0
      ? segEntries.reduce((sum, e) => sum + e.confidenceScore, 0) / segEntries.length
      : 0;
    const engagementDrop = Math.max(0, 1 - avgConfidence / 100);

    return {
      student,
      attendanceDrop,
      scoreDecline,
      submissionGap,
      engagementDrop,
      financialStressFlag: 0,
      attendanceRate,
      recentAvgScore: Math.round(recentAvg),
    };
  });

  return {
    ...state,
    signals,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'computeSignals', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function scoreRisk(state) {
  const startTime = Date.now();
  const { signals } = state;

  const scored = signals.map(s => {
    const risk = 0.35 * s.attendanceDrop +
                 0.25 * s.scoreDecline +
                 0.20 * s.submissionGap +
                 0.15 * s.engagementDrop +
                 0.05 * s.financialStressFlag;

    const riskPercentage = Math.round(risk * 100);

    return {
      ...s,
      riskPercentage,
      riskLevel: riskPercentage >= 70 ? 'HIGH' : riskPercentage >= 40 ? 'MEDIUM' : 'LOW',
    };
  });

  return {
    ...state,
    scoredStudents: scored,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'scoreRisk', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function rankCohort(state) {
  const startTime = Date.now();
  const { scoredStudents } = state;

  const ranked = [...scoredStudents].sort((a, b) => b.riskPercentage - a.riskPercentage);

  return {
    ...state,
    rankedStudents: ranked,
    highRiskStudents: ranked.filter(s => s.riskLevel === 'HIGH'),
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'rankCohort', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function generateNarratives(state) {
  const startTime = Date.now();
  const { highRiskStudents, course, userId } = state;

  if (highRiskStudents.length === 0) {
    return {
      ...state,
      narratives: {},
      nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateNarratives', durationMs: Date.now() - startTime, status: 'skipped_no_high_risk' }],
    };
  }

  const studentSummaries = highRiskStudents.slice(0, 5).map(s => {
    return `Student: ${s.student.name} (${s.student.student?.rollNo || 'N/A'})
  Risk: ${s.riskPercentage}%
  Attendance drop: ${Math.round(s.attendanceDrop * 100)}%
  Score decline: ${Math.round(s.scoreDecline * 100)}%
  Submission gap: ${Math.round(s.submissionGap * 100)}%
  Engagement drop: ${Math.round(s.engagementDrop * 100)}%`;
  }).join('\n\n');

  const prompt = `You are an academic advisor. For each HIGH-risk student below in the course "${course.title}", write a brief, actionable narrative (2-3 sentences) explaining why they are at risk and what specific intervention is recommended.

${studentSummaries}

Return a JSON object mapping student names to their narratives:
{"Student Name": "narrative text", ...}
Return ONLY the JSON object.`;

  try {
    const result = await otariCallWithRetry({
      route: 'dropout.analyze',
      prompt,
      userId,
      options: { temperature: 0.5, maxTokens: 2048 },
    });

    let narratives = {};
    try {
      const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      narratives = JSON.parse(jsonStr);
    } catch {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) narratives = JSON.parse(jsonMatch[0]);
    }

    return {
      ...state,
      narratives,
      nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateNarratives', durationMs: Date.now() - startTime, status: 'success' }],
    };
  } catch (error) {
    return {
      ...state,
      narratives: {},
      nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'generateNarratives', durationMs: Date.now() - startTime, status: 'fallback' }],
    };
  }
}

async function triggerAlerts(state) {
  const startTime = Date.now();
  const { highRiskStudents, course, userId } = state;

  for (const s of highRiskStudents) {
    try {
      const io = getIO();
      io.to(`course:${course._id}`).emit('dropout:alert', {
        studentId: String(s.student._id),
        studentName: s.student.name,
        riskPercentage: s.riskPercentage,
        riskLevel: s.riskLevel,
        courseId: String(course._id),
        courseName: course.title,
      });
    } catch (err) {
      console.error('Dropout alert socket failed:', err.message);
    }
  }

  return {
    ...state,
    alertsSent: highRiskStudents.length,
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'triggerAlerts', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

async function logResults(state) {
  const startTime = Date.now();
  const { rankedStudents, narratives, course } = state;

  const results = rankedStudents.map(s => ({
    studentId: s.student._id,
    name: s.student.name,
    email: s.student.email,
    rollNo: s.student.student?.rollNo,
    branch: s.student.student?.branch,
    cgpa: s.student.student?.cgpa,
    riskPercentage: s.riskPercentage,
    riskLevel: s.riskLevel,
    signals: {
      attendanceDrop: Math.round(s.attendanceDrop * 100),
      scoreDecline: Math.round(s.scoreDecline * 100),
      submissionGap: Math.round(s.submissionGap * 100),
      engagementDrop: Math.round(s.engagementDrop * 100),
      financialStress: 0,
    },
    attendanceRate: Math.round(s.attendanceRate * 100),
    recentAvgScore: s.recentAvgScore,
    narrative: narratives[s.student.name] || null,
  }));

  return {
    ...state,
    finalResults: {
      courseId: course._id,
      courseName: course.title,
      totalStudents: results.length,
      highRiskCount: results.filter(r => r.riskLevel === 'HIGH').length,
      mediumRiskCount: results.filter(r => r.riskLevel === 'MEDIUM').length,
      lowRiskCount: results.filter(r => r.riskLevel === 'LOW').length,
      students: results,
    },
    nodesExecuted: [...(state.nodesExecuted || []), { nodeName: 'logResults', durationMs: Date.now() - startTime, status: 'success' }],
  };
}

function buildDropoutRadarGraph() {
  const channelDef = (defaultVal) => ({ value: (a, b) => b ?? a, default: () => defaultVal });

  const graph = new StateGraph({
    channels: {
      courseId: channelDef(null),
      userId: channelDef(null),
      course: channelDef(null),
      cohortData: channelDef([]),
      signals: channelDef([]),
      scoredStudents: channelDef([]),
      rankedStudents: channelDef([]),
      highRiskStudents: channelDef([]),
      narratives: channelDef({}),
      alertsSent: channelDef(0),
      finalResults: channelDef(null),
      nodesExecuted: channelDef([]),
    },
  });

  graph.addNode('fetchCohortData', fetchCohortData);
  graph.addNode('computeSignals', computeSignals);
  graph.addNode('scoreRisk', scoreRisk);
  graph.addNode('rankCohort', rankCohort);
  graph.addNode('generateNarratives', generateNarratives);
  graph.addNode('triggerAlerts', triggerAlerts);
  graph.addNode('logResults', logResults);

  graph.setEntryPoint('fetchCohortData');
  graph.addEdge('fetchCohortData', 'computeSignals');
  graph.addEdge('computeSignals', 'scoreRisk');
  graph.addEdge('scoreRisk', 'rankCohort');
  graph.addEdge('rankCohort', 'generateNarratives');
  graph.addEdge('generateNarratives', 'triggerAlerts');
  graph.addEdge('triggerAlerts', 'logResults');
  graph.addEdge('logResults', END);

  return graph.compile();
}

let compiledGraph = null;

export async function runDropoutRadar({ courseId, userId }) {
  if (!compiledGraph) compiledGraph = buildDropoutRadarGraph();

  const startTime = Date.now();
  const agentRun = await AgentRun.create({
    agentName: 'dropout_radar',
    otariRouteTag: 'dropout.analyze',
    triggeredBy: userId,
    input: { courseId },
    status: 'running',
    modelUsed: 'gemini-1.5-flash',
  });

  try {
    const result = await compiledGraph.invoke({ courseId, userId });
    const durationMs = Date.now() - startTime;

    await AgentRun.findByIdAndUpdate(agentRun._id, {
      status: 'success',
      nodesExecuted: result.nodesExecuted,
      output: { totalStudents: result.finalResults.totalStudents, highRisk: result.finalResults.highRiskCount },
      durationMs,
    });

    return { ...result.finalResults, agentRunId: agentRun._id, durationMs };
  } catch (error) {
    await AgentRun.findByIdAndUpdate(agentRun._id, {
      status: 'failed', error: error.message, durationMs: Date.now() - startTime,
    });
    throw error;
  }
}

export default { runDropoutRadar };
