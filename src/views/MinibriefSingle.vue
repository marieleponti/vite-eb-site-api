<!-- src/views/MiniBriefSingle.vue
  Página Single para /featured-research/:slug
-->
<template>
  <v-container fluid class="single-research pa-0">

    <v-container v-if="loading" class="py-12 text-center">
      <v-progress-circular indeterminate color="#002d62" size="40" />
    </v-container>

    <v-container v-else-if="!item" class="py-12 text-center">
      <h2 class="mb-2">Research not found</h2>
      <p class="text-grey-darken-1 mb-4">
        We couldn't find the research piece you're looking for.
      </p>
      <v-btn color="#002d62" variant="flat" to="/research">
        Browse all research
      </v-btn>
    </v-container>

    <template v-else>

      <v-img
        v-if="item.featuredImage"
        :src="item.featuredImage"
        height="420"
        cover
        class="hero-img"
      />

      <v-container class="py-8" style="max-width: 1200px;">
        <v-breadcrumbs
          :items="[
            { title: 'Research', to: '/featured-research' },
            { title: item.title, disabled: true }
          ]"
          class="px-0 mb-2"
        />

        <h1 class="secondfont text-dark mb-2">{{ item.title }}</h1>

        <div class="d-flex align-center mb-8 text-grey-darken-1">
          <span v-if="item.author" class="font-weight-bold mr-3">
            {{ item.author }}
          </span>
          <span v-if="item.date">{{ formattedDate }}</span>
        </div>

        <v-alert
          v-if="item.restricted && !hasAccess"
          type="warning"
          variant="tonal"
          border="start"
          class="mb-8"
        >
          <p class="mb-2">
            This research is restricted to EB team and community members.
          </p>
          <v-btn size="small" color="#002d62" variant="flat" to="/login">
            Log in to view
          </v-btn>
        </v-alert>

        <Richcontent
          v-else
          :html="item.content"
          :heading-overrides="tocOverrides"
          :toc-structure="tocStructure"
        />

      </v-container>
    </template>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Richcontent from '@/components/Richcontent.vue'
import { minibriefResearch } from '@/data/minibriefResearch'
import { useContent } from '@/composables/useContent'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { fetchBySlug } = useContent() // ajustá el nombre si tu composable usa otro método
const { roles: userRoles, checkCurrentUser } = useAuth()

const allowedRoles = ['ebteam', 'administrator', 'ebcommunity']
const hasAccess = computed(() =>
  userRoles.value.some(role => allowedRoles.includes(role))
)

// La jerarquía de <h2>/<h3>/<h4> que viene de WordPress no siempre
// refleja la estructura lógica del índice (este post en particular
// trae "Containment" como h2 y "Conclusion" como h3, al revés de lo
// que debería ser). Se corrige por slug, sin tocar el contenido en
// WordPress ni el HTML que llega de la API.
const TOC_OVERRIDES_BY_SLUG = {
  'human-impacts-brief': {
    Containment: 3,
    Shutdown: 3,
    Conclusion: 2
  }
}

// Algunos artículos tienen un índice "a mano" que no se puede derivar
// agrupando por nivel de heading (salta secciones, mezcla niveles).
// Para esos casos se define el índice completo, explícito, acá.
const TOC_STRUCTURE_BY_SLUG = {
  'border-externalization-in-americas': [
    { id: 'SecurityForces' },
    { id: 'Securitization' },
    { id: 'VerticalBorder' },
    { id: 'SafeThirdCountry' },
    { id: 'CBP' },
    { id: 'ElSalvador' },
    { id: 'Funding' },
    { id: 'migrationcontrol' },
    {
      id: 'DH',
      children: [
        { id: 'ACA' },
        { id: 'BSAs' },
        { id: 'BDSP' },
        { id: 'TANAWPA' }
      ]
    },
    { id: 'migrationprotection' }
  ],
  // El TOC real de este post es una lista PLANA de 6 ítems: salta la
  // sección "Mexico" por completo y no distingue niveles (mezcla h2,
  // h3 y h4 en el cuerpo, pero en el índice todos quedan al mismo
  // nivel). No se puede derivar agrupando por heading, así que se
  // declara explícito.
  'biometrics-based-migration-management': [
    { id: 'biometricid' },
    { id: 'TI' },
    { id: 'ElSalvadorGuatemalaHonduras' },
    { id: 'Guatemala' },
    { id: 'ElSalvador' },
    { id: 'Honduras' }
  ]
}

const tocOverrides = computed(() => TOC_OVERRIDES_BY_SLUG[route.params.slug] || {})
const tocStructure = computed(() => TOC_STRUCTURE_BY_SLUG[route.params.slug] || [])

const item = ref(null)
const loading = ref(true)

const formattedDate = computed(() => {
  if (!item.value?.date) return ''
  return new Date(item.value.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
})

async function loadItem(slug) {
  loading.value = true
  item.value = null

  const staticMatch = minibriefResearch.find(r => r.slug === slug)
  if (staticMatch) {
    item.value = staticMatch
    loading.value = false
    return
  }

  try {
    const dynamicMatch = await fetchBySlug(slug, { type: 'resources' })
    if (dynamicMatch) {
      item.value = {
        ...dynamicMatch,
        author: dynamicMatch.acf?.author || dynamicMatch.author,
        content: dynamicMatch.content?.rendered || dynamicMatch.content,
        restricted: false
      }
    }
  } catch (err) {
    console.error('Error fetching research item:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkCurrentUser().catch(err => console.error('Auth check failed:', err))
  loadItem(route.params.slug)
})

watch(() => route.params.slug, (newSlug) => {
  if (newSlug) loadItem(newSlug)
})
</script>

<style scoped>
.secondfont {
  font-family: "Staatliches", sans-serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.hero-img {
  border-bottom: 4px solid #002d62;
}
</style>