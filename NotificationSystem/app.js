/**
 * app.js
 * Express application — middleware, route mounting, error handling
 */

const express = require('express');
const logger  = require('./config/logger');

const app = express();
const cors = require('cors');
app.use(cors({ origin: '*' }));

const HealthRoutes = require('./routes/health');
const AlertRoutes  = require('./routes/alerts');
const TrunkRoutes  = require('./routes/trunks');
const NotificationRoutes = require('./routes/notifications');

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  logger.debug(`→ ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/health', HealthRoutes);
app.use('/alerts', AlertRoutes);
app.use('/trunks', TrunkRoutes);
app.use('/notifications', NotificationRoutes);  


// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

module.exports = app;

