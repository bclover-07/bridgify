import mongoose from 'mongoose';

const agentRunSchema = new mongoose.Schema(
  {
    agentName: {
      type: String,
      required: [true, 'Agent name is required'],
      trim: true,
    },
    otariRouteTag: {
      type: String,
      required: true,
      trim: true,
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    nodesExecuted: [
      {
        nodeName: { type: String, required: true },
        durationMs: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ['success', 'failed', 'skipped'],
          default: 'success',
        },
        error: { type: String, default: '' },
      },
    ],
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    modelUsed: { type: String, trim: true, default: '' },
    tokensUsed: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['running', 'success', 'failed', 'retried'],
      default: 'running',
    },
    durationMs: { type: Number, default: 0 },
    error: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

agentRunSchema.index({ agentName: 1, createdAt: -1 });
agentRunSchema.index({ triggeredBy: 1, createdAt: -1 });
agentRunSchema.index({ status: 1 });

const AgentRun = mongoose.model('AgentRun', agentRunSchema);
export default AgentRun;
