import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue')
  },
  {
    path: '/crud',
    name: 'crud',
    component: () => import('../views/Crud.vue')
  },
  {
    path: '/blog',
    name: 'blog',
    component: () => import('../views/BlogPage.vue')
  },
  {
    path: '/resources',
    name: 'resources',
    component: () => import('../views/ResourcesPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
