'use strict';

const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

// Load env vars before anything else
dotenv.config();

const connectDB         = require('./src/config/db');
const { requireAuth }   = require('./src/middleware/auth.middleware');
const authRoutes        = require('./src/routes/auth.route');

// ── Database ────────────────────────────────────────────────────────────────
connectDB();

// ── App ─────────────────────────────────────────────────────────────────────
const app = express();

// ── Security middleware ──────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:8081', 'http://localhost:19006'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' is not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Remove x-powered-by header to avoid fingerprinting
app.disable('x-powered-by');

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'ok', service: 'VSRMS API' }));

// ── Public routes ────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);

// ── Protected routes ─────────────────────────────────────────────────────────
app.get('/api/v1/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// app.use('/api/v1/vehicles',     requireAuth, require('./src/routes/vehicles.route'));
// app.use('/api/v1/workshops',    requireAuth, require('./src/routes/workshops.route'));
// app.use('/api/v1/appointments', requireAuth, require('./src/routes/appointments.route'));
// app.use('/api/v1/records',      requireAuth, require('./src/routes/records.route'));
// app.use('/api/v1/reviews',      requireAuth, require('./src/routes/reviews.route'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[unhandled error]', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅  VSRMS API running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`));
