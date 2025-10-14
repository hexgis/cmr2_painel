<template>
  <l-lwms-tile-layer
    ref="wmsLayer"
    :base-url="getUrlWmsMonitoring"
    :layers="getLayerMonitoring"
    format="image/png"
    :transparent="true"
    :z-index="3"
    :pane="'monitoring-layers-map'"
    :opacity="getOpacity"
    :visible="showFeaturesMonitoring"
    :options="{ Legend: false, name: $t('legend-name') }"
  />
</template>

<i18n>
{
  "en": {
    "legend-name": "Monitoring"
  },
  "pt-br": {
    "legend-name": "Monitoramento Diário"
  }
}
</i18n>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'MonitoringLayers',

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
    ...mapGetters('monitoring', [
      'getLayerMonitoring',
      'getOpacity',
      'getUrlWmsMonitoring',
    ]),
    ...mapState('monitoring', [
      'showFeaturesMonitoring',
      'heatMapMonitoring',
      'stats',
    ]),
  },

  watch: {
    getUrlWmsMonitoring(newVal) {
      this.$refs.wmsLayer.mapObject.setUrl(newVal);
    },

    heatMapMonitoring(newVal) {
      if (newVal) this.createMonitoramentoHeatLayer();
      else this.removeMonitoramentoHeatLayer();
    },
  },

  methods: {
    createMonitoramentoHeatLayer() {
      this.removeMonitoramentoHeatLayer();
      this.heatmapLayer = this.$L.heatLayer(
        this.stats.heatmapMonitoring,
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
