<template>
  <v-container fluid class="blog-page">

    <!-- Intro -->
    <v-card flat class="resources-intro mb-8">
      <div class="resources-intro__inner">
        <h1 class="resources-intro__title">
          Blog
        </h1>

        <p class="resources-intro__text">
          Explore articles, analysis, updates, and commentary from the Everywhere Border project and our contributors.
        </p>
      </div>
    </v-card>

    <v-row>
      <!-- Filters -->
      <v-col cols="12" md="3">
        <BlogFilters @update="onFiltersUpdate" />
      </v-col>

      <!-- Content -->
      <v-col cols="12" md="9">

        <v-card flat class="results-summary mb-6 pa-4">
          <strong>{{ items.length }}</strong> posts found
        </v-card>

        <v-row v-if="loading">
          <v-col v-for="n in 6" :key="n" cols="12" md="6" lg="4">
            <v-skeleton-loader type="image, article, actions" class="rounded-lg" />
          </v-col>
        </v-row>

        <v-row v-else-if="items.length">
          <v-col v-for="post in items" :key="post.id" cols="12" md="6" lg="4">
            <v-card class="resource-card h-100 d-flex flex-column" elevation="2" rounded="lg">

              <v-img v-if="post.featuredImage" :src="post.featuredImage" :alt="post.title" height="220" cover />

              <v-card-item>
                <v-card-title class="resource-title">
                  {{ post.title }}
                </v-card-title>

                <v-card-subtitle class="resource-meta">
                  {{ formatDate(post.date) }}
                </v-card-subtitle>
              </v-card-item>

              <v-card-text class="resource-content">
                <div class="resource-excerpt">
                  {{ post.excerpt || post.content }}
                </div>
              </v-card-text>

              <v-spacer />

              <v-card-actions>
                <!-- CAMBIO: estilo real de .eb-mn-tarjeta-post-boton-leer del
                     sitio viejo — link bold, sin underline, sin radius,
                     color #2B3F47, no es un botón con fondo. -->
                <v-btn color="#2f4356" variant="text" class="read-more-btn" @click="view(post)">
                  read more
                </v-btn>
              </v-card-actions>

            </v-card>
          </v-col>
        </v-row>

        <v-alert v-if="!loading && !items.length" type="info" variant="tonal">
          No posts found.
        </v-alert>

      </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BlogFilters from '@/components/BlogFilters.vue'
import { useContent } from '@/composables/useContent'
import { useRouter } from 'vue-router'

const router = useRouter()

// composable
const {
  items,
  loading,
  fetch: cargarContenido,
} = useContent({
  type: 'posts',
})

const currentFilters = ref({})
const page = ref(1)
const perPage = 15

// ======================
// FETCH FUNCTION
// ======================
async function loadPosts() {
  await cargarContenido({
    type: 'posts',
    page: page.value,
    perPage,
    filters: currentFilters.value,
  })
}

// ======================
// INIT
// ======================
onMounted(() => {
  loadPosts()
})

// ======================
// FILTERS
// ======================
async function onFiltersUpdate(filters) {
  currentFilters.value = filters
  page.value = 1
  await loadPosts()
}

// ======================
// VIEW ACTION
// ======================
function view(post) {
  router.push({
    name: 'BlogSingle',
    params: { slug: post.slug }
  })
}

// ======================
// FORMAT DATE
// ======================
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.blog-page {
  background: #f9f9f9;
  min-height: 100vh;
}

.results-summary {
  background: #f3f3f3;
  border: 1px solid #e0e0e0;
}

.resources-intro {
  background: #f3f3f3;
  border-radius: 0;
  padding: 3rem 2rem;
  border: 1px solid #e0e0e0;
}

.resources-intro__title {
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 300;
  text-transform: uppercase;
  color: #29465b;
  margin-bottom: 1.5rem;
}

.resources-intro__text {
  font-size: 1.1rem;
  line-height: 1.9;
  color: #4b5563;
}

.resource-card {
  transition: all .2s ease;
}

.resource-card:hover {
  transform: translateY(-2px);
}

.resource-title {
  font-size: 1.1rem;
  line-height: 1.4;
  color: #29465b;
}

.resource-meta {
  color: #7a8a96;
}

.resource-excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Fiel a .eb-mn-tarjeta-post-boton-leer del sitio viejo:
   link bold, sin underline, sin radius, color #2B3F47, sin fondo/borde. */
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