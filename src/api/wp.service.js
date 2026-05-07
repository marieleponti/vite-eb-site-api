const WP_API = 'https://dev-eb-vue.pantheonsite.io/wp-json/wp/v2'
// const INFOREPO_API = '/api'
const INFOREPO_API = import.meta.env.VITE_API_BASE

export async function fetchPosts(type = 'posts', query = '') {
  const separator = query ? '&' : '?'
  const url = `${WP_API}/${type}${query ? `?${query}` : ''}${separator}_embed=true`

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`WP error: ${res.status}`)
  }

  return await res.json()
}

export async function fetchResources(query = '') {
  const url = `${INFOREPO_API}/resources${query ? `?${query}` : ''}`

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Resources API error: ${res.status}`)
  }

  return await res.json()
}

export async function createPost(payload) {
  const res = await fetch(`${WP_API}/posts`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`WP error: ${res.status}`);

  return res.json();
}

export async function updatePost(id, payload) {
  const res = await fetch(`${WP_API}/posts/${id}`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`WP update error ${res.status}: ${errorText}`);
  }

  return res.json();
}

export async function fetchResourceFilters() {
  const response = await fetch(`${INFOREPO_API}/filters`)

  if (!response.ok) {
    throw new Error(`Filters API error: ${response.status}`)
  }

  return response.json()
}