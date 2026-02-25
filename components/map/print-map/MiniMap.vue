<template>
  <client-only>
    <l-map
      id="miniPrintMap"
      ref="miniPrintMap"
      class="minimap-for-print"
      :zoom="zoomMiniMap"
      :options="optionsMiniMap"
    >
      <l-tile-layer
        url="//{s}.tile.osm.org/{z}/{x}/{y}.png"
        :attribution="attribution"
        :options="{ noWrap: true }"
      />
      <l-control
        position="topleft"
        class="ma-0 pa-0"
      >
        <p
          class="ma-1 px-1 print-mini-map-text text-center"
          style="background-color: white; opacity: 0.7; min-width: 150px; max-width: 500px;"
        >
          LOCALIZAÇÃO DA ÁREA
        </p>
      </l-control>
    </l-map>
  </client-only>
</template>

<script>

export default {
  props: {
    currentBouldMap: {
      type: Object,
      default: null,
    },
    mapCenter: {
      type: Object,
      default: null,
    },
    mainZoom: {
      type: Number,
      default: null,
    },
  },

  data: () => ({
    map: null,
    miniMap: null,
    zoomMiniMap: 0,
    zoomOffset: 4,
    attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | <span style="color: red; font-weight: bold; width: 100%">Mapa não oficial</span>',

    optionsMiniMap: {
      name: 'printMiniMap',
      zoomControl: false,
      dragging: false,
      boxZoom: false,
      touchZoom: false,
      keyboard: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    },

  }),

  watch: {
    async currentBouldMap() {
      if (!this.aimingRect || !this.currentBouldMap) return;
      await this.aimingRect.setBounds(this.currentBouldMap);
      this.miniMap.fitBounds(this.currentBouldMap, {
        padding: [10, 10],
        animate: false,
      });

      const targetZoom = this.computeMiniZoom();
      if (this.miniMap.getZoom() !== targetZoom) {
        this.miniMap.setZoom(targetZoom);
      }
    },

    mapCenter() {
      this.updateMiniMapView();
    },

    mainZoom() {
      this.updateMiniMapView();
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.createMap();
    });
  },

  methods: {
    setMinZoomToFitContainer() {
      if (!this.miniMap) return;
      
      this.$nextTick(() => {
        try {
          const mapContainer = this.miniMap.getContainer();
          if (!mapContainer) return;

          const containerWidth = mapContainer.offsetWidth;
          const containerHeight = mapContainer.offsetHeight;

          const worldWidth = 256;
          const zoomLevelForWidth = Math.log2(containerWidth / worldWidth);
          const zoomLevelForHeight = Math.log2(containerHeight / worldWidth);
          
          const minZoom = Math.ceil(Math.max(zoomLevelForWidth, zoomLevelForHeight));
          
          this.miniMap.setMinZoom(Math.max(0, minZoom));
          
          if (this.miniMap.getZoom() < minZoom) {
            this.miniMap.setZoom(minZoom);
          }
        } catch (error) {
          console.warn('Erro ao calcular zoom mínimo do minimapa:', error);
          this.miniMap.setMinZoom(1);
        }
      });
    },

    createMap() {
      this.miniMap = this.$refs.miniPrintMap.mapObject;
      this.$emit('ready', this.miniMap);
      
      this.setMinZoomToFitContainer();
      
      this.aimingRect = this.$L.rectangle(this.currentBouldMap, {
        color: '#e31a1c',
        weight: 3,
        opacity: 0.37,
        fillOpacity: 0,
      }).addTo(this.miniMap);
      this.miniMap.fitBounds(this.currentBouldMap);
      if (typeof this.mainZoom === 'number') {
        const targetZoom = this.computeMiniZoom();
        const curZoom = (this.miniMap && typeof this.miniMap.getZoom === 'function')
          ? this.miniMap.getZoom()
          : undefined;
        if (curZoom !== targetZoom && typeof this.miniMap.setZoom === 'function') {
          this.miniMap.setZoom(targetZoom);
        }
      }
    },

    updateMiniMapView() {
      if (!this.miniMap) return;

      this.setMinZoomToFitContainer();
      const targetZoom = this.computeMiniZoom();

      if (this.currentBouldMap) {
        this.miniMap.fitBounds(this.currentBouldMap);
        this.miniMap.setZoom(targetZoom);
      } else if (this.mapCenter) {
        this.miniMap.setView(this.mapCenter, targetZoom);
      }
    },

    computeMiniZoom() {
      const baseZoom = typeof this.mainZoom === 'number' ? this.mainZoom : this.zoomMiniMap;

      const z = baseZoom - this.zoomOffset;
      const max = this.miniMap.getMaxZoom() || 21;
      const min = this.miniMap.getMinZoom() || 0;

      return Math.max(min, Math.min(max, z));
    },
  },
};
</script>
<style lang="css" scoped>
.minimap-for-print{
    width: 100% !important;
    height: 100% !important;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden !important;
}

#printMap{
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
}

.leaflet-container{
    width: 100% !important;
    height: 100% !important;
    background: white !important;
    background-repeat: no-repeat !important;
    overflow: hidden !important;
}

#miniPrintMap {
    width: 100% !important;
    height: 100% !important;
    min-height: 150px;
    overflow: hidden !important;
}

.print-mini-map-text {
    font-weight: bold !important;
    line-height: 1.2 !important;
    padding: 2px 4px !important;
}

@media print {
    .minimap-for-print {
        max-width: none !important;
        max-height: none !important;
        width: 100% !important;
        height: auto;
    }
}
</style>
