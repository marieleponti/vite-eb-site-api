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
    totalPages: 0,
  })

  async function fetch(params = {}) {
    loading.value = true
    error.value = null

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
        res = await fetchResources(merged.query || '')
      }

      const raw = res.items || res

      if (merged.type === 'posts') {
        items.value = raw.map(mapPost)
      }

      if (merged.type === 'resources') {
        items.value = raw.map(normalizeResource)
      }

      meta.value.total = res.total || 0
      meta.value.totalPages = res.total_pages || 1

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