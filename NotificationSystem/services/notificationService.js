/**
 * Business logic for notification channel management
 */

const Notifier            = require('../notifier/notifier');
const config              = require('../config/config');
const collectorClient     = require('../config/collectorClient');
const logger              = require('../config/logger');

/**
 * Return sanitized notification config (no raw credentials)
 */
function getConfig() {
  return {
    success: true,
    config: {
      polling: {
        intervalMs:      config.polling.intervalMs,
        intervalSeconds: config.polling.intervalMs / 1000,
      },
      alerts: config.alerts,
      email: {
        enabled:           config.email.enabled,
        recipients:        config.email.recipients,
        useCollectorEmail: config.email.useCollectorEmail,
      },
      // smtp: {
      //   enabled: config.smtp.enabled,
      //   host:    config.smtp.host,
      //   port:    config.smtp.port,
      //   user:    config.smtp.user ? config.smtp.user.slice(0, 3) + '***' : null,
      //   from:    config.smtp.from,
      // },
      // webhook: {
      //   enabled: config.webhook.enabled,
      //   type:    config.webhook.type,
      //   url:     config.webhook.url ? config.webhook.url.slice(0, 30) + '...' : null,
      // },
    },
  };
}

/**
 * Send a test email via the PBX collector
 * @param {string} to - optional recipient override
 */
async function testEmail(to) {
  const recipient = to || config.email.recipients[0];
  await collectorClient.sendEmailViaCollector(
    recipient,
    '[SAT Monitor] Test Email',
    'This is a test from the SAT Monitor Notification Service. Email alerts are working correctly.'
  );
  return { success: true, message: `Test email sent to ${recipient}` };
}

/**
 * Send a test webhook payload
 */
// async function testWebhook() {
//   if (!config.webhook.enabled || !config.webhook.url) {
//     const err = new Error('Webhook not enabled or URL not configured');
//     err.statusCode = 400;
//     throw err;
//   }

//   const notifier = new Notifier();
//   await notifier._sendWebhook({
//     trunkId:             'TEST-1',
//     trunkName:           'Test-Trunk',
//     trunkType:           'SIP',
//     status:              'unregistered',
//     alertType:           'problem',
//     consecutiveFailures: 1,
//     detectedAt:          new Date(),
//     firstFailedAt:       new Date(),
//   });

//   return { success: true, message: `Test webhook sent (${config.webhook.type})` };
// }

/**
 * Manually dispatch a notification to all channels
 * @param {object} body - { trunkId, trunkName, trunkType, status, alertType }
 */
async function send(body) {
  const { trunkId, trunkName, trunkType, status, alertType } = body;

  if (!trunkId || !trunkName || !alertType) {
    const err = new Error('Missing required fields: trunkId, trunkName, alertType');
    err.statusCode = 400;
    throw err;
  }

  const alert = {
    trunkId,
    trunkName,
    trunkType:           trunkType || 'SIP',
    status:              status    || 'unregistered',
    alertType,
    consecutiveFailures: 1,
    firstFailedAt:       new Date(),
    detectedAt:          new Date(),
  };

  logger.info(`Manual notification dispatched for trunk: ${trunkName}`);
  const notifier = new Notifier();
  await notifier.dispatch(alert);

  return { success: true, message: 'Notification dispatched', alert };
}

module.exports = { getConfig, testEmail, send };
