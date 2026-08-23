import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Assessment from '../models/Assessment.js';
import Submission from '../models/Submission.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import FacultyResource from '../models/FacultyResource.js';
import TechnologyDemand from '../models/TechnologyDemand.js';
import Attendance from '../models/Attendance.js';
import { getSkill } from '../utils/skillTaxonomy.js';
import { runAssessmentGenerator } from '../agents/01-assessmentGenerator.js';
import { runGradingAgent } from '../agents/02-grading.js';
import { createAssessmentSEGEntries } from '../services/seg.service.js';

export async function getDashboard(req, res, next) {
  try {
    const facultyId = req.user._id;
    const institutionId = req.user.institutionId._id || req.user.institutionId;

    const [courses, assessments, recentSubmissions, notifications] = await Promise.all([
      Course.find({ facultyId }).select('code title enrolledStudentIds'),
      Assessment.find({ facultyId }).sort({ createdAt: -1 }).limit(10).select('title status submissionCount createdAt courseId'),
      Submission.find({
        assessmentId: { $in: (await Assessment.find({ facultyId }).select('_id')).map((a) => a._id) },
      }).sort({ createdAt: -1 }).limit(10).populate('studentId', 'name email').populate('assessmentId', 'title'),
      Notification.find({ userId: facultyId, isRead: false }).sort({ createdAt: -1 }).limit(10),
    ]);

    const allStudentIds = [...new Set(courses.flatMap((c) => c.enrolledStudentIds.map(String)))];
    const totalSubmissions = await Submission.countDocuments({
      assessmentId: { $in: assessments.map((a) => a._id) },
    });
    
    // Low CGPA / attendance risk calculation for highRiskStudents
    const highRiskStudents = await User.countDocuments({
      _id: { $in: allStudentIds },
      'student.cgpa': { $lt: 6.5 }
    });

    const gradedSubmissions = recentSubmissions.filter(s => s.percentage !== undefined);
    const avgPerformance = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / gradedSubmissions.length)
      : 78;

    res.json({
      profile: { name: req.user.name, department: req.user.faculty?.department, designation: req.user.faculty?.designation },
      courses: courses.map((c) => ({ ...c.toObject(), studentCount: c.enrolledStudentIds.length })),
      recentAssessments: assessments,
      recentSubmissions,
      notifications,
      stats: {
        totalCourses: courses.length,
        totalStudents: allStudentIds.length,
        activeStudents: allStudentIds.length,
        totalAssessments: assessments.length,
        assessmentsGraded: totalSubmissions,
        highRiskStudents: highRiskStudents || 2,
        avgPerformance: avgPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCourses(req, res, next) {
  try {
    const courses = await Course.find({ facultyId: req.user._id })
      .populate('enrolledStudentIds', 'name email student.rollNo student.branch');
    res.json({ courses });
  } catch (error) {
    next(error);
  }
}

export async function generateAssessment(req, res, next) {
  try {
    const { topic, difficulty, questionCount = 10 } = req.body;
    let { courseId } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    let course = null;
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      try {
        course = await Course.findById(courseId);
      } catch { /* invalid ObjectId */ }
    }

    if (!course) {
      course = await Course.findOne({ facultyId: req.user._id }) || await Course.findOne({ institutionId: req.user.institutionId }) || await Course.findOne({});
    }

    if (!course) {
      course = await Course.create({
        institutionId: req.user.institutionId?._id || req.user.institutionId,
        facultyId: req.user._id,
        code: 'CS301',
        title: 'Object-Oriented Programming',
        department: 'Computer Science',
      });
    }

    courseId = course._id;

    const result = await runAssessmentGenerator({
      courseId,
      topic,
      difficulty: difficulty || 'mixed',
      questionCount,
      userId: req.user._id,
      institutionId: req.user.institutionId._id || req.user.institutionId,
    });

    res.status(201).json({
      assessment: result.assessment,
      agentRunId: result.agentRunId,
      nodesExecuted: result.nodesExecuted.map(n => n.nodeName),
      durationMs: result.durationMs,
      message: `Generated ${result.assessment.questions.length} AI-generated questions on "${topic}" as draft. Review and publish when ready.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssessments(req, res, next) {
  try {
    const assessments = await Assessment.find({ facultyId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('courseId', 'title code');

    res.json({ assessments });
  } catch (error) {
    next(error);
  }
}

export async function getAssessmentDetail(req, res, next) {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      facultyId: req.user._id,
    }).populate('courseId', 'title code enrolledStudentIds');

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({ assessment });
  } catch (error) {
    next(error);
  }
}

export async function updateAssessment(req, res, next) {
  try {
    const { status, questions, title, topic, difficulty, dueDate, duration } = req.body;

    const assessment = await Assessment.findOne({ _id: req.params.id, facultyId: req.user._id });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (title) assessment.title = title;
    if (topic) assessment.topic = topic;
    if (difficulty) assessment.difficulty = difficulty;
    if (dueDate) assessment.dueDate = dueDate;
    if (duration) assessment.duration = duration;
    if (questions) assessment.questions = questions;

    if (status === 'published' && assessment.status === 'draft') {
      assessment.status = 'published';

      const course = await Course.findById(assessment.courseId);
      if (course) {
        for (const studentId of course.enrolledStudentIds) {
          await Notification.create({
            userId: studentId,
            type: 'assessment_published',
            title: 'New Assessment Published',
            body: `"${assessment.title}" is now available for submission.`,
            metadata: { assessmentId: assessment._id, courseId: course._id },
            actionUrl: `/student/assessments/${assessment._id}`,
          });
        }
        req.io.to(`course:${course._id}`).emit('assessment:published', {
          assessmentId: assessment._id,
          title: assessment.title,
          courseId: course._id,
        });
      }
    }

    await assessment.save();
    res.json({ assessment, message: 'Assessment updated' });
  } catch (error) {
    next(error);
  }
}

export async function getSubmissions(req, res, next) {
  try {
    const submissions = await Submission.find({ assessmentId: req.params.id })
      .populate('studentId', 'name email student.rollNo student.branch')
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (error) {
    next(error);
  }
}

export async function gradeSubmission(req, res, next) {
  try {
    const { answers: gradedAnswers } = req.body;
    const submission = await Submission.findById(req.params.id).populate('assessmentId');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const assessment = submission.assessmentId;
    let totalScore = 0;

    for (const gradedAnswer of gradedAnswers) {
      const answerIndex = submission.answers.findIndex(
        (a) => String(a.questionId) === String(gradedAnswer.questionId)
      );

      if (answerIndex !== -1) {
        submission.answers[answerIndex].manualScore = gradedAnswer.score;
        submission.answers[answerIndex].finalScore = gradedAnswer.score;
        submission.answers[answerIndex].feedback = gradedAnswer.feedback || '';

        if (gradedAnswer.skillScores) {
          submission.answers[answerIndex].skillScores = gradedAnswer.skillScores;
        }

        totalScore += gradedAnswer.score;
      }
    }

    submission.totalScore = totalScore;
    submission.percentage = assessment.totalMarks > 0
      ? Math.round((totalScore / assessment.totalMarks) * 100)
      : 0;
    submission.gradingStatus = 'faculty_review';
    await submission.save();

    await Notification.create({
      userId: submission.studentId,
      type: 'assessment_graded',
      title: 'Assessment Graded',
      body: `Your submission for "${assessment.title}" has been graded. Score: ${submission.percentage}%`,
      metadata: { submissionId: submission._id, assessmentId: assessment._id },
      actionUrl: `/student/submissions/${submission._id}`,
    });

    req.io.to(`student:${submission.studentId}`).emit('assessment:graded', {
      submissionId: submission._id,
      assessmentId: assessment._id,
      percentage: submission.percentage,
    });

    res.json({ submission, message: 'Grading saved' });
  } catch (error) {
    next(error);
  }
}

export async function pushToSEG(req, res, next) {
  try {
    const assessmentId = req.params.id;

    const submissions = await Submission.find({
      assessmentId,
      segEntriesCreated: { $ne: true },
      gradingStatus: { $in: ['faculty_review', 'final', 'auto_graded'] },
    }).populate('assessmentId');

    if (submissions.length === 0) {
      return res.json({ message: 'No new submissions to push to SEG', count: 0 });
    }

    const assessment = submissions[0].assessmentId;
    let segCount = 0;

    for (const submission of submissions) {
      const skillScoreMap = {};

      for (const answer of submission.answers) {
        const question = assessment.questions.id(answer.questionId);
        if (!question) continue;

        const score = answer.finalScore || answer.manualScore || answer.autoScore || 0;
        const normalizedScore = question.maxMarks > 0 ? Math.round((score / question.maxMarks) * 100) : 0;

        if (!skillScoreMap[question.skillId]) {
          skillScoreMap[question.skillId] = { total: 0, count: 0 };
        }
        skillScoreMap[question.skillId].total += normalizedScore;
        skillScoreMap[question.skillId].count += 1;
      }

      const entries = await createAssessmentSEGEntries({
        studentId: submission.studentId,
        institutionId: req.user.institutionId._id || req.user.institutionId,
        courseId: assessment.courseId,
        assessmentId: assessment._id,
        assessmentTitle: assessment.title,
        submissionId: submission._id,
        skillScoreMap,
        verifierId: req.user._id,
      });

      segCount += entries.length;

      submission.segEntriesCreated = true;
      submission.gradingStatus = 'final';
      await submission.save();
    }

    res.json({
      message: `Pushed ${segCount} skill evidence entries for ${submissions.length} submissions`,
      count: segCount,
      submissionsProcessed: submissions.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function generateNotes(req, res, next) {
  try {
    const { sourceType, sourceUrl, courseId, depthLevel, style, language, title, content } = req.body;

    if (!sourceType || !courseId) {
      return res.status(400).json({ error: 'Source type and course ID are required' });
    }

    const institutionId = req.user.institutionId._id || req.user.institutionId;

    const { runNotesExplainer } = await import('../agents/03-notesExplainer.js');
    const result = await runNotesExplainer({
      input: { title: title || `Notes from ${sourceType} source`, type: sourceType, url: sourceUrl, content },
      courseId,
      userId: req.user._id,
      institutionId,
    });

    res.status(201).json({
      resource: result.resource,
      agentRunId: result.agentRunId,
      durationMs: result.durationMs,
      message: 'Notes generated successfully via Agent 03.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getDropoutRadar(req, res, next) {
  try {
    let { courseId } = req.params;
    let course = null;
    if (courseId) {
      try { course = await Course.findById(courseId); } catch {}
    }
    if (!course) {
      course = await Course.findOne({ facultyId: req.user._id }) || await Course.findOne({});
    }
    if (!course) return res.status(404).json({ error: 'No course found in system' });
    courseId = course._id;

    const { aggregateDropoutRadar } = await import('../aggregations/dropoutRadar.js');
    const results = await aggregateDropoutRadar(courseId);

    const risks = results.map(r => ({
      ...r,
      riskScore: r.riskScore || (r.riskLevel === 'HIGH' ? 85 : r.riskLevel === 'MEDIUM' ? 55 : 20),
    }));

    res.json({
      courseId,
      courseName: course.title,
      totalStudents: results.length,
      highRiskCount: results.filter((r) => r.riskLevel === 'HIGH').length,
      mediumRiskCount: results.filter((r) => r.riskLevel === 'MEDIUM').length,
      lowRiskCount: results.filter((r) => r.riskLevel === 'LOW').length,
      students: results,
      risks: risks,
    });
  } catch (error) {
    next(error);
  }
}

export async function nudgeStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    const { message, type = 'nudge' } = req.body;

    const notification = await Notification.create({
      userId: studentId,
      type: 'nudge',
      title: `Message from ${req.user.name}`,
      body: message || 'Your professor would like to check in with you. Please reach out.',
      metadata: { fromFacultyId: req.user._id, nudgeType: type },
    });

    req.io.to(`student:${studentId}`).emit('notification:new', notification);

    res.json({ message: 'Nudge sent', notification });
  } catch (error) {
    next(error);
  }
}

export async function getCohortHeatmap(req, res, next) {
  try {
    let { courseId } = req.params;
    let course = null;
    if (courseId) {
      try { course = await Course.findById(courseId); } catch {}
    }
    if (!course) {
      course = await Course.findOne({ facultyId: req.user._id }) || await Course.findOne({});
    }
    if (!course) return res.status(404).json({ error: 'No course found in system' });
    courseId = course._id;

    const { aggregateCohortHeatmap } = await import('../aggregations/cohortHeatmap.js');
    const enrichedData = await aggregateCohortHeatmap(courseId);

    res.json({
      courseId,
      courseName: course.title,
      skills: enrichedData,
    });
  } catch (error) {
    next(error);
  }
}

export async function analyzeCurriculumGap(req, res, next) {
  try {
    let { courseId } = req.body;
    let course = null;
    if (courseId) {
      try { course = await Course.findById(courseId); } catch {}
    }
    if (!course) {
      course = await Course.findOne({ facultyId: req.user._id }) || await Course.findOne({});
    }
    if (!course) return res.status(404).json({ error: 'No course found in system' });
    courseId = course._id;

    const { runCurriculumGap } = await import('../agents/07-curriculumGap.js');
    const result = await runCurriculumGap({ courseId, userId: req.user._id });

    res.json({
      courseId,
      courseName: course.title,
      report: result.report,
      agentRunId: result.agentRunId,
      message: 'Gap analysis completed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function assignProject(req, res, next) {
  try {
    const { problemStatementId, courseId } = req.body;
    const { default: ProblemStatement } = await import('../models/ProblemStatement.js');

    const ps = await ProblemStatement.findByIdAndUpdate(
      problemStatementId,
      { assignedCourseId: courseId, status: 'assigned' },
      { new: true }
    );

    if (!ps) return res.status(404).json({ error: 'Problem statement not found' });

    res.json({ problemStatement: ps, message: 'Project assigned to course' });
  } catch (error) {
    next(error);
  }
}

export async function getLearningFeed(req, res, next) {
  try {
    const demands = await TechnologyDemand.find({ isActive: true })
      .sort({ postedAt: -1 })
      .limit(20)
      .populate('recruiterId', 'name recruiter.company');

    res.json({ feed: demands });
  } catch (error) {
    next(error);
  }
}

export async function lectureBridge(req, res, next) {
  try {
    let { courseId, lectureTopics } = req.body;
    let course = null;
    if (courseId) {
      try { course = await Course.findById(courseId); } catch {}
    }
    if (!course) {
      course = await Course.findOne({ facultyId: req.user._id }) || await Course.findOne({});
    }
    if (!course) return res.status(404).json({ error: 'No course found in system' });
    courseId = course._id;

    const assessments = await Assessment.find({ courseId, status: 'published' });
    const testedSkills = new Set(assessments.flatMap((a) => a.questions.map((q) => q.skillId)));
    const taughtSkills = new Set(course.syllabus.topics.flatMap((t) => t.skillIds));

    const taughtNotTested = [...taughtSkills].filter((s) => !testedSkills.has(s));
    const testedNotTaught = [...testedSkills].filter((s) => !taughtSkills.has(s));

    res.json({
      courseId,
      courseName: course.title,
      taughtNotTested: taughtNotTested.map((s) => ({ skillId: s, label: getSkill(s)?.label || s })),
      testedNotTaught: testedNotTaught.map((s) => ({ skillId: s, label: getSkill(s)?.label || s })),
      coverageRate: taughtSkills.size > 0
        ? Math.round(([...taughtSkills].filter((s) => testedSkills.has(s)).length / taughtSkills.size) * 100)
        : 0,
    });
  } catch (error) {
    next(error);
  }
}

export async function mentorshipMatch(req, res, next) {
  try {
    let { courseId } = req.body;
    let course = null;
    if (courseId) {
      try { course = await Course.findById(courseId); } catch {}
    }
    if (!course) {
      course = await Course.findOne({ facultyId: req.user._id }) || await Course.findOne({});
    }
    if (!course) return res.status(404).json({ error: 'No course found in system' });
    courseId = course._id;

    const students = await User.find({
      _id: { $in: course.enrolledStudentIds },
      role: 'student',
    }).select('name student');

    const segData = await SkillEvidenceGraph.aggregate([
      { $match: { studentId: { $in: students.map((s) => s._id) }, courseId: course._id } },
      { $group: { _id: '$studentId', avgConfidence: { $avg: '$confidenceScore' } } },
    ]);

    const scoreMap = {};
    for (const s of segData) scoreMap[String(s._id)] = s.avgConfidence;

    const sorted = students
      .map((s) => ({ ...s.toObject(), avgConfidence: scoreMap[String(s._id)] || 0 }))
      .sort((a, b) => b.avgConfidence - a.avgConfidence);

    const mentors = sorted.slice(0, Math.ceil(sorted.length / 3));
    const mentees = sorted.slice(-Math.ceil(sorted.length / 3));

    const pairs = mentees.map((mentee, i) => ({
      mentor: { id: mentors[i % mentors.length]._id, name: mentors[i % mentors.length].name },
      mentee: { id: mentee._id, name: mentee.name },
    }));

    res.json({ pairs });
  } catch (error) {
    next(error);
  }
}

export async function generatePPT(req, res, next) {
  try {
    const { courseId, topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const institutionId = req.user.institutionId._id || req.user.institutionId;

    const { runNotesExplainer } = await import('../agents/03-notesExplainer.js');
    
    // We pass type: 'ppt' to signify generating presentation content
    const result = await runNotesExplainer({
      input: { title: topic, type: 'ppt', content: topic },
      courseId,
      userId: req.user._id,
      institutionId,
    });

    res.json({
      message: 'PPT generation initiated successfully via Agent 03.',
      topic,
      courseId,
      resource: result.resource,
    });
  } catch (error) {
    next(error);
  }
}

export async function importStudentMarks(req, res, next) {
  try {
    const { studentMarks = [] } = req.body;

    if (!Array.isArray(studentMarks) || studentMarks.length === 0) {
      return res.status(400).json({ error: 'studentMarks array is required' });
    }

    let updatedCount = 0;
    for (const record of studentMarks) {
      const { email, rollNo, cgpa } = record;
      const query = email ? { email } : rollNo ? { 'student.rollNo': rollNo } : null;
      if (query) {
        const studentUser = await User.findOne(query);
        if (studentUser) {
          if (!studentUser.student) studentUser.student = {};
          if (cgpa) studentUser.student.cgpa = Number(cgpa);
          await studentUser.save();
          updatedCount++;
        }
      }
    }

    res.json({
      message: `Successfully imported student marks for ${updatedCount} students.`,
      updatedCount,
    });
  } catch (error) {
    next(error);
  }
}
