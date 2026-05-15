export function cleanHtml(html = '') {
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