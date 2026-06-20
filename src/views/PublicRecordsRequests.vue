<template>
  <v-container fluid class="eb-public-records-requests-page-container pa-0">
    
    <div class="px-4 pt-4 mb-4">
      <h2 class="secondfont section-title border-bottom-prr pb-2 mb-4">
        Public Records Requests
      </h2>
    </div>

    <v-container fluid class="px-4 pt-0 pb-4">
      <p class="intro-text">
        Most of the policies, practices, and players associated with US border externalization are intentionally 
        obscured and those proliferating harmful impacts can act with impunity. There have been numerous efforts by advocates to learn 
        more about US border policing and externalization processes. Below is a collection of public records requests on these issues.
      </p>
    </v-container>

    <v-container fluid class="px-4 pb-8">
      <h3 class="secondfont mb-4 section-title-underlined">Featured Cases</h3>
      
      <v-row v-if="loadingFeatured">
        <v-col v-for="n in 3" :key="n" cols="12" md="4">
          <v-skeleton-loader type="article" class="rounded-0 border" />
        </v-col>
      </v-row>

      <v-row v-else-if="featuredCases.length">
        <v-col v-for="item in featuredCases" :key="item.id" cols="12" md="4">
          <v-card class="case-item h-100 d-flex flex-column rounded-0" elevation="1" variant="outlined">
            <v-card-item class="flex-grow-1 pa-4">
              <v-card-title class="post-title text-wrap eb-mn-tarjeta-post-titulo mb-2">
                <a :href="item.permalink || item.link" target="_blank" rel="noopener noreferrer">
                  {{ item.title?.rendered || item.title }}
                </a>
              </v-card-title>
              
              <v-card-text class="pa-0 prr-item-description eb-mn-tarjeta-post-descripcion text-body-2">
                {{ obtenerDescripcion(item) }}
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <div class="read-more eb-mn-tarjeta-post-boton-leer-container mt-4">
        <v-btn 
          href="#!" 
          variant="outlined" 
          class="eb-mn-tarjeta-post-boton-leer rounded-0 text-none font-weight-bold"
          color="#2b3f47"
        >
          more cases
        </v-btn>
      </div>
    </v-container>

    <v-container fluid class="px-4 pb-8 bg-updates-section">
      <h3 class="secondfont mb-4 section-title-underlined">Updates</h3>

      <v-row v-if="loadingUpdates">
        <v-col v-for="n in 3" :key="n" cols="12" md="4">
          <v-skeleton-loader type="article" class="rounded-0" />
        </v-col>
      </v-row>

      <v-row v-else-if="updates.length">
        <v-col v-for="item in updates" :key="item.id" cols="12" md="4">
          <div class="news-item pb-4">
            <h5 class="post-title eb-mn-tarjeta-post-titulo mb-2 font-weight-bold">
              {{ item.title?.rendered || item.title }}
            </h5>
            
            <p class="prr-item-description eb-mn-tarjeta-post-descripcion text-body-2 mb-2 text-grey-darken-2">
              {{ obtenerDescripcion(item) }}
            </p>

            <div 
              class="updates-prr-content text-body-2" 
              v-html="item.content?.rendered || item.content"
            ></div>
          </div>
        </v-col>
      </v-row>

      <v-alert v-else type="info" variant="tonal" class="rounded-0">
        No news available at the moment.
      </v-alert>
    </v-container>

    <v-container fluid class="px-4 pb-8" id="docket">
      <h3 class="secondfont mb-4 section-title-underlined">Our Docket</h3>

      <v-row v-if="loadingDocket">
        <v-col v-for="n in 3" :key="n" cols="12" md="4">
          <v-skeleton-loader type="article" class="rounded-0 border" />
        </v-col>
      </v-row>

      <v-row v-else-if="docketFeed.length">
        <v-col v-for="item in docketFeed" :key="item.id" cols="12" md="4">
          <v-card class="docket-item h-100 d-flex flex-column rounded-0" elevation="1" variant="outlined">
            <v-card-item class="flex-grow-1 pa-4">
              <v-card-title class="post-title text-wrap eb-mn-tarjeta-post-titulo mb-2">
                <a :href="item.permalink || item.link" target="_blank" rel="noopener noreferrer">
                  {{ item.title?.rendered || item.title }}
                </a>
              </v-card-title>
              
              <v-card-text class="pa-0 prr-item-description eb-mn-tarjeta-post-descripcion text-body-2">
                {{ obtenerDescripcion(item) }}
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <div v-if="totalPages > 1" class="eb-mn-pagination mt-6 d-flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="5"
          @update:model-value="cambiarPaginaDocket"
          active-color="#2b3f47"
          variant="outlined"
          rounded="0"
        />
      </div>
    </v-container>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchResources, fetchPosts } from '@/api/services/wp.service'

// Estados Reactivos
const featuredCases = ref([])
const loadingFeatured = ref(true)
const updates = ref([])
const loadingUpdates = ref(true)
const docketFeed = ref([])
const loadingDocket = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)

// Replicando la lógica de substr de PHP para descripciones de 300 caracteres
function obtenerDescripcion(item) {
  const descRaw = item.acf?.description || item.excerpt?.rendered || item.content?.rendered || ''
  const sinHtml = descRaw.replace(/<[^>]*>/g, '').trim()
  if (sinHtml.length <= 300) return sinHtml
  return sinHtml.substring(0, 300) + ' ...'
}

// SECCIÓN 1: Trae de resources.js (Retorna objeto estructurado con propiedad .items)
async function getFeaturedCases() {
  loadingFeatured.value = true
  try {
    const query = '?page=1&per_page=3&source=public-records-requests&special-content=featured'
    const response = await fetchResources(query)
    featuredCases.value = response?.items || []
  } catch (err) {
    console.error('Error en Featured Cases:', err)
  } finally {
    loadingFeatured.value = false
  }
}

// SECCIÓN 2: Trae los posts y aplica el filtro de categoría exacto en el Frontend
async function getUpdates() {
  loadingUpdates.value = true
  try {
    // Pedimos los posts a Netlify sin query de búsqueda para que no se active el escudo estricto de JS
    const query = '?per_page=100'
    const response = await fetchPosts(query)
    
    const listaPosts = Array.isArray(response) ? response : (response?.items || [])

    // Filtramos en Vue buscando el slug exacto de tu categoría de WordPress
    const categoriaObjetivo = 'records-requests-news-and-analysis'
    
    const postsFiltrados = listaPosts.filter(post => {
      // 1. Intentar buscar en pure_taxonomies (común en respuestas optimizadas de WP)
      if (post.pure_taxonomies?.category) {
        return post.pure_taxonomies.category.some(cat => cat.slug === categoriaObjetivo)
      }
      
      // 2. Intentar buscar en el _embedded nativo de WordPress REST API
      if (post._embedded?.['wp:term']) {
        // Los términos son una matriz de matrices (categorías, tags, etc.)
        return post._embedded['wp:term'].flat().some(term => 
          term.taxonomy === 'category' && term.slug === categoriaObjetivo
        )
      }

      // 3. Si tu backend procesa el objeto de categorías plano
      if (Array.isArray(post.categories_data)) {
        return post.categories_data.some(cat => cat.slug === categoriaObjetivo)
      }

      // Si no encuentra las taxonomías, dejamos pasar el post temporalmente para no vaciar la sección
      return true 
    })

    // Replicamos el 'posts_per_page' => 3 del PHP original haciendo un slice
    updates.value = postsFiltrados.slice(0, 3)

  } catch (err) {
    console.error('Error en Updates:', err)
  } finally {
    loadingUpdates.value = false
  }
}

// SECCIÓN 3: Trae de resources.js (Estructura paginada)
async function getDocketFeed() {
  loadingDocket.value = true
  try {
    const query = '?page=1&per_page=3&source=public-records-requests&research-team=eb-research'
    const response = await fetchResources(query)
    
    docketFeed.value = response?.items || []
  } catch (err) {
    console.error('Error en Docket Feed:', err)
  } finally {
    loadingDocket.value = false
  }
}
//  loadingFeatured.value = true
//   try {
//     const query = '?page=1&per_page=3&source=public-records-requests&special-content=featured'
//     const response = await fetchResources(query)
//     featuredCases.value = response?.items || []
//   } catch (err) {
//     console.error('Error en Featured Cases:', err)
//   } finally {
//     loadingFeatured.value = false
//   }

function cambiarPaginaDocket(targetPage) {
  currentPage.value = targetPage
  getDocketFeed(targetPage)
  document.getElementById('docket')?.scrollIntoView({ behavior: 'smooth' })
}

// Inicialización
onMounted(() => {
  getFeaturedCases()
  getUpdates()
  getDocketFeed(1)
})
</script>

<style scoped>
.secondfont {
  font-family: "Staatliches", sans-serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.section-title {
  color: #2b3f47 !important;
}
.border-bottom-prr {
  border-bottom: 3px solid #6c757d !important;
}
.section-title-underlined {
  color: #2b3f47;
  border-bottom: 3px solid #6c757d;
  padding-bottom: 4px;
}
.intro-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #212529;
}
.post-title a {
  color: #2b3f47;
  text-decoration: none;
  font-size: 1.15rem;
  font-weight: 700;
  transition: color 0.2s ease;
}
.post-title a:hover {
  color: #03a87c;
}
.prr-item-description {
  color: #4b5563;
}
.bg-updates-section {
  background-color: #fcfdfc;
}
.updates-prr-content :deep(p) {
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #333;
}
.eb-mn-tarjeta-post-boton-leer {
  border: 1px solid #2b3f47 !important;
  color: #2b3f47 !important;
}
</style>