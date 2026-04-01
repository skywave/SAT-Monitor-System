const nodemailer  = require('nodemailer');
const config      = require('../config/config');
const logger      = require('../config/logger');
const { buildEmail } = require('./emailTemplates');
const supabase    = require('../services/supabaseService');

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
    var tpl = buildEmail(alert);
    logger.info('Sending SMTP email: ' + tpl.subject);
    await smtpTransport.sendMail({
      from:    config.smtp.from || config.smtp.user,
      to:      config.email.recipients.join(', '),
      subject: tpl.subject,
      text:    tpl.plain,
      html:    tpl.html,
    });
    logger.info('SMTP sent OK to: ' + config.email.recipients.join(', '));
  }
}

module.exports = Notifier;