import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/styles/main.css'
// Vuetify
import vuetify from './plugins/vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import i18n from './i18n'


createApp(App)
  .use(router)
  .use(vuetify)
  .use(i18n)
  .mount('#app')