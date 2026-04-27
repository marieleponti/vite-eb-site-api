function decodeHtml(text = '') {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

function limpiar(html = '') {
  return decodeHtml(
    html
      .replace(/\[[^\]]+\]/g, '')      // elimina shortcodes
      .replace(/<\/?[^>]+(>|$)/g, '')  // elimina HTML
      .replace(/\s+/g, ' ')            // normaliza espacios
      .trim()
  )
}

export function mapPost(post) {
  return {
    id: post.id,
    slug: post.slug,

    title: decodeHtml(post.title?.rendered || ''),

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