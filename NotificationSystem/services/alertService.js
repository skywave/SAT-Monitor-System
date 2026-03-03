const engine   = require('../alertEngine/alertEngine');
const Notifier = require('../notifier/notifier');
const logger   = require('../config/logger');

function getState() {
  const tracker = engine.getTrackerInstance();
  const summary = tracker ? tracker.getSummary() : {};
  return { success: true, trackedTrunks: Object.keys(summary).length, state: summary };
}

async function sendTest(params) {
  params = params || {};
  const trunkId   = params.trunkId   || 'TEST-1';
  const trunkName = params.trunkName || 'Test-Trunk';
  const trunkType = params.trunkType || 'SIP';
  const status    = params.status    || 'unregistered';
  const alertType = params.alertType || 'problem';

  const alert = {
    trunkId,
    trunkName,
    trunkType,
    status,
    alertType,
    severity:            'CRITICAL',
    firstFailedAt:       new Date(Date.now() - 5 * 60 * 1000),
    consecutiveFailures: 3,
    detectedAt:          new Date(),
  };

  logger.info('Test alert triggered for trunk: ' + trunkName);
  await new Notifier().dispatch(alert);
  return { success: true, message: 'Test alert dispatched', alert: alert };
}

function resetTrunk(trunkId) {
  const tracker = engine.getTrackerInstance();
  if (!tracker) {
    const e = new Error('Alert engine not running');
    e.statusCode = 503;
    throw e;
  }
  tracker.clear(trunkId);
  logger.info('Alert state cleared for trunk: ' + trunkId);
  return { success: true, message: 'Alert state cleared for trunk ' + trunkId };
}

module.exports = {
  getState:   getState,
  sendTest:   sendTest,
  resetTrunk: resetTrunk,
};
