import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue')
  },
    {
    path: '/ebcommunity',
    name: 'login',
    component: () => import('../components/Login.vue')
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
  },
  {
    path: '/featured-research',
    name: 'featured_research',
    component: () => import('../views/FeaturedResearch.vue')
  },
  {
    path: '/prr',
    name: 'public_records_requests',
    component: () => import('../views/PublicRecordsRequests.vue')
  },
  {
  path: '/resources/:slug',
  name: 'ResourceSingle',
  component: () => import('@/views/ResourceSingle.vue'),
  props: true // Permite pasar el :slug como prop directamente al componente
  },
  {
  path: '/blog/:slug',
  name: 'BlogSingle',
  component: () => import('@/views/BlogSingle.vue')
  },
  {
    path: '/featured-research/:slug',
    name: 'MinibriefSingle',
    component: () => import('../views/MinibriefSingle.vue'),
    props: true
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔐 AUTH GUARD
// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('jwt')

//   if (to.path !== '/login' && !token) {
//     next('/login')
//   } else {
//     next()
//   }
// })

export default router
