import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stage: {
      type: String,
      enum: ['not_ready', 'ready', 'applied', 'shortlisted', 'interview', 'offered', 'placed', 'rejected'],
      default: 'applied',
    },
    stageHistory: [
      {
        stage: { type: String },
        movedAt: { type: Date, default: Date.now },
        movedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String, trim: true, default: '' },
      },
    ],
    feedback: { type: String, trim: true, default: '' },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const roleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    package: { type: String, trim: true, default: '' },
    requiredSkills: [{ type: String }],
    minCGPA: { type: Number, min: 0, max: 10, default: 0 },
    branches: [{ type: String }],
    yearFilter: [{ type: Number }],
    positions: { type: Number, default: 1 },
  },
  { _id: true }
);

const driveEventSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyLogo: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    roles: [roleSchema],
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required'],
    },
    registrationDeadline: { type: Date },
    registrations: [registrationSchema],
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    driveType: {
      type: String,
      enum: ['on_campus', 'off_campus', 'virtual'],
      default: 'on_campus',
    },
  },
  {
    timestamps: true,
  }
);

driveEventSchema.index({ institutionId: 1, status: 1 });
driveEventSchema.index({ recruiterId: 1 });
driveEventSchema.index({ driveDate: 1 });

const DriveEvent = mongoose.model('DriveEvent', driveEventSchema);
export default DriveEvent;
