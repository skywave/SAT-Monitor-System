/**
 * app.js
 * Express application — middleware, route mounting, error handling
 */

const express = require('express');
const logger  = require('./config/logger');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  logger.debug(`→ ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health',        require('./routes/health'));
app.use('/api/alerts',        require('./routes/alerts'));
app.use('/api/trunks',        require('./routes/trunks'));
// app.use('/api/notifications', require('./routes/notifications'));

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
