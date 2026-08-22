import mongoose from 'mongoose';

const debateRoundSchema = new mongoose.Schema(
  {
    roundNumber: { type: Number, required: true },
    roundType: {
      type: String,
      enum: ['opening', 'rebuttal', 'cross_examination', 'closing'],
      required: true,
    },
    studentTurn: {
      text: { type: String, trim: true, default: '' },
      audioUrl: { type: String, trim: true, default: '' },
      transcript: { type: String, trim: true, default: '' },
      durationMs: { type: Number, default: 0 },
    },
    aiTurn: {
      text: { type: String, trim: true, default: '' },
      audioUrl: { type: String, trim: true, default: '' },
    },
    analysis: {
      argumentStrength: { type: Number, min: 0, max: 100, default: 0 },
      evidenceUsage: { type: Number, min: 0, max: 100, default: 0 },
      logicalCoherence: { type: Number, min: 0, max: 100, default: 0 },
      counterArgumentQuality: { type: Number, min: 0, max: 100, default: 0 },
      feedback: { type: String, trim: true, default: '' },
    },
  },
  { _id: true }
);

const debateSessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    topic: {
      type: String,
      required: [true, 'Debate topic is required'],
      trim: true,
    },
    side: {
      type: String,
      enum: ['for', 'against'],
      required: [true, 'Debate side is required'],
    },
    status: {
      type: String,
      enum: ['preparing', 'in_progress', 'completed', 'cancelled'],
      default: 'preparing',
    },
    rounds: [debateRoundSchema],
    finalVerdict: {
      winner: { type: String, enum: ['student', 'ai', 'draw'], default: 'draw' },
      reasoning: { type: String, trim: true, default: '' },
    },
    scores: {
      argumentation: { type: Number, min: 0, max: 100, default: 0 },
      criticalThinking: { type: Number, min: 0, max: 100, default: 0 },
      communication: { type: Number, min: 0, max: 100, default: 0 },
      evidenceUsage: { type: Number, min: 0, max: 100, default: 0 },
      overallScore: { type: Number, min: 0, max: 100, default: 0 },
    },
    segWritten: { type: Boolean, default: false },
    agentRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgentRun',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

debateSessionSchema.index({ studentId: 1, createdAt: -1 });

const DebateSession = mongoose.model('DebateSession', debateSessionSchema);
export default DebateSession;
