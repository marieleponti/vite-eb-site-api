const API =
  import.meta.env.VITE_API_BASE

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

  try {
    return JSON.parse(text)
  } catch (e) {
    console.error('Invalid JSON response:', text)
    throw e
  }
}