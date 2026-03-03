require('dotenv').config();

const app    = require('./app');
const engine = require('./alertEngine/alertEngine');
const logger = require('./config/logger');
const config = require('./config/config');

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, function() {
  logger.info('Notification Service running on port ' + PORT);
  logger.info('Collector URL : ' + config.collector.baseUrl);
  logger.info('Poll interval : ' + (config.polling.intervalMs / 1000) + 's');
});

engine.start();

function shutdown(signal) {
  logger.info(signal + ' received - shutting down...');
  engine.stop();
  server.close(function() {
    logger.info('HTTP server closed');
    process.exit(0);
  });
}

process.on('SIGINT',  function() { shutdown('SIGINT');  });
process.on('SIGTERM', function() { shutdown('SIGTERM'); });

module.exports = server;
