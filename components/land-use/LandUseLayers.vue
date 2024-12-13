<template>
  <l-layer-group
    name="monitoring"
    :visible="showFeaturesLandUse"
  >
    <l-layer-group
      ref="LandUseHeat"
      :visible="heatMap"
    />

    <l-feature-group ref="landUsePolygons">
      <l-popup
        ref="popup"
        :options="{
          minWidth: 500,
          className: 'card-popup',
        }"
      >
        <BaseMetadataPopup
          ref="popupComponent"
          :feature="selectedLandUseFeature"
        />
      </l-popup>

      <l-geo-json
        v-if="!isVectorGrid && featuresLoaded"
        :geojson="features"
        :options="{ onEachFeature }"
        @ready="onLandUseReady"
      />
    </l-feature-group>
  </l-layer-group>
</template>

<i18n>
{
    "en": {
        "detail-api-error": "Error while retrieving polygon data, contact a system administrator in case it persists."
    },
    "pt-br": {
        "detail-api-error": "Não foi possível resgatar os dados do polígono, entre em contato com um administrador caso persista."
    }
}
</i18n>

<script>
import { mapState, mapGetters } from 'vuex';

import BaseMetadataPopup from '@/components/base/BaseMetadataPopup';

if (typeof window !== 'undefined') {
  require('leaflet.vectorgrid');
  require('leaflet.heat');
}

export default {
  name: 'LandUseLayers',

  components: {
    BaseMetadataPopup,
  },

  props: {
    map: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    selectedLandUseFeature: null,
    heatmapLayer: null,

    isVectorGrid: process.env.MONITORING_VECTOR2TILES === 'true',
    vectorGrid: null,

    style: {
      VI: {
        weight: 2.5,
        color: '#bf8040',
        fill: true,
        fillOpacity: 1,
      },
      CR: {
        weight: 2.5,
        color: '#ff3333',
        fill: true,
        fillOpacity: 1,
      },
      MA: {
        weight: 2.5,
        color: '#1affff',
        fill: true,
        fillOpacity: 1,
      },
      AG: {
        weight: 2.5,
        color: '#ffff00',
        fill: true,
        fillOpacity: 1,
      },
      VN: {
        weight: 2.5,
        color: '#2eb82e',
        fill: true,
        fillOpacity: 1,
      },
    },
  }),

  computed: {
    ...mapState('land-use', [
      'features',
      'opacity',
      'heatMap',
      'showFeaturesLandUse',
    ]),
    ...mapGetters('land-use', ['featuresLoaded']),
  },

  watch: {
    features() {
      this.addFeatures();
    },

    map() {
      this.addFeatures();
    },

    opacity() {
      if (this.isVectorGrid) {
        this.vectorGrid.setFeatureStyle(1, {
          ...this.style.VN,
          fillOpacity: this.opacity / 100,
        });
        this.vectorGrid.setFeatureStyle(2, {
          ...this.style.AG,
          fillOpacity: this.opacity / 100,
        });
        this.vectorGrid.setFeatureStyle(3, {
          ...this.style.MA,
          fillOpacity: this.opacity / 100,
        });
        this.vectorGrid.setFeatureStyle(4, {
          ...this.style.CR,
          fillOpacity: this.opacity / 100,
        });
        this.vectorGrid.setFeatureStyle(5, {
          ...this.style.VI,
          fillOpacity: this.opacity / 100,
        });
        this.vectorGrid.redraw();
      } else {
        this.$refs.landUsePolygons.mapObject.invoke(
          'setStyle',
          this.setLandUseStyle,
        );
      }
    },
  },

  methods: {
    vectorGridStyleFunction(no_estagio) {
      switch (no_estagio) {
        case 'VI':
          return this.style.VI;
        case 'CR':
          return this.style.CR;
        case 'MA':
          return this.style.MA;
        case 'AG':
          return this.style.AG;
        case 'VN':
          return this.style.VN;
      }
    },

    addFeatures() {
      this.$refs.landUsePolygons.mapObject.clearLayers();
      if (
        this.isVectorGrid
                && this.features
                && this.features.features
                && this.features.features.length
      ) {
        this.createLandUseHeatLayer();
        this.flyTo();
        this.vectorGrid = this.$L.vectorGrid
          .slicer(this.features, {
            maxZoom: 21,
            zIndex: 4,
            vectorTileLayerStyles: {
              sliced: (e) => this.vectorGridStyleFunction(e.no_estagio),
            },
            interactive: true,
            getFeatureId: (e) => {
              switch (e.properties.no_estagio) {
                case 'VI':
                  return 5;
                case 'CR':
                  return 4;
                case 'MA':
                  return 3;
                case 'AG':
                  return 2;
                case 'VN':
                  return 1;
              }
            },
          })
          .on('click', (e) => {
            this.getFeatureDetails(e.layer.properties.id);
          })
          .addTo(this.$refs.landUsePolygons.mapObject);
      }
    },

    onEachFeature(feature, layer) {
      layer.setStyle(this.setLandUseStyle(feature));

      layer.on('click', () => {
        this.getFeatureDetails(feature.properties.id);
      });
    },

    setLandUseStyle(feature) {
      const { style } = this;
      style.fillOpacity = this.opacity / 100;

      switch (feature.properties.stage) {
        case 'Agropecuária':
          style.color = '#ffff00';
          break;
        case 'Massa de Água':
          style.color = '#66ffff';
          break;
        case 'Vilarejo':
          style.color = '#cc9966';
          break;
        case 'Vegetação Natural':
          style.color = '#00cc00';
          break;
      }
      return style;
    },

    onLandUseReady() {
      if (this.features.features && this.features.features.length) {
        this.map.fitBounds(
          this.$refs.landUsePolygons.mapObject.getBounds(),
        );
        this.createLandUseHeatLayer();
      }
    },

    async getFeatureDetails(featureId) {
      this.selectedLandUseFeature = null;

      try {
        this.selectedLandUseFeature = await this.$api.$get(
          `land-use/detail/${featureId}/`,
        );
      } catch (exception) {
        this.$store.commit('alert/addAlert', {
          message: this.$t('detail-api-error'),
        });
      }
    },

    flyTo() {
      const bounds = this.$L.geoJSON(this.features).getBounds();
      if (bounds.getNorthEast() && bounds.getSouthWest()) { this.map.flyToBounds(bounds); }
    },

    createLandUseHeatLayer() {
      const areas = this.features.features.map(
        (feature) => feature.properties.area_ha,
      );
      const maxArea = Math.max.apply(null, areas);
      const heatData = [];

      this.features.features.forEach((feature) => {
        heatData.push([
          feature.properties.nu_latitude,
          feature.properties.nu_longitude,
          feature.properties.nu_area_km2 / maxArea,
        ]);
      });

      if (this.heatmapLayer) { this.heatmapLayer.removeFrom(this.$refs.LandUseHeat.mapObject); }

      this.heatmapLayer = this.$L.heatLayer(heatData, {
        minOpacity: 0.5,
        maxZoom: 18,
        radius: 20,
        blur: 15,
        zIndex: 4,
      });
      this.heatmapLayer.addTo(this.$refs.LandUseHeat.mapObject);
    },
  },
};
</script>
