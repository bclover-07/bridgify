import User from '../models/User.js';
import Course from '../models/Course.js';
import Assessment from '../models/Assessment.js';
import Submission from '../models/Submission.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import DriveEvent from '../models/DriveEvent.js';
import Attendance from '../models/Attendance.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

export async function getDashboard(req, res, next) {
  try {
    const institutionId = req.user.institutionId._id || req.user.institutionId;

    const [studentCount, facultyCount, courseCount, assessmentCount, driveCount, segCount] = await Promise.all([
      User.countDocuments({ institutionId, role: 'student', isActive: true }),
      User.countDocuments({ institutionId, role: 'faculty', isActive: true }),
      Course.countDocuments({ institutionId }),
      Assessment.countDocuments({ institutionId }),
      DriveEvent.countDocuments({ institutionId }),
      SkillEvidenceGraph.countDocuments({ institutionId }),
    ]);

    const placementStats = await User.aggregate([
      { $match: { institutionId, role: 'student' } },
      { $group: { _id: '$student.placementStatus', count: { $sum: 1 } } },
    ]);

    res.json({
      institution: req.user.institutionId,
      stats: { studentCount, facultyCount, courseCount, assessmentCount, driveCount, segCount },
      placementStats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudents(req, res, next) {
  try {
    const institutionId = req.user.institutionId._id || req.user.institutionId;
    const { branch, year, page = 1, limit = 20, search } = req.query;

    const filter = { institutionId, role: 'student', isActive: true };
    if (branch) filter['student.branch'] = branch;
    if (year) filter['student.year'] = Number(year);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'student.rollNo': { $regex: search, $options: 'i' } },
      ];
    }

    const [students, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      students,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFullStudentProfile(req, res, next) {
  try {
    const studentId = req.params.id;

    const { aggregateFullStudentProfile } = await import('../aggregations/fullStudentProfile.js');
    const studentProfile = await aggregateFullStudentProfile(studentId);

    if (!studentProfile) return res.status(404).json({ error: 'Student not found' });

    // Restructure to match previous format for frontend compatibility
    const { seg, submissions, attendance, courses, notifications, ...student } = studentProfile;

    res.json({ student, seg, submissions, attendance, courses, notifications });
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const studentId = req.params.id;
    const updates = req.body;

    const before = await User.findById(studentId).select('-passwordHash').lean();
    if (!before) return res.status(404).json({ error: 'Student not found' });

    const allowedFields = ['student.year', 'student.semester', 'student.branch', 'student.cgpa', 'student.placementStatus', 'student.placedAt', 'isActive'];
    const safeUpdates = {};
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) safeUpdates[key] = updates[key];
    }

    const after = await User.findByIdAndUpdate(studentId, safeUpdates, { new: true }).select('-passwordHash');

    await AuditLog.create({
      adminId: req.user._id,
      action: 'update_student',
      targetType: 'User',
      targetId: studentId,
      before,
      after: after.toObject(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ student: after, message: 'Student updated' });
  } catch (error) {
    next(error);
  }
}

export async function getPlacementCC(req, res, next) {
  try {
    const institutionId = req.user.institutionId._id || req.user.institutionId;

    const { aggregatePlacementCC } = await import('../aggregations/placementCC.js');
    const { pipeline, totalDrives, drives } = await aggregatePlacementCC(institutionId);

    res.json({ drives, pipeline, totalDrives });
  } catch (error) {
    next(error);
  }
}

export async function createDrive(req, res, next) {
  try {
    const drive = await DriveEvent.create({
      ...req.body,
      institutionId: req.user.institutionId._id || req.user.institutionId,
    });

    res.status(201).json({ drive, message: 'Drive created' });
  } catch (error) {
    next(error);
  }
}

export async function moveStage(req, res, next) {
  try {
    const { driveId, studentId, newStage, notes } = req.body;

    const drive = await DriveEvent.findById(driveId);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });

    const registration = drive.registrations.find((r) => String(r.studentId) === studentId);
    if (!registration) return res.status(404).json({ error: 'Registration not found' });

    registration.stageHistory.push({
      stage: newStage,
      movedAt: new Date(),
      movedBy: req.user._id,
      notes: notes || '',
    });
    registration.stage = newStage;
    await drive.save();

    req.io.to(`student:${studentId}`).emit('placement:stage-moved', {
      driveId, studentId, newStage, company: drive.company,
    });

    await Notification.create({
      userId: studentId,
      type: 'stage_moved',
      title: 'Placement Stage Updated',
      body: `Your application for ${drive.company} has moved to: ${newStage}`,
      metadata: { driveId, stage: newStage },
    });

    res.json({ message: 'Stage moved', registration });
  } catch (error) {
    next(error);
  }
}

export async function generateNAACReport(req, res, next) {
  try {
    const institutionId = req.user.institutionId._id || req.user.institutionId;

    const { runNAACReport } = await import('../agents/09-naacReport.js');
    const result = await runNAACReport({
      institutionId,
      userId: req.user._id,
      reportType: 'NAAC',
    });

    res.json({
      report: result.report,
      agentRunId: result.agentRunId,
      message: 'NAAC report generated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const institutionId = req.user.institutionId._id || req.user.institutionId;

    const [skillDistribution, branchStats] = await Promise.all([
      SkillEvidenceGraph.aggregate([
        { $match: { institutionId } },
        { $group: { _id: '$skillCategory', count: { $sum: 1 }, avgConfidence: { $avg: '$confidenceScore' } } },
      ]),
      User.aggregate([
        { $match: { institutionId, role: 'student' } },
        { $group: { _id: '$student.branch', count: { $sum: 1 }, avgCGPA: { $avg: '$student.cgpa' } } },
      ]),
    ]);

    res.json({ skillDistribution, branchStats });
  } catch (error) {
    next(error);
  }
}

export async function getSkillLedger(req, res, next) {
  try {
    const institutionId = req.user.institutionId._id || req.user.institutionId;

    const ledger = await SkillEvidenceGraph.aggregate([
      { $match: { institutionId } },
      {
        $group: {
          _id: '$skillId',
          skillLabel: { $first: '$skillLabel' },
          skillCategory: { $first: '$skillCategory' },
          avgConfidence: { $avg: '$confidenceScore' },
          maxConfidence: { $max: '$confidenceScore' },
          evidenceCount: { $sum: 1 },
          studentCount: { $addToSet: '$studentId' },
        },
      },
      { $addFields: { studentCount: { $size: '$studentCount' } } },
      { $sort: { avgConfidence: -1 } },
    ]);

    res.json({ ledger });
  } catch (error) {
    next(error);
  }
}
