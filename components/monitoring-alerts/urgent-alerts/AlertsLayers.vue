<template>
  <l-lwms-tile-layer
    ref="wmsLayer"
    :base-url="getUrlWmsUrgentAlert"
    :layers="getLayerUrgentAlert"
    format="image/png"
    :transparent="true"
    :z-index="3"
    :pane="'monitoring-layers-map'"
    :opacity="getOpacity"
    :visible="showFeaturesUrgentAlert"
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
  name: 'UrgentAlertLayers',

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
    ...mapGetters('urgent-alerts', [
      'getLayerUrgentAlert',
      'getOpacity',
      'getUrlWmsUrgentAlert',
    ]),
    ...mapState('urgent-alerts', [
      'showFeaturesUrgentAlert',
      'heatMapUrgentAlert',
      'stats',
    ]),
  },

  watch: {
    getUrlWmsUrgentAlert(newVal) {
      this.$refs.wmsLayer.mapObject.setUrl(newVal);
    },

    heatMapUrgentAlert(newVal) {
      if (newVal) this.createMonitoramentoHeatLayer();
      else this.removeMonitoramentoHeatLayer();
    },
  },

  methods: {
    createMonitoramentoHeatLayer() {
      this.removeMonitoramentoHeatLayer();
      this.heatmapLayer = this.$L.heatLayer(
        this.stats.heatmapUrgentAlert,
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
