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
          <div
            id="mapContainer"
            ref="mapContainer"
            style="height: 70vh; position: relative; width: 100%;"
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

          <v-card
            class="ma-2"
            elevation="2"
          >
            <v-card-text>
              <v-row>
                <v-col cols="6">
                  <strong>Camada esquerda:</strong><br>
                  {{ layersToCompare.left ? layersToCompare.left.name : 'Nenhuma' }}
                </v-col>
                <v-col cols="6">
                  <strong>Camada direita:</strong><br>
                  {{ layersToCompare.right ? layersToCompare.right.name : 'Nenhuma' }}
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
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

  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },

  data: () => ({
    mapsInitialized: false,
    syncingMaps: false,
  }),

  computed: {
    ...mapState('raster', ['layersToCompare']),

    dialogValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('update', value);
      },
    },
  },

  watch: {
    value(newVal) {
      if (newVal) {
        // Modal opened, initialize maps
        this.$nextTick(() => {
          this.initializeMaps();
        });
      } else {
        // Modal closed, cleanup
        this.cleanupMaps();
      }
    },
  },

  mounted() {
    // Component mounted
  },

  methods: {
    closeDialog() {
      this.cleanupMaps();
      this.$emit('update', false);
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

/* Leaflet side-by-side styles */
.leaflet-sbs-divider {
  background-color: #D42A3E !important;
  width: 4px !important;
  z-index: 999 !important;
}

.leaflet-sbs-range {
  background-color: #D42A3E !important;
  border: 3px solid #fff !important;
  border-radius: 50% !important;
  width: 42px !important;
  height: 42px !important;
  margin-left: -21px !important;
  margin-top: -21px !important;
  cursor: ew-resize !important;
  z-index: 1000 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
}

.leaflet-sbs-range:hover {
  background-color: #B8233A !important;
  transform: scale(1.1) !important;
}

/* Ensure the side-by-side control is properly positioned */
.leaflet-sbs-divider,
.leaflet-sbs-range {
  position: absolute !important;
}
</style>
