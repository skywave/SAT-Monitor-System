/**
 * config/testAlert.js
 * Fire a test problem + recovery alert to verify all channels work
 * Run: node config/testAlert.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const Notifier = require('./notifier/notifier');
const logger   = require('./config/logger');

async function run() {
  logger.info('Running test alert sequence...');
  const notifier = new Notifier();

  // 1. Trunk problem
  await notifier.dispatch({
    trunkId:             'TEST-1',
    trunkName:           'SIP-Trunk-Main',
    trunkType:           'SIP',
    status:              'unregistered',
    alertType:           'problem',
    severity:            'CRITICAL',
    firstFailedAt:       new Date(Date.now() - 5 * 60 * 1000),
    consecutiveFailures: 3,
    detectedAt:          new Date(),
  });
  logger.info('Trunk problem alert sent ✓');
  await _wait(1500);

  // 2. Trunk recovery
  await notifier.dispatch({
    trunkId:    'TEST-1',
    trunkName:  'SIP-Trunk-Main',
    trunkType:  'SIP',
    status:     'registered',
    alertType:  'recovery',
    severity:   'OK',
    detectedAt: new Date(),
  });
  logger.info('Trunk recovery alert sent ✓');
  await _wait(1500);

  // 3. IP unreachable
  await notifier.dispatch({
    trunkId:    'TEST-1',
    trunkName:  'SIP-Trunk-Main',
    alertType:  'ip_unreachable',
    severity:   'CRITICAL',
    value:      '192.168.1.1',
    message:    '192.168.1.1:5060 is not reachable',
    detectedAt: new Date(),
  });
  logger.info('IP unreachable alert sent ✓');
  await _wait(1500);

  // 4. Threshold breach — WARNING
  await notifier.dispatch({
    trunkId:    'TEST-1',
    trunkName:  'SIP-Trunk-Main',
    alertType:  'threshold_above_max',
    severity:   'WARNING',
    label:      'Average Latency',
    metric:     'latency',
    value:      180,
    unit:       'ms',
    threshold:  150,
    direction:  'above_max',
    message:    'Average Latency is above maximum: 180ms (limit: 150ms)',
    detectedAt: new Date(),
  });
  logger.info('Threshold WARNING alert sent ✓');
  await _wait(1500);

  // 5. Threshold breach — CRITICAL
  await notifier.dispatch({
    trunkId:    'TEST-1',
    trunkName:  'SIP-Trunk-Main',
    alertType:  'threshold_above_max',
    severity:   'CRITICAL',
    label:      'Failed Calls',
    metric:     'failedCalls',
    value:      12,
    unit:       'calls',
    threshold:  5,
    direction:  'above_max',
    message:    'Failed Calls exceeded maximum: 12 calls (max: 5)',
    detectedAt: new Date(),
  });
  logger.info('Threshold CRITICAL alert sent ✓');

  logger.info('\nAll test alerts sent! Check your email and Slack/webhook.');
}

function _wait(ms) { return new Promise(r => setTimeout(r, ms)); }

run().catch(err => { console.error('Test failed:', err); process.exit(1); });
