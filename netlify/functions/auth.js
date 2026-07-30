// netlify functions

const WP = process.env.WP_API

exports.handler = async (event) => {

  try {

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({
          error: 'Method not allowed',
        }),
      }
    }

    const { username, password } =
      JSON.parse(event.body)

    const res = await fetch(
      `${WP}/wp-json/jwt-auth/v1/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    )

    const data = await res.json()

    if (!res.ok || !data.token) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Invalid credentials',
        }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        token: data.token,
        user: {
          email: data.user_email,
          name: data.user_display_name,
        },
      }),
    }

  } catch (error) {

    console.error('Auth function error:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    }
  }
}