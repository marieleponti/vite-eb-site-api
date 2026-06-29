<template>
  <div class="container eb-public-records-requests-page-container">

    <div class="public-records-requests-heading section-heading">
      <h2 class="eb-default-font section-title">
        Public Records Requests
      </h2>
    </div>

    <p class="intro-text">
      Most of the policies, practices, and players associated with US border externalization are intentionally
      obscured and those proliferating harmful impacts can act with impunity. There have been numerous efforts by advocates to learn
      more about US border policing and externalization processes. Below is a collection of public records requests on these issues.
    </p>

    <!-- Featured Cases -->
    <section class="featured-cases">
      <div class="section-heading">
        <h2 class="eb-default-font section-title">Featured Cases</h2>
      </div>

      <div class="case-list">
        <template v-if="loadingFeatured">
          <div v-for="n in 3" :key="n" class="case-item">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line--short"></div>
          </div>
        </template>

        <template v-else>
          <div v-for="item in featuredCases" :key="item.id" class="case-item">
            <router-link :to="{ name: 'PublicRecordsRequestSingle', params: { slug: item.slug } }">
              <h5 class="post-title eb-mn-tarjeta-post-titulo">
                {{ item.title?.rendered || item.title }}
              </h5>
            </router-link>

              <div v-if="obtenerDescripcion(item)">
              <div class="prr-item-description eb-mn-tarjeta-post-descripcion">
                {{ obtenerDescripcion(item) }}
              </div>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!loadingFeatured && !featuredCases.length" class="empty-state">
        No featured cases available at the moment.
      </div>

      <div v-if="featuredHasMore" class="read-more eb-mn-tarjeta-post-boton-leer-container">
        <a
          href="#!"
          id="load-more"
          class="eb-mn-tarjeta-post-boton-leer rounded-0"
          :class="{ 'is-loading': loadingMoreFeatured }"
          @click.prevent="loadMoreFeaturedCases"
        >
          {{ loadingMoreFeatured ? 'loading...' : 'more cases' }}
        </a>
      </div>
    </section>

    <!-- Updates -->
    <section class="latest-news">
      <div class="section-heading">
        <h2 class="eb-default-font section-title">Updates</h2>
      </div>

      <div class="news-list">
        <template v-if="loadingUpdates">
          <div v-for="n in 3" :key="n" class="news-item">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line--short"></div>
          </div>
        </template>

        <template v-else-if="updates.length">
          <div v-for="item in updates" :key="item.id" class="news-item">
            <h5 class="post-title eb-mn-tarjeta-post-titulo">
              {{ item.title?.rendered || item.title }}
            </h5>

            <div v-if="obtenerDescripcion(item)">
              <div class="prr-item-description eb-mn-tarjeta-post-descripcion">
                {{ obtenerDescripcion(item) }}
              </div>
            </div>

            <div
              class="updates-prr-content"
              v-html="item.content?.rendered || item.content"
            ></div>
          </div>
        </template>

        <p v-else>No news available at the moment.</p>
      </div>
    </section>

    <!-- Our Docket -->
    <section class="docket-feed">
      <div class="section-heading">
        <h2 class="eb-default-font section-title" id="docket">Our Docket</h2>
      </div>

      <div class="docket-list">
        <template v-if="loadingDocket">
          <div v-for="n in 3" :key="n" class="docket-item">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line--short"></div>
          </div>
        </template>

        <template v-else-if="docketFeed.length">
          <div v-for="item in docketFeed" :key="item.id" class="docket-item">
            <router-link 
              :to="{ name: 'PublicRecordsRequestSingle', params: { slug: item.slug } }">
              <h5 class="post-title eb-mn-tarjeta-post-titulo">
                {{ item.title?.rendered || item.title }}
              </h5>
            </router-link>

            <div v-if="obtenerDescripcion(item)">
              <div class="prr-item-description eb-mn-tarjeta-post-descripcion">
                {{ obtenerDescripcion(item) }}
              </div>
            </div>
          </div>
        </template>

        <div v-else class="empty-state">
          No docket items available at the moment.
        </div>
      </div>

      <div v-if="totalPages > 1" id="inforepo-pagination" class="eb-mn-pagination">
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
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchResources, fetchPosts } from '@/api/services/wp.service'

// Estados Reactivos
const featuredCases = ref([])
const loadingFeatured = ref(true)
const featuredPage = ref(1)
const featuredTotalPages = ref(1)
const loadingMoreFeatured = ref(false)
const updates = ref([])
const loadingUpdates = ref(true)
const docketFeed = ref([])
const loadingDocket = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)

const featuredHasMore = computed(() => featuredPage.value < featuredTotalPages.value)

// Replicando la lógica de substr de PHP para descripciones de 300
// caracteres, pero cortando en el último espacio en vez de a mitad de
// palabra (PHP original también cortaba feo, esto es una mejora).
function obtenerDescripcion(item) {
  const descRaw = item.acf?.description || item.excerpt?.rendered || item.content?.rendered || ''
  const sinHtml = descRaw.replace(/<[^>]*>/g, '').trim()
  if (sinHtml.length <= 300) return sinHtml

  const cortado = sinHtml.substring(0, 300)
  const ultimoEspacio = cortado.lastIndexOf(' ')
  const sinCortarPalabra = ultimoEspacio > 0 ? cortado.substring(0, ultimoEspacio) : cortado

  return sinCortarPalabra + ' ...'
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

// SECCIÓN 1: Trae de resources.js (Retorna objeto estructurado con propiedad .items)
async function getFeaturedCases() {
  loadingFeatured.value = true
  try {
    const query = '?page=1&per_page=3&source=public-records-requests&special-content=featured'
    const response = await fetchResources(query)
    featuredCases.value = response?.items || []
    featuredPage.value = 1
    featuredTotalPages.value = response?.totalPages || 1
  } catch (err) {
    console.error('Error en Featured Cases:', err)
  } finally {
    loadingFeatured.value = false
  }
}

// "more cases": antes era un link sin funcionalidad (href="#!"). Ahora
// pide la siguiente página y AGREGA esos resultados a los que ya hay
// (no reemplaza), y el botón se esconde solo cuando no queda nada más
// para traer (ver featuredHasMore).
async function loadMoreFeaturedCases() {
  if (!featuredHasMore.value || loadingMoreFeatured.value) return

  loadingMoreFeatured.value = true
  try {
    const nextPage = featuredPage.value + 1
    const query = `?page=${nextPage}&per_page=3&source=public-records-requests&special-content=featured`
    const response = await fetchResources(query)
    featuredCases.value = [...featuredCases.value, ...(response?.items || [])]
    featuredPage.value = nextPage
    featuredTotalPages.value = response?.totalPages || featuredTotalPages.value
  } catch (err) {
    console.error('Error cargando más Featured Cases:', err)
  } finally {
    loadingMoreFeatured.value = false
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
/* .container venía del CSS viejo del tema WP (style.css), que esta app
   Vue probablemente nunca carga -- por eso no centraba ni limitaba el
   ancho. Se define acá mismo para no depender de que exista afuera. */
.container {
  width: min(95%, 120rem);
  margin: 0 auto;
}

/* Tipografía Cormorant para headings, como en el original (no Staatliches) */
.eb-default-font {
  font-family: 'Cormorant', serif;
}

.section-title {
  color: #2b3f47 !important;
  margin: 0;
}

/* Reemplaza las utilidades de Bootstrap (h4 pb-2 mb-4 border-bottom
   border-secondary border-3) que el original usaba y que este proyecto
   no tiene cargadas (acá es Vuetify, no Bootstrap). */
.section-heading {
  margin-top: 3rem;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 3px solid #6c757d;
}

.public-records-requests-heading {
  margin-top: 2rem;
}

.intro-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #212529;
  margin: 0 0 2rem 0;
}

/* Skeletons de carga: CSS propio, sin depender de las variables de
   color del theme de Vuetify (de ahí venía el rosado). */
.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: #e9ecef;
  margin-bottom: 10px;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

.skeleton-line--title {
  height: 20px;
  width: 60%;
  margin-bottom: 16px;
}

.skeleton-line--short {
  width: 40%;
  margin-bottom: 0;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Secciones: en el original cada <section> tiene su propio padding,
   fondo blanco, max-width centrado y separación entre secciones — acá
   antes se usaba <v-container fluid>, que no trae nada de esto. */
section {
  padding: 70px 20px;
  background-color: #fff;
  margin-bottom: 40px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.latest-news {
  background-color: #fcfdfc;
}

/* Items: en el original NO van en tarjetas con borde/elevación de
   Material — son bloques simples apilados verticalmente (no grid de
   3 columnas), con sombra suave nomás. */
.case-item,
.news-item,
.docket-item {
  background-color: #ffffff;
  padding: 30px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  display: block;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

/* Hover sutil: solo en las que son clickeables (tienen <a> adentro,
   es decir case-item y docket-item -- news-item no tiene link propio) */
.case-item:has(a):hover,
.docket-item:has(a):hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
  cursor: pointer;
}

.case-item:last-child,
.news-item:last-child,
.docket-item:last-child {
  margin-bottom: 0;
}

.case-item-meta {
  margin-bottom: 8px;
}

.item-date {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.empty-state {
  color: #6c757d;
  font-style: italic;
  padding: 1rem 0;
}

.post-title.eb-mn-tarjeta-post-titulo {
  margin: 0 0 12px 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.post-title a,
a .post-title {
  text-decoration: none;
  color: #2b3f47;
  transition: color 0.2s ease;
}

.post-title:hover {
  color: #f5c670;
}

.prr-item-description {
  color: #4b5563;
}

.updates-prr-content :deep(p) {
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #333;
}

/* "more cases": en el original es texto en negrita, no un botón */
.eb-mn-tarjeta-post-boton-leer-container {
  margin-top: 1rem;
}

.eb-mn-tarjeta-post-boton-leer {
  display: inline-block;
  color: #2b3f47 !important;
  font-weight: bold;
  text-decoration: none;
  font-size: 0.95rem;
}

.eb-mn-tarjeta-post-boton-leer:hover {
  color: #f5c670 !important;
}

.eb-mn-tarjeta-post-boton-leer.is-loading {
  opacity: 0.6;
  pointer-events: none;
}

.eb-mn-pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
</style>