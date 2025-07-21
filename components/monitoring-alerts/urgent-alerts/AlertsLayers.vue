<template>
  <div class="map-container">
    <l-lwms-tile-layer
      v-if="currentUrlWmsAlerts && showFeaturesAlerts"
      ref="wmsLayer"
      :base-url="currentUrlWmsAlerts"
      :layers="geoserverLayerAlerts"
      format="image/png"
      :transparent="true"
      :z-index="3"
      :pane="'monitoring-layers-map'"
      :opacity="opacity / 100"
      :visible="showFeaturesAlerts"
      :options="{ ...AlertsWmsOptions, name: $t('legend-name') }"
    />
    <BaseAlert />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BaseAlert from '../../base/BaseAlert.vue';

export default {
  name: 'UrgentAlerts',
  components: { BaseAlert },
  props: {
    map: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    selectedAlertsFeature: null, // Feature selecionada no monitoramento
    heatmapLayer: null, // Camada de mapa de calor
  }),

  computed: {
    ...mapState('urgent-alerts', [
      'AlertsWmsOptions', // Opções da camada WMS
      'currentUrlWmsAlerts', // URL atual do WMS
      'showFeaturesAlerts', // Controla exibição das features
      'geoserverLayerAlerts', // Camada do GeoServer para monitoramento
      'resultsHeatmap', // Dados do mapa de calor
      'resultsHeatmapOptions', // Opções de configuração do heatmap
      'features', // Features GeoJSON
      'opacity', // Opacidade da camada
      'heatMap', // Controla exibição do heatmap
      'isLoadingFeatures', // Indicador de carregamento de features
    ]),
  },
  watch: {
    features: {
      handler(newFeatures) {
        if (this.isLoadingFeatures) {
          return;
        }
        // Processa features se existirem
        if (newFeatures && newFeatures.features && newFeatures.features.length > 0) {
          this.addFeatures();
        } else if (this.showFeaturesAlerts) {
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
    currentUrlWmsAlerts(newUrl) {
      // Atualiza a URL da camada WMS
      if (this.$refs.wmsLayer && newUrl) {
        this.$refs.wmsLayer.mapObject.setUrl(newUrl);
      }
      if (this.$refs.wmsLayerAlertsHeatmap) {
        this.$refs.wmsLayerAlertsHeatmap.mapObject.setUrl(newUrl);
      }
    },
    showFeaturesAlerts(newValue) {
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
        // Evita zoom se currentView estiver ativo
        if (!this.$store.state['urgent-alerts'].filters.currentView) {
          const bounds = this.$L.geoJSON(this.features).getBounds();
          if (bounds.isValid()) {
            this.map.flyToBounds(bounds, { duration: 1 });
          }
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
    "legend-name": "Urgent Alerts",
    "no-data-message": "No data available for the selected filters.",
    "name-layer-heatmap": "Daily Alerts - Heatmap"
  },
  "pt-br": {
    "detail-api-error": "Não foi possível obter os dados do polígono, entre em contato com um administrador se persistir.",
    "legend-name": "Alertas Urgente",
    "no-data-message": "Nenhum dado disponível para a(s) selecionada(s).",
    "name-layer-heatmap": "Alertas Urgente - Heatmap"
  }
}
</i18n>
