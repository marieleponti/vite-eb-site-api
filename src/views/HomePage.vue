<template>
  <div class="website-container">

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <p class="hero-text">
          Welcome to the Everywhere Border info repository. This is a living resource that makes visible the harms of US-driven border externalization, and how tech infrastructures are implemented and used in migration control systems, militarization, and policing in the Americas. Our goal is to support and strengthen transnational collaboration and advocacy to combat the role of technology in migration deterrence as a method of control, consolidation of power, structural violence, and impunity.
        </p>
        <p class="hero-text">
          This info repository supports and reflects collaboration across borders. It contains original research, documentation, and analysis on border externalization policies and practices of multiple countries in the region, and the ever-growing tech and data infrastructure that support them, often made of opaque and inaccessible systems. Resources draw from the work of civil society organizations, academic research, financial investigation, and public records requests. The info repository is a collective work in progress—we welcome contributions from activists, researchers, and civil society organizations.
        </p>
      </div>
      <img src="/wire.png" alt="" class="fence-decoration" aria-hidden="true" />
    </section>

    <!-- "Why" Section -->
    <section class="content-section">
      <h2 class="section-title">Why the Everywhere Border?</h2>
      <p class="section-text">
        The border is not a fixed territorial boundary. It is an all-encompassing system of ideas, policies, practices, and infrastructures that reach deep into the interior of origin and transit countries through externalization processes, with the goal of controlling the movement of the majority of humans, reserving free movement to reach territorial frontiers and cross political boundaries for a select few. The US has been a key actor in advancing this vision and practice, which has a tremendous impact on targeted countries, facilitating and increasing militarization, state violence, and corporate power.
      </p>
    </section>

    <!-- Dashed wave decoration mid-page -->
    <DashedPath />

    <!-- Halftone wall + fence photo -->
    <div class="halftone-photo">
      <img src="/border_wall.png" alt="" />
    </div>

    <!-- Border Explanation Section -->
    <section class="content-section content-section--overlap">
      <p class="section-text">
        The bordering regime of the United States both drives and reflects a global trend. Wealthy nations, development finance institutions, and massive technology firms are feverishly investing in border policing regimes that entrench and reinforce structural violence and inequality. These same powerful interests derive much of their economic wealth and political clout through extractive and repressive practices, historically and in the present day. Despite playing a central role in fueling forced migration—including being responsible for the vast majority of emissions driving the climate crisis—these actors are constructing and expanding barriers to access national territories. By peddling securitization and militarization as solutions to societal inequalities, they disregard human rights, and undermine existing legal regimes.
      </p>
      <div class="icon-row">
        <img src="/border_icons.png" alt="" class="icon-row-image" />
      </div>
    </section>

    <!-- Bullet Section — full width, gold background, before train image -->
    <div class="bullet-full">
      <p class="bullet-title">This is &ldquo;The Everywhere Border&rdquo;:</p>
      <ul class="bullet-list-gold">
        <li>It enables the policing of people wherever they are, based on race, nationality, ethnicity, class, gender, and other social markers.</li>
        <li>It relies on public narratives, laws, and politics to reinforce hierarchies of belonging, thereby allowing governments to more easily limit people&rsquo;s freedom of movement, ability to stay, and to live freely.</li>
        <li>It plays a fundamental role in disrupting the social fabric of origin, transit, and destination countries, making communities surveilled, policed and unsafe.</li>
      </ul>
      <p class="bullet-invite">
        We invite you to explore the resources available here, leverage them in your work, and share information with others.
      </p>
      <div class="center-btn-wrap">
        <button class="bullet-btn">EXPLORE THE DATABASE</button>
      </div>
    </div>

    <!-- Full Width Image — gold background continues -->
    <div class="full-image gold-bg">
      <img src="/traincart.png" alt="People riding a freight train" />
    </div>

    <!-- Featured Content -->
    <section class="content-section">
      <h2 class="section-title section-title--light">Featured Content</h2>

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
              <a :href="item.permalink" target="_blank" rel="noopener noreferrer" class="featured-link">
                Read More
              </a>
            </div>
          </div>
        </div>

        <template v-if="featuredContent.length > 1">
          <button class="slider-arrow slider-arrow-prev" @click="prevSlide" aria-label="Previous featured item">&#8249;</button>
          <button class="slider-arrow slider-arrow-next" @click="nextSlide" aria-label="Next featured item">&#8250;</button>
          <div class="slider-dots">
            <button
              v-for="(item, i) in featuredContent"
              :key="`dot-${i}`"
              class="slider-dot"
              :class="{ active: i === currentSlide }"
              :aria-label="`Go to slide ${i + 1}`"
              @click="goToSlide(i)"
            ></button>
          </div>
        </template>
      </div>

      <p v-else class="section-text">No featured content available right now.</p>
    </section>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, h } from 'vue'
import { useContent } from '@/composables/useContent'

let whyCleanup = null
onMounted(() => {})
onUnmounted(() => { if (whyCleanup) whyCleanup() })

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
  padding: 60px 160px 60px 160px;
  font-family: var(--font-sans);
}

.bullet-title {
  font-size: 20px;
  font-weight: 700;
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
  font-weight: 700;
  color: #000000;
  line-height: 1.6em;
  margin-bottom: 30px;
}

.bullet-btn {
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

.featured-card img { width: 42%; max-width: 380px; object-fit: cover; flex-shrink: 0; }
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
  .hero-content { padding-left: 40px; padding-right: 40px; }
  .hero-section, .content-section { padding: 50px 20px; }
  .section-title { font-size: 28px; }
  .fence-decoration { width: 220px; height: 220px; right: -30px; }
  .bullet-full { padding: 40px 20px; }
}
</style>