import { ref } from 'vue'
import { getPosts } from '../api/wp.service'
import { mapPost } from '../api/mappers'

function limpiar(html = '') {
  return html.replace(/<\/?[^>]+(>|$)/g, '')
}

export function usePosts(type = 'posts') {
  const items = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await getPosts(type)

      items.value = data.map(mapPost)

    } catch (error) {
      console.error('Error fetching posts', error)
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