function limpiar(html = '') {
  return html.replace(/<\/?[^>]+(>|$)/g, '')
}

export function mapPost(post) {
  return {
    id: post.id,
    slug: post.slug,

    title: post.title?.rendered || '',

    excerpt: limpiar(post.excerpt?.rendered || ''),

    content: limpiar(post.content?.rendered || ''),

    author: post._embedded?.author?.[0]?.name || 'Unknown',

    featuredImage:
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,

    date: post.date,

    topics: post.topic || [],
    formats: post.format || [],
    countries: post.country || [],
    languages: post.language || [],

    visibility: post.visibility || [],

    status: post.status,
  }
}