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
        <p class="ma-1 pl-1 pr-1 print-mini-map-text">
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
    },

    mapCenter() {
      if (!this.miniMap || !this.mapCenter) return;
      const curCenter = (this.miniMap && typeof this.miniMap.getCenter === 'function')
        ? this.miniMap.getCenter()
        : null;
      const curZoom = (this.miniMap && typeof this.miniMap.getZoom === 'function')
        ? this.miniMap.getZoom()
        : undefined;
      const sameCenter = curCenter
        && Math.abs(curCenter.lat - this.mapCenter.lat) < 1e-6
        && Math.abs(curCenter.lng - this.mapCenter.lng) < 1e-6;

      if (sameCenter) return;
      if (typeof this.miniMap.panTo === 'function') {
        this.miniMap.panTo(this.mapCenter);
      } else if (typeof this.miniMap.setView === 'function') {
        if (typeof curZoom === 'number') this.miniMap.setView(this.mapCenter, curZoom);
      }
    },

    // When only the zoom changes on the main map, keep the mini map in sync
    mainZoom() {
      if (!this.miniMap) return;
      const targetZoom = this.computeMiniZoom();
      const curZoom = (this.miniMap && typeof this.miniMap.getZoom === 'function')
        ? this.miniMap.getZoom()
        : undefined;
      if (curZoom !== targetZoom && typeof this.miniMap.setZoom === 'function') {
        this.miniMap.setZoom(targetZoom);
      }
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

    computeMiniZoom() {
      const currentMiniZoom = (this.miniMap && typeof this.miniMap.getZoom === 'function') ? this.miniMap.getZoom() : this.zoomMiniMap;
      const baseZoom = typeof this.mainZoom === 'number' ? this.mainZoom : currentMiniZoom;

      const mapMax = (this.miniMap && typeof this.miniMap.getMaxZoom === 'function') ? this.miniMap.getMaxZoom() : 21;
      const mapMin = (this.miniMap && typeof this.miniMap.getMinZoom === 'function') ? this.miniMap.getMinZoom() : 0;

      let z = baseZoom - this.zoomOffset;
      if (z > mapMax) z = mapMax;
      if (z < mapMin) z = mapMin;
      return z;
    },
  },
};
</script>
