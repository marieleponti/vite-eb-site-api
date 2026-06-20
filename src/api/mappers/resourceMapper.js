import { cleanHtml } from './cleanHtml'

export function normalizeResource(item) {

return {
id: item.id,

// slug:
//   item.slug ||
//   item.link?.split('/').filter(Boolean).pop() ||
//   '',

slug: (item.slug || item.link || '')
  .split('/')
  .filter(Boolean)
  .pop() || '',

title:
  item.title?.rendered ??
  item.title ??
  'Untitled',
  
permalink: normalizePermalink(
  item.link ??
  item.permalink ??
  '#'
),

excerpt: cleanHtml(
  item.excerpt?.rendered ??
  item.excerpt ??
  ''
),

content: cleanHtml(
  item.content?.rendered ??
  item.content ??
  ''
),

date:
  item.date ?? '',

featuredImage:
  item.featuredImage ??
  item._embedded?.['wp:featuredmedia']?.[0]?.source_url ??
  item.featured_media_url ??
  item.featured_image ??
  item.acf?.image ??
  null,

topics:
  item.topic ?? [],

formats:
  item.format ?? [],

countries:
  item.country ?? [],

languages:
  item.language ?? [],

status:
  item.status ?? 'publish',

}
}

export function normalizeResourcesResponse(response) {

// const rawItems =
// response?.items ??
// response ??
// []
const rawItems = Array.isArray(response?.items)
  ? response.items
  : Array.isArray(response)
    ? response
    : []

return {

items: Array.isArray(rawItems)
  ? rawItems.map(normalizeResource)
  : [],

total:
  response?.total ??
  rawItems.length ??
  0,

totalPages:
  Number(response?.total_pages ?? 1),
}
}

export function normalizePermalink(permalink) {
  if (!permalink) return permalink
  try {
    const url = new URL(permalink)
    return url.pathname // "/resources/.../..."
  } catch {
    return permalink // si ya era "/resources/..."
  }
}
