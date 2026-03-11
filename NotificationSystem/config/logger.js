/**
 * Timestamped console + file logger
 */

const fs   = require('fs');
const path = require('path');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FILE  = process.env.LOG_FILE  || './logs/notifications.log';

const levels = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = levels[LOG_LEVEL] ?? 1;

const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const colours = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m' };

function write(level, msg) {
  if (levels[level] < currentLevel) return;
  const timestamp = new Date().toISOString();
  const text      = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  const line      = `[${timestamp}] [${level.toUpperCase().padEnd(5)}] ${text}`;
  console.log(`${colours[level]}${line}${colours.reset}`);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (_) {}
}

module.exports = {
  debug: (m) => write('debug', m),
  info:  (m) => write('info',  m),
  warn:  (m) => write('warn',  m),
  error: (m) => write('error', m),
};
