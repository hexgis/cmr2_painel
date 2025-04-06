<template>
  <l-layer-group :visible="showFeaturesSupportLayers">
    <l-feature-group ref="feats">
      <l-popup
        :options="{
          minWidth: 420,
          maxHeight: 420,
          className: 'card-popup',
        }"
      >
        <v-card>
          <v-card-title class="mb-10 popup-card-title">
            {{ $t('popup-title') }}
          </v-card-title>
          <v-card-text>
            <v-row
              v-for="(value, field) in feature"
              :key="field"
            >
              <v-col
                class="font-weight-black py-2 px-2 ml-3"
                align="left"
              >
                {{ field }}
              </v-col>
              <v-col
                class="align-end py-1 px-2 mr-3"
                align="right"
              >
                {{ value || '-' }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </l-popup>
    </l-feature-group>
  </l-layer-group>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    map: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      vectorGrid: [],
      feature: null,
    };
  },

  computed: {
    ...mapState('map', ['fileList']),

    ...mapState('supportLayers', ['showFeaturesSupportLayers']),
  },

  watch: {
    'fileList.length': {
      deep: true,
      handler(newLength, oldLength) {
        this.addFeatureVector(newLength > oldLength);
      },
    },
  },

  methods: {
    hasGeometryOnFeature(feature, geometries) {
      return (
        feature.features.some((f) => geometries.includes(f.geometry.type)) || false
      );
    },
    addFeatureVector(shouldFlyTo) {
      this.$refs.feats.mapObject.eachLayer((layer) => {
        layer.remove();
      });

      this.vectorGrid = [];

      if (this.fileList.length) {
        this.fileList.forEach((f) => {
          let newGrid;
          const { color, opacity } = f;

          if (
            this.hasGeometryOnFeature(f.feature, [
              'Point',
              'MultiPoint',
              'Polygon',
              'MultiPolygon',
              'LineString',
              'MultiLineString',
              'GeometryCollection',
              'CircularString',
              'CompoundCurve',
              'CurvePolygon',
              'MultiCurve',
              'MultiSurface',
              'PolyhedralSurface',
              'TIN',
              'Triangle',
            ])
          ) {
            newGrid = this.$L
              .geoJSON(f.feature, {
                pointToLayer: (_, latlng) => this.$L.circleMarker(latlng),
                onEachFeature: (feature, layer) => {
                  layer.on({
                    click: (_) => (this.feature = feature.properties || null),
                  });
                  layer.setStyle({
                    color,
                    fillColor: color,
                    fillOpacity: opacity,
                    fill: ![
                      'LineString',
                      'MultiLineString',
                    ].includes(feature.geometry.type),
                    radius: 6,
                  });
                },
              })
              .addTo(this.$refs.feats.mapObject)
              .bringToFront();
          } else {
            newGrid = this.$L.vectorGrid
              .slicer(f.feature, {
                maxZoom: 21,
                zIndex: 1,
                vectorTileLayerStyles: {
                  sliced: () => ({
                    color,
                    fillColor: color,
                    fillOpacity: opacity,
                    fill: false,
                    radius: 6,
                  }),
                },
                interactive: true,
                getFeatureId: (_) => 1,
              })
              .on('click', (e) => {
                this.feature = e.layer.properties || null;
              })
            // .addTo(this.$refs.feats.mapObject)
              .bringToFront();
          }

          this.vectorGrid.push(newGrid);
        });

        if (shouldFlyTo) {
          const bounds = this.$L
            .geoJSON(this.fileList.at(-1).feature)
            .getBounds();

          if (bounds.getNorthEast() && bounds.getSouthWest()) {
            this.map.flyToBounds(bounds);
          }
        }

        this.$emit('loads');
      }
    },
  },
};
</script>

<i18n>
{
    "en":{
        "popup-title": "Properties"
    },
    "pt-br": {
        "popup-title": "Propriedades"
    }
}
</i18n>
<style scoped lang="sass">
.popup-card
  padding: 15px 10px

.popup-card-title
  background: #DA2A3F
  color: whitesmoke
</style>
