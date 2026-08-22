import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import { embedText, composeSEGEmbeddingText } from '../utils/embeddings.js';
import { getSkill } from '../utils/skillTaxonomy.js';
import { getIO } from '../config/socket.js';

/**
 * Create a single SEG evidence entry with embedding and socket emission.
 */
export async function createSEGEntry(entryData, emitSocket = true) {
  const embeddingText = composeSEGEmbeddingText(entryData);
  const embedding = await embedText(embeddingText);

  const entry = await SkillEvidenceGraph.create({
    ...entryData,
    embedding,
    lastReinforced: entryData.lastReinforced || new Date(),
  });

  if (emitSocket && entry.studentId) {
    try {
      const io = getIO();
      io.to(`student:${entry.studentId}`).emit('seg:updated', {
        studentId: String(entry.studentId),
        skillId: entry.skillId,
        skillLabel: entry.skillLabel,
        confidenceScore: entry.confidenceScore,
        evidenceType: entry.evidenceType,
        source: entry.evidenceType,
        timestamp: new Date().toISOString(),
      });
    } catch (socketErr) {
      console.error('SEG socket emission failed:', socketErr.message);
    }
  }

  return entry;
}

/**
 * Create multiple SEG entries from assessment grading results.
 * Each skill gets an evidence node with proper embedding.
 */
export async function createAssessmentSEGEntries({
  studentId,
  institutionId,
  courseId,
  assessmentId,
  assessmentTitle,
  submissionId,
  skillScoreMap,
  verifierId,
}) {
  const entries = [];

  for (const [skillId, data] of Object.entries(skillScoreMap)) {
    const skillData = getSkill(skillId);
    if (!skillData) continue;

    const confidenceScore = Math.round(data.total / data.count);

    const entry = await createSEGEntry({
      studentId,
      institutionId,
      courseId,
      skillId: skillData.id,
      skillLabel: skillData.label,
      skillCategory: skillData.category,
      skillDomain: skillData.domain,
      nsqfLevel: skillData.nsqf,
      evidenceType: 'assessment',
      evidenceSourceRef: submissionId,
      evidenceMetadata: {
        assessmentTitle,
        assessmentId,
        submissionId,
        rawScore: data.total / data.count,
        questionsAnswered: data.count,
      },
      confidenceScore,
      decayRate: 0.03,
      evidenceWeight: 0.8,
      verifierId,
      verifiedAt: new Date(),
      verificationMethod: 'faculty_reviewed',
    }, false);

    entries.push(entry);
  }

  if (entries.length > 0) {
    try {
      const io = getIO();
      io.to(`student:${studentId}`).emit('seg:updated', {
        studentId: String(studentId),
        source: 'assessment',
        assessmentTitle,
        skillsUpdated: entries.map(e => ({
          skillId: e.skillId,
          skillLabel: e.skillLabel,
          confidenceScore: e.confidenceScore,
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (socketErr) {
      console.error('Batch SEG socket emission failed:', socketErr.message);
    }
  }

  return entries;
}

/**
 * Create SEG entry from mock interview results.
 */
export async function createInterviewSEGEntries({
  studentId,
  institutionId,
  sessionId,
  skillScores,
  verifierId,
}) {
  const entries = [];

  for (const { skillId, score, feedback } of skillScores) {
    const skillData = getSkill(skillId);
    if (!skillData) continue;

    const entry = await createSEGEntry({
      studentId,
      institutionId,
      skillId: skillData.id,
      skillLabel: skillData.label,
      skillCategory: skillData.category,
      skillDomain: skillData.domain,
      nsqfLevel: skillData.nsqf,
      evidenceType: 'mock_interview',
      evidenceSourceRef: sessionId,
      evidenceMetadata: { sessionId, feedback },
      confidenceScore: Math.min(100, Math.max(0, score)),
      decayRate: 0.04,
      evidenceWeight: 0.7,
      verifierId,
      verifiedAt: new Date(),
      verificationMethod: 'ai_evaluated',
    });

    entries.push(entry);
  }

  return entries;
}

/**
 * Create SEG entry from debate performance.
 */
export async function createDebateSEGEntries({
  studentId,
  institutionId,
  sessionId,
  skillScores,
}) {
  const entries = [];

  for (const { skillId, score, feedback } of skillScores) {
    const skillData = getSkill(skillId);
    if (!skillData) continue;

    const entry = await createSEGEntry({
      studentId,
      institutionId,
      skillId: skillData.id,
      skillLabel: skillData.label,
      skillCategory: skillData.category,
      skillDomain: skillData.domain,
      nsqfLevel: skillData.nsqf,
      evidenceType: 'debate_performance',
      evidenceSourceRef: sessionId,
      evidenceMetadata: { sessionId, feedback },
      confidenceScore: Math.min(100, Math.max(0, score)),
      decayRate: 0.04,
      evidenceWeight: 0.65,
      verificationMethod: 'ai_evaluated',
    });

    entries.push(entry);
  }

  return entries;
}

/**
 * Create SEG entry from recruiter feedback.
 */
export async function createRecruiterFeedbackSEGEntries({
  studentId,
  institutionId,
  driveId,
  company,
  skillSignals,
  recruiterId,
}) {
  const entries = [];

  for (const signal of skillSignals) {
    const skillData = getSkill(signal.skillId);
    if (!skillData) continue;

    const entry = await createSEGEntry({
      studentId,
      institutionId,
      skillId: skillData.id,
      skillLabel: skillData.label,
      skillCategory: skillData.category,
      skillDomain: skillData.domain,
      nsqfLevel: skillData.nsqf,
      evidenceType: 'recruiter_feedback',
      evidenceSourceRef: driveId,
      evidenceMetadata: { driveId, company, feedback: signal.feedback },
      confidenceScore: signal.score || 50,
      decayRate: 0.02,
      evidenceWeight: 0.9,
      verifierId: recruiterId,
      verifiedAt: new Date(),
      verificationMethod: 'recruiter_verified',
    });

    entries.push(entry);
  }

  return entries;
}

export default {
  createSEGEntry,
  createAssessmentSEGEntries,
  createInterviewSEGEntries,
  createDebateSEGEntries,
  createRecruiterFeedbackSEGEntries,
};
