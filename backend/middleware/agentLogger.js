import AgentRun from '../models/AgentRun.js';

/**
 * Middleware to log API requests that trigger agents.
 */
export const agentLogger = (agentName) => {
  return async (req, res, next) => {
    // We attach the start time to the request
    req.agentStartTime = Date.now();
    req.agentName = agentName;
    console.log(`[Agent: ${agentName}] Triggered by user ${req.user?._id || 'unknown'} at ${new Date().toISOString()}`);
    next();
  };
};
