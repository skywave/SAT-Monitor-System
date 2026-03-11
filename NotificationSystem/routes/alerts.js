const express      = require('express');
const router       = express.Router();
const alertService = require('../services/alertService');

router.get('/state', (req, res) => {
  try   { res.json(alertService.getState()); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/test', async (req, res) => {
  try   { res.json(await alertService.sendTest(req.body)); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/reset/:trunkId', (req, res) => {
  try   { res.json(alertService.resetTrunk(req.params.trunkId)); }
  catch (err) { res.status(err.statusCode || 500).json({ success: false, error: err.message }); }
});

module.exports = router;
