<!-- src/components/RichContent.vue
  Recibe HTML semántico simple (h2/h3 con id, p, ul/ol, aside.stat-box,
  ol.references) y lo pinta con tipografía propia del sitio.

  Genera automáticamente un Índice (TOC):
    - Desktop (≥960px): columna lateral sticky.
    - Mobile (<960px): botón flotante (FAB) que abre un drawer con el
      mismo índice.

  Post-procesa el HTML ya renderizado para:
    - Marcar como "externos" los links que apuntan fuera del sitio
      (target=_blank + ícono ↗).
    - Agregar backlinks (↩) en la lista de Referencias, que devuelven
      al punto exacto del texto donde se citó cada nota.

  Uso:
    <RichContent :html="item.content" />
-->
<template>
  <div class="rc-layout">

    <!-- Columna principal -->
    <div ref="contentRef" class="rc-content" v-html="html"></div>

    <!-- ---------- TOC desktop: columna lateral sticky ---------- -->
    <aside v-if="toc.length" class="rc-toc">
      <div class="rc-toc-sticky">
        <h5 class="rc-toc-title">Table of Contents</h5>
        <nav>
          <ol class="rc-toc-list">
            <li v-for="entry in toc" :key="entry.id">
              <a
                :href="`#${entry.id}`"
                :class="{ active: activeId === entry.id, 'active-parent': isActiveParent(entry) }"
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

    <!-- ---------- TOC mobile: FAB + drawer ---------- -->
    <template v-if="toc.length">
      <button
        class="rc-toc-fab"
        type="button"
        :aria-expanded="drawerOpen"
        aria-controls="rc-toc-drawer"
        @click="drawerOpen = true"
      >
        <span class="rc-toc-fab-icon" aria-hidden="true">☰</span>
        <span class="rc-toc-fab-label">Contents</span>
      </button>

      <Transition name="rc-drawer-fade">
        <div v-if="drawerOpen" class="rc-toc-overlay" @click="drawerOpen = false"></div>
      </Transition>

      <Transition name="rc-drawer-slide">
        <div v-if="drawerOpen" id="rc-toc-drawer" class="rc-toc-drawer" role="dialog" aria-label="Table of contents">
          <div class="rc-toc-drawer-header">
            <h5 class="rc-toc-title">Table of Contents</h5>
            <button class="rc-toc-drawer-close" type="button" aria-label="Close" @click="drawerOpen = false">✕</button>
          </div>
          <nav>
            <ol class="rc-toc-list">
              <li v-for="entry in toc" :key="entry.id">
                <a
                  :href="`#${entry.id}`"
                  :class="{ active: activeId === entry.id, 'active-parent': isActiveParent(entry) }"
                  @click.prevent="scrollToAndCloseDrawer(entry.id)"
                >
                  {{ entry.text }}
                </a>
                <ol v-if="entry.children.length" class="rc-toc-sublist">
                  <li v-for="child in entry.children" :key="child.id">
                    <a
                      :href="`#${child.id}`"
                      :class="{ active: activeId === child.id }"
                      @click.prevent="scrollToAndCloseDrawer(child.id)"
                    >
                      {{ child.text }}
                    </a>
                  </li>
                </ol>
              </li>
            </ol>
          </nav>
        </div>
      </Transition>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

const props = defineProps({
  html: { type: String, default: '' },
  headingOverrides: { type: Object, default: () => ({}) },
  tocStructure: { type: Array, default: () => [] }
})

const contentRef = ref(null)
const toc = ref([])
const activeId = ref(null)
const drawerOpen = ref(false) // NUEVO: estado del drawer mobile

let observer = null

/* ---------------------------------------------------------------- */
/* Jerarquía / construcción del TOC (sin cambios de lógica)          */
/* ---------------------------------------------------------------- */

function applyHeadingOverrides() {
  if (!contentRef.value) return
  Object.entries(props.headingOverrides).forEach(([id, level]) => {
    const el = contentRef.value.querySelector(`#${id}`)
    if (!el) return
    const currentLevel = Number(el.tagName.replace('H', ''))
    if (currentLevel === level) return
    const replacement = document.createElement(`h${level}`)
    replacement.id = el.id
    replacement.innerHTML = el.innerHTML
    el.replaceWith(replacement)
  })
}

function resolveLabel(id, fallback) {
  return fallback || contentRef.value?.querySelector(`#${id}`)?.textContent.trim() || id
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
    if (h.id === 'References') return

    const level = Number(h.tagName.replace('H', ''))
    const entry = { id: h.id, text: h.textContent.trim(), level, children: [] }

    if (level === 2) {
      currentParent = entry
      result.push(entry)
    } else if (currentParent) {
      currentParent.children.push(entry)
    } else {
      result.push(entry)
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

/* ---------------------------------------------------------------- */
/* Navegación                                                        */
/* ---------------------------------------------------------------- */

// FIX: antes se hacía scrollIntoView() + window.scrollBy(-90), lo cual
// generaba doble offset (los headings ya tienen scroll-margin-top en CSS).
// Ahora scrollIntoView es la única fuente de verdad para el offset.
function scrollTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// NUEVO: usado desde el drawer mobile, cierra el panel al navegar
function scrollToAndCloseDrawer(id) {
  drawerOpen.value = false
  // esperamos a que el drawer se cierre (evita saltos por el overlay)
  nextTick(() => setTimeout(() => scrollTo(id), 50))
}

// NUEVO: resalta el padre (h2) en el TOC cuando el activo es uno de sus hijos
function isActiveParent(entry) {
  return entry.children.some(child => child.id === activeId.value)
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

/* ---------------------------------------------------------------- */
/* Notas al pie: click en <a class="footnote-ref"> hace scroll        */
/* ---------------------------------------------------------------- */

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

/* ---------------------------------------------------------------- */
/* NUEVO: links externos → target=_blank + ícono ↗                   */
/* ---------------------------------------------------------------- */

function setupExternalLinks() {
  if (!contentRef.value) return
  const links = contentRef.value.querySelectorAll('a:not(.footnote-ref)')

  links.forEach(link => {
    const href = link.getAttribute('href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return

    let url
    try {
      url = new URL(href, window.location.origin)
    } catch {
      return
    }

    const isExternal = url.hostname && url.hostname !== window.location.hostname
    if (!isExternal) return

    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
    link.classList.add('rc-external-link')

    if (!link.querySelector('.rc-external-icon')) {
      const icon = document.createElement('span')
      icon.className = 'rc-external-icon'
      icon.setAttribute('aria-hidden', 'true')
      icon.textContent = '↗'
      link.appendChild(icon)
    }
  })
}

/* ---------------------------------------------------------------- */
/* NUEVO: backlinks (↩) en la lista de Referencias                   */
/* ---------------------------------------------------------------- */

function setupFootnoteBacklinks() {
  if (!contentRef.value) return

  // Le damos un id único a cada <a class="footnote-ref"> del cuerpo
  // (puede haber más de una cita apuntando a la misma referencia),
  // y agrupamos esos ids por el ref al que apuntan.
  const sourcesByRef = {}
  const footnoteLinks = contentRef.value.querySelectorAll('a.footnote-ref[href^="#"]')

  footnoteLinks.forEach((link, i) => {
    const targetId = link.getAttribute('href').slice(1)
    const sourceId = `${targetId}-src-${i}`
    link.id = sourceId
    ;(sourcesByRef[targetId] ||= []).push(sourceId)
  })

  const refItems = contentRef.value.querySelectorAll('ol.references li[id]')
  refItems.forEach(li => {
    // evita duplicar backlinks si el HTML se vuelve a renderizar
    li.querySelectorAll('.rc-backlink').forEach(b => b.remove())

    const sources = sourcesByRef[li.id]
    if (!sources?.length) return

    sources.forEach((srcId, idx) => {
      const backlink = document.createElement('a')
      backlink.href = `#${srcId}`
      backlink.className = 'rc-backlink'
      backlink.setAttribute('aria-label', 'Back to citation in text')
      backlink.textContent = sources.length > 1 ? `↩${idx + 1}` : '↩'
      backlink.addEventListener('click', (e) => {
        e.preventDefault()
        const target = document.getElementById(srcId)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' })
          target.classList.add('highlight')
          setTimeout(() => target.classList.remove('highlight'), 1500)
        }
      })
      li.append(' ', backlink)
    })
  })
}

/* ---------------------------------------------------------------- */
/* Lifecycle                                                         */
/* ---------------------------------------------------------------- */

async function setupAll() {
  await nextTick()
  applyHeadingOverrides()
  buildToc()
  setupScrollSpy()
  setupExternalLinks()
  setupFootnoteBacklinks()
}

onMounted(async () => {
  await setupAll()
  contentRef.value?.addEventListener('click', handleContentClick)
  window.addEventListener('keydown', handleEscape)
})

watch(() => props.html, async () => {
  if (observer) observer.disconnect()
  drawerOpen.value = false
  await setupAll()
})

function handleEscape(e) {
  if (e.key === 'Escape') drawerOpen.value = false
}

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  contentRef.value?.removeEventListener('click', handleContentClick)
  window.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.rc-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  /* FIX: NO usar align-items:start acá. Con "start" la celda del TOC
     no se estira a la altura de la fila (que define la columna de
     artículo, mucho más alta), y position:sticky necesita esa altura
     extra en su contenedor para poder desplazarse mientras scrolleás.
     Con "stretch" (default) la celda del TOC ocupa todo el alto del
     artículo y el sticky interno sí puede "flotar" mientras bajás. */
  align-items: stretch;
  position: relative;
}

@media (min-width: 960px) {
  .rc-layout {
    grid-template-columns: 3fr 2fr;
  }
}

/* ================= TOC desktop ================= */

.rc-toc {
  display: none;
}

@media (min-width: 960px) {
  .rc-toc {
    display: block;
    /* FIX: la celda del grid ya se estira (align-items:stretch en
       .rc-layout), pero el propio <aside> también necesita heredar
       ese 100% de alto para que .rc-toc-sticky tenga contenedor con
       espacio de sobra y pueda mantenerse fijo al scrollear. */
    height: 100%;
  }
}

.rc-toc-sticky {
  position: sticky;
  top: 96px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  /* FIX: evita que un índice muy largo se corte fuera de la pantalla */
  max-height: calc(100vh - 130px);
  overflow-y: auto;
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
  transition: color 0.15s;
}

.rc-toc-list a:hover,
.rc-toc-list a.active {
  color: #002d62;
  text-decoration: underline;
  font-weight: 700;
}

/* NUEVO: el h2 padre se resalta (sin subrayar) cuando el activo es un hijo suyo */
.rc-toc-list a.active-parent {
  color: #002d62;
  font-weight: 700;
}

/* ================= TOC mobile: FAB ================= */

.rc-toc-fab {
  display: none;
}

@media (max-width: 959.98px) {
  .rc-toc-fab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: fixed;
    right: 1rem;
    bottom: 1.25rem;
    z-index: 40;
    background: #002d62;
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 0.75rem 1.1rem;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.3px;
    box-shadow: 0 4px 14px rgba(0, 45, 98, 0.35);
    cursor: pointer;
  }

  .rc-toc-fab-icon {
    font-size: 1rem;
    line-height: 1;
  }
}

/* ================= TOC mobile: overlay + drawer ================= */

.rc-toc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 50;
}

.rc-toc-drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 75vh;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.2);
  z-index: 51;
  padding: 1rem 1.25rem 1.5rem;
  overflow-y: auto;
}

.rc-toc-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  position: sticky;
  top: 0;
  background: #fff;
}

.rc-toc-drawer-close {
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 0.9rem;
  cursor: pointer;
  color: #374151;
}

.rc-drawer-fade-enter-active,
.rc-drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}
.rc-drawer-fade-enter-from,
.rc-drawer-fade-leave-to {
  opacity: 0;
}

.rc-drawer-slide-enter-active,
.rc-drawer-slide-leave-active {
  transition: transform 0.25s ease;
}
.rc-drawer-slide-enter-from,
.rc-drawer-slide-leave-to {
  transform: translateY(100%);
}

/* ================= Tipografía del cuerpo ================= */

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

/* ================= Links: más claros ================= */

.rc-content :deep(a) {
  color: #0a4fa3;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.rc-content :deep(a:hover) {
  color: #002d62;
}

/* NUEVO: links externos con ícono ↗ */
.rc-content :deep(a.rc-external-link) {
  display: inline;
}

.rc-content :deep(.rc-external-icon) {
  font-size: 0.75em;
  margin-left: 0.15em;
  display: inline-block;
}

.rc-content :deep(a.footnote-ref) {
  font-size: 0.8rem;
  vertical-align: super;
  text-decoration: none;
  color: #002d62;
  font-weight: 700;
  scroll-margin-top: 100px;
}

/* NUEVO: backlink en la lista de referencias */
.rc-content :deep(a.rc-backlink) {
  font-size: 0.8rem;
  text-decoration: none;
  color: #0a4fa3;
  font-weight: 700;
  margin-left: 0.25rem;
}

.rc-content :deep(a.rc-backlink:hover) {
  text-decoration: underline;
}

.rc-content :deep(ul),
.rc-content :deep(ol) {
  margin: 1rem 0 1.25rem 1.25rem;
  line-height: 1.7;
}

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

/* Generalizado: aplica tanto a ol.references li.highlight como a
   cualquier <a class="footnote-ref"> resaltado al volver desde un backlink */
.rc-content :deep(.highlight) {
  background-color: #fff3cd;
  transition: background-color 0.3s;
}
</style>