// functions/posts.js
//
// Cloudflare Pages Function — equivalent to the old Netlify function.
// Cloudflare auto-routes this file to the path /posts based on its filename.
// Only GET is supported; write functionality was removed as unused.

export async function onRequestGet(context) {
  const { request, env } = context

  try {
    const url = new URL(request.url)
    const params = url.searchParams

    const query = params.get('search') || params.get('s') || ''
    const categories = params.get('categories') || ''
    const tags = params.get('tags') || ''
    const slug = params.get('slug') || ''

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    let wpUrl = `${env.WP_API}/wp-json/wp/v2/posts?_embed=true&per_page=100`

    if (slug) wpUrl += `&slug=${encodeURIComponent(slug)}`
    if (categories) wpUrl += `&categories=${encodeURIComponent(categories)}`
    if (tags) wpUrl += `&tags=${encodeURIComponent(tags)}`
    if (query) wpUrl += `&search=${encodeURIComponent(query)}`

    const res = await fetch(wpUrl, { headers })
    let data = await res.json()

    // Fallback filter: in case Pantheon ignores the '?search=' parameter,
    // filter the JSON here as a second layer of protection
    if (query && Array.isArray(data)) {
      const word = query.toLowerCase()
      data = data.filter(post => {
        const inTitle = post.title?.rendered?.toLowerCase().includes(word)
        const inContent = post.content?.rendered?.toLowerCase().includes(word)
        return inTitle || inContent
      })
    }

    return new Response(
      JSON.stringify(data),
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
    console.error('Posts function error:', error)

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