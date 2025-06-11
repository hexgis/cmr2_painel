<template>
  <div class="map-container">
    <!-- Camada WMS de Monitoramento -->
    <l-lwms-tile-layer
      v-if="currentUrlWmsMonitoring && showFeaturesMonitoring"
      ref="wmsLayer"
      :base-url="currentUrlWmsMonitoring"
      :layers="geoserverLayerMonitoring"
      format="image/png"
      :transparent="true"
      :z-index="3"
      :pane="'monitoring-layers-map'"
      :opacity="opacity / 100"
      :visible="showFeaturesMonitoring"
      :options="{ Legend: false, name: $t('legend-name') }"
    />
    <!-- Componente de Alerta -->
    <BaseAlert />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BaseAlert from '../base/BaseAlert.vue';

export default {
  name: 'MonitoringLayers',
  components: { BaseAlert },
  props: {
    map: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    selectedMonitoringFeature: null, // Feature selecionada no monitoramento
    heatmapLayer: null, // Camada de mapa de calor
  }),
  computed: {
    ...mapState('monitoring', [
      'MonitoringWmsOptions', // Opções da camada WMS
      'currentUrlWmsMonitoring', // URL atual do WMS
      'showFeaturesMonitoring', // Controla exibição das features
      'geoserverLayerMonitoring', // Camada do GeoServer para monitoramento
      'geoserverLayerMonitoringHeatmap', // Camada do GeoServer para heatmap
      'MonitoringWmsOptionsHeatmap', // Opções da camada WMS do heatmap
      'resultsHeatmap', // Dados do mapa de calor
      'resultsHeatmapOptions', // Opções de configuração do heatmap
      'features', // Features GeoJSON
      'opacity', // Opacidade da camada
      'loadingMonitoring', // Indicador de carregamento
      'heatMap', // Controla exibição do heatmap
      'isLoadingFeatures', // Indicador de carregamento de features
    ]),
  },
  watch: {
    features: {
      handler(newFeatures) {
        // Evita executar durante carregamento
        if (this.loadingMonitoring || this.isLoadingFeatures) return;
        if (newFeatures && newFeatures.features && newFeatures.features.length > 0) {
          this.addFeatures();
        } else if (this.showFeaturesMonitoring) {
          this.$store.commit('alert/addAlert', {
            message: this.$t('no-data-message'),
            type: 'info',
            timeout: 5000,
          });
        }
      },
      deep: true,
      immediate: false,
    },
    map(newMap) {
      // Configura o mapa global e adiciona features
      if (newMap) {
        window.mapMain = newMap;
        this.addFeatures();
      }
    },
    currentUrlWmsMonitoring(newUrl) {
      // Atualiza a URL da camada WMS
      if (this.$refs.wmsLayer && newUrl) {
        this.$refs.wmsLayer.mapObject.setUrl(newUrl);
      }
      if (this.$refs.wmsLayerMonitoringHeatmap) {
        this.$refs.wmsLayerMonitoringHeatmap.mapObject.setUrl(newUrl);
      }
    },
    showFeaturesMonitoring(newValue) {
      // Gerencia visibilidade da camada WMS e heatmap
      if (newValue && this.heatMap) this.createMonitoramentoHeatLayer();
      else if (!newValue && this.heatmapLayer) this.map.removeLayer(this.heatmapLayer);

      if (!this.$refs.wmsLayer || !this.$refs.wmsLayer.mapObject || !this.map) return;

      const layer = this.$refs.wmsLayer.mapObject;
      if (typeof layer.setVisible === 'function') {
        layer.setVisible(newValue);
      } else if (newValue) layer.addTo(this.map);
      else layer.remove();
    },
    heatMap(value) {
      // Adiciona ou remove a camada de heatmap
      if (value) this.createMonitoramentoHeatLayer();
      else if (this.heatmapLayer) this.map.removeLayer(this.heatmapLayer);
    },
    resultsHeatmap(newResults) {
    // Se o mapa de calor está ativo, recria a camada com os novos dados
      if (this.heatMap && newResults) {
        if (this.heatmapLayer) {
          this.map.removeLayer(this.heatmapLayer);
        }
        this.createMonitoramentoHeatLayer();
      }
    },
    opacity(newOpacity) {
      // Atualiza a opacidade da camada WMS
      if (this.$refs.wmsLayer && this.$refs.wmsLayer.mapObject) {
        this.$refs.wmsLayer.mapObject.setOpacity(newOpacity / 100);
      } else {
        console.warn('Camada WMS não inicializada ou mapObject não disponível');
      }
    },
  },
  methods: {
    flyTo() {
      // Ajusta o mapa para os limites das features
      const bounds = this.$L.geoJSON(this.features).getBounds();
      if (bounds.getNorthEast() && bounds.getSouthWest()) {
        this.map.flyToBounds(bounds);
      }
    },
    createMonitoramentoHeatLayer() {
      // Cria e adiciona a camada de heatmap
      this.heatmapLayer = this.$L.heatLayer(this.resultsHeatmap, this.resultsHeatmapOptions);
      this.map.addLayer(this.heatmapLayer);
    },
    addFeatures() {
      // Adiciona features ao mapa e ajusta os limites
      if (
        !this.map
        || !this.features
        || !this.features.features
        || !this.features.features.length
      ) {
        return;
      }
      try {
        const bounds = this.$L.geoJSON(this.features).getBounds();
        if (bounds.isValid()) {
          this.map.flyToBounds(bounds, { duration: 1 });
        }
      } catch (error) {
        console.error('Erro ao ajustar bounds do mapa:', error);
        this.$store.commit('alert/addAlert', {
          message: this.$t('detail-api-error'),
          type: 'error',
          timeout: 5000,
        });
      }
    },
  },
};
</script>

<style scoped>
.map-container {
  position: relative;
  height: 100%;
}
</style>

<i18n>
{
  "en": {
    "detail-api-error": "Error while retrieving polygon data, contact a system administrator if it persists.",
    "legend-name": "Monitoring",
    "no-data-message": "No data available for the selected filters.",
    "name-layer-heatmap": "Daily Monitoring - Heatmap"
  },
  "pt-br": {
    "detail-api-error": "Não foi possível obter os dados do polígono, entre em contato com um administrador se persistir.",
    "legend-name": "Monitoramento Diário",
    "no-data-message": "Nenhum dado disponível para a(s) selecionada(s).",
    "name-layer-heatmap": "Monitoramento Diário - Heatmap"
  }
}
</i18n>
