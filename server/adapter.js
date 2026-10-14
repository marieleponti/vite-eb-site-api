// Lets the existing Cloudflare Pages Functions in functions/api/ run
// unmodified inside a plain Node/Express server. Those files are the same
// ones the live Cloudflare Pages deployment uses — nothing about them
// changes here, so the Cloudflare deploy stays exactly as it is today.
//
// A Cloudflare Function receives ({ request, env }) where `request` is a
// standard Fetch API Request and returns a standard Response. Node 18+
// has both natively, so this just translates Express's (req, res) into
// that shape and back.

export function wrapCloudflareFunction(handler) {
  return async (req, res) => {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`

    const init = { method: req.method, headers: req.headers }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = JSON.stringify(req.body ?? {})
    }

    const request = new Request(url, init)

    let response
    try {
      response = await handler({ request, env: process.env })
    } catch (error) {
      console.error('Unhandled error in wrapped function:', error)
      res.status(500).json({ error: 'Internal server error' })
      return
    }

    res.status(response.status)
    for (const [key, value] of response.headers.entries()) {
      // Node/Express sets its own; forwarding it verbatim causes a conflict.
      if (key.toLowerCase() === 'content-length') continue
      res.setHeader(key, value)
    }

    const body = await response.text()
    res.send(body)
  }
}
