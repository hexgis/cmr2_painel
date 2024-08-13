<template>
  <div id="map" style="height: 40vh; width: 100%"></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet.markercluster'
import { mapGetters } from 'vuex'

export default {
  name: 'MapUsersViews',
  computed: {
      ...mapGetters('charts', ['getLocations']),
  },
  watch: {
      getLocations: {
          handler() {
              this.updateMarkers()
          },
          deep: true
      }
  },
  mounted() {
      this.initMap()
  },
  methods: {
      initMap() {
          this.map = L.map('map').setView([-9.8252678, -46.1602858], 4)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
          }).addTo(this.map)

          this.addMarkers()
      },
      addMarkers() {
          if (this.markerClusterGroup) {
              this.markerClusterGroup.clearLayers()
          } else {
              this.markerClusterGroup = L.markerClusterGroup()
          }

          const locations = this.getLocations || []
          locations.forEach(({ lat, lng, city }) => {
              const marker = L.marker([lat, lng]).bindPopup(
                  `<b>${city}</b><br>Latitude: ${lat}<br>Longitude: ${lng}`
              )
              this.markerClusterGroup.addLayer(marker)
          })

          this.map.addLayer(this.markerClusterGroup)
      },
      updateMarkers() {
          this.addMarkers()
      }
  }
}
</script>
