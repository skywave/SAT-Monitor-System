/**
 * Checks IP reachability for each trunk's SIP provider host.
 * Uses TCP connect (no root needed) on port 5060.
 */

const net             = require('net');
const collectorClient = require('../config/collectorClient');
const logger          = require('../config/logger');

/**
 * Check IP reachability for all trunk provider hosts
 * @returns {Map<string, object>} trunkId -> { host, port, reachable, latencyMs }
 */
async function checkTrunkIPs() {
  const trunks  = await collectorClient.getTrunkList();
  const results = new Map();

  for (const trunk of trunks) {
    const trunkId   = String(trunk.id || trunk.name);
    const trunkName = trunk.name || trunkId;

    // Skip peer trunks — they don't register, TCP ping is not meaningful
    if ((trunk.type || '').toLowerCase() === 'peer') {
      logger.debug('Trunk ' + trunkName + ': peer type, skipping ping');
      continue;
    }

    // Yeastar returns host_port as "10.40.1.30:5060"
    var hostPort = trunk.host_port || trunk.host || trunk.sip_host || trunk.domain || null;
    if (!hostPort || hostPort === '0.0.0.0' || hostPort === '') {
      logger.debug('Trunk ' + trunkName + ': no host configured, skipping ping');
      continue;
    }

    var host, port;
    if (hostPort.indexOf(':') !== -1) {
      var parts = hostPort.split(':');
      host = parts[0];
      port = parseInt(parts[1]) || 5060;
    } else {
      host = hostPort;
      port = parseInt(trunk.port || trunk.sip_port || 5060);
    }

    if (!host || host === '0.0.0.0') {
      logger.debug('Trunk ' + trunkName + ': invalid host, skipping ping');
      continue;
    }

    logger.debug(`Pinging trunk ${trunkName} → ${host}:${port}`);
    const { reachable, latencyMs } = await _tcpPing(host, port);

    results.set(trunkId, { trunkId, trunkName, host, port, reachable, latencyMs });
    logger.debug(`  ${trunkName}: reachable=${reachable}, latency=${latencyMs}ms`);
  }

  return results;
}

/**
 * TCP connect ping — resolves with reachability and latency
 */
function _tcpPing(host, port, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const start  = Date.now();
    const socket = new net.Socket();

    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      socket.destroy();
      resolve({ reachable: true, latencyMs: Date.now() - start });
    });

    socket.on('error',   () => { socket.destroy(); resolve({ reachable: false, latencyMs: timeoutMs }); });
    socket.on('timeout', () => { socket.destroy(); resolve({ reachable: false, latencyMs: timeoutMs }); });
  });
}

module.exports = { checkTrunkIPs };