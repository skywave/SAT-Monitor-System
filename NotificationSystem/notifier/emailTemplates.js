/**
 * Email templates for all alert types with severity-aware colours
 */

const SEVERITY = {
  CRITICAL: { bg: '#c0392b', light: '#fdecea', border: '#e74c3c', emoji: '🔴' },
  WARNING:  { bg: '#e67e22', light: '#fef9e7', border: '#f39c12', emoji: '🟡' },
  OK:       { bg: '#27ae60', light: '#eafaf1', border: '#2ecc71', emoji: '✅' },
};

// ── Template Router ───────────────────────────────────────────────────────────
function buildEmail(alert) {
  switch (alert.alertType) {
    case 'problem':          return problemEmail(alert);
    case 'recovery':         return recoveryEmail(alert);
    // case 'ip_unreachable':   return ipUnreachableEmail(alert);
    // case 'ip_recovered':     return ipRecoveredEmail(alert);
    // default:
    //   if (alert.alertType?.startsWith('threshold_')) return thresholdEmail(alert);
    //   return problemEmail(alert);
  }
}

// ── Trunk Down ────────────────────────────────────────────────────────────────
function problemEmail({ trunkName, trunkId, trunkType, status, firstFailedAt, consecutiveFailures, detectedAt }) {
  const col = SEVERITY.CRITICAL;
  const dur = firstFailedAt ? _duration(firstFailedAt, detectedAt) : 'unknown';
  return _build(
    `${col.emoji} [SAT Monitor] TRUNK DOWN: ${trunkName} is ${status?.toUpperCase()}`,
    col, 'Trunk Problem Detected',
    [['Trunk Name', trunkName], ['Trunk ID', trunkId], ['Type', trunkType || 'SIP'],
     ['Status', status?.toUpperCase()], ['Down For', dur],
     ['Failures', `${consecutiveFailures} consecutive polls`],
     ['Detected', new Date(detectedAt).toLocaleString()]],
    'Please investigate immediately. Check SIP registration, provider connectivity, and PBX logs....IP Reachability and Threshold to follow',
  );
}

// ── Trunk Recovered ───────────────────────────────────────────────────────────
function recoveryEmail({ trunkName, trunkId, trunkType, status, detectedAt }) {
  const col = SEVERITY.OK;
  return _build(
    `${col.emoji} [SAT Monitor] RECOVERED: ${trunkName} is back online`,
    col, 'Trunk Recovered',
    [['Trunk Name', trunkName], ['Trunk ID', trunkId], ['Type', trunkType || 'SIP'],
     ['Status', status?.toUpperCase()], ['Recovered At', new Date(detectedAt).toLocaleString()]],
    'This trunk has returned to normal operation. No further action required.',
  );
}

// // ── IP Unreachable ────────────────────────────────────────────────────────────
// function ipUnreachableEmail({ trunkName, trunkId, value: host, message, detectedAt }) {
//   const col = SEVERITY.CRITICAL;
//   return _build(
//     `${col.emoji} [SAT Monitor] IP UNREACHABLE: ${trunkName} (${host})`,
//     col, 'Trunk IP Unreachable',
//     [['Trunk Name', trunkName], ['Trunk ID', trunkId], ['Host / IP', host],
//      ['Detected', new Date(detectedAt).toLocaleString()]],
//     message || `Cannot reach ${host}. Check network connectivity and SIP provider status.`,
//   );
// }

// // ── IP Recovered ──────────────────────────────────────────────────────────────
// function ipRecoveredEmail({ trunkName, trunkId, value: host, detectedAt }) {
//   const col = SEVERITY.OK;
//   return _build(
//     `${col.emoji} [SAT Monitor] IP REACHABLE AGAIN: ${trunkName}`,
//     col, 'Trunk IP Reachable Again',
//     [['Trunk Name', trunkName], ['Trunk ID', trunkId], ['Host / IP', host],
//      ['Recovered At', new Date(detectedAt).toLocaleString()]],
//     `${host} is reachable again. Trunk should resume normal operation.`,
//   );
// }

// // ── Threshold Breach ──────────────────────────────────────────────────────────
// function thresholdEmail({ trunkName, trunkId, label, severity, value, unit, threshold, direction, message, detectedAt }) {
//   const col      = SEVERITY[severity] || SEVERITY.WARNING;
//   const dirLabel = direction === 'above_max' ? 'ABOVE MAXIMUM' : 'BELOW MINIMUM';
//   return _build(
//     `${col.emoji} [SAT Monitor] ${severity}: ${trunkName} — ${label} ${dirLabel}`,
//     col, `Threshold Breach — ${label}`,
//     [['Trunk Name', trunkName], ['Trunk ID', trunkId], ['Metric', label],
//      ['Severity', severity], ['Value', `${value} ${unit}`],
//      ['Limit', `${threshold} ${unit} (${dirLabel.toLowerCase()})`],
//      ['Detected', new Date(detectedAt).toLocaleString()]],
//     message || `The ${label} metric on trunk ${trunkName} has breached its configured threshold.`,
//   );
// }

// ── Core Builder ──────────────────────────────────────────────────────────────
function _build(subject, col, heading, rows, note) {
  const plain = [
    `SAT Monitor — ${heading}`,
    '='.repeat(heading.length + 15),
    ...rows.map(([k, v]) => `${k.padEnd(14)}: ${v}`),
    '', note, '',
    '-- SAT Monitor Notification Service',
  ].join('\n');

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:${col.bg};color:#fff;padding:16px 24px;border-radius:6px 6px 0 0;">
    <h2 style="margin:0;font-size:20px;">${heading}</h2>
  </div>
  <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 6px 6px;">
    <table style="width:100%;border-collapse:collapse;">
      ${rows.map(([k, v], i) => _row(k, v, i === 0 ? col.light : '#fff')).join('')}
    </table>
    <p style="margin-top:20px;padding:12px;background:${col.light};border-left:4px solid ${col.border};border-radius:4px;">${note}</p>
  </div>
  <p style="color:#999;font-size:12px;text-align:center;margin-top:8px;">SAT Monitor Notification Service</p>
</div>`;

  return { subject, plain, html };
}

function _row(label, value, bg = '#fff') {
  return `<tr style="background:${bg};">
    <td style="padding:8px 12px;font-weight:bold;color:#555;border-bottom:1px solid #eee;width:40%;">${label}</td>
    <td style="padding:8px 12px;color:#333;border-bottom:1px solid #eee;">${value}</td>
  </tr>`;
}

function _duration(from, to) {
  const secs = Math.floor((new Date(to) - new Date(from)) / 1000);
  if (secs < 60)  return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60)  return `${mins}m ${secs % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

module.exports = { buildEmail, problemEmail, recoveryEmail,} //ipUnreachableEmail, ipRecoveredEmail, thresholdEmail };