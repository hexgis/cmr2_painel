<template>
  <l-layer-group :visible="showFeatures">
    <l-feature-group
      ref="sceneGrid"
      name="sceneGrid"
    >
      <l-geo-json
        v-for="(scene, i) in allScenes"
        :key="i"
        :geojson="scene"
        :options-style="styles.default"
        :options="{ onEachFeature }"
        @mouseenter="setGrid(i)"
        @mouseleave="setGrid(null)"
      />
    </l-feature-group>

    <l-layer-group>
      <l-tile-layer
        v-for="(scene, i) in allScenes"
        :key="i"
        ref="tms"
        :tms="true"
        :url="
          scene.properties?.url_tms.replace('.xml', '.tms') +
            '/{z}/{x}/{y}.png'
        "
        :visible="scene.tmsVisible"
        :options="{
          zIndex: 2,
          maxZoom: 21,
          maxNativeZoom: scene.properties?.max_native_zoom || 15,
        }"
      />
    </l-layer-group>

    <l-layer-group name="bookmarkLayers">
      <template v-for="(bookmark, i) in bookmarks">
        <l-tile-layer
          v-for="layer in bookmark.catalogs"
          :key="i + layer.properties.image"
          ref="tms"
          :tms="true"
          :url="
            layer.properties?.url_tms.replace('.xml', '.tms') +
              '/{z}/{x}/{y}.png'
          "
          :visible="layer.visible"
          :options="{
            zIndex: 2,
            maxZoom: 21,
            maxNativeZoom: layer.properties?.max_native_zoom || 15,
          }"
        />
      </template>
    </l-layer-group>
  </l-layer-group>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

if (typeof window !== 'undefined') {
  require('leaflet-side-by-side');
}

export default {
  name: 'CatalogLayers',

  props: {
    map: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    selectedGridLayer: null,

    styles: {
      default: {
        weight: 1,
        color: '#4C527C',
        fill: null,
      },
      hover: {
        weight: 2.5,
        color: '#C2293D',
      },
    },

    sideBySideControl: null,
  }),

  computed: {
    allScenes() {
      return this.scenes.concat(this.otherPageScenes);
    },

    ...mapState('catalog', [
      'scenes',
      'otherPageScenes',
      'filters',
      'hoveredScene',
      'zoomedScene',
      'scenesToCompare',
      'isComparing',
      'showFeatures',
    ]),

    ...mapState('bookmarks', ['bookmarks']),
  },

  watch: {
    hoveredScene(scene) {
      this.contorlLayerHighlight(scene);
    },

    zoomedScene(scene) {
      if (scene !== null) {
        this.$refs.sceneGrid.mapObject.eachLayer((layer) => {
          if (
            layer.getLayers()[0].feature.properties.image
                        === this.scenes[scene].properties.image
          ) {
            this.map.flyToBounds(layer.getBounds());
          }
        });

        this.setZoomedScene(null);
      }
    },

    scenes() {
      this.$nextTick(() => {
        this.refreshSideBySide();
      });
    },

    map(value) {
      if (value) {
        this.refreshSideBySide();
      }
    },

    isComparing() {
      this.refreshSideBySide();
    },
  },

  methods: {
    setGrid(sceneIndex) {
      this.contorlLayerHighlight(sceneIndex);
      this.setHoveredGridScene(sceneIndex);
    },

    contorlLayerHighlight(scene) {
      if (scene !== null) {
        this.$refs.sceneGrid.mapObject.eachLayer((layer) => {
          if (
            layer.getLayers()[0].feature.properties.image
                        === this.scenes[scene].properties.image
          ) {
            this.highlightLayer(layer);
          }
        });
      } else if (this.selectedGridLayer) {
        this.clearHighlight();
      }
    },

    highlightLayer(layer) {
      if (this.selectedGridLayer) {
        this.selectedGridLayer.setStyle(this.styles.default);
      }
      this.selectedGridLayer = layer;
      this.selectedGridLayer.setStyle(this.styles.hover);
    },

    clearHighlight() {
      this.selectedGridLayer.setStyle(this.styles.default);
      this.selectedGridLayer = null;
    },

    onEachFeature(feature, layer) {
      layer.bindTooltip(feature.properties.locator, {
        permanent: true,
        direction: 'right',
        className: 'tooltip-grid',
      });
    },

    refreshSideBySide() {
      if (this.isComparing) {
        if (!this.sideBySideControl) {
          this.sideBySideControl = this.$L.control.sideBySide();
        }
        if (!this.sideBySideControl._map) {
          this.sideBySideControl.addTo(this.map);
          document
            .getElementsByClassName('leaflet-sbs-range')[0]
            .addEventListener('click', (event) => {
              event.stopPropagation();
            });
        }

        if (this.scenesToCompare.leftIndex != null) {
          let index = this.scenesToCompare.leftIndex;

          if (this.scenesToCompare.leftInOtherPage) {
            index += this.scenes.length;
          }

          const layer = this.$refs.tms[index].mapObject;
          this.sideBySideControl.setLeftLayers(layer);
        } else {
          this.sideBySideControl.setLeftLayers(null);
        }
        if (this.scenesToCompare.rightIndex != null) {
          let index = this.scenesToCompare.rightIndex;

          if (this.scenesToCompare.rightInOtherPage) {
            index += this.scenes.length;
          }

          const layer = this.$refs.tms[index].mapObject;
          this.sideBySideControl.setRightLayers(layer);
        } else {
          this.sideBySideControl.setRightLayers(null);
        }
      } else if (this.sideBySideControl) {
        this.sideBySideControl.remove(this.map);
      }
    },

    ...mapMutations('catalog', ['setZoomedScene', 'setHoveredGridScene']),
  },
};
</script>

<style lang="sass">
.tooltip-grid
    border-radius: 50% !important
    width: 52px
    height: 52px
    display: flex
    align-items: center
    border: none !important
    background-color: #4c527c !important
    color: #fff !important
    font-size: 12px !important
    margin: 0 -1.7rem !important
    opacity: 1 !important
</style>
