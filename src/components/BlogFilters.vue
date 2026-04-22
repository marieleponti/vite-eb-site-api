<template>
  <v-card class="pa-4">

    <!-- SEARCH -->
    <v-text-field
      v-model="filters.s"
      label="Search posts"
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-4"
    />

    <!-- Categories -->
    <v-expansion-panels multiple>
      <v-expansion-panel>
        <v-expansion-panel-title>
          Categories
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-checkbox
            v-for="cat in taxonomies.categories"
            :key="cat.id"
            v-model="filters.categories"
            :label="cat.name"
            :value="cat.id"
            density="compact"
            hide-details
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Tags -->
      <v-expansion-panel>
        <v-expansion-panel-title>
          Tags
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-checkbox
            v-for="tag in taxonomies.tags"
            :key="tag.id"
            v-model="filters.tags"
            :label="tag.name"
            :value="tag.id"
            density="compact"
            hide-details
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

    </v-expansion-panels>

    <!-- ACTIONS -->
    <div class="d-flex justify-space-between mt-4">
      <v-btn variant="text" @click="clear">
        Clear
      </v-btn>

      <v-btn color="primary" @click="apply">
        Apply
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
  tags: []
})

const taxonomies = ref({
  categories: [],
  tags: []
})

async function fetchTaxonomies() {
  const { data } = await axios.get('/wp-json/wp/v2/blog-filters')

  taxonomies.value = data
}

function apply() {
  emit('update', { ...filters.value })
}

function clear() {
  filters.value = {
    s: '',
    categories: [],
    tags: []
  }

  apply()
}

onMounted(fetchTaxonomies)
</script>