import { ref } from 'vue'
import { fetchPosts, fetchResources } from '@/api/services/wp.service'
import { mapPost } from '@/api/mappers/postMapper'
import { normalizeResource } from '@/api/mappers/resourceMapper'

export function useContent(defaultParams = {}) {

  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const meta = ref({
    total: 0,
    totalPages: 1,
  })

  async function fetch(params = {}) {

    loading.value = true
    error.value = null

    try {
      const merged = { ...defaultParams, ...params }
      console.log('PAGE:', merged.page)

      let res = null

      // ======================
      // POSTS
      // ======================
      if (merged.type === 'posts') {

        const query = new URLSearchParams()

        if (merged.filters?.s) {
          query.append('search', merged.filters.s)
        }

        if (merged.filters?.categories?.length) {
          query.append('categories', merged.filters.categories.join(','))
        }

        if (merged.filters?.tags?.length) {
          query.append('tags', merged.filters.tags.join(','))
        }

        res = await fetchPosts(query.toString())

        // const raw = Array.isArray(res) ? res : []
        const raw = Array.isArray(res?.items) ?
          res.items :
          Array.isArray(res) ?
          res :
          []

        console.log('FIRST ITEM RAW:', res?.items?.[0])
        items.value = raw.map(mapPost)

        meta.value.total = raw.length
        meta.value.totalPages = 1
      }

      // ======================
      // RESOURCES
      // ======================
      if (merged.type === 'resources') {

        const query = new URLSearchParams()

        query.append('page', merged.page || 1)
        query.append('per_page', merged.perPage || 16)

        if (merged.filters?.s?.trim()) {
          query.append('search', merged.filters.s.trim())
        }

        if (merged.filters) {
          Object.entries(merged.filters).forEach(([key, value]) => {

            if (key === 's') return

            if (Array.isArray(value) && value.length) {
              query.append(key, value.join(','))
            }

            else if (value !== null && value !== undefined && value !== '') {
              query.append(key, value)
            }
          })
        }

        const queryString = query.toString()

        console.log('Vue envia:', queryString)

        res = await fetchResources(queryString)

        console.log('RAW RESPONSE:', res)

        // ======================
        // NORMALIZACIÓN SEGURA
        // ======================
        // const rawItems = Array.isArray(res?.items) ? res.items : []
        const rawItems =
          Array.isArray(res) ?
          res :
          Array.isArray(res?.items) ?
          res.items :
          []
        console.log('FIRST ITEM NORMALIZED:', rawItems?.[0])

        items.value = rawItems.map(normalizeResource)

        meta.value.total = res?.total ?? 0
        meta.value.totalPages = res?.total_pages ?? 1
      }

    } catch (err) {
      console.error('useContent error:', err)
      error.value = err.message || 'Unknown error'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    meta,
    fetch,
  }
}