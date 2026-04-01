/**
 * services/supabaseService.js
 * Writes poll data to Supabase alerts_sent and trunk_metrics only
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../config/logger');

var supabase = null;

function getClient() {
  if (!supabase) {
    var url = process.env.SUPABASE_URL;
    var key = process.env.SUPABASE_KEY;
    if (!url || !key) {
      logger.warn('Supabase not configured â€” skipping DB writes');
      return null;
    }
    supabase = createClient(url, key);
    logger.info('Supabase client initialised');
  }
  return supabase;
}

// No-ops for trunk status and IP checks â€” not writing these tables yet
async function saveTrunkStatus(trunk, statusText) {}
async function saveIPCheck(pingResult) {}

// CDR Metrics
async function saveTrunkMetrics(metrics) {
  var db = getClient(); if (!db) return;
  try {
    var { error } = await db.from('trunk_metrics').insert({
      trunk_id:        String(metrics.trunkId),
      trunk_name:      metrics.trunkName,
      total_calls:     metrics.totalCalls     || 0,
      failed_calls:    metrics.failedCalls    || 0,
      no_answer_calls: metrics.noAnswerCalls  || 0,
      rejected_calls:  metrics.rejectedCalls  || 0,
      answered_calls:  metrics.answeredCalls  || 0,
      concurrent_calls:metrics.concurrentCalls|| 0,
      avg_latency_ms:  metrics.avgLatencyMs   || 0,
      bandwidth_kbps:  metrics.bandwidthKbps  || 0,
      recorded_at:     new Date().toISOString(),
    });
    if (error) logger.error('Supabase saveTrunkMetrics error: ' + error.message);
    else logger.debug('Supabase trunk_metrics saved for: ' + metrics.trunkName);
  } catch (err) {
    logger.error('Supabase saveTrunkMetrics failed: ' + err.message);
  }
}

// Alert Sent
async function saveAlert(alert) {
  var db = getClient(); if (!db) return;
  try {
    var { error } = await db.from('alerts_sent').insert({
      trunk_id:   String(alert.trunkId),
      trunk_name: alert.trunkName,
      alert_type: alert.alertType,
      severity:   alert.severity   || 'CRITICAL',
      status:     alert.status     || null,
      message:    alert.message    || (alert.alertType + ' on ' + alert.trunkName),
      sent_at:    new Date().toISOString(),
    });
    if (error) logger.error('Supabase saveAlert error: ' + error.message);
    else logger.debug('Supabase alerts_sent saved: ' + alert.alertType + ' â€” ' + alert.trunkName);
  } catch (err) {
    logger.error('Supabase saveAlert failed: ' + err.message);
  }
}

module.exports = { saveTrunkStatus, saveIPCheck, saveTrunkMetrics, saveAlert, getClient };

