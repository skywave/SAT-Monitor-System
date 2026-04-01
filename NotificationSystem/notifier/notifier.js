/**
 * notifier/notifier.js
 * Dispatches alerts via SMTP.
 * Recipients are loaded from Supabase notification_recipients table.
 * Falls back to .env EMAIL_RECIPIENTS if Supabase returns none.
 */

const nodemailer     = require('nodemailer');
const config         = require('../config/config');
const logger         = require('../config/logger');
const { buildEmail } = require('./emailTemplates');
const supabase       = require('../services/supabaseService');

var smtpTransport = null;
if (config.smtp.enabled) {
  smtpTransport = nodemailer.createTransport({
    host:   config.smtp.host,
    port:   config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
  logger.info('SMTP transport ready (' + config.smtp.user + ')');
} else {
  logger.warn('SMTP is disabled — set SMTP_ENABLED=true in .env');
}

// ── Load recipients from Supabase ─────────────────────────────────────────────
// Returns emails for:
//   - recipients with trunk_id = 'all'  (receive every alert)
//   - recipients with trunk_id = trunkId (receive alerts for this trunk only)
// Falls back to .env EMAIL_RECIPIENTS if Supabase is unavailable or empty
async function _getRecipients(trunkId) {
  try {
    var db = supabase.getClient();
    if (!db) throw new Error('Supabase not available');

    var result = await db
      .from('notification_recipients')
      .select('email, trunk_id')
      .eq('enabled', true)
      .or('trunk_id.eq.all,trunk_id.eq.' + trunkId);

    if (result.error) throw new Error(result.error.message);

    var emails = result.data.map(function(r) { return r.email; });

    // Deduplicate
    emails = emails.filter(function(email, index, self) {
      return self.indexOf(email) === index;
    });

    if (emails.length > 0) {
      logger.debug('Recipients from Supabase (' + trunkId + '): ' + emails.join(', '));
      return emails;
    }

    // No recipients in Supabase — fall back to .env
    logger.warn('No recipients in Supabase for trunk ' + trunkId + ' — falling back to .env');
    return config.email.recipients;

  } catch (err) {
    logger.error('Failed to load recipients from Supabase: ' + err.message + ' — falling back to .env');
    return config.email.recipients;
  }
}

class Notifier {
  async dispatch(alert) {
    var severity = alert.severity || 'CRITICAL';
    var emoji    = severity === 'OK' ? 'OK' : severity === 'WARNING' ? 'WARNING' : 'CRITICAL';
    logger.info(emoji + ' Dispatching ' + alert.alertType + ' alert — trunk: ' + alert.trunkName);

    supabase.saveAlert(alert);

    var tasks = [];
    if (config.smtp.enabled && smtpTransport) {
      tasks.push(this._sendViaSMTP(alert));
    }

    if (tasks.length === 0) {
      logger.warn('No channels enabled — check SMTP_ENABLED in .env');
      return;
    }

    var results = await Promise.allSettled(tasks);
    results.forEach(function(r, i) {
      if (r.status === 'rejected') {
        logger.error('Channel ' + i + ' failed: ' + (r.reason && r.reason.message ? r.reason.message : r.reason));
      }
    });
  }

  async _sendViaSMTP(alert) {
    var tpl        = buildEmail(alert);
    var recipients = await _getRecipients(alert.trunkId || 'all');

    if (!recipients || recipients.length === 0) {
      logger.warn('No recipients configured — skipping email for ' + alert.alertType);
      return;
    }

    logger.info('Sending SMTP email: ' + tpl.subject);
    await smtpTransport.sendMail({
      from:    config.smtp.from || config.smtp.user,
      to:      recipients.join(', '),
      subject: tpl.subject,
      text:    tpl.plain,
      html:    tpl.html,
    });
    logger.info('SMTP sent OK to: ' + recipients.join(', '));
  }
}

module.exports = Notifier;
