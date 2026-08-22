import mongoose from 'mongoose';

const facultyResourceSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: 300,
    },
    sourceType: {
      type: String,
      enum: ['youtube', 'pdf', 'text', 'url', 'upload'],
      required: true,
    },
    sourceUrl: { type: String, trim: true, default: '' },
    sourceRef: { type: String, trim: true, default: '' },
    contentMarkdown: { type: String, default: '' },
    contentHtml: { type: String, default: '' },
    taggedSkills: [{ type: String }],
    depthLevel: {
      type: String,
      enum: ['overview', 'standard', 'deep_dive'],
      default: 'standard',
    },
    style: {
      type: String,
      enum: ['academic', 'conversational', 'visual', 'practical'],
      default: 'academic',
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'mr', 'te', 'ta'],
      default: 'en',
    },
    isPublished: { type: Boolean, default: false },
    cohortIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    practiceQuestions: [
      {
        question: { type: String, trim: true },
        answer: { type: String, trim: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
      },
    ],
    keyTerms: [
      {
        term: { type: String, trim: true },
        definition: { type: String, trim: true },
      },
    ],
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

facultyResourceSchema.index({ facultyId: 1, isPublished: 1 });
facultyResourceSchema.index({ institutionId: 1, taggedSkills: 1 });

const FacultyResource = mongoose.model('FacultyResource', facultyResourceSchema);
export default FacultyResource;
