<template>
  <v-dialog
    v-model="dialogValue"
    fullscreen
    transition="dialog-bottom-transition"
    :aria-labelledby="dialogTitle"
    role="dialog"
    aria-modal="true"
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
import {
  getLayerTypeName,
  validateWmsLayer,
  validateTmsLayer,
  createWmsOptions,
  createTmsOptions,
  createSpecializedStoreLayer,
} from '~/utils/layer';

export default {
  name: 'RasterCompare',

  components: {
    LayerCard,
    LoadingState,
    EmptyState,
  },

  data: () => ({
    mapsInitialized: false,
    syncingMaps: false,
    map: null,
    baseLayer: null,
    leftLayer: null,
    rightLayer: null,
    sideBySideControl: null,
    initializationTimeout: null,
  }),

  computed: {
    ...mapState('raster', ['layersToCompare', 'openCompare', 'supportCategoryGroupsRaster']),

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

    dialogTitle() {
      return 'dialog-title';
    },
  },

  watch: {
    openCompare(newVal) {
      if (newVal) {
        // Modal opened, initialize maps with debounce
        this.debouncedInitializeMaps();
      } else {
        // Modal closed, cleanup maps and clear selected layers
        this.cleanupMaps();
        this.$store.commit('raster/clearLayersToCompare');
      }
    },

    // Watch for layer changes and reinitialize if needed
    layersToCompare: {
      handler() {
        if (this.openCompare && this.mapsInitialized) {
          this.debouncedReinitializeLayers();
        }
      },
      deep: true,
    },
  },

  mounted() {
    // Component mounted
  },

  beforeDestroy() {
    // Clean up maps when component is destroyed
    this.cleanupMaps();
  },

  methods: {
    // Debounced methods for performance optimization
    debouncedInitializeMaps() {
      if (this.initializationTimeout) {
        clearTimeout(this.initializationTimeout);
      }
      this.initializationTimeout = setTimeout(() => {
        this.$nextTick(() => {
          this.initializeMaps();
        });
      }, 100);
    },

    debouncedReinitializeLayers() {
      if (this.initializationTimeout) {
        clearTimeout(this.initializationTimeout);
      }
      this.initializationTimeout = setTimeout(() => {
        this.reinitializeLayers();
      }, 200);
    },

    reinitializeLayers() {
      try {
        // Remove existing comparison layers
        if (this.leftLayer && this.map) {
          this.map.removeLayer(this.leftLayer);
          this.leftLayer = null;
        }
        if (this.rightLayer && this.map) {
          this.map.removeLayer(this.rightLayer);
          this.rightLayer = null;
        }
        if (this.sideBySideControl) {
          this.sideBySideControl.remove();
          this.sideBySideControl = null;
        }

        // Re-add comparison layers
        this.addComparisonLayers();
        this.initializeSideBySideControl();
      } catch (error) {
        console.error(error);
      }
    },
    closeDialog() {
      this.cleanupMaps();
      // Clear the selected layers for comparison
      this.$store.commit('raster/clearLayersToCompare');
      // Close the comparison modal
      this.$store.commit('raster/setOpenCompare', false);
    },

    async initializeMaps() {
      try {
        await this.$nextTick();

        // Check if Leaflet is available
        if (typeof this.$L === 'undefined') {
          return;
        }

        // Check if Leaflet WMS plugin is available
        if (typeof this.$L.tileLayer.wms === 'undefined') {
          return;
        }

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

        // Add base tile layer
        const baseLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        this.baseLayer = this.$L.tileLayer(baseLayerUrl, { attribution: '' });
        this.baseLayer.addTo(this.map);

        this.addVisibleLayersFromMainMap();
        this.addComparisonLayers();
        this.initializeSideBySideControl();

        this.mapsInitialized = true;
      } catch (error) {
        console.error(error);
      }
    },

    getMainMapViewport() {
      let center = [-15.7801, -47.9292]; // Default to Brazil center
      let zoom = 5;

      if (window.map && window.map.getCenter) {
        try {
          center = [window.map.getCenter().lat, window.map.getCenter().lng];
          zoom = window.map.getZoom();
        } catch (e) {
          // Use defaults if main map is not accessible
        }
      }

      return { center, zoom };
    },

    addComparisonLayers() {
      this.leftLayer = null;
      this.rightLayer = null;

      // Add left layer
      if (this.layersToCompare.left) {
        this.ensureLayerVisibility(this.layersToCompare.left);
        this.leftLayer = this.createLayer(this.layersToCompare.left, 4);
        if (this.leftLayer) {
          this.leftLayer.addTo(this.map);
        }
      }

      // Add right layer
      if (this.layersToCompare.right) {
        this.ensureLayerVisibility(this.layersToCompare.right);
        this.rightLayer = this.createLayer(this.layersToCompare.right, 4);
        if (this.rightLayer) {
          this.rightLayer.addTo(this.map);
        }
      }
    },

    initializeSideBySideControl() {
      // Create side-by-side control if both layers exist
      if (this.leftLayer && this.rightLayer && this.$L.control && this.$L.control.sideBySide) {
        try {
          this.sideBySideControl = this.$L.control.sideBySide(this.leftLayer, this.rightLayer);
          this.sideBySideControl.addTo(this.map);
        } catch (error) {
          console.error(error);
        }
      }
    },

    addVisibleLayersFromMainMap() {
      try {
        const allVisibleLayers = [];

        // Support Layers
        const supportLayers = this.$store.state.supportLayers.supportLayers || {};
        Object.values(supportLayers).forEach((layer) => {
          if (layer.visible) {
            const isHighResOrMosaic = layer.name
              && (layer.name.toLowerCase().includes('alta resolução')
                || layer.name.toLowerCase().includes('mosaicos')
                || layer.name.toLowerCase().includes('alta resolu')
                || layer.name.toLowerCase().includes('mosaic'));

            allVisibleLayers.push({
              ...layer,
              source: 'supportLayers',
              zIndex: isHighResOrMosaic ? 1 : 6,
            });
          }
        });

        // Raster Layers
        const rasterLayers = this.$store.state.raster.supportLayersCategoryRaster || {};
        Object.values(rasterLayers).forEach((layer) => {
          if (layer.visible) {
            const isHighResOrMosaic = layer.name
              && (layer.name.toLowerCase().includes('alta resolução')
                || layer.name.toLowerCase().includes('mosaicos')
                || layer.name.toLowerCase().includes('alta resolu')
                || layer.name.toLowerCase().includes('mosaic'));

            allVisibleLayers.push({
              ...layer,
              source: 'raster',
              zIndex: isHighResOrMosaic ? 2 : 8,
            });
          }
        });

        this.addInpeLayers(allVisibleLayers);
        this.addMonitoringLayers(allVisibleLayers);
        this.addDeterProdesLayers(allVisibleLayers);

        allVisibleLayers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        allVisibleLayers.forEach((layer) => {
          const isLeftCompareLayer = this.layersToCompare.left
            && layer.id === this.layersToCompare.left.id;
          const isRightCompareLayer = this.layersToCompare.right
            && layer.id === this.layersToCompare.right.id;

          if (isLeftCompareLayer || isRightCompareLayer) {
            return;
          }

          const mapLayer = this.createLayer(layer, layer.zIndex);
          if (mapLayer) {
            mapLayer.addTo(this.map);

            if (layer.name && (layer.name.includes('DETER') || layer.name.includes('PRODES') || layer.name.includes('Focos') || layer.name.includes('Monitoramento') || layer.name.includes('Alertas'))) {
              mapLayer.setZIndex(1000);
            }
          }
        });
      } catch (error) {
        console.warn(error);
      }
    },

    createLayer(layer, customZIndex = null) {
      try {
        if (layer.source && ['foco', 'monitoring', 'deter', 'prodes', 'urgent-alerts'].includes(layer.source)) {
          const specializedLayer = createSpecializedStoreLayer(layer, this.$L, customZIndex);
          if (specializedLayer) {
            this.setupLayerEventHandlers(specializedLayer);
          }
          return specializedLayer;
        }

        if (layer.layer_type === 'wms' && layer.wms) {
          return this.createWmsLayer(layer, customZIndex);
        } if (layer.layer_type === 'tms' && layer.tms) {
          return this.createTmsLayer(layer, customZIndex);
        }
        // Unsupported layer type or missing layer data
        return null;
      } catch (error) {
        // Error creating layer
        return null;
      }
    },

    createWmsLayer(layer, customZIndex = null) {
      try {
        if (!validateWmsLayer(layer)) {
          return null;
        }

        const url = `${layer.wms.geoserver.geoserver_url}/wms`;
        const options = createWmsOptions(layer, customZIndex);
        const wmsLayer = this.$L.tileLayer.wms(url, options);

        this.setupLayerEventHandlers(wmsLayer);
        return wmsLayer;
      } catch (error) {
        return null;
      }
    },

    createTmsLayer(layer, customZIndex = null) {
      try {
        if (!validateTmsLayer(layer)) {
          return null;
        }

        const options = createTmsOptions(layer, customZIndex);
        const tmsLayer = this.$L.tileLayer(layer.tms.url, options);

        this.setupLayerEventHandlers(tmsLayer);
        return tmsLayer;
      } catch (error) {
        return null;
      }
    },

    setupLayerEventHandlers(layer) {
      layer.on('tileerror', () => {
        if (!layer.errorLogged) {
          layer.errorLogged = true;
        }
      });

      layer.on('tileload', () => {
        layer.errorLogged = false;
      });
    },
    ensureLayerVisibility(layer) {
      try {
        // If layer is not visible, make it visible temporarily for comparison
        if (!layer.visible) {
          this.$store.commit('raster/toggleLayerVisibilityRaster', {
            id: layer.id,
            visible: true,
          });
        }

        // If layer has blocking CQL filter, note for potential issues
        if (layer.cql === '1=2') {
          // Layer has blocking CQL filter, this may cause display issues
        }
      } catch (error) {
        // Error ensuring layer visibility
      }
    },

    cleanupMaps() {
      try {
        if (this.sideBySideControl) {
          this.sideBySideControl.remove();
          this.sideBySideControl = null;
        }

        if (this.leftLayer && this.map) {
          this.map.removeLayer(this.leftLayer);
          this.leftLayer = null;
        }

        if (this.rightLayer && this.map) {
          this.map.removeLayer(this.rightLayer);
          this.rightLayer = null;
        }

        if (this.baseLayer && this.map) {
          this.map.removeLayer(this.baseLayer);
          this.baseLayer = null;
        }

        if (this.map) {
          this.map.remove();
          this.map = null;
        }

        this.mapsInitialized = false;
      } catch (error) {
        // Error cleaning up maps
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
      return getLayerTypeName(layer);
    },

    findGroupForLayer(layerId) {
      // Find the group that contains this layer
      const groups = Object.values(this.supportCategoryGroupsRaster || {});
      return groups.find((group) => group.layers && group.layers.includes(layerId)) || null;
    },

    getLayerTypeShort(layer) {
      if (!layer) return this.$t('unknown');

      switch (layer.layer_type) {
        case 'wms':
          return 'WMS';
        case 'tms':
          return 'TMS';
        case 'heatmap':
          return 'Heatmap';
        default:
          return layer.layer_type ? layer.layer_type.toUpperCase() : 'N/A';
      }
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return `${text.substring(0, maxLength)}...`;
    },

    // INPE (DETER, PRODES)
    addInpeLayers(layersToAdd) {
      // DETER
      try {
        const deterState = this.$store.state.deter;

        if (deterState.showFeaturesDeter && deterState.currentUrlWmsDeter) {
          layersToAdd.push({
            name: this.$t('deter-alerts'),
            layer_type: 'wms',
            url: deterState.currentUrlWmsDeter,
            geoserverLayerDeter: deterState.geoserverLayerDeter,
            opacity: deterState.opacity || 100,
            visible: true,
            source: 'deter',
            zIndex: 930,
            id: 'deter_alerts',
          });
        }
      } catch (error) {
        console.log(error.message);
      }

      // Foco de Calor
      try {
        const focoState = this.$store.state.foco;

        if (focoState && focoState.layers) {
          Object.keys(focoState.layers).forEach((layerKey) => {
            const layer = focoState.layers[layerKey];

            if (layer.showFeatures && layer.currentUrlWms) {
              layersToAdd.push({
                name: `${this.$t('hotspots')} - ${layerKey.toUpperCase()}`,
                layer_type: 'wms',
                url: layer.currentUrlWms,
                geoserverLayer: layer.geoserverLayer,
                opacity: layer.opacity || 100,
                visible: true,
                source: 'foco',
                zIndex: 950,
                id: `foco_${layerKey}`,
              });
            }
          });
        }
      } catch (error) {
        console.log(error.message);
      }
    },

    // Monitoring
    addMonitoringLayers(layersToAdd) {
      try {
        const monitoringState = this.$store.state.monitoring;

        if (monitoringState.showFeaturesMonitoring && monitoringState.currentUrlWmsMonitoring) {
          layersToAdd.push({
            name: this.$t('daily-monitoring'),
            layer_type: 'wms',
            url: monitoringState.currentUrlWmsMonitoring,
            geoserverLayerMonitoring: monitoringState.geoserverLayerMonitoring,
            opacity: monitoringState.opacity || 100,
            visible: true,
            source: 'monitoring',
            zIndex: 920,
            id: 'monitoring_daily',
          });
        }
      } catch (error) {
        console.log(error.message);
      }

      // Urgent alerts
      try {
        const urgentAlertsState = this.$store.state['urgent-alerts'];

        if (urgentAlertsState.showFeaturesAlerts && urgentAlertsState.currentUrlWmsAlerts) {
          layersToAdd.push({
            name: this.$t('urgent-alerts'),
            layer_type: 'wms',
            url: urgentAlertsState.currentUrlWmsAlerts,
            geoserverLayerAlerts: urgentAlertsState.geoserverLayerAlerts,
            opacity: urgentAlertsState.opacity || 100,
            visible: true,
            source: 'urgent-alerts',
            zIndex: 910,
            id: 'urgent_alerts',
          });
        }
      } catch (error) {
        console.log(error.message);
      }
    },

    // INPE
    addDeterProdesLayers(layersToAdd) {
      // DETER
      try {
        const deterState = this.$store.state.deter;

        if (deterState.showFeaturesDeter && deterState.currentUrlWmsDeter) {
          layersToAdd.push({
            name: this.$t('deter-alerts'),
            layer_type: 'wms',
            url: deterState.currentUrlWmsDeter,
            geoserverLayerDeter: deterState.geoserverLayerDeter,
            opacity: deterState.opacity || 100,
            visible: true,
            source: 'deter',
            zIndex: 930,
            id: 'deter_alerts',
          });
        }
      } catch (error) {
        console.log(error.message);
      }

      // PRODES
      try {
        const prodesState = this.$store.state.prodes;

        if (prodesState.showFeaturesProdes && prodesState.currentUrlWmsProdes) {
          layersToAdd.push({
            name: this.$t('prodes-deforestation'),
            layer_type: 'wms',
            url: prodesState.currentUrlWmsProdes,
            geoserverLayerProdes: prodesState.geoserverLayerProdes,
            opacity: prodesState.opacity || 100,
            visible: true,
            source: 'prodes',
            zIndex: 940,
            id: 'prodes_deforestation',
          });
        }
      } catch (error) {
        console.log(error.message);
      }
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
