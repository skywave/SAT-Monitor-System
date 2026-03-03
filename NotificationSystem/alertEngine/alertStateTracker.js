

const logger = require('../config/logger');
const config = require('../config/config');

class alertStateTracker {
  constructor() {
    this.trunkStates = new Map();
    // this.ipStates = new Map();
    // this.thresholdStates = new Map();
  }

  // ── 1. Trunk Status ─────────────────────────────────────────

  evaluate(trunkId, currentStatus) {
    const status = currentStatus?.toLowerCase();

    const isProblematic = config.alerts.problemStatuses.includes(status);
    const isHealthy     = config.alerts.healthyStatuses.includes(status);

    const prev = this.trunkStates.get(trunkId) || {
      status: null,
      firstFailedAt: null,
      lastAlertedAt: null,
      consecutiveFailures: 0,
      alerted: false,
    };

    //  RECOVERY
    if (isHealthy) {
      const wasAlerted = prev.alerted;

      const newState = {
        status: currentStatus,
        firstFailedAt: null,
        lastAlertedAt: prev.lastAlertedAt,
        consecutiveFailures: 0,
        alerted: false,
      };

      this.trunkStates.set(trunkId, newState);

      if (wasAlerted) {
        logger.info(` Trunk ${trunkId} recovered (${currentStatus})`);
        return { shouldAlert: true, alertType: 'recovery', state: newState };
      }

      return { shouldAlert: false, alertType: null, state: newState };
    }

    // PROBLEM
    if (isProblematic) {
      const consecutiveFailures = prev.consecutiveFailures + 1;
      const firstFailedAt       = prev.firstFailedAt || new Date();
      const now                 = new Date();
      const cooldownMs          = config.alerts.cooldownMinutes * 60 * 1000;

      const cooldownExpired =
        !prev.lastAlertedAt ||
        (now - new Date(prev.lastAlertedAt)) > cooldownMs;

      const thresholdMet =
        consecutiveFailures >= config.alerts.consecutiveFailuresBeforeAlert;

      const shouldAlert =
        thresholdMet && (!prev.alerted || cooldownExpired);

      const newState = {
        status: currentStatus,
        firstFailedAt,
        lastAlertedAt: shouldAlert ? now : prev.lastAlertedAt,
        consecutiveFailures,
        alerted: shouldAlert ? true : prev.alerted,
      };

      this.trunkStates.set(trunkId, newState);

      if (shouldAlert) {
        logger.warn(
          ` Trunk ${trunkId} — ${currentStatus} (${consecutiveFailures} failures)`
        );
      }

      return { shouldAlert, alertType: 'problem', state: newState };
    }

    //  Unknown status
    this.trunkStates.set(trunkId, { ...prev, status: currentStatus });

    return { shouldAlert: false, alertType: null, state: this.trunkStates.get(trunkId) };
  }

  // ── Summary ─────────────────────────────────────────

  getSummary() {
    return {
      trunkStates: Object.fromEntries(this.trunkStates),
      // ipStates: Object.fromEntries(this.ipStates),
      // thresholdStates: Object.fromEntries(this.thresholdStates),
    };
  }

  // ── Clear ─────────────────────────────────────────

  clear(trunkId) {
    this.trunkStates.delete(trunkId);
    this.ipStates.delete(trunkId);

    for (const key of this.thresholdStates.keys()) {
      if (key.startsWith(`${trunkId}:`)) {
        this.thresholdStates.delete(key);
      }
    }
  }
}

module.exports = alertStateTracker;