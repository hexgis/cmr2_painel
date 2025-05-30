<template>
  <div>
    <l-lwms-tile-layer
      v-if="currentUrlWmsLandUse && showFeaturesLandUse"
      ref="wmsLayerLandUse"
      :base-url="currentUrlWmsLandUse"
      :layers="geoserverLayerLandUse"
      format="image/png"
      :transparent="true"
      :z-index="3"
      :opacity="opacity / 100"
      :visible="showFeaturesLandUse"
      :options="{ ...LandUseWmsOptions, name: $t('name-layer') }"
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
    ]),
  },

  watch: {
    features: {
      handler(newFeatures) {
        if (this.loadingLandUse) {
          // Não faz nada enquanto a pesquisa está carregando
          return;
        }

        if (newFeatures && newFeatures.features && newFeatures.features.length > 0) {
          this.addFeatures();
        } else if (this.showFeaturesLandUse) {
          this.$store.commit('alert/addAlert', {
            message: this.$t('no-data-message'),
            type: 'info',
          });
        }
      },
      deep: true, // Observa mudanças profundas no objeto features
      immediate: false,
    },

    map() {
      this.addFeatures();
    },

    currentUrlWmsLandUse() {
      if (this.$refs.wmsLayerLandUse) {
        this.$refs.wmsLayerLandUse.mapObject.setUrl(this.currentUrlWmsLandUse);
      }
    },

    loadingLandUse(newValue) {
      // Forçar verificação de features quando loadingLandUse mudar para false
      if (!newValue && this.showFeaturesLandUse) {
        if (!this.features || !this.features.features || this.features.features.length === 0) {
          this.$store.commit('alert/addAlert', {
            message: this.$t('no-data-message'),
            timeout: 5000,
            type: 'info',
          });
        }
      }
    },
  },

  methods: {
    addFeatures() {
      if (!this.features || !this.features.features || !this.features.features.length) {
        // No features to add
      }
      // Adicione lógica para manipular features, se necessário
    },

    flyTo() {
      const bounds = this.$L.geoJSON(this.features && this.features.features).getBounds();
      if (bounds.isValid()) {
        this.map.flyToBounds(bounds);
      }
    },
  },
};
</script>

<i18n>
{
  "en": {
    "detail-api-error": "Error while retrieving polygon data, contact a system administrator in case it persists.",
    "name-layer": "LandUse",
    "no-data-message": "No data available for the selected filters."
  },
  "pt-br": {
    "detail-api-error": "Não foi possível resgatar os dados do polígono, entre em contato com um administrador caso persista.",
    "name-layer": "Uso e Ocupação do Solo",
    "no-data-message": "Nenhum dado disponível para a(s) região(s) selecionado(s)."
  }
}
</i18n>
