// netlify functions

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

    const token = event.headers?.authorization?.replace('Bearer ', '') || null
    const user = await getUser(token)
    const roles = user?.roles || []

    const canSeePrivate =
      roles.includes('administrator') ||
      roles.includes('editor') ||
      roles.includes('ebteam')

    // =====================
    // QUERY PARAMS
    // =====================
    const paramsRaw = event.queryStringParameters || {}
    const page = paramsRaw.page || '1'
    const perPage = paramsRaw.per_page || '16'
    const search = paramsRaw.search || ''
    const slug = paramsRaw.slug || '' 

    const categories = paramsRaw.categories || ''
    const tags = paramsRaw.tags || ''
    const country = paramsRaw.country || ''
    const topic = paramsRaw.topic || ''
    const source = paramsRaw.source || ''
    const format = paramsRaw.format || ''
    const language = paramsRaw.language || ''
    const researchTeam = paramsRaw['research-team'] || ''
    const specialContent = paramsRaw['special-content'] || ''

    // =====================
    // BUILD WP PARAMS
    // =====================
    const params = new URLSearchParams()

    params.set('page', page)
    params.set('per_page', perPage)
    params.set('_embed', 'true')
    params.set('status', canSeePrivate ? 'publish,private' : 'publish')

    if (search) params.set('search', search)
    if (slug) params.set('slug', slug)

    if (categories) params.set('categories', categories)
    if (tags) params.set('tags', tags)
    if (country) params.set('country', country)
    if (topic) params.set('topic', topic)
    if (source) params.set('source', source)
    if (format) params.set('format', format)
    if (language) params.set('language', language)
    if (researchTeam) params.set('research-team', researchTeam)
    if (specialContent) params.set('special-content', specialContent)

    const url = `${WP}/wp-json/ebinforepo/v1/resources?${params.toString()}`

    const response = await fetch(url, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    })

    if (!response.ok) {
      throw new Error(`WP error: ${response.status}`)
    }

    const totalItems = response.headers.get('X-WP-Total') || '0'
    const totalPages = response.headers.get('X-WP-TotalPages') || '1'

    const data = await response.json()

    let resourcesArray = Array.isArray(data)
      ? data
      : (data.items || [])

    // =====================
    // SINGLE MODE (slug)
    // =====================
    if (slug && resourcesArray.length) {
      resourcesArray = [resourcesArray[0]]
    }

    // =====================
    // SEARCH FILTER (fallback frontend)
    // =====================
    if (search && Array.isArray(resourcesArray)) {
      const palabra = search.toLowerCase().trim()

      resourcesArray = resourcesArray.filter(resource => {
        if (!resource) return false

        const titulo =
          typeof resource.title === 'object'
            ? resource.title?.rendered
            : resource.title

        const contenido =
          typeof resource.content === 'object'
            ? resource.content?.rendered
            : resource.content

        const extracto =
          typeof resource.excerpt === 'object'
            ? resource.excerpt?.rendered
            : resource.excerpt

        const texto = `${titulo} ${contenido} ${extracto}`.toLowerCase()

        return texto.includes(palabra)
      })
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: resourcesArray,
        total: search
          ? resourcesArray.length
          : (data.total || parseInt(totalItems) || resourcesArray.length),
        total_pages: search
          ? 1
          : (data.total_pages || parseInt(totalPages) || 1),
      }),
    }

  } catch (error) {

    console.error('Resources function error:', error)

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    }
  }
}