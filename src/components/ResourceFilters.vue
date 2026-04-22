<template>
  <v-card class="pa-4">

    <!-- 🔎 Search -->
    <v-text-field
      v-model="localFilters.s"
      label="Key terms"
      clearable
      prepend-inner-icon="mdi-magnify"
      class="mb-4"
    />

    <!-- Taxonomy filters -->
    <v-expansion-panels multiple>

      <v-expansion-panel
        v-for="tax in taxonomies"
        :key="tax.slug"
      >
        <v-expansion-panel-title>
          {{ tax.label }}
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-checkbox
            v-for="term in tax.terms"
            :key="term.id"
            v-model="localFilters[tax.slug]"
            :label="term.name"
            :value="term.id"
            density="compact"
            hide-details
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

    </v-expansion-panels>

    <!-- Actions -->
    <div class="d-flex justify-space-between mt-4">

      <v-btn
        variant="text"
        @click="clearFilters"
      >
        Clear
      </v-btn>

      <v-btn
        color="primary"
        @click="applyFilters"
      >
        Search
      </v-btn>

    </div>

  </v-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

/**
 * filters que recibe/expone el padre
 */
const emit = defineEmits(['update'])

/**
 * estado local
 */
const localFilters = ref({
  s: '',
  topic: [],
  source: [],
  format: [],
  country: [],
  language: []
})

/**
 * estructura de taxonomías (equivalente a get_filters_data())
 */
const taxonomies = ref([
  { slug: 'topic', label: 'Topic', terms: [] },
  { slug: 'source', label: 'Source', terms: [] },
  { slug: 'format', label: 'Format', terms: [] },
  { slug: 'country', label: 'Country', terms: [] },
  { slug: 'language', label: 'Language', terms: [] }
])

/**
 * cargar términos desde WP (REST o endpoint custom)
 * Ajusta esta URL a tu backend real
 */
async function fetchTerms() {
  try {
    const { data } = await axios.get('/.netlify/functions/getFilters')

    // esperado: mismo shape que taxonomies
    taxonomies.value = data
  } catch (err) {
    console.error('Error loading filters', err)
  }
}

/**
 * 🚀 emitir filtros al padre
 */
function applyFilters() {
  emit('update', { ...localFilters.value })
}

/**
 *  limpiar todo
 */
function clearFilters() {
  localFilters.value = {
    s: '',
    topic: [],
    source: [],
    format: [],
    country: [],
    language: []
  }

  applyFilters()
}

/**
 * opcional: auto-reactivo (tipo “search as you filter”)
 */
watch(localFilters, () => {
  emit('update', { ...localFilters.value })
}, { deep: true })

onMounted(() => {
  fetchTerms()
})
</script>