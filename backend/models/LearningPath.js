import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skillId: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  mcqs: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctIndex: { type: Number, required: true },
      explanation: { type: String, default: '' },
      answered: { type: Boolean, default: false },
      userAnswer: { type: Number, default: -1 },
      isCorrect: { type: Boolean, default: false },
    },
  ],
  codingTask: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    starterCode: { type: String, default: '' },
    solutionCode: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    userCode: { type: String, default: '' },
  },
});

const milestoneSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  topics: [topicSchema],
});

const learningPathSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    targetRole: { type: String, required: true },
    interests: [{ type: String }],
    activePathTitle: { type: String, required: true },
    generatedPaths: [
      {
        pathId: { type: String, required: true },
        title: { type: String, required: true },
        focus: { type: String, required: true },
        description: { type: String, default: '' },
        estimatedWeeks: { type: Number, default: 6 },
        milestones: [milestoneSchema],
      },
    ],
    selectedPathId: { type: String, default: '' },
    milestones: [milestoneSchema],
    progressPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

learningPathSchema.index({ studentId: 1, targetRole: 1 });

const LearningPath = mongoose.model('LearningPath', learningPathSchema);
export default LearningPath;
