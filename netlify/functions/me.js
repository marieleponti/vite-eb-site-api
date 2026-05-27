const WP = process.env.WP_API

exports.handler = async (event) => {

  try {

    const token =
      event.headers.authorization?.replace(
        'Bearer ',
        ''
      )

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Missing token',
        }),
      }
    }

    const res = await fetch(
      `${WP}/wp-json/wp/v2/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!res.ok) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Invalid token',
        }),
      }
    }

    const user = await res.json()

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: user.id,
        name: user.name,
        roles: user.roles,
        caps: user.capabilities,
      }),
    }

  } catch (error) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    }
  }
}