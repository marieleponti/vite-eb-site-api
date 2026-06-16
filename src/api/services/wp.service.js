import { netlifyFetch } from '@/api/clients/netlifyClient'

// POSTS
export async function fetchPosts(query = '') {
  return await netlifyFetch('/posts', query)
}

// RESOURCES (LIST)
export async function fetchResources(query = '') {
  return await netlifyFetch('/resources', query)
}

// RESOURCES (SINGLE BY SLUG)
export async function fetchResourceBySlug(slug) {
  const res = await netlifyFetch('/resources', `slug=${slug}`)

  return {
    item: res?.items?.[0] || null,
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