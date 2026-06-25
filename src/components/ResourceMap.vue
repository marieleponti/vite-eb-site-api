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

<!--
  SIN "scoped" a propósito: Leaflet inyecta el HTML del popup directo al
  DOM (bindPopup), sin pasar por el compilador de Vue — el scoping de
  Vue no le llega, así que estas reglas tienen que ser globales.
-->
<style>
.leaflet-popup-content-wrapper {
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.leaflet-popup-content {
  margin: 14px 16px;
}

.leaflet-popup-tip {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.inforepo-map-popup {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
}

.inforepo-map-popup__title {
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.3;
  text-decoration: none;
}

/* Leaflet trae su propia regla ".leaflet-container a { color: #0078A8 }"
   con más especificidad que una sola clase — por eso el color no pegaba
   antes. Esto la gana combinando selectores (y el !important como
   refuerzo, por si tu CSS global agrega todavía más especificidad). */
.leaflet-popup-content a.inforepo-map-popup__title {
  color: #29465b !important;
}

.inforepo-map-popup__title:hover {
  text-decoration: underline;
}

.inforepo-map-popup__meta {
  font-size: 0.8rem;
  color: #6b7280;
}

.inforepo-map-popup__cta {
  margin-top: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-decoration: none;
}

.leaflet-popup-content a.inforepo-map-popup__cta {
  color: #2f4356 !important;
}

.inforepo-map-popup__cta:hover {
  text-decoration: underline;
}
</style>