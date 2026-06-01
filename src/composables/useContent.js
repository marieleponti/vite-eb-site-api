import {
  ref
} from 'vue'
import {
  fetchPosts,
  fetchResources
} from '@/api/services/wp.service'
import {
  mapPost
} from '@/api/mappers/postMapper'
import {
  normalizeResource
} from '@/api/mappers/resourceMapper'

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
  items.value = []

  try {

    const merged = {
      ...defaultParams,
      ...params,
    }

    let res

    if (merged.type === 'posts') {
      res = await fetchPosts('posts', merged.query || '')
    }

    if (merged.type === 'resources') {

      const query = new URLSearchParams()

      if (merged.page) {
        query.append('page', merged.page)
      }

      if (merged.perPage) {
        query.append('per_page', merged.perPage)
      }
      if (merged.filters?.s) {
        query.append('search', merged.filters.s)
      }

      Object.entries(merged.filters || {}).forEach(
        ([key, value]) => {

          if (key === 's') return

          if (Array.isArray(value) && value.length) {
            query.append(key, value.join(','))
          }
        }
      )

      console.log('Vue envia: ', query.toString())

      res = await fetchResources(query.toString())

      console.log('PAGE:', merged.page)
      console.log('RESULT ITEMS:', res.items?.map(i => i.id))

      const raw = res.items || []

      items.value = [...raw].map(normalizeResource)

      meta.value.total = res.total || 0
      meta.value.totalPages = res.total_pages || 1
    }

    if (merged.type === 'posts') {
      const raw = res.items || res
      items.value = raw.map(mapPost)
    }

  } catch (err) {
    error.value = err.message
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