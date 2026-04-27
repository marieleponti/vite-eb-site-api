function limpiar(html = '') {
  return html
    // Elimina shortcodes de Divi y otros plugins
    .replace(/\[[^\]]+\]/g, '')
    // Elimina etiquetas HTML
    .replace(/<\/?[^>]+(>|$)/g, '')
    // Normaliza espacios
    .replace(/\s+/g, ' ')
    .trim()
}

export function mapPost(post) {
  return {
    id: post.id,
    slug: post.slug,

    title: limpiar(post.title?.rendered || ''),

    excerpt: limpiar(post.excerpt?.rendered || ''),

    content: limpiar(post.content?.rendered || ''),

    author: post._embedded?.author?.[0]?.name || 'Unknown',

    featuredImage:
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,

    date: post.date,

    permalink: post.link,

    topics: post.topic || [],
    formats: post.format || [],
    countries: post.country || [],
    languages: post.language || [],

    visibility: post.visibility || [],

    status: post.status,
  }
}