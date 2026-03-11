const collectorClient = require('../config/collectorClient');
const logger          = require('../config/logger');

async function check() {
  try {
    const systemInfo = await collectorClient.getSystemInfo();
    return {
      success:   true,
      service:   'SAT Monitor - Notification Service',
      status:    'running',
      timestamp: new Date().toISOString(),
      collector: {
        reachable: systemInfo ? true : false,
        info:      systemInfo || null,
      },
    };
  } catch (err) {
    logger.error('Health check failed: ' + err.message);
    return {
      success:   false,
      service:   'SAT Monitor - Notification Service',
      status:    'degraded',
      timestamp: new Date().toISOString(),
      collector: {
        reachable: false,
        error:     err.message,
      },
    };
  }
}

module.exports = { check: check };
