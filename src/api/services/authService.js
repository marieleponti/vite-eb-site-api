export async function login(username, password) {

  const res = await fetch('/.netlify/functions/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    }),
  })

  const text = await res.text()

  return text ? JSON.parse(text) : null
}