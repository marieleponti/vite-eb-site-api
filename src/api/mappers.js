function cleanHtml(html = '') {
  return html
    // Remove Divi shortcodes
    .replace(/\[et_pb_[^\]]*\]/gi, '')
    .replace(/\[\/et_pb_[^\]]*\]/gi, '')

    // Remove remaining shortcodes
    .replace(/\[[^\]]+\]/g, '')

    // Remove HTML tags
    .replace(/<[^>]*>/g, '')

    // Decode common entities
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')

    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

export function mapPost(post) {
  return {
    id: post.id,
    slug: post.slug ?? '',

    title:
      post.title?.rendered ??
      post.title ??
      'Untitled',

    permalink:
      post.link ??
      post.permalink ??
      '#',

    excerpt: cleanHtml(
      post.excerpt?.rendered ??
      post.excerpt ??
      ''
    ),

    content: cleanHtml(
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