import { netlifyFetch } from '@/api/clients/netlifyClient'
import { mapPost } from '@/api/mappers/postMapper'
import { normalizeResourcesResponse } from '@/api/mappers/resourceMapper'

// POSTS
export async function fetchPosts(query = '') {
  return await netlifyFetch('/posts', query)
}

// RESOURCES (LIST)
export async function fetchResources(query = '') {
  const res = await netlifyFetch('/resources', query)
  return normalizeResourcesResponse(res)
}

/**
 * RESOURCES (TODAS, sin paginar) — para el mapa.
 *
 * El endpoint /resources pagina de a 16 (o lo que mandes en per_page).
 * El mapa necesita ver todos los pines a la vez, así que esto pide
 * páginas grandes hasta agotar total_pages. `filters` usa el mismo shape
 * que emite ResourceFilters.vue (igual a lo que useContent.js ya espera).
 */
export async function fetchAllResources(filters = {}, { perPage = 50, safetyLimitPages = 10 } = {}) {
  let page = 1
  let totalPages = 1
  const items = []

  do {
    const query = new URLSearchParams()
    query.set('page', String(page))
    query.set('per_page', String(perPage))

    if (filters.s?.trim()) {
      query.set('search', filters.s.trim())
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (key === 's') return
      if (Array.isArray(value) && value.length) {
        query.set(key, value.join(','))
      } else if (value !== null && value !== undefined && value !== '') {
        query.set(key, value)
      }
    })

    const result = await fetchResources(query.toString())
    items.push(...result.items)
    totalPages = result.totalPages
    page += 1
  } while (page <= totalPages && page <= safetyLimitPages)

  return { items, total: items.length, totalPages: 1 }
}

// RESOURCES (SINGLE BY SLUG)
export async function fetchResourceBySlug(slug) {
  const res = await netlifyFetch('/resources', `slug=${slug}`)

  return {
    item: res?.items?.[0] || null,
    meta: res
  }
}

export async function fetchPostBySlug(slug) {
  const res = await netlifyFetch('/posts', `slug=${slug}`)

  const post = Array.isArray(res)
    ? res[0]
    : res?.items?.[0]

  return {
    item: post ? mapPost(post) : null,
    meta: res
  }
}

// OPTIONAL: SINGLE BY ID
export async function fetchResourceById(id) {
  const res = await netlifyFetch(`/resources/${id}`)

  return {
    item: res?.item || res?.items?.[0] || null
  }
}

// FILTERS
export async function fetchResourceFilters() {
  return await netlifyFetch('/filters')
}

// CREATE POST
export async function createPost(payload) {
  return await netlifyFetch('/posts', '', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// UPDATE POST
export async function updatePost(id, payload) {
  return await netlifyFetch(`/posts/${id}`, '', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}