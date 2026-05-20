export async function login(username, password) {
  const res = await fetch(`${import.meta.env.VITE_WP_API}/wp-json/jwt-auth/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })

  if (!res.ok) throw new Error('Login failed')

  return await res.json()
}