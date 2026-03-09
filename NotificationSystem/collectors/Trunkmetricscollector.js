/**
 * collectors/trunkMetricsCollector.js
 * Pulls CDR data and computes per-trunk metrics
 */

const collectorClient = require('../config/collectorClient');
const logger          = require('../config/logger');

const CODEC_KBPS = { 'G711': 64, 'G711U': 64, 'G711A': 64, 'G729': 8, 'G722': 64, 'G726': 32, 'OPUS': 40 };

async function getMetricsPerTrunk(windowMinutes) {
  windowMinutes    = windowMinutes || 5;
  var now          = Math.floor(Date.now() / 1000);
  var sinceTs      = now - (windowMinutes * 60);

  // Fetch all CDR records (no date filter — filter by timestamp in code)
  var records = await collectorClient.searchCDR(null, null, 1, 1000);

  // Filter to window and external calls only
  records = records.filter(function(r) {
    return r.timestamp >= sinceTs && (r.src_trunk || r.dst_trunk);
  });

  logger.debug('CDR: ' + records.length + ' external records in last ' + windowMinutes + 'm');

  var trunkMap = new Map();

  for (var i = 0; i < records.length; i++) {
    var record   = records[i];
    var trunkId  = record.src_trunk || record.dst_trunk;
    if (!trunkId) continue;

    if (!trunkMap.has(trunkId)) {
      trunkMap.set(trunkId, {
        trunkId:          trunkId,
        trunkName:        trunkId,
        totalCalls:       0,
        failedCalls:      0,
        noAnswerCalls:    0,
        rejectedCalls:    0,
        answeredCalls:    0,
        concurrentCalls:  0,
        totalDurationSec: 0,
        latencySamples:   [],
        codecSamples:     [],
      });
    }

    var m           = trunkMap.get(trunkId);
    var disposition = (record.disposition || '').toUpperCase();
    var talkDur     = parseInt(record.talk_duration || record.duration || 0);
    var ringDur     = parseInt(record.ring_duration || 0);

    m.totalCalls++;

    if      (disposition === 'FAILED'    || disposition === 'BUSY')       m.failedCalls++;
    else if (disposition === 'NO ANSWER' || disposition === 'NOANSWER')   m.noAnswerCalls++;
    else if (disposition === 'REJECTED'  || disposition === 'CANCEL')     m.rejectedCalls++;
    else if (disposition === 'ANSWERED') {
      m.answeredCalls++;
      m.totalDurationSec += talkDur;
    }

    if (talkDur === 0 && ringDur === 0) m.concurrentCalls++;
    if (ringDur > 0) m.latencySamples.push(ringDur * 100); // ring_duration in seconds, convert to approx ms

    var codec = (record.codec || 'G711').toUpperCase();
    m.codecSamples.push(codec);
  }

  for (var entry of trunkMap) {
    var m       = entry[1];
    m.avgLatencyMs  = m.latencySamples.length
      ? Math.round(m.latencySamples.reduce(function(a, b) { return a + b; }, 0) / m.latencySamples.length)
      : 0;
    var codec       = _mode(m.codecSamples) || 'G711';
    m.bandwidthKbps = (m.concurrentCalls || 1) * (CODEC_KBPS[codec] || 64) * 2;
    m.dominantCodec = codec;
    delete m.latencySamples;
    delete m.codecSamples;
  }

  return trunkMap;
}

function _mode(arr) {
  if (!arr.length) return null;
  var freq = {};
  for (var i = 0; i < arr.length; i++) freq[arr[i]] = (freq[arr[i]] || 0) + 1;
  return Object.keys(freq).reduce(function(a, b) { return freq[a] > freq[b] ? a : b; });
}

module.exports = { getMetricsPerTrunk };