/**
 * Business logic for trunk data — fetching, enriching with alert state, polling
 */

const collectorClient = require('../config/collectorClient');
const engine          = require('../alertEngine/alertEngine');
const logger          = require('../config/logger');

/**
 * Get all trunks enriched with their current alert state
 */
async function getAll() {
  const trunks     = await collectorClient.getTrunkStatuses();
  const alertState = _getAlertState();

  const enriched = trunks.map(trunk => {
    const id = String(trunk.id || trunk.trunk_id || trunk.name);
    return { ...trunk, alertState: alertState[id] || null };
  });

  return { success: true, count: enriched.length, trunks: enriched };
}

/**
 * Get a single trunk by ID enriched with alert state
 * @param {string} id
 */
async function getById(id) {
  const trunk = await collectorClient.getTrunk(id);
  if (!trunk) return { success: false, trunk: null };

  const alertState = _getAlertState();

  return {
    success:    true,
    trunk,
    alertState: alertState[String(id)] || null,
  };
}

/**
 * Trigger an immediate poll cycle outside the regular interval
 */
async function forcePoll() {
  logger.info('Manual poll triggered via API');
  await engine.triggerPoll();
  return { success: true, message: 'Poll cycle triggered', timestamp: new Date().toISOString() };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _getAlertState() {
  const tracker = engine.getTrackerInstance();
  return tracker ? tracker.getSummary() : {};
}

module.exports = { getAll, getById, forcePoll };
