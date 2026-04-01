/**
 * config/collectorClient.js
 * Talks to the local collector running on localhost:3000
 * The collector handles all Yeastar API calls and caching
 */

const axios  = require('axios');
const config = require('./config');
const logger = require('./logger');

const client = axios.create({
  baseURL: config.collector.baseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

var STATUS_CODES = {             // trunk turned off in config
  1:  'registered',            // OK — the only healthy state
  2:  'busy',          // not registered
  3:  'idle and unmonitored',          // registration in progress
  4:  'registering',                // trying to connect              // registration failed
  41: 'registration failed',           // host not reachable
  42: 'Trunk is Unreachable', // wrong username/password
  43: 'unavailable',
  44:  'disabled', 
  45:  'authentication failed',              // provider unavailable
};
function decodeStatus(code) {
  return STATUS_CODES[code] || ('unknown(' + code + ')');
}

function unwrap(data) {
  if (Array.isArray(data))        return data;
  if (Array.isArray(data.data))   return data.data;
  if (Array.isArray(data.trunks)) return data.trunks;
  return [];
}

async function getTrunkStatuses() {
  try {
    var res  = await client.get('/api/trunk/list');
    var list = unwrap(res.data);
    var decoded = list.map(function(t) {
      var statusText = typeof t.status === 'number' ? decodeStatus(t.status) : String(t.status || 'unknown');
      return {
        id:         t.id,
        trunk_id:   t.id,
        name:       t.name,
        type:       t.type,
        host_port:  t.host_port,
        status:     statusText,
        raw_status: t.raw_status !== undefined ? t.raw_status : t.status,
      };
    });
    logger.debug('getTrunkStatuses: ' + decoded.length + ' trunks');
    decoded.forEach(function(t) {
      logger.debug('  ' + t.name + ' — raw:' + t.raw_status + ' decoded:' + t.status);
    });
    return decoded;
  } catch (err) {
    logger.error('getTrunkStatuses failed: ' + err.message);
    throw err;
  }
}

async function getTrunkList() {
  try {
    var res = await client.get('/api/trunk/list');
    return unwrap(res.data);
  } catch (err) {
    logger.error('getTrunkList failed: ' + err.message);
    return [];
  }
}

async function getTrunk(id) {
  try {
    var res = await client.get('/api/trunk/list');
    var list = unwrap(res.data);
    return list.find(function(t) { return String(t.id) === String(id); }) || null;
  } catch (err) {
    logger.error('getTrunk(' + id + ') failed: ' + err.message);
    return null;
  }
}

async function searchCDR(timeFrom, timeTo, page, pageSize) {
  page     = page     || 1;
  pageSize = pageSize || 100;
  try {
    var res = await client.get('/api/cdr/list', {
      params: { page: page, page_size: pageSize }
    });
    return unwrap(res.data);
  } catch (err) {
    logger.error('searchCDR failed: ' + err.message);
    return [];
  }
}

async function getSystemInfo() {
  try {
    var res = await client.get('/api/health');
    return res.data;
  } catch (err) {
    logger.error('getSystemInfo failed: ' + err.message);
    return null;
  }
}

async function sendEmailViaCollector(to, subject, content) {
  logger.debug('sendEmailViaCollector skipped — using SMTP directly');
}

module.exports = {
  getTrunkStatuses,
  getTrunkList,
  getTrunk,
  searchCDR,
  getSystemInfo,
  sendEmailViaCollector,
};