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
        <button class="join-btn">JOIN THE COMMUNITY</button>
      </div>
      <div class="fence-decoration"></div>
    </section>

    <!-- Content Section -->
    <section class="content-section">
      <h2 class="section-title">Why the Everywhere Border?</h2>
      <p class="section-text">
        The border is not a fixed territorial boundary. It is an all-encompassing system of ideas, policies, practices, and infrastructures that reach deep into the interior of origin and transit countries through externalization processes, with the goal of controlling the movement of the majority of humans, reserving free movement to reach territorial frontiers and cross political boundaries for a select few. The US has been a key actor in advancing this vision and practice, which has a tremendous impact on targeted countries, facilitating and increasing militarization, state violence, and corporate power.
      </p>
    </section>

    <!-- Border Explanation Section -->
<section class="content-section">
  <p class="section-text">
        The bordering regime of the United States both drives and reflects a global trend. Wealthy nations, development finance institutions, and massive technology firms are feverishly investing in border policing regimes that entrench and reinforce structural violence and inequality. These same powerful interests derive much of their economic wealth and political clout through extractive and repressive practices, historically and in the present day. Despite playing a central role in fueling forced migration—including being responsible for the vast majority of emissions driving the climate crisis—these actors are constructing and expanding barriers to access national territories. By peddling securitization and militarization as solutions to societal inequalities, they disregard human rights, and undermine existing legal regimes.
  </p>
</section>

<!-- Icons Image -->
<div class="image-center">
  <img src="/border_icons.png" alt="Icons" />
</div>

<!-- Bullet Section -->
<section class="content-section">
  <p class="section-text">This is “The Everywhere Border”:</p>

  <ul class="bullet-list">
    <li>It enables the policing of people wherever they are, based on race, nationality, ethnicity, class, gender, and other social markers.</li>
    <li>It relies on public narratives, laws, and politics to reinforce hierarchies of belonging,  thereby allowing governments to more easily limit people’s freedom of movement, ability to stay, and to live freely.</li>
    <li>It plays a fundamental role in disrupting the social fabric of origin, transit, and destination countries, making communities surveilled, policed and unsafe.</li>
  </ul>
  <p class="section-text">We invite you to explore the resources available here, leverage them in your work, and share information with others.

</p>

  <button class="join-btn">Explore the Database</button>
</section>

<!-- Full Width Image -->
<div class="full-image">
  <img src="/traincart.png" alt="Train" />
</div>

<!-- Featured Content -->
<section class="content-section">
  <h2 class="section-title">Featured Content</h2>

  <!-- Skeleton mientras cargan posts/resources featured -->
  <div v-if="loadingFeatured" class="featured-card">
    <div class="featured-skeleton-img"></div>
    <div>
      <div class="featured-skeleton-line" style="width: 70%;"></div>
      <div class="featured-skeleton-line" style="width: 90%;"></div>
    </div>
  </div>

  <!-- Slider: posts y resources marcados como featured -->
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
          <a :href="item.permalink" target="_blank" rel="noopener noreferrer" class="join-btn featured-link">
            Read More
          </a>
        </div>
      </div>
    </div>

    <!-- Flechas (solo si hay más de una tarjeta) -->
    <template v-if="featuredContent.length > 1">
      <button class="slider-arrow slider-arrow-prev" @click="prevSlide" aria-label="Previous featured item">
        &#8249;
      </button>
      <button class="slider-arrow slider-arrow-next" @click="nextSlide" aria-label="Next featured item">
        &#8250;
      </button>

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

  <!-- Estado vacío: ningún post/resource marcado como featured -->
  <p v-else class="section-text">No featured content available right now.</p>
</section>

    <!-- Another Dashed Line -->
    <div class="dashed-line-decoration"></div>

    <!-- Footer with Patterns -->
    <footer class="footer">
      <div class="pattern-section">
        <div class="halftone-pattern"></div>
        <div class="vertical-bars"></div>
      </div>
      
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useContent } from '@/composables/useContent'

// "Featured Content" ya no es una tarjeta hardcodeada: trae los posts
// del blog Y los resources que estén marcados como featured en WP
// (mismo filtro 'special-content': 'featured' que usa ResearchSection.vue
// para los minibriefs), y los combina en una sola lista, mostrada en
// un slider.
//
// useContent() arma un store local nuevo cada vez que se llama, así que
// usamos dos instancias independientes -- una por tipo de contenido --
// y las combinamos en el computed `featuredContent`.

const {
  items: featuredPosts,
  fetch: fetchFeaturedPosts,
  loading: loadingPosts
} = useContent()

const {
  items: featuredResources,
  fetch: fetchFeaturedResources,
  loading: loadingResources
} = useContent()

const loadingFeatured = computed(() => loadingPosts.value || loadingResources.value)

const FEATURED_LIMIT = 6 // cuántas tarjetas trae el slider como máximo

const featuredContent = computed(() => {
  const posts = featuredPosts.value.map(item => normalizeFeaturedItem(item, 'post'))
  const resources = featuredResources.value.map(item => normalizeFeaturedItem(item, 'resource'))

  // Más reciente primero, mezclando ambos tipos
  return [...posts, ...resources]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, FEATURED_LIMIT)
})

// ---------- Slider ----------
const currentSlide = ref(0)

function nextSlide() {
  if (!featuredContent.value.length) return
  currentSlide.value = (currentSlide.value + 1) % featuredContent.value.length
}

function prevSlide() {
  if (!featuredContent.value.length) return
  currentSlide.value =
    (currentSlide.value - 1 + featuredContent.value.length) % featuredContent.value.length
}

function goToSlide(index) {
  currentSlide.value = index
}

// Si la lista cambia (llega de la API, o queda más corta), volvemos al inicio
// para no quedar apuntando a un índice que ya no existe.
watch(featuredContent, () => {
  currentSlide.value = 0
})

function normalizeFeaturedItem(item, type) {
  return {
    type,
    id: item.id,
    slug: item.slug,
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
  if (words.length <= wordLimit) return stripped
  return words.slice(0, wordLimit).join(' ') + '...'
}

onMounted(() => {
  fetchFeaturedPosts({
    type: 'posts',
    page: 1,
    perPage: FEATURED_LIMIT,
    filters: {
      s: '',
      'special-content': 'featured'
    }
  })

  fetchFeaturedResources({
    type: 'resources',
    page: 1,
    perPage: FEATURED_LIMIT,
    filters: {
      s: '',
      'special-content': 'featured'
    }
  })
})
</script>

<style scoped>
/* Color Variables */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.website-container {
  min-height: 100vh;
  background-color: #2B3B47;
  color: #F5F5F5;
  font-family: 'Arial', sans-serif;
}

/* Header Styles */
.header {
  background-color: #2B3B47;
  padding: 20px 40px;
  border-top: 2px solid #F4D06F;
  border-bottom: 1px solid transparent;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-svg {
  width: 60px;
  height: 60px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-text-bold {
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  color: #F4D06F;
  font-size: 14px;
  letter-spacing: 1px;
}

.navigation {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #F4D06F;
  text-decoration: none;
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
  transition: border-bottom 0.3s;
}

.nav-link:hover {
  border-bottom: 2px solid #F4D06F;
}

.submit-btn {
  background-color: #F4D06F;
  color: #2B3B47;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 12px;
}

.submit-btn:hover {
  background-color: #F79456;
}

/* Dashed Line Decoration */
.dashed-line-decoration {
  height: 2px;
  background-image: 
    linear-gradient(45deg, #F4D06F 25%, transparent 25%),
    linear-gradient(-45deg, #F4D06F 25%, transparent 25%);
  background-size: 20px 20px;
  background-repeat: repeat-x;
  margin: 0;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #F79456, #FDBB80);
  padding: 60px 40px;
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.hero-text {
  font-family: 'Arial', sans-serif;
  font-size: 13px;
  line-height: 1.8;
  color: #2B3B47;
  margin-bottom: 20px;
}

.join-btn {
  background-color: #2B3B47;
  color: #FFFFFF;
  border: none;
  padding: 15px 30px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  margin-top: 20px;
}

.join-btn:hover {
  background-color: #2B3B47;
  opacity: 0.9;
}

.fence-decoration {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 200px;
  height: 200px;
  background-image: 
    linear-gradient(45deg, #2B3B47 25%, transparent 25%),
    linear-gradient(-45deg, #2B3B47 25%, transparent 25%);
  background-size: 20px 20px;
  opacity: 0.1;
}

/* Content Section */
.content-section {
  padding: 80px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-family: 'Georgia', serif;
  font-size: 32px;
  color: #F4D06F;
  margin-bottom: 30px;
  text-align: center;
}

.section-text {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  line-height: 1.8;
  color: #F5F5F5;
  text-align: center;
  max-width: 1000px;
  margin: 0 auto;
}

/* Footer */
.footer {
  background-color: #2B3B47;
  padding: 60px 40px;
  position: relative;
  min-height: 300px;
}

.pattern-section {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  overflow: hidden;
}

.halftone-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(#F4D06F 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.2;
}

.vertical-bars {
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #F4D06F 0px,
    #F4D06F 2px,
    transparent 2px,
    transparent 10px
  );
  opacity: 0.3;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 300px;
}

.footer-text {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  line-height: 1.8;
  color: #F5F5F5;
  text-align: center;
  margin-bottom: 40px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.icon-row {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.icon-circle {
  width: 60px;
  height: 60px;
  border: 2px solid #F4D06F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F4D06F;
}

.icon-circle svg {
  width: 30px;
  height: 30px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .navigation {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .hero-section,
  .content-section,
  .footer {
    padding: 40px 20px;
  }
  
  .pattern-section {
    height: 150px;
  }
  
  .footer-content {
    padding-top: 150px;
  }
}

/* Center image */
.image-center {
  text-align: center;
  margin: 40px 0;
}

.image-center img {
  max-width: 600px;
  width: 100%;
}

/* Bullet list */
.bullet-list {
  max-width: 800px;
  margin: 20px auto;
  text-align: left;
  line-height: 1.8;
}

/* Full image */
.full-image img {
  width: 100%;
  display: block;
  margin: 40px 0;
}

/* Featured card */
.featured-card {
  display: flex;
  max-width: 900px;
  margin: 40px auto;
  background: #1f2a33;
  border: 1px solid #F4D06F;
}

.featured-card img {
  width: 40%;
  object-fit: cover;
}

.featured-card div {
  padding: 20px;
  text-align: left;
}

.featured-link {
  display: inline-block;
  text-decoration: none;
}

/* Slider de Featured Content */
.featured-slider {
  position: relative;
  max-width: 900px;
  margin: 40px auto;
  overflow: hidden;
}

.featured-slider-track {
  display: flex;
  transition: transform 0.4s ease;
}

.featured-slider-track .featured-slide {
  flex: 0 0 100%;
  width: 100%;
  margin: 0; /* el margin lo maneja .featured-slider, no cada slide */
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(43, 59, 71, 0.85);
  color: #F4D06F;
  border: 1px solid #F4D06F;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  z-index: 2;
}

.slider-arrow:hover {
  background-color: #F4D06F;
  color: #2B3B47;
}

.slider-arrow-prev {
  left: -8px;
}

.slider-arrow-next {
  right: -8px;
}

.slider-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
}

.slider-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #F4D06F;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.3s;
}

.slider-dot.active {
  background-color: #F4D06F;
}

@media (max-width: 600px) {
  .slider-arrow-prev {
    left: 4px;
  }
  .slider-arrow-next {
    right: 4px;
  }
}

/* Skeleton de carga para Featured Content */
.featured-skeleton-img {
  width: 40%;
  background: rgba(245, 245, 245, 0.08);
}

.featured-skeleton-line {
  height: 14px;
  margin: 12px 20px;
  border-radius: 4px;
  background: rgba(245, 245, 245, 0.08);
}

</style>