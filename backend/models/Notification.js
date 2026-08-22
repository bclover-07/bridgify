import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'assessment_published',
        'assessment_graded',
        'seg_updated',
        'dropout_alert',
        'interview_complete',
        'debate_complete',
        'drive_posted',
        'shortlisted',
        'stage_moved',
        'feedback_received',
        'study_plan_ready',
        'nudge',
        'system',
      ],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Notification body is required'],
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
