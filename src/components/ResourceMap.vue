<template>
  <v-card flat class="resource-map-card">
    <v-alert
      v-if="!loading && resourcesWithCoords.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      No hay recursos con ubicación cargada todavía.
    </v-alert>

    <div ref="mapEl" class="resource-map-card__canvas" aria-label="Mapa de recursos"></div>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useResourceMap } from '@/composables/useResourceMap'

const props = defineProps({
  resources: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  // true cuando este mapa está visible en pantalla (controlado por el
  // padre, p. ej. con v-show). Leaflet calcula mal su tamaño si se
  // inicializa o actualiza mientras está display:none.
  visible: { type: Boolean, default: true },
})

const mapEl = ref(null)
const { init, setMarkers, invalidateSize, destroy } = useResourceMap(mapEl)

const resourcesWithCoords = computed(() =>
  props.resources.filter((r) => r.lat != null && r.lng != null)
)

onMounted(() => {
  init()
  setMarkers(resourcesWithCoords.value)
})

watch(resourcesWithCoords, (list) => setMarkers(list))

watch(
  () => props.visible,
  (visible) => {
    if (visible) requestAnimationFrame(() => invalidateSize())
  }
)

onBeforeUnmount(() => destroy())
</script>

<style scoped>
.resource-map-card {
  background: transparent;
}

.resource-map-card__canvas {
  height: 600px;
  width: 100%;
  border-radius: 4px;
  z-index: 0; /* evita que el mapa quede por encima de overlays/nav de Vuetify */
}
</style>