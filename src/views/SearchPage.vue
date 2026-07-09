<template>
  <div class="search-page">
    <div class="search-header">
      <h1 class="search-title">
        <span v-if="query">Results for "<em>{{ query }}</em>"</span>
        <span v-else>Search</span>
      </h1>
      <form @submit.prevent="runSearch" class="search-form">
        <input
          v-model="inputValue"
          class="search-input"
          type="search"
          :placeholder="$t('search.placeholder')"
          autocomplete="off"
        />
        <button type="submit" class="search-btn">{{ $t('search.button') }}</button>
      </form>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="search-status">Searching…</div>

    <!-- No results -->
    <div v-else-if="!loading && query && results.length === 0" class="search-status">
      No results found for "<strong>{{ query }}</strong>".
    </div>

    <!-- Results -->
    <div v-else-if="results.length" class="results-list">
      <div
        v-for="item in results"
        :key="`${item.type}-${item.id}`"
        class="result-card"
        @click="goTo(item)"
      >
        <span class="result-type" :class="`result-type--${item.type}`">
          {{ item.type === 'post' ? 'Blog' : 'Resource' }}
        </span>
        <h2 class="result-title" v-html="item.title"></h2>
        <p class="result-excerpt" v-html="item.excerpt"></p>
        <span class="result-link">Read more →</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const query = computed(() => route.query.q || '')
const inputValue = ref(query.value)
const results = ref([])
const loading = ref(false)

const WP_BASE = '/wp-json/wp/v2'
const EB_BASE = '/wp-json/ebinforepo/v1'

async function fetchEndpoint(url) {
  const res = await fetch(url)
  if (!res.ok) return []
  return res.json()
}

function normalize(item, type) {
  const title = item.title?.rendered || item.title || ''
  const excerpt = item.excerpt?.rendered || item.excerpt || ''
  const stripped = excerpt.replace(/<[^>]*>/g, '').trim().slice(0, 160)
  return {
    id: item.id,
    type,
    title,
    excerpt: stripped ? stripped + '…' : '',
    link: item.link || item.permalink || '',
    slug: item.slug,
  }
}

async function runQuery(q) {
  if (!q) { results.value = []; return }
  loading.value = true
  try {
    const [postsRes, resourcesRes] = await Promise.all([
      fetchEndpoint(`${WP_BASE}/posts?search=${encodeURIComponent(q)}&per_page=20&_fields=id,slug,title,excerpt,link`),
      fetchEndpoint(`${EB_BASE}/resources?search=${encodeURIComponent(q)}&per_page=20`),
    ])
    results.value = [
      ...( resourcesRes.items || []).map(r => normalize(r, 'resource')),
      ...postsRes.map(p => normalize(p, 'post')),
    ]
  } catch (e) {
    console.error('Search error:', e)
    results.value = []
  } finally {
    loading.value = false
  }
}

function runSearch() {
  const q = inputValue.value.trim()
  if (!q) return
  router.push({ path: '/search', query: { q } })
}

function goTo(item) {
  if (item.type === 'post') {
    router.push(`/blog/${item.slug}`)
  } else {
    router.push(`/resources/${item.slug}`)
  }
}

watch(query, (q) => {
  inputValue.value = q
  runQuery(q)
}, { immediate: false })

onMounted(() => {
  if (query.value) runQuery(query.value)
})
</script>

<style scoped>
.search-page {
  min-height: 60vh;
  background-color: #2b3f47;
  padding: 60px 10%;
  font-family: 'Work Sans', Helvetica, Arial, sans-serif;
  color: #fff;
}

/* -------------------------------------------------------------------- */
/* Header                                                                */
/* -------------------------------------------------------------------- */
.search-header {
  margin-bottom: 50px;
}

.search-title {
  font-family: 'Cormorant', Georgia, serif;
  font-size: 36px;
  font-weight: 700;
  color: #f5c670;
  margin-bottom: 24px;
}

.search-title em {
  font-style: italic;
  color: #fff;
}

.search-form {
  display: flex;
  gap: 12px;
  max-width: 700px;
}

.search-input {
  flex: 1;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(245, 198, 112, 0.4);
  border-radius: 4px;
  padding: 12px 16px;
  color: #f5c670;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus { border-color: #f5c670; }
.search-input::placeholder { color: rgba(245, 198, 112, 0.4); }

.search-btn {
  background-color: #f5c670;
  color: #2b3f47;
  border: none;
  border-radius: 4px;
  padding: 12px 28px;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.search-btn:hover { background-color: #f38a4e; }

/* -------------------------------------------------------------------- */
/* Status                                                                */
/* -------------------------------------------------------------------- */
.search-status {
  font-size: 18px;
  font-weight: 300;
  color: rgba(255,255,255,0.7);
  padding: 40px 0;
}

/* -------------------------------------------------------------------- */
/* Results                                                               */
/* -------------------------------------------------------------------- */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(245, 198, 112, 0.15);
  border-radius: 4px;
  padding: 28px 32px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.result-card:hover {
  border-color: rgba(245, 198, 112, 0.5);
  background: rgba(255,255,255,0.07);
}

.result-type {
  display: inline-block;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 2px;
  margin-bottom: 10px;
}

.result-type--resource {
  background-color: rgba(245, 198, 112, 0.15);
  color: #f5c670;
}

.result-type--post {
  background-color: rgba(243, 138, 78, 0.15);
  color: #f38a4e;
}

.result-title {
  font-family: 'Cormorant', Georgia, serif;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
  line-height: 1.3;
}

.result-excerpt {
  font-size: 15px;
  font-weight: 300;
  color: rgba(255,255,255,0.65);
  line-height: 1.6;
  margin-bottom: 14px;
}

.result-link {
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #f5c670;
  letter-spacing: 0.3px;
}

/* -------------------------------------------------------------------- */
/* Responsive                                                            */
/* -------------------------------------------------------------------- */
@media (max-width: 768px) {
  .search-page { padding: 40px 5%; }
  .search-form { flex-direction: column; }
  .search-title { font-size: 26px; }
  .result-card { padding: 20px; }
  .result-title { font-size: 20px; }
}
</style>