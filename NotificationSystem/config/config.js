require('dotenv').config();

module.exports = {

  // ── Collector ──────────────────────────────────────────────────────────────
  collector: {
    baseUrl: process.env.COLLECTOR_URL || 'http://localhost:3000',
    timeout: 10000,
  },

  // ── Polling ────────────────────────────────────────────────────────────────
  polling: {
    intervalMs: parseInt(process.env.POLL_INTERVAL_MS) || 30000,
  },

  // ── Alert Rules ────────────────────────────────────────────────────────────
  alerts: {
    consecutiveFailuresBeforeAlert: parseInt(process.env.CONSECUTIVE_FAILURES)   || 2,
    cooldownMinutes:                parseInt(process.env.ALERT_COOLDOWN_MINUTES) || 30,

    // Only 'registered' is healthy — everything else triggers an alert
    healthyStatuses: ['registered', "registering"],

    // All non-healthy states that should fire an alert
    problemStatuses: [
      'unregistered',
      'disabled',
      'idle and unmonitored',
      'Trunk is unreachable',
      'authentication_failed',
      'unavailable',
      'registration failed',
    ],
  },

  // ── Email recipients ───────────────────────────────────────────────────────
  email: {
    enabled:    false,
    recipients: (process.env.EMAIL_RECIPIENTS || 'intern.tech3@skywavetech.co.zm').split(',').map(function(e) { return e.trim(); }),
    // recipients: (process.env.EMAIL_RECIPIENTS || 'intern.tech2@skywavetech.co.zm').split(',').map(function(e) { return e.trim(); }),
    // recipients: (process.env.EMAIL_RECIPIENTS || 'intern.tech@skywavetech.co.zm').split(',').map(function(e) { return e.trim(); }),
  },

  // ── SMTP ───────────────────────────────────────────────────────────────────
  smtp: {
    enabled: process.env.SMTP_ENABLED === 'true',
    host:    process.env.SMTP_HOST || 'smtp.gmail.com',
    port:    parseInt(process.env.SMTP_PORT) || 587,
    secure:  process.env.SMTP_SECURE === 'true',
    user:    process.env.SMTP_USER || '',
    pass:    process.env.SMTP_PASS || '',
    from:    process.env.SMTP_FROM || '',
  },

  // ── Webhook (disabled) ─────────────────────────────────────────────────────
  webhook: {
    enabled:    false,
    url:        '',
    type:       'slack',
    authHeader: '',
  },

  // // ── Thresholds ─────────────────────────────────────────────────────────────
  // thresholds: {
  //   latency:         { min: 0, max: parseInt(process.env.LATENCY_MAX)          || 150   },
  //   bandwidth:       { min: 0, max: parseInt(process.env.BANDWIDTH_MAX)        || 10000 },
  //   concurrentCalls: { min: 0, max: parseInt(process.env.CONCURRENT_CALLS_MAX) || 50    },
  //   failedCalls:     { max: parseInt(process.env.FAILED_CALLS_MAX) || 5  },
  //   noAnswerCalls:   { max: parseInt(process.env.NO_ANSWER_MAX)    || 10 },
  //   rejectedCalls:   { max: parseInt(process.env.REJECTED_MAX)     || 5  },
  // },

  // ── Logging ────────────────────────────────────────────────────────────────
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file:  process.env.LOG_FILE  || './logs/notifications.log',
  },

};
