<template>
  <v-container class="resource-single-page py-10">
    <v-btn variant="text" color="#2f4356" class="mb-6" to="/resources">
      « Volver a Recursos
    </v-btn>

    <v-row v-if="loading">
      <v-col cols="12" md="8" class="mx-auto">
        <v-skeleton-loader type="image, article, heading, paragraph@3" class="rounded-lg" />
      </v-col>
    </v-row>

    <v-row v-else-if="resource">
      <v-col cols="12" md="9" class="mx-auto">
        <article>
          <v-img 
            v-if="resource.featuredImage" 
            :src="resource.featuredImage" 
            :alt="resource.title" 
            max-height="450" 
            class="rounded-lg mb-6"
            cover 
          />

          <h1 class="resource-title-single mb-2">{{ resource.title }}</h1>
          <div class="resource-meta-single mb-6 text-muted">
            Publicado el: {{ formatDate(resource.date) }}
          </div>

          <v-divider class="mb-6"></v-divider>

          <div class="resource-content-single" v-html="resource.content || resource.excerpt"></div>
          
          <div v-if="resource.permalink" class="mt-8">
            <v-btn color="#2f4356" size="large" :href="resource.permalink" target="_blank">
              Ver Enlace Original
            </v-btn>
          </div>
        </article>
      </v-col>
    </v-row>

    <v-row v-if="!loading && !resource">
      <v-col cols="12" md="6" class="mx-auto">
        <v-alert type="error" variant="tonal">
          No se pudo encontrar el recurso solicitado o no tienes permisos para verlo.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Si tu composable "useContent" no está preparado para retornar un objeto único,
// hacemos un fetch directo a tu Netlify Function optimizado para single.
const route = useRoute()
const resource = ref(null)
const loading = ref(true)

onMounted(async () => {
  await fetchSingleResource()
})

async function fetchSingleResource() {
  loading.value = true
  try {
    const slug = route.params.slug
    // Recuperar el token de tu sistema de Auth (ej: localStorage, cookies o pinia)
    const token = localStorage.getItem('auth_token') // Ajusta esto a tu sistema de auth

    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Llamada a tu Netlify Function pasándole el slug
    const response = await fetch(`/.netlify/functions/resources?slug=${slug}`, { headers })
    
    if (!response.ok) throw new Error('Error al obtener el recurso')
    
    const data = await response.json()
    
    // Tu Netlify Function devuelve un objeto { items: [...] }
    if (data.items && data.items.length > 0) {
      resource.value = data.items[0]
    }
  } catch (error) {
    console.error('Error fetching single resource:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.resource-single-page {
  background: #ffffff;
  min-height: 100vh;
}

.resource-title-single {
  font-size: 2.5rem;
  color: #29465b;
  font-weight: 300;
  line-height: 1.2;
}

.resource-meta-single {
  font-size: 0.95rem;
  color: #7f8c8d;
}

.resource-content-single {
  font-size: 1.15rem;
  line-height: 1.8;
  color: #333333;
}

/* Ajustes para inyectar estilos al v-html si es necesario */
.resource-content-single :deep(p) {
  margin-bottom: 1.5rem;
}
</style>