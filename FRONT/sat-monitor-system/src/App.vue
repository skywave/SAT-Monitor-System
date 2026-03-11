<script setup lang="ts">
// No longer importing hello world directly; routing will display components.
</script>

<template>
  <div id="app">
    <nav style="margin-bottom:1rem;">
      <router-link to="/" style="margin-right:1rem;">Home</router-link>
      <!-- example trunk link; replace id with real value once available -->
      <router-link to="/trunk/1">Trunk 1</router-link>
    </nav>
    <router-view />
  </div>
</template>

