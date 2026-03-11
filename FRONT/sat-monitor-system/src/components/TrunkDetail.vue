<template>
  <div class="trunk-detail">
    <h1>Trunk Details</h1>
    <div class="card">
      <div class="card-title">ID</div>
      <div class="card-value">{{ trunk.trunk_id }}</div>
    </div>
    <div class="card">
      <div class="card-title">Name</div>
      <div class="card-value">{{ trunk.trunk_name }}</div>
    </div>
    <div class="card">
      <div class="card-title">IP Address</div>
      <div class="card-value">{{ trunk.registered_ip || 'N/A' }}</div>
    </div>
    <div class="card">
      <div class="card-title">Status</div>
      <div class="card-value">{{ trunk.status_text || 'unknown' }}</div>
    </div>
    <div class="card">
      <div class="card-title">Last Updated</div>
      <div class="card-value">{{ trunk.last_updated || '—' }}</div>
    </div>

    <div class="section">
      <div class="section-title">Ping Logs</div>
      <table class="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Response (ms)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in pingLogs" :key="log.ping_id">
            <td>{{ log.created_at }}</td>
            <td>{{ log.response_time_ms }}</td>
            <td>{{ log.status }}</td>
          </tr>
          <tr v-if="pingLogs.length === 0"><td colspan="3" class="empty">No ping records</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface Trunk {
  trunk_id: number
  trunk_name: string
  registered_ip?: string
  status_text?: string
  type?: string
  last_updated?: string
}

// ping logs are not part of the monitoring API; they will be left empty
interface PingLog {
  ping_id: number
  response_time_ms: number
  status: string
  created_at: string
}

const route = useRoute()
const idParam = route.params.id as string
const trunk = ref<Trunk>({ trunk_id: 0, trunk_name: '', registered_ip: '', status_text: '', type: '', last_updated: '' })
const pingLogs = ref<PingLog[]>([])

async function fetchData() {
  if (!idParam) return
  try {
    const res = await fetch('/api/monitoring/status')
    if (res.ok) {
      const status = await res.json()
      const found = (status.trunks || []).find((t: any) => String(t.trunk_id) === idParam)
      if (found) {
        trunk.value = {
          trunk_id: found.trunk_id,
          trunk_name: found.trunk_name || found.name,
          registered_ip: found.registered_ip,
          status_text: found.status_text,
          type: found.type,
          last_updated: found.last_updated,
        }
      }
    }
  } catch (err) {
    console.error('failed to fetch trunk', err)
  }
  // ping log retrieval can remain unchanged if endpoint exists
  try {
    const r2 = await fetch(`/api/ping_logs?trunk_id=${idParam}`)
    if (r2.ok) {
      pingLogs.value = await r2.json()
    }
  } catch (err) {
    console.error('failed to fetch ping logs', err)
  }
}

onMounted(fetchData)
</script>

<style scoped>
/* rely on global style.css; add a small margin */
.trunk-detail {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
}
</style>
