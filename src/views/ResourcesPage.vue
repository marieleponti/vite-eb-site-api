<template>
  <v-container fluid class="resources-page">

    <!-- Intro -->
    <v-card flat class="resources-intro mb-8">
      <div class="resources-intro__inner">
        <h1 class="resources-intro__title">
          {{ $t('resources.pageTitle') }}
        </h1>

        <p class="resources-intro__text">
          {{ $t('resources.introText') }}
        </p>
      </div>
    </v-card>

    <v-row>
      <!-- Filters -->
      <v-col cols="12" md="3">
        <ResourceFilters :current-view="view" @update="onFiltersUpdate" @toggle-map="onToggleMap" />
      </v-col>

      <!-- Results -->
      <v-col cols="12" md="9">

        <!-- ===================== -->
        <!-- VISTA MAPA            -->
        <!-- ===================== -->
        <ResourceMap
          v-if="view === 'map'"
          :resources="mapItems"
          :loading="mapLoading"
          :visible="view === 'map'"
        />

        <!-- ===================== -->
        <!-- VISTA LISTA (grilla)  -->
        <!-- ===================== -->
        <template v-else>
          <v-row v-if="loading">
            <v-col v-for="n in 6" :key="n" cols="12" md="6" lg="4">
              <v-skeleton-loader type="image, article, actions" class="rounded-lg" />
            </v-col>
          </v-row>

          <v-row v-else-if="items.length">
            <v-col v-for="item in items" :key="item.id" cols="12" md="6" lg="4">
              <v-card class="resource-card h-100 d-flex flex-column" elevation="2" rounded="lg">

                <v-img v-if="item.featuredImage" :src="item.featuredImage" :alt="item.title" height="220" cover />

                <v-card-item>
                  <v-card-title class="resource-title">
                    <router-link v-if="item.slug" :to="{ name: 'ResourceSingle', params: { slug: item.slug } }">
                      {{ item.title }}
                    </router-link>
                  </v-card-title>

                  <v-card-subtitle class="resource-meta">
                    {{ formatDate(item.date) }}
                  </v-card-subtitle>
                </v-card-item>

                <v-card-text class="resource-content">
                  <div class="resource-excerpt">
                    {{ item.excerpt }}
                  </div>
                </v-card-text>

                <v-spacer />

                <v-card-actions>
                  <v-btn v-if="item.slug" color="#2f4356" variant="text" class="read-more-btn"
                    :to="{ name: 'ResourceSingle', params: { slug: item.slug } }">
                    {{ $t('resources.viewResource') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-if="!loading && totalPages > 1" class="mt-8">
            <v-col cols="12" class="d-flex justify-center align-center flex-wrap ga-2">
              <v-btn variant="text" class="pagination-nav" :disabled="page === 1" @click="changePage(page - 1)">
                {{ $t('resources.previous') }}
              </v-btn>

              <v-btn v-for="n in totalPages" :key="n" :variant="page === n ? 'flat' : 'outlined'"
                :color="page === n ? '#2f4356' : undefined" class="pagination-number" @click="changePage(n)">
                {{ n }}
              </v-btn>

              <v-btn variant="text" class="pagination-nav" :disabled="page === totalPages" @click="changePage(page + 1)">
                {{ $t('resources.next') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-alert v-if="!loading && !items.length" type="info" variant="tonal">
            {{ $t('resources.noResourcesFound') }}
          </v-alert>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ResourceFilters from '@/components/ResourceFilters.vue'
import ResourceMap from '@/components/ResourceMap.vue'
import { useContent } from '@/composables/useContent'
import { fetchAllResources } from '@/api/services/wp.service'

// Desestructuramos la función fetch renombrándola para evitar colisiones de nombres
const { items, fetch: cargarContenido, loading, meta } = useContent()

const currentFilters = ref({})
const page = ref(1)
const perPage = 15

// El backend devuelve meta.totalPages mal calculado (siempre 1),
// así que lo calculamos nosotros mismos a partir de meta.total, que sí es correcto.
const totalPages = computed(() => {
  const total = meta.value?.total || 0
  return Math.max(1, Math.ceil(total / perPage))
})

// ===================== VISTA MAPA =====================
// Toggle de vista. Reemplaza lo que en el WP original eran dos URLs
// distintas (/resources y /resources-map con full reload): acá es un
// solo ref local, sin recargar la página.
const view = ref('list') // 'list' | 'map'
const mapItems = ref([])
const mapLoading = ref(false)
let mapLoaded = false

function onToggleMap() {
  view.value = view.value === 'list' ? 'map' : 'list'
  if (view.value === 'map' && !mapLoaded) {
    loadMapResources()
  }
}

async function loadMapResources() {
  mapLoading.value = true
  try {
    const result = await fetchAllResources(currentFilters.value)
    mapItems.value = result.items
    mapLoaded = true
  } catch (error) {
    console.error('Error cargando recursos para el mapa:', error)
  } finally {
    mapLoading.value = false
  }
}
// ========================================================

onMounted(() => {
  fetchResources()
})

// Recibe los filtros sueltos del componente { s: '', categories: [], ... }
async function onFiltersUpdate(filtersEmitidos) {
  page.value = 1
  currentFilters.value = filtersEmitidos
  await fetchResources(filtersEmitidos)

  // si la vista mapa ya está activa, los filtros también deben afectarla
  if (view.value === 'map') {
    mapLoaded = false
    await loadMapResources()
  }
}

async function fetchResources(filters = {}) {
  // CORRECCIÓN: Pasamos el objeto 'filters' envuelto en su propia llave
  // tal y como lo requiere useContent para mapear el CPT y la búsqueda
  await cargarContenido({
    type: 'resources',
    filters: filters,
    page: page.value,
    perPage
  })
}

function refresh() {
  fetchResources(currentFilters.value)
}

async function changePage(newPage) {
  page.value = newPage
  await fetchResources(currentFilters.value)

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.resources-page {
  background: #f9f9f9;
  min-height: 100vh;
  padding-inline: clamp(1.25rem, 6vw, 8rem);
}

/* ===== Intro / Título principal — intención original: Cormorant ===== */
.resources-intro__title {
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 700; /* el original usa bold en h3, no 300 */
  letter-spacing: 0.02em;
  /* text-transform: uppercase; */
  color: #29465b;
  margin-bottom: 1.5rem;
  font-family: var(--eb-default, 'Cormorant', serif);
}

.resources-intro__text {
  font-size: 1.1rem;
  line-height: 1.9;
  color: #4b5563;
  font-weight: 400;
  font-family: var(--main-font, 'Work Sans', 'Raleway', sans-serif);
}

/* ===== Card title — original usa var(--main-font) en el <h5> ===== */
.resource-title {
  font-family: var(--main-font, 'Work Sans', 'Raleway', sans-serif);
}

/* ===== Descripción/excerpt de card — Work Sans directo en el original ===== */
.resource-excerpt {
  font-family: 'Work Sans', sans-serif;
}

/* resource-meta (fecha) y read-more-btn no tenían font-family propio
   en el original -> heredan Open Sans (fuente body de Divi) */
.resource-meta,
.read-more-btn {
  font-family: 'Open Sans', Arial, sans-serif;
}

/* ===== Paginación — sin override en el original, hereda Open Sans ===== */
.pagination-nav,
.pagination-number {
  font-family: 'Open Sans', Arial, sans-serif;
  color: #2f4356 !important;
  text-transform: none !important;
  font-size: 1.15rem;
  font-weight: 400;
  letter-spacing: 0;
  min-width: auto;
  padding: 0 10px;
}

.pagination-number {
  min-width: 42px !important;
  width: 42px;
  height: 42px;
  border-radius: 6px !important;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: none !important;
}

.pagination-number.v-btn--variant-outlined {
  border-color: #c7cdd4 !important;
  color: #2f4356 !important;
}

.pagination-number.v-btn--variant-flat {
  background-color: #2f4356 !important;
  color: #ffffff !important;
}

.resources-intro {
  background: #f3f3f3;
  border-radius: 0;
  padding: 3rem 2rem;
  border: 1px solid #e0e0e0;
}

.resources-intro__inner {
  width: 100%;
}

/* Mobile */
@media (max-width: 960px) {
  .resources-intro {
    padding: 2rem 1.25rem;
  }

  .resources-intro__title {
    font-size: 2.2rem;
  }

  .resources-intro__text {
    font-size: 1rem;
    line-height: 1.7;
  }
}

.read-more-btn {
  color: #2B3F47 !important;
  font-weight: bold !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  text-decoration: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.read-more-btn:hover {
  text-decoration: underline !important;
}
</style>