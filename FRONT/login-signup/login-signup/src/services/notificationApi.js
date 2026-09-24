/**
 * src/services/notificationApi.js
 * Central API helper for all notification service calls.
 */

const BASE = process.env.REACT_APP_NOTIFICATION_API || 'http://localhost:5000';

async function api(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error || body?.message) message = body.error || body.message;
    } catch {}
    throw new Error(`API error [${url}]: ${message}`);
  }
  return res.json();
}

export const notificationApi = {

  // ── Alert history ───────────────────────────────────────────────────────────
  getSummary: () =>
    api(`${BASE}/notifications/summary`),

  getRecent: () =>
    api(`${BASE}/notifications/recent`),

  getHistory: (limit = 50, offset = 0) =>
    api(`${BASE}/notifications/history?limit=${limit}&offset=${offset}`),

  getTrunkHistory: (trunkId, limit = 50) =>
    api(`${BASE}/notifications/history/${trunkId}?limit=${limit}`),

  // ── Trunks ──────────────────────────────────────────────────────────────────
  getTrunks: () =>
    api(`${BASE}/trunks`),

  getAlertState: () =>
    api(`${BASE}/alerts/state`),

  forcePoll: () =>
    api(`${BASE}/trunks/poll`, { method: 'POST' }),

  resetTrunk: (trunkId) =>
    api(`${BASE}/trunks/${trunkId}/reset`, { method: 'POST' }),

  // ── Alert engine controls ───────────────────────────────────────────────────
  getEngineStatus: () =>
    api(`${BASE}/alerts/engine/status`),

  startEngine: () =>
    api(`${BASE}/alerts/engine/start`, { method: 'POST' }),

  stopEngine: () =>
    api(`${BASE}/alerts/engine/stop`, { method: 'POST' }),

  // ── Recipients ──────────────────────────────────────────────────────────────
  getRecipients: (trunkId = null) => {
    const url = trunkId
      ? `${BASE}/notifications/recipients?trunkId=${trunkId}`
      : `${BASE}/notifications/recipients`;
    return api(url);
  },

  addRecipient: (data) =>
    api(`${BASE}/notifications/recipients`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }),

  updateRecipient: (id, data) =>
    api(`${BASE}/notifications/recipients/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }),

  deleteRecipient: (id) =>
    api(`${BASE}/notifications/recipients/${id}`, { method: 'DELETE' }),

  // ── Thresholds ──────────────────────────────────────────────────────────────
  getAllThresholds: () =>
    api(`${BASE}/notifications/thresholds`),

  getTrunkThresholds: (trunkId) =>
    api(`${BASE}/notifications/thresholds/${trunkId}`),

  updateTrunkThresholds: (trunkId, data) =>
    api(`${BASE}/notifications/thresholds/${trunkId}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }),

  resetTrunkThresholds: (trunkId) =>
    api(`${BASE}/notifications/thresholds/${trunkId}`, { method: 'DELETE' }),
};