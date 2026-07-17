// functions/api/filters.js
//
// Cloudflare Pages Function — equivalent to the old Netlify function.
// Cloudflare auto-routes this file to the path /api/filters based on its location.

export async function onRequestGet(context) {
  const { env } = context

  try {
    const res = await fetch(
      `${env.WP_API}/wp-json/ebinforepo/v1/filters`
    )

    const text = await res.text()
    const data = JSON.parse(text)

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {

    // Log the real error internally (visible only in Cloudflare's function logs)
    console.error('Filters function error:', error)

    // Return a generic message to the client — never expose internals
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}