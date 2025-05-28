<template>
  <l-layer-group
    name="priorities"
    :visible="showFeatures"
  >
    <l-layer-group
      ref="priorityHeat"
      :visible="heatMap"
    />

    <l-feature-group ref="priorityPolygons">
      <l-popup
        ref="popup"
        :options="{
          minWidth: 500,
          className: 'card-popup',
        }"
      >
        <BaseMetadataPopup
          ref="popupComponent"
          :feature="selectedMonitoringFeature"
        />
      </l-popup>

      <l-geo-json
        v-if="!isVectorGrid && featuresLoaded"
        :geojson="features"
        :options="{ onEachFeature }"
      />
    </l-feature-group>
  </l-layer-group>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import BaseMetadataPopup from '@/components/base/BaseMetadataPopup';

export default {
  name: 'PriorityLayers',

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
    selectedMonitoringFeature: null,
    heatmapLayer: null,
    isVectorGrid: process.env.MONITORING_VECTOR2TILES === 'true',
    style: {
      lowest: {
        weight: 2.5,
        color: '#008000', // Green
        fill: true,
        fillOpacity: null,
      },
      low: {
        weight: 2.5,
        color: '#FFD700', // Gold
        fill: true,
        fillOpacity: null,
      },
      medium: {
        weight: 2.5,
        color: '#FF8C00', // DarkOrange
        fill: true,
        fillOpacity: null,
      },
      high: {
        weight: 2.5,
        color: '#FF0000', // red
        fill: true,
        fillOpacity: null,
      },
      highest: {
        weight: 2.5,
        color: '#9400D3', // DarkViolet
        fill: true,
        fillOpacity: null,
      },
    },
  }),

  computed: {
    ...mapState('priority', [
      'showFeatures',
      'features',
      'opacity',
      'heatMap',
    ]),
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
          ...this.style.lowest,
          fillOpacity: this.opacity / 100,
        });
        this.vectorGrid.setFeatureStyle(2, {
          ...this.style.low,
          fillOpacity: this.opacity / 100,
        });
        this.vectorGrid.setFeatureStyle(3, {
          ...this.style.medium,
          fillOpacity: this.opacity / 100,
        });
        this.vectorGrid.setFeatureStyle(4, {
          ...this.style.high,
          fillOpacity: this.opacity / 100,
        });
        this.vectorGrid.setFeatureStyle(5, {
          ...this.style.highest,
          fillOpacity: this.opacity / 100,
        });
      } else {
        this.$refs.monitoringPolygons.mapObject.invoke(
          'setStyle',
          this.setMonitoringStyle,
        );
      }
    },
  },

  methods: {
    vectorGridStyleFunction(priority) {
      Object.keys(this.style).forEach((item) => {
        Object.keys(this.style[item]).forEach((i) => {
          if (i == 'fillOpacity') {
            this.style[item][i] = this.opacity / 100;
          }
        });
      });

      switch (priority) {
        case 'Muito Alta':
          return this.style.highest;
        case 'Alta':
          return this.style.high;
        case 'Media':
          return this.style.medium;
        case 'Baixa':
          return this.style.low;
        default:
        case 'Muito Baixa':
          return this.style.lowest;
      }
    },
    addFeatures() {
      this.$refs.priorityPolygons.mapObject.clearLayers();
      if (this.isVectorGrid && this.featuresLoaded()) {
        this.createMonitoramentoHeatLayer();
        this.flyTo();

        this.vectorGrid = this.$L.vectorGrid
          .slicer(this.features, {
            maxZoom: 21,
            zIndex: 4,
            vectorTileLayerStyles: {
              sliced: (e) => this.vectorGridStyleFunction(e.prioridade),
            },
            interactive: true,
            getFeatureId: (e) => {
              switch (e.properties.prioridade) {
                case 'Muito Alta':
                  return 5;
                case 'Alta':
                  return 4;
                case 'Media':
                  return 3;
                case 'Baixa':
                  return 2;
                default:
                  return 1;
              }
            },
          })
          .on('click', (e) => {
            this.getFeatureDetails(e.layer.properties.id);
          })
          .addTo(this.$refs.priorityPolygons.mapObject);
      }
    },

    onEachFeature(feature, layer) {
      layer.setStyle(this.setMonitoringStyle(feature));

      layer.on('click', () => {
        this.getFeatureDetails(feature.properties.id);
      });
    },

    async getFeatureDetails(featureId) {
      this.selectedMonitoringFeature = null;

      try {
        this.selectedMonitoringFeature = await this.$api.$get(
          `priority/consolidated/detail/${featureId}/`,
        );
      } catch (exception) {
        this.$store.commit('alert/addAlert', {
          message: this.$t('detail-api-error'),
        });
      }
    },

    setMonitoringStyle(feature) {
      const { style } = this;
      style.fillOpacity = this.opacity / 100;

      switch (feature.properties.stage) {
        case 'CR':
          style.color = '#965213';
          break;
        case 'DR':
          style.color = '#337f1e';
          break;
        case 'FF':
          style.color = '#ba1a1a';
          break;
        case 'DG':
          style.color = '#e0790b';
          break;
      }
      return style;
    },

    flyTo() {
      const bounds = this.$L.geoJSON(this.features).getBounds();
      if (bounds.getNorthEast() && bounds.getSouthWest()) { this.map.flyToBounds(bounds); }
    },

    createMonitoramentoHeatLayer() {
      const areas = this.features.features.map(
        (feature) => feature.properties.nu_area_km2,
      );
      const maxArea = Math.max.apply(null, areas);

      const heatData = [];
      this.features.features.forEach((feature) => {
        heatData.push([
          feature.properties.nu_latitude,
          feature.properties.nu_longitude,
          feature.properties.nu_area_km2 / maxArea, // normalize by maximum area
        ]);
      });

      if (this.heatmapLayer) { this.heatmapLayer.removeFrom(this.$refs.priorityHeat.mapObject); }

      this.heatmapLayer = this.$L.heatLayer(heatData, {
        minOpacity: 0.5,
        maxZoom: 18,
        radius: 20,
        blur: 15,
        zIndex: 4,
      });

      this.heatmapLayer.addTo(this.$refs.priorityHeat.mapObject);
    },

    ...mapGetters('priority', ['featuresLoaded']),
  },
};
</script>

<style lang="sass" scoped></style>
