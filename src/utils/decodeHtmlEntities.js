/**
 * WP REST devuelve title.rendered con las entidades HTML ya codificadas
 * (ej. "Foo &amp; Bar" en vez de "Foo & Bar"), porque está pensado para
 * insertarse como HTML. Vue con {{ title }} lo muestra como texto plano
 * sin decodificar, así que sin esto el "&amp;" (o "&quot;", "&#039;", etc.)
 * queda literal en pantalla.
 *
 * Usa un <textarea> para decodificar: cualquier tag real que viniera en
 * el string queda como texto (no se ejecuta ni se inserta como HTML), así
 * que es seguro aunque el título tuviera algo raro.
 */
export function decodeHtmlEntities(str) {
  if (typeof str !== 'string' || !str.includes('&')) return str
  const textarea = document.createElement('textarea')
  textarea.innerHTML = str
  return textarea.value
}