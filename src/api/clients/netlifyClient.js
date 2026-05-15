const API_BASE = import.meta.env.VITE_API_BASE

export async function netlifyFetch(endpoint, params = '') {
  const url = `${API_BASE}${endpoint}${params ? `?${params}` : ''}`

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Netlify API error: ${res.status}`)
  }

  return await res.json()
}