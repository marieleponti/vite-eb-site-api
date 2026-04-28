<template>
  <v-card flat class="resource-filters pa-6">
    <!-- Search Input -->
    <v-text-field
      v-model="filters.s"
      placeholder="key terms"
      variant="outlined"
      density="comfortable"
      hide-details
      clearable
      class="mb-6"
      @keyup.enter="emitFilters"
    />

    <!-- Top Buttons -->
    <div class="filter-actions mb-8">
      <v-btn
        variant="outlined"
        class="filter-btn"
        @click="emitFilters"
      >
        Search
      </v-btn>

      <v-btn
        variant="outlined"
        class="filter-btn"
        @click="clearFilters"
      >
        Clear
      </v-btn>

      <v-btn
        variant="outlined"
        class="filter-btn"
      >
        Map View
      </v-btn>
    </div>

    <!-- Accordion Filters -->
    <v-expansion-panels
      multiple
      variant="accordion"
      flat
    >
      <v-expansion-panel
        v-for="taxonomy in taxonomies"
        :key="taxonomy.slug"
        elevation="0"
        class="filter-panel"
      >
        <v-expansion-panel-title class="filter-title">
          {{ taxonomy.label.toUpperCase() }}
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-checkbox
            v-for="term in taxonomy.children"
            :key="term.slug"
            v-model="filters[taxonomy.slug]"
            :label="term.label"
            :value="term.slug"
            density="compact"
            hide-details
            color="primary"
            class="mb-1"
            @change="emitFilters"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Bottom Search -->
    <v-btn
      variant="outlined"
      class="filter-btn mt-8"
      @click="emitFilters"
    >
      Search
    </v-btn>
  </v-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { fetchResourceFilters } from '@/api/wp.service'

const emit = defineEmits(['update'])

const taxonomies = ref([])

const filters = reactive({
  s: '',
  topic: [],
  source: [],
  format: [],
  country: [],
  language: []
})

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
  background: #f4f4f6;
  border-radius: 0;
}

.filter-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-btn {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.85rem;
}

.filter-panel {
  border-bottom: 1px solid #d7d7d7;
  background: transparent !important;
}

.filter-title {
  font-size: 1.75rem;
  font-weight: 300;
  letter-spacing: 0.02em;
  color: #2b3f47;
  padding-left: 0;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding-left: 0;
  padding-right: 0;
}

:deep(.v-selection-control) {
  margin-bottom: 8px;
}
</style>