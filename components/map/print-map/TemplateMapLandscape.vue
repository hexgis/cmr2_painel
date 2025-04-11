<template>
  <div>
    <style>
      @media print {
        @page {
          size: landscape;
          margin: 0;
        }
      }
    </style>
    <v-dialog v-model="showDialog" width="auto" persistent>
      <v-card-title class="no-print theme--dark secondary white--text d-flex justify-space-between">
        <span>{{ $t('print-out') }}</span>
        <v-btn icon @click="$emit('close')">
          <v-icon class="white--text">
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-container style="background-color: white; max-width: 100%">
        <v-row id="map-for-print" no-gutters style="width: 1230px; height: 780px; max-height: 780px; overflow: hidden">
          <v-col id="monitoring-data-details" cols="8" class="pr-0 mt-2" style="max-height: 780px;">
            <div id="data-table" class="leaflet-bottom leaflet-right">
              <!-- Primeira condição -->
              <template v-if="teste >= 0 && teste <= 7">
                <template v-if="showFeaturesMonitoring && !hasLongMonitoringInfo">
                  <div v-for="(item, i) in analyticsMonitoring" :key="'monitoring-' + item.no_ti + i"
                    class="text-center bordered-red">
                    <p>
                      <strong>TI {{ item.no_ti }}</strong>
                    </p>
                    <p>
                      Área da TI: {{ formatNumber(item.ti_nu_area_ha) }} ha
                    </p>
                    <p v-if="item.cr_nu_area_ha">
                      CR: {{ formatNumber(item.cr_nu_area_ha) }} ha
                    </p>
                    <p v-if="item.dg_nu_area_ha">
                      DG: {{ formatNumber(item.dg_nu_area_ha) }} ha
                    </p>
                    <p v-if="item.dr_nu_area_ha">
                      DR: {{ formatNumber(item.dr_nu_area_ha) }} ha
                    </p>
                    <p v-if="item.ff_nu_area_ha">
                      FF: {{ formatNumber(item.ff_nu_area_ha) }} ha
                    </p>
                  </div>
                </template>
                <template v-if="showFeaturesLandUse && tableLandUse.length <= 7">
                  <div v-for="(item, index) in tableLandUse" :key="'landuse-' + index"
                    class="text-center bordered-blue">
                    <p>
                      <strong>TI {{ item.no_ti }}</strong>
                    </p>
                    <p v-if="parseFloat(item.nu_area_ha) > 0">
                      Área da TI: {{ formatNumber(item.nu_area_ha) }} ha
                    </p>
                    <p v-if="parseFloat(item.nu_area_vn_ha) > 0">
                      VN: {{ formatNumber(item.nu_area_vn_ha) }} ha
                    </p>
                    <p v-if="parseFloat(item.nu_area_cr_ha) > 0">
                      CR: {{ formatNumber(item.nu_area_cr_ha) }} ha
                    </p>
                    <p v-if="parseFloat(item.nu_area_dg_ha) > 0">
                      DG: {{ formatNumber(item.nu_area_dg_ha) }} ha
                    </p>
                    <p v-if="parseFloat(item.nu_area_ma_ha) > 0">
                      MA: {{ formatNumber(item.nu_area_ma_ha) }} ha
                    </p>
                    <p v-if="parseFloat(item.nu_area_sv_ha) > 0">
                      SV: {{ formatNumber(item.nu_area_sv_ha) }} ha
                    </p>
                    <p v-if="parseFloat(item.nu_area_vi_ha) > 0">
                      VI: {{ formatNumber(item.nu_area_vi_ha) }} ha
                    </p>
                    <p v-if="parseFloat(item.nu_area_ag_ha) > 0">
                      AG: {{ formatNumber(item.nu_area_ag_ha) }} ha
                    </p>
                    <p v-if="parseFloat(item.nu_area_rv_ha) > 0">
                      RV: {{ formatNumber(item.nu_area_rv_ha) }} ha
                    </p>
                    <p v-if="parseFloat(item.nu_area_mi_ha) > 0">
                      MI: {{ formatNumber(item.nu_area_mi_ha) }} ha
                    </p>
                    <p v-if="parseFloat(item.nu_area_no_ha) > 0">
                      NO: {{ formatNumber(item.nu_area_no_ha) }} ha
                    </p>
                  </div>
                </template>
              </template>
            </div>

            <v-card v-if="showWarningMessage" class="warning-message" elevated>
              <v-card-text>
                <p class="text-subtitle-1">
                  {{ $t('warning-message') }}
                </p>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" text @click="showWarningMessage = false">
                  {{ $t('agree') }}
                </v-btn>
              </v-card-actions>
            </v-card>
            <MapForPrint :leaf-size="leafSize" :main-map="mainMap" :selected-base-map="selectedBaseMap"
              class="map-wrapper" @updateBounds="updateBounds" @getCenter="getCenter" />
          </v-col>
          <v-col cols="4" class="pl-1 mt-2">
            <div class="border_container">
              <div class="d-flex justify-space-between pl-8 pr-8 ga-1 align-center ma-4">
                <div style="width: 20%">
                  <v-img contain :src="logo_funai" class="logo" />
                </div>
                <div style="width: 60%">
                  <v-img contain :src="logo_cmr" class="logo" />
                </div>
              </div>
              <div class="font-title pb-2">
                <p>
                  {{ mapTitle }}
                </p>
                <p>
                  {{ print_title }}
                </p>
              </div>
              <div class="d-flex justify-center hight_container_mini_map">
                <MiniMap v-if="currentBouldMap" :current-bould-map="currentBouldMap" :map-center="mapCenter" />
              </div>
              <div class="legend-info-map">
                <div class="legend-info-map legend-info-map-details">
                  <div>
                    <p v-if="hasLegend" class="d-block ma-1">
                      <strong style="font-size: small">{{ $t('legend') }}</strong>
                    </p>
                    <div class="ma-1 flex-wrap" style="
                        width: 100%;
                        max-height: 100%;
                        overflow: hidden;
                      ">
                      <div style="
                          display: flex;
                          justify-content: flex-start;
                          align-items: flex-start;
                          gap: 5px;
                        " />
                      <LayerList :layers="supportLayersCategoryFire" />

                      <div style="
                          display: flex;
                          justify-content: flex-start;
                          align-items: flex-start;
                          gap: 5px;
                        ">
                        <div v-if="showFeaturesMonitoring">
                          <p>
                            <strong> Monitoramento Diário </strong>
                            <v-chip x-small>
                              {{ totalMonitoring }}
                            </v-chip>
                          </p>
                          <hr style="
                              border: 1px solid red;
                              margin: 0;
                            ">
                          <LayerList v-if="showFeaturesMonitoring" :layers="activeMonitoringLabel" :monitoring="true" />
                        </div>
                        <div v-if="showFeaturesUrgentAlerts && (!showFeaturesLandUse || !showFeaturesSupportLayers)">
                          <p>
                            <strong>Alerta Urgente</strong>
                          </p>
                          <hr style="border: 1px solid blue;margin: 0; margin-top: 3px;">
                          <CustomizedLegend v-if="showFeaturesUrgentAlerts" :items="urgentAlertItems" />
                        </div>
                        <div v-if="showFeaturesLandUse">
                          <p>
                            <strong>Uso e Ocupação</strong>
                            <v-chip x-small>
                              {{ tableLandUse.length }}
                            </v-chip>
                          </p>
                          <hr style="border: 1px solid blue;margin: 0;">
                          <CustomizedLegend v-if="showFeaturesLandUse" :items="landUseCategories" />
                        </div>
                        <div v-if="
                          showFeaturesSupportLayers
                          && (Object.values(supportLayers).filter(l => l.visible).length)
                          && (Object.values(supportLayers).filter(l => l.visible).length <= 7
                            && Object.values(supportLayerUser).filter(l => l.visible).length <= 7)
                        ">
                          <p>
                            <strong>Sobreposição de camadas</strong>
                          </p>
                          <hr style="border: 1px solid blue;margin: 0; margin-top: 3px;">
                          <LayerList :layers="supportLayerUser" :is-user-layer="true" />
                          <LayerList v-if="showFeaturesSupportLayers" :layers="supportLayers" class="mt-1" />
                        </div>
                      </div>
                      <LayerList :layers="supportLayersCategoryProdes" :prodes="true" />

                      <div
                        v-if="showFeaturesUrgentAlerts && showFeaturesMonitoring && showFeaturesLandUse && showFeaturesSupportLayers">
                        <p>
                          <strong>Alerta Urgente</strong>
                        </p>
                        <hr style="border: 1px solid blue;margin: 0;">
                        <CustomizedLegend v-if="showFeaturesUrgentAlerts" :items="urgentAlertItems" />
                      </div>

                      <CustomizedLegend v-if="showFeaturesDeter" :items="deterItems" />
                    </div>
                  </div>
                  <div>
                    <v-divider />
                    <p v-if="hasCartographicDatasets" class="d-block ma-1">
                      Bases Cartográficas:
                    </p>
                    <div v-if="activeRasterLayers.length" class="ml-1">
                      <span v-for="item in activeRasterLayers" :key="item.id">
                        <p v-if="item.wms">
                          {{ item.name }}, fonte:
                          {{ item.wms?.geoserver?.name }}.
                        </p>
                        <p v-else-if="item.tms">
                          {{ item.name }}, fonte:
                          {{ item.tms?.url_tms
                            ? 'SCCON. Atualizado em: ' +
                            handleData(
                              item.tms?.date
                            )
                            : ''
                          }}.
                        </p>
                      </span>
                    </div>
                    <div v-for="layerCategory in layerCategories" :key="layerCategory.name">
                      <div v-for="layer in layerCategory.layers" :key="layer.id">
                        <v-row v-if="layer.visible" no-gutters align="center" class="image-container">
                          <v-col>
                            <p class="ml-1">
                              <strong>{{ layer.name || '-' }}.</strong>
                              Fonte:{{ layer.fonte || '-' }}, Data de atualização:
                              {{ handleData(layer.dt_atualizacao) }}.
                            </p>
                          </v-col>
                        </v-row>
                      </div>
                    </div>
                  </div>
                  <div v-if="showFeaturesMonitoring">
                    <p class="ml-1">
                      {{ $t('monitoring-print-label') }}
                      {{ handleData(filters.startDate) }}
                      {{ $t('and') }}
                      {{ handleData(filters.endDate) }}
                    </p>
                  </div>
                  <div v-if="showFeaturesLandUse && uniqueYears.length > 0">
                    <p class="ml-1">
                      {{ $t('land-use-print-label') }}
                      <span v-for="(year, index) in uniqueYears" :key="'year-' + index">
                        {{ year }}<span v-if="index < uniqueYears.length - 1">,
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <v-divider />
                  <div class="ma-1">
                    <p>
                      {{ print_info }}
                      {{ $t('text-address0') }}
                    </p>
                    <p>
                      {{ print_info }}
                      {{ $t('text-address') }}
                      {{ todayDate() }}
                    </p>
                  </div>
                  <v-divider />
                  <div class="ma-1">
                    <p>
                      {{ $t('author-label') }}
                    </p>
                    <p>
                      {{ $t('text-info') }}
                    </p>
                    <p>
                      {{ $t('text-format') }}
                      {{ leafSize.type }}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
        <div class="no-print">
          <div class="d-flex flex-row align-md-center mr-6 mt-2">
            <v-btn class="ml-4 mb-2" @click="$emit('back')">
              {{ $t('input-button-back-second-step') }}
            </v-btn>
            <v-spacer />
            <v-btn color="primary" :disabled="showWarningMessage" @click="print">
              <v-icon dark>
                mdi-file-export-outline
              </v-icon>
              {{ $t('input-button-pdf-image') }}
            </v-btn>
          </div>
        </div>
      </v-container>
    </v-dialog>
  </div>
</template>

<i18n>
{
    "en": {
        "print-out": "Print Out",
        "legend": "Legend:",
        "text-address0": " | Print date: ",
        "text-address": " | Print date: ",
        "text-info": "The information may be distorted depending on the cartographic bases used.",
        "text-format": "Format-adapted map template ",
        "input-button-back-second-step": "Back",
        "input-button-pdf-image": "Generate PDF",
        "author-label": "Author: ",
        "clear-cut": "Clear Cut",
        "degradation": "Degradation",
        "forest-fire": "Forest Fire",
        "regeneration-deforestation": "Regeneration Deforestation",
        "burnt-scar": "Burnt Scar",
        "deforestation-veg": "Vegetation Deforestation",
        "disorderly-cs": "Disorderly Cs",
        "deforestation-cr": "Deforestation Cr",
        "geometric-cs": "Geometric Cs",
        "mining": "Mining",
        "land-use-categories": {
            "agriculture": "Agriculture",
            "water-body": "Water Body",
            "village": "Village",
            "natural-vegetation": "Natural Vegetation",
            "clear-cut": "Clear Cut"
        },
        "land-use-print-label": "Year usage and occupancy data",
        "monitoring-print-label": "Daily Monitoring Data between",
        "and": "and",
        "warning-message": "The number of selected TIs exceeds the limit for display on the print map. Only deforestation polygons will be shown. To view the statistics, reduce the selected TIs or access the 'Statistics' menu.",
        "agree": "I agree"
    },
    "pt-br": {
        "print-out": "Impressão",
        "legend": "Legenda:",
        "text-address0": " | CENTRO DE MONITORAMENTO REMOTO - https://cmr.funai.gov.br ",
        "text-address": " | Data da impressão: ",
        "text-info": "As informações podem apresentar distorções em função das bases cartográficas utilizadas.",
        "text-format": "Modelo de mapa adaptado para formato ",
        "input-button-back-second-step": "Voltar",
        "input-button-pdf-image": "Gerar PDF",
        "author-label": "Autor: ",
        "clear-cut": "Corte Raso",
        "degradation": "Degradação",
        "forest-fire": "Fogo em Floresta",
        "regeneration-deforestation": "Desmatamento em Regeneração",
        "burnt-scar": "Cicatriz de Queimada",
        "deforestation-veg": "Desmatamento Veg",
        "disorderly-cs": "Cs Desordenado",
        "deforestation-cr": "Desmatamento Cr",
        "geometric-cs": "Cs Geométrico",
        "mining": "Mineração",
        "land-use-categories": {
            "agriculture": "Agropecuária",
            "water-body": "Massa de Água",
            "village": "Vilarejo",
            "natural-vegetation": "Vegetação Natural",
            "clear-cut": "Corte Raso"
        },
        "land-use-print-label": "Dados de Uso e Ocupação ano",
        "monitoring-print-label": "Dados de Monitoramento Diário entre",
        "and": "e",
        "warning-message": "O número de TIs selecionadas excede o limite para visualização no mapa de impressão. Apenas os polígonos de desmatamento serão exibidos. Para ver as estatísticas, reduza as TIs selecionadas ou acesse o menu 'Estatísticas'.",
        "agree": "Ciente"
    }
}
</i18n>

<script>
import { mapState, mapActions } from 'vuex';
import MapForPrint from './MapForPrint.vue';
import MiniMap from '@/components/map/print-map/MiniMap.vue';
import LayerList from './LayerListActive.vue';
import CustomizedLegend from './CustomizedLegendActive.vue';

if (typeof window !== 'undefined') {
  require('leaflet-bing-layer');
}

export default {
  name: 'PrintTemplateMapLandscape',
  components: {
    MapForPrint,
    MiniMap,
    LayerList,
    CustomizedLegend,
  },

  props: {
    showDialogLandscape: {
      type: Boolean,
      default: false,
    },
    mapTitle: {
      type: String,
      default: '',
    },
    leafSize: {
      type: Object,
      default: null,
    },
    mainMap: {
      type: Object,
      default: null,
    },
    selectedBaseMap: {
      type: Object,
      default: null,
    },
    model: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    hasLongMonitoringInfo: false,
    teste: 0,
    totalMonitoring: 0,
    totalLandUse: 0,
    headers: [
      { text: 'TI', value: 'no_ti' },
      { text: 'Área CR (ha)', value: 'cr_nu_area_ha' },
      { text: 'Área DG (ha)', value: 'dg_nu_area_ha' },
      { text: 'Área DR (ha)', value: 'dr_nu_area_ha' },
      { text: 'Área FF (ha)', value: 'ff_nu_area_ha' },
    ],
    map: null,
    miniMap: null,
    currentBouldMap: null,
    mapCenter: null,
    logo_funai: process.env.DEFAULT_LOGO_IMAGE_FUNAI,
    logo_cmr: process.env.DEFAULT_LOGO_IMAGE_CMR,
    print_title: process.env.PRINT_TITLE,
    print_info: process.env.PRINT_INFO,
    showWarningMessage: false,
    activeMonitoringLabel: [],
    deterItems: [
      { label: 'burnt-scar', color: '#330000' },
      { label: 'deforestation-veg', color: '#b2b266' },
      { label: 'disorderly-cs', color: '#ff4dff' },
      { label: 'deforestation-cr', color: '#cca300' },
      { label: 'geometric-cs', color: '#669999' },
      { label: 'degradation', color: '#ff8000' },
      { label: 'mining', color: '#cccc00' },
    ],
    urgentAlertItems: [
      { label: 'regeneration-deforestation', color: '#990099' },
      { label: 'degradation', color: '#ff8000' },
      { label: 'clear-cut', color: '#ff3333' },
    ],
    landUseCategories: [
      {
        label: 'land-use-categories.agriculture',
        abbreviation: 'AG',
        color: '#ffff00',
      },
      {
        label: 'land-use-categories.clear-cut',
        abbreviation: 'CR',
        color: '#ff0000',
      },
      {
        label: 'land-use-categories.degradation',
        abbreviation: 'DG',
        color: '#ff00ff',
      },
      {
        label: 'land-use-categories.water-body',
        abbreviation: 'MA',
        color: '#00ffff',
      },
      {
        label: 'land-use-categories.mining',
        abbreviation: 'MI',
        color: '#e9dcc6',
      },
      {
        label: 'land-use-categories.not-observed',
        abbreviation: 'NO',
        color: '#000000',
      },
      {
        label: 'land-use-categories.highway',
        abbreviation: 'RV',
        color: '#708090',
      },
      {
        label: 'land-use-categories.forestry',
        abbreviation: 'SV',
        color: '#FF8000',
      },
      {
        label: 'land-use-categories.natural-vegetation',
        abbreviation: 'VN',
        color: '#228b22',
      },
      {
        label: 'land-use-categories.village',
        abbreviation: 'VI',
        color: '#A0522d',
      },
    ],
  }),
  watch: {
    analyticsMonitoring(newVal) {
      // Verificar se newVal é vazio, nulo ou 0
      if (!newVal || newVal.length === 0) {
        // this.showWarningMessage = false;
        this.teste = 0; // Garantir que o valor de teste seja 0
        return;
      }
      this.totalMonitoring = newVal.length;
      this.totalLandUse = this.tableLandUse.length;
      // Verificar se a informação de monitoramento é longa
      this.hasLongMonitoringInfo = newVal.length > 7;
      if (this.hasLongMonitoringInfo) {
        this.showWarningMessage = true;
        return;
      }
      // Calcular total, somando apenas quando a soma estiver entre 1 e 7
      const total = newVal.length
        + (this.tableLandUse.length <= 7 ? this.tableLandUse.length : 0);
      if (total > 7) {
        this.showWarningMessage = true;
        this.teste = total; // Garantir que o total correto seja atribuído a 'teste'
        return;
      }
      // this.showWarningMessage = false;
      // Atualiza a variável 'teste' com a soma correta
      this.teste = total;
    },

    tableLandUse(newValue) {      
      // Atualiza showWarningMessage quando o tamanho de tableLandUse mudar
      // this.showWarningMessage = newValue.length > 7;
    },
  },
  computed: {
    uniqueYears() {
      // Cria um Set para garantir que os anos sejam únicos
      const years = this.tableLandUse.map((item) => item.nu_ano);
      return [...new Set(years)]; // Converte de volta para um array
    },

    showDialog() {
      return this.showDialogLandscape;
    },

    hasCartographicDatasets() {
      return !!(
        this.showFeaturesSupportLayers
        || this.supportLayersCategoryProdes
        || this.showFeaturesDeter
      );
    },

    hasLegend() {
      return !!(
        this.showFeaturesSupportLayers
        || this.showFeaturesMonitoring
        || this.showFeaturesDeter
        || this.showFeaturesLandUse
        || this.showFeaturesUrgentAlerts
      );
    },

    layerCategories() {
      return [
        {
          name: 'Support Layers',
          layers: this.supportLayers,
          show: this.showFeaturesSupportLayers,
        },
        {
          name: 'Fire Category Layers',
          layers: this.supportLayersCategoryFire,
          show: true,
        },
        {
          name: 'Prodes Category Layers',
          layers: this.supportLayersCategoryProdes,
          show: true,
        },
      ].filter((category) => category.show);
    },

    activeRasterLayers() {
      return Object.values(this.supportLayersCategoryRaster).filter(
        (layer) => layer.visible,
      );
    },

    ...mapState('supportLayersUser', ['supportLayerUser']),
    ...mapState('map', ['bounds']),
    ...mapState('supportLayers', [
      'showFeaturesSupportLayers',
      'supportLayers',
      'supportLayersCategoryFire',
      'supportLayersCategoryBase',
      'supportLayersCategoryRaster',
      'supportLayersCategoryProdes',
      'supportLayersCategoryAntropismo',
    ]),

    ...mapState('monitoring', [
      'selectedStages',
      'showFeaturesMonitoring',
      'analyticsMonitoring',
      'filters',
      'lastSearchStatisticsByFunai',
    ]),

    ...mapState('deter', ['showFeaturesDeter', 'features']),
    ...mapState('urgent-alerts', ['showFeaturesUrgentAlerts']),
    ...mapState('land-use', [
      'showFeaturesLandUse',
      'features',
      'tableLandUse',
    ]),
  },

  async mounted() {
    if (this.showFeaturesMonitoring) {
      this.getDataAnalyticsMonitoringByFunai();
      this.hasLongMonitoringInfo = true
    }
    if (this.selectedStages) {
      this.selectedStages.forEach((item) => {
        item === 'CR'
          ? this.activeMonitoringLabel.push({
            id: 'cr',
            color: '#ff3333',
            name: this.$t('clear-cut'),
          })
          : item === 'DG'
            ? this.activeMonitoringLabel.push({
              id: 'dg',
              color: '#ff8000',
              name: this.$t('degradation'),
            })
            : item === 'FF'
              ? this.activeMonitoringLabel.push({
                id: 'ff',
                color: '#b35900',
                name: this.$t('forest-fire'),
              })
              : item === 'DR'
                ? this.activeMonitoringLabel.push({
                  id: 'dr',
                  color: '#990099',
                  name: this.$t('regeneration-deforestation'),
                })
                : '';
      });

      if (this.showFeaturesLandUse) await this.getDataTableLandUse();  

      // if (this.filters.ti && this.filters.ti.length > 7) this.showWarningMessage = true;

      if (Object.values(this.supportLayers).filter(l => l.visible).length > 7) this.showWarningMessage = true;

      if (Object.values(this.supportLayerUser).filter(l => l.visible).length > 7) this.showWarningMessage = true;
    }
  },

  methods: {
    formatNumber(value) {
      const number = parseFloat(value);
      if (!isNaN(number)) {
        return number.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
      return '-';
    },

    vectorImage(layer) {
      return layer.vector.thumbnail_blob || layer.vector.image;
    },

    handleData(data) {
      if (!data) return '-';
      const [year, month, day] = data.split('-');
      return `${day}/${month}/${year}`;
    },

    todayDate() {
      const date = new Date();
      const dd = date.getDate();
      const mm = date.getMonth() + 1;
      const yyyy = date.getFullYear();
      return `${dd < 10 ? `0${dd}` : dd}/${mm < 10 ? `0${mm}` : mm
        }/${yyyy}`;
    },

    updateBounds(bounds) {
      this.currentBouldMap = bounds;
    },

    getCenter(center) {
      this.mapCenter = center;
    },

    adjustMapSizeForPrint(tamanho) {
      const mapDimensions = this.getMapDimensions(tamanho);
      document.getElementById(
        'map-for-print',
      ).style.width = `${mapDimensions.width}px`;
      document.getElementById(
        'map-for-print',
      ).style.height = `${mapDimensions.height}px`;
    },

    getMapDimensions(tamanho) {
      switch (tamanho) {
        case 'A4':
          return { width: 1105, height: 770 }; // in mm or appropriate units
        case 'A3':
          return { width: 1450, height: 860 };
        // Add more cases as needed
        default:
          return { width: 210, height: 297 }; // Default to A4
      }
    },

    print() {
      this.adjustMapSizeForPrint(this.leafSize.type);
      const style = document.createElement('style');
      style.setAttribute('media', 'print');
      window.print();
    },

    ...mapActions('monitoring', ['getDataAnalyticsMonitoringByFunai']),
    ...mapActions('land-use', ['getDataTableLandUse']),
  },
};
</script>

<style scoped>
#monitoring-data-details {
  position: relative;
}

#data-table {
  position: absolute;
  right: 0.5rem;
  bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: flex-start;
  flex-direction: column;
  max-height: 760px;
  gap: 0.5rem;
}

.bordered-red {
  border: 2px solid red;
  /* Borda vermelha */
  padding: 10px;
  border-radius: 5px;
  /* Borda arredondada */
}

.bordered-blue {
  border: 2px solid blue;
  /* Borda azul */
  padding: 10px;
  border-radius: 5px;
  /* Borda arredondada */
}

#data-table>div {
  background: #fffbfb;
  opacity: 0.9;
  padding: 5px;
}

.map-wrapper {
  width: 100%;
}

.vue2leaflet-map map-wrapper leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom {
  height: 30vh !important;
}

.legend-info-map {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 60%;
  padding-bottom: 5px;
}

.legend-info-map-details {
  height: 100%;
}

@page {
  size: landscape;
  margin: 0;
}

@media print {
  .logo {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100% !important;
    overflow: hidden !important;
    box-shadow: none;
  }

  .no-print {
    display: none;
  }
}

p {
  font-size: xx-small;
  margin: 0;
}

.font-title p {
  font-size: medium;
  margin: 0px;
  padding: 0px;
  text-align: center;
  line-break: anywhere;
  max-width: 750px;
  font-family: 'Roboto', sans-serif;
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 700;
  color: #6c6c6c;
}

.font-title {
  line-break: anywhere;
  width: 100%;
}

.print-mini-map-text {
  color: dimgray !important;
  font-size: xx-small;
  white-space: nowrap;
}

.border_container_legend {
  border: 0.5px gray;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 0 5px #bbb !important;
  height: 100%;
}

.border_container {
  height: 100%;
}

.hight_container_mini_map {
  height: 150px;
  max-height: 150px;
  width: 100%;
}

.font-page p {
  font-size: large;
}

.image-container {
  width: 100%;
  /* Garante que o container tenha largura suficiente */
}

.row {
  margin: 0 !important;
}

img.layer-thumbnail {
  width: 25px;
}

.warning-message {
  position: absolute;
  max-width: 350px;
  top: 35%;
  left: 30%;
  z-index: 20;
  background: #ffffff;
}
</style>
