const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Configure JWKS client to fetch public keys from Asgardeo
const client = jwksClient({
  jwksUri: process.env.ASGARDEO_JWKS_URL,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

// Helper function to get the signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Middleware to protect routes that require Asgardeo Authentication
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  // Options for verification
  const options = {
    algorithms: ['RS256'],
    issuer: process.env.ASGARDEO_ISSUER,
  };
  
  // Optional: audience validation if client id is configured securely
  if (process.env.ASGARDEO_AUDIENCE) {
    options.audience = process.env.ASGARDEO_AUDIENCE;
  }

  jwt.verify(token, getKey, options, (err, decoded) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
        error: err.message,
      });
    }

    // Attach decoded user claims to request for downstream controllers
    req.user = decoded;
    next();
  });
};

module.exports = {
  requireAuth,
};
