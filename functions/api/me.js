// functions/me.js
//
// Cloudflare Pages Function — equivalent to the old Netlify function.
// Cloudflare auto-routes this file to the path /me based on its filename.

export async function onRequestGet(context) {
  const { request, env } = context

  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const res = await fetch(
      `${env.WP_API}/wp-json/ebinforepo/v1/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const user = await res.json()

    return new Response(
      JSON.stringify({
        id: user.id,
        roles: user.roles,
        caps: user.capabilities,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {

    // Log the real error internally (visible only in Cloudflare's function logs)
    console.error('Me function error:', error)

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