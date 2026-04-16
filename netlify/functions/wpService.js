const BASE_URL = 'https://dev-eb-vue.pantheonsite.io/wp-json/wp/v2';

function getAuthHeader() {
  const credentials = Buffer.from(
    `${process.env.WP_USER}:${process.env.WP_PASSWORD}`
  ).toString('base64');

  return {
    Authorization: `Basic ${credentials}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchPosts() {
  const res = await fetch(`${BASE_URL}/posts`, {
    headers: getAuthHeader(),  
  });

  if (!res.ok) throw new Error(`WP error: ${res.status}`);

  return res.json();
}

export async function createPost(payload) {
  const res = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`WP error: ${res.status}`);

  return res.json();
}

export async function updatePost(id, payload) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`WP update error ${res.status}: ${errorText}`);
  }

  return res.json();
}