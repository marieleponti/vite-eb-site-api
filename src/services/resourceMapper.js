import { cleanHTML } from './mappers' // o donde lo tengas

// -------------------------
// SINGLE RESOURCE NORMALIZER
// -------------------------
export function normalizeResource(item) {
  return {
    id: item.id,

    slug: item.slug ?? '',

    title: item.title?.rendered ?? item.title ?? 'Untitled',

    permalink: item.link ?? item.permalink ?? '#',

    excerpt: cleanHTML(
      item.excerpt?.rendered ??
      item.excerpt ??
      ''
    ),

    content: cleanHTML(
      item.content?.rendered ??
      item.content ??
      ''
    ),

    date: item.date ?? '',

    // -------------------------
    // FEATURED IMAGE (robusto)
    // -------------------------
    featuredImage:
      item._embedded?.['wp:featuredmedia']?.[0]?.source_url ??
      item.featured_media_url ??
      item.featured_image ??
      item.acf?.image ??
      null,

    // -------------------------
    // TAXONOMIES (safe guards)
    // -------------------------
    topics: item.topic ?? [],
    formats: item.format ?? [],
    countries: item.country ?? [],
    languages: item.language ?? [],

    status: item.status ?? 'publish',
  }
}