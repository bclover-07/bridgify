import mongoose from 'mongoose';

const problemStatementSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter ID is required'],
    },
    rawIdea: {
      type: String,
      required: [true, 'Raw idea is required'],
      trim: true,
    },
    refined: {
      title: { type: String, trim: true, default: '' },
      background: { type: String, trim: true, default: '' },
      objective: { type: String, trim: true, default: '' },
      constraints: [{ type: String }],
      deliverables: [{ type: String }],
      skillsRequired: [{ type: String }],
      evaluationRubric: [
        {
          criterion: { type: String, trim: true },
          weight: { type: Number, min: 0, max: 100 },
          description: { type: String, trim: true, default: '' },
        },
      ],
      estimatedHours: { type: Number, min: 0, default: 0 },
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'assigned', 'completed'],
      default: 'draft',
    },
    targetInstitutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      default: null,
    },
    assignedCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    embedding: {
      type: [Number],
      default: [],
    },
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

problemStatementSchema.index({ recruiterId: 1, status: 1 });
problemStatementSchema.index({ status: 1, targetInstitutionId: 1 });

const ProblemStatement = mongoose.model('ProblemStatement', problemStatementSchema);
export default ProblemStatement;
