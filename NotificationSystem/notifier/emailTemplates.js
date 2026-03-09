const SEVERITY = {
  CRITICAL: { bg: '#c0392b', light: '#fdecea', border: '#e74c3c', label: '[CRITICAL]' },
  WARNING:  { bg: '#e67e22', light: '#fef9e7', border: '#f39c12', label: '[WARNING]'  },
  OK:       { bg: '#27ae60', light: '#eafaf1', border: '#2ecc71', label: '[OK]'       },
};

function buildEmail(alert) {
  if (alert.alertType === 'problem')        return problemEmail(alert);
  if (alert.alertType === 'recovery')       return recoveryEmail(alert);
  if (alert.alertType === 'ip_unreachable') return ipUnreachableEmail(alert);
  if (alert.alertType === 'ip_recovered')   return ipRecoveredEmail(alert);
  if (alert.alertType && alert.alertType.indexOf('threshold_') === 0) return thresholdEmail(alert);
  return problemEmail(alert);
}

function problemEmail(alert) {
  var trunkName           = alert.trunkName;
  var trunkId             = alert.trunkId;
  var trunkType           = alert.trunkType || 'SIP';
  var status              = alert.status;
  var firstFailedAt       = alert.firstFailedAt;
  var consecutiveFailures = alert.consecutiveFailures;
  var detectedAt          = alert.detectedAt;

  var col = SEVERITY.CRITICAL;
  var dur = firstFailedAt ? duration(firstFailedAt, detectedAt) : 'unknown';
  return build(
    '[SAT Monitor] TRUNK DOWN: ' + trunkName + ' is ' + String(status).toUpperCase(),
    col,
    'Trunk Problem Detected',
    [
      ['Trunk Name', trunkName],
      ['Trunk ID',   trunkId],
      ['Type',       trunkType],
      ['Status',     String(status).toUpperCase()],
      ['Down For',   dur],
      ['Failures',   consecutiveFailures + ' consecutive polls'],
      ['Detected',   new Date(detectedAt).toLocaleString()],
    ],
    'Please investigate immediately. Check SIP registration, provider connectivity, and PBX logs.'
  );
}

function recoveryEmail(alert) {
  var col = SEVERITY.OK;
  return build(
    '[SAT Monitor] RECOVERED: ' + alert.trunkName + ' is back online',
    col,
    'Trunk Recovered',
    [
      ['Trunk Name',    alert.trunkName],
      ['Trunk ID',      alert.trunkId],
      ['Type',          alert.trunkType || 'SIP'],
      ['Status',        String(alert.status).toUpperCase()],
      ['Recovered At',  new Date(alert.detectedAt).toLocaleString()],
    ],
    'This trunk has returned to normal operation. No further action required.'
  );
}

function ipUnreachableEmail(alert) {
  var col  = SEVERITY.CRITICAL;
  var host = alert.value;
  return build(
    '[SAT Monitor] IP UNREACHABLE: ' + alert.trunkName + ' (' + host + ')',
    col,
    'Trunk IP Unreachable',
    [
      ['Trunk Name', alert.trunkName],
      ['Trunk ID',   alert.trunkId],
      ['Host / IP',  host],
      ['Detected',   new Date(alert.detectedAt).toLocaleString()],
    ],
    alert.message || ('Cannot reach ' + host + '. Check network connectivity and SIP provider status.')
  );
}

function ipRecoveredEmail(alert) {
  var col  = SEVERITY.OK;
  var host = alert.value;
  return build(
    '[SAT Monitor] IP REACHABLE AGAIN: ' + alert.trunkName,
    col,
    'Trunk IP Reachable Again',
    [
      ['Trunk Name',   alert.trunkName],
      ['Trunk ID',     alert.trunkId],
      ['Host / IP',    host],
      ['Recovered At', new Date(alert.detectedAt).toLocaleString()],
    ],
    host + ' is reachable again. Trunk should resume normal operation.'
  );
}

function thresholdEmail(alert) {
  var col      = SEVERITY[alert.severity] || SEVERITY.WARNING;
  var dirLabel = alert.direction === 'above_max' ? 'ABOVE MAXIMUM' : 'BELOW MINIMUM';
  return build(
    '[SAT Monitor] ' + alert.severity + ': ' + alert.trunkName + ' — ' + alert.label + ' ' + dirLabel,
    col,
    'Threshold Breach — ' + alert.label,
    [
      ['Trunk Name', alert.trunkName],
      ['Trunk ID',   alert.trunkId],
      ['Metric',     alert.label],
      ['Severity',   alert.severity],
      ['Value',      alert.value + ' ' + alert.unit],
      ['Limit',      alert.threshold + ' ' + alert.unit + ' (' + dirLabel.toLowerCase() + ')'],
      ['Detected',   new Date(alert.detectedAt).toLocaleString()],
    ],
    alert.message || ('The ' + alert.label + ' metric on trunk ' + alert.trunkName + ' has breached its configured threshold.')
  );
}

function build(subject, col, heading, rows, note) {
  var plain = [
    'SAT Monitor — ' + heading,
    '='.repeat(heading.length + 15),
  ];
  rows.forEach(function(r) {
    plain.push(padEnd(r[0], 14) + ': ' + r[1]);
  });
  plain.push('');
  plain.push(note);
  plain.push('');
  plain.push('-- SAT Monitor Notification Service');

  var rowsHtml = rows.map(function(r, i) {
    var bg = i === 0 ? col.light : '#ffffff';
    return '<tr style="background:' + bg + ';">'
      + '<td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;width:40%;">' + r[0] + '</td>'
      + '<td style="padding:8px 12px;color:#333;border-bottom:1px solid #eee;">' + r[1] + '</td>'
      + '</tr>';
  }).join('');

  var html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">'
    + '<div style="background:' + col.bg + ';color:#fff;padding:16px 24px;border-radius:6px 6px 0 0;">'
    + '<h2 style="margin:0;font-size:20px;">' + heading + '</h2>'
    + '</div>'
    + '<div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 6px 6px;">'
    + '<table style="width:100%;border-collapse:collapse;">' + rowsHtml + '</table>'
    + '<p style="margin-top:20px;padding:12px;background:' + col.light + ';border-left:4px solid ' + col.border + ';border-radius:4px;">' + note + '</p>'
    + '</div>'
    + '<p style="color:#999;font-size:12px;text-align:center;margin-top:8px;">SAT Monitor Notification Service</p>'
    + '</div>';

  return { subject: subject, plain: plain.join('\n'), html: html };
}

function padEnd(str, len) {
  while (str.length < len) str = str + ' ';
  return str;
}

function duration(from, to) {
  var secs = Math.floor((new Date(to) - new Date(from)) / 1000);
  if (secs < 60)  return secs + 's';
  var mins = Math.floor(secs / 60);
  if (mins < 60)  return mins + 'm ' + (secs % 60) + 's';
  return Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm';
}

module.exports = {
  buildEmail:          buildEmail,
  problemEmail:        problemEmail,
  recoveryEmail:       recoveryEmail,
  ipUnreachableEmail:  ipUnreachableEmail,
  ipRecoveredEmail:    ipRecoveredEmail,
  thresholdEmail:      thresholdEmail,
};