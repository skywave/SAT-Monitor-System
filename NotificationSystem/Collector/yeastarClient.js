/**
 * yeastarClient.js
 * Handles Yeastar cloud API auth and data fetching
 */

const axios  = require('axios');
const logger = require('./logger');

const BASE     = process.env.YEASTAR_BASE     || 'https://labs1.ras.yeastar.com';
const USERNAME = process.env.YEASTAR_USERNAME;
const PASSWORD = process.env.YEASTAR_PASSWORD;

var accessToken = null;
var tokenExpiry = null;

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

async function getToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry - 30000) {
    return accessToken;
  }
  var res = await axios.post(BASE + '/openapi/v1.0/get_token', {
    username: USERNAME,
    password: PASSWORD,
  }, { timeout: 10000 });

  if (res.data.errcode !== 0) {
    throw new Error('Yeastar auth failed: ' + res.data.errmsg);
  }

  accessToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.access_token_expire_time || 1800) * 1000;
  logger.info('Yeastar token refreshed');
  return accessToken;
}

async function apiGet(path, extraParams, timeout) {
  var token  = await getToken();
  var params = Object.assign({ access_token: token }, extraParams || {});
  var res    = await axios.get(BASE + path, { params: params, timeout: timeout || 10000 });
  return res.data;
}

async function fetchTrunks() {
  var data = await apiGet('/openapi/v1.0/trunk/list');
  var list = Array.isArray(data) ? data : (data.data || data.trunks || []);
  return list.map(function(t) {
    return {
      id:         t.id,
      trunk_id:   t.id,
      name:       t.name,
      type:       t.type,
      host_port:  t.host_port,
      status:     typeof t.status === 'number' ? decodeStatus(t.status) : String(t.status || 'unknown'),
      raw_status: t.status,
    };
  });
}

async function fetchCDR(pageSize) {
  pageSize = pageSize || 500;
  var data = await apiGet('/openapi/v1.0/cdr/list', { page: 1, page_size: pageSize }, 30000);
  if (Array.isArray(data))        return data;
  if (Array.isArray(data.data))   return data.data;
  if (Array.isArray(data.cdr))    return data.cdr;
  return [];
}

async function fetchSystemInfo() {
  try {
    return await apiGet('/openapi/v1.0/system/information');
  } catch (err) {
    return null;
  }
}

module.exports = { fetchTrunks, fetchCDR, fetchSystemInfo };