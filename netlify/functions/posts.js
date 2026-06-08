const WP = process.env.WP_API

exports.handler = async (event) => {

  const token =
    event.headers.authorization?.replace('Bearer ', '')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ?
      {
        Authorization: `Bearer ${token}`
      } :
      {}),
  }

  try {

    // =====================
    // GET POSTS
    // =====================
    if (event.httpMethod === 'GET') {

      const url =
        `${WP}/wp-json/wp/v2/posts?_embed=true`
        
      const res = await fetch(url, {
        headers
      })
      const data = await res.json()

      return {
        statusCode: 200,
        body: JSON.stringify(data),
      }
    }

    // =====================
    // CREATE POST
    // =====================
    if (event.httpMethod === 'PUT') {

      const body = JSON.parse(event.body)

      const res = await fetch(
        `${WP}/wp-json/wp/v2/posts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        }
      )
      if (!res.ok) {
        const text = await res.text()
        return {
          statusCode: res.status,
          body: text,
        }
      }
    }

    // =====================
    // UPDATE POST
    // =====================
    if (event.httpMethod === 'PUT') {

      const body = JSON.parse(event.body)
      const id = body.id

      const res = await fetch(
        `${WP}/wp-json/wp/v2/posts/${id}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        }
      )

      const data = await res.json()

      return {
        statusCode: res.status,
        body: JSON.stringify(data),
      }
    }

    return {
      statusCode: 405,
      body: JSON.stringify({
        error: 'Method not allowed',
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