<template>
  <div class="map-container">
    <l-lwms-tile-layer
      v-if="currentUrlWmsLandUse && showFeaturesLandUse"
      ref="wmsLayer"
      :base-url="currentUrlWmsLandUse"
      :layers="geoserverLayerLandUse"
      format="image/png"
      :transparent="true"
      :z-index="2"
      :opacity="opacity / 100"
      :visible="showFeaturesLandUse"
      :options="{ Legend: false, name: $t('legend-name') }"
    />
    <BaseAlert />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BaseAlert from '../base/BaseAlert.vue';

export default {
  name: 'LandUseLayers',
  components: { BaseAlert },
  props: {
    map: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapState('land-use', [
      'LandUseWmsOptions',
      'currentUrlWmsLandUse',
      'showFeaturesLandUse',
      'geoserverLayerLandUse',
      'features',
      'opacity',
      'loadingLandUse',
      'isLoadingFeatures',
    ]),
  },
  watch: {
    features: {
      handler(newFeatures) {
        if (this.loadingLandUse || this.isLoadingFeatures) {
          return;
        }
        if (newFeatures && newFeatures.features && newFeatures.features.length > 0) {
          this.addFeatures();
        } else if (this.showFeaturesLandUse) {
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
      if (newMap) {
        window.mapMain = newMap;
        this.addFeatures();
      }
    },

    currentUrlWmsLandUse(newUrl) {
      if (this.$refs.wmsLayer && newUrl) {
        this.$refs.wmsLayer.mapObject.setUrl(newUrl);
      }
    },

    showFeaturesLandUse(newValue) {
      if (!this.$refs.wmsLayer || !this.$refs.wmsLayer.mapObject || !this.map) {
        return;
      }
      const layer = this.$refs.wmsLayer.mapObject;
      if (typeof layer.setVisible === 'function') {
        layer.setVisible(newValue);
      } else {
        if (newValue) {
          layer.addTo(this.map);
        }
        if (!newValue) {
          layer.remove();
        }
      }
    },

    opacity(newOpacity) {
      if (this.$refs.wmsLayer && this.$refs.wmsLayer.mapObject) {
        this.$refs.wmsLayer.mapObject.setOpacity(newOpacity / 100);
      } else {
        console.warn('Camada WMS não inicializada ou mapObject não disponível');
      }
    },
  },

  methods: {
    addFeatures() {
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
        this.$store.commit('alert/add', {
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
    "legend-name": "LandUse",
    "no-data-message": "No data available for the selected filters."
  },
  "pt-br": {
    "detail-api-error": "Não foi possível obter os dados do polígono, entre em contato com um administrador se persistir.",
    "legend-name": "Uso e Ocupação do Solo",
    "no-data-message": "Nenhum dado disponível para a(s) selecionada(s)."
  }
}
</i18n>
