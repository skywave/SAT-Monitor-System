<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { defineProps } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)

interface Trunk {
  trunk_id: number
  trunk_name: string
  registered_ip?: string
}
const trunks = ref<Trunk[]>([])

async function loadTrunks() {
  try {
    const res = await fetch('/api/monitoring/status')
    if (res.ok) {
      const data = await res.json()
      trunks.value = (data.trunks || []).map((t: any) => ({
        trunk_id: t.trunk_id,
        trunk_name: t.trunk_name || t.name,
        registered_ip: t.registered_ip || t.ip_address,
      }))
    }
  } catch (e) {
    console.error('could not load trunks', e)
  }
}

onMounted(loadTrunks)
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>
    <p>Below is a sample trunk list fetched from the backend; click an entry to see details.</p>
    <ul>
      <li v-for="tr in trunks" :key="tr.trunk_id">
        <router-link :to="`/trunk/${tr.trunk_id}`">{{ tr.trunk_name }} ({{ tr.registered_ip || 'N/A' }})</router-link>
      </li>
      <li v-if="trunks.length === 0">No trunks available</li>
    </ul>

    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
      <p>
        Edit
        <code>components/HelloWorld.vue</code> to test HMR
      </p>
    </div>

    <p>
      Check out
      <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
        >create-vue</a
      >, the official Vue + Vite starter
    </p>
    <p>
      Learn more about IDE Support for Vue in the
      <a
        href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
        target="_blank"
        >Vue Docs Scaling up Guide</a
      >.
    </p>
    <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
