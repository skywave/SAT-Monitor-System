const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LEVELS    = { debug: 0, info: 1, warn: 2, error: 3 };
const current   = LEVELS[LOG_LEVEL] || 1;

function log(level, msg) {
  if (LEVELS[level] >= current) {
    console.log('[' + new Date().toISOString() + '] [' + level.toUpperCase().padEnd(5) + '] ' + msg);
  }
}

module.exports = {
  debug: function(m) { log('debug', m); },
  info:  function(m) { log('info',  m); },
  warn:  function(m) { log('warn',  m); },
  error: function(m) { log('error', m); },
};
