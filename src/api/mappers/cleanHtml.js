/**
 * Texto plano, sin ningún tag — para previews/excerpts donde se muestra
 * con interpolación de texto ({{ }}), no con v-html.
 */
export function cleanHtml(html = '') {
  return html
    .replace(/\[et_pb_[^\]]*\]/gi, '')
    .replace(/\[\/et_pb_[^\]]*\]/gi, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/\s+/g, ' ')
    .trim()
}

// Dominios permitidos para <iframe src="...">. Ajustar esta lista si
// aparecen nuevos proveedores de embeds (Google Maps, YouTube, Vimeo,
// DocumentCloud son los que se usaban en el sitio legado).
const ALLOWED_IFRAME_HOSTS = [
  'google.com',
  'www.google.com',
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'documentcloud.org',
  'www.documentcloud.org',
  'rbt-map.onrender.com'
]

function isAllowedIframeSrc(src = '') {
  try {
    const url = new URL(src, 'https://placeholder.local') // soporta src protocol-relative ("//...")
    return ALLOWED_IFRAME_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    )
  } catch {
    return false
  }
}

/**
 * Quita <iframe> cuyo src no esté en la whitelist. A los que sí pasan,
 * solo les limpiamos atributos de evento inline (onload=, etc.) por si
 * el HTML viejo trae basura; src/width/height/allow/allowfullscreen/
 * frameborder quedan intactos porque son necesarios para que el embed
 * funcione.
 */
function sanitizeIframes(html = '') {
  return html.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (match) => {
    const srcMatch = match.match(/\ssrc\s*=\s*["']([^"']*)["']/i)
    const src = srcMatch?.[1] ?? ''

    if (!isAllowedIframeSrc(src)) return ''

    return match
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
  })
}

/**
 * HTML sanitizado — para el cuerpo completo de un post/resource que se
 * renderiza con v-html. Preserva <p>, <a>, <strong>, <figure>/<img>,
 * listas, y ahora también <iframe> de orígenes confiables (mapas,
 * video). Sigue sacando shortcodes de Divi, tags/atributos peligrosos.
 *
 * OJO — sanitización con regex es básica, no a prueba de todo. Sirve
 * porque el contenido viene de WordPress curado por el equipo, no de
 * usuarios anónimos. Si en algún momento esto pasa a aceptar contenido
 * no confiable, migrar a DOMPurify (`npm install dompurify`) con una
 * config explícita que permita iframe + la misma whitelist de hosts.
 */
export function sanitizeContent(html = '') {
  return sanitizeIframes(removeDiviShortcodes(html))
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1='#'")
    .trim()
}

function removeDiviShortcodes(html = '') {
  return html
    .replace(/\[et_pb_[^\]]*\]/gi, '')
    .replace(/\[\/et_pb_[^\]]*\]/gi, '')
}