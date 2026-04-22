<template>
  <v-container fluid class="blog-page">

    <!-- HEADER -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">Blog</h1>
        <p class="text-medium-emphasis">
          Latest posts and updates
        </p>
      </v-col>
    </v-row>

    <v-row>

      <!-- FILTERS -->
      <v-col cols="12" md="3">
        <BlogFilters @update="onFiltersUpdate" />
      </v-col>

      <!-- CONTENT -->
      <v-col cols="12" md="9">

        <!-- TOP BAR -->
        <v-card class="mb-4 pa-3 d-flex justify-space-between align-center">
          <div>
            <strong>{{ items.length }}</strong> posts
          </div>

          <v-btn variant="outlined" @click="refresh">
            Refresh
          </v-btn>
        </v-card>

        <!-- LIST -->
        <v-row>
          <v-col
            v-for="post in items"
            :key="post.id"
            cols="12"
            md="6"
          >
            <v-card class="h-100">

              <v-card-title>
                {{ post.title }}
              </v-card-title>

              <v-card-subtitle>
                {{ formatDate(post.date) }}
              </v-card-subtitle>

              <v-card-text>
                <div class="text-truncate-3">
                  {{ post.excerpt || post.content }}
                </div>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  variant="text"
                  @click="view(post)"
                >
                  Read more
                </v-btn>
              </v-card-actions>

            </v-card>
          </v-col>
        </v-row>

      </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BlogFilters from '@/components/BlogFilters.vue'
import { usePosts } from '@/composables/usePosts'

/**
 * WP post type = posts (default WP)
 * o si tienes CPT: 'post'
 */
const { items, fetchAll, loading } = usePosts('posts')

const currentFilters = ref({})

onMounted(() => {
  fetchAll()
})

async function onFiltersUpdate(filters) {
  currentFilters.value = filters
  await fetchPosts(filters)
}

/**
 * query builder WP REST
 */
async function fetchPosts(filters = {}) {
  const params = new URLSearchParams()

  if (filters.s) params.append('search', filters.s)

  if (filters.categories?.length) {
    filters.categories.forEach(c =>
      params.append('categories[]', c)
    )
  }

  if (filters.tags?.length) {
    filters.tags.forEach(t =>
      params.append('tags[]', t)
    )
  }

  await fetchAll(params.toString())
}

function refresh() {
  fetchPosts(currentFilters.value)
}

function view(post) {
  console.log('Open post:', post)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.blog-page {
  background: #f9f9f9;
  min-height: 100vh;
}

.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>  