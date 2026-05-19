const WP = process.env.VITE_WP_API

async function getUser(event) {
  try {
    const res = await fetch(
      `${WP}/wp-json/custom/v1/me`, {
        headers: {
          cookie: event.headers.cookie || '',
        },
      }
    )
    if (!res.ok) {
      return null
    }

    return await res.json()

  } catch {
    return null
  }
}

exports.handler = async (event) => {
  try {

    const user = await getUser(event)

    const roles = user?.roles || []

    const canSeePrivate =
      roles.includes('administrator') ||
      roles.includes('editor')

    const query = event.rawQueryString || ''

    const status = canSeePrivate ?
      'publish,private' :
      'publish'

    const url =
      `${WP}/wp-json/wp/v2/inforepo_resource` +
      `?status=${status}` +
      `${query ? `&${query}` : ''}` +
      `&_embed=true`

    const response = await fetch(url, {
      headers: {
        cookie: event.headers.cookie || '',
      },
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


