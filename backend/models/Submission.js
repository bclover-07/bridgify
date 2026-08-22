import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    response: { type: String, trim: true, default: '' },
    fileUrl: { type: String, trim: true, default: '' },
    autoScore: { type: Number, min: 0, default: null },
    manualScore: { type: Number, min: 0, default: null },
    finalScore: { type: Number, min: 0, default: null },
    feedback: { type: String, trim: true, default: '' },
    skillScores: [
      {
        skillId: { type: String },
        score: { type: Number, min: 0, max: 100 },
      },
    ],
  },
  { _id: true }
);

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: [true, 'Assessment ID is required'],
    },
    answers: [answerSchema],
    totalScore: { type: Number, min: 0, default: 0 },
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    gradingStatus: {
      type: String,
      enum: ['submitted', 'auto_graded', 'faculty_review', 'final'],
      default: 'submitted',
    },
    submittedAt: { type: Date, default: Date.now },
    segEntriesCreated: { type: Boolean, default: false },
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

submissionSchema.index({ studentId: 1, assessmentId: 1 }, { unique: true });
submissionSchema.index({ assessmentId: 1, gradingStatus: 1 });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
