/**
 * GET  /api/trunks       — all trunks with live status + alert state
 * GET  /api/trunks/:id   — single trunk details + alert state
 * POST /api/trunks/poll  — trigger an immediate poll cycle
 */

const express      = require('express');
const router       = express.Router();
const trunkService = require('../services/trunkService');

// GET /api/trunks
router.get('/', async (req, res) => {
  try {
    const result = await trunkService.getAll();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /trunks/poll  — before /:id to avoid route conflict
router.post('/poll', async (req, res) => {
  try {
    const result = await trunkService.forcePoll();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/trunks/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await trunkService.getById(req.params.id);
    if (!result.trunk) return res.status(404).json({ success: false, error: `Trunk ${req.params.id} not found` });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
