<template>
  <v-container class="resource-single-page py-10">
    <!-- Botón para regresar al catálogo -->
    <v-btn variant="text" color="#2f4356" class="mb-6" to="/resources">
      « Back to Resources
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
          <div v-if="resource.content" class="resource-content-single mb-8" v-html="sanitizeContent(resource.content)"></div>

          <!-- Video Embebido Adaptativo (ACF embed_video) -->
          <div v-if="resource.acf?.video_embed" class="video-container mb-8 rounded-lg overflow-hidden">
            <div v-html="resource.acf.video_embed"></div>
          </div>

          <!-- PDFs: selector + viewer (no aplica a Public Records Requests,
               que muestran sus archivos como "Legal Filings and Production" más abajo) -->
<div v-if="resource?.acf?.upload_files?.length && !isPublicRecordsRequest" class="mb-8">
  <v-select
    v-model="selectedPdfUrl"
    :items="resource.acf.upload_files.map(x => ({ title: x.file.title, value: x.file.url }))"
    item-title="title"
    item-value="value"
    label="Select a PDF"
    variant="outlined"
    density="comfortable"
  />

  <div class="d-flex align-center ga-3 mt-3" v-if="selectedPdfUrl">
    <v-icon color="#2f4356">mdi-file-pdf-box</v-icon>
    <span>{{ resource.acf.upload_files.find(x => x.file.url === selectedPdfUrl)?.file.title }}</span>
  </div>

  <div class="rounded-lg overflow-hidden mt-4" v-if="selectedPdfUrl">
    <iframe
      :src="selectedPdfUrl"
      width="100%"
      height="750"
      style="border:0;"
      type="application/pdf"
    />
  </div>

  <v-btn
    class="mt-4"
    v-if="selectedPdfUrl"
    color="#2f4356"
    size="large"
    :href="selectedPdfUrl"
    target="_blank"
    prepend-icon="mdi-open-in-new"
  >
    Download/Open PDF
  </v-btn>
</div>

          <!-- Legal Filings and Production: usa el MISMO repeater
               upload_files (no es un campo separado). El "caption" de
               cada archivo es la fecha mostrada; "title" es la
               descripción en naranja; "description" es texto opcional
               extra (flp-description en el shortcode original). -->
          <div v-if="isPublicRecordsRequest && resource?.acf?.upload_files?.length" class="legal-filings-section mb-8">
            <h2 class="legal-filings-title">Legal Filings and Production</h2>

            <div class="legal-filings-prod-list">
              <div
                v-for="(item, index) in resource.acf.upload_files"
                :key="index"
                class="legal-filings-production-prr-post"
              >
                <div class="filings-caption-date">
                  <p class="flp-caption-date">{{ item.file?.caption }}</p>
                </div>

                <div class="filing-title flp-title">
                  {{ item.file?.title }}

                  <p v-if="item.file?.description" class="flp-description">
                    {{ item.file.description }}
                  </p>

                  <div v-if="item.file?.url" class="download-button-container">
                    <a :href="item.file.url" target="_blank" rel="noopener noreferrer" class="download-button">
                      <v-icon size="18">mdi-download</v-icon>
                      <span class="download-button__text">Download</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchResourceBySlug } from '@/api/services/wp.service'
import { sanitizeContent } from '@/api/mappers/cleanHtml'

const route = useRoute()
const resource = ref(null)
const loading = ref(true)
const selectedPdfUrl = ref('')
const selectedPdfTitle = ref('')

// La sección "Legal Filings and Production" solo aplica a resources
// que tengan la taxonomía source = "public-records-requests" (en el
// sitio original era un template/condicional separado, no parte del
// single genérico de cualquier resource).
const isPublicRecordsRequest = computed(() =>
  resource.value?.taxonomies?.source?.some(s => s.slug === 'public-records-requests') ?? false
)

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
  max-width: 100%;
  margin: 0 auto;
  padding-left: 60px;
  padding-right: 0px;
}

.resource-title-single {
  font-size: 2.5rem;
  color: #29465b;
  font-weight: 300;
  line-height: 1.2;
}

.resource-meta-single {
  font-size: 1rem;
}

.resource-content-single {
  font-size: 1.15rem;
  line-height: 1.9;
  color: #333333;
}

.bg-details-box {
  background-color: #fafdff;
}

.tax-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #55595c;
  margin-bottom: 4px;
  letter-spacing: 0.02em;
}

/* Manejo de contenedores de vídeo (iFrames responsivos) */
.video-container {
  position: relative;
  padding-bottom: 56.25%;
  /* Relación de aspecto 16:9 */
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
  aspect-ratio: 4 / 3; /* o 16/9 según el embed predominante */
  border: 0;
}

/* --- Legal Filings and Production ---
   Mismas clases/estructura que el original Divi (legal-filings-production-prr-post,
   flp-caption-date, filing-title, download-button), para que se vea igual. */
.legal-filings-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2b3f47;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 1.5rem;
}

.legal-filings-prod-list {
  font-family: "Work Sans", sans-serif;
}

.legal-filings-production-prr-post {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  font-size: 1rem;
  color: #2b3f47;
}

.flp-caption-date {
  color: #2b3f47;
  margin: 0;
}

.filing-title {
  font-weight: 700;
  color: #f38a4e;
  line-height: 1.4;
}

.flp-description {
  font-weight: 400;
  color: #4b5563;
  margin-top: 0.5rem;
}

.download-button-container {
  margin-top: 1rem;
}

.download-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #2b3f47;
  color: white !important;
  font-family: "Work Sans", sans-serif;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  transition: all 0.2s ease;
  border: 3px solid transparent;
}

.download-button:hover {
  background-color: #ffffff;
  color: #2b3f47 !important;
  border-color: #2b3f47 !important;
}

@media (max-width: 600px) {
  .legal-filings-production-prr-post {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

:deep(.container),
:deep(.v-container) {
  max-width: 1100px !important;
}

</style>