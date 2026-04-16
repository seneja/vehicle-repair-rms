'use strict';

const jwt        = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const User       = require('../models/User');
const Workshop   = require('../models/Workshop');

// Cache the mock workshop ID so we only hit the DB once per server start
let _cachedMockWSId = null;

// Configure JWKS client — caches signing keys to avoid repeated JWKS fetches
const client = jwksClient({
  jwksUri: process.env.ASGARDEO_JWKS_URL,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

/**
 * protect — validates the Bearer JWT via Asgardeo JWKS, then looks up the
 * corresponding MongoDB User document and attaches it to req.user.
 *
 * Controllers MUST use req.user._id (ObjectId), req.user.role, etc.
 * Raw JWT claims are available on req.jwtClaims if needed.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // ⚠️ DEVELOPMENT BYPASS: Multi-Role Mock Logic
  if (token && token.startsWith('mock-')) {
    let role = token.split('-').slice(1).join('-'); // e.g., customer, admin, workshop_owner, workshop_staff
    if (token.startsWith('mock-staff-')) {
      role = 'workshop_staff';
    }
    const mockEmail = token.startsWith('mock-staff-') ? token.replace('mock-staff-', '') : `${role}@bypass.com`;

    try {
      // 1. Try to find the seeded mock user first
      const dbUser = await User.findOne({ asgardeoSub: token });
      if (dbUser) {
        req.jwtClaims = { sub: token, email: dbUser.email, name: dbUser.fullName };
        req.user = dbUser;
        return next();
      }
    } catch (e) {
      console.warn('[auth] Mock DB lookup failed, falling back to in-memory mock');
    }

    // 2. Fallback to in-memory mock if DB lookup fails (e.g. not seeded yet)
    let mockWSId = _cachedMockWSId || '607f1f77bcf86cd799439012';
    if (!_cachedMockWSId) {
      try {
        const liveWS = await Workshop.findOne({ active: true }).select('_id');
        if (liveWS) {
          _cachedMockWSId = liveWS._id.toString();
          mockWSId = _cachedMockWSId;
        }
      } catch (e) {}
    }

    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      asgardeoSub: token,
      email: mockEmail,
      fullName: `${role.charAt(0).toUpperCase() + role.slice(1)} Bypass`,
      role: role,
      active: true,
      workshopId: (role === 'workshop_owner' || role === 'workshop_staff') ? mockWSId : undefined,
    };
    
    req.jwtClaims = { sub: token, email: mockEmail, name: mockUser.fullName };
    req.user = mockUser;
    return next();
  }

  const options = {
    algorithms: ['RS256'],
    issuer: process.env.ASGARDEO_ISSUER,
  };

  if (process.env.ASGARDEO_AUDIENCE) {
    options.audience = process.env.ASGARDEO_AUDIENCE;
  }

  jwt.verify(token, getKey, options, async (err, decoded) => {
    if (err) {
      console.error('[auth] JWT verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    try {
      const user = await User.findOne({ asgardeoSub: decoded.sub });
      if (!user) {
        return res.status(401).json({
          error: 'User not registered — call /api/v1/auth/sync-profile first',
        });
      }
      if (!user.active) {
        return res.status(403).json({ error: 'Account deactivated' });
      }
      req.jwtClaims = decoded; // raw claims for sync-profile use
      req.user      = user;    // Mongoose User document
      next();
    } catch (dbErr) {
      next(dbErr);
    }
  });
};

/**
 * requireAuth — alias kept for backward compatibility with existing server.js references.
 */
const requireAuth = protect;

module.exports = { protect, requireAuth };
