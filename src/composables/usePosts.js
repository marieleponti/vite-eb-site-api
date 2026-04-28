import {
  ref
} from 'vue'
import {
  fetchPosts,
  fetchResources
} from '../api/wp.service'
import {
  mapPost
} from '../api/mappers'

export function usePosts(type = 'posts') {
  const items = ref([])
  const loading = ref(false)

 async function fetchAll(params = '') {
  loading.value = true

  try {
    if (type === 'inforepo_resource') {
      const response = await fetchResources(params)

      const resources = Array.isArray(response)
        ? response
        : response.items || []

      items.value = resources.map(mapPost)
    } else {
      const response = await fetchPosts(type, params)
      items.value = (response || []).map(mapPost)
    }
  } catch (error) {
    console.error(`Error fetching ${type}:`, error)
    items.value = []
  } finally {
    loading.value = false
  }
}

  return {
    items,
    loading,
    fetchAll,
  }
}