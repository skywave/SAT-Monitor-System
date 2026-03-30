import { supabase } from '../config/supabase'

// Helper: Convert status_text + latency to UI status
function getStatus(statusText, latency) {
  if (statusText === 'registration_failed' || statusText === 'unreachable' || statusText === 'down') {
    return 'down'
  }
  if (latency && latency > 100) {
    return 'warning'
  }
  return 'up'
}

// Helper: Convert timestamp to relative time
function getRelativeTime(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  
  if (diffSecs < 60) return `${diffSecs} secs ago`
  if (diffMins < 60) return `${diffMins} mins ago`
  const diffHours = Math.floor(diffMins / 60)
  return `${diffHours} hours ago`
}

// Get latest trunk status for dashboard
export async function getTrunks() {
  const { data, error } = await supabase
    .from('trunk_monitoring')
    .select('trunk_id, trunk_name, pbx_id, status_text, current_latency_ms, status_changed_at, last_checked')
    .order('last_checked', { ascending: false })
  
  if (error) {
    console.error('Error fetching trunks:', error)
    return []
  }
  
  // Group by trunk_id and get latest
  const trunkMap = new Map()
  data.forEach(trunk => {
    if (!trunkMap.has(trunk.trunk_id)) {
      trunkMap.set(trunk.trunk_id, trunk)
    }
  })
  
  // Transform to dashboard format
  return Array.from(trunkMap.values()).map(trunk => ({
    id: trunk.trunk_id,
    name: trunk.trunk_name,
    pbx: trunk.pbx_id || 'PBX1',
    status: getStatus(trunk.status_text, trunk.current_latency_ms),
    latency: trunk.current_latency_ms,
    lastChanged: getRelativeTime(trunk.status_changed_at)
  }))
}

// Get network status summary
export async function getNetworkStatus() {
  const { data, error } = await supabase
    .from('network_monitoring')
    .select('latency_ms, reachable')
    .order('timestamp', { ascending: false })
    .limit(10)
  
  if (error || !data.length) {
    return { status: 'unknown', avgLatency: 0, packetLoss: 0 }
  }
  
  const avgLatency = Math.round(
    data.reduce((sum, d) => sum + (d.latency_ms || 0), 0) / data.length
  )
  
  const packetLoss = data.filter(d => !d.reachable).length / data.length * 100
  
  return {
    status: avgLatency < 50 ? 'optimal' : avgLatency < 100 ? 'good' : 'degraded',
    avgLatency,
    packetLoss: Math.round(packetLoss)
  }
}