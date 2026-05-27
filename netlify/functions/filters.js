const WP = process.env.WP_API

exports.handler = async () => {
  try {

    const res = await fetch(
      `${WP}/wp-json/ebinforepo/v1/filters`
    )

    const data = await res.json()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }

  } catch (err) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
      }),
    }
  }
}