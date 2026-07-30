// netlify functions

const WP = process.env.WP_API

exports.handler = async (event) => {
  const token = event.headers.authorization?.replace('Bearer ', '')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  try {
    if (event.httpMethod === 'GET') {
      const query = event.queryStringParameters?.search || event.queryStringParameters?.s || ''
      const categories = event.queryStringParameters?.categories || ''
      const tags = event.queryStringParameters?.tags || ''
      const slug = event.queryStringParameters?.slug || ''

      let url = `${WP}/wp-json/wp/v2/posts?_embed=true&per_page=100`

      if (slug) url += `&slug=${encodeURIComponent(slug)}`
      if (categories) url += `&categories=${encodeURIComponent(categories)}`
      if (tags) url += `&tags=${encodeURIComponent(tags)}`
      if (query) url += `&search=${encodeURIComponent(query)}`

      const res = await fetch(url, { headers })
      let data = await res.json()

      if (query && Array.isArray(data)) {
        const palabra = query.toLowerCase()
        data = data.filter(post => {
          const enTitulo = post.title?.rendered?.toLowerCase().includes(palabra)
          const enContenido = post.content?.rendered?.toLowerCase().includes(palabra)
          return enTitulo || enContenido
        })
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data),
      }
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}