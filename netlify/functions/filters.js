// netlify functions

const WP = process.env.WP_API

exports.handler = async () => {
  try {

    const res = await fetch(
      `${WP}/wp-json/ebinforepo/v1/filters`
    )

    const text = await res.text()

    const data = JSON.parse(text)

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: err.message,
      }),
    }
  }
}