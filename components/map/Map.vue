<template>
  <client-only>
    <div class="map-container">
      <l-map
        id="map"
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
            <MapSearch
              :map="map"
            />

            <div
              class="pt-2"
            >
              <MapSearchTi
                :map="map"
                @item-selected="onItemSelected"
              />
            </div>

            <div>
              <div class="d-flex">
                <v-tooltip right>
                  <template #activator="{ on }">
                    <v-btn
                      fab
                      ripple
                      height="36"
                      width="36"
                      class="mt-3"
                      v-on="on"
                      @click.stop="
                        map.setZoom(map.getZoom() + 1)
                      "
                    >
                      <v-icon medium>
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </template>
                  <span> {{ $t('zoom-in') }} </span>
                </v-tooltip>
              </div>

              <div class="d-flex">
                <v-tooltip right>
                  <template #activator="{ on }">
                    <v-btn
                      fab
                      ripple
                      height="36"
                      width="36"
                      class="mt-3"
                      v-on="on"
                      @click.stop="
                        map.setZoom(map.getZoom() - 1)
                      "
                    >
                      <v-icon medium>
                        mdi-minus
                      </v-icon>
                    </v-btn>
                  </template>
                  <span> {{ $t('zoom-out') }} </span>
                </v-tooltip>
              </div>
            </div>

            <div class="div-spacer" />

            <template>
              <FileLoaderControl
                v-if="isLoggedIn"
                :map="map"
                :files="loadedFiles"
                @loading="isLoading()"
                @loads="loaded()"
              />

              <DrawingPanel
                :map="map"
                :show="activeMenu === 'DrawingPanel'"
                @toggleTool="setActiveMenu"
              />
            </template>

            <MapPrinter
              :map="map"
              :selected-base-map="selectedBaseMap"
              :show-tms="tmsToPrint.visible"
            />
            <Highlighter
              :map="map"
              :show="activeMenu === 'Highlighter'"
              @toggleTool="setActiveMenuMarker"
            />
          </div>
        </l-control>

        <!-- <l-control

          position="bottomleft"
        >
          <div>
            <v-col class="pa-0 logo-flags">
              <v-img
                contain
                width="95"
                src="/img/logo-inteira-antiga.svg"
              />
            </v-col>
          </div>
        </l-control>-->
        <l-control
          class="leaflet-coordinates-control"
          position="bottomleft"
        >
          <div>
            {{ cursorCoordinates.lat }},
            {{ cursorCoordinates.lng }}
          </div>
        </l-control>

        <l-control-scale
          position="bottomleft"
          :imperial="false"
          :metric="true"
        />

        <l-control
          position="bottomleft"
          class="leaflet-logo-control"
        >
          <!-- <BaseTiMetadata
                        v-if="isItemSelected"
                        :selectedItems="selectedItems"
                        @close="handleClose"

                    /> -->

          <v-img
            class="my-4 ml-0 northArrow"
            height="40"
            width="35"
            :src="northArrow"
          />

          <v-col
            cols="12"
            class="pa-0"
          >
            <a
              href="https://www.gov.br/funai/pt-br"
              target="_blank"
            >
              <v-img
                contain
                width="50"
                :src="logo_funai"
                class="logo-flags"
              />
            </a>
          </v-col>
        </l-control>

        <l-geo-json
          ref="interestArea"
          :geojson="interestArea"
          :options-style="interestStyle"
          :visible="showInterestArea"
        />

        <SupportUserLayersMap />

        <MapIndigenousLand />

        <SupportLayers />

        <LayersRaster />

        <!-- <ImageryLayers v-if="showImagery" :map="map" /> -->

        <CatalogLayers :map="map" />

        <!-- <ChangeDetectionLayers :map="map" /> -->

        <FileLoaderLayers
          :map="map"
          :files="loadedFiles"
          @loads="loaded()"
        />

        <MonitoringLayers :map="map" />

        <ProdesLayers :map="map" />

        <DeterLayers :map="map" />

        <FocoLayers :map="map" />

        <!-- <AlgorithmLayers /> -->

        <!-- <WebhooksLayers /> -->

        <BaseWmsMetadataPopup :map="map" />

        <LandUseLayers :map="map" />

        <PriorityLayers :map="map" />

        <AlertLayers :map="map" />
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
        "zoom-out": "Afastar"
    }
}
</i18n>

<script>
import 'leaflet-draw/dist/leaflet.draw.css';
import Vue from 'vue';
import { mapState, mapMutations, mapGetters } from 'vuex';
import interestArea from '@/assets/interest_area.json';
import MapPrinter from '@/components/map/print-map/MapPrinter';

import MapSearch from '@/components/map/MapSearch.vue';
import MapSearchTi from '@/components/map/MapSearchTi.vue';
import FileLoaderControl from '@/components/map/file-loader/FileLoaderControl.vue';
import FileLoaderLayers from '@/components/map/file-loader/FileLoaderLayers.vue';
// import ImageryLayers from '@/components/imagery/ImageryLayers'
import CatalogLayers from '@/components/catalog/CatalogLayers';
import MonitoringLayers from '@/components/monitoring-alerts/monitoring/MonitoringLayers';
// import MonitoringLayersGeoserver from '@/components/monitoring/MonitoringLayersGeoserver'
import SupportLayers from '@/components/support/SupportLayers';

import LayersRaster from '@/components/raster/LayersRaster';
// import ChangeDetectionLayers from '@/components/change-detection/ChangeDetectionLayers'
import BaseWmsMetadataPopup from '@/components/base/BaseWmsMetadataPopup';
// import AlgorithmLayers from '@/components/algorithms/AlgorithmLayers'
// import WebhooksLayers from '@/components/webhooks/WebhooksLayers'
import PriorityLayers from '@/components/priority/PriorityLayers';
import DeterLayers from '@/components/inpe/deter/DeterLayers.vue';
import AlertLayers from '@/components/monitoring-alerts/urgent-alerts/AlertLayers';
import LandUseLayers from '@/components/land-use/LandUseLayers';
import SupportUserLayersMap from '@/components/userLayer/SupportUserLayersMap';
import 'leaflet/dist/leaflet.css';
import 'leaflet-basemaps/L.Control.Basemaps.css';
import 'leaflet-minimap/dist/Control.MiniMap.min.css';
import DrawingPanel from '@/components/map/drawing-tool/DrawingPanel.vue';
import BaseTiMetadata from '../base/BaseTiMetadata.vue';
import Highlighter from '@/components/map/Highlighter.vue';
import MapIndigenousLand from '@/components/map/MapIndigenousLand';
import ProdesLayers from '@/components/inpe/prodes/ProdesLayers.vue';
import FocoLayers from '../inpe/foco/FocoLayers.vue';

if (typeof window !== 'undefined') {
  require('leaflet-basemaps');
  require('leaflet-minimap');
  require('leaflet-draw');
  require('@/plugins/text-box');
  require('leaflet.heat');
}

export default {
  name: 'Map',

  components: {
    // ImageryLayers,
    CatalogLayers,
    MonitoringLayers,
    // MonitoringLayersGeoserver,
    SupportLayers,
    MapSearch,
    MapSearchTi,
    FileLoaderControl,
    FileLoaderLayers,
    PriorityLayers,
    // ChangeDetectionLayers,
    BaseWmsMetadataPopup,
    // AlgorithmLayers,
    // WebhooksLayers,
    MapPrinter,
    LandUseLayers,
    AlertLayers,
    DeterLayers,
    LayersRaster,

    SupportUserLayersMap,
    DrawingPanel,
    MapIndigenousLand,
    Highlighter,
    BaseTiMetadata,
    ProdesLayers,
    FocoLayers,
  },

  props: {
    mainMap: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    selectedItems: [],
    isItemSelected: false,
    northArrow: process.env.NORTH_ARROW,
    logo_cmr: process.env.DEFAULT_LOGO_IMAGE_CMR,
    logo_funai: process.env.DEFAULT_LOGO_IMAGE_FUNAI,
    map: null,
    zoom: 4,
    minZoom: 2,
    maxBounds: [
      [-90, -280],
      [90, 280],
    ],
    mapOptions: {
      zoomControl: false,
      name: 'mainMap',
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
    selectedBaseMap: null,
    showMapPrinterButton: true,
    showImagery: process.env.IMAGERY === 'true',
    monitoringGeoserver: process.env.MONITORING_GEOSERVER === 'true',

    baseLayers: [
      {
        url: '//mt0.google.com/vt/lyrs=y&hl=pt&x={x}&y={y}&z={z}',
        options: {
          label: 'Google Hybrid',
          tag: 'Google Hybrid',
          attribution:
                        'Map data &copy; <a href="//maps.google.com/">Google</a> Hybrid',
          maxZoom: 21,
          maxNativeZoom: 19,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          zIndex: 1,
        },
      },
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
      {
        url: '//{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        options: {
          label: 'Google Satellite',
          tag: 'Google Satellite',
          attribution:
                        'Map data &copy; <a href="//maps.google.com/">Google</a> sattelite imagery',
          maxZoom: 21,
          maxNativeZoom: 19,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          zIndex: 1,
        },
      },
      // {
      //   url: '//mt0.google.com/vt/lyrs=r&hl=en&x={x}&y={y}&z={z}',
      //   options: {
      //     label: 'Google Roadmap',
      //     tag: 'Google Roadmap',
      //     attribution:
      //                  'Map data &copy; <a href="//maps.google.com/">Google</a> Altered roadmap',
      //     maxZoom: 21,
      //     maxNativeZoom: 19,
      //     subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      //     zIndex: 1,
      //   },
      // },

      // {
      //     url:
      //         '//securewatch.digitalglobe.com/earthservice/wmtsaccess?connectId=
      //         {connectid}&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&TileMatrixSet=
      //         EPSG:3857&LAYER=DigitalGlobe:ImageryTileService&FORMAT=image/jpeg&STYLE=
      //         &featureProfile=Vivid_2019&TileMatrix=EPSG:3857:{z}&TILEROW={y}&TILECOL={x}',
      //     options: {
      //         connectid: '750ba857-7952-41af-b189-316d907cc12a',
      //         label: 'MAXAR',
      //         tag: 'MAXAR',
      //         attribution:
      //             'Map data &copy; <a href="//securewatch.digitalglobe.com">Secure Watch
      //         </a> Digital Globe',
      //         maxZoom: 21,
      //         maxNativeZoom: 19,
      //         zIndex: 1,
      //     },
      // },
      {
        url: '//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        options: {
          label: 'CartoDB',
          tag: 'CartoDB',
          attribution:
                        'Map data &copy; <a href="//www.openstreetmap.org/">OpenStreetMap</a> contributors, CartoDB Imagery <a href="//creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
          maxZoom: 21,
          maxNativeZoom: 19,
          zIndex: 1,
        },
      },
      // {
      //     url: '//view.geoapi-airbusds.com/maps/wmts/52a994d7-f215-4c66-aa10-439221c29ee0/tile/
      //     1.0.0/8659bd97-ea52-474d-a3e9-072c335cd6bb/default/3857/{z}/{y}/{x}',
      //     options: {
      //         label: 'AirBus OneAtlas',
      //         tag: 'AirBus OneAtlas',
      //         attribution:
      //             'GeoAPI Airbus Service; Powered by: <a href=
      //        "//oneatlas.airbus.com/">OneAtlas - AIRBUS</a>',
      //         maxZoom: 21,
      //         maxNativeZoom: 14,
      //         zIndex: 1,
      //     },
      // },
      // {
      //     url: '//view.geoapi-airbusds.com/maps/wmts/eebb802c-9605-475f-8830-b7c00107cdc8/tile/
      //     1.0.0/61476829-d968-4588-821c-b0f9fae6ff8c/default/3857/{z}/{y}/{x}.png',
      //     options: {
      //         label: 'AirBus WorldDEM',
      //         tag: 'AirBus WorldDEM',
      //         attribution:
      //             'GeoAPI Airbus Service; Powered by:
      //         <a href="//oneatlas.airbus.com/">OneAtlas - AIRBUS</a>',
      //         maxZoom: 21,
      //         maxNativeZoom: 14,
      //         zIndex: 1,
      //     },
      // },
      {
        url: '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        options: {
          label: 'ArcMap',
          tag: 'ArcMap',
          attribution:
                        'Map data &copy; <a href="//desktop.arcgis.com/en/arcmap/">ArcGis Basemap</a>',
          maxZoom: 21,
          maxNativeZoom: 19,
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
      height: 0,
      width: 0,
    },
    localBounds: [],
  }),

  mounted() {
    window.mapMain.on('click', (e) => {
      this.$store.dispatch('getWmsFeatureInfo', e.latlng);
    });
  },

  computed: {
    initialExtentCoords() {
      return this.user && this.user.settings.initial_extent.coordinates
        ? this.$L.GeoJSON.coordsToLatLngs(
          this.user.settings.initial_extent.coordinates[0],
        )
        : [];
    },

    ...mapState('map', [
      'bounds',
      'boundsZoomed',
      'loading',
      'activeMenu',
      'tmsToPrint',
      'indigenousLand',
    ]),
    ...mapState('userProfile', ['user']),
    ...mapGetters('auth', ['isLoggedIn']),
  },

  watch: {
    boundsZoomed() {
      this.map.flyToBounds(this.bounds);
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.createMap();
    });
  },

  methods: {
    handleClose() {
      this.selectedItems = [];
    },

    onItemSelected(item) {
      const isAlreadySelected = this.selectedItems.some(
        (selected) => selected.terraIndigena === item.terraIndigena,
      );
      if (!isAlreadySelected) {
        this.selectedItems.push(item);
        this.isItemSelected = true;
      }
    },

    clearSelection() {
      this.selectedItems = [];
      this.isItemSelected = false;
    },

    isLoading() {
      this.setMapLoading(true);
    },

    loaded() {
      this.setMapLoading(false);
    },

    createPanes() {
      // TMS (base layer custom)
      this.map.createPane('tms-support-layers-map');
      this.map.getPane('tms-support-layers-map').style.zIndex = 401;

      // Support WMS
      this.map.createPane('support-layers-map');
      this.map.getPane('support-layers-map').style.zIndex = 420;

      // Monitoring WMS
      this.map.createPane('monitoring-layers-map');
      this.map.getPane('monitoring-layers-map').style.zIndex = 450;
    },

    createMap() {
      this.map = this.$refs.map.mapObject;
      window.mapMain = this.map;
      Vue.prototype.$mainMap = this.map;
      this.createPanes();
      this.map.on('zoomend', this.onZoomEnd);
      this.map.addEventListener('mousemove', this.refreshCoordinates);
      this.map.on('baselayerchange', this.changeBaseMap);
      this.createMapLayers();
      this.createCssRefs();
      this.createMiniMap();
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
      this.baseLayers.forEach((layer) => {
        const tileLayer = this.$L.tileLayer(layer.url, layer.options);
        tileLayers.push(tileLayer);
      });
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
      if (window.innerWidth <= 768) {
        this.miniMapOptions.height = 75;
        this.miniMapOptions.width = 75;
      } else {
        this.miniMapOptions.height = 125;
        this.miniMapOptions.width = 125;
      }
      this.miniMap = new this.$L.Control.MiniMap(
        miniMapLayer,
        this.miniMapOptions,
      );
      this.miniMap.addTo(this.map);
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

    changeBaseMap(event) {
      this.selectedBaseMap = event;
      if (event.options.tag === 'Mosaics Planet 2024-02') {
        this.showMapPrinterButton = false;
      } else {
        this.showMapPrinterButton = true;
      }
    },

    refreshCoordinates(event) {
      this.cursorCoordinates.lat = event.latlng.lat.toFixed(4);
      this.cursorCoordinates.lng = event.latlng.lng.toFixed(4);
    },

    ...mapMutations('map', [
      'setBounds',
      'setMapLoading',
      'setLocalBounds',
      'setActiveMenu',
      'setActiveMenuMarker',
    ]),
  },
};
</script>

<style lang="sass">
.leaflet-draw-tooltip
  z-index: 6

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

.nation-logo-container
  margin-left: -3px

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

.leaflet-logo-control
  margin-left: 6px !important
  margin-bottom: 15px

.northArrow
  margin-left: -3px
  opacity: 0.4
  transition: all ease 0.1s

.northArrow:hover
  opacity: 1
  transform: scale(1.1)

@media print
  .leaflet-control-zoom
    display: none

@media (max-width: 768px)

  .basemap img
    width: 54px

  .basemap span
    font-size: 10px
</style>
