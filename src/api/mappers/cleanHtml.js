/**
 * Texto plano, sin ningún tag — para previews/excerpts donde se muestra
 * con interpolación de texto ({{ }}), no con v-html.
 */
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

/**
 * HTML sanitizado — para el cuerpo completo de un post/resource que se
 * renderiza con v-html (BlogSingle.vue, etc.). A diferencia de cleanHtml(),
 * esto SÍ preserva <p>, <a>, <strong>, <figure>/<img>, listas, etc. — lo
 * único que sacamos son los shortcodes de Divi (por si quedó contenido
 * viejo sin procesar) y tags/atributos peligrosos.
 *
 * No hace falta decodificar entidades acá (&amp;, &#8217;, etc.): como
 * esto se inserta vía v-html, el navegador las decodifica solo al
 * parsearlo como HTML — a diferencia del título, que se muestra con
 * interpolación de texto y por eso sí necesita decodeHtmlEntities().
 *
 * OJO — sanitización con regex es básica, no a prueba de todo. Esto sirve
 * porque el contenido viene de WordPress curado por el equipo, no de
 * usuarios anónimos. Si en algún momento esto pasa a aceptar contenido no
 * confiable, cambiá esto por DOMPurify (`npm install dompurify`):
 *
 *   import DOMPurify from 'dompurify'
 *   export function sanitizeContent(html = '') {
 *     return DOMPurify.sanitize(removeDiviShortcodes(html))
 *   }
 */
export function sanitizeContent(html = '') {
  return removeDiviShortcodes(html)
    // Tags peligrosos completos (incluyendo su contenido)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    // Atributos de evento inline (onclick=, onerror=, etc.)
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    // href/src con javascript:
    .replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1='#'")
    .trim()
}

function removeDiviShortcodes(html = '') {
  return html
    .replace(/\[et_pb_[^\]]*\]/gi, '')
    .replace(/\[\/et_pb_[^\]]*\]/gi, '')
}