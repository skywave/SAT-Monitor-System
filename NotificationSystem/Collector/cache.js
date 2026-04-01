/**
 * cache.js
 * In-memory cache for Yeastar data
 * Fetches from Yeastar on a schedule and serves instantly to notification service
 */

const yeastar = require('./yeastarClient');
const logger  = require('./logger');

const FETCH_INTERVAL = parseInt(process.env.FETCH_INTERVAL_MS) || 120000;

var cache = {
  trunks:     [],
  cdr:        [],
  systemInfo: null,
  lastFetch:  null,
  fetchCount: 0,
  errors:     [],
};

async function refresh() {
  cache.fetchCount++;
  logger.info('Cache refresh #' + cache.fetchCount + ' starting...');

  try {
    var trunks = await yeastar.fetchTrunks();
    cache.trunks = trunks;
    logger.info('Trunks cached: ' + trunks.length);
  } catch (err) {
    logger.error('Failed to fetch trunks: ' + err.message);
    cache.errors.push({ type: 'trunks', message: err.message, time: new Date() });
  }

  try {
    var cdr = await yeastar.fetchCDR(parseInt(process.env.CDR_PAGE_SIZE) || 100);
    cache.cdr = cdr;
    logger.info('CDR cached: ' + cdr.length + ' records');
  } catch (err) {
    logger.error('Failed to fetch CDR: ' + err.message);
    cache.errors.push({ type: 'cdr', message: err.message, time: new Date() });
  }

  try {
    cache.systemInfo = await yeastar.fetchSystemInfo();
  } catch (err) {
    logger.error('Failed to fetch system info: ' + err.message);
  }

  cache.lastFetch = new Date();
  // Keep only last 10 errors
  if (cache.errors.length > 10) cache.errors = cache.errors.slice(-10);
  logger.info('Cache refresh #' + cache.fetchCount + ' complete');
}

function start() {
  // Initial fetch
  refresh();
  // Schedule recurring fetch
  setInterval(refresh, FETCH_INTERVAL);
  logger.info('Cache scheduler started — interval: ' + (FETCH_INTERVAL / 1000) + 's');
}

function getTrunks()     { return cache.trunks; }
function getCDR()        { return cache.cdr; }
function getSystemInfo() { return cache.systemInfo; }
function getStatus() {
  return {
    lastFetch:   cache.lastFetch,
    fetchCount:  cache.fetchCount,
    trunkCount:  cache.trunks.length,
    cdrCount:    cache.cdr.length,
    recentErrors:cache.errors.slice(-5),
    intervalMs:  FETCH_INTERVAL,
  };
}

module.exports = { start, getTrunks, getCDR, getSystemInfo, getStatus };