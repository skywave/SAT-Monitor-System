const logger = require('../config/logger');
const config = require('../config/config');

class alertStateTracker {
  constructor() {
    this.trunkStates     = new Map();
    this.ipStates        = new Map();
    this.thresholdStates = new Map();
  }

  evaluate(trunkId, currentStatus) {
    var isProblematic = config.alerts.problemStatuses.includes((currentStatus || '').toLowerCase());
    var isHealthy     = config.alerts.healthyStatuses.includes((currentStatus || '').toLowerCase());
    var prev = this.trunkStates.get(trunkId) || { status: null, firstFailedAt: null, lastAlertedAt: null, consecutiveFailures: 0, alerted: false };

    if (isHealthy) {
      var wasAlerted = prev.alerted;
      this.trunkStates.set(trunkId, { status: currentStatus, firstFailedAt: null, lastAlertedAt: prev.lastAlertedAt, consecutiveFailures: 0, alerted: false });
      if (wasAlerted) return { shouldAlert: true, alertType: 'recovery', state: this.trunkStates.get(trunkId) };
      return { shouldAlert: false, alertType: null, state: this.trunkStates.get(trunkId) };
    }

    if (isProblematic) {
      var consecutiveFailures = prev.consecutiveFailures + 1;
      var firstFailedAt       = prev.firstFailedAt || new Date();
      var now                 = new Date();
      var cooldownMs          = config.alerts.cooldownMinutes * 60 * 1000;
      var cooldownExpired     = !prev.lastAlertedAt || (now - new Date(prev.lastAlertedAt)) > cooldownMs;
      var thresholdMet        = consecutiveFailures >= config.alerts.consecutiveFailuresBeforeAlert;
      var shouldAlert         = thresholdMet && (!prev.alerted || cooldownExpired);
      this.trunkStates.set(trunkId, { status: currentStatus, firstFailedAt: firstFailedAt, lastAlertedAt: shouldAlert ? now : prev.lastAlertedAt, consecutiveFailures: consecutiveFailures, alerted: shouldAlert ? true : prev.alerted });
      return { shouldAlert: shouldAlert, alertType: 'problem', state: this.trunkStates.get(trunkId) };
    }

    this.trunkStates.set(trunkId, Object.assign({}, prev, { status: currentStatus }));
    return { shouldAlert: false, alertType: null, state: this.trunkStates.get(trunkId) };
  }

  evaluateIP(trunkId, reachable) {
    var prev = this.ipStates.get(trunkId) || { reachable: true, consecutiveFailures: 0, firstFailedAt: null, lastAlertedAt: null, alerted: false };
    if (reachable) {
      var wasAlerted = prev.alerted;
      this.ipStates.set(trunkId, { reachable: true, consecutiveFailures: 0, firstFailedAt: null, lastAlertedAt: prev.lastAlertedAt, alerted: false });
      if (wasAlerted) return { shouldAlert: true };
      return { shouldAlert: false };
    }
    var consecutiveFailures = prev.consecutiveFailures + 1;
    var firstFailedAt       = prev.firstFailedAt || new Date();
    var now                 = new Date();
    var cooldownMs          = config.alerts.cooldownMinutes * 60 * 1000;
    var cooldownExpired     = !prev.lastAlertedAt || (now - new Date(prev.lastAlertedAt)) > cooldownMs;
    var thresholdMet        = consecutiveFailures >= config.alerts.consecutiveFailuresBeforeAlert;
    var shouldAlert         = thresholdMet && (!prev.alerted || cooldownExpired);
    this.ipStates.set(trunkId, { reachable: false, consecutiveFailures: consecutiveFailures, firstFailedAt: firstFailedAt, lastAlertedAt: shouldAlert ? now : prev.lastAlertedAt, alerted: shouldAlert ? true : prev.alerted });
    return { shouldAlert: shouldAlert };
  }

  evaluateThreshold(trunkId, metric, value, direction) {
    var key  = trunkId + ':' + metric;
    var prev = this.thresholdStates.get(key) || { breaching: false, consecutiveBreaches: 0, firstBreachedAt: null, lastAlertedAt: null, alerted: false };
    var now                 = new Date();
    var cooldownMs          = config.alerts.cooldownMinutes * 60 * 1000;
    var cooldownExpired     = !prev.lastAlertedAt || (now - new Date(prev.lastAlertedAt)) > cooldownMs;
    var consecutiveBreaches = prev.consecutiveBreaches + 1;
    var thresholdMet        = consecutiveBreaches >= config.alerts.consecutiveFailuresBeforeAlert;
    var shouldAlert         = thresholdMet && (!prev.alerted || cooldownExpired);
    this.thresholdStates.set(key, { breaching: true, consecutiveBreaches: consecutiveBreaches, firstBreachedAt: prev.firstBreachedAt || now, lastAlertedAt: shouldAlert ? now : prev.lastAlertedAt, alerted: shouldAlert ? true : prev.alerted });
    return { shouldAlert: shouldAlert };
  }

  clearThreshold(trunkId, metric) { this.thresholdStates.delete(trunkId + ':' + metric); }

  getSummary() {
    var out = {};
    var allIds = new Set();
    for (var id of this.trunkStates.keys()) allIds.add(id);
    for (var id of this.ipStates.keys()) allIds.add(id);
    for (var id of allIds) {
      out[id] = { status: this.trunkStates.get(id) || null, ip: this.ipStates.get(id) || null, thresholds: this._thresholdsFor(id) };
    }
    return out;
  }

  _thresholdsFor(trunkId) {
    var out = {};
    for (var entry of this.thresholdStates) {
      var key = entry[0]; var state = entry[1];
      if (key.indexOf(trunkId + ':') === 0) out[key.split(':')[1]] = state;
    }
    return out;
  }

  clear(trunkId) {
    this.trunkStates.delete(trunkId);
    this.ipStates.delete(trunkId);
    for (var key of this.thresholdStates.keys()) {
      if (key.indexOf(trunkId + ':') === 0) this.thresholdStates.delete(key);
    }
  }
}

module.exports = alertStateTracker;
