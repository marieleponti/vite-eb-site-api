<template>
    <v-container class="blog-single-page py-10">

        <!-- Back button -->
        <v-btn variant="text" color="#2f4356" class="mb-6" to="/blog">
            « Back to Blog
        </v-btn>

        <!-- Loading -->
        <v-row v-if="loading">
            <v-col cols="12" md="8" class="mx-auto">
                <v-skeleton-loader type="image, heading, article, paragraph@3" class="rounded-lg" />
            </v-col>
        </v-row>

        <!-- Post -->
        <v-row v-else-if="post">

            <v-col cols="12" md="8" class="mx-auto">

                <!-- Featured image -->
                <v-img v-if="post.featuredImage" :src="post.featuredImage" class="mb-6" />

                <!-- Title -->
                <h1 class="blog-title">{{ post.title }}</h1>

                <div class="blog-meta">
                    {{ formatDate(post.date) }}
                </div>

                <!--
                  CAMBIO: antes este <div> no tenía la clase "blog-content",
                  así que las reglas :deep(p), :deep(img), etc. de abajo
                  nunca matcheaban nada. Junto con el fix en postMapper.js
                  (content ya no pierde sus tags HTML), esto es lo que
                  reconstruye el formato real del post.
                -->
                <div class="blog-content" v-html="processedContent"></div>

            </v-col>
        </v-row>

        <!-- Not found -->
        <v-row v-else>
            <v-col cols="12" md="6" class="mx-auto">
                <v-alert type="error" variant="tonal">
                    Post not found
                </v-alert>
            </v-col>
        </v-row>

    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPostBySlug } from '@/api/services/wp.service'

const route = useRoute()

const post = ref(null)
const loading = ref(true)

onMounted(() => {
    loadPost()
})

async function loadPost() {
    loading.value = true
    try {
        const slug = route.params.slug
        const res = await fetchPostBySlug(slug)
        post.value = res?.item || res?.items?.[0] || null
    } catch (err) {
        console.error(err)
        post.value = null
    } finally {
        loading.value = false
    }
}

const processedContent = computed(() => {
    if (!post.value?.content) return ''

    const SUBTITLE_MAX_LENGTH = 80 // ajusta según tus posts reales

    const doc = new DOMParser().parseFromString(post.value.content, 'text/html')

    doc.querySelectorAll('p').forEach((p) => {
        const onlyChild = p.children.length === 1 && p.children[0].tagName === 'STRONG'
        if (onlyChild) {
            const text = p.textContent.trim()
            if (text.length > 0 && text.length <= SUBTITLE_MAX_LENGTH) {
                p.classList.add('is-subtitle')
            }
        }
    })

    return doc.body.innerHTML
})

function formatDate(date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>

<style scoped>
.blog-single-page {
    background: #fff;
    min-height: 100vh;
}

.blog-title {
    font-size: 2.5rem;
    font-weight: 300;
    color: #29465b;
    line-height: 1.2;
    margin-top: 1.5rem;
}

.blog-meta {
    color: #7a8a96;
    font-size: 0.95rem;
    margin-bottom: 2rem;
}

/* =========================================
   CUERPO DEL POST (contenido real de WP)
   El post original (Divi) no usa <h2> para los subtítulos dentro del
   cuerpo — son párrafos enteros envueltos en <strong> (ej. "Washington's
   thirst for biometrics"). Por eso, además de estilizar <strong> normal,
   detectamos ese patrón específico con :has() para que se vean como
   subtítulos reales y no como una palabra en negrita en medio del texto.
========================================= */
.blog-content {
    font-size: 1.15rem;
    line-height: 1.9;
    color: #333;
}

.blog-content :deep(p) {
    margin: 0 0 1.5rem;
}

.blog-content :deep(a) {
    color: #2f4356;
    text-decoration: underline;
}

.blog-content :deep(a:hover) {
    color: #29465b;
}

.blog-content :deep(strong) {
    font-weight: 700;
    color: #1f2d36;
}

.blog-content :deep(p.is-subtitle) {
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    font-size: 1.05em;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #29465b;
}

.blog-content :deep(em) {
    font-style: italic;
    color: #555;
}

/* El primer párrafo suele ser la bajada/resumen en cursiva (<em>) */
.blog-content :deep(> p:first-child em) {
    font-size: 1.1em;
}

.blog-content :deep(h2),
.blog-content :deep(h3) {
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    color: #29465b;
    font-weight: 600;
}

.blog-content :deep(blockquote) {
    margin: 1.5rem 0;
    padding-left: 1.25rem;
    border-left: 4px solid #c7cdd4;
    color: #555;
    font-style: italic;
}

.blog-content :deep(ul),
.blog-content :deep(ol) {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
}

.blog-content :deep(li) {
    margin-bottom: 0.5rem;
}

/* Imágenes embebidas en el cuerpo (bloques wp-block-image de WP) */
.blog-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    display: block;
    margin: 0.5rem auto;
}

.blog-content :deep(figure) {
    margin: 2rem 0;
    text-align: center;
}

.blog-content :deep(figcaption) {
    font-size: 0.85rem;
    color: #6b7280;
    margin-top: 0.5rem;
}
</style>