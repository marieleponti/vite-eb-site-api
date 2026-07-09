import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

const WP_TARGET = 'https://dev-eb-vue.pantheonsite.io'

export default defineConfig({
  plugins: [vue(), vuetify()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      // existing endpoint
      '/api': {
        target: WP_TARGET,
        changeOrigin: true,
        rewrite: path => path.replace('/api', '/wp-json/inforepo/v1')
      },
      // custom resources + filters endpoint
      '/ebinforepo': {
        target: WP_TARGET,
        changeOrigin: true,
        rewrite: path => '/wp-json' + path
      },
      // standard WP REST API (posts, search, etc.)
      '/wp-json': {
        target: WP_TARGET,
        changeOrigin: true
      }
    }
  }
})