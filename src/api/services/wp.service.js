const WP_API = import.meta.env.VITE_WP_API
const INFOREPO_API = import.meta.env.VITE_API_BASE
import { wpClient } from '../clients/wpClient'
// ---------------------
// WP POSTS
// ---------------------
export async function fetchPosts(query = '') {
  const separator = query ? '&' : '?'
  const url = `${WP_API}/posts${query ? `?${query}` : ''}${separator}_embed=true`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`WP error: ${res.status}`)

  return await res.json()
}

// ---------------------
// CUSTOM RESOURCES (Netlify / WP custom endpoint)
// ---------------------
export async function fetchResources(query = '') {
  const url = `${INFOREPO_API}/resources${query ? `?${query}` : ''}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Resources API error: ${res.status}`)

  return await res.json()
}

// ---------------------
// WRITE OPERATIONS (WP)
// ---------------------
export async function createPost(payload) {
  const res = await fetch(`${WP_API}/posts`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error(`WP error: ${res.status}`)

  return res.json()
}

export async function updatePost(id, payload) {
  const res = await fetch(`${WP_API}/posts/${id}`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`WP update error ${res.status}: ${errorText}`)
  }

  return res.json()
}

// ---------------------
// FILTERS (Resources domain)
// ---------------------
export async function fetchResourceFilters() {
  const response = await fetch(`${INFOREPO_API}/filters`)

  if (!response.ok) {
    throw new Error(`Filters API error: ${response.status}`)
  }

  return response.json()
}