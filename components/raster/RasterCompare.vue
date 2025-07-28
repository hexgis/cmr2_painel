<template>
  <v-dialog
    v-model="dialogValue"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar color="secondary">
        <v-toolbar-title>
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
            style="height: 80vh;"
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
                          :lazy-src="getLayerPreview(layersToCompare.left)"
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
                        </v-img>

                        <!-- Layer Details -->
                        <div class="layer-details-compact">
                          <div class="detail-item-compact">
                            <strong>Tipo:</strong><br>
                            {{ getLayerTypeShort(layersToCompare.left) }}
                          </div>
                          <div
                            v-if="layersToCompare.left.wms && layersToCompare.left.wms.attribution"
                            class="detail-item-compact"
                          >
                            <strong>Fonte:</strong><br>
                            {{ truncateText(layersToCompare.left.wms.attribution, 25) }}
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
                          <v-icon
                            left
                            x-small
                          >
                            mdi-arrow-right
                          </v-icon>
                          Direita
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
                        </v-img>

                        <!-- Layer Details -->
                        <div class="layer-details-compact">
                          <div class="detail-item-compact">
                            <strong>Tipo:</strong><br>
                            {{ getLayerTypeShort(layersToCompare.right) }}
                          </div>
                          <div
                            v-if="layersToCompare.right.wms && layersToCompare.right.wms.attribution"
                            class="detail-item-compact"
                          >
                            <strong>Fonte:</strong><br>
                            {{ truncateText(layersToCompare.right.wms.attribution, 25) }}
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
// Note: Leaflet should be available globally in the CMR2 project

export default {
  name: 'RasterCompare',

  data: () => ({
    mapsInitialized: false,
    syncingMaps: false,
  }),

  computed: {
    ...mapState('raster', ['layersToCompare', 'openCompare']),

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
          console.error('Leaflet not available');
          return;
        }

        // Check if Leaflet WMS plugin is available
        if (typeof window.L.tileLayer.wms === 'undefined') {
          console.error('Leaflet WMS plugin not available');
          return;
        }

        const mapElement = document.getElementById('mapContainer');

        if (!mapElement) {
          console.error('Map container not found');
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
            console.warn('Could not get main map center/zoom, using defaults');
          }
        }

        // Create single map
        const map = window.L.map('mapContainer', {
          center,
          zoom,
          zoomControl: true,
        });

        // Add base tile layer
        const baseLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const attribution = '© OpenStreetMap contributors';
        const baseLayer = window.L.tileLayer(baseLayerUrl, { attribution });
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
            console.warn('Failed to create side-by-side control:', error);
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
        console.error('Error initializing maps:', error);
      }
    },

    createLayer(layer) {
      try {
        if (layer.layer_type === 'wms' && layer.wms) {
          return this.createWmsLayer(layer);
        } if (layer.layer_type === 'tms' && layer.tms) {
          return this.createTmsLayer(layer);
        }
        console.warn('Unsupported layer type or missing layer data:', {
          layer_type: layer.layer_type,
          has_wms: !!layer.wms,
          has_tms: !!layer.tms,
        });
        return null;
      } catch (error) {
        console.error('Error creating layer:', error);
        return null;
      }
    },

    addLayerToMap(map, layer) {
      // This method is no longer needed as we use createLayer instead
      console.warn('addLayerToMap is deprecated, use createLayer instead');
    },

    createWmsLayer(layer) {
      try {
        const { wms } = layer;
        const baseUrl = wms.geoserver.base_url || process.env.GEOSERVER_URL;
        const url = `${baseUrl}/wms`;

        const options = {
          layers: wms.geoserver_layer_name,
          format: 'image/png',
          transparent: true,
          version: '1.1.0',
          attribution: wms.attribution || '',
          opacity: 1, // Force full opacity for comparison
        };

        // Only add CQL filter if it exists and is not a blocking filter
        if (layer.cql && layer.cql !== '1=2' && layer.cql.trim() !== '') {
          options.cql_filter = layer.cql;
        }

        const wmsLayer = window.L.tileLayer.wms(url, options);

        wmsLayer.on('loading', () => {
          console.log('WMS layer loading...');
        });

        wmsLayer.on('load', () => {
          console.log('WMS layer loaded successfully');
        });

        wmsLayer.on('tileerror', (error) => {
          console.error('WMS tile error:', error);
        });

        return wmsLayer;
      } catch (error) {
        console.error('Error creating WMS layer:', error);
        return null;
      }
    },

    createTmsLayer(layer) {
      try {
        const tmsLayer = window.L.tileLayer(layer.tms.url, {
          tms: true,
          attribution: layer.attribution || '',
          opacity: 1, // Force full opacity for comparison
        });

        tmsLayer.on('loading', () => {
          console.log('TMS layer loading...');
        });

        tmsLayer.on('load', () => {
          console.log('TMS layer loaded successfully');
        });

        tmsLayer.on('tileerror', (error) => {
          console.error('TMS tile error:', error);
        });

        return tmsLayer;
      } catch (error) {
        console.error('Error creating TMS layer:', error);
        return null;
      }
    },
    ensureLayerVisibility(layer) {
      try {
        console.log('Ensuring layer visibility:', layer.name, 'Current visible:', layer.visible);

        // If layer is not visible, make it visible temporarily for comparison
        if (!layer.visible) {
          console.log('Making layer visible for comparison:', layer.name);
          this.$store.commit('raster/toggleLayerVisibilityRaster', {
            id: layer.id,
            visible: true,
          });
        }

        // If layer has blocking CQL filter, temporarily remove it
        if (layer.cql === '1=2') {
          console.log('Layer has blocking CQL filter, this may cause issues:', layer.name);
        }
      } catch (error) {
        console.error('Error ensuring layer visibility:', error);
      }
    },

    cleanupMaps() {
      try {
        if (window.compareMaps) {
          console.log('Cleaning up comparison maps...');

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
        console.error('Error cleaning up maps:', error);
      }
    },

    getLayerPreview(layer) {
      try {
        if (!layer) return null;

        if (layer.layer_type === 'tms') {
          // For TMS layers, we might not have a preview, so return a placeholder or try to get one
          return null; // Could return a generic TMS icon or try to construct a preview URL
        }

        if (layer.layer_type === 'wms' && layer.wms) {
          return (
            layer.wms.geoserver.preview_url + layer.wms.geoserver_layer_name
          );
        }

        return null;
      } catch (error) {
        console.error('Error getting layer preview:', error);
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
