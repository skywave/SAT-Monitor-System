const express      = require('express');
const router       = express.Router();
const alertService = require('../services/alertService');
const engine       = require('../alertEngine/alertEngine');

// ── Alert state ───────────────────────────────────────────────────────────────
router.get('/state', (req, res) => {
  try   { res.json(alertService.getState()); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ── Test alert ────────────────────────────────────────────────────────────────
router.post('/test', async (req, res) => {
  try   { res.json(await alertService.sendTest(req.body)); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ── Reset trunk ───────────────────────────────────────────────────────────────
router.post('/reset/:trunkId', (req, res) => {
  try   { res.json(alertService.resetTrunk(req.params.trunkId)); }
  catch (err) { res.status(err.statusCode || 500).json({ success: false, error: err.message }); }
});

// ── Engine status ─────────────────────────────────────────────────────────────
router.get('/engine/status', (req, res) => {
  res.json({ success: true, running: engine.running });
});

// ── Engine start ──────────────────────────────────────────────────────────────
router.post('/engine/start', (req, res) => {
  try {
    engine.start();
    res.json({ success: true, running: true, message: 'Alert engine started' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Engine stop ───────────────────────────────────────────────────────────────
router.post('/engine/stop', (req, res) => {
  try {
    engine.stop();
    res.json({ success: true, running: false, message: 'Alert engine stopped' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;