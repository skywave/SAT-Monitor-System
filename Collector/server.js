require('dotenv').config();
const express = require('express');
const logger  = require('./logger');
const cache   = require('./cache');
const routes  = require('./routes');

const PORT = 3001
const app  = express();

app.use(express.json());
app.use('/api', routes);

// 404
app.use(function(req, res) {
  res.status(404).json({ success: false, error: 'Route not found: ' + req.method + ' ' + req.path });
});

// Start cache scheduler
cache.start();

// Start server
app.listen(PORT, function() {
  logger.info('SAT Monitor Collector running on port ' + PORT);
  logger.info('Yeastar base : ' + (process.env.YEASTAR_BASE || 'https://labs1.ras.yeastar.com'));
  logger.info('Fetch interval: ' + ((parseInt(process.env.FETCH_INTERVAL_MS) || 120000) / 1000) + 's');
});