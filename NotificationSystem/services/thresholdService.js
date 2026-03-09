/**
 * services/thresholdService.js
 * Evaluates per-trunk metrics against configured thresholds.
 * Severity: CRITICAL (2× over limit), WARNING (over limit)
 */

const config = require('../config/config');
const logger = require('../config/logger');

const T = config.thresholds;

function evaluateMetrics(metrics) {
  const breaches = [];
  const { trunkId, trunkName } = metrics;

  _check(breaches, { trunkId, trunkName, metric: 'latency',        label: 'Average Latency',  value: metrics.avgLatencyMs,     unit: 'ms',    min: T.latency.min,        max: T.latency.max });
  _check(breaches, { trunkId, trunkName, metric: 'bandwidth',      label: 'Bandwidth Usage',  value: metrics.bandwidthKbps,    unit: 'kbps',  min: T.bandwidth.min,      max: T.bandwidth.max });
  _check(breaches, { trunkId, trunkName, metric: 'concurrentCalls',label: 'Concurrent Calls', value: metrics.concurrentCalls,  unit: 'calls', min: T.concurrentCalls.min,max: T.concurrentCalls.max });
  _checkMax(breaches, { trunkId, trunkName, metric: 'failedCalls',   label: 'Failed Calls',   value: metrics.failedCalls,   unit: 'calls', max: T.failedCalls.max });
  _checkMax(breaches, { trunkId, trunkName, metric: 'noAnswerCalls', label: 'No Answer Calls', value: metrics.noAnswerCalls, unit: 'calls', max: T.noAnswerCalls.max });
  _checkMax(breaches, { trunkId, trunkName, metric: 'rejectedCalls', label: 'Rejected Calls',  value: metrics.rejectedCalls, unit: 'calls', max: T.rejectedCalls.max });

  if (breaches.length > 0) logger.warn(`Trunk ${trunkName}: ${breaches.length} threshold breach(es)`);
  return breaches;
}

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
    message:    `${pingResult.host}:${pingResult.port} is not reachable`,
    detectedAt: new Date(),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _check(breaches, { trunkId, trunkName, metric, label, value, unit, min, max }) {
  if (!value) return;
  let direction = null;
  if (max !== null && value > max) direction = 'above_max';
  if (min !== null && value < min) direction = 'below_min';
  if (!direction) return;

  breaches.push({
    trunkId, trunkName, metric, label, unit, value, direction,
    alertType:  `threshold_${direction}`,
    severity:   _severity(value, min, max, direction),
    threshold:  direction === 'above_max' ? max : min,
    message:    `${label} ${direction === 'above_max' ? 'above maximum' : 'below minimum'}: ${value}${unit} (limit: ${direction === 'above_max' ? max : min}${unit})`,
    detectedAt: new Date(),
  });
}

function _checkMax(breaches, { trunkId, trunkName, metric, label, value, unit, max }) {
  if (!value || value <= max) return;
  breaches.push({
    trunkId, trunkName, metric, label, unit, value,
    direction:  'above_max',
    alertType:  'threshold_above_max',
    severity:   value >= max * 2 ? 'CRITICAL' : 'WARNING',
    threshold:  max,
    message:    `${label} exceeded maximum: ${value} ${unit} (max: ${max})`,
    detectedAt: new Date(),
  });
}

function _severity(value, min, max, direction) {
  if (direction === 'above_max' && max !== null) return value >= max * 1.5 ? 'CRITICAL' : 'WARNING';
  if (direction === 'below_min' && min !== null) return value <= min * 0.5 ? 'CRITICAL' : 'WARNING';
  return 'WARNING';
}

module.exports = { evaluateMetrics, evaluatePing };
