import { netlifyFetch } from '@/api/clients/netlifyClient'

// POSTS
export async function fetchPosts(query = '') {
  return await netlifyFetch('/posts', query)
}

// RESOURCES
export async function fetchResources(query = '') {
  return await netlifyFetch('/resources', query)
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