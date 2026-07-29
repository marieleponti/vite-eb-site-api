<template>
  <v-container class="resource-single-page py-10">
    <!-- Botón para regresar al catálogo -->
    <!-- Back button (al final del artículo) -->
    <v-divider class="my-8" />
    <v-divider class="my-8" />
    <v-btn variant="text" color="#2f4356" to="/resources">
      « {{ $t('resources.backToResources') }}
    </v-btn>
    <!-- Estado de Carga (Skeleton Loader) -->
    <v-row v-if="loading">
      <v-col cols="12" md="8" class="mx-auto">
        <v-skeleton-loader type="image, article, heading, paragraph@3" class="rounded-lg" />
      </v-col>
    </v-row>

    <!-- Visualización del Contenido del Recurso -->
    <v-row v-else-if="resource">

      <!-- COLUMNA PRINCIPAL (Izquierda): Información y Media -->
      <v-col cols="12" md="8">
        <article>

          <!-- Título Principal -->
          <h1 class="resource-title-single mb-2">{{ resource.title }}</h1>

          <!-- Metadatos de Publicación (Fecha y Autor de ACF) -->
          <div class="resource-meta-single mb-6 text-grey-darken-1">
            <span>Published on: {{ formatDate(resource.date) }}</span>
            <span v-if="resource.acf?.author"> | By: {{ resource.acf.author }}</span>
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- Descripción del recurso (ACF description) -->
          <div class="resource-content-single mb-8" v-html="sanitizeContent(resource.acf?.description) || ''"></div>
          <!-- Contenido nativo de WP (post_content) — embeds legado, iframes, etc. -->
          <div v-if="resource.content" class="resource-content-single mb-8" v-html="sanitizeContent(resource.content)">
          </div>

          <!-- Video Embebido Adaptativo (ACF embed_video) -->
          <div v-if="resource.acf?.video_embed" class="video-container mb-8 rounded-lg overflow-hidden">
            <div v-html="resource.acf.video_embed"></div>
          </div>

          <!-- PDFs: selector + viewer -->
          <div v-if="resource?.acf?.upload_files?.length" class="mb-8">
            <v-select v-model="selectedPdfUrl"
              :items="resource.acf.upload_files.map(x => ({ title: x.file.title, value: x.file.url }))"
              item-title="title" item-value="value" label="Select a PDF" variant="outlined" density="comfortable" />

            <div class="d-flex align-center ga-3 mt-3" v-if="selectedPdfUrl">
              <v-icon color="#2f4356">mdi-file-pdf-box</v-icon>
              <span>{{resource.acf.upload_files.find(x => x.file.url === selectedPdfUrl)?.file.title}}</span>
            </div>

            <div class="rounded-lg overflow-hidden mt-4" v-if="selectedPdfUrl">
              <iframe :src="selectedPdfUrl" width="100%" height="750" style="border:0;" type="application/pdf" />
            </div>

            <v-btn class="mt-4" v-if="selectedPdfUrl" color="#2f4356" size="large" :href="selectedPdfUrl"
              target="_blank" prepend-icon="mdi-open-in-new">
              Download/Open PDF
            </v-btn>

            <!-- Back button (al final del artículo) -->
            <v-divider class="my-8" />
            <v-divider class="my-8" />
            <v-btn variant="text" color="#2f4356" to="/resources">
              « {{ $t('resources.backToResources') }}
            </v-btn>
          </div>
        </article>
      </v-col>

      <!-- COLUMNA LATERAL (Derecha): Especificaciones del Recurso (Taxonomías) -->
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-5 rounded-lg bg-details-box" style="border-color: #c7cdd4 !important;">
          <h3 class="text-subtitle-1 font-weight-bold mb-4"
            style="color: #29465b; text-transform: uppercase; letter-spacing: 0.05em;">
            About the Resource
          </h3>

          <div class="d-flex flex-column ga-4">

            <!-- Authoring Organization -->
            <div v-if="resource.taxonomies?.authoring_organization?.length">
              <div class="tax-label">Authoring Organization</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="org in resource.taxonomies.authoring_organization" :key="org.slug" size="small"
                  color="#29465b" variant="flat">
                  {{ org.name }}
                </v-chip>
              </div>
            </div>

            <!-- Topics -->
            <div v-if="resource.taxonomies?.topic?.length">
              <div class="tax-label">Topics</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="topic in resource.taxonomies.topic" :key="topic.slug" size="small" color="#2f4356"
                  variant="tonal">
                  {{ topic.name }}
                </v-chip>
              </div>
            </div>

            <!-- Country -->
            <div v-if="resource.taxonomies?.country?.length">
              <div class="tax-label">Country</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="c in resource.taxonomies.country" :key="c.slug" size="small" color="blue-grey-darken-2"
                  variant="outlined">
                  {{ c.name }}
                </v-chip>
              </div>
            </div>

            <!-- City / Community -->
            <div v-if="resource.taxonomies?.city_community?.length">
              <div class="tax-label">City / Community</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="city in resource.taxonomies.city_community" :key="city.slug" size="small"
                  variant="outlined">
                  {{ city.name }}
                </v-chip>
              </div>
            </div>

            <!-- Source -->
            <div v-if="resource.taxonomies?.source?.length">
              <div class="tax-label">Source</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="src in resource.taxonomies.source" :key="src.slug" size="small" variant="text"
                  class="border">
                  {{ src.name }}
                </v-chip>
              </div>
            </div>

            <!-- Format -->
            <div v-if="resource.taxonomies?.format?.length">
              <div class="tax-label">Format</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="fmt in resource.taxonomies.format" :key="fmt.slug" size="small" color="grey-darken-3"
                  variant="tonal">
                  {{ fmt.name }}
                </v-chip>
              </div>
            </div>

            <!-- Language -->
            <div v-if="resource.taxonomies?.language?.length">
              <div class="tax-label">Language</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="lang in resource.taxonomies.language" :key="lang.slug" size="small" variant="tonal">
                  {{ lang.name }}
                </v-chip>
              </div>
            </div>

          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error / Recurso no encontrado -->
    <v-row v-if="!loading && !resource">
      <v-col cols="12" md="6" class="mx-auto">
        <v-alert type="error" variant="tonal">
          Resource not found, or you do not have sufficient permissions to view it.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchResourceBySlug } from '@/api/services/wp.service'
import { sanitizeContent } from '@/api/mappers/cleanHtml'

const route = useRoute()
const resource = ref(null)
const loading = ref(true)
const selectedPdfUrl = ref('')
const selectedPdfTitle = ref('')

onMounted(() => {
  fetchSingleResource()
})

async function fetchSingleResource() {
  loading.value = true

  try {
    const slug = route.params.slug

    if (!slug) {
      console.error('Missing slug param')
    }

    const res = await fetchResourceBySlug(slug)

    resource.value = res?.item || res?.items?.[0] || null
    initPdfSelection()

  } catch (error) {
    console.error('Error fetching resource:', error)
    resource.value = null
  } finally {
    loading.value = false
  }
}

function initPdfSelection() {
  const files = resource.value?.acf?.upload_files || []
  if (files.length) {
    const first = files[0]?.file
    selectedPdfUrl.value = first?.url || ''
    selectedPdfTitle.value = first?.title || ''
  }
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.resource-single-page {
  background: #ffffff;
  min-height: 100vh;
}

/* Título principal — intención original: Cormorant bold (regla global h1) */
.resource-title-single {
  font-size: 2.5rem;
  color: #29465b;
  font-weight: 700;
  line-height: 1.2;
  font-family: var(--eb-default, 'Cormorant', serif);
}

.resource-meta-single {
  font-size: 1rem;
  font-family: 'Open Sans', Arial, sans-serif;
}

/* Cuerpo del contenido — coincide con .single-post-description-display */
.resource-content-single {
  font-size: 1.15rem;
  line-height: 1.9;
  color: #333333;
  font-family: 'Work Sans', sans-serif;
}

.bg-details-box {
  background-color: #fafdff;
}

/* "Resource Specifications" heading — regla global h3: Cormorant bold */
.resource-specs-title {
  font-family: var(--eb-default, 'Cormorant', serif);
}

.tax-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #55595c;
  margin-bottom: 4px;
  letter-spacing: 0.02em;
  font-family: 'Open Sans', Arial, sans-serif;
}

/* Manejo de contenedores de vídeo (iFrames responsivos) */
.video-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  background: #000;
}

.video-container :deep(iframe),
.video-container :deep(object),
.video-container :deep(embed) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

:deep(.resource-content-single iframe) {
  max-width: 100%;
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 0;
}
</style>