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

exports.handler = async (event) => {

  try {

    const token =
      event.headers.authorization?.replace(
        'Bearer ',
        ''
      )

    const user = await getUser(token)

    const roles = user?.roles || []

    const canSeePrivate =
      roles.includes('administrator') ||
      roles.includes('editor') ||
      roles.includes('ebteam')

    const query = event.rawQueryString || ''

    const status = canSeePrivate
      ? 'publish,private'
      : 'publish'

    const url =
      `${WP}/wp-json/wp/v2/inforepo_resource` +
      `?status=${status}` +
      `${query ? `&${query}` : ''}` +
      `&_embed=true`

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