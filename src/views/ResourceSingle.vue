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
          <!-- Imagen Destacada -->
          <v-img 
            v-if="resource.featuredImage" 
            :src="resource.featuredImage" 
            :alt="resource.title" 
            max-height="400" 
            class="rounded-lg mb-6"
            cover 
          />

          <!-- Título Principal -->
          <h1 class="resource-title-single mb-2">{{ resource.title }}</h1>
          
          <!-- Metadatos de Publicación (Fecha y Autor de ACF) -->
          <div class="resource-meta-single mb-6 text-grey-darken-1">
            <span>Published on: {{ formatDate(resource.date) }}</span>
            <span v-if="resource.acf?.author"> | By: {{ resource.acf.author }}</span>
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- Descripción del recurso (ACF description) -->
          <div 
            class="resource-content-single mb-8" 
            v-html="resource.acf?.description || 'No description available for this resource.'"
          ></div>

          <!-- Video Embebido Adaptativo (ACF embed_video) -->
          <div v-if="resource.acf?.video_embed" class="video-container mb-8 rounded-lg overflow-hidden">
            <div v-html="resource.acf.video_embed"></div>
          </div>
          
          <!-- Botones de Acción para Enlaces y Descargas (PDFs) -->
          <div class="d-flex flex-wrap ga-3 mt-6">
            <v-btn 
              v-if="resource.acf?.link_to_resource" 
              color="#2f4356" 
              size="large" 
              :href="resource.acf.link_to_resource" 
              target="_blank"
              prepend-icon="mdi-open-in-new"
            >
              Link to Original Source
            </v-btn>

            <v-btn 
              v-if="resource.acf?.file_url" 
              color="red-darken-2" 
              variant="flat"
              size="large" 
              :href="resource.acf.file_url" 
              target="_blank"
              prepend-icon="mdi-file-pdf-box"
            >
              Download PDF / File
            </v-btn>
          </div>
        </article>
      </v-col>

      <!-- COLUMNA LATERAL (Derecha): Especificaciones del Recurso (Taxonomías) -->
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-5 rounded-lg bg-details-box" style="border-color: #c7cdd4 !important;">
          <h3 class="text-subtitle-1 font-weight-bold mb-4" style="color: #29465b; text-transform: uppercase; letter-spacing: 0.05em;">
            Resource Specifications
          </h3>
          
          <div class="d-flex flex-column ga-4">
            
            <!-- Authoring Organization -->
            <div v-if="resource.taxonomies?.authoring_organization?.length">
              <div class="tax-label">Authoring Organization</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="org in resource.taxonomies.authoring_organization" :key="org.slug" size="small" color="#29465b" variant="flat">
                  {{ org.name }}
                </v-chip>
              </div>
            </div>

            <!-- Topics -->
            <div v-if="resource.taxonomies?.topic?.length">
              <div class="tax-label">Topics</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="topic in resource.taxonomies.topic" :key="topic.slug" size="small" color="#2f4356" variant="tonal">
                  {{ topic.name }}
                </v-chip>
              </div>
            </div>

            <!-- Country -->
            <div v-if="resource.taxonomies?.country?.length">
              <div class="tax-label">Country</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="c in resource.taxonomies.country" :key="c.slug" size="small" color="blue-grey-darken-2" variant="outlined">
                  {{ c.name }}
                </v-chip>
              </div>
            </div>

            <!-- City / Community -->
            <div v-if="resource.taxonomies?.city_community?.length">
              <div class="tax-label">City / Community</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="city in resource.taxonomies.city_community" :key="city.slug" size="small" variant="outlined">
                  {{ city.name }}
                </v-chip>
              </div>
            </div>

            <!-- Source -->
            <div v-if="resource.taxonomies?.source?.length">
              <div class="tax-label">Source</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="src in resource.taxonomies.source" :key="src.slug" size="small" variant="text" class="border">
                  {{ src.name }}
                </v-chip>
              </div>
            </div>

            <!-- Format -->
            <div v-if="resource.taxonomies?.format?.length">
              <div class="tax-label">Format</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="fmt in resource.taxonomies.format" :key="fmt.slug" size="small" color="grey-darken-3" variant="tonal">
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

const route = useRoute()
const resource = ref(null)
const loading = ref(true)

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

  } catch (error) {
    console.error('Error fetching resource:', error)
    resource.value = null
  } finally {
    loading.value = false
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
  padding-bottom: 56.25%; /* Relación de aspecto 16:9 */
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

:deep(.resource-content-single p) {
  margin-bottom: 1.5rem;
}
</style>