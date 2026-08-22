import User from '../models/User.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import ProblemStatement from '../models/ProblemStatement.js';
import DriveEvent from '../models/DriveEvent.js';
import Notification from '../models/Notification.js';
import { verifyShareToken } from '../utils/tokens.js';
import { getSkill, getRoleSkills, getImportanceWeight } from '../utils/skillTaxonomy.js';

export async function getDashboard(req, res, next) {
  try {
    const recruiterId = req.user._id;

    const [psList, shortlisted, drives, savedSearches] = await Promise.all([
      ProblemStatement.find({ recruiterId }).sort({ createdAt: -1 }).limit(5),
      User.find({ _id: { $in: req.user.recruiter?.shortlistedStudents || [] } })
        .select('name email student.branch student.cgpa'),
      DriveEvent.find({ recruiterId }).sort({ driveDate: -1 }).limit(5).select('company driveDate status'),
      Promise.resolve(req.user.recruiter?.savedSearches || []),
    ]);

    res.json({
      profile: { name: req.user.name, company: req.user.recruiter?.company, designation: req.user.recruiter?.designation },
      recentPS: psList,
      shortlisted,
      recentDrives: drives,
      savedSearches,
      stats: {
        totalPS: psList.length,
        shortlistedCount: shortlisted.length,
        totalDrives: drives.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function searchCandidates(req, res, next) {
  try {
    const { skills, minCGPA, branch, year, minConfidence = 50, limit = 50 } = req.body;

    const studentFilter = { role: 'student', isActive: true };
    if (branch) studentFilter['student.branch'] = branch;
    if (year) studentFilter['student.year'] = Number(year);
    if (minCGPA) studentFilter['student.cgpa'] = { $gte: Number(minCGPA) };

    const students = await User.find(studentFilter).select('name email student institutionId');

    const results = [];

    for (const student of students) {
      const segEntries = await SkillEvidenceGraph.find({
        studentId: student._id,
        ...(skills && skills.length > 0 ? { skillId: { $in: skills } } : {}),
        confidenceScore: { $gte: Number(minConfidence) },
      });

      if (skills && skills.length > 0 && segEntries.length === 0) continue;

      const skillMap = {};
      for (const entry of segEntries) {
        if (!skillMap[entry.skillId] || skillMap[entry.skillId] < entry.confidenceScore) {
          skillMap[entry.skillId] = entry.confidenceScore;
        }
      }

      const matchedSkills = Object.entries(skillMap).map(([skillId, score]) => ({
        skillId,
        label: getSkill(skillId)?.label || skillId,
        confidenceScore: score,
      }));

      const avgScore = matchedSkills.length > 0
        ? Math.round(matchedSkills.reduce((sum, s) => sum + s.confidenceScore, 0) / matchedSkills.length)
        : 0;

      results.push({
        studentId: student._id,
        name: student.name,
        email: student.email,
        branch: student.student?.branch,
        year: student.student?.year,
        cgpa: student.student?.cgpa,
        matchScore: avgScore,
        matchedSkills,
        totalEvidence: segEntries.length,
      });
    }

    results.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      candidates: results.slice(0, limit),
      total: results.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function semanticSearch(req, res, next) {
  try {
    const { jobDescription, limit = 20 } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const { embedText } = await import('../utils/embeddings.js');
    const { semanticCandidateSearch } = await import('../utils/vectorSearch.js');

    const queryEmbedding = await embedText(jobDescription);

    const vectorResults = await semanticCandidateSearch(queryEmbedding, {}, limit);

    const studentIds = vectorResults.map(r => r.studentId);
    const students = await User.find({ _id: { $in: studentIds } })
      .select('name email student.branch student.year student.cgpa institutionId');

    const studentMap = {};
    for (const s of students) {
      studentMap[String(s._id)] = s;
    }

    const candidates = vectorResults.map(r => {
      const student = studentMap[String(r.studentId)];
      if (!student) return null;
      return {
        studentId: r.studentId,
        name: student.name,
        email: student.email,
        branch: student.student?.branch,
        year: student.student?.year,
        cgpa: student.student?.cgpa,
        matchScore: r.matchScore,
        matchedSkills: r.matchedSkills,
        totalEvidence: r.count,
      };
    }).filter(Boolean);

    res.json({ candidates, total: candidates.length });
  } catch (error) {
    next(error);
  }
}

export async function saveSearch(req, res, next) {
  try {
    const { name, query } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      $push: { 'recruiter.savedSearches': { name, query, createdAt: new Date() } },
    });

    res.json({ message: 'Search saved' });
  } catch (error) {
    next(error);
  }
}

export async function shortlistCandidate(req, res, next) {
  try {
    const { studentId } = req.body;

    const isAlready = req.user.recruiter?.shortlistedStudents?.some((s) => String(s) === studentId);
    if (isAlready) {
      return res.status(409).json({ error: 'Already shortlisted' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { 'recruiter.shortlistedStudents': studentId },
    });

    await Notification.create({
      userId: studentId,
      type: 'shortlisted',
      title: 'You\'ve been shortlisted',
      body: `${req.user.recruiter?.company || req.user.name} has shortlisted you.`,
      metadata: { recruiterId: req.user._id },
    });

    req.io.to(`student:${studentId}`).emit('notification:new', {
      type: 'shortlisted',
      company: req.user.recruiter?.company,
    });

    res.json({ message: 'Candidate shortlisted' });
  } catch (error) {
    next(error);
  }
}

export async function getSharedProfile(req, res, next) {
  try {
    const { shareToken } = req.params;

    const decoded = verifyShareToken(shareToken);
    const studentId = decoded.studentId;

    const student = await User.findById(studentId).select('name student.branch student.year student.cgpa');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const segEntries = await SkillEvidenceGraph.find({
      studentId,
      $or: [
        { 'sharedWith.accessToken': shareToken },
        { sharedWith: { $size: 0 } },
      ],
    })
      .select('skillId skillLabel skillCategory confidenceScore evidenceType verifiedAt verificationMethod')
      .sort({ confidenceScore: -1 });

    await SkillEvidenceGraph.updateMany(
      { studentId, 'sharedWith.accessToken': shareToken },
      { $set: { 'sharedWith.$.accessedAt': new Date() } }
    );

    res.json({
      student: {
        name: student.name,
        branch: student.student?.branch,
        year: student.student?.year,
        cgpa: student.student?.cgpa,
      },
      skills: segEntries,
      viewedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired share link' });
    }
    next(error);
  }
}

export async function generatePS(req, res, next) {
  try {
    const { rawIdea } = req.body;
    if (!rawIdea) return res.status(400).json({ error: 'Raw idea is required' });

    const institutionId = req.user.institutionId?._id || req.user.institutionId;

    const { runPSGenerator } = await import('../agents/08-psGenerator.js');
    const result = await runPSGenerator({
      input: { idea: rawIdea },
      userId: req.user._id,
      institutionId,
    });

    res.status(201).json({
      problemStatement: result.problemStatement,
      agentRunId: result.agentRunId,
      message: 'Problem statement generated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getPS(req, res, next) {
  try {
    const psList = await ProblemStatement.find({ recruiterId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ problemStatements: psList });
  } catch (error) {
    next(error);
  }
}

export async function updatePS(req, res, next) {
  try {
    const ps = await ProblemStatement.findOneAndUpdate(
      { _id: req.params.id, recruiterId: req.user._id },
      req.body,
      { new: true }
    );
    if (!ps) return res.status(404).json({ error: 'Problem statement not found' });
    res.json({ problemStatement: ps });
  } catch (error) {
    next(error);
  }
}

export async function publishPS(req, res, next) {
  try {
    const ps = await ProblemStatement.findOneAndUpdate(
      { _id: req.params.id, recruiterId: req.user._id },
      { status: 'published' },
      { new: true }
    );
    if (!ps) return res.status(404).json({ error: 'Problem statement not found' });
    res.json({ problemStatement: ps, message: 'Problem statement published' });
  } catch (error) {
    next(error);
  }
}

export async function submitFeedback(req, res, next) {
  try {
    const { driveId } = req.params;
    const { studentId, feedback, skillSignals } = req.body;

    const drive = await DriveEvent.findById(driveId);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });

    const registration = drive.registrations.find((r) => String(r.studentId) === studentId);
    if (registration) {
      registration.feedback = feedback;
      await drive.save();
    }

    if (skillSignals && Array.isArray(skillSignals)) {
      for (const signal of skillSignals) {
        const skillData = getSkill(signal.skillId);
        if (!skillData) continue;

        await SkillEvidenceGraph.create({
          studentId,
          institutionId: drive.institutionId,
          skillId: skillData.id,
          skillLabel: skillData.label,
          skillCategory: skillData.category,
          skillDomain: skillData.domain,
          nsqfLevel: skillData.nsqf,
          evidenceType: 'recruiter_feedback',
          evidenceSourceRef: drive._id,
          evidenceMetadata: { driveId, company: drive.company, feedback: signal.feedback },
          confidenceScore: signal.score || 50,
          decayRate: 0.02,
          lastReinforced: new Date(),
          evidenceWeight: 0.9,
          verifierId: req.user._id,
          verifiedAt: new Date(),
          verificationMethod: 'ai_evaluated',
          embedding: [],
        });
      }

      req.io.to(`student:${studentId}`).emit('seg:updated', {
        studentId,
        source: 'recruiter_feedback',
        company: drive.company,
      });
    }

    await Notification.create({
      userId: studentId,
      type: 'feedback_received',
      title: 'New Feedback from Recruiter',
      body: `${req.user.recruiter?.company || req.user.name} has provided feedback on your performance.`,
      metadata: { driveId, recruiterId: req.user._id },
    });

    res.json({ message: 'Feedback submitted and SEG updated' });
  } catch (error) {
    next(error);
  }
}

export async function getFairHiring(req, res, next) {
  try {
    const { driveId } = req.params;
    const drive = await DriveEvent.findById(driveId).populate('registrations.studentId', 'student.branch student.cgpa name');

    if (!drive) return res.status(404).json({ error: 'Drive not found' });

    const branchDistribution = {};
    const stageDistribution = {};

    for (const reg of drive.registrations) {
      const branch = reg.studentId?.student?.branch || 'Unknown';
      branchDistribution[branch] = (branchDistribution[branch] || 0) + 1;
      stageDistribution[reg.stage] = (stageDistribution[reg.stage] || 0) + 1;
    }

    res.json({
      driveId,
      company: drive.company,
      totalRegistrations: drive.registrations.length,
      branchDistribution,
      stageDistribution,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMarketplace(req, res, next) {
  try {
    const psList = await ProblemStatement.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .populate('recruiterId', 'name recruiter.company');
    res.json({ problemStatements: psList });
  } catch (error) {
    next(error);
  }
}
