<template>
  <div class="container eb-public-records-requests-page-container">

    <div class="page-intro">
      <div class="public-records-requests-heading section-heading">
        <h2 class="eb-default-font section-title">
          {{ $t('publicRecordsRequests.pageTitle') }}
        </h2>
      </div>

      <p class="intro-text">
        {{ $t('publicRecordsRequests.introText') }}
      </p>
    </div>

    <!-- Our Docket -->
    <section class="docket-feed">
      <div class="section-heading">
        <h2 class="eb-default-font section-title" id="docket">{{ $t('publicRecordsRequests.docketTitle') }}</h2>
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
          {{ $t('publicRecordsRequests.noDocketItems') }}
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
import { ref, onMounted } from 'vue'
import { fetchResources } from '@/api/services/wp.service'

// Estados Reactivos
const docketFeed = ref([])
const loadingDocket = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)

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

// Trae de resources.js (Estructura paginada)
async function getDocketFeed() {
  loadingDocket.value = true
  try {
    const query = '?page=1&per_page=3&source=public-records-requests&research-team=eb-research'
    const response = await fetchResources(query)

    docketFeed.value = response?.items || []
  } catch (err) {
    console.error('Error in Docket Feed:', err)
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

/* Envuelve el título + intro para que compartan el mismo ancho máximo
   y padding horizontal que las secciones (antes el párrafo de intro
   quedaba más ancho que "Our Docket", porque no tenía este límite). */
.page-intro {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  padding-top: 40px;
  box-sizing: border-box;
}

/* Tipografía Cormorant para headings, consistente con el resto del sitio.
   (El WP original tenía un override raro a Work Sans/Raleway solo en esta
   página — decisión de diseño: unificar en vez de replicar esa excepción) */
.eb-default-font {
  font-family: 'Cormorant', serif;
  font-weight: 700;
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
  margin-bottom: 0;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

/* Items: en el original NO van en tarjetas con borde/elevación de
   Material — son bloques simples apilados verticalmente (no grid de
   3 columnas), con sombra suave nomás. */
.docket-item {
  background-color: #ffffff;
  padding: 30px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  display: block;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

/* Hover sutil: solo en las que son clickeables (tienen <a> adentro) */
.docket-item:has(a):hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
  cursor: pointer;
}

.docket-item:last-child {
  margin-bottom: 0;
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

.eb-mn-pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
</style>