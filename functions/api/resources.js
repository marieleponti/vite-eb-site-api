// functions/resources.js
//
// Cloudflare Pages Function — equivalent to the old Netlify function.
// Cloudflare auto-routes this file to the path /resources based on its filename.

async function getUser(wpApi, token) {
  if (!token) return null

  const res = await fetch(
    `${wpApi}/wp-json/ebinforepo/v1/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) return null

  return await res.json()
}

export async function onRequestGet(context) {
  const { request, env } = context

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
    const user = await getUser(env.WP_API, token)
    const roles = user?.roles || []

    const canSeePrivate =
      roles.includes('administrator') ||
      roles.includes('editor') ||
      roles.includes('ebteam')

    // =====================
    // QUERY PARAMS
    // =====================
    const url = new URL(request.url)
    const params = url.searchParams

    const page = params.get('page') || '1'
    const perPage = params.get('per_page') || '16'
    const search = params.get('search') || ''
    const slug = params.get('slug') || ''

    const categories = params.get('categories') || ''
    const tags = params.get('tags') || ''
    const country = params.get('country') || ''
    const topic = params.get('topic') || ''
    const source = params.get('source') || ''
    const format = params.get('format') || ''
    const language = params.get('language') || ''
    const researchTeam = params.get('research-team') || ''
    const specialContent = params.get('special-content') || ''

    // =====================
    // BUILD WP PARAMS
    // =====================
    const wpParams = new URLSearchParams()

    wpParams.set('page', page)
    wpParams.set('per_page', perPage)
    wpParams.set('_embed', 'true')
    wpParams.set('status', canSeePrivate ? 'publish,private' : 'publish')

    if (search) wpParams.set('search', search)
    if (slug) wpParams.set('slug', slug)

    if (categories) wpParams.set('categories', categories)
    if (tags) wpParams.set('tags', tags)
    if (country) wpParams.set('country', country)
    if (topic) wpParams.set('topic', topic)
    if (source) wpParams.set('source', source)
    if (format) wpParams.set('format', format)
    if (language) wpParams.set('language', language)
    if (researchTeam) wpParams.set('research-team', researchTeam)
    if (specialContent) wpParams.set('special-content', specialContent)

    const wpUrl = `${env.WP_API}/wp-json/ebinforepo/v1/resources?${wpParams.toString()}`

    const response = await fetch(wpUrl, {
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
    // SEARCH FILTER (frontend fallback)
    // =====================
    if (search && Array.isArray(resourcesArray)) {
      const word = search.toLowerCase().trim()

      resourcesArray = resourcesArray.filter(resource => {
        if (!resource) return false

        const title =
          typeof resource.title === 'object'
            ? resource.title?.rendered
            : resource.title

        const content =
          typeof resource.content === 'object'
            ? resource.content?.rendered
            : resource.content

        const excerpt =
          typeof resource.excerpt === 'object'
            ? resource.excerpt?.rendered
            : resource.excerpt

        const text = `${title} ${content} ${excerpt}`.toLowerCase()

        return text.includes(word)
      })
    }

    return new Response(
      JSON.stringify({
        items: resourcesArray,
        total: search
          ? resourcesArray.length
          : (data.total || parseInt(totalItems) || resourcesArray.length),
        total_pages: search
          ? 1
          : (data.total_pages || parseInt(totalPages) || 1),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {

    // Log the real error internally (visible only in Cloudflare's function logs)
    console.error('Resources function error:', error)

    // Return a generic message to the client — never expose internals
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}