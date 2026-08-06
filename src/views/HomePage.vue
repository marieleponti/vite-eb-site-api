<template>
  <div class="website-container">

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <p class="hero-text">{{ $t('home.heroText1') }}</p>
        <p class="hero-text">{{ $t('home.heroText2') }}</p>
        <div class="hero-btn-wrap">
          <router-link to="/resources" class="hero-btn">{{ $t('home.exploreLibrary') }}</router-link>
        </div>
      </div>
      <img src="/wire.png" alt="" class="fence-decoration" aria-hidden="true" />
    </section>

    <!-- "Why" Section -->
    <section class="content-section">
      <h2 class="section-title">{{ $t('home.whyTitle') }}</h2>
      <p class="section-text">{{ $t('home.whyText') }}</p>
    </section>

    <!-- Dashed wave decoration mid-page -->
    <DashedPath />

    <!-- Teal block: wall image on top, text and icons below -->
    <div class="wall-section">
      <img src="/border_wall.png" alt="" class="wall-section-img" ref="wallImgRef" aria-hidden="true" />
      <div class="wall-section-content" :style="{ marginTop: wallContentMargin }">
        <p class="section-text wall-section-text">{{ $t('home.wallSectionText') }}</p>
        <div class="icon-row">
          <img src="/border_icons.png" alt="" class="icon-row-image" />
        </div>
      </div>
    </div>

    <!-- Bullet Section -->
    <div class="bullet-full">
      <p class="bullet-title">{{ $t('home.bulletTitle') }}</p>
      <ul class="bullet-list-gold">
        <li>{{ $t('home.bullet1') }}</li>
        <li>{{ $t('home.bullet2') }}</li>
        <li>{{ $t('home.bullet3') }}</li>
      </ul>
      <p class="bullet-invite">{{ $t('home.bulletInvite') }}</p>
      <div class="center-btn-wrap">
        <router-link to="/resources" class="bullet-btn">{{ $t('home.exploreDatabase') }}</router-link>
      </div>
    </div>

    <!-- Full Width Image -->
    <div class="full-image gold-bg">
      <img src="/traincart.png" :alt="$t('home.trainImageAlt')" />
    </div>

    <!-- Featured Content -->
    <section class="content-section">
      <h2 class="section-title section-title--light">{{ $t('home.featuredTitle') }}</h2>

      <div v-if="loadingFeatured" class="featured-card">
        <div class="featured-skeleton-img"></div>
        <div>
          <div class="featured-skeleton-line" style="width: 70%;"></div>
          <div class="featured-skeleton-line" style="width: 90%;"></div>
        </div>
      </div>

      <div v-else-if="featuredContent.length" class="featured-slider">
        <div
          class="featured-slider-track"
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        >
          <div
            v-for="item in featuredContent"
            :key="`${item.type}-${item.id || item.slug}`"
            class="featured-card featured-slide"
>
            <img :src="item.featuredImage || '/featured.jpg'" :alt="item.title" />
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ trimExcerpt(item.excerpt, 20) }}</p>
              <router-link :to="item.type === 'post' ? `/blog/${item.slug}` : `/resources/${item.slug}`"
                class="featured-link">
                {{ $t('home.readMore') }}
              </router-link>

            </div>
          </div>
        </div>

        <template v-if="featuredContent.length > 1">
          <button class="slider-arrow slider-arrow-prev" @click="prevSlide"
            :aria-label="$t('home.prevSlideAria')">&#8249;</button>
          <button class="slider-arrow slider-arrow-next" @click="nextSlide"
            :aria-label="$t('home.nextSlideAria')">&#8250;</button>
          <div class="slider-dots">
            <button
              v-for="(item, i) in featuredContent"
              :key="`dot-${i}`"
              class="slider-dot"
              :class="{ active: i === currentSlide }"
              :aria-label="$t('home.goToSlideAria', { n: i + 1 })"
              @click="goToSlide(i)"
            ></button>
          </div>
        </template>
      </div>

      <p v-else class="section-text">{{ $t('home.noFeaturedContent') }}</p>
    </section>

  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch, h } from 'vue'
import { useContent } from '@/composables/useContent'

let whyCleanup = null
/* -------------------------------------------------------------------- */
/* Wall section: dynamic margin                                          */
/* -------------------------------------------------------------------- */
const wallImgRef = ref(null)
const wallContentMargin = ref('-780px')

function updateWallMargin() {
  const img = wallImgRef.value
  if (!img) return
  const imgHeight = img.offsetHeight
  if (imgHeight > 0) {
    wallContentMargin.value = `-${imgHeight - 120}px`
  }
}

onMounted(async () => {
  await nextTick()
  updateWallMargin()
  // Also handle case where image loads after mount
  const img = wallImgRef.value
  if (img && !img.complete) {
    img.addEventListener('load', updateWallMargin, { once: true })
  }
  window.addEventListener('resize', updateWallMargin, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWallMargin)
  if (whyCleanup) whyCleanup()
})

/* -------------------------------------------------------------------- */
/* DashedPath                                                            */
/* -------------------------------------------------------------------- */
const DashedPath = {
  setup() {
    const wrapRef = ref(null)
    const progress = ref(0)
    const points = []
    const segments = 12
    for (let i = 0; i <= segments; i++) {
      points.push([(1200 / segments) * i, 30 + Math.sin(i * 1.3) * 14])
    }
    const smoothProgress = ref(0)
    let rafSmooth = null

    function positionAt(t) {
      const START_FRAC = 0.30
      const END_FRAC = 0.48
      const effectiveT = START_FRAC + t * (END_FRAC - START_FRAC)
      const totalLen = points.length - 1
      const pos = effectiveT * totalLen
      const idx = Math.min(Math.floor(pos), totalLen - 1)
      const localT = pos - idx
      const [x1, y1] = points[idx]
      const [x2, y2] = points[Math.min(idx + 1, totalLen)]
      return { x: x1 + (x2 - x1) * localT, y: (y1 + (y2 - y1) * localT) - 12 }
    }

    function updateProgress() {
      const el = wrapRef.value
      if (!el) return
      const scrollTop = document.documentElement.scrollTop
      const vh = document.documentElement.clientHeight
      const rect = el.getBoundingClientRect()
      const sectionDocTop = rect.top + scrollTop
      const total = vh + rect.height
      const traveled = scrollTop + vh - sectionDocTop
      progress.value = Math.min(1, Math.max(0, total > 0 ? traveled / total : 0))
    }

    function smoothStep() {
      const diff = progress.value - smoothProgress.value
      if (Math.abs(diff) > 0.0005) {
        smoothProgress.value += diff * 0.04
      } else {
        smoothProgress.value = progress.value
      }
      rafSmooth = requestAnimationFrame(smoothStep)
    }

    function onScroll() { requestAnimationFrame(updateProgress) }

    onMounted(() => {
      updateProgress()
      rafSmooth = requestAnimationFrame(smoothStep)
      document.addEventListener('scroll', onScroll, { passive: true })
    })

    onUnmounted(() => {
      if (rafSmooth) cancelAnimationFrame(rafSmooth)
      document.removeEventListener('scroll', onScroll)
    })

    return () => {
      const { x, y } = positionAt(smoothProgress.value)
      return h('div', {
        ref: wrapRef,
        style: { backgroundColor: '#2b3f47', lineHeight: '0', position: 'relative', width: '100vw', marginLeft: 'calc(50% - 50vw)', paddingBottom: '24px' }
      }, [
        h('img', { src: '/terrain_yellow.png', alt: '', 'aria-hidden': 'true', style: { width: '100%', height: '52px', display: 'block', objectFit: 'fill' } }),
        h('img', { src: '/isotype_loop.gif', alt: '', 'aria-hidden': 'true', style: { position: 'absolute', width: '65px', height: '65px', transform: 'translate(-50%, -50%)', pointerEvents: 'none', left: `${(x / 1200) * 100}%`, top: `${(y / 52) * 100}%` } }),
      ])
    }
  },
}

/* -------------------------------------------------------------------- */
/* Featured Content                                                      */
/* -------------------------------------------------------------------- */
const { items: featuredPosts, fetch: fetchFeaturedPosts, loading: loadingPosts } = useContent()
const { items: featuredResources, fetch: fetchFeaturedResources, loading: loadingResources } = useContent()
const loadingFeatured = computed(() => loadingPosts.value || loadingResources.value)
const FEATURED_LIMIT = 6

const featuredContent = computed(() => {
  const posts = featuredPosts.value.map(item => normalizeFeaturedItem(item, 'post'))
  const resources = featuredResources.value.map(item => normalizeFeaturedItem(item, 'resource'))
  return [...posts, ...resources].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, FEATURED_LIMIT)
})

const currentSlide = ref(0)
function nextSlide() { if (!featuredContent.value.length) return; currentSlide.value = (currentSlide.value + 1) % featuredContent.value.length }
function prevSlide() { if (!featuredContent.value.length) return; currentSlide.value = (currentSlide.value - 1 + featuredContent.value.length) % featuredContent.value.length }
function goToSlide(index) { currentSlide.value = index }
watch(featuredContent, () => { currentSlide.value = 0 })

function normalizeFeaturedItem(item, type) {
  return {
    type, id: item.id, slug: item.slug,
    title: item.title?.rendered || item.title,
    excerpt: item.excerpt?.rendered || item.excerpt || item.content,
    featuredImage: item.featuredImage || item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    permalink: item.permalink || item.link,
    date: item.date
  }
}

function trimExcerpt(text, wordLimit) {
  if (!text) return ''
  const stripped = text.replace(/<[^>]*>/g, '').trim()
  const words = stripped.split(/\s+/)
  return words.length <= wordLimit ? stripped : words.slice(0, wordLimit).join(' ') + '...'
}

onMounted(() => {
  fetchFeaturedPosts({ type: 'posts', page: 1, perPage: FEATURED_LIMIT, filters: { s: '', 'special-content': 'featured' } })
  fetchFeaturedResources({ type: 'resources', page: 1, perPage: FEATURED_LIMIT, filters: { s: '', 'special-content': 'featured' } })
})
</script>

<style scoped>
/* -------------------------------------------------------------------- */
/* Tokens                                                                */
/* -------------------------------------------------------------------- */
.website-container {
  --color-teal: #2b3f47;
  --color-teal-deep: #1f2e35;
  --color-gold: #f5c670;
  --color-orange-light: #f5c670;
  --color-orange-deep: #f38a4e;
  --color-body-on-dark: #FFFFFF;
  --font-display: 'Cormorant', Georgia, 'Times New Roman', serif;
  --font-sans: 'Work Sans', Helvetica, Arial, Lucida, sans-serif;
  min-height: 100vh;
  background-color: var(--color-teal);
  color: #F5F5F5;
  font-family: var(--font-sans);
  overflow-x: hidden;
}

* { box-sizing: border-box; }

/* -------------------------------------------------------------------- */
/* Hero                                                                  */
/* -------------------------------------------------------------------- */
.hero-section {
  background: linear-gradient(180deg, var(--color-orange-light) 0%, var(--color-orange-deep) 100%);
  padding: 70px 40px 90px;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 1100px;
  margin: 0;
  padding-left: 80px;
  position: relative;
  z-index: 1;
}

.hero-text {
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 300;
  line-height: 1.8em;
  color: #000000;
  margin-bottom: 20px;
}

.hero-btn-wrap {
  text-align: center;
  margin-top: 50px;
  position: relative;
  z-index: 1;
  padding-right: 80px;
}

.hero-btn {
  display: inline-block;
  text-decoration: none;
  background-color: var(--color-teal);
  color: #FFFFFF;
  border: none;
  padding: 12px 36px;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.hero-btn:hover {
  background-color: var(--color-teal-deep);
}

.fence-decoration {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 45%;
  height: auto;
  pointer-events: none;
}

/* -------------------------------------------------------------------- */
/* Content sections                                                      */
/* -------------------------------------------------------------------- */
.content-section {
  padding: 90px 75px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-section--overlap { padding-top: 60px; }

.section-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 44px;
  color: var(--color-gold);
  margin-bottom: 28px;
  text-align: left;
}

.section-title--light { color: #FFFFFF; }

.section-text {
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 300;
  line-height: 1.6em;
  color: var(--color-body-on-dark);
  text-align: left;
}

/* -------------------------------------------------------------------- */
/* Halftone photo                                                        */
/* -------------------------------------------------------------------- */
/* Wall section now controlled by JS - see wallContentMargin */
.wall-section {
  background-color: var(--color-teal);
  padding-bottom: 28%;
}

.wall-section-img {
  width: 100%;
  display: block;
  margin-bottom: -28%;
}

.wall-section-content {
  background-color: var(--color-teal);
  padding: 60px 75px 80px;
  margin-left: 8%;
  margin-right: 8%;
  position: relative;
  z-index: 1;
}

.wall-section-text {
  margin: 0 auto 50px;
  text-align: left;
}

.halftone-photo { width: 100%; line-height: 0; }
.halftone-photo img { width: 100%; display: block; }

/* -------------------------------------------------------------------- */
/* Icon row                                                              */
/* -------------------------------------------------------------------- */
.icon-row { text-align: center; margin-top: 50px; }
.icon-row-image { max-width: 739px; width: 100%; height: auto; }

/* -------------------------------------------------------------------- */
/* Bullet section — gold background, full width                         */
/* -------------------------------------------------------------------- */
.bullet-full {
  background-color: var(--color-gold);
  width: 100%;
  padding: 500px 220px 60px 220px;
  font-family: var(--font-sans);
}

.bullet-title {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 16px;
  display: block;
}

.bullet-list-gold {
  font-size: 20px;
  font-weight: 300;
  color: #1a1a1a;
  line-height: 1.7em;
  padding-left: 20px;
  margin: 0 0 20px;
}

.bullet-list-gold li { margin-bottom: 8px; }

.bullet-invite {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  line-height: 1.6em;
  margin-bottom: 50px;
}

.bullet-btn {
  display: inline-block;
  text-decoration: none;
  background-color: var(--color-teal);
  color: #FFFFFF;
  border: none;
  padding: 12px 36px;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.bullet-btn:hover {
  background-color: var(--color-teal-deep);
}

/* -------------------------------------------------------------------- */
/* Gold background helper                                               */
/* -------------------------------------------------------------------- */
.gold-bg { background-color: var(--color-gold); }

/* -------------------------------------------------------------------- */
/* Full width image                                                      */
/* -------------------------------------------------------------------- */
.full-image { width: 100%; line-height: 0; }
.full-image img { width: 100%; display: block; }

/* -------------------------------------------------------------------- */
/* Center button wrapper                                                 */
/* -------------------------------------------------------------------- */
.center-btn-wrap { text-align: center; margin-top: 30px; }

/* -------------------------------------------------------------------- */
/* Featured card / slider                                                */
/* -------------------------------------------------------------------- */
.featured-card {
  display: flex;
  align-items: center;
  gap: 50px;
  max-width: 1000px;
  margin: 50px auto 0;
}

.featured-card img { width: 38%; max-width: 340px; object-fit: cover; flex-shrink: 0; height: 260px; }
.featured-card > div { text-align: left; }

.featured-card h3 {
  font-family: var(--font-display);
  font-weight: normal;
  font-size: 30px;
  color: #F5F5F5;
  margin-bottom: 12px;
}

.featured-card p { color: var(--color-body-on-dark); font-size: 14px; margin-bottom: 22px; line-height: 1.7; }

.featured-link {
  display: inline-block;
  text-decoration: none;
  border: 1.5px solid var(--color-gold);
  color: #F5F5F5;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 2px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.featured-link:hover { background-color: var(--color-gold); color: var(--color-teal-deep); }

.featured-slider { position: relative; max-width: 1000px; margin: 0 auto; overflow: hidden; }
.featured-slider-track { display: flex; transition: transform 0.4s ease; }
.featured-slider-track .featured-slide { flex: 0 0 100%; width: 100%; margin: 0; }

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(31, 44, 51, 0.85);
  color: var(--color-gold);
  border: 1px solid var(--color-gold);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  z-index: 2;
}

.slider-arrow:hover { background-color: var(--color-gold); color: var(--color-teal-deep); }
.slider-arrow-prev { left: -8px; }
.slider-arrow-next { right: -8px; }

.slider-dots { display: flex; justify-content: center; gap: 10px; margin-top: 28px; }

.slider-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--color-gold);
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s ease;
}

.slider-dot.active { background-color: var(--color-gold); }

.featured-skeleton-img { width: 42%; max-width: 380px; aspect-ratio: 4 / 3; background: rgba(245, 245, 245, 0.08); }
.featured-skeleton-line { height: 14px; margin: 12px 0; border-radius: 4px; background: rgba(245, 245, 245, 0.08); }

/* -------------------------------------------------------------------- */
/* Responsive                                                            */
/* -------------------------------------------------------------------- */
@media (max-width: 900px) {
  .featured-card { flex-direction: column; align-items: flex-start; }
  .featured-card img { width: 100%; max-width: none; }
}

@media (max-width: 768px) {
  .hero-content { padding-left: 16px; padding-right: 16px; }
  .hero-section { padding: 32px 16px 50px; }
  .content-section { padding: 32px 16px; }
  .section-title { font-size: 28px; }
  .fence-decoration { width: 150px; right: 0; bottom: 0; }

  /* Featured slider: constrain to viewport */
  .featured-slider {
    max-width: 100%;
    overflow: hidden;
    padding: 0;
    margin: 0;
  }
  .featured-slider-track .featured-slide { width: 100%; }
  .featured-card {
    flex-direction: column;
    gap: 16px;
    margin: 16px 0 0;
    max-width: 100%;
    padding: 0 16px;
  }
  .featured-card img {
    width: 100%;
    max-width: 100%;
    height: 160px;
    object-fit: cover;
  }
  .featured-card h3 { font-size: 20px; }

  /* Arrows sit inside the slider, not outside */
  .slider-arrow { width: 32px; height: 32px; font-size: 18px; }
  .slider-arrow-prev { left: 4px; }
  .slider-arrow-next { right: 4px; }

  /* Wall section on mobile */
  .wall-section-content {
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-top: 0 !important;
    padding: 30px 16px 40px;
  }
  .wall-section { padding-bottom: 0; }
  .wall-section-img { margin-bottom: 0; }

  /* Bullet yellow section */
  .bullet-full { padding: 32px 16px; }
}
</style>