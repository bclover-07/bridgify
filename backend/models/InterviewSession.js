import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    skillFocus: { type: String, trim: true, default: '' },
    audioUrl: { type: String, trim: true, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  },
  { _id: true }
);

const interviewAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId },
    transcript: { type: String, trim: true, default: '' },
    audioUrl: { type: String, trim: true, default: '' },
    mediapipeSignals: {
      eyeContact: { type: Number, min: 0, max: 100, default: 0 },
      posture: { type: Number, min: 0, max: 100, default: 0 },
      gesture: { type: Number, min: 0, max: 100, default: 0 },
      engagement: { type: Number, min: 0, max: 100, default: 0 },
      nervousness: { type: Number, min: 0, max: 100, default: 0 },
    },
    scores: {
      technical: { type: Number, min: 0, max: 100, default: 0 },
      communication: { type: Number, min: 0, max: 100, default: 0 },
      problemSolving: { type: Number, min: 0, max: 100, default: 0 },
    },
    feedback: { type: String, trim: true, default: '' },
    durationMs: { type: Number, default: 0 },
  },
  { _id: true }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    targetRole: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['preparing', 'in_progress', 'completed', 'cancelled'],
      default: 'preparing',
    },
    questions: [interviewQuestionSchema],
    answers: [interviewAnswerSchema],
    report: {
      technicalScore: { type: Number, min: 0, max: 100, default: 0 },
      communicationScore: { type: Number, min: 0, max: 100, default: 0 },
      bodyLanguageScore: { type: Number, min: 0, max: 100, default: 0 },
      problemSolvingScore: { type: Number, min: 0, max: 100, default: 0 },
      overallScore: { type: Number, min: 0, max: 100, default: 0 },
      feedback: { type: String, trim: true, default: '' },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
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

interviewSessionSchema.index({ studentId: 1, createdAt: -1 });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;
