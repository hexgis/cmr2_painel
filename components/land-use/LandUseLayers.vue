<template>
  <l-lwms-tile-layer
    ref="wmsLayer"
    :base-url="getUrlWmsLandUse"
    :layers="getLayerLandUse"
    format="image/png"
    :transparent="true"
    :z-index="3"
    :pane="'monitoring-layers-map'"
    :opacity="getOpacity"
    :visible="showFeaturesLandUse"
    :options="{ Legend: false, name: $t('legend-name') }"
  />
</template>

<i18n>
{
  "en": {
    "legend-name": "Urgent Alert"
  },
  "pt-br": {
    "legend-name": "Alerta Urgente"
  }
}
</i18n>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'LandUseLayers',

  data: () => ({
    resultsHeatmapOptions: {
      minOpacity: 0.5,
      maxZoom: 18,
      radius: 20,
      blur: 15,
      zIndex: 4,
    },
    heatmapLayer: null,
  }),

  computed: {
    ...mapGetters('land-use', [
      'getLayerLandUse',
      'getOpacity',
      'getUrlWmsLandUse',
    ]),
    ...mapState('land-use', [
      'showFeaturesLandUse',
      'heatMapLandUse',
      'stats',
    ]),
  },

  watch: {
    getUrlWmsLandUse(newVal) {
      this.$refs.wmsLayer.mapObject.setUrl(newVal);
    },

    heatMapLandUse(newVal) {
      if (newVal) this.createMonitoramentoHeatLayer();
      else this.removeMonitoramentoHeatLayer();
    },
  },

  methods: {
    createMonitoramentoHeatLayer() {
      this.removeMonitoramentoHeatLayer();
      this.heatmapLayer = this.$L.heatLayer(
        this.stats.heatmapLandUse,
        this.resultsHeatmapOptions,
      );
      window.mapMain.addLayer(this.heatmapLayer);
    },

    removeMonitoramentoHeatLayer() {
      if (this.heatmapLayer) {
        window.mapMain.removeLayer(this.heatmapLayer);
        this.heatmapLayer = null;
      }
    },
  },
};
</script>
