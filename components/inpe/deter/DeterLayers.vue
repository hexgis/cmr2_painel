<template>
  <div>
    <l-lwms-tile-layer
      v-if="currentUrlWmsDeter && showFeaturesDeter"
      ref="wmsLayerDeter"
      :base-url="currentUrlWmsDeter"
      :layers="geoserverLayerDeter"
      format="image/png"
      :transparent="true"
      :z-index="3"
      :opacity="opacity / 100"
      :visible="showFeaturesDeter"
      :options="{ ...DeterWmsOptions, name: $t('name-layer') }"
    />
    <BaseAlert />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import BaseMetadataPopup from '@/components/base/BaseMetadataPopup';
import BaseAlert from '@/components/base/BaseAlert.vue';

export default {
  name: 'DeterLayers',

  components: {
    BaseMetadataPopup,
    BaseAlert,
  },

  props: {
    map: {
      type: Object,
      default: null,
    },
  },

  computed: {
    ...mapState('deter', [
      'DeterWmsOptions',
      'currentUrlWmsDeter',
      'showFeaturesDeter',
      'geoserverLayerDeter',
      'features',
      'opacity',
    ]),
    ...mapGetters('deter', ['featuresLoaded']),
  },

  watch: {
    features() {
      if (!this.features) {
        // Estado inicial, não faz nada
        return;
      }
      if (this.features.features && this.features.features.length > 0) {
        this.addFeatures();
      } else if (this.showFeaturesDeter) {
        // Exibe alerta igual no MonitoringLayers
        this.$store.commit('alert/addAlert', {
          message: this.$t('no-data-message'),
          type: 'info',
          timeout: 5000,
        });
      }
    },

    map() {
      this.addFeatures();
    },

    currentUrlWmsDeter() {
      if (this.$refs.wmsLayerDeter) {
        this.$refs.wmsLayerDeter.mapObject.setUrl(
          this.currentUrlWmsDeter,
        );
      }
    },
  },

  methods: {
     addFeatures() {
      if (!this.features || !this.features.features || this.features.features.length === 0) {
        return;
      }
      try {
        if (!this.$store.state.prodes.filters?.currentView) {
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

    createGeoJsonLayer() {
      const filteredFeatures = { ...this.features };
      return this.$L.geoJSON(filteredFeatures, {
        style: (feature) => {
          const appliedStyle = this.setDeterStyle(feature);
          return appliedStyle;
        },
      });
    },

    flyTo() {
      const bounds = this.$L
        .geoJSON(this.features && this.features.length)
        .getBounds();
      if (bounds.getNorthEast() && bounds.getSouthWest()) {
        this.map.flyToBounds(bounds);
      }
    },
  },
};
</script>

<i18n>
    {
        "en": {
            "detail-api-error": "Error while retrieving polygon data, contact a system administrator in case it persists." ,
            "name-layer": "Deter",
            "no-data-message": "No data available for the selected filters."
        },
        "pt-br": {
            "detail-api-error": "Não foi possível resgatar os dados do polígono, entre em contato com um administrador caso persista.",
             "name-layer": "Deter",
             "no-data-message": "Nenhum dado disponível para os filtros selecionados."
        }
    }
</i18n>
