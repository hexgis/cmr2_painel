<template>
  <div>
    <l-lwms-tile-layer
      v-if="currentUrlWmsAquaMM && showFeaturesAquaMM"
      ref="wmsLayerAquaMM"
      :base-url="currentUrlWmsAquaMM"
      :layers="geoserverLayerAquaMM"
      format="image/png"
      :transparent="true"
      :z-index="3"
      :opacity="opacityAquaMM / 100"
      :options="{ ...wmsOptions, name: $t('name-layer-aqua-mm') }"
      @ready="onLayerReady('aquaMM')"
    />
    <l-lwms-tile-layer
      v-if="currentUrlWmsAquaMT && showFeaturesAquaMT"
      ref="wmsLayerAquaMT"
      :base-url="currentUrlWmsAquaMT"
      :layers="geoserverLayerAquaMT"
      format="image/png"
      :transparent="true"
      :z-index="3"
      :opacity="opacityAquaMT / 100"
      :options="{ ...wmsOptions, name: $t('name-layer-aqua-mt') }"
      @ready="onLayerReady('aquaMT')"
    />
    <BaseAlert />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BaseAlert from '@/components/base/BaseAlert.vue';

export default {
  name: 'FocoLayers',

  components: {
    BaseAlert,
  },

  computed: {
    ...mapState('foco', ['wmsOptions', 'layers', 'isLoadingFeatures']),

    currentUrlWmsAquaMM() {
      console.log('[FocoLayers] currentUrlWmsAquaMM:', this.layers.aquaMM.currentUrlWms);
      return this.layers.aquaMM.currentUrlWms;
    },
    currentUrlWmsAquaMT() {
      console.log('[FocoLayers] currentUrlWmsAquaMT:', this.layers.aquaMT.currentUrlWms);
      return this.layers.aquaMT.currentUrlWms;
    },
    showFeaturesAquaMM() {
      console.log('[FocoLayers] showFeaturesAquaMM:', this.layers.aquaMM.showFeatures);
      return this.layers.aquaMM.showFeatures;
    },
    showFeaturesAquaMT() {
      console.log('[FocoLayers] showFeaturesAquaMT:', this.layers.aquaMT.showFeatures);
      return this.layers.aquaMT.showFeatures;
    },
    geoserverLayerAquaMM() {
      console.log('[FocoLayers] geoserverLayerAquaMM:', this.layers.aquaMM.geoserverLayer);
      return this.layers.aquaMM.geoserverLayer;
    },
    geoserverLayerAquaMT() {
      console.log('[FocoLayers] geoserverLayerAquaMT:', this.layers.aquaMT.geoserverLayer);
      return this.layers.aquaMT.geoserverLayer;
    },
    opacityAquaMM() {
      console.log('[FocoLayers] opacityAquaMM:', this.layers.aquaMM.opacity);
      return this.layers.aquaMM.opacity;
    },
    opacityAquaMT() {
      console.log('[FocoLayers] opacityAquaMT:', this.layers.aquaMT.opacity);
      return this.layers.aquaMT.opacity;
    },
  },

  methods: {
    onLayerReady(layer) {
      console.log(`[FocoLayers] Camada ${layer} pronta para renderização`);
    },
  },
};
</script>

<i18n>
{
  "en": {
    "detail-api-error": "Error while retrieving polygon data, contact a system administrator in case it persists.",
    "name-layer-aqua-mm": "AQUA M-M - Heat Focus",
    "name-layer-aqua-mt": "AQUA M-T - Heat Focus",
    "no-data-message": "No data available for the selected filters."
  },
  "pt-br": {
    "detail-api-error": "Não foi possível resgatar os dados do polígono, entre em contato com um administrador caso persista.",
    "name-layer-aqua-mm": "Foco de Calor - AQUA MODIS (M)",
    "name-layer-aqua-mt": "Foco de Calor - AQUA MODIS (T)",
    "no-data-message": "Nenhum dado disponível para os filtros selecionados."
  }
}
</i18n>
