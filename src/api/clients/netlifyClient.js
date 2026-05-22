export async function netlifyFetch(endpoint, query = '', headers = {}) {

  const url =
    `${API}${endpoint}` +
    `${query ? `?${query}` : ''}`

  const res = await fetch(url, { headers })

  const text = await res.text()

  console.log('URL:', url)
  console.log('RAW RESPONSE:', text)

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return JSON.parse(text)
}