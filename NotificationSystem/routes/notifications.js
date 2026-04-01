/**
 * routes/notifications.js
 *
 * GET  /notifications/config                    — view active channel config
 * POST /notifications/test/email                — send a test email
 * POST /notifications/test/webhook              — send a test webhook
 * POST /notifications/send                      — manually dispatch a notification
 *
 * --- Alert history (frontend) ---
 * GET  /notifications/history                   — all alerts sent
 * GET  /notifications/history/:trunkId          — alerts for a specific trunk
 * GET  /notifications/summary                   — counts by type/severity
 * GET  /notifications/recent                    — last 10 alerts
 *
 * --- Recipients management (frontend) ---
 * GET    /notifications/recipients              — list all recipients
 * POST   /notifications/recipients              — add a recipient
 * PUT    /notifications/recipients/:id          — update a recipient
 * DELETE /notifications/recipients/:id          — remove a recipient
 *
 * --- Per-client threshold config (frontend) ---
 * GET    /notifications/thresholds              — list all trunk threshold configs
 * GET    /notifications/thresholds/:trunkId     — get config for one trunk
 * PUT    /notifications/thresholds/:trunkId     — create or update config for a trunk
 * DELETE /notifications/thresholds/:trunkId     — reset trunk to default thresholds
 */

const express             = require('express');
const router              = express.Router();
const notificationService = require('../services/notificationService');
const supabase            = require('../services/supabaseService');

// ── Config ────────────────────────────────────────────────────────────────────
router.get('/config', function(req, res) {
  try {
    var result = notificationService.getConfig();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Test channels ─────────────────────────────────────────────────────────────
router.post('/test/email', async function(req, res) {
  try {
    var result = await notificationService.testEmail(req.body.to);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/test/webhook', async function(req, res) {
  try {
    var result = await notificationService.testWebhook();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/send', async function(req, res) {
  try {
    var result = await notificationService.send(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Alert history ─────────────────────────────────────────────────────────────
router.get('/history', async function(req, res) {
  try {
    var db     = supabase.getClient();
    var limit  = parseInt(req.query.limit)  || 50;
    var offset = parseInt(req.query.offset) || 0;

    var result = await db
      .from('alerts_sent')
      .select('*')
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, total: result.data.length, alerts: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/history/:trunkId', async function(req, res) {
  try {
    var db = supabase.getClient();
    var result = await db
      .from('alerts_sent')
      .select('*')
      .eq('trunk_id', req.params.trunkId)
      .order('sent_at', { ascending: false })
      .limit(50);

    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, trunkId: req.params.trunkId, total: result.data.length, alerts: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/summary', async function(req, res) {
  try {
    var db     = supabase.getClient();
    var result = await db.from('alerts_sent').select('alert_type, severity, sent_at');
    if (result.error) throw new Error(result.error.message);

    var alerts     = result.data;
    var byType     = {};
    var bySeverity = {};
    alerts.forEach(function(a) {
      byType[a.alert_type]   = (byType[a.alert_type]   || 0) + 1;
      bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
    });

    var oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    var last24h   = alerts.filter(function(a) { return a.sent_at > oneDayAgo; }).length;

    res.json({ success: true, total: alerts.length, last24h: last24h, byType: byType, bySeverity: bySeverity });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/recent', async function(req, res) {
  try {
    var db     = supabase.getClient();
    var result = await db
      .from('alerts_sent')
      .select('id, trunk_name, alert_type, severity, message, sent_at')
      .order('sent_at', { ascending: false })
      .limit(10);

    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, alerts: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Recipients management ─────────────────────────────────────────────────────

// GET /notifications/recipients?trunkId=SBC
router.get('/recipients', async function(req, res) {
  try {
    var db    = supabase.getClient();
    var query = db.from('notification_recipients').select('*').order('created_at', { ascending: false });
    if (req.query.trunkId) query = query.eq('trunk_id', req.query.trunkId);

    var result = await query;
    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, total: result.data.length, recipients: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /notifications/recipients
// Body: { name, email, trunk_id, enabled }
// trunk_id = 'all' means this person gets alerts for every trunk
router.post('/recipients', async function(req, res) {
  try {
    var db   = supabase.getClient();
    var body = req.body;

    if (!body.name || !body.email) {
      return res.status(400).json({ success: false, error: 'name and email are required' });
    }

    var result = await db.from('notification_recipients').insert({
      name:     body.name,
      email:    body.email,
      trunk_id: body.trunk_id || 'all',
      enabled:  body.enabled !== undefined ? body.enabled : true,
    }).select();

    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, recipient: result.data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /notifications/recipients/:id
// Body: any of { name, email, trunk_id, enabled }
router.put('/recipients/:id', async function(req, res) {
  try {
    var db     = supabase.getClient();
    var update = {};

    if (req.body.name     !== undefined) update.name     = req.body.name;
    if (req.body.email    !== undefined) update.email    = req.body.email;
    if (req.body.trunk_id !== undefined) update.trunk_id = req.body.trunk_id;
    if (req.body.enabled  !== undefined) update.enabled  = req.body.enabled;

    var result = await db
      .from('notification_recipients')
      .update(update)
      .eq('id', req.params.id)
      .select();

    if (result.error) throw new Error(result.error.message);
    if (!result.data.length) return res.status(404).json({ success: false, error: 'Recipient not found' });
    res.json({ success: true, recipient: result.data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /notifications/recipients/:id
router.delete('/recipients/:id', async function(req, res) {
  try {
    var db     = supabase.getClient();
    var result = await db.from('notification_recipients').delete().eq('id', req.params.id);
    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, message: 'Recipient removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Per-client threshold config ───────────────────────────────────────────────

// GET /notifications/thresholds
router.get('/thresholds', async function(req, res) {
  try {
    var db     = supabase.getClient();
    var result = await db.from('threshold_configs').select('*').order('trunk_name');
    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, total: result.data.length, thresholds: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /notifications/thresholds/:trunkId
// Returns custom config if it exists, otherwise returns system defaults
router.get('/thresholds/:trunkId', async function(req, res) {
  try {
    var db     = supabase.getClient();
    var result = await db
      .from('threshold_configs')
      .select('*')
      .eq('trunk_id', req.params.trunkId)
      .single();

    if (result.error && result.error.code === 'PGRST116') {
      return res.json({
        success:    true,
        trunkId:    req.params.trunkId,
        isDefault:  true,
        thresholds: {
          trunk_id:             req.params.trunkId,
          latency_max:          150,
          bandwidth_max:        10000,
          concurrent_calls_max: 50,
          failed_calls_max:     5,
          no_answer_max:        10,
          rejected_max:         5,
          consecutive_failures: 2,
          cooldown_minutes:     30,
        },
      });
    }

    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, trunkId: req.params.trunkId, isDefault: false, thresholds: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /notifications/thresholds/:trunkId
// Creates or updates threshold config for a trunk
// Body: { trunk_name, latency_max, bandwidth_max, concurrent_calls_max,
//         failed_calls_max, no_answer_max, rejected_max,
//         consecutive_failures, cooldown_minutes }
router.put('/thresholds/:trunkId', async function(req, res) {
  try {
    var db   = supabase.getClient();
    var body = req.body;

    var record = {
      trunk_id:             req.params.trunkId,
      trunk_name:           body.trunk_name           || req.params.trunkId,
      latency_max:          body.latency_max          || 150,
      bandwidth_max:        body.bandwidth_max        || 10000,
      concurrent_calls_max: body.concurrent_calls_max || 50,
      failed_calls_max:     body.failed_calls_max     || 5,
      no_answer_max:        body.no_answer_max        || 10,
      rejected_max:         body.rejected_max         || 5,
      consecutive_failures: body.consecutive_failures || 2,
      cooldown_minutes:     body.cooldown_minutes     || 30,
      updated_at:           new Date().toISOString(),
    };

    var result = await db
      .from('threshold_configs')
      .upsert(record, { onConflict: 'trunk_id' })
      .select();

    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, message: 'Threshold config saved', thresholds: result.data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /notifications/thresholds/:trunkId
// Removes custom config — trunk falls back to system defaults
router.delete('/thresholds/:trunkId', async function(req, res) {
  try {
    var db     = supabase.getClient();
    var result = await db.from('threshold_configs').delete().eq('trunk_id', req.params.trunkId);
    if (result.error) throw new Error(result.error.message);
    res.json({ success: true, message: 'Custom thresholds removed — trunk will use system defaults' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;