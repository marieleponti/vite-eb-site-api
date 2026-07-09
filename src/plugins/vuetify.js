import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'eb',
    themes: {
      eb: {
        dark: false,
        colors: {
          primary: '#2b3f47',
          secondary: '#f5c670',
          accent: '#E0824B',
          error: '#B00020',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
})