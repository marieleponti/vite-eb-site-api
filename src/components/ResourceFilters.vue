<template>
  <v-card flat class="resource-filters pa-6">
    <!-- Search -->
    <v-text-field
      v-model="filters.s"
      label="Key Terms"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="mdi-magnify"
      clearable
      hide-details
      class="mb-6"
      @keyup.enter="emitFilters"
    />

    <!-- Actions -->
    <div class="filter-actions mb-6">
      <v-btn
        variant="outlined"
        color="primary"
        class="filter-btn"
        @click="emitFilters"
      >
        Search
      </v-btn>

      <v-btn
        variant="outlined"
        color="primary"
        class="filter-btn"
        @click="clearFilters"
      >
        Clear
      </v-btn>

      <v-btn
        variant="outlined"
        color="primary"
        class="filter-btn"
      >
        Map View
      </v-btn>
    </div>

    <!-- Taxonomies -->
    <v-expansion-panels multiple variant="accordion">
      <v-expansion-panel
        v-for="taxonomy in normalizedTaxonomies"
        :key="taxonomy.slug"
        class="filter-panel"
        elevation="0"
      >
        <v-expansion-panel-title class="filter-title">
          {{ taxonomy.label }}
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-checkbox
            v-for="term in taxonomy.children"
            :key="term.slug"
            v-model="filters[taxonomy.slug]"
            :label="term.label"
            :value="term.slug"
            color="primary"
            density="compact"
            hide-details
            class="taxonomy-checkbox"
            @update:model-value="emitFilters"
          />
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
  background: #f5f5f5;
  border: 1px solid #e5e7eb;
}

/* Search field outlined */
:deep(.v-field--variant-outlined) {
  background: #fff;
}

:deep(.v-field--variant-outlined .v-field__outline) {
  opacity: 1 !important;
}

/* Search input text */
:deep(.v-field input) {
  color: #1f2937 !important;
  opacity: 1 !important;
  -webkit-text-fill-color: #1f2937 !important;
}

/* Search label */
:deep(.v-label) {
  color: #6b7280 !important;
  opacity: 1 !important;
}

/* Search icon */
:deep(.v-field__prepend-inner .v-icon) {
  color: #6b7280 !important;
}

/* Placeholder */
:deep(input::placeholder) {
  color: #9ca3af !important;
  opacity: 1 !important;
}

/* Buttons */
.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-btn {
  min-width: 120px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Accordion */
.filter-panel {
  border-bottom: 1px solid #d1d5db;
  background: transparent !important;
}

.filter-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2b3f47;
  padding-left: 0;
}

/* Checkbox visibility */
:deep(.v-selection-control) {
  opacity: 1 !important;
  visibility: visible !important;
}

:deep(.v-checkbox-btn) {
  opacity: 1 !important;
}

:deep(.v-selection-control__wrapper) {
  color: rgb(var(--v-theme-primary)) !important;
}

:deep(.v-label) {
  opacity: 1 !important;
  color: #374151 !important;
}

/* Panel padding */
:deep(.v-expansion-panel-text__wrapper) {
  padding-left: 0;
  padding-right: 0;
}


</style>