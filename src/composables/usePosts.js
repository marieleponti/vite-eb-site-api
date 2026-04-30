import {
  ref
} from 'vue'
import {
  fetchPosts,
  fetchResources,
} from '../api/wp.service'
import {
  mapPost
} from '../api/mappers'

export function usePosts(type = 'posts') {
  const items = ref([])
  const loading = ref(false)
  const totalPages = ref(1)

  async function fetchAll(params = '') {
    loading.value = true

    try {
      if (type === 'inforepo_resource') {
        const response = await fetchResources(params)

        const resources = Array.isArray(response) ?
          response :
          response.items || []

        items.value = resources.map(mapPost)

        totalPages.value = response.total_pages ||
          Math.max(
            2,
            Math.ceil(
              (response.total || resources.length * 10) / 12
            )
          )

        console.log('Total Pages:', totalPages.value)
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
      items.value = []
      totalPages.value = 1
    } finally {
      loading.value = false
    }
  }
  console.log('Total Pages:', totalPages.value)

  return {
    items,
    loading,
    totalPages,
    fetchAll,
  }
}