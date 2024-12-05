<template>
  <div>
    <style>
      @media print { @page { size: landscape; margin: 0 } }
    </style>
    <v-dialog
      v-model="showDialog"
      width="auto"
      persistent
    >
      <v-card-title
        class="no-print theme--dark secondary white--text d-flex justify-space-between"
      >
        <span>{{ $t('print-out') }}</span>
        <v-btn
          icon
          @click="$emit('close')"
        >
          <v-icon class="white--text">
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-container style="background-color: white; max-width: 100%">
        <v-row
          id="map-for-print"
          no-gutters
          style="width: 1230px; height: 780px"
        >
          <v-col
            cols="8"
            class="pr-0 mt-2"
            id="monitoring-data-details"
          >
            <div
            v-if="showFeaturesMonitoring"
            class="leaflet-bottom leaflet-right mt-2"
            id="data-table"
            >
              <div v-for="item in analyticsMonitoring" :key="item" class="text-center">
                <p><strong>TI {{ item.no_ti }}</strong></p>
                <p>Área da TI: {{formatNumber(item.ti_nu_area_ha)}} ha</p>
                <p v-if="item.cr_nu_area_ha">CR: {{formatNumber(item.cr_nu_area_ha)}} ha</p>
                <p v-if="item.dg_nu_area_ha">DG: {{formatNumber(item.dg_nu_area_ha)}} ha</p>
                <p v-if="item.dr_nu_area_ha">DR: {{formatNumber(item.dr_nu_area_ha)}} ha</p>
                <p v-if="item.ff_nu_area_ha">FF: {{formatNumber(item.ff_nu_area_ha)}} ha</p>
              </div>
            </div>
            <MapForPrint
              :leaf-size="leafSize"
              :main-map="mainMap"
              :selected-base-map="selectedBaseMap"
              class="map-wrapper"
              @updateBounds="updateBounds"
              @getCenter="getCenter"
            />
          </v-col>
          <v-col
            cols="4"
            class="pl-1 mt-2"
          >
            <div class="border_container">
              <div class="d-flex justify-space-between pl-8 pr-8 ga-1 align-center ma-4">
                <div style="width: 25%">
                  <v-img
                    style="opacity: 0.5;"
                    contain
                    :src="logo_funai"
                    class="logo"
                  />
                </div>
                <div style="width: 50%">
                  <v-img
                    style="opacity: 0.5;"
                    contain
                    :src="logo_cmr"
                    class="logo"
                  />
                </div>
              </div>
              <div class="font-title">
                <p>
                  {{ mapTitle }}
                </p>
                <p>
                  {{ print_title }}
                </p>
              </div>
              <div
                class="d-flex justify-center hight_container_mini_map"
              >
                <MiniMap
                  v-if="currentBouldMap"
                  :current-bould-map="currentBouldMap"
                  :map-center="mapCenter"
                />
              </div>
              <div class="legend-info-map">
                <div class="legend-info-map legend-info-map-details">
                  <div>
                    <p
                      v-if="hasLegend"
                      class="d-block ma-1"
                    >
                      {{ $t('legend') }}
                    </p>
                    <div
                      class="ma-1 flex-wrap"
                      style="width: 100%; max-height: 100%; overflow: hidden;"
                    >
                      <LayerList
                        :layers="supportLayerUser"
                        :isUserLayer="true"
                      />
                      <LayerList
                        v-if="showFeaturesSupportLayers"
                        :layers="supportLayers"
                      />
                      <LayerList :layers="supportLayersCategoryFire" />
                      <LayerList
                        :layers="supportLayersCategoryProdes"
                        :prodes="true"
                      />
                      <CustomizedLegend
                        v-if="showFeaturesLandUse"
                        :items="landUseCategories"
                      />
                      <CustomizedLegend
                        v-if="showFeaturesDeter"
                        :items="deterItems"
                      />
                      <CustomizedLegend
                        v-if="showFeaturesUrgentAlerts && !showFeaturesMonitoring"
                        :items="urgentAlertItems"
                      />
                      <LayerList
                        v-if="showFeaturesMonitoring"
                        :layers="activeMonitoringLabel"
                        :monitoring="true"
                      />
                    </div>
                  </div>
                  <div>
                    <v-divider />
                    <p
                      v-if="hasCartographicDatasets"
                      class="d-block ma-1"
                    >
                      Bases Cartográficas:
                    </p>
                    <div
                      v-for="layerCategory in layerCategories"
                      :key="layerCategory.name"
                    >
                      <div
                        v-for="layer in layerCategory.layers"
                        :key="layer.id"
                      >
                        <v-row
                          v-if="layer.visible"
                          no-gutters
                          align="center"
                          class="image-container"
                        >
                          <v-col>
                            <p class="ml-1">
                              <strong>{{ layer.name || '-' }}. </strong>
                              Fonte: {{ layer.layer_info.fonte || '-' }},
                              Data de atualização: {{ handleData(layer.layer_info.dt_atualizacao) }}.
                            </p>
                          </v-col>
                        </v-row>
                      </div>
                    </div>
                  </div>
                  <div v-if="showFeaturesMonitoring">
                    <p class="ml-1">{{ $t('monitoring-print-label')}} {{ handleData(filters.startDate) }} {{ $t('and') }} {{ handleData(filters.endDate) }}</p>
                  </div>
                </div>

                <div>
                  <v-divider />
                  <div class="ma-1">
                    <p>
                      {{ print_info }} {{ $t('text-address0') }}
                    </p>
                    <p>
                      {{ print_info }} {{ $t('text-address')
                      }}{{ todayDate() }}
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
                      {{ $t('text-format') }}{{ leafSize.type }}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
        <div class="no-print">
          <div class="d-flex flex-row align-md-center mr-6 mt-2">
            <v-btn
              class="ml-4 mb-2"
              @click="$emit('back')"
            >
              {{ $t('input-button-back-second-step') }}
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              @click="print"
            >
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
          "monitoring-print-label": "Daily Monitoring Data between",
          "and": "and"

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
          "monitoring-print-label": "Dados de Monitoramento Diário entre",
          "and": "e"
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
      { label: 'land-use-categories.agriculture', color: '#ffff00' },
      { label: 'land-use-categories.water-body', color: '#66ffff' },
      { label: 'land-use-categories.village', color: '#cc9966' },
      { label: 'land-use-categories.natural-vegetation', color: '#00cc00' },
      { label: 'land-use-categories.clear-cut', color: '#ff3333' },
    ],
  }),

  computed: {
    showDialog() {
      return this.showDialogLandscape;
    },
    hasCartographicDatasets() {
      return !!(
        this.showFeaturesSupportLayers
        || this.supportLayersCategoryProdes
        || this.showFeaturesDeter);
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
        { name: 'Support Layers', layers: this.supportLayers, show: this.showFeaturesSupportLayers },
        { name: 'Fire Category Layers', layers: this.supportLayersCategoryFire, show: true },
        { name: 'Prodes Category Layers', layers: this.supportLayersCategoryProdes, show: true },
      ].filter((category) => category.show);
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
    ...mapState('monitoring', ['selectedStages', 'showFeaturesMonitoring', 'analyticsMonitoring', 'filters']),
    ...mapState('deter', ['showFeaturesDeter', 'features']),
    ...mapState('urgent-alerts', ['showFeaturesUrgentAlerts']),
    ...mapState('land-use', ['showFeaturesLandUse', 'features']),

  },

  mounted() {
    if (this.showFeaturesMonitoring) {
      this.getDataAnalyticsMonitoringByFunai();
    }
    if (this.selectedStages) {
      this.selectedStages.forEach((item) => {
        item === 'CR' ? this.activeMonitoringLabel.push({
          id: 'cr',
          color: '#ff3333',
          name: this.$t('clear-cut'),
        })
          : item === 'DG' ? this.activeMonitoringLabel.push({
            id: 'dg',
            color: '#ff8000',
            name: this.$t('degradation'),
          })
            : item === 'FF' ? this.activeMonitoringLabel.push({
              id: 'ff',
              color: '#b35900',
              name: this.$t('forest-fire'),
            })
              : item === 'DR' ? this.activeMonitoringLabel.push({
                id: 'dr',
                color: '#990099',
                name: this.$t('regeneration-deforestation'),
              }) : '';
      });
    }
  },

  methods: {
    formatNumber(value) {
    const number = parseFloat(value)
    if (!isNaN(number)) {
      return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
      return `${dd < 10 ? `0${dd}` : dd}/${
        mm < 10 ? `0${mm}` : mm
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
      document.getElementById('map-for-print').style.width = `${mapDimensions.width}px`;
      document.getElementById('map-for-print').style.height = `${mapDimensions.height}px`;
    },

    getMapDimensions(tamanho) {
      switch (tamanho) {
        case 'A4':
          return { width: 1100, height: 750 }; // in mm or appropriate units
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
  },
};
</script>

<style scoped>
#monitoring-data-details{
  position: relative;
}

#data-table{
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

#data-table > div {
  background: #fffbfb;
  opacity: 0.9;
  padding: 5px;
}
.map-wrapper {
  width: 100%;

}

.vue2leaflet-map map-wrapper leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom{
  height: 30vh !important;
}

.legend-info-map{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 60%;
  padding-bottom: 5px;
}

.legend-info-map-details{
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

.font-page p {
    font-size: large;
}

.image-container {
    width: 100%; /* Garante que o container tenha largura suficiente */
}

.row {
  margin: 0!important;
}

img.layer-thumbnail{
    width: 25px;
}
</style>
