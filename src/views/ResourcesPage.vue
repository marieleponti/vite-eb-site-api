<template>
  <v-container fluid class="resources-page">

    <!-- HEADER -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">
          Resources
        </h1>
        <p class="text-medium-emphasis">
          Browse and filter all available resources
        </p>
      </v-col>
    </v-row>

    <!-- 🧩 MAIN LAYOUT -->
    <v-row>

      <!-- 🔎 FILTERS (LEFT SIDEBAR) -->
      <v-col cols="12" md="3">

        <ResourceFilters @update="onFiltersUpdate" />

      </v-col>

      <!-- RESULTS (RIGHT CONTENT) -->
      <v-col cols="12" md="9">

        <!-- TOP BAR -->
        <v-card class="mb-4 pa-3 d-flex justify-space-between align-center">

          <div>
            <strong>{{ items.length }}</strong> results
          </div>

          <v-btn variant="outlined" @click="refresh">
            Refresh
          </v-btn>

        </v-card>

        <!-- RESULTS TABLE -->
        <v-card>

          <v-data-table :items="items" :headers="headers" :loading="loading" item-value="id">

         <v-row>
  <v-col
    v-for="item in items"
    :key="item.id"
    cols="12"
    md="6"
    lg="4"
  >
    <v-card
      class="h-100 d-flex flex-column"
      elevation="2"
      rounded="lg"
    >
      <v-img
        v-if="item.featuredImage"
        :src="item.featuredImage"
        :alt="item.title"
        height="220"
        cover
      />

      <v-card-item>
        <v-card-title class="text-wrap">
          <a
            :href="item.permalink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-decoration-none text-primary"
          >
            {{ item.title }}
          </a>
        </v-card-title>

        <v-card-subtitle>
          {{ item.author }} • {{ formatDate(item.date) }}
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="flex-grow-1">
        <div class="text-truncate-4">
          {{ item.excerpt || item.content }}
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          color="primary"
          variant="text"
          :href="item.permalink"
          target="_blank"
        >
          View Resource
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</v-row>

          </v-data-table>

        </v-card>

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
 * table headers
 */
const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Content', key: 'content' },
  { title: 'Date', key: 'date' },
  { title: 'Actions', key: 'actions', sortable: false }
]

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
 * view action (placeholder)
 */
function view(item) {
  console.log('View resource:', item)
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