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
      :visible="showFeaturesAquaMM"
      :options="{...wmsOptions, name: $t('name-layer-aqua-mm')}"
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
      :visible="showFeaturesAquaMT"
      :options="{...wmsOptions, name: $t('name-layer-aqua-mt')}"
    />
  </div>
</template>

<i18n>
{
  "en": {
    "detail-api-error": "Error while retrieving polygon data, contact a system administrator in case it persists.",
    "name-layer-aqua-mm": "AQUA M-M Heat Focus",
    "name-layer-aqua-mt": "AQUA M-T Heat Focus"    
  },
  "pt-br": {
    "detail-api-error": "Não foi possível resgatar os dados do polígono, entre em contato com um administrador caso persista.",          
    "name-layer-aqua-mm": "Foco de Calor AQUA M-M",
    "name-layer-aqua-mt": "Foco de Calor AQUA M-T"
  }
}
</i18n>

<script>
import { mapState } from 'vuex'

export default {
  name: 'FocoLayers',

  computed: {
    ...mapState('foco', [
      'wmsOptions',
      'layers',
      'isLoadingFeatures',
    ]),
    
    currentUrlWmsAquaMM() {
      return this.layers.aquaMM.currentUrlWms;
    },
    currentUrlWmsAquaMT() {
      return this.layers.aquaMT.currentUrlWms;
    },
    showFeaturesAquaMM() {
      return this.layers.aquaMM.showFeatures;
    },
    showFeaturesAquaMT() {
      return this.layers.aquaMT.showFeatures;
    },
    geoserverLayerAquaMM() {
      return this.layers.aquaMM.geoserverLayer;
    },
    geoserverLayerAquaMT() {
      return this.layers.aquaMT.geoserverLayer;
    },
    opacityAquaMM() {
      return this.layers.aquaMM.opacity;
    },
    opacityAquaMT() {
      return this.layers.aquaMT.opacity;
    },
  },
};
</script>