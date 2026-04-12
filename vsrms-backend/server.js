'use strict';

const dotenv = require('dotenv');
dotenv.config();

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const mongoSanitize  = require('express-mongo-sanitize');

const connectDB              = require('./src/config/db');
const { globalErrorHandler } = require('./src/middleware/errorHandler');
const { apiLimiter }         = require('./src/middleware/rateLimiter');

const authRoutes        = require('./src/routes/auth.route');
const vehicleRoutes     = require('./src/routes/vehicle.route');
const workshopRoutes    = require('./src/routes/workshop.route');
const appointmentRoutes = require('./src/routes/appointment.route');
const recordRoutes      = require('./src/routes/record.route');
const reviewRoutes      = require('./src/routes/review.route');

// ── App ──────────────────────────────────────────────────────────────────────
const app = express();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.disable('x-powered-by');

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:8081', 'http://localhost:19006'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin (mobile apps, Postman, curl)
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

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Strip MongoDB operator injection from req.body only.
// express-mongo-sanitize cannot reassign req.query in Express 5 (read-only getter),
// so we call mongoSanitize.sanitize() directly on the body object instead.
app.use((req, _res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  next();
});

// Apply rate limiter to all /api/v1 routes
app.use('/api/v1', apiLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'VSRMS API' }));
app.get('/',       (_req, res) => res.json({ status: 'ok', service: 'VSRMS API' }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',         authRoutes);
app.use('/api/v1/vehicles',     vehicleRoutes);
app.use('/api/v1/workshops',    workshopRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/records',      recordRoutes);
app.use('/api/v1/reviews',      reviewRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(globalErrorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(` VSRMS API running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`),
  );
});

module.exports = app;
