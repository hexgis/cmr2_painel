<template>
  <v-dialog
    v-model="showDialog"
    width="auto"
    @click:outside="$emit('close')"
  >
    <!-- Header -->
    <v-card-title class="print-dialog-header no-print primary">
      <v-spacer />
      <v-btn
        icon
        x-small
        color="white"
        @click="$emit('close')"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-container
      fluid
      class="pa-0"
      style="background-color: white"
    >
      <v-row
        no-gutters
        class="map-container"
      >
        <!-- Mapa -->
        <v-col
          cols="12"
          class="pa-2 mt-2 map-col"
        >
          <div class="map-legend-container">
            <!-- MiniMap -->

            <v-card class="mini-map-card">
              <MiniMap
                v-if="currentBouldMap"
                :current-bould-map="currentBouldMap"
                :map-center="mapCenter"
                :main-zoom="mainZoom"
              />
            </v-card>
          </div>

          <!-- Warning Message -->
          <v-card
            v-if="showWarningMessage && !(showFeaturesAlerts && !showFeaturesMonitoring && !showFeaturesLandUse)"
            class="warning-message"
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

          <!-- Mapa Principal -->
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

        <!-- Legenda e Informações -->
        <v-col
          cols="12"
          class="pl-1 mt-2 info-col"
        >
          <v-card class="border-container">
            <v-card-text>
              <!-- Título -->
              <v-row class="font-title pb-2 text-center">
                <v-col cols="12">
                  <p>{{ mapTitle }}</p>
                  <p>{{ print_title }}</p>
                </v-col>
              </v-row>

              <!-- Legendas -->
              <v-row class="legend-info-map">
                <v-col>fasdfas</v-col>
                <v-col cols="12">
                  <v-row class="legend-section">
                    <!-- Monitoramento -->
                    <v-col
                      v-if="showFeaturesMonitoring && hasActiveMonitoringStages && selectedItemsCount > 0"
                      cols="auto"
                    >
                      <p class="d-flex align-center">
                        <strong class="mr-2">Monitoramento Diário</strong>
                        <v-chip x-small>
                          {{ monitoringCount }}
                        </v-chip>
                      </p>
                      <v-divider class="red-divider" />
                      <CustomizedLegend
                        class="pt-1"
                        :items="monitoringItems"
                      />
                    </v-col>

                    <!-- Alertas -->
                    <v-col
                      v-if="showFeaturesAlerts && hasActiveAlertsStages && selectedItemsCount > 0"
                      cols="auto"
                    >
                      <p class="d-flex align-center">
                        <strong class="mr-2">Alerta Urgente</strong>
                        <v-chip x-small>
                          {{ alertsCount }}
                        </v-chip>
                      </p>
                      <v-divider class="blue-divider" />
                      <CustomizedLegend
                        class="pt-1"
                        :items="alertsItems"
                      />
                    </v-col>

                    <!-- Camadas de Suporte -->
                    <v-col
                      v-if="showFeaturesSupportLayers &&
                        Object.values(supportLayers).filter(l => l.visible).length &&
                        Object.values(supportLayers).filter(l => l.visible).length <= 7 &&
                        Object.values(supportLayerUser).filter(l => l.visible).length <= 7"
                      cols="auto"
                    >
                      <p><strong>Sobreposição de camadas</strong></p>
                      <v-divider class="blue-divider" />
                      <LayerList
                        :layers="supportLayerUser"
                        :is-user-layer="true"
                      />
                      <LayerList
                        v-if="showFeaturesSupportLayers"
                        :layers="supportLayers"
                        class="mt-1"
                      />
                    </v-col>

                    <!-- Uso do Solo -->
                    <v-col
                      v-if="showFeaturesLandUse"
                      cols="auto"
                    >
                      <p class="d-flex align-center">
                        <strong class="mr-2">Uso e Ocupação do Solo</strong>
                        <v-chip x-small>
                          {{ tableLandUse.length }}
                        </v-chip>
                      </p>
                      <v-divider class="blue-divider" />
                      <CustomizedLegend
                        class="pt-1"
                        :items="landUseItems"
                      />
                    </v-col>

                    <!-- PRODES -->
                    <v-col
                      v-if="showFeaturesProdes"
                      cols="auto"
                    >
                      <p><strong>INPE - Prodes</strong></p>
                      <v-divider class="blue-divider" />
                      <CustomizedLegend
                        class="pt-1"
                        :items="prodesItems"
                      />
                    </v-col>

                    <!-- DETER -->
                    <v-col
                      v-if="showFeaturesDeter"
                      cols="auto"
                    >
                      <p><strong>INPE - Deter</strong></p>
                      <v-divider class="blue-divider" />
                      <CustomizedLegend
                        class="pt-1"
                        :items="deterItems"
                      />
                    </v-col>

                    <!-- Focos de Calor -->
                    <v-col
                      v-if="showFeaturesAquaMM || showFeaturesAquaMT"
                      cols="auto"
                    >
                      <p><strong>INPE - Focos de Calor</strong></p>
                      <v-divider class="blue-divider" />
                      <CustomizedLegend
                        class="pt-1"
                        :items="heatFocusItems.filter(item =>
                          (item.label === 'Aqua Modis Manhã' && showFeaturesAquaMM) ||
                          (item.label === 'Aqua Modis Tarde' && showFeaturesAquaMT)
                        )"
                      />
                    </v-col>
                  </v-row>

                  <!-- Bases Cartográficas -->
                  <v-divider class="my-2" />
                  <v-row v-if="hasCartographicDatasets">
                    <v-col cols="12">
                      <p class="ma-1">
                        <strong>Bases Cartográficas:</strong>
                      </p>
                      <v-row
                        v-for="layerCategory in layerCategories"
                        :key="layerCategory.name"
                      >
                        <v-col
                          v-for="layer in layerCategory.layers"
                          :key="layer.id"
                          cols="12"
                        >
                          <v-row
                            v-if="layer.visible"
                            no-gutters
                            align="center"
                          >
                            <v-col>
                              <p class="ml-1">
                                <strong>{{ layer.name || '-' }}.</strong>
                                Fonte:{{ layer.fonte || '-' }}, Data de atualização:
                                {{ handleData(layer.dt_atualizacao) }}.
                              </p>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>

                  <!-- Filtros de Data -->
                  <v-row>
                    <v-col cols="12">
                      <p
                        v-if="showFeaturesMonitoring"
                        class="ml-1"
                      >
                        {{ $t('monitoring-print-label') }}
                        {{ handleData(monitoringFilters.startDate) }}
                        {{ $t('and') }}
                        {{ handleData(monitoringFilters.endDate) }}
                      </p>

                      <p
                        v-if="showFeaturesAlerts"
                        class="ml-1"
                      >
                        {{ $t('alerts-print-label') }}
                        {{ handleData(alertsFilters.startDate) }}
                        {{ $t('and') }}
                        {{ handleData(alertsFilters.endDate) }}
                      </p>

                      <p
                        v-if="showFeaturesLandUse && uniqueYears.length > 0"
                        class="ml-1"
                      >
                        {{ $t('land-use-print-label') }}
                        <span
                          v-for="(year, index) in uniqueYears"
                          :key="'year-' + index"
                        >
                          {{ year }}<span v-if="index < uniqueYears.length - 1">, </span>
                        </span>
                      </p>

                      <p
                        v-if="showFeaturesProdes"
                        class="ml-1"
                      >
                        {{ $t('prodes-print-label') }}
                        {{ handleProdesYear() }}
                      </p>

                      <p
                        v-if="showFeaturesDeter"
                        class="ml-1"
                      >
                        {{ $t('deter-print-label') }}
                        {{ handleData(deterFilters.startDate) }}
                        {{ $t('and') }}
                        {{ handleData(deterFilters.endDate) }}
                      </p>

                      <p
                        v-if="showFeaturesAquaMM || showFeaturesAquaMT"
                        class="ml-1"
                      >
                        {{ $t('heat-focus-print-label') }}
                        {{ handleData(focoFilters.startDate) }}
                        {{ $t('and') }}
                        {{ handleData(focoFilters.endDate) }}
                      </p>
                    </v-col>
                  </v-row>

                  <!-- Informações de Rodapé -->
                  <v-divider class="my-2" />
                  <v-row>
                    <v-col cols="12">
                      <p class="ma-1">
                        {{ print_info }}
                        {{ $t('text-address0') }}
                      </p>
                      <p class="ma-1">
                        {{ print_info }}
                        {{ $t('text-address') }}
                        {{ todayDate() }}
                      </p>
                    </v-col>
                  </v-row>

                  <v-divider class="my-2" />
                  <v-row>
                    <v-col cols="12">
                      <p class="ma-1">
                        {{ $t('author-label') }}
                      </p>
                      <p class="ma-1">
                        {{ $t('text-info') }}
                      </p>
                      <p class="ma-1">
                        {{ $t('text-format') }}
                        {{ leafSize.type }}.
                      </p>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Footer -->
    <v-card-actions class="print-dialog-footer no-print">
      <v-btn @click="$emit('back')">
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
    </v-card-actions>
  </v-dialog>
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
        (item) => item.monitoring && Object.keys(item.monitoring).some((key) => item.monitoring[key] > 0),
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
        const hasMonitoring = this.showFeaturesMonitoring && item.monitoring && Object.keys(item.monitoring).some((key) => item.monitoring[key] > 0);
        const hasLandUse = this.showFeaturesLandUse && item.landUse && Object.keys(item.landUse).some((key) => item.landUse[key] > 0);
        const hasAlerts = this.showFeaturesAlerts && item.alerts && Object.keys(item.alerts).some((key) => item.alerts[key] > 0);
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
        this.showWarningMessage = (this.showFeaturesMonitoring || this.showFeaturesLandUse) && newVal.length > 7;
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
    this.showWarningMessage = (this.showFeaturesMonitoring || this.showFeaturesLandUse) && this.selectedItemsCount > 7;

    const visibleLayersCount = Object.values(this.supportLayers).filter((l) => l.visible).length;
    if (visibleLayersCount > 0 && visibleLayersCount > 7) {
      this.showWarningMessage = true;
    }

    const visibleUserLayers = Object.values(this.supportLayerUser).filter((l) => l.visible).length;
    if (visibleUserLayers > 0 && visibleUserLayers > 7) {
      this.showWarningMessage = true;
    }
  },

  methods: {
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
      document.querySelector('.map-container').style.width = `${mapDimensions.width}px`;
      document.querySelector('.map-container').style.height = `${mapDimensions.height}px`;
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
      const node = document.querySelector('.map-container');

      try {
        const nameImageDownload = this.mapTitle;

        const originalWidth = node.style.width;
        const originalHeight = node.style.height;

        node.style.width = '1230px';
        node.style.height = '780px';

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

        const image = await domtoimage.toJpeg(node, options);

        const link = document.createElement('a');
        link.href = image;
        link.download = nameImageDownload ? `${nameImageDownload}.jpeg` : 'Mapa.jpeg';
        link.click();

        node.style.width = originalWidth;
        node.style.height = originalHeight;

        this.loadingPrintImage = false;
      } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        this.$emit('show-error', 'Ocorreu um erro ao gerar a imagem.');
        this.loadingPrintImage = false;
      }
    },

    ...mapActions('monitoring', ['getDataTableMonitoring']),
    ...mapActions('land-use', ['getDataTableLandUse']),
    ...mapActions('urgent-alerts', ['getDataTableAlerts']),
  },

  beforeDestroy() {
    this.removeCARFromMap();
  },
};
</script>

<style scoped>
.map-container {
  width: 1230px;
  height: 800px;
  max-height: 780px;
  overflow: hidden;
}

.map-col {
  position: relative;
  max-height: 780px;
}

.map-legend-container {
  position: absolute;
  right: 0.5rem;
  bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: flex-start;
  flex-direction: column;
  max-height: 760px;
  gap: 0.5rem;
  z-index: 1000;
}

.mini-map-card {
  background: #fffbfb;
  opacity: 0.9;
  padding: 5px;
}

.map-wrapper {
  width: 100%;
  height: 100%;
}

.legend-info-map {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding-bottom: 5px;
}

.legend-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.legend-card {
  background: #fffbfb;
  opacity: 0.9;
  max-width: 200px;
}

.red-divider {
  border-color: red !important;
  border-width: 1px !important;
  margin: 0;
  margin-top: 0px;
}

.blue-divider {
  border-color: blue !important;
  border-width: 1px !important;
  margin: 0;
  margin-top: 3px;
}

.print-dialog-header {
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 16px;
  display: flex;
  justify-content: flex-end;
  position: relative;
  z-index: 10;
}

.print-dialog-footer {
  flex-shrink: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  position: relative;
  z-index: 10;
}

@page {
  size: landscape;
  margin: 0;
}

@media print {
  @page {
    size: landscape;
    margin: 0;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print-dialog-header,
  .print-dialog-footer {
    display: none !important;
  }

  .logo,
  .legend-item {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
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

  .v-icon {
    color: inherit !important;
  }
}

p {
  font-size: xx-small;
  margin: 0;
}

.font-title {
  line-break: anywhere;
  width: 100%;
}

.font-title p {
  font-size: 10px;
  margin: 0px;
  padding: 0px;
  text-align: center;
  max-width: 750px;
  font-family: 'Roboto', sans-serif;
  text-transform: uppercase;
  font-weight: 700;
  color: #6c757d;
}

.border-container {
  height: 100%;
}

.warning-message {
  position: absolute;
  max-width: 350px;
  top: 35%;
  left: 30%;
  z-index: 20;
  background: #ffffff;
}

:deep(.v-chip) {
  padding: 0 5px !important;
}

.car-number-marker {
  background: transparent !important;
  border: none !important;
}

@media (max-width: 600px) {
  :deep(.v-dialog) {
    background-color: #fff !important;
  }
}

.info-col {
  max-height: 780px;
  overflow-y: auto;
}
</style>
