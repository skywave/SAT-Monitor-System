import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import TrunkDetail from '../components/TrunkDetail.vue'

const routes = [
  { path: '/', name: 'home', component: HelloWorld },
  { path: '/trunk/:id', name: 'trunk-detail', component: TrunkDetail, props: true },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
