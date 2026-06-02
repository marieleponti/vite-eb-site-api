export async function login(username, password) {
  const res = await fetch('/.netlify/functions/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

  return await res.json()
}