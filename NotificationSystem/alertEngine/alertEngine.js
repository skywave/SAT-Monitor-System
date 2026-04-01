const collectorClient        = require('../config/collectorClient');
const AlertStateTracker      = require('./alertStateTracker');
const Notifier               = require('../notifier/notifier');
const logger                 = require('../config/logger');
const config                 = require('../config/config');
const { checkTrunkIPs }      = require('../collectors/pingCollector');
const { evaluateMetrics, evaluatePing } = require('../services/thresholdService');
const { getMetricsPerTrunk } = require('../collectors/trunkMetricsCollector');
const supabase               = require('../services/supabaseService');

class alertEngine {
  constructor() {
    this.tracker   = new AlertStateTracker();
    this.notifier  = new Notifier();
    this.pollTimer = null;
    this.running   = false;
    this.pollCount = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    logger.info('Alert Engine started');
    this._poll();
    this.pollTimer = setInterval(function() { instance._poll(); }, config.polling.intervalMs);
  }

  stop() {
    this.running = false;
    if (this.pollTimer) clearInterval(this.pollTimer);
    logger.info('Alert Engine stopped');
  }

  async _poll() {
    this.pollCount++;
    logger.debug('Poll #' + this.pollCount + ' starting...');
    await Promise.allSettled([
      this._pollTrunkStatus(),
      this._pollIPReachability(),
      this._pollMetrics(),
    ]);
  }

  async _pollTrunkStatus() {
    var trunks;
    try {
      trunks = await collectorClient.getTrunkStatuses();
    } catch (err) {
      logger.error('Could not reach collector: ' + err.message);
      return;
    }
    if (!trunks || trunks.length === 0) {
      logger.warn('No trunks returned from collector');
      return;
    }
    logger.debug('Trunk status: ' + trunks.length + ' trunk(s) checked');
    for (var i = 0; i < trunks.length; i++) {
      await this._evaluateTrunkStatus(trunks[i]);
    }
  }

  async _evaluateTrunkStatus(trunk) {
    var trunkId   = trunk.trunk_id || trunk.id   || trunk.name;
    var trunkName = trunk.name     || ('Trunk ' + trunkId);
    var trunkType = trunk.type     || trunk.trunk_type || 'SIP';
    var status;
    if      (trunk.status          !== undefined) status = String(trunk.status).toLowerCase();
    else if (trunk.trunk_status    !== undefined) status = String(trunk.trunk_status).toLowerCase();
    else if (trunk.enb_call_status !== undefined) status = trunk.enb_call_status === 1 ? 'registered' : 'unregistered';
    else status = 'unknown';
    if (!trunkId) return;
    logger.debug('Trunk ' + trunkName + ' (' + trunkId + ') status: ' + status);
    var result = this.tracker.evaluate(String(trunkId), status);
    supabase.saveTrunkStatus(trunk, status);
    if (!result.shouldAlert) return;
    await this.notifier.dispatch({
      trunkId:             String(trunkId),
      trunkName:           trunkName,
      trunkType:           trunkType,
      status:              status,
      alertType:           result.alertType,
      severity:            'CRITICAL',
      firstFailedAt:       result.state.firstFailedAt,
      consecutiveFailures: result.state.consecutiveFailures,
      detectedAt:          new Date(),
    });
  }

  async _pollIPReachability() {
    var ipResults;
    try {
      ipResults = await checkTrunkIPs();
    } catch (err) {
      logger.error('IP reachability check failed: ' + err.message);
      return;
    }
    logger.debug('IP check: ' + ipResults.size + ' trunk IP(s) checked');
    for (var entry of ipResults) {
      var pingResult = entry[1];
      supabase.saveIPCheck(pingResult);
      if (!pingResult.reachable) {
        var check = this.tracker.evaluateIP(pingResult.trunkId, false);
        if (!check.shouldAlert) continue;
        var breach = evaluatePing(pingResult);
        await this.notifier.dispatch(Object.assign({}, breach, { alertType: 'ip_unreachable' }));
      } else {
        var check2 = this.tracker.evaluateIP(pingResult.trunkId, true);
        if (!check2.shouldAlert) continue;
        await this.notifier.dispatch({
          trunkId:    pingResult.trunkId,
          trunkName:  pingResult.trunkName,
          alertType:  'ip_recovered',
          severity:   'OK',
          value:      pingResult.host,
          message:    pingResult.host + ':' + pingResult.port + ' is reachable again',
          detectedAt: new Date(),
        });
      }
    }
  }

  async _pollMetrics() {
    var metricsMap;
    try {
      var windowMinutes = parseInt(process.env.METRICS_WINDOW_MINUTES) || 60;
      metricsMap = await getMetricsPerTrunk(windowMinutes);
    } catch (err) {
      logger.error('Metrics poll failed: ' + err.message);
      return;
    }
    logger.debug('Metrics: ' + metricsMap.size + ' trunk(s) with CDR data');
    for (var entry of metricsMap) {
      var metrics  = entry[1];
      supabase.saveTrunkMetrics(metrics);
      var breaches = evaluateMetrics(metrics);
      for (var i = 0; i < breaches.length; i++) {
        var breach = breaches[i];
        var check  = this.tracker.evaluateThreshold(
          breach.trunkId, breach.metric, breach.value, breach.direction
        );
        if (!check.shouldAlert) continue;
        await this.notifier.dispatch(Object.assign({}, breach, { alertType: breach.alertType }));
      }
    }
  }
}

var instance = new alertEngine();
module.exports                    = instance;
module.exports.getTrackerInstance = function() { return instance.tracker; };
module.exports.triggerPoll        = function() { return instance._poll(); };