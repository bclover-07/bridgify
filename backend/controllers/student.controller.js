import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import Submission from '../models/Submission.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import Notification from '../models/Notification.js';
import InterviewSession from '../models/InterviewSession.js';
import DebateSession from '../models/DebateSession.js';
import { getRoleSkills, getImportanceWeight, getSkill } from '../utils/skillTaxonomy.js';
import { generateShareToken, verifyShareToken } from '../utils/tokens.js';
import { runGradingAgent } from '../agents/02-grading.js';

export async function getDashboard(req, res, next) {
  try {
    const studentId = req.user._id;
    const institutionId = req.user.institutionId._id || req.user.institutionId;

    const [segEntries, assessments, notifications, submissions] = await Promise.all([
      SkillEvidenceGraph.find({ studentId })
        .sort({ confidenceScore: -1 })
        .limit(20),
      Assessment.find({
        courseId: { $in: await getCourseIds(studentId) },
        status: 'published',
      })
        .sort({ dueDate: 1 })
        .limit(10)
        .select('title topic dueDate totalMarks courseId'),
      Notification.find({ userId: studentId, isRead: false })
        .sort({ createdAt: -1 })
        .limit(10),
      Submission.find({ studentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assessmentId', 'title topic'),
    ]);

    const skillSummary = {};
    for (const entry of segEntries) {
      if (!skillSummary[entry.skillId] || skillSummary[entry.skillId].confidenceScore < entry.confidenceScore) {
        skillSummary[entry.skillId] = {
          skillId: entry.skillId,
          skillLabel: entry.skillLabel,
          skillCategory: entry.skillCategory,
          confidenceScore: entry.confidenceScore,
          evidenceCount: 0,
        };
      }
      skillSummary[entry.skillId].evidenceCount++;
    }

    res.json({
      profile: {
        name: req.user.name,
        email: req.user.email,
        branch: req.user.student?.branch,
        year: req.user.student?.year,
        semester: req.user.student?.semester,
        cgpa: req.user.student?.cgpa,
        placementStatus: req.user.student?.placementStatus,
      },
      segSummary: Object.values(skillSummary),
      upcomingAssessments: assessments,
      recentSubmissions: submissions,
      notifications,
      stats: {
        totalSkills: Object.keys(skillSummary).length,
        totalEvidence: segEntries.length,
        avgConfidence: segEntries.length > 0
          ? Math.round(segEntries.reduce((sum, e) => sum + e.confidenceScore, 0) / segEntries.length)
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getReadiness(req, res, next) {
  try {
    const { targetRole } = req.query;
    const studentId = req.user._id;

    if (!targetRole) {
      const { getAllRoles } = await import('../utils/skillTaxonomy.js');
      return res.json({ roles: getAllRoles() });
    }

    const { computeReadiness } = await import('../services/readiness.service.js');
    const result = await computeReadiness(studentId, targetRole);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function whatIfReadiness(req, res, next) {
  try {
    const { targetRole, hypotheticalScores = {} } = req.body;
    const studentId = req.user._id;

    if (!targetRole) {
      return res.status(400).json({ error: 'targetRole is required' });
    }

    const { computeWhatIfReadiness } = await import('../services/readiness.service.js');
    const result = await computeWhatIfReadiness(studentId, targetRole, hypotheticalScores);

    res.json({
      ...result,
      note: 'What-if simulation only. No data was saved.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getSEG(req, res, next) {
  try {
    const studentId = req.user._id;
    const { skillCategory, evidenceType, minConfidence } = req.query;

    const filter = { studentId };
    if (skillCategory) filter.skillCategory = skillCategory;
    if (evidenceType) filter.evidenceType = evidenceType;
    if (minConfidence) filter.confidenceScore = { $gte: Number(minConfidence) };

    const entries = await SkillEvidenceGraph.find(filter)
      .sort({ updatedAt: -1 })
      .populate('verifierId', 'name role')
      .populate('courseId', 'title code');

    const skillSummary = {};
    const edges = [];

    for (const entry of entries) {
      if (!skillSummary[entry.skillId] || skillSummary[entry.skillId].proficiencyScore < entry.confidenceScore) {
        skillSummary[entry.skillId] = {
          skillId: entry.skillId,
          skillName: entry.skillLabel,
          skillCategory: entry.skillCategory,
          proficiencyScore: entry.confidenceScore,
        };
      }
      edges.push({
        evidenceType: entry.evidenceType,
        context: `Evidence recorded in ${entry.skillLabel}`,
        scoreContributed: entry.confidenceScore,
        timestamp: entry.createdAt,
      });
    }

    const nodes = Object.values(skillSummary);
    const totalReadinessScore = nodes.length > 0 
      ? Math.round(nodes.reduce((sum, n) => sum + n.proficiencyScore, 0) / nodes.length) 
      : 0;

    res.json({
      aggregate: { totalReadinessScore },
      nodes: nodes,
      edges: edges,
      total: entries.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSkillEvidence(req, res, next) {
  try {
    const { skillId } = req.params;
    const studentId = req.user._id;

    const entries = await SkillEvidenceGraph.find({ studentId, skillId })
      .sort({ createdAt: -1 })
      .populate('verifierId', 'name role')
      .populate('courseId', 'title code');

    if (entries.length === 0) {
      return res.json({ skillId, entries: [], message: 'No evidence found for this skill' });
    }

    const maxConfidence = Math.max(...entries.map((e) => e.confidenceScore));

    res.json({
      skillId,
      skillLabel: entries[0].skillLabel,
      skillCategory: entries[0].skillCategory,
      maxConfidence,
      evidenceCount: entries.length,
      entries,
    });
  } catch (error) {
    next(error);
  }
}

export async function shareWallet(req, res, next) {
  try {
    const studentId = req.user._id;
    const { skillIds, expiresInHours, expiryDays } = req.body;

    const hours = expiresInHours || (expiryDays ? Number(expiryDays) * 24 : 72);
    const token = generateShareToken(studentId, hours);
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    if (skillIds && skillIds.length > 0) {
      await SkillEvidenceGraph.updateMany(
        { studentId, skillId: { $in: skillIds } },
        {
          $push: {
            sharedWith: {
              accessToken: token,
              expiresAt,
            },
          },
        }
      );
    }

    res.json({
      shareLink: `${process.env.CLIENT_URL}/recruiter/profile/${token}`,
      token,
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWalletAccessLog(req, res, next) {
  try {
    const studentId = req.user._id;

    const entries = await SkillEvidenceGraph.find({
      studentId,
      'sharedWith.0': { $exists: true },
    }).select('skillId skillLabel sharedWith');

    const accessLog = [];
    for (const entry of entries) {
      for (const share of entry.sharedWith) {
        if (share.accessedAt) {
          accessLog.push({
            skillId: entry.skillId,
            skillLabel: entry.skillLabel,
            recruiterId: share.recruiterId,
            accessedAt: share.accessedAt,
            expiresAt: share.expiresAt,
          });
        }
      }
    }

    accessLog.sort((a, b) => new Date(b.accessedAt) - new Date(a.accessedAt));

    res.json({ accessLog });
  } catch (error) {
    next(error);
  }
}

export async function getAssessments(req, res, next) {
  try {
    const courseIds = await getCourseIds(req.user._id);

    const assessments = await Assessment.find({
      courseId: { $in: courseIds },
      status: 'published',
    })
      .sort({ createdAt: -1 })
      .populate('courseId', 'title code')
      .populate('facultyId', 'name');

    const submissions = await Submission.find({
      studentId: req.user._id,
      assessmentId: { $in: assessments.map((a) => a._id) },
    }).select('assessmentId gradingStatus totalScore percentage');

    const submissionMap = {};
    for (const sub of submissions) {
      submissionMap[String(sub.assessmentId)] = sub;
    }

    const assessmentList = assessments.map((a) => ({
      ...a.toObject(),
      submission: submissionMap[String(a._id)] || null,
      hasSubmitted: !!submissionMap[String(a._id)],
    }));

    res.json({ assessments: assessmentList });
  } catch (error) {
    next(error);
  }
}

export async function getAssessmentDetail(req, res, next) {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('courseId', 'title code')
      .populate('facultyId', 'name');

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const existingSubmission = await Submission.findOne({
      studentId: req.user._id,
      assessmentId: assessment._id,
    });

    res.json({ assessment, existingSubmission });
  } catch (error) {
    next(error);
  }
}

export async function submitAssessment(req, res, next) {
  try {
    const assessmentId = req.params.id;
    const studentId = req.user._id;
    const { answers } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.status !== 'published') {
      return res.status(400).json({ error: 'Assessment is not published' });
    }

    const existingSubmission = await Submission.findOne({ studentId, assessmentId });
    if (existingSubmission) {
      return res.status(409).json({ error: 'You have already submitted this assessment' });
    }

    const submission = await Submission.create({
      studentId,
      assessmentId,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        response: a.response,
        fileUrl: a.fileUrl || '',
      })),
      gradingStatus: 'submitted',
      submittedAt: new Date(),
    });

    await Assessment.findByIdAndUpdate(assessmentId, { $inc: { submissionCount: 1 } });

    runGradingAgent({
      submissionId: submission._id,
      userId: req.user._id,
      institutionId: req.user.institutionId._id || req.user.institutionId,
      pushToSEG: true,
    }).catch(err => console.error('Async grading failed:', err.message));

    res.status(201).json({
      submission,
      message: 'Assessment submitted successfully. AI grading has started.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubmission(req, res, next) {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      studentId: req.user._id,
    }).populate('assessmentId');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ submission });
  } catch (error) {
    next(error);
  }
}

export async function startMockInterview(req, res, next) {
  try {
    const targetRole = req.body.targetRole || req.body.topic || 'Software Engineer';

    const session = await InterviewSession.create({
      studentId: req.user._id,
      targetRole,
      status: 'preparing',
    });

    try {
      req.io.to(`student:${req.user._id}`).emit('interview:preparing', {
        sessionId: session._id,
        targetRole,
      });
    } catch { /* socket emit fail safe */ }

    const { runMockInterview } = await import('../agents/04-mockInterview.js');
    runMockInterview({ sessionId: session._id, userId: req.user._id })
      .catch(err => console.error('Mock interview agent background execution failed:', err.message));

    res.status(201).json({
      session,
      targetRole,
      firstQuestion: `Welcome to your ${targetRole} Mock Interview. Tell me about a challenging technical project you worked on recently and the key engineering decisions you made.`,
      message: 'Interview session initialized.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getInterviewHistory(req, res, next) {
  try {
    const sessions = await InterviewSession.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .select('targetRole status report.overallScore createdAt');

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
}

export async function startDebate(req, res, next) {
  try {
    const topic = req.body.topic || 'AI taking over Software Engineering jobs';
    const side = req.body.side || 'against';

    const session = await DebateSession.create({
      studentId: req.user._id,
      topic,
      side,
      status: 'preparing',
    });

    const { runDebateCoach } = await import('../agents/05-debateCoach.js');
    runDebateCoach({ sessionId: session._id, userId: req.user._id })
      .catch(err => console.error('Debate agent background execution failed:', err.message));

    res.status(201).json({
      session,
      topic,
      side,
      openingArgument: `I'll be debating against your stance on "${topic}". While technology rapidly evolves, human problem-solving, architectural design, and empathy remain irreplaceable core competencies. What is your primary counter-argument?`,
      message: 'Debate session initialized.',
    });
  } catch (error) {
    next(error);
  }
}

export async function generateStudyPlan(req, res, next) {
  try {
    const { targetRole } = req.body;
    const studentId = req.user._id;

    if (!targetRole) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    const { runStudyPlan } = await import('../agents/13-studyPlan.js');
    const result = await runStudyPlan({
      studentId,
      targetRole,
      userId: req.user._id,
    });

    res.json({
      targetRole,
      plan: result.plan,
      readiness: result.readiness,
      agentRunId: result.agentRunId,
      message: 'Study plan generated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getOpportunities(req, res, next) {
  try {
    const { default: DriveEvent } = await import('../models/DriveEvent.js');
    const drives = await DriveEvent.find({
      status: { $in: ['upcoming', 'active'] },
      institutionId: req.user.institutionId._id || req.user.institutionId,
    })
      .sort({ driveDate: 1 })
      .select('company roles driveDate registrationDeadline status');

    res.json({ opportunities: drives });
  } catch (error) {
    next(error);
  }
}

export async function getBenchmarks(req, res, next) {
  try {
    const studentId = req.user._id;
    const institutionId = req.user.institutionId._id || req.user.institutionId;

    const mySkills = await SkillEvidenceGraph.aggregate([
      { $match: { studentId: studentId } },
      { $group: { _id: '$skillId', maxConfidence: { $max: '$confidenceScore' }, label: { $first: '$skillLabel' } } },
    ]);

    const cohortAvg = await SkillEvidenceGraph.aggregate([
      { $match: { institutionId: institutionId } },
      { $group: {
        _id: '$skillId',
        avgConfidence: { $avg: '$confidenceScore' },
        maxConfidence: { $max: '$confidenceScore' },
        studentCount: { $addToSet: '$studentId' },
      }},
      { $addFields: { studentCount: { $size: '$studentCount' } } },
    ]);

    const cohortMap = {};
    for (const c of cohortAvg) {
      cohortMap[c._id] = c;
    }

    const benchmarks = mySkills.map((s) => {
      const cohort = cohortMap[s._id] || { avgConfidence: 0, maxConfidence: 0, studentCount: 0 };
      return {
        skillId: s._id,
        skillLabel: s.label,
        myScore: s.maxConfidence,
        cohortAvg: Math.round(cohort.avgConfidence),
        cohortMax: cohort.maxConfidence,
        percentile: cohort.studentCount > 0
          ? Math.round((s.maxConfidence / (cohort.maxConfidence || 1)) * 100)
          : 0,
      };
    });

    benchmarks.sort((a, b) => b.myScore - a.myScore);

    res.json({ benchmarks });
  } catch (error) {
    next(error);
  }
}

async function getCourseIds(studentId) {
  const { default: Course } = await import('../models/Course.js');
  const courses = await Course.find({ enrolledStudentIds: studentId }).select('_id');
  return courses.map((c) => c._id);
}

export async function applyForOpportunity(req, res, next) {
  try {
    const driveId = req.params.id;
    const studentId = req.user._id;

    const { default: DriveEvent } = await import('../models/DriveEvent.js');
    const drive = await DriveEvent.findById(driveId);
    if (!drive) {
      return res.status(404).json({ error: 'Drive not found' });
    }

    const alreadyApplied = drive.registrations.some(r => String(r.studentId) === String(studentId));
    if (alreadyApplied) {
      return res.status(400).json({ error: 'You have already applied for this opportunity.' });
    }

    drive.registrations.push({
      studentId,
      stage: 'applied',
      stageHistory: [{ stage: 'applied', movedAt: new Date(), notes: 'Student self-applied' }]
    });

    await drive.save();

    res.json({ message: 'Application submitted successfully', drive });
  } catch (error) {
    next(error);
  }
}
