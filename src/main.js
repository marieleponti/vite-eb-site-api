import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/styles/main.css'
// Vuetify
import vuetify from './plugins/vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app')