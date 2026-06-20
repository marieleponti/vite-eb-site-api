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

  // return {
  //   items: Array.isArray(res?.items)
  //     ? res.items
  //     : Array.isArray(res)
  //       ? res
  //       : [],

  //   total: res?.total ?? 0,
  //   total_pages: res?.total_pages ?? 1,
  // }
  return normalizeResourcesResponse(res)
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