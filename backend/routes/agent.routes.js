import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import AgentRun from '../models/AgentRun.js';

const router = Router();

router.use(protect, requireRole('admin'));

router.get('/status', async (req, res, next) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalRuns, successRuns, failedRuns, recentRuns, agentStats] = await Promise.all([
      AgentRun.countDocuments({}),
      AgentRun.countDocuments({ status: 'success' }),
      AgentRun.countDocuments({ status: 'failed' }),
      AgentRun.find({ createdAt: { $gte: oneDayAgo } })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('agentName status durationMs tokensUsed createdAt'),
      AgentRun.aggregate([
        { $group: {
          _id: '$agentName',
          totalRuns: { $sum: 1 },
          avgDuration: { $avg: '$durationMs' },
          totalTokens: { $sum: '$tokensUsed.total' },
          lastRun: { $max: '$createdAt' },
          successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          failedCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        }},
        { $sort: { totalRuns: -1 } },
      ]),
    ]);

    res.json({
      overview: {
        totalRuns,
        successRuns,
        failedRuns,
        successRate: totalRuns > 0 ? ((successRuns / totalRuns) * 100).toFixed(1) : 0,
      },
      agentStats,
      recentRuns,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/runs', async (req, res, next) => {
  try {
    const { agentName, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (agentName) filter.agentName = agentName;
    if (status) filter.status = status;

    const [runs, total] = await Promise.all([
      AgentRun.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('triggeredBy', 'name email role'),
      AgentRun.countDocuments(filter),
    ]);

    res.json({
      runs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/runs/:runId', async (req, res, next) => {
  try {
    const run = await AgentRun.findById(req.params.runId)
      .populate('triggeredBy', 'name email role');

    if (!run) {
      return res.status(404).json({ error: 'Agent run not found' });
    }

    res.json({ run });
  } catch (error) {
    next(error);
  }
});

export default router;
