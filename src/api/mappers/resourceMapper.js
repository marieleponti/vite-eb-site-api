import { cleanHtml } from './cleanHtml'

export function normalizeResource(item) {
  return {
    id: item.id,

    title: item.title?.rendered || item.title,

    excerpt: cleanHtml(item.excerpt?.rendered || ''),

    content: cleanHtml(item.content?.rendered || ''),

    date: item.date,

    featuredImage:
      item._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      item.featured_image ||
      null,

    permalink: item.link
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

    total: response?.total ?? rawItems.length ?? 0,
    totalPages: response?.total_pages ?? 1
  }
}