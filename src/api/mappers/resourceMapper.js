import { cleanHtml } from './cleanHtml'

export function normalizeResource(item) {

return {
id: item.id,

slug:
  item.slug ?? '',

title:
  item.title?.rendered ??
  item.title ??
  'Untitled',

permalink:
  item.link ??
  item.permalink ??
  '#',

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

const rawItems =
response?.items ??
response ??
[]

return {

items: Array.isArray(rawItems)
  ? rawItems.map(normalizeResource)
  : [],

total:
  response?.total ??
  rawItems.length ??
  0,

totalPages:
  response?.total_pages ??
  1,

}
}
