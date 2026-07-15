// functions/auth.js
//
// Cloudflare Pages Function — equivalent to the old Netlify function.
// Cloudflare auto-routes this file to the path /auth based on its filename.

export async function onRequestPost(context) {
  const { request, env } = context

  try {
    const { username, password } = await request.json()

    const res = await fetch(
      `${env.WP_API}/wp-json/jwt-auth/v1/token`,
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
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        token: data.token,
        user: {
          email: data.user_email,
          name: data.user_display_name,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {

    // Log the real error internally (visible only in Cloudflare's function logs)
    console.error('Auth function error:', error)

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