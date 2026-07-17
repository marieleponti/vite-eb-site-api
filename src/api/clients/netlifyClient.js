const API =
  import.meta.env.VITE_API_BASE || ""

export async function netlifyFetch(
  endpoint,
  query = '',
  options = {}
) {

  const token = localStorage.getItem('jwt')

  const url =
    `${API}${endpoint}` +
    `${query ? `?${query}` : ''}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ?
        {
          Authorization: `Bearer ${token}`
        } :
        {}),
    },
  })

  const text = await res.text()

  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Invalid JSON response:', text)
    }
    const parseError = new Error('Invalid JSON response')
    parseError.status = res.status
    throw parseError
  }

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed with status ${res.status}`)
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}