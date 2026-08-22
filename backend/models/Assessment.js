import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['mcq', 'short_answer', 'long_answer', 'code', 'true_false', 'fill_blank'],
    },
    options: [
      {
        text: { type: String, trim: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    correctAnswer: { type: String, trim: true, default: '' },
    rubric: { type: String, trim: true, default: '' },
    skillId: { type: String, required: true, trim: true },
    bloomLevel: {
      type: String,
      required: true,
      enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
    },
    maxMarks: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const assessmentSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty ID is required'],
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution ID is required'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
      maxlength: 200,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    questions: [questionSchema],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'medium',
    },
    dueDate: { type: Date, default: null },
    totalMarks: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    submissionCount: { type: Number, default: 0 },
    instructions: { type: String, trim: true, default: '' },
    duration: { type: Number, default: 60 },
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

assessmentSchema.index({ facultyId: 1, status: 1 });
assessmentSchema.index({ courseId: 1, status: 1 });
assessmentSchema.index({ institutionId: 1, createdAt: -1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
