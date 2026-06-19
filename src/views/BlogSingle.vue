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
                <v-img v-if="post.featuredImage" :src="post.featuredImage" />


                <!-- Title -->
                <h1 class="blog-title">{{ post.title }}</h1>

                <div class="blog-meta">
                    {{ formatDate(post.date) }}
                </div>

                <div v-html="post.content"></div>


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
import { ref, onMounted } from 'vue'
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
        console.log('POST TITLE:', post.value?.title)
        console.log('POST SLUG:', post.value?.slug)
        console.log('POST CONTENT:', post.value?.content)

    } catch (err) {
        console.error(err)
        post.value = null
    } finally {
        loading.value = false
    }
}

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
}

.blog-meta {
    color: #7a8a96;
    font-size: 0.95rem;
}

.blog-content {
    font-size: 1.15rem;
    line-height: 1.9;
    color: #333;
}

/* WordPress content styling */
.blog-content :deep(h2) {
    margin-top: 2rem;
    margin-bottom: 1rem;
}

.blog-content :deep(p) {
    margin-bottom: 1.5rem;
}

.blog-content :deep(img) {
    max-width: 100%;
    border-radius: 8px;
}
</style>