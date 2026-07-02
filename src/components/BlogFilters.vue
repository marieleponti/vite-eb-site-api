<template>
  <v-card flat class="resource-filters pa-6">


<!-- Search -->
<v-text-field
  v-model="filters.s"
  label="Search Posts"
  variant="outlined"
  density="comfortable"
  prepend-inner-icon="mdi-magnify"
  clearable
  hide-details
  class="mb-6"
  @keyup.enter="apply"
/>

<!-- Actions -->
<div class="filter-actions mb-6">
  <v-btn
    variant="outlined"
    color="#29465b"
    class="filter-btn"
    @click="apply"
  >
    Search
  </v-btn>

  <v-btn
    variant="outlined"
    color="#29465b"
    class="filter-btn"
    @click="clear"
  >
    Clear
  </v-btn>
</div>

  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['update'])

const filters = ref({
  s: '',
  categories: [],
  tags: [],
})

const taxonomies = ref({
  categories: [],
  tags: [],
})

async function fetchTaxonomies() {

  const { data } =
    await axios.get('/.netlify/functions/filters')

  taxonomies.value = data
}

function apply() {
  emit('update', { ...filters.value })
}

function clear() {

  filters.value = {
    s: '',
    categories: [],
    tags: [],
  }

  apply()
}

onMounted(fetchTaxonomies)
</script>

<style scoped>
.resource-filters {
  background: #f3f3f3;
  padding: 1.5rem;
}

.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-btn {
  min-width: 125px;
  height: 48px;
  border-radius: 0 !important;
  border-width: 1px !important;
  text-transform: uppercase;
}

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
  text-transform: uppercase;
  color: #29465b;
}

:deep(.v-field--variant-outlined) {
  background: #fff;
  border-radius: 0;
}

:deep(.taxonomy-checkbox .v-label) {
  color: #29465b !important;
}

:deep(.taxonomy-checkbox .v-icon) {
  color: #29465b !important;
}

:deep(.v-field__input) {
  color: #29465b !important;
  -webkit-text-fill-color: #29465b !important;
}
</style>
