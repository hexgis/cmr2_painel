<template>
  <v-dialog
    v-model="dialogValue"
    fullscreen
  >
    <v-card>
      <v-toolbar color="secondary">
        <v-toolbar-title style="color: white;">
          {{ $t('compare') }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          :aria-label="$t('close')"
          @click="closeDialog"
          @keydown.enter="closeDialog"
          @keydown.space="closeDialog"
        >
          <v-icon color="white">
            mdi-close
          </v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text style="padding: 0;">
        <div class="container-compare">
          <v-row
            no-gutters
            style="height: calc(100vh - 64px);"
          >
            <!-- Map Container - Left Side -->
            <v-col cols="9">
              <div
                id="mapContainer"
                ref="mapContainer"
                style="height: 100%; position: relative; width: 100%;"
                role="application"
                :aria-label="$t('comparison-map')"
                tabindex="0"
              >
                <LoadingState
                  v-if="!mapsInitialized"
                  :message="$t('loading-maps')"
                />
              </div>
            </v-col>

            <!-- Layer Info Panel - Right Side -->
            <v-col
              cols="3"
              class="layer-info-panel"
            >
              <v-card
                flat
                height="100%"
                class="d-flex flex-column"
                role="complementary"
                :aria-label="$t('layer-information-panel')"
              >
                <v-card-title class="pa-3 subtitle-1">
                  <v-icon left>
                    mdi-layers
                  </v-icon>
                  {{ $t('layers-in-comparison') }}
                </v-card-title>

                <v-divider />

                <div class="flex-grow-1 overflow-y-auto">
                  <!-- Both Layers Side by Side -->
                  <v-row
                    v-if="layersToCompare.left || layersToCompare.right"
                    no-gutters
                    class="ma-1"
                  >
                    <!-- Left Layer Info -->
                    <v-col
                      cols="6"
                      class="pr-1"
                    >
                      <LayerCard
                        :layer="layersToCompare.left"
                        side="left"
                        :layer-preview="getLayerPreview(layersToCompare.left)"
                        :layer-type="getLayerType(layersToCompare.left)"
                        :layer-group="leftLayerGroup"
                      />
                    </v-col>

                    <!-- Right Layer Info -->
                    <v-col
                      cols="6"
                      class="pl-1"
                    >
                      <LayerCard
                        :layer="layersToCompare.right"
                        side="right"
                        :layer-preview="getLayerPreview(layersToCompare.right)"
                        :layer-type="getLayerType(layersToCompare.right)"
                        :layer-group="rightLayerGroup"
                      />
                    </v-col>
                  </v-row>

                  <!-- Empty State -->
                  <EmptyState
                    v-if="!layersToCompare.left && !layersToCompare.right"
                    :message="$t('no-layers-selected')"
                  />
                </div>

                <!-- Instructions -->
                <v-divider />
                <v-card-text class="pa-3 text-center">
                  <div class="caption grey--text">
                    <v-icon
                      small
                      class="mr-1"
                    >
                      mdi-drag-horizontal
                    </v-icon>
                    {{ $t('drag-instruction') }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<i18n>
{
  "en": {
    "compare": "Compare layers",
    "close": "Close dialog",
    "comparison-map": "Interactive map for layer comparison",
    "layer-information-panel": "Layer information and comparison controls",
    "drag-instruction": "Drag the bar to compare layers",
    "loading-maps": "Loading comparison maps...",
    "layers-in-comparison": "Layers in Comparison",
    "no-layers-selected": "No layers selected for comparison",
    "unknown": "Unknown",
    "deter-alerts": "DETER - Deforestation Alerts",
    "hotspots": "Hotspots",
    "daily-monitoring": "Daily Monitoring",
    "urgent-alerts": "Urgent Alerts",
    "prodes-deforestation": "PRODES - Annual Deforestation"
  },
  "pt-br": {
    "compare": "Comparar camadas",
    "close": "Fechar diálogo",
    "comparison-map": "Mapa interativo para comparação de camadas",
    "layer-information-panel": "Informações das camadas e controles de comparação",
    "drag-instruction": "Arraste a barra para comparar camadas",
    "loading-maps": "Carregando mapas de comparação...",
    "layers-in-comparison": "Camadas em Comparação",
    "no-layers-selected": "Nenhuma camada selecionada para comparação",
    "unknown": "Desconhecido",
    "deter-alerts": "DETER - Alertas de Desmatamento",
    "hotspots": "Focos de Calor",
    "daily-monitoring": "Monitoramento Diário",
    "urgent-alerts": "Alertas Urgentes",
    "prodes-deforestation": "PRODES - Desmatamento Anual"
  }
}
</i18n>

<script>
import { mapState } from 'vuex';
import tmsLegend from '../../assets/tmsLegend.png';
import LayerCard from './LayerCard.vue';
import LoadingState from './LoadingState.vue';
import EmptyState from './EmptyState.vue';

const cloneLayer = require('leaflet-clonelayer');

export default {
  name: 'RasterCompare',

  components: {
    LayerCard,
    LoadingState,
    EmptyState,
  },

  data: () => ({
    mapsInitialized: false,
    map: null,
    baseLayer: null,
  }),

  computed: {
    dialogValue: {
      get() {
        return this.openCompare;
      },
      set(value) {
        if (!value) {
          // Modal is being closed, clear selected layers
          this.$store.commit('raster/clearLayersToCompare');
        }
        this.$store.commit('raster/setOpenCompare', value);
      },
    },

    leftLayerGroup() {
      if (!this.layersToCompare.left) return null;
      return this.findGroupForLayer(this.layersToCompare.left.id);
    },

    rightLayerGroup() {
      if (!this.layersToCompare.right) return null;
      return this.findGroupForLayer(this.layersToCompare.right.id);
    },

    ...mapState('raster', [
      'layersToCompare',
      'openCompare',
      'supportCategoryGroupsRaster',
    ]),
  },

  watch: {
    openCompare(newVal) {
      if (newVal) this.initializeMaps();
      else {
        // Modal closed, clean up maps
        this.cleanupMaps();
        this.$store.commit('raster/clearLayersToCompare');
      }
    },
  },

  beforeDestroy() {
    this.cleanupMaps();
  },

  methods: {
    closeDialog() {
      this.cleanupMaps();
      // Clear the selected layers for comparison
      this.$store.commit('raster/clearLayersToCompare');
      // Close the comparison modal
      this.$store.commit('raster/setOpenCompare', false);
    },

    async initializeMaps() {
      await this.$nextTick();

      const mapElement = document.getElementById('mapContainer');
      if (!mapElement) {
        return;
      }

      // Get current map center and zoom from main map if available
      const { center, zoom } = this.getMainMapViewport();

      // Create single map as component instance
      this.map = this.$L.map('mapContainer', {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      this.createMapPanes();

      // Add base tile layer
      let baseLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      let baseLayerOptions = {};
      if (this.$store.state.map.currentBaseMap && this.$store.state.map.currentBaseMap.url) {
        baseLayerUrl = this.$store.state.map.currentBaseMap.url;
        baseLayerOptions = this.$store.state.map.currentBaseMap.options || { attribution: '' };
      }
      this.baseLayer = this.$L.tileLayer(baseLayerUrl, baseLayerOptions);
      this.baseLayer.addTo(this.map);

      this.map.whenReady(() => {
        this.cloneLayersFromMainMap();
        this.initializeSideBySideControl();
      });

      this.mapsInitialized = true;
    },

    createMapPanes() {
      if (!this.map) return;

      // TMS (base layer custom)
      this.map.createPane('tms-support-layers-map');
      this.map.getPane('tms-support-layers-map').style.zIndex = 401;

      // Support WMS
      this.map.createPane('support-layers-map');
      this.map.getPane('support-layers-map').style.zIndex = 420;

      // Monitoring WMS
      this.map.createPane('monitoring-layers-map');
      this.map.getPane('monitoring-layers-map').style.zIndex = 450;

      // Comparison layers pane
      this.map.createPane('comparison-layers');
      this.map.getPane('comparison-layers').style.zIndex = 500;
    },

    cloneLayersFromMainMap() {
      if (!window.mapMain) return;
      window.mapMain.eachLayer((layer) => {
        // eslint-disable-next-line no-underscore-dangle
        if (!layer || !layer._events) return;
        try {
          const clonedLayer = cloneLayer(layer);
          if (clonedLayer) {
            this.map.addLayer(clonedLayer);
          } else {
            console.warn('Falha ao clonar camada:', layer);
          }
        } catch (cloneError) {
          console.error('Erro ao clonar camada:', cloneError);
        }
      });
      const heatmaps = [
        {
          active: this.$store.state['urgent-alerts'].heatMapUrgentAlert,
          data: this.$store.state['urgent-alerts'].stats.heatmapUrgentAlert,
          options: this.$store.state['urgent-alerts'].heatMapUrgentAlertOptions,
        },
        {
          active: this.$store.state.monitoring.showFeaturesMonitoring,
          data: this.$store.state.monitoring.stats.heatmapMonitoring,
          options: this.$store.state.monitoring.heatMapMonitoringOptions,
        },
      ];
      heatmaps.forEach(({ active, data, options }) => {
        if (active && data && data.length && options) {
          this.map.addLayer(this.$L.heatLayer(data, options));
        }
      });
    },

    getMainMapViewport() {
      let center = [-15.7801, -47.9292]; // Default to Brazil center
      let zoom = 5;

      if (window.mapMain && window.mapMain.getCenter) {
        center = [window.mapMain.getCenter().lat, window.mapMain.getCenter().lng];
        zoom = window.mapMain.getZoom();
      }

      return { center, zoom };
    },

    initializeSideBySideControl() {
      // Create side-by-side control if both layers exist
      if (this.$L.control && this.$L.control.sideBySide) {
        try {
          let left;
          let right;

          this.map.eachLayer((layer) => {
            if (layer.options.name === this.layersToCompare.left.name) {
              left = layer;
            }
            if (layer.options.name === this.layersToCompare.right.name) {
              right = layer;
            }
          });

          this.$L.control.sideBySide(left, right).addTo(this.map);
        } catch (error) {
          console.error(error);
        }
      }
    },

    getLayerPreview(layer) {
      try {
        if (!layer) return null;
        // For TMS layers, check if it has thumbnail_blob first, then fallback to legend
        if (layer.layer_type === 'tms') {
          if (layer.thumbnail_blob) {
            return `data:image/png;base64,${layer.thumbnail_blob}`;
          }
          return tmsLegend;
        }

        // For WMS layers, check if it has thumbnail_blob first
        if (layer.layer_type === 'wms') {
          if (layer.thumbnail_blob) {
            return `data:image/png;base64,${layer.thumbnail_blob}`;
          }

          // Fallback to geoserver preview URL if no thumbnail_blob
          if (layer.wms) {
            const hasRequiredData = layer.wms.geoserver
              && layer.wms.geoserver.thumbnail_url
              && layer.wms.geoserver_layer_namespace
              && layer.wms.geoserver_layer_name;

            if (hasRequiredData) {
              const layerName = `${layer.wms.geoserver_layer_namespace}:${layer.wms.geoserver_layer_name}`;

              // Check if URL already has authkey parameter
              if (layer.wms.geoserver.thumbnail_url.includes('authkey=')) {
                return `${layer.wms.geoserver.thumbnail_url}&layers=${layerName}&width=80`;
              }
              return `${layer.wms.geoserver.thumbnail_url}?layers=${layerName}&width=80`;
            }
          }
        }

        return null;
      } catch (error) {
        // Error getting layer preview
        return null;
      }
    },

    getLayerType(layer) {
      if (!layer) return 'Desconhecido';

      switch (layer.layer_type) {
        case 'wms':
          return 'WMS (Web Map Service)';
        case 'tms':
          return 'TMS (Tile Map Service)';
        case 'heatmap':
          return 'Mapa de Calor';
        default:
          return layer.layer_type ? layer.layer_type.toUpperCase() : 'Desconhecido';
      }
    },

    findGroupForLayer(layerId) {
      // Find the group that contains this layer
      const groups = Object.values(this.supportCategoryGroupsRaster || {});
      return groups.find((group) => group.layers && group.layers.includes(layerId)) || null;
    },

    ensureLayerVisibility(layer) {
      if (!layer.visible) {
        this.$store.commit('raster/toggleLayerVisibilityRaster', {
          id: layer.id,
          visible: true,
        });
      }
    },

    cleanupMaps() {
      if (this.baseLayer && this.map) {
        this.map.removeLayer(this.baseLayer);
        this.baseLayer = null;
      }

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.mapsInitialized = false;
    },
  },
};
</script>

<style scoped>
/* Main container styles */
.container-compare {
  position: relative;
  width: 100%;
  height: 100%;
}

#mapContainer {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Layer Info Panel Styles */
.layer-info-panel {
  background-color: #f5f5f5;
  border-left: 1px solid #e0e0e0;
}

/* Layer name styles with consistent sizing */
.layer-name,
.layer-name-compact {
  font-weight: 500;
  color: #333;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-name {
  font-size: 14px;
}

.layer-name-compact {
  font-size: 12px;
  height: 32px;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

/* Layer details with consistent sizing */
.layer-details {
  font-size: 12px;
}

.layer-details-compact {
  font-size: 10px;
}

/* Detail item styles */
.detail-item {
  margin-bottom: 4px;
  line-height: 1.3;
}

.detail-item-compact {
  margin-bottom: 2px;
  line-height: 1.2;
}

.detail-item strong,
.detail-item-compact strong {
  color: #555;
}

/* Leaflet side-by-side control customization */
.leaflet-sbs-divider {
  background-color: #D42A3E !important;
  width: 4px !important;
  z-index: 999 !important;
}

.leaflet-sbs-range:hover {
  background-color: #B8233A !important;
}

.leaflet-sbs-divider,
.leaflet-sbs-range {
  position: absolute !important;
}

/* Custom scrollbar for better UX */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive design improvements */
@media (max-width: 768px) {
  .layer-info-panel {
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }

  .layer-name-compact {
    font-size: 11px;
    height: 28px;
  }

  .layer-details-compact {
    font-size: 9px;
  }
}

/* Accessibility improvements */
.layer-info-panel:focus-within {
  outline: 2px solid #2196F3;
  outline-offset: -2px;
}

#mapContainer:focus {
  outline: 2px solid #2196F3;
  outline-offset: -2px;
}

/* Loading and empty state improvements */
.loading-container,
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Transition animations for better UX */
.layer-card-transition {
  transition: all 0.3s ease;
}

.layer-card-transition:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .layer-info-panel {
    background-color: #ffffff;
    border-color: #000000;
  }

  .layer-name,
  .layer-name-compact {
    color: #000000;
  }

  .leaflet-sbs-divider {
    background-color: #ff0000 !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .layer-card-transition,
  .overflow-y-auto::-webkit-scrollbar-thumb {
    transition: none;
  }
}
</style>
