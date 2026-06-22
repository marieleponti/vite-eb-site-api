<!-- src/components/RichContent.vue
  Recibe HTML semántico simple (h2/h3 con id, p, ul/ol, aside.stat-box,
  ol.references) y lo pinta con tipografía propia del sitio. No depende
  de ningún builder/CMS externo: el HTML que entra por la prop `html`
  ya viene limpio (ver src/data/articles/*.html).

  Además genera automáticamente un Índice (Tabla de Contenidos) leyendo
  los <h2>/<h3> que tengan id.

  Uso:
    <RichContent :html="item.content" />
-->
<template>
  <div class="rc-layout">

    <!-- Columna principal -->
    <div ref="contentRef" class="rc-content" v-html="html"></div>

    <!-- Columna lateral: TOC sticky (solo si hay headings con id) -->
    <aside v-if="toc.length" class="rc-toc">
      <div class="rc-toc-sticky">
        <h5 class="rc-toc-title">Table of Contents</h5>
        <nav>
          <ol class="rc-toc-list">
            <li v-for="entry in toc" :key="entry.id">
              <a
                :href="`#${entry.id}`"
                :class="{ active: activeId === entry.id }"
                @click.prevent="scrollTo(entry.id)"
              >
                {{ entry.text }}
              </a>
              <ol v-if="entry.children.length" class="rc-toc-sublist">
                <li v-for="child in entry.children" :key="child.id">
                  <a
                    :href="`#${child.id}`"
                    :class="{ active: activeId === child.id }"
                    @click.prevent="scrollTo(child.id)"
                  >
                    {{ child.text }}
                  </a>
                </li>
              </ol>
            </li>
          </ol>
        </nav>
      </div>
    </aside>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

const props = defineProps({
  html: { type: String, default: '' },
  // Mapa { idDelHeading: nivelDeseado } para corregir jerarquías que
  // vienen mal desde la fuente (WordPress, CMS, lo que sea). Ej:
  // { Containment: 3, Shutdown: 3, Conclusion: 2 }
  headingOverrides: { type: Object, default: () => ({}) },
  // Índice EXPLÍCITO, para artículos donde el TOC real no se puede
  // derivar agrupando por nivel de heading (por ejemplo: el TOC salta
  // secciones, o mezcla niveles h2/h3 sin un patrón consistente).
  // Si se pasa, tiene prioridad total sobre la detección automática.
  // Formato: [{ id: 'SecurityForces', children: [] }, { id: 'DH', children: [{ id: 'ACA' }, ...] }]
  // El texto de cada item se toma del heading real en el DOM (por su
  // id), salvo que se pase `label` explícito en la entrada.
  tocStructure: { type: Array, default: () => [] }
})

const contentRef = ref(null)
const toc = ref([])
const activeId = ref(null)

let observer = null

function applyHeadingOverrides() {
  if (!contentRef.value) return
  Object.entries(props.headingOverrides).forEach(([id, level]) => {
    const el = contentRef.value.querySelector(`#${id}`)
    if (!el) return
    const currentLevel = Number(el.tagName.replace('H', ''))
    if (currentLevel === level) return
    // No se puede cambiar el tagName de un elemento existente:
    // creamos uno nuevo del tag correcto y lo reemplazamos.
    const replacement = document.createElement(`h${level}`)
    replacement.id = el.id
    replacement.innerHTML = el.innerHTML
    el.replaceWith(replacement)
  })
}

function resolveLabel(id, fallback) {
  const el = contentRef.value?.querySelector(`#${id}`)
  return fallback || el?.textContent.trim() || id
}

function buildTocFromStructure(structure) {
  return structure.map(entry => ({
    id: entry.id,
    text: resolveLabel(entry.id, entry.label),
    level: 2,
    children: (entry.children || []).map(child => ({
      id: child.id,
      text: resolveLabel(child.id, child.label),
      level: 3,
      children: []
    }))
  }))
}

function buildTocAuto() {
  const headings = contentRef.value.querySelectorAll('h2[id], h3[id]')

  const result = []
  let currentParent = null

  headings.forEach(h => {
    if (h.id === 'References') return // la sección de Referencias no entra al índice

    const level = Number(h.tagName.replace('H', ''))
    const entry = { id: h.id, text: h.textContent.trim(), level, children: [] }

    if (level === 2) {
      currentParent = entry
      result.push(entry)
    } else if (currentParent) {
      currentParent.children.push(entry)
    } else {
      result.push(entry) // h3 huérfano (sin h2 anterior): lo dejamos de primer nivel
    }
  })

  return result
}

function buildToc() {
  if (!contentRef.value) return
  toc.value = props.tocStructure.length
    ? buildTocFromStructure(props.tocStructure)
    : buildTocAuto()
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.scrollBy(0, -90)
}

function setupScrollSpy() {
  if (!contentRef.value || !toc.value.length) return
  const flat = toc.value.flatMap(entry => [entry, ...entry.children])
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activeId.value = entry.target.id
      })
    },
    { rootMargin: '-30% 0px -60% 0px' }
  )
  flat.forEach(entry => {
    const el = document.getElementById(entry.id)
    if (el) observer.observe(el)
  })
}

// Click en una nota al pie (<a class="footnote-ref">) hace scroll a la
// referencia correspondiente en vez de navegar.
function handleContentClick(e) {
  const link = e.target.closest('a.footnote-ref')
  if (!link) return
  const href = link.getAttribute('href')
  if (!href?.startsWith('#')) return
  e.preventDefault()
  const target = document.querySelector(href)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.classList.add('highlight')
    setTimeout(() => target.classList.remove('highlight'), 1500)
  }
}

onMounted(async () => {
  await nextTick()
  applyHeadingOverrides()
  buildToc()
  setupScrollSpy()
  contentRef.value?.addEventListener('click', handleContentClick)
})

watch(() => props.html, async () => {
  if (observer) observer.disconnect()
  await nextTick()
  applyHeadingOverrides()
  buildToc()
  setupScrollSpy()
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  contentRef.value?.removeEventListener('click', handleContentClick)
})
</script>

<style scoped>
.rc-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  align-items: start;
}

@media (min-width: 960px) {
  .rc-layout {
    grid-template-columns: 3fr 2fr;
  }
}

/* ---------- TOC lateral ---------- */
.rc-toc-sticky {
  position: sticky;
  top: 96px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
}

.rc-toc-title {
  font-family: "Staatliches", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.rc-toc-list,
.rc-toc-sublist {
  list-style: none;
  margin: 0;
  padding: 0;
  counter-reset: toc;
}

.rc-toc-sublist {
  margin: 0.4rem 0 0.6rem 1.1rem;
  font-size: 0.9rem;
}

.rc-toc-list > li,
.rc-toc-sublist > li {
  counter-increment: toc;
  margin-bottom: 0.5rem;
}

.rc-toc-list > li::before,
.rc-toc-sublist > li::before {
  content: counters(toc, ".") ". ";
  color: #002d62;
  font-weight: 700;
}

.rc-toc-list a {
  color: #374151;
  text-decoration: none;
  line-height: 1.4;
}

.rc-toc-list a:hover,
.rc-toc-list a.active {
  color: #002d62;
  text-decoration: underline;
  font-weight: 700;
}

/* ---------- Tipografía del cuerpo (HTML semántico propio) ---------- */
.rc-content :deep(h2),
.rc-content :deep(h3),
.rc-content :deep(h4) {
  font-family: "Staatliches", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #002d62;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  scroll-margin-top: 100px;
}

.rc-content :deep(h2) { font-size: 1.6rem; }
.rc-content :deep(h3) { font-size: 1.3rem; }
.rc-content :deep(h4) { font-size: 1.1rem; }

.rc-content :deep(p) {
  line-height: 1.8;
  color: #2b2b2b;
  margin-bottom: 1.1rem;
}

.rc-content :deep(a) {
  color: #0a4fa3;
  text-decoration: underline;
}

.rc-content :deep(a.footnote-ref) {
  font-size: 0.8rem;
  vertical-align: super;
  text-decoration: none;
  color: #002d62;
  font-weight: 700;
}

.rc-content :deep(ul),
.rc-content :deep(ol) {
  margin: 1rem 0 1.25rem 1.25rem;
  line-height: 1.7;
}

/* Pull-quotes: párrafos enteramente <strong><i>"..."</i></strong> */
.rc-content :deep(p > strong:only-child > i:only-child),
.rc-content :deep(p > i:only-child > strong:only-child) {
  display: block;
  font-size: 1.15rem;
  font-style: italic;
  color: #002d62;
  border-left: 4px solid #002d62;
  padding-left: 1rem;
}

.rc-content :deep(figure) {
  margin: 1.5rem 0;
}

.rc-content :deep(figure img) {
  width: 100%;
  border-radius: 6px;
  display: block;
}

.rc-content :deep(figcaption) {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.4rem;
}

/* Bloque de estadísticas destacado */
.rc-content :deep(aside.stat-box) {
  border: 1px solid #d1e7dd;
  background: #f5fbf7;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.rc-content :deep(aside.stat-box h5) {
  text-align: center;
  margin-bottom: 0.75rem;
}

/* Sección de Referencias */
.rc-content :deep(ol.references) {
  font-size: 0.85rem;
  color: #555;
  counter-reset: ref-counter;
  list-style: none;
  margin-left: 0;
}

.rc-content :deep(ol.references li) {
  counter-increment: ref-counter;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
  scroll-margin-top: 100px;
  transition: background-color 0.3s;
}

.rc-content :deep(ol.references li::before) {
  content: counter(ref-counter) ".";
  position: absolute;
  left: 0;
  font-weight: 700;
  color: #002d62;
}

.rc-content :deep(ol.references li.highlight) {
  background-color: #fff3cd;
}
</style>