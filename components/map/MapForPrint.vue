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
          :bounds="bounds"
        >
          <l-tile-layer
            v-if="!selectedBaseMap"
            url="//{s}.tile.osm.org/{z}/{x}/{y}.png"
            :attribution="attribution"
          />

          <l-tile-layer
            v-if="selectedBaseMap && selectedBaseMap.options.label!='Bing'"
            :url="selectedBaseMap._url"
            :attribution="selectedBaseMap.options.attribution"
            :options="optionsMap"
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
          <PriorityLayers :map="map" />
          <MonitoringLayers :map="map" />
          <SupportLayers />
          <SupportLayersHazard />
          <SupportLayersProdes />
          <SupportLayersRaster />
          <AlertLayers :map="map" />
          <DeterLayers :map="map" />
          <LandUseLayers :map="map" />
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
            Centro de Monitoramento Remoto - Fundação Nacional do
            Índio
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
                class="ma-0 pa-0"
              >
                <p class="ma-1 pa-0 print-mini-map-text">
                  LOCALIZAÇÃO DA ÁREA
                </p>
              </l-control>
            </l-map>
          </client-only>
        </div>
        <div>
          <p class="d-block ma-1">
            Legenda:
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
                  <p>Polígonos Prioritários: Muito Alta</p>
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
                  <p>Polígonos Prioritários: Alta</p>
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
                  <p>Polígonos Prioritários: Média</p>
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
                  <p>Polígonos Prioritários: Baixa</p>
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
                  <p>Polígonos Prioritários: Muito Baixa</p>
                </v-col>
              </v-row>
            </div>
            <div>
              <v-row
                v-if="showFeaturesMonitoring || showFeaturesUrgentAlert"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#dd2c00"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Corte Raso (CR)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesMonitoring || showFeaturesUrgentAlert"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#800080"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Desmatamento em Regeneração (DR)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesMonitoring || showFeaturesUrgentAlert"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#a93130"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Fogo em Floresta (FF)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesMonitoring || showFeaturesUrgentAlert"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#ff7f00"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Degradação (DG)</p>
                </v-col>
              </v-row>
            </div>
            <div>
              <v-row
                v-if="showFeaturesDeter"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#cca300"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Desmatamento Cr (DC)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesDeter"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#669999"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Cs Geométrico (CG)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesDeter"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#ff8000"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Degradação (DG)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesDeter"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#cccc00"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Mineração (MI)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesDeter"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#ff4dff"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Cs Desordenado (CD)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesDeter"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#b2b266"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Desmatamento Veg (DV)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesDeter"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#330000"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Cicatriz de Queimada (CQ)</p>
                </v-col>
              </v-row>
            </div>
            <div>
              <v-row
                v-if="showFeaturesLandUse"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#ffff00"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Agropecuária (AG)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesLandUse"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#66ffff"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Massa de Água (MA)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesLandUse"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#cc9966"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Vilarejo (VI)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesLandUse"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#00cc00"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Vegetação Natural (VN)</p>
                </v-col>
              </v-row>
              <v-row
                v-if="showFeaturesLandUse"
                no-gutters
                align="center"
              >
                <v-icon
                  x-small
                  color="#ff3333"
                >
                  mdi-square
                </v-icon>
                <v-col
                  no-gutters
                  cols="6"
                >
                  <p>Corte Raso (CR)</p>
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
                    width="30vw"
                    alt="CorLayer"
                  >
                  <v-col>
                    <p class="ml-1">
                      {{ layer.name }}
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
                    width="30vw"
                    alt="CorLayer"
                  >
                  <v-col>
                    <p class="ml-1">
                      {{ layer.name }}
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
                    width="30vw"
                    alt="CorLayer"
                  >
                  <v-col>
                    <p class="ml-1">
                      {{ layer.name }}
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
            <div v-if="showFeaturesSupportLayersProdes">
              <div
                v-for="layer in supportLayersCategoryProdes"
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
                    width="60vw"
                    alt="CorLayer"
                  >
                  <v-col>
                    <p class="ml-1">
                      {{ layer.name }}
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
                    width="30vw"
                    alt="CorLayer"
                  >
                  <v-col>
                    <p class="ml-1">
                      {{ layer.name }}
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
          </div>
          <v-divider />
          <div class="ma-1">
            <p class="font-weight-bold">
              Bases Cartográficas:
            </p>
            <div v-if="showFeatures">
              <p>
                - Polígonos Prioritários presentes no território
                Brasileiro. Fonte: Banco de Dados Funai - 2023
              </p>
            </div>
            <div v-if="showFeaturesMonitoring">
              <p>
                - Monitoramento Diário. Fonte: Banco de Dados
                Funai - 2023
              </p>
            </div>
            <div v-if="showFeaturesUrgentAlert">
              <p>
                - Alerta Urgente. Fonte: Banco de Dados Funai -
                2023
              </p>
            </div>
            <div v-if="showFeaturesDeter">
              <p>
                - Deter. Fonte: Banco de Dados Funai -
                2023
              </p>
            </div>
            <div v-if="showFeaturesLandUse">
              <p>
                - Uso e Ocupação do Solo. Fonte: Banco de Dados Funai -
                2023
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
                      - {{ layer.name }} presente no
                      território brasileiro.
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
                      - {{ layer.name }} presente no
                      território brasileiro.
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
                      - {{ layer.name }} presente no
                      território brasileiro.
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
            <div v-if="supportLayersCategoryProdes">
              <div
                v-for="layer in supportLayersCategoryProdes"
                :key="layer.id"
              >
                <v-row
                  v-if="layer.visible"
                  no-gutters
                >
                  <v-col>
                    <p>
                      - {{ layer.name }} presente no
                      território brasileiro.
                    </p>
                  </v-col>
                </v-row>
              </div>
            </div>
          </div>
          <v-divider />

          <div class="ma-1">
            <p>
              CENTRO DE MONITORAMENTO REMOTO -
              https://cmr.funai.gov.br | Data da impressão:
              {{ todayDate() }}
            </p>
          </div>
          <v-divider />
          <div class="ma-1">
            <p>
              As informações podem apresentar distorções em função
              das bases cartográficas utilizadas.
            </p>
            <p>Modelo de mapa adaptado para formato A4.</p>
          </div>
          <v-divider v-if="showFeaturesMonitoring" />
          <div
            v-if="showFeaturesMonitoring"
            class="ma-1"
          >
            <p>
              A área mencionada na tabela representa a área total de cada classe por Terra Indígena
              e não necessariamente reflete os dados visualizados na tela do mapa
            </p>
            <p>
              Data Inicial: {{ filters.startDate }}
              <br>
              Data Final: {{ filters.endDate }}
            </p>
          </div>
        </div>
      </div>
    </v-col>
    <div
      v-if="showFeaturesMonitoring"
      style="width: 100%"
    >
      <v-data-table
        :headers="headers"
        :items="analyticsMonitoring"
        hide-default-footer
        class="elevation-1"
      />
    </div>
  </v-row>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import MiniMapForPrint from '@/components/map/MiniMapForPrint.vue';
import PriorityLayers from '@/components/priority/PriorityLayers';
import MonitoringLayers from '@/components/monitoring/MonitoringLayers';
import SupportLayers from '@/components/support/SupportLayers';
import SupportLayersHazard from '@/components/support/SupportLayersHazard';
import SupportLayersProdes from '@/components/support/SupportLayersProdes';
import SupportLayersRaster from '@/components/support/SupportLayersRaster';
import AlertLayers from '@/components/urgent-alerts/AlertLayers';
import DeterLayers from '@/components/deter/DeterLayers';
import LandUseLayers from '@/components/land-use/LandUseLayers';

if (typeof window !== 'undefined') {
  require('leaflet-bing-layer');
}

const cloneLayer = require('leaflet-clonelayer');
const intervalZooms = require('@/utils/zoomIntervalsGraticule');

export default {
  components: {
    MiniMapForPrint,
    PriorityLayers,
    MonitoringLayers,
    SupportLayers,
    AlertLayers,
    DeterLayers,
    SupportLayersProdes,
    SupportLayersRaster,
    SupportLayersHazard,
    LandUseLayers,
  },
  props: {
    titleMap: {
      type: String,
      default: '',
    },

    selectedBaseMap: {
      type: Object,
      default: null,
    },

    leafSize: {
      type: Object,
      default: '',
    },
  },
  data: () => ({

    headers: [
      { text: 'TI', value: 'no_ti' },
      { text: 'Área CR (ha)', value: 'cr_nu_area_ha' },
      { text: 'Área DG (ha)', value: 'dg_nu_area_ha' },
      { text: 'Área DR (ha)', value: 'dr_nu_area_ha' },
      { text: 'Área FF (ha)', value: 'ff_nu_area_ha' },
    ],
    map: null,
    miniMap: null,
    zoom: 1,
    zoomMiniMap: 4,
    valueScale: null,
    valueNorthArrow: null,
    somatorioTotal: 0,
    bingKey: 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L',
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
    ...mapState('map', ['bounds', 'localBounds']),
    ...mapState('priority', ['showFeatures', 'detail']),
    ...mapState('monitoring', ['showFeaturesMonitoring', 'analyticsMonitoring', 'filters']),
    ...mapState('urgent-alerts', ['showFeaturesUrgentAlert']),
    ...mapState('deter', ['showFeaturesDeter']),
    ...mapState('land-use', ['showFeaturesLandUse']),
    ...mapState('supportLayers', [
      'showFeaturesSupportLayers',
      'supportLayers',
      'supportLayersCategoryAntropismo',
      'supportLayersCategoryFire',
      'supportLayersCategoryRaster',
      'showFeaturesSupportLayersProdes',
      'supportLayersCategoryProdes',
    ]),
  },

  mounted() {
    if (this.showFeaturesMonitoring) {
      this.getDataAnalyticsMonitoringByFunai();
    }
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

        if (this.selectedBaseMap && this.selectedBaseMap.options.label === 'Bing') {
          const bingLayer = this.createBingLayer();
          this.map.addLayer(bingLayer);
        }

        this.$mainMap.eachLayer((layer) => {
          const cloned = cloneLayer(layer);
          this.map.addLayer(cloned);
        });

        this.miniMap.setZoom(4);

        this.valueScale = true;
        this.valueNorthArrow = true;
      } catch (error) {
        error === '';
      }
    },

    createBingLayer() {
      // Bing layer has need to be generated before being inserted
      // on tileLayers array, and is generated by the Plugin
      // leaflet-bing-layer
      const bingLayer = this.$L.tileLayer.bing(this.bingKey, {
        imagerySet: 'AerialWithLabelsOnDemand',
        maxZoom: 21,
        maxNativeZoom: 16,
      });
      bingLayer.options.attribution = 'Map data &copy; Bing contributors';
      bingLayer.options.iconURL = '/img/bing.png';
      bingLayer.options.label = 'Bing';
      bingLayer.options.tag = 'Bing';

      return bingLayer;
    },

    onMainMapMoved(e) {
      this.miniMap.setView(this.map.getCenter(), 4);
    },

    onMainMapMoving(e) {
      this.aimingRect.setBounds(this.map.getBounds());
    },
    ...mapActions('monitoring', ['getDataAnalyticsMonitoringByFunai']),
  },
};
</script>

<style scoped>
p {
    font-size: xx-small;
    margin: 0;
}
.print-mini-map-text {
    color: dimgray !important;
    font-size: xx-small;
    white-space: nowrap;
}
.border_container {
    border-right: 0.5px solid gray;
    border-top: 0.5px solid gray;
    border-bottom: 0.5px solid gray;
    height: 100%;
}
.hight_container_mini_map {
    height: 150px;
    max-height: 150px;
    width: 100%;
}

.hight_data_table {
    height: 100px;
    max-height: 100px;
    width: 100%;
}
</style>

<style>
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
.leaflet-container {
    background-color: rgba(255, 255, 255, 0.7) !important;
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
</style>
