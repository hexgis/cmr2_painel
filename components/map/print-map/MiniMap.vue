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
  },

  data: () => ({
    map: null,
    miniMap: null,
    zoomMiniMap: 4,
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
      await this.aimingRect.setBounds(this.currentBouldMap);
    },

    mapCenter() {
      this.miniMap.setView(this.mapCenter, 4);
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
    },
  },

};
</script>
