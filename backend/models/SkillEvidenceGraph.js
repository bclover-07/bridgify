import mongoose from 'mongoose';

const skillEvidenceGraphSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution ID is required'],
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    skillId: {
      type: String,
      required: [true, 'Skill ID is required'],
      trim: true,
    },
    skillLabel: {
      type: String,
      required: [true, 'Skill label is required'],
      trim: true,
    },
    skillCategory: {
      type: String,
      required: true,
      enum: ['technical', 'soft', 'domain'],
    },
    skillDomain: {
      type: String,
      required: true,
      trim: true,
    },
    nsqfLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 4,
    },
    evidenceType: {
      type: String,
      required: [true, 'Evidence type is required'],
      enum: [
        'assessment',
        'project_submission',
        'faculty_endorsement',
        'recruiter_feedback',
        'mock_interview',
        'debate_performance',
        'github_analysis',
        'linkedin_sync',
        'peer_review',
        'self_assessment',
        'study_plan_completion',
      ],
    },
    evidenceSourceRef: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    evidenceUrl: {
      type: String,
      trim: true,
      default: '',
    },
    evidenceMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    decayRate: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.05,
    },
    lastReinforced: {
      type: Date,
      default: Date.now,
    },
    evidenceWeight: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    verifierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationMethod: {
      type: String,
      enum: ['auto_graded', 'faculty_reviewed', 'ai_evaluated', 'peer_verified', 'self_declared', ''],
      default: '',
    },
    sharedWith: [
      {
        recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        expiresAt: { type: Date },
        accessToken: { type: String },
        accessedAt: { type: Date, default: null },
      },
    ],
    flagged: { type: Boolean, default: false },
    flagReason: { type: String, trim: true, default: '' },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    embedding: {
      type: [Number],
      default: [],
      validate: {
        validator: function (v) {
          return v.length === 0 || v.length === 384;
        },
        message: 'Embedding must be empty or exactly 384 dimensions',
      },
    },
  },
  {
    timestamps: true,
  }
);

skillEvidenceGraphSchema.index({ studentId: 1, skillId: 1 });
skillEvidenceGraphSchema.index({ institutionId: 1, skillCategory: 1, confidenceScore: -1 });
skillEvidenceGraphSchema.index({ courseId: 1, skillId: 1, studentId: 1 });
skillEvidenceGraphSchema.index({ evidenceType: 1, createdAt: -1 });

const SkillEvidenceGraph = mongoose.model('SkillEvidenceGraph', skillEvidenceGraphSchema);
export default SkillEvidenceGraph;
