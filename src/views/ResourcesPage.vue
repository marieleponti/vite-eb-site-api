<template>
  <v-container fluid class="resources-page">

    <v-row>
      <!-- FILTERS -->
      <v-col cols="12" md="3">
        <ResourceFilters @update="onFiltersUpdate" />
      </v-col>

      <!-- RESULTS -->
      <v-col cols="12" md="9">
        <v-card class="mb-4 pa-3 d-flex justify-space-between align-center">
          <div>
            <strong>{{ items.length }}</strong> results
          </div>

          <v-btn variant="outlined" :loading="loading" @click="refresh">
            Refresh
          </v-btn>
        </v-card>

        <!-- Loading -->
        <v-row v-if="loading">
          <v-col v-for="n in 6" :key="n" cols="12" md="6" lg="4">
            <v-skeleton-loader type="image, article, actions" class="rounded-lg" />
          </v-col>
        </v-row>

        <!-- Cards -->
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

        <!-- Empty -->
        <v-alert v-else type="info" variant="tonal">
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
const { items, fetchAll, loading } = usePosts('inforepo_resource')

/**
 * current filters state
 */
const currentFilters = ref({})

/**
 * initial load
 */
onMounted(() => {
  fetchAll()
})

/**
 * filters update from child
 */
async function onFiltersUpdate(filters) {
  currentFilters.value = filters
  await fetchResources(filters)
}

/**
 * API query builder (WP REST / Netlify / custom endpoint)
 */
async function fetchResources(filters = {}) {
  const params = new URLSearchParams()

  if (filters.s) {
    params.append('search', filters.s)
  }

  const taxonomies = [
    'topic',
    'source',
    'format',
    'country',
    'language'
  ]

  taxonomies.forEach(tax => {
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
</style>