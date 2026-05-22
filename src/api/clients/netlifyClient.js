const API =
  import.meta.env.VITE_API_BASE

export async function netlifyFetch(
  endpoint,
  query = '',
  headers = {}
) {

  const url =
    `${API}${endpoint}` +
    `${query ? `?${query}` : ''}`

  const res = await fetch(url, {
    headers,
  })

  console.log('URL:', url)
  console.log('RAW RESPONSE:', text)

  if (!res.ok) {
    throw new Error(
      `API error: ${res.status}`
    )
  }

  return await res.json()
}