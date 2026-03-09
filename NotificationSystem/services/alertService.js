
const engine = require('../alertEngine/alertEngine');
const logger = require('../config/logger');

function getState() {
  var tracker = engine.getTrackerInstance();
  if (!tracker) {
    return { success: true, trackedTrunks: 0, state: {} };
  }
  var summary = tracker.getSummary();
  return {
    success:       true,
    trackedTrunks: Object.keys(summary).length,
    state:         summary,
  };
}

async function sendTest(params) {
  var Notifier = require('../notifier/notifier');
  var notifier = new Notifier();
  var alert = {
    trunkId:             params.trunkId     || 'TEST-1',
    trunkName:           params.trunkName   || 'Test-Trunk',
    trunkType:           params.trunkType   || 'SIP',
    status:              params.status      || 'unregistered',
    alertType:           params.alertType   || 'problem',
    severity:            params.severity    || 'CRITICAL',
    consecutiveFailures: 1,
    firstFailedAt:       new Date(),
    detectedAt:          new Date(),
  };
  await notifier.dispatch(alert);
  return { success: true, message: 'Test alert dispatched', alert: alert };
}

function resetTrunk(trunkId) {
  var tracker = engine.getTrackerInstance();
  if (!tracker) {
    var e = new Error('Alert engine not running'); e.statusCode = 503; throw e;
  }
  tracker.clear(String(trunkId));
  logger.info('Alert state reset for trunk: ' + trunkId);
  return {
    success: true,
    message: 'Alert state cleared for trunk ' + trunkId + '. Next poll will re-evaluate.',
  };
}

function resetAll() {
  var tracker = engine.getTrackerInstance();
  if (!tracker) {
    var e = new Error('Alert engine not running'); e.statusCode = 503; throw e;
  }
  var summary = tracker.getSummary();
  var ids = Object.keys(summary);
  ids.forEach(function(id) { tracker.clear(id); });
  logger.info('Alert state reset for all ' + ids.length + ' trunks');
  return {
    success: true,
    message: 'Alert state cleared for all trunks (' + ids.length + '). Next poll will re-evaluate.',
    trunks:  ids,
  };
}

module.exports = { getState, sendTest, resetTrunk, resetAll };