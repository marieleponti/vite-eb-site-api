import { onRequestPost as __api_auth_js_onRequestPost } from "/home/mariele/dev/projects/vue-for-eb/vite-frontend-eb-wp-api/eb-vue-vite/functions/api/auth.js"
import { onRequestPost as __api_contact_js_onRequestPost } from "/home/mariele/dev/projects/vue-for-eb/vite-frontend-eb-wp-api/eb-vue-vite/functions/api/contact.js"
import { onRequestGet as __api_filters_js_onRequestGet } from "/home/mariele/dev/projects/vue-for-eb/vite-frontend-eb-wp-api/eb-vue-vite/functions/api/filters.js"
import { onRequestGet as __api_me_js_onRequestGet } from "/home/mariele/dev/projects/vue-for-eb/vite-frontend-eb-wp-api/eb-vue-vite/functions/api/me.js"
import { onRequestGet as __api_posts_js_onRequestGet } from "/home/mariele/dev/projects/vue-for-eb/vite-frontend-eb-wp-api/eb-vue-vite/functions/api/posts.js"
import { onRequestGet as __api_resources_js_onRequestGet } from "/home/mariele/dev/projects/vue-for-eb/vite-frontend-eb-wp-api/eb-vue-vite/functions/api/resources.js"

export const routes = [
    {
      routePath: "/api/auth",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_js_onRequestPost],
    },
  {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contact_js_onRequestPost],
    },
  {
      routePath: "/api/filters",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_filters_js_onRequestGet],
    },
  {
      routePath: "/api/me",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_me_js_onRequestGet],
    },
  {
      routePath: "/api/posts",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_posts_js_onRequestGet],
    },
  {
      routePath: "/api/resources",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_resources_js_onRequestGet],
    },
  ]