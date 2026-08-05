<template>
  <v-container fluid class="eb-research-section pa-0">

    <!-- HEADER PRINCIPAL -->
    <h1 class="secondfont mb-3 font-weight-bold text-dark px-4 pt-4">
      {{ $t('featuredResearch.pageTitle') }}
    </h1>

    <!-- JUMBOTRON INFORMATIVO -->
    <v-card flat class="jumbotron-custom mb-6 mx-4 bg-lightblue rounded-0">
      <v-row no-gutters align="center">
        <v-col cols="12" md="6" class="pa-6">
          <p class="jumbotron-text mb-0">
            {{ $t('featuredResearch.introText') }}
          </p>
        </v-col>
        <v-col cols="12" md="6" class="d-none d-md-block position-relative line-illustration">
          <figure class="ma-0 position-relative fill-height">
            <v-img :src="borderTechImg" alt="Border Infrastructure Illustration" height="100%" cover />
            <figcaption class="caption-text">
              <a href="https://www.instagram.com/chewsomebubblegum/" target="_blank" rel="noopener noreferrer">
                {{ $t('featuredResearch.illustrationCaption') }}
              </a>
            </figcaption>
          </figure>
        </v-col>
      </v-row>
    </v-card>

    <!-- SECCIÓN DE INVESTIGACIONES (Fijas + Query de WordPress) -->
    <v-container fluid class="px-4 pb-8">
      <h2 class="secondfont mb-6">{{ $t('featuredResearch.sectionTitle') }}</h2>

      <!-- Skeletons de carga mientras useContent hace la petición a Netlify / Pantheon -->
      <v-row v-if="loading">
        <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="image, article, actions" class="rounded-lg" />
        </v-col>
      </v-row>

      <!-- Grilla Unificada Final -->
      <v-row v-else-if="allResearch.length">
        <v-col v-for="(item, index) in allResearch" :key="index" cols="12" sm="6" md="4" lg="3">
          <v-card class="resource-card h-100 d-flex flex-column" elevation="2" rounded="lg">

            <!-- Contenedor Imagen -->
            <div class="position-relative">
              <v-img v-if="item.featuredImage" :src="item.featuredImage" :alt="item.title" height="220" cover />
            </div>

            <!-- Cuerpo de la tarjeta -->
            <v-card-item class="flex-grow-1">
              <v-card-title class="resource-title text-wrap">
                <a :href="item.permalink" target="_blank" rel="noopener noreferrer">
                  {{ item.title }}
                </a>
              </v-card-title>

              <v-card-subtitle class="resource-meta pt-2 d-flex justify-space-between align-center">
                <span class="author-text text-truncate font-weight-bold text-grey-darken-2">
                  {{ item.author || item.acf?.author }}
                </span>
              </v-card-subtitle>
            </v-card-item>

            <v-card-text class="resource-content pt-0">
              <div class="resource-excerpt text-body-2 text-grey-darken-1">
                {{ trimExcerpt(item.excerpt || item.content, 20) }}
              </div>
            </v-card-text>

            <v-spacer />

            <v-card-actions class="pa-4 pt-0">
              <v-btn color="#002d62" variant="text" :href="item.permalink" target="_blank"
                class="font-weight-bold px-0 text-none">
                {{ $t('featuredResearch.viewResearch') }}
              </v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
      </v-row>

      <!-- Estado Vacío -->
      <v-alert v-else type="info" variant="tonal" class="text-grey-darken-3">
        {{ $t('featuredResearch.noResultsFound') }} <a href="/research" class="text-success font-weight-bold">{{ $t('featuredResearch.browseAll') }}</a>.
      </v-alert>
    </v-container>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContent } from '@/composables/useContent'
import { useAuth } from '@/composables/useAuth'
import borderTechImg from '@/assets/images/border-tech.jpg'
import minibriefBorderExt from '@/assets/images/minibrief_border-ext.jpg'
import minibriefBiometricsMgmt from '@/assets/images/minibrief_biometrics-migr-mgmt.jpg'
import minibriefHumanImpacts from '@/assets/images/minibrief_human-impacts.png'
import minibriefBiometricsBorders from '@/assets/images/minibrief_biometrics-borders.jpg'

const { t } = useI18n()
const { items: dynamicItems, fetch: cargarContenido, loading } = useContent()
const { roles: userRoles, checkCurrentUser } = useAuth()

const allowedRoles = ['ebteam', 'administrator', 'ebcommunity']

// Este computed ahora es 100% reactivo y global
const hasAccess = computed(() => {
  return userRoles.value.some(role => allowedRoles.includes(role))
})

// 4 artículos estáticos iniciales fijos.
// Título y extracto vienen de $t() para que cambien con el idioma;
// permalink, imagen y autor se mantienen fijos (no se traducen).
const staticResearch = computed(() => [
  {
    title: t('featuredResearch.static1Title'),
    permalink: '/featured-research/border-externalization-in-americas',
    featuredImage: minibriefBorderExt,
    excerpt: t('featuredResearch.static1Excerpt'),
    author: 'Mizue Aizeki & S. Narváez',
    restricted: false
  },
  {
    title: t('featuredResearch.static2Title'),
    permalink: '/featured-research/biometrics-based-migration-management',
    featuredImage: minibriefBiometricsMgmt,
    excerpt: t('featuredResearch.static2Excerpt'),
    author: 'Santiago Narváez',
    restricted: true
  },
  {
    title: t('featuredResearch.static3Title'),
    permalink: '/featured-research/human-impacts-brief',
    featuredImage: minibriefHumanImpacts,
    excerpt: t('featuredResearch.static3Excerpt'),
    author: 'Laura Bingham',
    restricted: false
  },
  {
    title: t('featuredResearch.static4Title'),
    permalink: '/featured-research/biometrics-mx-ca',
    featuredImage: minibriefBiometricsBorders,
    excerpt: t('featuredResearch.static4Excerpt'),
    author: 'Everywhere Border Project',
    restricted: false
  }
])

function trimExcerpt(text, wordLimit) {
  if (!text) return ''
  const plain = text.replace(/<[^>]*>/g, '').trim()
  const words = plain.split(/\s+/)
  if (words.length <= wordLimit) return plain
  return words.slice(0, wordLimit).join(' ') + '...'
}

// LLAMADA REPLICANDO TU WP_QUERY MEDIANTE NETLIFY PARAMS
onMounted(async () => {
  // Ejecutamos la validación en segundo plano. Si el token es válido, 
  // 'userRoles' se actualizará solo y reactivará la tarjeta privada.
  checkCurrentUser().catch(err => console.error("Error sutil de Auth:", err))

  // Traemos el contenido de la API de inmediato
  await cargarContenido({
    type: 'resources',
    page: 1,
    perPage: 12,
    filters: {
      s: '',
      'research-team': 'eb-research',
      'special-content': 'featured'
    }
  })
})

// PROCESAMIENTO REACTIVO
const allResearch = computed(() => {
  // Aquí aplicamos la única condición que falta: omitir 'public-records-requests'
  const dynamicProcessed = dynamicItems.value
    .filter(item => {
      const itemSources = item.source || item.pure_taxonomies?.source || item.terms?.source || []

      // Si el item tiene la taxonomía que queremos omitir, lo descartamos (return false)
      const hasPublicRecords = Array.isArray(itemSources)
        ? itemSources.some(s => (typeof s === 'object' ? s?.slug : s) === 'public-records-requests')
        : itemSources === 'public-records-requests'

      return !hasPublicRecords
    })
    .map(item => ({
      ...item,
      author: item.acf?.author || item.author,
      restricted: false
    }))

  // Unimos los 4 fijos con los dinámicos ya limpios
  const combined = [...staticResearch.value, ...dynamicProcessed]

  // Sincronizamos accesos y cortamos para mostrar los 4 fijos + un máximo de 6 dinámicos (Total 10)
  return combined
    .filter(item => {
      if (!item.restricted) return true; // Si es público, pasa directo
      return hasAccess.value;            // Si es privado, depende estrictamente de su rol reactivo
    })
    .slice(0, 10)
})


</script>

<style scoped>

.secondfont {
  font-family: 'Cormorant', Georgia, 'Times New Roman', serif;
  font-weight: 700;
  font-size: 4.8rem;
  line-height: 1.1;
  color: #2b3f47
}

/* El h2 "Featured Research" también hereda .secondfont pero debe verse
   más chico que el h1 principal -> igual que la regla global h3: 3.6rem */
h2.secondfont {
  font-size: 3rem;
}

@media (max-width: 960px) {
  .secondfont {
    font-size: 2.8rem;
  }

  h2.secondfont {
    font-size: 2rem;
  }
}

.bg-lightblue {
  background-color: #eaeaef !important;
}

.resource-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.resource-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

/* Coincide con h3.research-title del original -> Cormorant bold */
.resource-title a {
  color: #212529;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
  font-family: 'Cormorant', Georgia, 'Times New Roman', serif;
}

.resource-card:hover .resource-title a {
  color: #002d62;
}

/* .research-author / fecha -> Work Sans (body default de esta página) */
.author-text {
  font-size: 0.85rem;
  color: #4b5563;
  font-family: 'Work Sans', Helvetica, Arial, Lucida, sans-serif;
}

.jumbotron-custom {
  background: #eaeaef;
  border: 1px solid #d1e7dd;
}

/* Coincide con <p class="mb-3"> del original -> Work Sans */
.jumbotron-text {
  font-size: 1.3rem;
  line-height: 1.8;
  color: #333333;
  font-family: 'Work Sans', Helvetica, Arial, Lucida, sans-serif;
}

.caption-text {
  position: absolute;
  bottom: 12px;
  right: 15px;
  background: rgba(0, 0, 0, 0.65);
  padding: 4px 10px;
  border-radius: 4px;
  z-index: 2;
}

.caption-text a {
  color: #ffffff !important;
  font-size: 0.75rem;
  text-decoration: none;
  font-family: 'Work Sans', Helvetica, Arial, Lucida, sans-serif;
}

/* Excerpt de card -> Work Sans */
.resource-excerpt {
  font-family: 'Work Sans', Helvetica, Arial, Lucida, sans-serif;
}

.line-illustration {
  align-self: stretch;
}
</style>