export async function login(username, password) {

  const res = await fetch(
    '/.netlify/functions/login',
    {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
    }
  )

  const data = await res.json()

  localStorage.setItem(
    'jwt',
    data.token
  )

  return data
}