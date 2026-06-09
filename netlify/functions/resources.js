const WP = process.env.WP_API

async function getUser(token) {
  if (!token) return null

  const res = await fetch(
    `${WP}/wp-json/ebinforepo/v1/me`, {
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
    console.log('HEADERS RECEIVED:', event.headers)
    console.log('AUTH FROM NETLIFY:', event.headers?.authorization)

    const token = event.headers?.authorization?.replace('Bearer ', '')
    const user = await getUser(token)
    const roles = user?.roles || []

    const canSeePrivate =
      roles.includes('administrator') ||
      roles.includes('editor') ||
      roles.includes('ebteam')

    // =====================
    // QUERY PARAMS
    // =====================
    const page = event.queryStringParameters?.page || '1'
    const perPage = event.queryStringParameters?.per_page || '16'
    const search = event.queryStringParameters?.search || ''
    const categories = event.queryStringParameters?.categories || ''
    const tags = event.queryStringParameters?.tags || ''
    const country = event.queryStringParameters?.country || ''
    const topic = event.queryStringParameters?.topic || ''
    const source = event.queryStringParameters?.source || ''
    const format = event.queryStringParameters?.format || ''
    const language = event.queryStringParameters?.language || ''

    // =====================
    // BUILD WP PARAMS
    // =====================
    const params = new URLSearchParams()

    params.set('page', page)
    params.set('per_page', perPage)
    params.set('_embed', 'true')
    params.set('status', canSeePrivate ? 'publish,private' : 'publish')

    if (search) params.set('search', search)
    if (categories) params.set('categories', categories)
    if (tags) params.set('tags', tags)

    // IMPORTANT: tax filters (SLUGS expected)
    if (country) params.set('country', country)
    if (topic) params.set('topic', topic)
    if (source) params.set('source', source)
    if (format) params.set('format', format)
    if (language) params.set('language', language)

    const url = `${WP}/wp-json/ebinforepo/v1/resources?${params.toString()}`
    console.log('FINAL URL:', url)

    // =====================
    // FETCH WP
    // =====================
    console.log('TOKEN:', token)
    console.log('AUTH HEADER:', token ? `Bearer ${token}` : 'NO TOKEN')

    const response = await fetch(url, {
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {},
    })

    if (!response.ok) {
      throw new Error(`WP error: ${response.status}`)
    }

    // 1. EXTRAEMOS LOS TOTALES REALES DE LAS CABECERAS DE WORDPRESS
    const totalItems = response.headers.get('X-WP-Total') || '0'
    const totalPages = response.headers.get('X-WP-TotalPages') || '1'

    const rawText = await response.text()
    let data = JSON.parse(rawText)

    // Si tu plugin de WP ya devuelve { items, total, total_pages }, lo usamos. Si no, usamos la raíz.
    let resourcesArray = Array.isArray(data) ? data : (data.items || [])

    // ==========================================
    // 2. ESCUDO DE JAVASCRIPT CORREGIDO Y ULTRA-FLEXIBLE
    // ==========================================
    if (search && Array.isArray(resourcesArray)) {
      const palabra = search.toLowerCase().trim()

      console.log(`Filtrando manualmente en Netlify por la palabra: "${palabra}"`);
      console.log('Muestra del primer recurso recibido de WP:', JSON.stringify(resourcesArray[0]));

      resourcesArray = resourcesArray.filter(resource => {
        if (!resource) return false;

        // Intentamos buscar en el título de todas las formas posibles (objeto o string directo)
        let titulo = ''
        if (typeof resource.title === 'object' && resource.title?.rendered) {
          titulo = resource.title.rendered
        } else if (typeof resource.title === 'string') {
          titulo = resource.title
        }

        // Intentamos buscar en el contenido o excerpt de todas las formas posibles
        let contenido = ''
        if (typeof resource.content === 'object' && resource.content?.rendered) {
          contenido = resource.content.rendered
        } else if (typeof resource.content === 'string') {
          contenido = resource.content
        }

        let extracto = ''
        if (typeof resource.excerpt === 'object' && resource.excerpt?.rendered) {
          extracto = resource.excerpt.rendered
        } else if (typeof resource.excerpt === 'string') {
          extracto = resource.excerpt
        }

        const textoDondeBuscar = `${titulo} ${contenido} ${extracto}`.toLowerCase()

        // Retorna true si encuentra la palabra
        return textoDondeBuscar.includes(palabra)
      })

      console.log(`Filtrado terminado. Recursos que coincidieron: ${resourcesArray.length}`);
    }

    // ==========================================
    // 3. RETORNAMOS EL OBJETO PERFECTAMENTE ESTRUCTURADO
    // ==========================================
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: resourcesArray,
        // Si hay búsqueda, usamos el total filtrado; si no, el total general de WP
        total: search ? resourcesArray.length : (data.total || parseInt(totalItems) || resourcesArray.length),
        total_pages: search ? 1 : (data.total_pages || parseInt(totalPages) || 1),
      }),
    }

  } catch (error) {
    console.error('RESOURCES ERROR:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message,
      }),
    }
  }
}