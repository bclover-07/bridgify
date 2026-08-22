import Bottleneck from 'bottleneck';

const authLimiter = new Bottleneck({
  reservoir: 20,
  reservoirRefreshAmount: 20,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 5,
});

const aiLimiter = new Bottleneck({
  reservoir: 15,
  reservoirRefreshAmount: 15,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 3,
  minTime: 1000,
});

const generalLimiter = new Bottleneck({
  reservoir: 100,
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 20,
});

function createRateLimitMiddleware(limiter, name = 'general') {
  return async (req, res, next) => {
    try {
      await limiter.schedule(() => Promise.resolve());
      next();
    } catch (error) {
      console.warn(`Rate limit hit on ${name} for IP ${req.ip}`);
      res.status(429).json({
        error: 'Too many requests. Please try again shortly.',
        retryAfter: 60,
      });
    }
  };
}

export const authRateLimit = createRateLimitMiddleware(authLimiter, 'auth');
export const aiRateLimit = createRateLimitMiddleware(aiLimiter, 'ai');
export const generalRateLimit = createRateLimitMiddleware(generalLimiter, 'general');

export function getAILimiter() {
  return aiLimiter;
}

export default { authRateLimit, aiRateLimit, generalRateLimit, getAILimiter };
