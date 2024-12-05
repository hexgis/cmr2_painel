<template>
  <client-only>
    <div class="map-container3">
      <l-map
        ref="map"
        :zoom="zoom"
        :bounds="localBounds"
        :min-zoom="minZoom"
        :max-zoom="21"
        :max-bounds="maxBounds"
        :max-bounds-viscosity="1"
        :options="mapOptions"
        @update:bounds="updateBounds"
      >
        <l-control position="topleft">
          <div class="pa-1 map-action-buttons">
            <div
              v-if="user.settings.map_zoom_buttons_visible"
            />

            <div class="div-spacer" />
          </div>
        </l-control>

        <l-control
          class="leaflet-coordinates-control"
          position="bottomleft"
        >
          <div v-if="user.settings.map_pointer_coordinates_visible">
            {{ cursorCoordinates.lat }},
            {{ cursorCoordinates.lng }}
          </div>
        </l-control>

        <l-control-scale
          v-if="user.settings.map_scale_visible"
          position="bottomleft"
        />

        <l-geo-json
          ref="interestArea"
          :geojson="interestArea"
          :options-style="interestStyle"
          :visible="showInterestArea"
        />
      </l-map>

      <div
        v-if="loading"
        class="loading-background"
      >
        <div>
          <v-skeleton-loader
            type="chip"
            width="32"
          />
          <v-skeleton-loader
            type="chip"
            width="32"
          />
          <v-skeleton-loader
            type="chip"
            width="32"
          />
        </div>
      </div>
    </div>
  </client-only>
</template>

<i18n>
{
    "en": {
        "zoom-in": "Zoom in",
        "zoom-out": "Zoom out"
    },
    "pt-br": {
        "zoom-in": "Aproximar",
        "zoom-out": "Reduzir"
    }
}
</i18n>

<script>
import { mapState, mapMutations } from 'vuex';
import interestArea from '@/assets/interest_area.json';
import MapPrinter from '@/components/map/print-map/MapPrinter.vue';

import MapSearch from '@/components/map/MapSearch.vue';
import FileLoaderControl from '@/components/map/file-loader/FileLoaderControl.vue';
import FileLoaderLayers from '@/components/map/file-loader/FileLoaderLayers.vue';
// import ImageryLayers from '@/components/imagery/ImageryLayers'
// import CatalogLayers from '@/components/catalog/CatalogLayers'
import MonitoringLayers from '@/components/monitoring/MonitoringLayers';
// import MonitoringLayersGeoserver from '@/components/monitoring/MonitoringLayersGeoserver'
import SupportLayers from '@/components/support/SupportLayers';
// import ChangeDetectionLayers from '@/components/change-detection/ChangeDetectionLayers'
import BaseWmsMetadataPopup from '@/components/base/BaseWmsMetadataPopup';
// import AlgorithmLayers from '@/components/algorithms/AlgorithmLayers'
// import WebhooksLayers from '@/components/webhooks/WebhooksLayers'
import PriorityLayers from '@/components/priority/PriorityLayers';

import 'leaflet/dist/leaflet.css';
import 'leaflet-basemaps/L.Control.Basemaps.css';
import 'leaflet-minimap/dist/Control.MiniMap.min.css';

if (typeof window !== 'undefined') {
  require('leaflet-basemaps');
  require('leaflet-minimap');
}

export default {
  name: 'MiniMapForPrint',

  components: {
    // ImageryLayers,
    // CatalogLayers,
    MonitoringLayers,
    // MonitoringLayersGeoserver,
    SupportLayers,
    MapSearch,
    FileLoaderControl,
    FileLoaderLayers,
    // ChangeDetectionLayers,
    BaseWmsMetadataPopup,
    // AlgorithmLayers,
    // WebhooksLayers,
    MapPrinter,
    PriorityLayers,
  },

  data: () => ({
    map: null,
    zoom: 4,
    minZoom: 6,
    maxBounds: [
      [-90, -280],
      [90, 280],
    ],
    mapOptions: {
      zoomControl: false,
      dragging: false,
      boxZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
      attributionControl: false,
      height: 125,
    },
    areaBounds: null,
    initialBounds: [
      [-33.8689056, -73.9830625],
      [5.2842873, -28.6341164],
    ],
    loadedFiles: [],
    mapLoading: false,

    interestArea,
    showInterestArea: process.env.INTEREST_AREA_OUTLINE === 'true',
    interestStyle: {
      fillOpacity: 0,
      fill: false,
      color: '#fcd40d',
      dashArray: '5',
    },

    showImagery: process.env.IMAGERY === 'true',
    monitoringGeoserver: process.env.MONITORING_GEOSERVER === 'true',

    baseLayers: [
      {
        url: '//{s}.tile.osm.org/{z}/{x}/{y}.png',
        options: {
          label: 'Open Street Map',
          tag: 'OSM',
          attribution:
                        '&copy; <a href="//www.openstreetmap.org/">OpenStreetMap</a> contributors',
          maxZoom: 21,
          maxNativeZoom: 18,
          zIndex: 1,
        },
      },
    ],
    bingKey:
            'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L',

    lastZoom: null,
    zoomControlGrid: 7,

    tooltipsRef: null,
    tooltipsGridRef: null,
    cursorCoordinates: {
      lat: '',
      lng: '',
    },
    miniMap: null,
    miniMapLayer: null,
    miniMapLayerOptions: {
      minZoom: 0,
      maxZoom: 18,
    },
    miniMapOptions: {
      togglePreview: false,
      height: 125,
      width: 125,
    },
    localBounds: [],
  }),

  computed: {
    minimapVisibleSettings() {
      return this.user.settings.minimap_visible;
    },
    initialExtentCoords() {
      return this.user.settings.initial_extent.coordinates
        ? this.$L.GeoJSON.coordsToLatLngs(
          this.user.settings.initial_extent.coordinates[0],
        )
        : [];
    },
    ...mapState('map', ['bounds', 'boundsZoomed', 'loading']),
    ...mapState('userProfile', ['user']),
  },

  watch: {
    boundsZoomed() {
      this.map.flyToBounds(this.bounds);
    },

    minimapVisibleSettings(visible) {
      visible ? this.miniMap.addTo(this.map) : this.miniMap.remove();
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.createMap();
    });
  },

  methods: {
    isLoading() {
      this.setMapLoading(true);
    },
    loaded() {
      this.setMapLoading(false);
    },
    createMap() {
      this.map = this.$refs.map.mapObject;
      this.map.on('zoomend', this.onZoomEnd);
      this.map.addEventListener('mousemove', this.refreshCoordinates);

      this.createMapLayers();
      this.createCssRefs();

      this.$emit('mapCreated');

      if (this.bounds) {
        this.localBounds = this.bounds;
      } else if (
        this.user
                && (this.user.settings.initial_extent
                    || this.user.settings.interest_area_zoom_on_init)
      ) {
        let areaBounds;

        if (this.user.settings.initial_extent) {
          areaBounds = this.$L.polygon(this.initialExtentCoords);
        } else areaBounds = this.$refs.interestArea.mapObject;

        this.updateBounds(areaBounds.getBounds());
        this.localBounds = areaBounds.getBounds();

        setTimeout(() => {
          const map = this.$refs.map.mapObject;

          map.invalidateSize();
          map.setZoom(map.getZoom() + 1);
        }, 100);
      } else {
        this.localBounds = this.initialBounds;
      }
    },

    createMapLayers() {
      const tileLayers = [];
      for (const layer of this.baseLayers) {
        const tileLayer = this.$L.tileLayer(layer.url, layer.options);

        tileLayers.push(tileLayer);
      }

      this.map.addControl(
        this.$L.control.basemaps({
          basemaps: tileLayers,
          tileX: 0,
          tileY: 0,
          tileZ: 1,
        }),
      );
    },
    createMiniMap() {
      const osm = this.baseLayers[0];

      const miniMapLayer = this.$L.tileLayer(
        osm.url,
        this.miniMapLayerOptions,
      );

      this.miniMap = new this.$L.Control.MiniMap(
        miniMapLayer,
        this.miniMapOptions,
      );

      if (this.minimapVisibleSettings) {
        this.miniMap.addTo(this.map);
      }
    },

    createCssRefs() {
      this.tooltipsRef = this.map.getPane('tooltipPane');
      this.tooltipsRef.style.visibility = 'hidden';
    },

    onZoomEnd(event) {
      const map = event.target;
      const zoom = map.getZoom();

      if (
        zoom < this.zoomControlGrid
                && (!this.lastZoom || this.lastZoom >= this.zoomControlGrid)
      ) {
        this.tooltipsRef.style.visibility = 'hidden';
      } else if (
        zoom >= this.zoomControlGrid
                && (!this.lastZoom || this.lastZoom < this.zoomControlGrid)
      ) {
        this.tooltipsRef.style.visibility = 'visible';
      }

      this.lastZoom = zoom;
    },

    updateBounds(latLngBounds) {
      this.setBounds(latLngBounds);
    },

    ...mapMutations('map', ['setBounds', 'setMapLoading']),
  },
};
</script>

<style lang="sass">
.map-action-buttons
    z-index: 4
    opacity: 0.84

    .v-icon
        font-size: 18px !important

.leaflet-tooltip-right:before,
.leaflet-tooltip-left:before
    right: 0
    left: 0
    margin-left: 0px
    border-right-color: transparent !important
    border-left-color: transparent !important

.leaflet-container
    font-family: 'Roboto', sans-serif !important
    line-height: 1.5 !important

.card-popup
    .leaflet-popup-content
        margin: 0px

    .leaflet-popup-scrolled
        border: none

.leaflet-popup-content-wrapper
    padding: 0px
    border: 0px !important
    border-radius: 4px !important
    box-shadow: none
    -webkit-box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12) !important
    box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12) !important

.leaflet-coordinates-control
    background: rgba(255, 255, 255, 0.7)
    padding: 0 5px
    font-size: 11px
    color: #333
    margin-left: 0 !important
    margin-bottom: 0 !important

.leaflet-logo-control
    margin-left: 6px !important
    margin-bottom: 15px

.nation-logo-container
    margin-left: -3px

.map-container3
    height: 15vh
    width: 20vw
    overflow: hidden !important
    padding: 0

.logo-flags
    margin-left: -3px
    opacity: 0.4
    transition: all ease 0.1s

.logo-flags:hover
    opacity: 1
    transform: scale(1.1)

.logo-hex
    opacity: 0.4
    display: flex
    flex-direction: row

.basemap.active
    border: 0

.loading-background
    position: absolute
    top: 0px
    left: 0px
    height: 100%
    width: 100%
    background-color: rgba(245, 245, 245, 0.4)
    z-index: 3
    display: flex
    align-items: center
    justify-content: center

    div
        display: flex
        align-items: center
        justify-content: space-around
        width: 140px
.div-spacer
    height: 20px
</style>
