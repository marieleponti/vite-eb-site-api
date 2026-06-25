import { cleanHtml, sanitizeContent } from './cleanHtml'
import { decodeHtmlEntities } from '../../utils/decodeHtmlEntities'

export function mapPost(post) {
  return {
    id: post.id,
    slug: post.slug ?? '',

    title: decodeHtmlEntities(
      post.title?.rendered ??
      post.title ??
      'Untitled'
    ),

    permalink:
      post.link ??
      post.permalink ??
      '#',

    // Texto plano — para previews/cards (interpolación de texto, no v-html)
    excerpt: cleanHtml(
      post.excerpt?.rendered ??
      post.excerpt ??
      ''
    ),

    // HTML preservado (sanitizado) — para el cuerpo completo en la página
    // de detalle, que se renderiza con v-html. Antes esto pasaba por
    // cleanHtml() y perdía TODOS los tags (párrafos, links, negritas,
    // imágenes) antes de llegar a v-html.
    content: sanitizeContent(
      post.content?.rendered ??
      post.content ??
      ''
    ),

    author:
      post._embedded?.author?.[0]?.name ??
      post.author ??
      'Unknown',

    featuredImage:
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url ??
      post.featuredImage ??
      post.featured_image ??
      post.image ??
      null,

    date: post.date ?? '',

    topics: post.topic ?? [],
    formats: post.format ?? [],
    countries: post.country ?? [],
    languages: post.language ?? [],
    visibility: post.visibility ?? [],

    status: post.status ?? 'publish',
  }
}