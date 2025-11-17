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
    <v-dialog
      v-model="showDialog"
      width="auto"
      @click:outside="$emit('close')"
    >
      <div class="print-dialog-header no-print">
        <v-btn
          icon
          x-small
          color="white"
          class="close-btn"
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-container style="background-color: white; max-width: 100%">
        <v-row
          id="map-for-print-container"
          no-gutters
          style="width: 1230px; height: 780px; max-height: 780px; overflow: hidden"
        >
          <v-col
            cols="12"
            class="pr-0 mt-2"
            style="max-height: 500px; position: relative"
          >
            <!-- MiniMap em cima do mapa principal -->
            <div class="mini-map-overlay">
              <MiniMap
                v-if="currentBouldMap"
                :current-bould-map="currentBouldMap"
                :map-center="mapCenter"
                :main-zoom="mainZoom"
              />
            </div>
            <v-card
              v-if="
                showWarningMessage &&
                  !(
                    showFeaturesAlerts &&
                    !showFeaturesMonitoring &&
                    !showFeaturesLandUse
                  )
              "
              class="warning-message"
              elevated
            >
              <v-card-text>
                <p class="text-subtitle-1">
                  {{ $t('warning-message') }}
                </p>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  color="primary"
                  text
                  @click="showWarningMessage = false"
                >
                  {{ $t('agree') }}
                </v-btn>
              </v-card-actions>
            </v-card>

            <MapForPrint
              ref="mapForPrint"
              :leaf-size="leafSize"
              :main-map="mainMap"
              :selected-base-map="selectedBaseMap"
              class="map-wrapper"
              @updateBounds="updateBounds"
              @getCenter="getCenter"
              @getZoom="getZoom"
              @mapReady="onMapReady"
            />
          </v-col>

          <!-- Segunda coluna movida para abaixo do mapa -->

          <div class="font-title pb-2">
            <p>
              {{ mapTitle }}
            </p>
            <p>
              {{ print_title }}
            </p>
          </div>

          <!-- Lista CAR na legenda -->
          <div
            v-if="carData && carData.length > 0"
            class="car-legend-section"
          >
            <p class="d-flex align-center ma-1">
              <strong class="mr-2">Cadastro Ambiental Rural (CAR)</strong>
              <v-chip x-small>
                {{ carData.length }}
              </v-chip>
            </p>
            <div class="car-list-container pt-1">
              <v-row class="car-list-row">
                <v-col
                  v-for="(item, index) in carData"
                  :key="'car-' + index"
                  cols="3"
                  class="car-list-item"
                >
                  <div class="d-flex align-center">
                    <v-avatar
                      :color="getCarColor(index)"
                      size="20"
                      class="mr-1 car-number-avatar"
                    >
                      <span class="white--text font-weight-bold" style="font-size: 10px;">
                        {{ index + 1 }}
                      </span>
                    </v-avatar>
                    <span class="car-name">{{ getTerraIndigenaName(item) }}</span>
                  </div>
                </v-col>
              </v-row>
            </div>
            <v-divider class="my-2" />
          </div>








          TABELA

          <div class="legend-info-map">
            <div class="legend-info-map-details">
              <div>
                <p v-if="hasLegend" class="d-block ma-1">
                  <strong style="font-size: small">{{ $t('legend') }}</strong>
                </p>
                <div>
                  <div
                    style="display: flex; justify-content: flex-start; align-items: flex-start;
                    gap: 5px; flex-wrap: wrap;"
                  >
                    <div
                      v-if="showFeaturesMonitoring
                        && hasActiveMonitoringStages && selectedItemsCount > 0"
                    >
                      <p>
                        <strong>Monitoramento Diário</strong>
                        <v-chip x-small>
                          {{ monitoringCount }}
                        </v-chip>
                      </p>
                      <hr style="border: 1px solid red; margin: 0; margin-top: 0px;">
                      <CustomizedLegend
                        class="pt-1"
                        :items="monitoringItems"
                      />
                    </div>
                    <div
                      v-if="showFeaturesAlerts
                        && hasActiveAlertsStages
                        && selectedItemsCount > 0"
                    >
                      <p>
                        <strong>Alerta Urgente</strong>
                        <v-chip x-small>
                          {{ alertsCount }}
                        </v-chip>
                      </p>
                      <hr style="border: 1px solid blue; margin: 0; margin-top: 3px;">
                      <CustomizedLegend
                        class="pt-1"
                        :items="alertsItems"
                      />
                    </div>
                    <div
                      v-if="showFeaturesSupportLayers
                        && Object.values(supportLayers).filter(l => l.visible).length
                        && Object.values(supportLayers).filter(l => l.visible).length <= 7
                        && Object.values(supportLayerUser).filter(l => l.visible).length <= 7"
                    >
                      <p style="width: 120px">
                        <strong>Sobreposição de camadas</strong>
                      </p>
                      <hr style="border: 1px solid blue; margin: 0; margin-top: 3px;">
                      <LayerList
                        :layers="supportLayerUser"
                        :is-user-layer="true"
                      />
                      <LayerList
                        v-if="showFeaturesSupportLayers"
                        :layers="supportLayers"
                        class="mt-1"
                      />
                    </div>
                    <div v-if="showFeaturesLandUse">
                      <p>
                        <strong>Uso e Ocupação do Solo</strong>
                        <v-chip x-small>
                          {{ tableLandUse.length }}
                        </v-chip>
                      </p>
                      <hr style="border: 1px solid blue; margin: 0; margin-top: 0px;">
                      <CustomizedLegend
                        class="pt-1"
                        :items="landUseItems"
                      />
                    </div>

                    <div v-if="showFeaturesProdes">
                      <p><strong>INPE - Prodes</strong></p>
                      <hr style="border: 1px solid blue; margin: 0; margin-top: 3px;">
                      <CustomizedLegend
                        class="pt-1"
                        :items="prodesItems"
                      />
                    </div>

                    <div v-if="showFeaturesDeter">
                      <p><strong>INPE - Deter</strong></p>
                      <hr style="border: 1px solid blue; margin: 0; margin-top: 3px;">
                      <CustomizedLegend
                        class="pt-1"
                        :items="deterItems"
                      />
                    </div>

                    <div v-if="showFeaturesAquaMM || showFeaturesAquaMT">
                      <p><strong>INPE - Focos de Calor</strong></p>
                      <hr style="border: 1px solid blue; margin: 0; margin-top: 3px;">
                      <CustomizedLegend
                        class="pt-1"
                        :items="heatFocusItems.filter(item =>
                          (item.label === 'Aqua Modis Manhã' && showFeaturesAquaMM) ||
                          (item.label === 'Aqua Modis Tarde' && showFeaturesAquaMT))"
                      />
                    </div>
                  </div>
                </div>
              </div>
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
                      <strong>{{ layer.name || '-' }}.</strong>
                      Fonte:{{ layer.fonte || '-' }}, Data de
                      atualização:
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
              {{ handleData(monitoringFilters.startDate) }}
              {{ $t('and') }}
              {{ handleData(monitoringFilters.endDate) }}
            </p>
          </div>
          <div v-if="showFeaturesAlerts">
            <p class="ml-1">
              {{ $t('alerts-print-label') }}
              {{ handleData(alertsFilters.startDate) }}
              {{ $t('and') }}
              {{ handleData(alertsFilters.endDate) }}
            </p>
          </div>
          <div v-if="showFeaturesLandUse && uniqueYears.length > 0">
            <p class="ml-1">
              {{ $t('land-use-print-label') }}
              <span
                v-for="(year, index) in uniqueYears"
                :key="'year-' + index"
              >
                {{ year
                }}<span v-if="index < uniqueYears.length - 1">,
                </span>
              </span>
            </p>
          </div>
          <div v-if="showFeaturesProdes">
            <p class="ml-1">
              {{ $t('prodes-print-label') }}
              {{ handleProdesYear() }}
            </p>
          </div>
          <div v-if="showFeaturesDeter">
            <p class="ml-1">
              {{ $t('deter-print-label') }}
              {{ handleData(deterFilters.startDate) }}
              {{ $t('and') }}
              {{ handleData(deterFilters.endDate) }}
            </p>
          </div>
          <div v-if="showFeaturesAquaMM || showFeaturesAquaMT">
            <p class="ml-1">
              {{ $t('heat-focus-print-label') }}
              {{ handleData(focoFilters.startDate) }}
              {{ $t('and') }}
              {{ handleData(focoFilters.endDate) }}
            </p>
          </div>

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
        </v-row>
      </v-container>
      <div class="print-dialog-footer no-print">
        <div class="d-flex align-center pa-4">
          <v-btn
            class="ml-2"
            @click="$emit('back')"
          >
            {{ $t('input-button-back-second-step') }}
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            class="mr-2"
            :loading="loadingPrintImage"
            :disabled="showWarningMessage || loadingPrintImage"
            @click="saveImage"
          >
            <v-icon dark>
              mdi-image-outline
            </v-icon>
            {{ $t('download-image') }}
          </v-btn>
          <v-btn
            color="primary"
            class="mr-4"
            :disabled="showWarningMessage || loadingPrintImage"
            @click="print"
          >
            <v-icon dark>
              mdi-file-export-outline
            </v-icon>
            {{ $t('input-button-pdf-image') }}
          </v-btn>
        </div>
      </div>
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
    "download-image": "Download Image",
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
    "land-use-print-label": "Year usage and occupancy data",
    "monitoring-print-label": "Daily Monitoring Data between",
    "alerts-print-label": "Daily Urgent Alerts Data between",
    "and": "and",
    "warning-message": "The number of selected TIs exceeds the limit for display on the print map. Only deforestation polygons will be shown. To view the statistics, reduce the selected TIs or access the 'Statistics' menu.",
    "agree": "I agree",
    "prodes-print-label": "Prodes data between",
    "deter-print-label": "Deter data between",
    "heat-focus-print-label": "Heat focus data between",
    "aqua-morning": "Aqua Modis Morning",
    "aqua-afternoon": "Aqua Modis Afternoon"
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
    "download-image": "Baixar Imagem",
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
    "land-use-print-label": "Dados de Uso e Ocupação ano",
    "monitoring-print-label": "Dados de Monitoramento Diário entre",
    "alerts-print-label": "Dados de Alertas Urgente entre",
    "and": "e",
    "warning-message": "O número de TIs selecionadas excede o limite para visualização no mapa de impressão. Apenas os polígonos de desmatamento serão exibidos. Para ver as estatísticas, reduza as TIs selecionadas ou acesse o menu 'Estatísticas'.",
    "agree": "Ciente",
    "prodes-print-label": "Dados Prodes entre",
    "deter-print-label": "Dados Deter entre",
    "heat-focus-print-label": "Dados de Focos de Calor entre",
    "aqua-morning": "Aqua Modis Manhã",
    "aqua-afternoon": "Aqua Modis Tarde"
  }
}
</i18n>

<script>
import { mapState, mapActions } from 'vuex';
import domtoimage from 'dom-to-image';
import MapForPrint from './MapForPrint.vue';
import MiniMap from './MiniMap.vue';
import LayerList from './LayerListActive.vue';
import CustomizedLegend from './CustomizedLegendActive.vue';

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
    carData: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    selectedItemsCount: 0,
    totalMonitoring: 0,
    totalLandUse: 0,
    map: null,
    miniMap: null,
    currentBouldMap: null,
    mapCenter: null,
    mainZoom: null,
    logo_funai: process.env.DEFAULT_LOGO_IMAGE_FUNAI,
    logo_cmr: process.env.DEFAULT_LOGO_IMAGE_CMR,
    print_title: process.env.PRINT_TITLE,
    print_info: process.env.PRINT_INFO,
    showWarningMessage: false,
    activeMonitoringLabel: [],
    loadingPrintImage: false,
    carLayer: null,
    printMap: null,

    deterItems: [{ label: 'Alerta', color: '#AAAAAA', border: '1px solid #000000' }],
    heatFocusItems: [
      {
        label: 'Aqua Modis Manhã',
        color: '#FFA500',
        icon: 'mdi-fire',
      },
      {
        label: 'Aqua Modis Tarde',
        color: '#FF0000',
        icon: 'mdi-fire',
      },
    ],
  }),

  computed: {
    hasActiveMonitoringStages() {
      return Object.values(this.legendVisibility).some((visible) => visible);
    },
    hasActiveAlertsStages() {
      return Object.values(this.legendVisibilityalerts).some((visible) => visible);
    },

    filteredMonitoringData() {
      return this.combinedTableData.filter(
        (item) => item.monitoring
        && Object.keys(item.monitoring).some((key) => item.monitoring[key] > 0),
      );
    },
    filteredAlertsData() {
      return this.combinedTableData.filter(
        (item) => item.alerts && Object.keys(item.alerts).some((key) => item.alerts[key] > 0),
      );
    },
    filteredLandUseData() {
      return this.combinedTableData.filter(
        (item) => item.landUse && Object.keys(item.landUse).some((key) => item.landUse[key] > 0),
      );
    },
    filteredCombinedTableData() {
      return this.combinedTableData.filter((item) => {
        const hasMonitoring = this.showFeaturesMonitoring
        && item.monitoring && Object.keys(item.monitoring).some((key) => item.monitoring[key] > 0);
        const hasLandUse = this.showFeaturesLandUse
        && item.landUse && Object.keys(item.landUse).some((key) => item.landUse[key] > 0);
        const hasAlerts = this.showFeaturesAlerts 
        && item.alerts && Object.keys(item.alerts).some((key) => item.alerts[key] > 0);
        return hasMonitoring || hasLandUse || hasAlerts;
      });
    },
    combinedTableData() {
      const keys = {
        monitoring: ['cr_ha', 'dg_ha', 'dr_ha', 'ff_ha'],
        landUse: ['ag_ha', 'cr_ha', 'dg_ha', 'ma_ha', 'mi_ha', 'no_ha', 'rv_ha', 'sv_ha', 'vn_ha', 'vi_ha'],
        alerts: ['cr_ha', 'dg_ha', 'dr_ha'],
      };

      const initializeObject = (keyList) => keyList.reduce((obj, key) => ({ ...obj, [`nu_area_${key}`]: 0 }), {});
      const initializeData = (noTi) => ({
        no_ti: noTi,
        nu_area_ha: 0,
        monitoring: initializeObject(keys.monitoring),
        landUse: initializeObject(keys.landUse),
        alerts: initializeObject(keys.alerts),
      });

      const addValue = (target, key, value) => {
        const updatedValue = (target[key] || 0) + (parseFloat(value) || 0);
        target[key] = updatedValue;
      };

      const combined = {};

      const processTable = (table, type) => {
        if (!Array.isArray(table)) return;

        table.forEach((item) => {
          if (!item.no_ti) return;
          if (!combined[item.no_ti]) combined[item.no_ti] = initializeData(item.no_ti);
          const data = combined[item.no_ti];
          addValue(data, 'nu_area_ha', item.nu_area_ha);
          keys[type].forEach((key) => addValue(data[type], `nu_area_${key}`, item[`nu_area_${key}`]));
        });
      };

      processTable(this.tableMonitoring, 'monitoring');
      processTable(this.tableLandUse, 'landUse');
      processTable(this.tableAlerts, 'alerts');

      return Object.values(combined);
    },
    totalAreas() {
      const monitoringKeys = ['cr_ha', 'dg_ha', 'dr_ha', 'ff_ha'];
      const landUseKeys = ['ag_ha', 'cr_ha', 'dg_ha', 'ma_ha', 'mi_ha', 'no_ha', 'rv_ha', 'sv_ha', 'vn_ha', 'vi_ha'];
      const alertsKeys = ['cr_ha', 'dg_ha', 'dr_ha'];

      const initializeObject = (keys) => keys.reduce((obj, key) => ({ ...obj, [`nu_area_${key}`]: 0 }), {});
      const addValue = (target, key, value) => {
        target[key] += parseFloat(value) || 0;
      };

      if (!Array.isArray(this.combinedTableData)) {
        return initializeObject(['ha', ...monitoringKeys, ...landUseKeys, ...alertsKeys]);
      }

      return this.combinedTableData.reduce(
        (acc, item) => {
          addValue(acc, 'nu_area_ha', item.nu_area_ha);
          monitoringKeys.forEach((key) => addValue(acc.monitoring, `nu_area_${key}`, item.monitoring[`nu_area_${key}`]));
          landUseKeys.forEach((key) => addValue(acc.landUse, `nu_area_${key}`, item.landUse[`nu_area_${key}`]));
          alertsKeys.forEach((key) => addValue(acc.alerts, `nu_area_${key}`, item.alerts[`nu_area_${key}`]));
          return acc;
        },
        {
          nu_area_ha: 0,
          monitoring: initializeObject(monitoringKeys),
          landUse: initializeObject(landUseKeys),
          alerts: initializeObject(alertsKeys),
        },
      );
    },
    uniqueYears() {
      if (!Array.isArray(this.tableLandUse)) return [];
      const years = this.tableLandUse.map((item) => item.nu_ano);
      return [...new Set(years)];
    },
    showDialog() {
      return this.showDialogLandscape;
    },
    hasCartographicDatasets() {
      return Object.keys(this)
        .filter((key) => key.startsWith('showFeatures'))
        .some((key) => this[key]);
    },
    hasLegend() {
      return Object.keys(this)
        .filter((key) => key.startsWith('showFeatures'))
        .some((key) => this[key]);
    },
    layerCategories() {
      return [['Support Layers', this.supportLayers, this.showFeaturesSupportLayers]]
        .map(([name, layers, show]) => ({ name, layers, show }))
        .filter(({ show }) => show);
    },
    showFeaturesAquaMM() {
      return (this.layers && this.layers.aquaMM && this.layers.aquaMM.showFeatures) || false;
    },
    showFeaturesAquaMT() {
      return (this.layers && this.layers.aquaMT && this.layers.aquaMT.showFeatures) || false;
    },
    featuresAquaMM() {
      return (this.layers && this.layers.aquaMM && this.layers.aquaMM.features) || null;
    },
    featuresAquaMT() {
      return (this.layers && this.layers.aquaMT && this.layers.aquaMT.features) || null;
    },
    focoFilters() {
      return (this.layers && this.layers.aquaMM && this.layers.aquaMM.filters) || {};
    },
    prodesItems() {
      return this.$store.getters['prodes/getLegendItems'];
    },
    monitoringItems() {
      return this.$store.getters['monitoring/getActiveLegendItems'];
    },
    alertsItems() {
      return this.$store.getters['urgent-alerts/getLegendItems'];
    },
    landUseItems() {
      return this.$store.getters['land-use/getActiveLegendItems'];
    },
    monitoringCount() {
      return this.filteredMonitoringData.length;
    },
    alertsCount() {
      return this.filteredAlertsData.length;
    },
    ...mapState({
      monitoringFilters: (state) => state.monitoring.filters,
      alertsFilters: (state) => state['urgent-alerts'].filters,
      prodesFilters: (state) => state.prodes.filters,
      deterFilters: (state) => state.deter.filters,
      showFeaturesMonitoring: (state) => state.monitoring.showFeaturesMonitoring,
      monitoringFeatures: (state) => state.monitoring.features,
      showFeaturesAlerts: (state) => state['urgent-alerts'].showFeaturesAlerts,
      tableMonitoring: (state) => state.monitoring.tableMonitoring,
      tableAlerts: (state) => state['urgent-alerts'].tableAlerts,
      legendVisibility: (state) => state.monitoring.legendVisibility,
      legendVisibilityalerts: (state) => state['urgent-alerts'].legendVisibility,
      showFeaturesProdes: (state) => state.prodes.showFeaturesProdes,
      prodesFeatures: (state) => state.prodes.features,
      showFeaturesDeter: (state) => state.deter.showFeaturesDeter,
      deterFeatures: (state) => state.deter.features,
      showFeaturesLandUse: (state) => state['land-use'].showFeaturesLandUse,
      landUseFeatures: (state) => state['land-use'].features,
      tableLandUse: (state) => state['land-use'].tableLandUse,
      supportLayerUser: (state) => state.supportLayersUser.supportLayerUser,
      showFeaturesSupportLayers: (state) => state.supportLayers.showFeaturesSupportLayers,
      supportLayers: (state) => state.supportLayers.supportLayers,
      supportLayersCategoryBase: (state) => state.supportLayers.supportLayersCategoryBase,
      showFeaturesUrgentAlerts: (state) => state['urgent-alerts'].showFeaturesUrgentAlerts,
      layers: (state) => state.foco.layers,
      filterOptions: (state) => state.foco.filterOptions,
      isLoadingFeatures: (state) => state.foco.isLoadingFeatures,
      bounds: (state) => state.map.bounds,
      totalFeatures: (state) => state.monitoring.totalFeatures,
    }),
  },

  watch: {
    monitoringFeatures(newVal) {
      if (newVal && newVal.features && newVal.features.length > 100) {
        this.showWarningMessage = true;
      }
    },
    carData: {
      handler(newData) {
        if (newData && newData.length > 0 && this.printMap) {
          console.log('🗺️ Recebidos dados CAR para exibir:', newData.length);
          this.$nextTick(() => {
            this.displayCAROnMap(newData);
          });
        } else if (newData && newData.length > 0) {
          console.log('⏳ Dados CAR recebidos, aguardando mapa...');
        } else {
          this.removeCARFromMap();
        }
      },
      immediate: true,
      deep: true,
    },
    combinedTableData: {
      handler(newVal) {
        this.selectedItemsCount = newVal.length;
        this.showWarningMessage = (this.showFeaturesMonitoring
        || this.showFeaturesLandUse) && newVal.length > 7;
      },
      immediate: true,
    },
  },

  async mounted() {
    if (this.showFeaturesMonitoring && this.getDataTableMonitoring) {
      await this.getDataTableMonitoring();
    }
    if (this.showFeaturesLandUse && this.getDataTableLandUse) {
      await this.getDataTableLandUse();
    }
    if (this.showFeaturesAlerts && this.getDataTableAlerts) {
      await this.getDataTableAlerts();
    }

    this.selectedItemsCount = this.combinedTableData.length;
    this.showWarningMessage = (this.showFeaturesMonitoring
    || this.showFeaturesLandUse) && this.selectedItemsCount > 7;

    const visibleLayersCount = Object.values(this.supportLayers).filter((l) => l.visible).length;
    if (visibleLayersCount > 0 && visibleLayersCount > 7) {
      this.showWarningMessage = true;
    }

    const visibleUserLayers = Object.values(this.supportLayerUser).filter((l) => l.visible).length;
    if (visibleUserLayers > 0 && visibleUserLayers > 7) {
      this.showWarningMessage = true;
    }
  },

  beforeDestroy() {
    this.removeCARFromMap();
  },

  methods: {
    getCarColor(index) {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
        '#F9E79F', '#A9DFBF', '#F5B7B1', '#AED6F1', '#E8DAEF',
        '#A3E4D7', '#FAD7A0', '#D2B4DE', '#A9CCE3', '#F9E79F',
        '#ABEBC6',
      ];
      return colors[index % colors.length];
    },

    getTerraIndigenaName(carItem) {
      if (carItem.properties && carItem.properties.no_terra_indigena) {
        return carItem.properties.no_terra_indigena;
      }
      if (carItem.no_terra_indigena) {
        return carItem.no_terra_indigena;
      }
      if (carItem.properties && carItem.properties.nome) {
        return carItem.properties.nome;
      }
      return 'Nome não disponível';
    },

    onMapReady(map) {
      console.log('🗺️ Mapa de impressão pronto!');
      this.printMap = map;

      if (this.carData && this.carData.length > 0) {
        this.$nextTick(() => {
          this.displayCAROnMap(this.carData);
        });
      }
    },

    displayCAROnMap(features) {
      try {
        console.log('🗺️ Adicionando CAR ao mapa de impressão...');
        console.log('📋 Dados CAR recebidos:', features);

        if (!this.printMap) {
          console.error('❌ Mapa de impressão ainda não está pronto');
          return;
        }

        this.removeCARFromMap();

        const colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
          '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
          '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
          '#F9E79F', '#A9DFBF', '#F5B7B1', '#AED6F1', '#E8DAEF',
          '#A3E4D7', '#FAD7A0', '#D2B4DE', '#A9CCE3', '#F9E79F',
          '#ABEBC6',
        ];

        const carLayers = features.map((feature, index) => {
          const color = colors[index % colors.length];
          const numero = index + 1;

          const carStyle = {
            color,
            weight: 3,
            opacity: 0.9,
            fillColor: color,
            fillOpacity: 0.3,
          };

          const layer = L.geoJSON(feature, {
            style: carStyle,
          });

          const center = layer.getBounds().getCenter();

          const numberMarker = L.marker(center, {
            icon: L.divIcon({
              className: 'car-number-marker',
              html: `<div style="
                background-color: ${color};
                color: white;
                border: 2px solid white;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">${numero}</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            }),
          });

          return L.layerGroup([layer, numberMarker]);
        });

        this.carLayer = L.layerGroup(carLayers);
        this.carLayer.addTo(this.printMap);

        console.log(`✅ ${features.length} CARs adicionados ao mapa de impressão com números!`);

        const allLayers = carLayers.flatMap((layerGroup) => layerGroup.getLayers());
        const group = L.featureGroup(allLayers);
        this.printMap.fitBounds(group.getBounds().pad(0.1));
      } catch (error) {
        console.error('❌ Erro ao exibir CAR no mapa de impressão:', error);
      }
    },

    removeCARFromMap() {
      if (this.carLayer && this.printMap) {
        this.printMap.removeLayer(this.carLayer);
        this.carLayer = null;
        console.log('🗑️ CAR removido do mapa de impressão');
      }
    },

    formatNumber(value) {
      let number;
      if (typeof value === 'string') {
        const cleanedValue = value.replace(/\./g, '').replace(',', '.');
        number = parseFloat(cleanedValue);
      } else {
        number = parseFloat(value);
      }

      if (!Number.isNaN(number)) {
        const rounded = number.toFixed(3);
        const [intPart, decimalPart] = rounded.split('.');

        return decimalPart !== '00'
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`
          : String(parseInt(number, 10));
      }
      return '-';
    },

    vectorImage(layer) {
      return layer.vector.thumbnail_blob || layer.vector.image;
    },

    handleProdesYear() {
      const { prodesFilters } = this;
      if (!prodesFilters) return '-';
      if (prodesFilters.startYear === prodesFilters.endYear) {
        return prodesFilters.startYear;
      }
      return `${prodesFilters.startYear} ${this.$t('and')} ${prodesFilters.endYear}`;
    },

    handleData(data) {
      if (!data || typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        console.warn('Data inválida:', data);
        return 'Data indisponível';
      }
      const [year, month, day] = data.split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    },

    todayDate() {
      const date = new Date();
      const dd = date.getDate();
      const mm = date.getMonth() + 1;
      const yyyy = date.getFullYear();
      return `${dd < 10 ? `0${dd}` : dd}/${mm < 10 ? `0${mm}` : mm}/${yyyy}`;
    },

    updateBounds(bounds) {
      this.currentBouldMap = bounds;
    },

    getCenter(center) {
      this.mapCenter = center;
    },

    getZoom(zoom) {
      this.mainZoom = zoom;
    },

    adjustMapSizeForPrint(tamanho) {
      const mapDimensions = this.getMapDimensions(tamanho);
      document.getElementById('map-for-print-container').style.width = `${mapDimensions.width}px`;
      document.getElementById('map-for-print-container').style.height = `${mapDimensions.height}px`;
    },

    getMapDimensions(tamanho) {
      switch (tamanho) {
        case 'A4':
          return { width: 1105, height: 770 };
        case 'A3':
          return { width: 1450, height: 800 };
        default:
          return { width: 210, height: 297 };
      }
    },

    print() {
      this.adjustMapSizeForPrint(this.leafSize.type);
      const style = document.createElement('style');
      style.setAttribute('media', 'print');
      window.print();
    },

    async saveImage() {
      this.loadingPrintImage = true;
      const node = document.getElementById('map-for-print-container');
      const mapBounds = document.getElementsByClassName('leaflet-control-mapbounds')[0];
      const mapControlZoom = document.getElementsByClassName('leaflet-control-zoom')[0];
      const infoControlRight = document.getElementsByClassName('leaflet-control-attribution')[1];
      const legends = document.getElementsByClassName('text-legend-customized');
      const originalLegends = [];
      const originalStyle = infoControlRight ? infoControlRight.getAttribute('style') : null;

      try {
        const nameImageDownload = this.mapTitle;

        // Preparar controles do mapa (igual ao código que funciona)
        if (mapControlZoom) mapControlZoom.style.display = 'none';
        if (mapBounds) mapBounds.style.width = '250px';
        if (infoControlRight) {
          const currentWidth = parseFloat(window.getComputedStyle(infoControlRight).width);
          infoControlRight.style.width = `${currentWidth + 30}px`;
        }

        const originalWidth = node.style.width;
        const originalHeight = node.style.height;
        const originalOverflow = node.style.overflow;

        node.style.width = '1230px';
        node.style.height = '780px';
        node.style.overflow = 'hidden';

        if (legends && legends.length > 0) {
          Array.from(legends).forEach((legend) => {
            originalLegends.push(legend.style.width);
            legend.style.width = '110px';
          });
        }

        await this.$nextTick();

        const options = {
          quality: 1,
          bgcolor: 'white',
          width: 1230,
          height: 780,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
          },
        };

        if (infoControlRight) {
          infoControlRight.setAttribute('style', 'width: 304px');
        }

        const image = await domtoimage.toJpeg(node, options);

        const link = document.createElement('a');
        link.href = image;
        link.download = nameImageDownload ? `${nameImageDownload}.jpeg` : 'Mapa.jpeg';
        link.click();

        this.loadingPrintImage = false;
      } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        this.$emit('show-error', 'Ocorreu um erro ao gerar a imagem.');
        this.loadingPrintImage = false;
      } finally {
        if (infoControlRight) infoControlRight.setAttribute('style', originalStyle || 'width: auto');
        if (mapBounds) mapBounds.style.width = 'auto';
        if (mapControlZoom) mapControlZoom.style.display = 'block';
        if (originalLegends && originalLegends.length > 0) {
          Array.from(legends).forEach((legend, index) => {
            legend.style.width = originalLegends[index];
          });
        }
        if (node) {
          node.style.width = originalWidth;
          node.style.height = originalHeight;
          node.style.overflow = originalOverflow;
        }
      }
    },

    ...mapActions('monitoring', ['getDataTableMonitoring']),
    ...mapActions('land-use', ['getDataTableLandUse']),
    ...mapActions('urgent-alerts', ['getDataTableAlerts']),
  },
};
</script>

<style scoped>
/* Mini-mapa no canto superior direito */
.mini-map-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 200px;
  height: 150px;
  z-index: 1000;
  background: white;
  border: 2px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Container principal do mapa para impressão */
#map-for-print-container {
  flex-direction: column;
}

#monitoring-data-details {
  position: relative;
}

/* Tabela de dados flutuante no mapa */
#data-table {
  position: absolute;
  right: 0.5rem;
  bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap-reverse;
  justify-content: flex-start;
  max-height: 760px;
  gap: 0.5rem;
  z-index: 1000;
}

#data-table > div {
  background: #fffbfb;
  opacity: 0.9;
  padding: 5px;
}

.bordered-red { border: 2px solid red; }
.bordered-blue { border: 2px solid blue; }
.bordered-black { border: 2px solid black; }

.bordered-red,
.bordered-blue {
  padding: 10px;
  border-radius: 5px;
}

/* CAR flutuante no mapa (canto inferior esquerdo) */
.car-map-container {
  position: absolute;
  left: 0.5rem;
  bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  max-height: 200px;
  gap: 0.3rem;
  z-index: 1000;
}

.car-map-item {
  background: #fffbfb;
  opacity: 0.9;
  padding: 3px 6px;
  border-radius: 3px;
  border: 1px solid #ccc;
}

.car-map-name {
  font-size: 8px;
  line-height: 1.1;
  word-break: break-word;
  max-width: 120px;
}

/* Legenda - lista de CAR */
.car-legend-section { margin-bottom: 8px; }
.car-list-row {
  max-height: 120px;
  overflow-y: auto;
  margin: 0 -2px;
}
.car-list-item {
  padding: 1px 2px;
  margin-bottom: 1px;
}
.car-name {
  font-size: 8px;
  line-height: 1.1;
  word-break: break-word;
}
.car-number-avatar {
  border: 1px solid white !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  min-width: 20px !important;
}

/* Ajustes gerais do mapa */
.map-wrapper { width: 100%; }
.vue-leaflet-map { height: 100% !important; }

/* Legenda principal - ajustes críticos para não cortar conteúdo */
.legend-info-map {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: auto !important;
  padding-bottom: 5px;
  overflow: visible !important;
}

.legend-info-map-details {
  height: auto !important;
  overflow: visible !important;
}

.legend-content-container {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 5px;
}

.legend-content-container::-webkit-scrollbar {
  width: 6px;
}
.legend-content-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

/* Dialog de impressão */
.print-dialog-header,
.print-dialog-footer {
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}
.print-dialog-header {
  background: var(--v-primary-base);
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 16px;
  display: flex;
  justify-content: flex-end;
}
.print-dialog-footer {
  background: white;
  border-top: 1px solid #e0e0e0;
}

/* Configuração geral da página */
@page {
  size: landscape;
  margin: 0;
}

/* ==================== REGRAS DE IMPRESSÃO ==================== */
@media print {
  .mini-map-overlay {
    top: 10px;
    right: 10px;
    width: 180px;
    height: 130px;
  }

  #map-for-print-container {
    height: auto !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print-dialog-header,
  .print-dialog-footer,
  .no-print {
    display: none !important;
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

  .v-icon { color: inherit !important; }

  /* Legenda completa visível na impressão */
  .legend-info-map,
  .legend-info-map-details,
  .legend-content-container {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }

  .car-list-row {
    max-height: none !important;
    overflow-y: visible !important;
  }

  .car-list-item { break-inside: avoid; }

  .car-number-avatar,
  .logo,
  .legend-item {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .border-container {
    height: auto !important;
    page-break-inside: avoid;
  }
}

/* Tipografia e elementos auxiliares */
p { font-size: xx-small; margin: 0; }

.font-title {
  line-break: anywhere;
  width: 100%;
}
.font-title p {
  font-size: 10px;
  margin: 0;
  padding: 0;
  text-align: center;
  max-width: 750px;
  font-family: 'Roboto', sans-serif;
  text-transform: uppercase;
  font-weight: 700;
  color: #6c757d;
}

.print-mini-map-text {
  color: dimgray !important;
  font-size: xx-small;
  white-space: nowrap;
}

.border_container_legend {
  border: 0.5px solid gray;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 0 5px #bbb !important;
  height: 100%;
}

.border-container,
.height-container-mini-map {
  height: 100%;
}

.height-container-mini-map {
  max-height: 150px;
  width: 100%;
}

.font-page p { font-size: large; }
.image-container { width: 100%; }
.row { margin: 0 !important; }
img.layer-thumbnail { width: 25px; }

.warning-message {
  position: absolute;
  max-width: 350px;
  top: 35%;
  left: 30%;
  z-index: 20;
  background: #ffffff;
}

:deep(.v-chip) { padding: 0 5px !important; }

@media (max-width: 600px) {
  :deep(.v-dialog) { background-color: #fff !important; }
}
</style>