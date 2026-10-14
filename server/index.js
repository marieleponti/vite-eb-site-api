// Server for the Droplet: serves the built Vue app (dist/) as static files
// and reuses the exact functions/api/*.js handlers already deployed on
// Cloudflare Pages, wrapped by ./adapter.js. This file only exists for the
// Droplet deployment — Cloudflare Pages never sees or runs it.

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { wrapCloudflareFunction } from './adapter.js'

import { onRequestPost as authHandler } from '../functions/api/auth.js'
import { onRequestGet as meHandler } from '../functions/api/me.js'
import { onRequestGet as postsHandler } from '../functions/api/posts.js'
import { onRequestGet as resourcesHandler } from '../functions/api/resources.js'
import { onRequestGet as filtersHandler } from '../functions/api/filters.js'
import { onRequestPost as contactHandler } from '../functions/api/contact.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

const app = express()
app.use(express.json())

app.post('/api/auth', wrapCloudflareFunction(authHandler))
app.get('/api/me', wrapCloudflareFunction(meHandler))
app.get('/api/posts', wrapCloudflareFunction(postsHandler))
app.get('/api/resources', wrapCloudflareFunction(resourcesHandler))
app.get('/api/filters', wrapCloudflareFunction(filtersHandler))
app.post('/api/contact', wrapCloudflareFunction(contactHandler))

app.use(express.static(distDir))

// Vue Router history mode: any non-API, non-file route falls back to
// index.html so client-side routing can take over.
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`EB frontend + API server listening on port ${port}`)
})
