// src/services/monitoringService.js
import { api } from '../config/api';

// Helper functions (same as before)
function getStatus(statusText, latency) {
  if (statusText === 'registration_failed' || statusText === 'unreachable' || 
      statusText === 'down' || statusText === 'disabled') {
    return 'down';
  }
  if (latency && latency > 100) {
    return 'warning';
  }
  return 'up';
}

function getRelativeTime(timestamp) {
  if (!timestamp) return 'Never';
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return `${diffSecs} secs ago`;
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

export async function getTrunks() {
  try {
    const data = await api.getTrunks();
    const trunkMap = new Map();
    data.forEach(trunk => {
      if (!trunkMap.has(trunk.trunk_id)) {
        trunkMap.set(trunk.trunk_id, trunk);
      }
    });
    return Array.from(trunkMap.values()).map(trunk => ({
      id: trunk.trunk_id,
      name: trunk.trunk_name,
      pbx: trunk.pbx_id || 'PBX1',
      status: getStatus(trunk.status_text, trunk.current_latency_ms),
      latency: trunk.current_latency_ms,
      lastChanged: getRelativeTime(trunk.status_changed_at)
    }));
  } catch (error) {
    console.error('Error fetching trunks:', error);
    return [];
  }
}

export async function getNetworkStatus() {
  try {
    return await api.getNetworkStatus();
  } catch (error) {
    console.error('Error fetching network status:', error);
    return { status: 'unknown', avgLatency: 0, packetLoss: 0 };
  }
}

export async function getAlerts() {
  try {
    return await api.getAlerts();
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

export async function getCallStats() {
  try {
    return await api.getCallStats();
  } catch (error) {
    console.error('Error fetching call stats:', error);
    return { active: 0, failed: 0, unanswered: 0, rejected: 0 };
  }
}