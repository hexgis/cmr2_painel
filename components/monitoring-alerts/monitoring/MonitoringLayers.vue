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

  data: () => ({}),

  computed: {
    ...mapGetters('monitoring', [
      'getLayerMonitoring',
      'getOpacity',
      'getUrlWmsMonitoring',
    ]),
    ...mapState('monitoring', [
      'urlWmsMonitoring',
      'showFeaturesMonitoring',
    ]),
  },

  watch: {
    getUrlWmsMonitoring(newVal) {
      this.$refs.wmsLayer.mapObject.setUrl(newVal);
    },
  },

  methods: {},
};
</script>
