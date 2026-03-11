/**
 */

const express       = require('express');
const router        = express.Router();
const healthService = require('../services/healthService');

router.get('/', async (req, res) => {
  try {
    const result = await healthService.check();
    const status = result.collector.reachable ? 200 : 503;
    res.status(status).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
