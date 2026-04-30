<template>
  <v-container fluid class="resources-page">
    <v-row>
      <!-- Filters -->
      <v-col cols="12" md="3">
        <ResourceFilters @update="onFiltersUpdate" />
      </v-col>

      <!-- Results -->
      <v-col cols="12" md="9">
        <v-card class="mb-4 pa-3 d-flex justify-space-between align-center">
          <div>
            <strong>{{ items.length }}</strong> results
          </div>

          <v-btn variant="outlined" :loading="loading" @click="refresh">
            Refresh
          </v-btn>
        </v-card>

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
                  <a :href="item.permalink" target="_blank" rel="noopener noreferrer">
                    {{ item.title }}
                  </a>
                </v-card-title>

                <v-card-subtitle class="resource-meta">
                  {{ formatDate(item.date) }}
                </v-card-subtitle>
              </v-card-item>

              <v-card-text class="resource-content">
                <div class="resource-excerpt">
                  {{ item.excerpt || item.content }}
                </div>
              </v-card-text>

              <v-spacer />

              <v-card-actions>
                <v-btn color="primary" variant="text" :href="item.permalink" target="_blank">
                  View Resource
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="!loading && totalPages > 1" class="mt-8">
          <v-col cols="12" class="d-flex justify-center align-center flex-wrap ga-2">
            <v-btn variant="text" class="pagination-nav" :disabled="page === 1" @click="changePage(page - 1)">
              « Previous
            </v-btn>

            <v-btn v-for="n in totalPages" :key="n" :variant="page === n ? 'flat' : 'outlined'"
              :color="page === n ? '#2f4356' : undefined" class="pagination-number" @click="changePage(n)">
              {{ n }}
            </v-btn>

            <v-btn variant="text" class="pagination-nav" :disabled="page === totalPages" @click="changePage(page + 1)">
              Next »
            </v-btn>
          </v-col>
        </v-row>
        <v-alert v-if="!loading && !items.length" type="info" variant="tonal">
          No resources found.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ResourceFilters from '@/components/ResourceFilters.vue'
import { usePosts } from '@/composables/usePosts'

/**
 * CPT resource data
 */
const { items, fetchAll, loading, totalPages } = usePosts('inforepo_resource')

/**
 * current filters state
 */
const currentFilters = ref({})
const page = ref(1)
const perPage = 12

/**
 * initial load
 */
//

onMounted(() => {
  fetchResources()
})

/**
 * filters update from child
 */
//
async function onFiltersUpdate(filters) {
  page.value = 1
  currentFilters.value = filters
  await fetchResources(filters)
}

/**
 * API query builder (WP REST / Netlify / custom endpoint)
 */

async function fetchResources(filters = {}) {
  const params = new URLSearchParams()

  params.append('page', page.value)
  params.append('per_page', perPage)

  if (filters.s) {
    params.append('search', filters.s)
  }

  const taxonomies = [
    'topic',
    'source',
    'format',
    'country',
    'language',
  ]

  taxonomies.forEach((tax) => {
    if (filters[tax]?.length) {
      params.append(tax, filters[tax].join(','))
    }
  })

  await fetchAll(params.toString())
}


/**
 * refresh
 */
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

/**
 * format date
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.resources-page {
  background: #f9f9f9;
  min-height: 100vh;
}
/* Elimina TODO el CSS anterior de v-pagination.
   Solo deja este bloque para la paginación personalizada */

.pagination-nav {
  color: #0074c8 !important;
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
</style>