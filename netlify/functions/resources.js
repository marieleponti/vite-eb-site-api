const WP = process.env.WP_API

async function getUser(token) {
  if (!token) return null

  const res = await fetch(
    `${WP}/wp-json/ebinforepo/v1/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) return null

  return await res.json()
}

exports.handler = async (event = {}) => {
  try {
    const token =
      event.headers?.authorization?.replace('Bearer ', '')

    const user = await getUser(token)

    const roles = user?.roles || []

    const canSeePrivate =
      roles.includes('administrator') ||
      roles.includes('editor') ||
      roles.includes('ebteam')

    // =====================
    // QUERY PARAMS
    // =====================
    const page =
      event.queryStringParameters?.page || '1'

    const perPage =
      event.queryStringParameters?.per_page || '16'

    const search =
      event.queryStringParameters?.search || ''

    const categories =
      event.queryStringParameters?.categories || ''

    const tags =
      event.queryStringParameters?.tags || ''

    const country =
      event.queryStringParameters?.country || ''

    const topic =
      event.queryStringParameters?.topic || ''

    const source =
      event.queryStringParameters?.source || ''

    const format =
      event.queryStringParameters?.format || ''

    const language =
      event.queryStringParameters?.language || ''

    // =====================
    // BUILD WP PARAMS
    // =====================
    const params = new URLSearchParams()

    params.set('page', page)
    params.set('per_page', perPage)
    params.set('_embed', 'true')

    params.set(
      'status',
      canSeePrivate ? 'publish,private' : 'publish'
    )

    if (search) params.set('search', search)
    if (categories) params.set('categories', categories)
    if (tags) params.set('tags', tags)

    // IMPORTANT: tax filters (SLUGS expected)
    if (country) params.set('country', country)
    if (topic) params.set('topic', topic)
    if (source) params.set('source', source)
    if (format) params.set('format', format)
    if (language) params.set('language', language)

    const url =
      `${WP}/wp-json/ebinforepo/v1/resources?${params.toString()}`

    console.log('FINAL URL:', url)

    // =====================
    // FETCH WP
    // =====================
    const response = await fetch(url, {
      headers: token ?
        {
          Authorization: `Bearer ${token}`
        } :
        {},
      })

      if (!response.ok) {
        throw new Error(`WP error: ${response.status}`)
      }

      const data = await response.json()

      return {
        statusCode: 200,
        body: JSON.stringify({
          items: data.items, 
          total: data.total,
          total_pages: data.total_pages,
        }),
      }
      }
      catch (error) {
        console.error('RESOURCES ERROR:', error)

        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
        error: error.message,
      }),
    }
  }
}