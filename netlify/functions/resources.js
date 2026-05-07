const WP_BASE = 'https://dev-eb-vue.pantheonsite.io/wp-json/wp/v2'

exports.handler = async (event) => {
  try {
    const query = event.rawQueryString || ''
    const url = `${WP_BASE}/inforepo_resource${query ? `?${query}&` : '?'}_embed=true`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`WP error: ${response.status}`)
    }

    const items = await response.json()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        items,
        total: Number(response.headers.get('X-WP-Total') || 0),
        total_pages: Number(
          response.headers.get('X-WP-TotalPages') || 1
        ),
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message,
      }),
    }
  }
}