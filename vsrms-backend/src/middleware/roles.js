'use strict';

/**
 * Role-based access control middleware.
 * Must be used AFTER the protect middleware (auth.js) so req.user is set.
 *
 * Usage: router.post('/', protect, requireRole('admin'), controller)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden — insufficient role' });
  }
  next();
};

module.exports = { requireRole };
