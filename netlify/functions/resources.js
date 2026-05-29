const WP = process.env.WP_API

async function getUser(token) {

  if (!token) return null

  const res = await fetch(
    `${WP}/wp-json/wp/v2/users/me`,
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
      event.headers?.authorization?.replace(
        'Bearer ',
        ''
      )

    const user = await getUser(token)

    const roles = user?.roles || []

    const canSeePrivate =
      roles.includes('administrator') ||
      roles.includes('editor') ||
      roles.includes('ebteam')

    // pagination
    const page =
      event.queryStringParameters?.page || '1'

    const perPage =
      event.queryStringParameters?.per_page || '16'

    // optional filters
    const search =
      event.queryStringParameters?.search || ''

    const categories =
      event.queryStringParameters?.categories || ''

    const tags =
      event.queryStringParameters?.tags || ''

    // build params
    const params = new URLSearchParams()

    params.set('page', page)
    params.set('per_page', perPage)
    params.set('_embed', 'true')

    params.set(
      'status',
      canSeePrivate
        ? 'publish,private'
        : 'publish'
    )

    if (search) {
      params.set('search', search)
    }

    if (categories) {
      params.set('categories', categories)
    }

    if (tags) {
      params.set('tags', tags)
    }

    const url =
      `${WP}/wp-json/wp/v2/inforepo_resource?${params.toString()}`

    console.log('FINAL URL:', url)

    const response = await fetch(url, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    })

    if (!response.ok) {
      throw new Error(`WP error: ${response.status}`)
    }

    const items = await response.json()

    return {
      statusCode: 200,

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        items,

        total: Number(
          response.headers.get('X-WP-Total') || 0
        ),

        total_pages: Number(
          response.headers.get('X-WP-TotalPages') || 1
        ),
      }),
    }

  } catch (error) {

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