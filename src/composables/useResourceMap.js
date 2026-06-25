/**
 * useResourceMap.js
 * -----------------------------------------------------------------------
 * Encapsula Leaflet: init del mapa, markers desde resources ya
 * normalizados por resourceMapper.js (campos: title, permalink, lat, lng),
 * y limpieza al desmontar.
 * -----------------------------------------------------------------------
 */
import { ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIconUrl from '@/assets/marker.svg'

const DEFAULT_CENTER = [32.5317397, -117.029]
const DEFAULT_ZOOM = 3

export function useResourceMap(containerRef, options = {}) {
  const map = ref(null)
  const markers = ref([])

  const customIcon = L.icon({
    iconUrl: markerIconUrl,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [-3, -30],
  })

  function init() {
    if (!containerRef.value || map.value) return

    map.value = L.map(containerRef.value, {
      center: options.center || DEFAULT_CENTER,
      zoom: options.zoom || DEFAULT_ZOOM,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.value)
  }

  /**
   * @param {Array<{title, permalink, lat, lng, locationLabel}>} resources
   * @param {{fit?: boolean, singleZoom?: number}} opts
   */
  function setMarkers(resources, { fit = true, singleZoom = 6 } = {}) {
    if (!map.value) return
    clearMarkers()

    resources.forEach((resource) => {
      if (resource.lat == null || resource.lng == null) return

      const marker = L.marker([resource.lat, resource.lng], { icon: customIcon })
        .bindPopup(buildPopupHtml(resource))
        .addTo(map.value)

      markers.value.push(marker)
    })

    if (markers.value.length === 0) return

    if (markers.value.length === 1) {
      map.value.setView(markers.value[0].getLatLng(), singleZoom)
    } else if (fit) {
      const group = L.featureGroup(markers.value)
      map.value.fitBounds(group.getBounds().pad(0.25), { maxZoom: 8 })
    }
  }

  function clearMarkers() {
    markers.value.forEach((m) => map.value?.removeLayer(m))
    markers.value = []
  }

  function invalidateSize() {
    map.value?.invalidateSize()
  }

  function destroy() {
    map.value?.remove()
    map.value = null
    markers.value = []
  }

  return { map, init, setMarkers, clearMarkers, invalidateSize, destroy }
}

function buildPopupHtml(resource) {
  const title = `<a class="inforepo-map-popup__title" href="${escapeAttr(resource.permalink)}">${escapeHtml(resource.title)}</a>`

  const location = resource.locationLabel
    ? `<div class="inforepo-map-popup__meta">${escapeHtml(resource.locationLabel)}</div>`
    : ''

  const cta = `<a class="inforepo-map-popup__cta" href="${escapeAttr(resource.permalink)}">View resource</a>`

  return `<div class="inforepo-map-popup">${title}${location}${cta}</div>`
}

function escapeHtml(str = '') {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function escapeAttr(str = '') {
  return String(str).replace(/"/g, '&quot;')
}