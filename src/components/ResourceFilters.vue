<template>
  <v-card flat class="resource-filters pa-6">
    <!-- Search -->
    <v-text-field v-model="filters.s" label="Key Terms" variant="outlined" density="comfortable"
      prepend-inner-icon="mdi-magnify" clearable hide-details class="mb-6" @keyup.enter="emitFilters" />

    <!-- Actions -->
    <div class="filter-actions mb-6">
      <v-btn variant="outlined" color="#29465b" class="filter-btn" @click="emitFilters">
        Search
      </v-btn>

      <v-btn variant="outlined" color="#29465b" class="filter-btn" @click="clearFilters">
        Clear
      </v-btn>

      <v-btn variant="outlined" color="#29465b" class="filter-btn">
        Map View
      </v-btn>
    </div>

    <!-- Taxonomies -->
    <v-expansion-panels multiple variant="accordion">
      <v-expansion-panel v-for="taxonomy in normalizedTaxonomies" :key="taxonomy.slug" class="filter-panel"
        elevation="0">
        <v-expansion-panel-title class="filter-title">
          {{ taxonomy.label }}
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-checkbox v-for="term in taxonomy.children" :key="term.slug" v-model="filters[taxonomy.slug]"
            :label="term.label" :value="term.slug" color="primary" density="comfortable" hide-details
            class="taxonomy-checkbox" @update:model-value="emitFilters" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { fetchResourceFilters } from '@/api/wp.service'

const emit = defineEmits(['update'])

const taxonomies = ref([])

const filters = reactive({
  s: '',
  topic: [],
  source: [],
  format: [],
  country: [],
  language: [],
})

const normalizedTaxonomies = computed(() =>
  (taxonomies.value || []).map((taxonomy) => ({
    ...taxonomy,
    label: taxonomy.label || taxonomy.name || taxonomy.slug,
    children: (taxonomy.children || []).map((term) => ({
      slug: term.slug,
      label: term.label || term.name || term.slug,
    })),
  })),
)

async function loadFilters() {
  try {
    taxonomies.value = await fetchResourceFilters()
  } catch (error) {
    console.error('Error loading filters:', error)
  }
}

function emitFilters() {
  emit('update', { ...filters })
}

function clearFilters() {
  filters.s = ''
  filters.topic = []
  filters.source = []
  filters.format = []
  filters.country = []
  filters.language = []

  emitFilters()
}

onMounted(loadFilters)
</script>

<style scoped>
.resource-filters {
  background: #f3f3f3;
  padding: 1.5rem;
}

/* Search box */
:deep(.v-field--variant-outlined) {
  background: #fff;
  border-radius: 0;
}

:deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-opacity: 1;
  color: #b8b8b8;
}

:deep(.v-field__input) {
  min-height: 48px;
  font-size: 1rem;
  text-transform: lowercase;
}

/* Accordion */
.filter-panel {
  border-radius: 0 !important;
  box-shadow: none !important;
  border-bottom: 1px solid #d7d7d7;
  background: transparent !important;
}

:deep(.v-expansion-panel-title) {
  min-height: 72px;
  padding: 0;
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #29465b;
}

:deep(.v-expansion-panel-title__icon .v-icon) {
  font-size: 1.75rem;
  color: #29465b;
}

/* =========================================
   ACTION BUTTONS
========================================= */
.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 2rem;
}

.filter-btn {
  min-width: 125px;
  height: 48px;
  border-radius: 0 !important;
  border-width: 1px !important;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
  font-size: 0.95rem;
}

/* =========================================
   CHECKBOX 
========================================= */

:deep(.taxonomy-checkbox) {
  margin-bottom: 10px;
}

:deep(.taxonomy-checkbox .v-selection-control) {
  display: flex !important;
  align-items: center !important;
  opacity: 1 !important;
}

:deep(.taxonomy-checkbox .v-selection-control__wrapper) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  height: 24px !important;
  margin-right: 12px !important;
  opacity: 1 !important;
}

:deep(.taxonomy-checkbox .v-selection-control__input) {
  opacity: 1 !important;
}

:deep(.taxonomy-checkbox .v-icon) {
  display: block !important;
  font-size: 24px !important;
  opacity: 1 !important;
  color: #29465b !important;
}

:deep(.taxonomy-checkbox .v-label) {
  opacity: 1 !important;
  color: #29465b !important;
  font-size: 1rem;
  font-weight: 400;
}

:deep(.taxonomy-checkbox .v-selection-control__input) {
  opacity: 1 !important;
  display: flex !important;
}

:deep(.taxonomy-checkbox .v-icon) {
  opacity: 1 !important;
  display: block !important;
  font-size: 24px !important;
  color: #29465b !important;
}

:deep(.taxonomy-checkbox .v-selection-control__wrapper) {
  width: 24px !important;
  height: 24px !important;
  margin-right: 12px;
}

/* Search field text */
:deep(.v-field input) {
  color: #29465b !important;
  -webkit-text-fill-color: #29465b !important;
  caret-color: #29465b !important;
  opacity: 1 !important;
}

/* Search placeholder */
:deep(.v-field input::placeholder) {
  color: #7a8a96 !important;
  opacity: 1 !important;
}

/* Search label */
:deep(.v-field .v-label) {
  color: #29465b !important;
  opacity: 1 !important;
}
</style>