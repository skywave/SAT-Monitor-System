const axios  = require('axios');
const config = require('./config');
const logger = require('./logger');

const client = axios.create({
  baseURL: config.collector.baseUrl,
  timeout: config.collector.timeout,
  headers: { 'Content-Type': 'application/json' },
});

// Yeastar P-Series trunk status codes
// Only status 1 = healthy. Everything else = problem.
var STATUS_CODES = {              
  1:  'registered',                                                                   
  41: 'registration failed',           
  42: 'unreachable', 
  43: 'unavailable', 
  44: 'disabled',
  45: 'authentication failed',          
};

function decodeStatus(code) {
  var text = STATUS_CODES[code];
  if (text) return text;
  // Any unknown code is treated as a problem
  return 'failed';
}

function unwrap(data) {
  if (Array.isArray(data))        return data;
  if (Array.isArray(data.data))   return data.data;
  if (Array.isArray(data.trunks)) return data.trunks;
  return [];
}

async function getTrunkStatuses() {
  try {
   
    const res  = await client.get('/api/trunk/list');
    const list = unwrap(res.data);

    const normalised = list.map(function(trunk) {
      var statusText = decodeStatus(trunk.status);
      return {
        trunk_id:   trunk.id   || trunk.trunk_id,
        name:       trunk.name,
        type:       trunk.type || 'SIP',
        host_port:  trunk.host_port || '',
        status:     statusText,
        raw_status: trunk.status,
      };
    });

    logger.debug('getTrunkStatuses: ' + normalised.length + ' trunks');
    normalised.forEach(function(t) {
      logger.debug('  ' + t.name + ' — raw:' + t.raw_status + ' decoded:' + t.status);
    });

    return normalised;
  } catch (err) {
    logger.error('getTrunkStatuses failed: ' + err.message);
    throw err;
  }
}

async function getTrunk(id) {
  try {
    const res = await client.post('/api/trunk/get', { id: String(id) });
    return res.data.data || res.data;
  } catch (err) {
    logger.error('getTrunk(' + id + ') failed: ' + err.message);
    return null;
  }
}

async function getTrunkList() {
  try {
    const res = await client.get('/api/trunk/list');
    return unwrap(res.data);
  } catch (err) {
    logger.error('getTrunkList failed: ' + err.message);
    return [];
  }
}

async function sendEmailViaCollector(to, subject, content) {
  logger.debug('sendEmailViaCollector called but PBX email is disabled');
  return null;
}

async function getSystemInfo() {
  try {
    const res = await client.get('/api/system/information');
    return res.data;
  } catch (err) {
    logger.error('getSystemInfo failed: ' + err.message);
    return null;
  }
}

async function searchCDR(timeFrom, timeTo, page, pageSize) {
  page     = page     || 1;
  pageSize = pageSize || 1000;
  try {
    const res = await client.post('/api/cdr/search', {
      time_from: timeFrom,
      time_to:   timeTo,
      page:      page,
      page_size: pageSize,
    });
    if (Array.isArray(res.data))        return res.data;
    if (Array.isArray(res.data.data))   return res.data.data;
    if (Array.isArray(res.data.cdr))    return res.data.cdr;
    return [];
  } catch (err) {
    logger.error('searchCDR failed: ' + err.message);
    return [];
  }
}

module.exports = {
  getTrunkStatuses:      getTrunkStatuses,
  getTrunk:              getTrunk,
  getTrunkList:          getTrunkList,
  sendEmailViaCollector: sendEmailViaCollector,
  getSystemInfo:         getSystemInfo,
  searchCDR:             searchCDR,
};
