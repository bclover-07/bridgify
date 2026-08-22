import mongoose from 'mongoose';

const technologyDemandSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter ID is required'],
    },
    skillTag: {
      type: String,
      required: [true, 'Skill tag is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    demandFrequency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    industry: { type: String, trim: true, default: '' },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'any'],
      default: 'entry',
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

technologyDemandSchema.index({ skillTag: 1, demandFrequency: 1 });
technologyDemandSchema.index({ recruiterId: 1, createdAt: -1 });

const TechnologyDemand = mongoose.model('TechnologyDemand', technologyDemandSchema);
export default TechnologyDemand;
