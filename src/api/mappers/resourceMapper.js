import { cleanHtml, sanitizeContent } from './cleanHtml'
import { decodeHtmlEntities } from '../../utils/decodeHtmlEntities'

export function normalizeResource(item) {

  return {
    id: item.id,

    slug: (item.slug || item.link || '')
      .split('/')
      .filter(Boolean)
      .pop() || '',

    title: decodeHtmlEntities(
      item.title?.rendered ??
      item.title ??
      'Untitled'
    ),

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

    content: sanitizeContent(
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
      item.taxonomies?.topic ?? item.topic ?? [],

    formats:
      item.taxonomies?.format ?? item.format ?? [],

    countries:
      item.taxonomies?.country ?? item.country ?? [],

    languages:
      item.taxonomies?.language ?? item.language ?? [],

    status:
      item.status ?? 'publish',

    // FALTABA: ResourceSingle.vue lee directo de `resource.acf.*`
    // (description, video_embed, author, upload_files). Sin esto,
    // todo ese contenido quedaba undefined sin importar qué tuviera
    // WordPress -- por eso el single solo mostraba título y fecha.
    // El backend (helpers.php / inforepo_format_resources_response)
    // ya manda esto bien armado: es pass-through directo.
    acf: item.acf ?? {},

    // FALTABA: el sidebar "Resource Specifications" de ResourceSingle.vue
    // lee de `resource.taxonomies.<nombre>`. El backend YA devuelve este
    // objeto con la forma exacta (authoring_organization, country, topic,
    // source, format, city_community, language) -- es pass-through
    // directo, no hay que reconstruirlo desde campos planos.
    taxonomies: item.taxonomies ?? {},

    // Lat/lng del nuevo campo "location" (reemplaza Mapster — ver
    // wp-location-picker/). label es la ciudad/país elegida en el
    // autocompletado, útil para mostrar "Ubicación: Bogotá, Colombia".
    ...extractLatLng(item),
    locationLabel: item.acf?.location?.label ?? null,
  }
}

export function normalizeResourcesResponse(response) {

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

/**
 * Intenta sacar { lat, lng } de varios nombres/formatos de campo posibles.
 * `item.acf.location` es el campo real (grupo ACF: { search, lat, lng }
 * armado en wp-location-picker/, reemplaza Mapster). El resto de los
 * candidatos quedan como fallback por si en algún momento conviven varios
 * orígenes de datos (migraciones, contenido viejo, etc.).
 */
function extractLatLng(item) {
  const raw =
    item.acf?.location ??
    item.acf?.latlng ??
    item.acf?.map ??
    item.acf?.mapster_map ??
    item.latlng ??
    item.location ??
    null

  return coordsFromValue(raw) ?? { lat: null, lng: null }
}

function coordsFromValue(raw) {
  if (raw == null) return null

  if (typeof raw === 'string') {
    try {
      return coordsFromValue(JSON.parse(raw))
    } catch {
      const parts = raw.split(',').map((s) => parseFloat(s.trim()))
      if (parts.length === 2 && parts.every((n) => !Number.isNaN(n))) {
        return { lat: parts[0], lng: parts[1] }
      }
      return null
    }
  }

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    if (typeof raw.lat === 'number' && typeof raw.lng === 'number') {
      return { lat: raw.lat, lng: raw.lng }
    }

    // GeoJSON FeatureCollection, formato del Mapster original.
    // OJO: GeoJSON guarda [lng, lat], hay que invertir el orden.
    const feature = raw.features?.[0]
    if (feature?.geometry?.coordinates) {
      const [lng, lat] = feature.geometry.coordinates
      if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng }
    }
  }

  return null
}