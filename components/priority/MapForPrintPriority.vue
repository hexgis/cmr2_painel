<template>
  <v-row
    no-gutters
    style="width: 1123px; height: 700px"
  >
    <v-col
      cols="8"
      class="pr-0"
    >
      <client-only>
        <l-map
          id="printMap"
          ref="printMap"
          :zoom="zoom"
          :options="optionsMap"
          :bounds="initialBounds"
        >
          <l-tile-layer
            url="//{s}.tile.osm.org/{z}/{x}/{y}.png"
            :attribution="attribution"
          />

          <l-control-scale
            v-if="valueScale"
            position="bottomleft"
          />
          <l-control
            v-if="valueNorthArrow"
            position="bottomleft"
          >
            <img
              src="@/assets/north-arrow.png"
              alt="northarrow"
              class="north-arrow"
            >
          </l-control>
          <PriorityIndividualLayer :map="map" />
          <SupportLayers />
          <SupportLayersRaster />

          <SupportLayersProdes />

          <SupportLayersHazard />
        </l-map>
      </client-only>
    </v-col>
    <v-col
      cols="4"
      class="pl-1"
    >
      <div class="border_container">
        <div class="d-flex justify-center align-center ma-2">
          <div style="width: 20%">
            <v-img
              contain
              class="mr-4"
              src="/img/funai.svg"
            />
          </div>
          <div style="width: 35%">
            <v-img
              contain
              src="/img/logo-inteira-antiga.svg"
            />
          </div>
        </div>
        <div class="text-center font-weight-bold">
          <p class="font-weight-bold mb-1">
            {{ titleMap }}
          </p>
          <p class="mb-2">
            {{ $t('map-title') }}
          </p>
        </div>
        <div class="d-flex justify-center hight_container_mini_map">
          <client-only>
            <l-map
              id="miniPrintMap"
              ref="miniPrintMap"
              :zoom="zoomMiniMap"
              :options="optionsMiniMap"
            >
              <l-tile-layer
                url="//{s}.tile.osm.org/{z}/{x}/{y}.png"
                :attribution="attribution"
              />
              <l-control
                position="topleft"
                class="ma-0"
              >
                <p class="ma-1 print-mini-map-text">
                  {{ $t('map-location-label') }}
                </p>
              </l-control>
            </l-map>
          </client-only>
        </div>
        <div>
          <p class="d-block ma-1">
            {{ $t('legend-title') }}
          </p>
          <div
            class="ma-1 flex-wrap"
            style="width: 100%"
          >
            <div v-if="showFeatures">
              <v-row
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#9400D3"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>{{ $t('priority-polygons.very-high') }}</p>
                </v-col>
              </v-row>
              <v-row
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#FF0000"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>{{ $t('priority-polygons.high') }}</p>
                </v-col>
              </v-row>
              <v-row
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#FF8C00"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>{{ $t('priority-polygons.medium') }}</p>
                </v-col>
              </v-row>
              <v-row
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#FFD700"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>{{ $t('priority-polygons.low') }}</p>
                </v-col>
              </v-row>
              <v-row
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#008000"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>{{ $t('priority-polygons.very-low') }}</p>
                </v-col>
              </v-row>
            </div>
            <div v-if="showFeaturesSupportLayers">
              <div
                v-for="layer in supportLayersCategoryAntropismo"
                :key="layer.id"
              >
                <v-row
                  v-if="layer.visible"
                  no-gutters
                  align="center"
                >
                  <img
                    :src="
                      layer.wms.geoserver.preview_url +
                        layer.wms.geoserver_layer_name
                    "
                    width="13vw"
                    alt="CorLayer"
                  >
                  <v-col>
                    <p class="ml-1">
                      {{ $t('support-layer-label', { layer: layer.name }) }}
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
            <div v-if="showFeaturesSupportLayers">
              <div
                v-for="layer in supportLayersCategoryFire"
                :key="layer.id"
              >
                <v-row
                  v-if="layer.visible"
                  no-gutters
                  align="center"
                >
                  <img
                    :src="
                      layer.wms.geoserver.preview_url +
                        layer.wms.geoserver_layer_name
                    "
                    width="13vw"
                    alt="CorLayer"
                  >
                  <v-col>
                    <p class="ml-1">
                      {{ $t('support-layer-label', { layer: layer.name }) }}
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
            <div v-if="showFeaturesSupportLayers">
              <div
                v-for="layer in supportLayersCategoryRaster"
                :key="layer.id"
              >
                <v-row
                  v-if="layer.visible"
                  no-gutters
                  align="center"
                >
                  <img
                    :src="
                      layer.wms.geoserver.preview_url +
                        layer.wms.geoserver_layer_name
                    "
                    width="13vw"
                    alt="CorLayer"
                  >
                  <v-col>
                    <p class="ml-1">
                      {{ $t('support-layer-label', { layer: layer.name }) }}
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
            <div v-if="showFeaturesSupportLayers">
              <div
                v-for="layer in supportLayers"
                :key="layer.id"
              >
                <v-row
                  v-if="layer.visible"
                  no-gutters
                  align="center"
                >
                  <img
                    :src="
                      layer.wms.geoserver.preview_url +
                        layer.wms.geoserver_layer_name
                    "
                    width="13vw"
                    alt="CorLayer"
                  >
                  <v-col>
                    <p class="ml-1">
                      {{ $t('support-layer-label', { layer: layer.name }) }}
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
          </div>
          <v-divider />
          <div class="ma-1">
            <p class="font-weight-bold">
              {{ $t('cartographic-bases-title') }}
            </p>
            <div v-if="showFeatures">
              <p>
                {{ $t('priority-polygons-data-source') }}
              </p>
            </div>
            <div v-if="showFeaturesSupportLayers">
              <div
                v-for="layer in supportLayers"
                :key="layer.name"
              >
                <v-row
                  v-if="layer.visible"
                  no-gutters
                >
                  <v-col>
                    <p>
                      {{ $t('support-layer-label', { layer: layer.name }) }}
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
            <div v-if="supportLayersCategoryAntropismo">
              <div
                v-for="layer in supportLayersCategoryAntropismo"
                :key="layer.name"
              >
                <v-row
                  v-if="layer.visible"
                  no-gutters
                >
                  <v-col>
                    <p>
                      {{ $t('support-layer-label', { layer: layer.name }) }}
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
            <div v-if="supportLayersCategoryFire">
              <div
                v-for="layer in supportLayersCategoryFire"
                :key="layer.id"
              >
                <v-row
                  v-if="layer.visible"
                  no-gutters
                >
                  <v-col>
                    <p>
                      {{ $t('support-layer-label', { layer: layer.name }) }}
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
          </div>
          <v-divider />
          <div class="ma-1 disclaimer">
            <p>
              {{ $t('disclaimer-1', todayDate() ) }}
            </p>
            <p>
              {{ $t('disclaimer-2') }}
            </p>
            <p>
              {{ $t('disclaimer-3') }}
            </p>
          </div>
        </div>
      </div>
    </v-col>
    <div v-if="detail != []">
      <v-data-table
        :headers="headers"
        :items="detail"
        hide-default-footer
      />
    </div>
  </v-row>
</template>
<i18n>
  {
    "en": {
      "map-title": "Monitoring Remote Center - National Indian Foundation",
      "map-location-label": "AREA LOCATION",
      "legend-title": "Legend:",
      "priority-polygons": {
        "very-high": "Priority Polygons: Very High",
        "high": "Priority Polygons: High",
        "medium": "Priority Polygons: Medium",
        "low": "Priority Polygons: Low",
        "very-low": "Priority Polygons: Very Low"
      },
      "cartographic-bases-title": "Cartographic Bases:",
      "priority-polygons-data-source": "- Priority polygons present in the Brazilian territory. Source: Funai Database - 2022",
      "support-layer-label": "- {layer} present in the Brazilian territory.",
      "disclaimer-1": "Monitoring Remote Center - https://cmr.funai.gov.br | Print date: {date}",
      "disclaimer-2": "The information may present distortions due to the cartographic bases used.",
      "disclaimer-3": "Map model adapted for A4 format."
    },
    "pt": {
      "map-title": "Centro de Monitoramento Remoto - Fundação Nacional do Índio",
      "map-location-label": "LOCALIZAÇÃO DA ÁREA",
      "legend-title": "Legenda:",
      "priority-polygons": {
        "very-high": "Polígonos Prioritários: Muito Alta",
        "high": "Polígonos Prioritários: Alta",
        "medium": "Polígonos Prioritários: Média",
        "low": "Polígonos Prioritários: Baixa",
        "very-low": "Polígonos Prioritários: Muito Baixa"
      },
      "cartographic-bases-title": "Bases Cartográficas:",
      "priority-polygons-data-source": "- Polígonos Prioritários presentes no território Brasileiro. Fonte: Banco de Dados Funai - 2022",
      "support-layer-label": "- {layer} presente no território brasileiro.",
      "disclaimer-1": "Centro de Monitoramento Remoto - https://cmr.funai.gov.br | Data da impressão: {date}",
      "disclaimer-2": "As informações podem apresentar distorções em função das bases cartográficas utilizadas.",
      "disclaimer-3": "Modelo de mapa adaptado para formato A4."
    }
  }
  </i18n>

<script>
import { mapState } from 'vuex';
import MiniMapForPrintPriority from '@/components/priority/MiniMapForPrintPriority.vue';
import PriorityIndividualLayer from '@/components/priority/PriorityIndividualLayer';
import MonitoringLayers from '@/components/monitoring-alerts/monitoring/MonitoringLayers';
import SupportLayers from '@/components/support/SupportLayers';
import AlertLayers from '@/components/monitoring-alerts/urgent-alerts/AlertLayers';
import SupportLayersHazard from '@/components/support/SupportLayersHazard';
import SupportLayersProdes from '@/components/support/SupportLayersProdes';
import SupportLayersRaster from '@/components/support/SupportLayersRaster';

const intervalZooms = require('@/utils/zoomIntervalsGraticule');

export default {
  components: {
    MiniMapForPrintPriority,
    PriorityIndividualLayer,
    MonitoringLayers,
    SupportLayers,
    AlertLayers,
    SupportLayersRaster,
    SupportLayersProdes,
    SupportLayersHazard,
  },
  props: {
    titleMap: {
      type: String,
      default: '',
    },
    leafSize: {
      type: Object,
      default: '',
    },
  },
  data: () => ({
    headers: [
      { text: 'Terra Indígena', value: 'no_ti' },
      { text: 'Código Funai', value: 'co_funai' },
      { text: 'Coordenação Regional', value: 'ds_cr' },
      { text: 'Classe', value: 'no_estagio' },
      { text: 'Área do Polígono (ha)', value: 'nu_area_ha' },
      { text: 'Latitude', value: 'nu_latitude' },
      { text: 'Longitude', value: 'nu_longitude' },
      { text: 'Prioridade', value: 'prioridade' },
    ],
    map: null,
    miniMap: null,
    zoom: 1,
    zoomMiniMap: 4,
    valueScale: null,
    valueNorthArrow: null,
    initialBounds: [
      [-33.8689056, -73.9830625],
      [5.2842873, -28.6341164],
    ],
    attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | <span style="color: red; font-weight: bold; width: 100%">Mapa não oficial</span>',
    optionsMap: {
      name: 'printMap',
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: false,
    },
    optionsMiniMap: {
      name: 'printMiniMap',
      zoomControl: false,
      dragging: false,
      boxZoom: false,
      touchZoom: false,
      keyboard: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    },
  }),

  computed: {
    ...mapState('map', []),
    ...mapState('priority', ['showFeatures', 'detail']),
    ...mapState('monitoring', ['showFeaturesMonitoring']),
    ...mapState('urgent-alerts', ['showFeaturesUrgentAlerts']),
    ...mapState('supportLayers', [
      'showFeaturesSupportLayers',
      'supportLayers',
      'supportLayersCategoryAntropismo',
      'supportLayersCategoryFire',
      'supportLayersCategoryRaster',
    ]),
  },

  mounted() {
    this.$nextTick(() => {
      this.createMap();
    });
  },

  methods: {
    todayDate() {
      const date = new Date();
      const dd = date.getDate();
      const mm = date.getMonth() + 1;
      const yyyy = date.getFullYear();
      return `${dd < 10 ? `0${dd}` : dd}/${
        mm < 10 ? `0${mm}` : mm
      }/${yyyy}`;
    },

    createMap() {
      try {
        require('@/plugins/L.SimpleGraticule');
        require('@/plugins/L.Control.MapBounds');

        this.map = this.$refs.printMap.mapObject;
        this.miniMap = this.$refs.miniPrintMap.mapObject;

        window.L = this.$L; // define leaflet global

        const currentBouldMap = this.map.getBounds();
        this.aimingRect = L.rectangle(currentBouldMap, {
          color: '#e31a1c',
          weight: 3,
          opacity: 0.37,
          fillOpacity: 0,
        }).addTo(this.miniMap);

        this.map.invalidateSize();
        this.map.on('move', this.onMainMapMoving);
        this.map.on('moveend', this.onMainMapMoved);
        this.miniMap.fitBounds(this.map.getBounds());

        L.control
          .mapBounds({
            type: 'center',
            position: 'bottomleft',
            template: 'Centroide do mapa: {y} , {x} ',
          })
          .addTo(this.map);
        const options = {
          interval: 20,
          showOriginLabel: true,
          redraw: 'move',
          zoomIntervals: intervalZooms.default[this.leafSize.type],
        };

        L.simpleGraticule(options).addTo(this.map);

        this.miniMap.setZoom(4);

        this.valueScale = true;
        this.valueNorthArrow = true;
      } catch (error) {
        error === '';
      }
    },

    onMainMapMoved() {
      this.miniMap.setView(this.map.getCenter(), 4);
    },

    onMainMapMoving() {
      this.aimingRect.setBounds(this.map.getBounds());
    },

  },
};
</script>

<style scoped>
.print-mini-map-text {
    color: dimgray !important;
    background: white;
    white-space: nowrap;
}

.hight_container_mini_map {
    height: 150px;
    max-height: 150px;
    width: 100%;
}

.v-dialog:not(.v-dialog--fullscreen) {
  max-height: 100%;
}

.leaflet-grid-label .gridlabel-vert {
    margin-left: 8px;
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
}

.leaflet-grid-label .gridlabel-vert,
.leaflet-grid-label .gridlabel-horiz {
    padding-left: 2px;
    text-shadow: -2px 0 #ffffff, 0 2px #ffffff, 2px 0 #ffffff, 0 -2px #ffffff;
}

.leaflet-container .leaflet-control-mapbounds,
.leaflet-container .leaflet-control-attribution {
    background-color: rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 0 5px #bbb !important;
    padding: 0 5px !important;
    margin: 0 !important;
    color: #333 !important;
    font: 11px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif !important;
}
.north-arrow,
.north-arrow:after {
    height: 35px;
    width: 30px;
}

.leaflet-control-attribution {
    white-space: nowrap !important;
}

.v-card__subtitle, .v-card__text, .v-card__title{
    padding: 8px 16px;
}
</style>
