<template>
  <client-only>
    <l-map
      id="miniPrintMap"
      ref="miniPrintMap"
      :zoom="zoomMiniMap"
      :options="optionsMiniMap"
    >
      <l-tile-layer
        url="//{s}.tile.osm.org/{z}/{x}/{y}.png"
        :attribution="attribution"
      />
      <l-control
        position="topleft"
        class="ma-0 pa-0"
      >
        <p
          class="ma-1 px-1 print-mini-map-text text-center"
          style="background-color: white; opacity: 0.7; width: 150px;"
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
    zoomMiniMap: 4,
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
    createMap() {
      this.miniMap = this.$refs.miniPrintMap.mapObject;
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
