/**
 * services/thresholdService.js
 *
 * Evaluates CDR metrics and ping results against thresholds.
 * Per-trunk thresholds are loaded from Supabase if configured,
 * otherwise falls back to system defaults from config.js / .env
 */

const config  = require('../config/config');
const logger  = require('../config/logger');
const supabase = require('./supabaseService');

// ── System defaults (from config / .env) ─────────────────────────────────────
var DEFAULTS = {
  latency:         { min: 0, max: config.thresholds.latency.max         || 150   },
  bandwidth:       { min: 0, max: config.thresholds.bandwidth.max       || 10000 },
  concurrentCalls: { min: 0, max: config.thresholds.concurrentCalls.max || 50    },
  failedCalls:     {         max: config.thresholds.failedCalls.max     || 5     },
  noAnswerCalls:   {         max: config.thresholds.noAnswerCalls.max   || 10    },
  rejectedCalls:   {         max: config.thresholds.rejectedCalls.max   || 5     },
};

// ── In-memory cache of per-trunk configs ─────────────────────────────────────
// Refreshed every 5 minutes so changes take effect quickly without a restart
var _configCache    = {};
var _lastCacheTime  = 0;
var CACHE_TTL_MS    = 5 * 60 * 1000;

async function _loadConfigs() {
  var now = Date.now();
  if (now - _lastCacheTime < CACHE_TTL_MS) return;

  try {
    var db     = supabase.getClient();
    if (!db) return;
    var result = await db.from('threshold_configs').select('*');
    if (result.error) throw new Error(result.error.message);

    _configCache   = {};
    result.data.forEach(function(row) {
      _configCache[row.trunk_id] = row;
    });
    _lastCacheTime = now;
    logger.debug('Threshold configs loaded from Supabase: ' + Object.keys(_configCache).length + ' trunk(s)');
  } catch (err) {
    logger.error('Failed to load threshold configs: ' + err.message);
  }
}

// ── Get thresholds for a specific trunk ───────────────────────────────────────
// Returns Supabase config if it exists, otherwise system defaults
function _getThresholds(trunkId) {
  var custom = _configCache[trunkId];
  if (!custom) return DEFAULTS;

  return {
    latency:         { min: 0, max: custom.latency_max          || DEFAULTS.latency.max         },
    bandwidth:       { min: 0, max: custom.bandwidth_max        || DEFAULTS.bandwidth.max       },
    concurrentCalls: { min: 0, max: custom.concurrent_calls_max || DEFAULTS.concurrentCalls.max },
    failedCalls:     {         max: custom.failed_calls_max     || DEFAULTS.failedCalls.max     },
    noAnswerCalls:   {         max: custom.no_answer_max        || DEFAULTS.noAnswerCalls.max   },
    rejectedCalls:   {         max: custom.rejected_max         || DEFAULTS.rejectedCalls.max   },
  };
}

// ── Helper: check one metric ──────────────────────────────────────────────────
function _check(breaches, opts) {
  var trunkId   = opts.trunkId;
  var trunkName = opts.trunkName;
  var metric    = opts.metric;
  var label     = opts.label;
  var value     = opts.value;
  var unit      = opts.unit;
  var min       = opts.min;
  var max       = opts.max;

  if (value === null || value === undefined || isNaN(value)) return;

  var severity  = null;
  var direction = null;
  var threshold = null;
  var alertType = null;

  if (max !== undefined && value > max) {
    severity  = value > max * 1.5 ? 'CRITICAL' : 'WARNING';
    direction = 'above_max';
    threshold = max;
    alertType = 'threshold_above_max';
  } else if (min !== undefined && value < min) {
    severity  = 'WARNING';
    direction = 'below_min';
    threshold = min;
    alertType = 'threshold_below_min';
  }

  if (!severity) return;

  logger.warn('Trunk ' + trunkName + ': ' + label + ' ' + direction + ' (' + value + ' ' + unit + ')');

  breaches.push({
    trunkId:   trunkId,
    trunkName: trunkName,
    metric:    metric,
    label:     label,
    unit:      unit,
    value:     value,
    direction: direction,
    alertType: alertType,
    severity:  severity,
    threshold: threshold,
    message:   label + ' ' + (direction === 'above_max' ? 'exceeded maximum' : 'below minimum') + ': ' + value + ' ' + unit + ' (' + (direction === 'above_max' ? 'max' : 'min') + ': ' + threshold + ')',
    detectedAt: new Date(),
  });
}

// ── Main: evaluate CDR metrics for a trunk ────────────────────────────────────
async function evaluateMetrics(metrics) {
  await _loadConfigs();

  var T        = _getThresholds(metrics.trunkId);
  var breaches = [];

  _check(breaches, { trunkId: metrics.trunkId, trunkName: metrics.trunkName, metric: 'latency',         label: 'Average Latency',    value: metrics.avgLatencyMs,    unit: 'ms',    min: T.latency.min,         max: T.latency.max         });
  _check(breaches, { trunkId: metrics.trunkId, trunkName: metrics.trunkName, metric: 'bandwidth',       label: 'Bandwidth',          value: metrics.bandwidthKbps,   unit: 'kbps',  min: T.bandwidth.min,       max: T.bandwidth.max       });
  _check(breaches, { trunkId: metrics.trunkId, trunkName: metrics.trunkName, metric: 'concurrentCalls', label: 'Concurrent Calls',   value: metrics.concurrentCalls, unit: 'calls', min: T.concurrentCalls.min, max: T.concurrentCalls.max });
  _check(breaches, { trunkId: metrics.trunkId, trunkName: metrics.trunkName, metric: 'failedCalls',     label: 'Failed Calls',       value: metrics.failedCalls,     unit: 'calls',                             max: T.failedCalls.max     });
  _check(breaches, { trunkId: metrics.trunkId, trunkName: metrics.trunkName, metric: 'noAnswerCalls',   label: 'No Answer Calls',    value: metrics.noAnswerCalls,   unit: 'calls',                             max: T.noAnswerCalls.max   });
  _check(breaches, { trunkId: metrics.trunkId, trunkName: metrics.trunkName, metric: 'rejectedCalls',   label: 'Rejected Calls',     value: metrics.rejectedCalls,   unit: 'calls',                             max: T.rejectedCalls.max   });

  if (breaches.length > 0) {
    logger.warn('Trunk ' + metrics.trunkName + ': ' + breaches.length + ' threshold breach(es)');
  }

  return breaches;
}

// ── Evaluate ping result ──────────────────────────────────────────────────────
function evaluatePing(pingResult) {
  if (pingResult.reachable) return null;
  return {
    trunkId:    pingResult.trunkId,
    trunkName:  pingResult.trunkName,
    metric:     'ipReachability',
    label:      'IP Reachability',
    alertType:  'ip_unreachable',
    severity:   'CRITICAL',
    value:      pingResult.host,
    unit:       '',
    message:    pingResult.host + ':' + pingResult.port + ' is not reachable',
    detectedAt: new Date(),
  };
}

// ── Expose cache invalidation so PUT /thresholds takes effect immediately ─────
function invalidateCache() {
  _lastCacheTime = 0;
}

module.exports = { evaluateMetrics, evaluatePing, invalidateCache };