/**
 * routes.js
 * REST API endpoints — mirrors the original collector API
 * so the notification service needs zero changes
 */

const express = require('express');
const router  = express.Router();
const cache   = require('./cache');

// GET /api/health
router.get('/health', function(req, res) {
  var status = cache.getStatus();
  res.json({
    success:   true,
    service:   'SAT Monitor Collector',
    status:    status.lastFetch ? 'running' : 'starting',
    timestamp: new Date().toISOString(),
    cache:     status,
  });
});

// GET /api/trunk/list — trunk statuses
router.get('/trunk/list', function(req, res) {
  var trunks = cache.getTrunks();
  res.json({
    errcode:      0,
    errmsg:       'SUCCESS',
    total_number: trunks.length,
    data:         trunks,
  });
});

// GET /api/cdr/list — CDR records
router.get('/cdr/list', function(req, res) {
  var cdr  = cache.getCDR();
  var page = parseInt(req.query.page) || 1;
  var size = parseInt(req.query.page_size) || 500;
  var start = (page - 1) * size;
  var slice = cdr.slice(start, start + size);
  res.json({
    errcode:      0,
    errmsg:       'SUCCESS',
    total_number: cdr.length,
    data:         slice,
  });
});

// GET /api/system/information
router.get('/system/information', function(req, res) {
  var info = cache.getSystemInfo();
  if (!info) return res.status(503).json({ success: false, error: 'System info not available' });
  res.json(info);
});

// GET /api/cache/status — debug endpoint
router.get('/cache/status', function(req, res) {
  res.json(cache.getStatus());
});

module.exports = router;
