<template>
  <v-dialog
    v-model="dialogValue"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar color="secondary">
        <v-toolbar-title class="white--text">
          {{ $t('compare') }}
        </v-toolbar-title>

        <v-spacer />

        <v-btn
          icon
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
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
              >
                <div
                  v-if="!mapsInitialized"
                  style="
                    padding: 20px;
                    text-align: center;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1000;
                  "
                >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  />
                  <p style="margin-top: 10px;">
                    Carregando mapas de comparação...
                  </p>
                </div>
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
              >
                <v-card-title class="pa-3 subtitle-1">
                  <v-icon left>
                    mdi-layers
                  </v-icon>
                  Camadas em Comparação
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
                      <v-card
                        v-if="layersToCompare.left"
                        flat
                        outlined
                        class="pa-2"
                        style="height: 100%;"
                      >
                        <v-chip
                          x-small
                          color="blue"
                          text-color="white"
                          class="mb-2"
                        >
                          <v-icon
                            left
                            x-small
                          >
                            mdi-arrow-left
                          </v-icon>
                          Esquerda
                        </v-chip>

                        <div class="layer-name-compact mb-2">
                          {{ layersToCompare.left.name }}
                        </div>

                        <!-- Preview Image -->
                        <v-img
                          v-if="getLayerPreview(layersToCompare.left)"
                          :src="getLayerPreview(layersToCompare.left)"
                          height="80"
                          class="mb-2 rounded"
                          contain
                        >
                          <template #placeholder>
                            <v-row
                              class="fill-height ma-0"
                              align="center"
                              justify="center"
                            >
                              <v-progress-circular
                                indeterminate
                                size="20"
                                color="grey lighten-5"
                              />
                            </v-row>
                          </template>
                          <template #error>
                            <v-row
                              class="fill-height ma-0"
                              align="center"
                              justify="center"
                            >
                              <v-icon
                                size="32"
                                color="grey lighten-2"
                              >
                                mdi-image-off-outline
                              </v-icon>
                            </v-row>
                          </template>
                        </v-img>

                        <!-- Fallback when no preview available -->
                        <div
                          v-else
                          class="preview-fallback mb-2"
                        >
                          <v-icon
                            size="32"
                            color="grey lighten-2"
                          >
                            mdi-layers-outline
                          </v-icon>
                          <div class="caption grey--text mt-1">
                            Preview não disponível
                          </div>
                        </div>
                        <!-- Layer Details -->
                        <div class="layer-details-compact">
                          <div class="text-caption grey--text">
                            <strong>Tipo:</strong> {{ getLayerType(layersToCompare.left) }}
                          </div>
                          <div class="text-caption grey--text">
                            <strong>Grupo:</strong>
                            {{ leftLayerGroup ? leftLayerGroup.name : 'N/A' }}
                          </div>
                        </div>
                      </v-card>

                      <!-- Empty Left Slot -->
                      <v-card
                        v-else
                        flat
                        outlined
                        class="pa-2 text-center"
                        style="height: 100%; min-height: 200px;"
                      >
                        <div class="d-flex flex-column align-center justify-center fill-height">
                          <v-icon
                            size="32"
                            color="grey lighten-2"
                            class="mb-1"
                          >
                            mdi-image-off-outline
                          </v-icon>
                          <div class="caption grey--text">
                            Camada esquerda
                          </div>
                        </div>
                      </v-card>
                    </v-col>

                    <!-- Right Layer Info -->
                    <v-col
                      cols="6"
                      class="pl-1"
                    >
                      <v-card
                        v-if="layersToCompare.right"
                        flat
                        outlined
                        class="pa-2"
                        style="height: 100%;"
                      >
                        <v-chip
                          x-small
                          color="red"
                          text-color="white"
                          class="mb-2"
                        >
                          Direita
                          <v-icon
                            right
                            x-small
                          >
                            mdi-arrow-right
                          </v-icon>
                        </v-chip>

                        <div class="layer-name-compact mb-2">
                          {{ layersToCompare.right.name }}
                        </div>

                        <!-- Preview Image -->
                        <v-img
                          v-if="getLayerPreview(layersToCompare.right)"
                          :src="getLayerPreview(layersToCompare.right)"
                          :lazy-src="getLayerPreview(layersToCompare.right)"
                          height="80"
                          class="mb-2 rounded"
                          contain
                        >
                          <template #placeholder>
                            <v-row
                              class="fill-height ma-0"
                              align="center"
                              justify="center"
                            >
                              <v-progress-circular
                                indeterminate
                                size="20"
                                color="grey lighten-5"
                              />
                            </v-row>
                          </template>
                          <template #error>
                            <v-row
                              class="fill-height ma-0"
                              align="center"
                              justify="center"
                            >
                              <v-icon
                                size="32"
                                color="grey lighten-2"
                              >
                                mdi-image-off-outline
                              </v-icon>
                            </v-row>
                          </template>
                        </v-img>

                        <!-- Fallback when no preview available -->
                        <div
                          v-else
                          class="preview-fallback mb-2"
                        >
                          <v-icon
                            size="32"
                            color="grey lighten-2"
                          >
                            mdi-layers-outline
                          </v-icon>
                          <div class="caption grey--text mt-1">
                            Preview não disponível
                          </div>
                        </div>
                        <!-- Layer Details -->
                        <div class="layer-details-compact">
                          <div class="text-caption grey--text">
                            <strong>Tipo:</strong> {{ getLayerType(layersToCompare.right) }}
                          </div>
                          <div class="text-caption grey--text">
                            <strong>Grupo:</strong>
                            {{ rightLayerGroup ? rightLayerGroup.name : 'N/A' }}
                          </div>
                        </div>
                      </v-card>

                      <!-- Empty Right Slot -->
                      <v-card
                        v-else
                        flat
                        outlined
                        class="pa-2 text-center"
                        style="height: 100%; min-height: 200px;"
                      >
                        <div class="d-flex flex-column align-center justify-center fill-height">
                          <v-icon
                            size="32"
                            color="grey lighten-2"
                            class="mb-1"
                          >
                            mdi-image-off-outline
                          </v-icon>
                          <div class="caption grey--text">
                            Camada direita
                          </div>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>

                  <!-- Empty State -->
                  <v-card
                    v-if="!layersToCompare.left && !layersToCompare.right"
                    flat
                    class="ma-2 text-center"
                  >
                    <v-card-text class="pa-4">
                      <v-icon
                        size="48"
                        color="grey lighten-1"
                        class="mb-2"
                      >
                        mdi-image-off
                      </v-icon>
                      <div class="grey--text">
                        Nenhuma camada selecionada para comparação
                      </div>
                    </v-card-text>
                  </v-card>
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
                    Arraste a barra vermelha para comparar
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
    "compare": "Compare layers"
  },
  "pt-br": {
    "compare": "Comparar camadas"
  }
}
</i18n>

<script>
import { mapState } from 'vuex';
import tmsLegend from '../../assets/tmsLegend.png';
// Note: Leaflet should be available globally in the CMR2 project

export default {
  name: 'RasterCompare',

  data: () => ({
    mapsInitialized: false,
    syncingMaps: false,
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
  },

  watch: {
    openCompare(newVal) {
      if (newVal) {
        // Modal opened, initialize maps
        this.$nextTick(() => {
          this.initializeMaps();
        });
      } else {
        // Modal closed, cleanup maps and clear selected layers
        this.cleanupMaps();
        this.$store.commit('raster/clearLayersToCompare');
      }
    },
  },

  mounted() {
    // Component mounted
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
      try {
        // Wait a bit for the DOM to be ready
        await this.$nextTick();

        // Check if Leaflet is available
        if (typeof window.L === 'undefined') {
          return;
        }

        // Check if Leaflet WMS plugin is available
        if (typeof window.L.tileLayer.wms === 'undefined') {
          return;
        }

        const mapElement = document.getElementById('mapContainer');

        if (!mapElement) {
          return;
        }

        // Get current map center and zoom from main map if available
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

        // Create single map
        const map = window.L.map('mapContainer', {
          center,
          zoom,
          zoomControl: true,
          attributionControl: false, // Remove attribution control completely
        });

        // Add base tile layer
        const baseLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const baseLayer = window.L.tileLayer(baseLayerUrl, { attribution: '' });
        baseLayer.addTo(map);

        // Create layers for comparison
        let leftLayer = null;
        let rightLayer = null;

        // Add left layer
        if (this.layersToCompare.left) {
          this.ensureLayerVisibility(this.layersToCompare.left);
          leftLayer = this.createLayer(this.layersToCompare.left);
          if (leftLayer) {
            leftLayer.addTo(map);
          }
        }

        // Add right layer
        if (this.layersToCompare.right) {
          this.ensureLayerVisibility(this.layersToCompare.right);
          rightLayer = this.createLayer(this.layersToCompare.right);
          if (rightLayer) {
            rightLayer.addTo(map);
          }
        }

        // Create side-by-side control if both layers exist
        let sideBySideControl = null;
        if (leftLayer && rightLayer && window.L.control && window.L.control.sideBySide) {
          try {
            sideBySideControl = window.L.control.sideBySide(leftLayer, rightLayer);
            sideBySideControl.addTo(map);
          } catch (error) {
            // Side-by-side control failed to initialize
          }
        }

        // Store maps globally for cleanup
        window.compareMaps = {
          map,
          baseLayer,
          leftLayer,
          rightLayer,
          sideBySideControl,
        };

        this.mapsInitialized = true;
      } catch (error) {
        // Error initializing comparison maps
      }
    },

    createLayer(layer) {
      try {
        if (layer.layer_type === 'wms' && layer.wms) {
          return this.createWmsLayer(layer);
        } if (layer.layer_type === 'tms' && layer.tms) {
          return this.createTmsLayer(layer);
        }
        // Unsupported layer type or missing layer data
        return null;
      } catch (error) {
        // Error creating layer
        return null;
      }
    },

    createWmsLayer(layer) {
      try {
        const { wms } = layer;

        // Validate required WMS data
        if (!wms || !wms.geoserver || !wms.geoserver_layer_name) {
          // Invalid WMS layer data
          return null;
        }

        const baseUrl = wms.geoserver.base_url || process.env.GEOSERVER_URL;

        if (!baseUrl) {
          // No base URL available for WMS layer
          return null;
        }

        const url = `${baseUrl}/wms`;

        const options = {
          layers: wms.geoserver_layer_name,
          format: 'image/png',
          transparent: true,
          version: '1.1.0',
          attribution: '',
          opacity: 1, // Force full opacity for comparison
        };

        // Only add CQL filter if it exists and is not a blocking filter
        if (layer.cql && layer.cql !== '1=2' && layer.cql.trim() !== '') {
          options.cql_filter = layer.cql;
        }

        const wmsLayer = window.L.tileLayer.wms(url, options);

        // Handle tile loading errors
        wmsLayer.on('tileerror', () => {
          // Mark error state to avoid repeated logging
          if (!wmsLayer.errorLogged) {
            wmsLayer.errorLogged = true;
          }
        });

        wmsLayer.on('tileload', () => {
          // Reset error flag when tiles load successfully
          wmsLayer.errorLogged = false;
        });

        return wmsLayer;
      } catch (error) {
        // Error creating WMS layer
        return null;
      }
    },

    createTmsLayer(layer) {
      try {
        if (!layer.tms || !layer.tms.url) {
          // Invalid TMS layer data
          return null;
        }

        const tmsLayer = window.L.tileLayer(layer.tms.url, {
          tms: true,
          attribution: '',
          opacity: 1, // Force full opacity for comparison
          errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Transparent 1x1 pixel
        });

        // Handle tile loading errors
        tmsLayer.on('tileerror', () => {
          if (!tmsLayer.errorLogged) {
            tmsLayer.errorLogged = true;
          }
        });

        tmsLayer.on('tileload', () => {
          tmsLayer.errorLogged = false;
        });

        return tmsLayer;
      } catch (error) {
        // Error creating TMS layer
        return null;
      }
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
        if (window.compareMaps) {
          if (window.compareMaps.sideBySideControl) {
            window.compareMaps.sideBySideControl.remove();
          }

          if (window.compareMaps.leftLayer) {
            window.compareMaps.map.removeLayer(window.compareMaps.leftLayer);
          }

          if (window.compareMaps.rightLayer) {
            window.compareMaps.map.removeLayer(window.compareMaps.rightLayer);
          }

          if (window.compareMaps.map) {
            window.compareMaps.map.remove();
          }

          window.compareMaps = null;
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

    getLayerTypeShort(layer) {
      if (!layer) return 'Desconhecido';

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
  },
};
</script>

<style>
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

.layer-name {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.2;
  color: #333;
}

.layer-name-compact {
  font-weight: 500;
  font-size: 12px;
  line-height: 1.2;
  color: #333;
  height: 32px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-details {
  font-size: 12px;
}

.layer-details-compact {
  font-size: 10px;
}

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

/* Leaflet side-by-side styles */
.leaflet-sbs-divider {
  background-color: #D42A3E !important;
  width: 4px !important;
  z-index: 999 !important;
}

.leaflet-sbs-range:hover {
  background-color: #B8233A !important;
}

/* Ensure the side-by-side control is properly positioned */
.leaflet-sbs-divider,
.leaflet-sbs-range {
  position: absolute !important;
}

/* Scrollbar styling for the layer panel */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
