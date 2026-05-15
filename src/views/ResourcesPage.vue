<template>
  <v-container fluid class="resources-page">

      <!-- Intro -->
      <v-card flat class="resources-intro mb-8">
        <div class="resources-intro__inner">
          <h1 class="resources-intro__title">
            Resources Library
          </h1>

          <p class="resources-intro__text">
          Welcome to The Everywhere Border resource library. Here you will find a comprehensive and expanding compilation of diverse research outputs, 
                such as reports, white papers, academic articles, analyses and other resources, as well as original source documentation related to border 
                enforcement and externalization, border technologies, securitization, militarization, corporate actors, funding streams, human impacts and more, 
                with a particular focus in the Americas. This is a curated library, meaning, the resources gathered here have been selected given their relevance 
                and importance to the issues in question. If you want to submit a resource for consideration, please fill out this form.
          </p>
        </div>
      </v-card>

    <v-row>
      <!-- Filters -->
      <v-col cols="12" md="3">
        <ResourceFilters @update="onFiltersUpdate" />
      </v-col>

      <!-- Results -->
      <v-col cols="12" md="9">
        <!-- <v-card class="mb-4 pa-3 d-flex justify-space-between align-center">
          <div>
            <strong>{{ items.length }}</strong> results
          </div>

          <v-btn variant="outlined" :loading="loading" @click="refresh">
            Refresh
          </v-btn>
        </v-card> -->

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
import { useContent } from '@/composables/useContent'

const { items, fetch, loading, meta } = useContent()

const currentFilters = ref({})
const page = ref(1)
const perPage = 12

onMounted(() => {
  fetchResources()
})

async function onFiltersUpdate(filters) {
  page.value = 1
  currentFilters.value = filters
  await fetchResources(filters)
}

async function fetchResources(filters = {}) {
  await fetch({
    type: 'resources',
    filters,
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

.resources-intro {
  background: #f3f3f3;
  border-radius: 0;
  padding: 3rem 2rem;
  border: 1px solid #e0e0e0;
}

.resources-intro__inner {
  width: 100%;
  /* max-width: 1400px; */
}

.resources-intro__title {
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 300;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #29465b;
  margin-bottom: 1.5rem;
}

.resources-intro__text {
  font-size: 1.1rem;
  line-height: 1.9;
  color: #4b5563;
  font-weight: 400;
  /* max-width: 780px; */
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
</style>