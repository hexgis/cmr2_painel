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
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'LandUseLayers',

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
    ]),
    ...mapGetters('land-use', ['featuresLoaded']),
  },

  watch: {
    features() {
      if (this.features && this.features.features) {
        this.addFeatures();
      } else {
        console.warn('No features to load');
      }
    },

    map() {
      this.addFeatures();
    },

    currentUrlWmsLandUse() {
      if (this.$refs.wmsLayerLandUse) {
        this.$refs.wmsLayerLandUse.mapObject.setUrl(
          this.currentUrlWmsLandUse,
        );
      }
    },
  },

  methods: {
    addFeatures() {
      if (!this.features || !this.features.features) {
        // No features to add
      }
      // Add logic here to handle features if needed
    },

    createGeoJsonLayer() {
      const filteredFeatures = { ...this.features };

      return this.$L.geoJSON(filteredFeatures, {
        style: (feature) => {
          const appliedStyle = this.setLandUseStyle(feature);
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
            "name-layer": "LandUse"
        },
        "pt-br": {
            "detail-api-error": "Não foi possível resgatar os dados do polígono, entre em contato com um administrador caso persista.",
            "name-layer": "Uso e Ocupação do Solo"
        }
    }
</i18n>
