import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id)
      .select('-passwordHash')
      .populate('institutionId', 'name code');

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      error: `Access denied. Required role: ${roles.join(' or ')}`,
    });
  };
};

export const requireSameInstitution = (paramField = 'studentId') => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'recruiter') return next();

      const targetId = req.params[paramField] || req.body[paramField];
      if (!targetId) return next();

      const target = await User.findById(targetId).select('institutionId');
      if (!target) {
        return res.status(404).json({ error: 'Target not found' });
      }

      const userInstitutionId = req.user.institutionId?._id || req.user.institutionId;
      if (String(target.institutionId) !== String(userInstitutionId)) {
        return res.status(403).json({ error: 'Cross-institution access denied' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
