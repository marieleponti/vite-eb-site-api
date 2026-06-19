const WP = process.env.WP_API

exports.handler = async (event) => {
  const token = event.headers.authorization?.replace('Bearer ', '')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  try {
    if (event.httpMethod === 'GET') {
      // CAPTURA CLAVE: Leemos tanto 'search' como 's' para que no haya pérdidas
      const query = event.queryStringParameters?.search || event.queryStringParameters?.s || ''
      const categories = event.queryStringParameters?.categories || ''
      const tags = event.queryStringParameters?.tags || ''
      const slug = event.queryStringParameters?.slug || ''

      // 1. Construimos la URL base para WordPress
      let url = `${WP}/wp-json/wp/v2/posts?_embed=true&per_page=100`

      if (slug) {url += `&slug=${encodeURIComponent(slug)}`}

      // 2. Si venían taxonomías de tus filtros funcionales, las conservamos
      if (categories) url += `&categories=${categories}`
      if (tags) url += `&tags=${tags}`
      
      // 3. Añadimos el parámetro de búsqueda nativo a WP
      if (query) url += `&search=${encodeURIComponent(query)}`

      const res = await fetch(url, { headers })
      let data = await res.json()

      // 4. DOBLE ESCUDO: Si Pantheon ignora el parámetro '?search=', JS filtra el JSON aquí mismo
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

    // =====================
    // CREATE POST
    // =====================
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body)
      const res = await fetch(`${WP}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      const data = await res.json()
      return { statusCode: res.status, body: JSON.stringify(data) }
    }

    // =====================
    // UPDATE POST
    // =====================
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body)
      const id = body.id
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Falta el ID' }) }

      const res = await fetch(`${WP}/wp-json/wp/v2/posts/${id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      const data = await res.json()
      return { statusCode: res.status, body: JSON.stringify(data) }
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}