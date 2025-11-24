<template>
  <v-container>
    <style>
      @media print {
      @page {
      size: landscape;
      margin: 0;
      }
      }

      /* Classe para os divisores estilizados */
      .styled-divider {
        border: 1px solid blue;
        margin: 0;
        margin-top: 3px;
      }
      .styled-divider-red {
        border: 1px solid red;
        margin: 0;
        margin-top: 3px;
      }
    </style>
    <v-dialog
      v-model="showDialog"
      width="auto"
      @click:outside="$emit('close')"
    >
      <v-toolbar
        dense
        class="print-dialog-header no-print"
        color="primary"
      >
        <v-btn
          icon
          x-small
          color="white"
          class="close-btn mb-4"
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-row class="content-scroll-container">
        <v-container style="background-color: white; max-width: 100%">

          <!-- Logos e Título centralizados -->
          <v-row class="justify-center text-center ma-2">
            <v-col cols="12">
              <!-- Logos lado a lado -->
              <v-row class="justify-center align-center mb-2">
                <v-col cols="auto">
                  <v-img
                    contain
                    :src="logo_funai"
                    max-width="120px"
                    max-height="60px"
                  />
                </v-col>
                <v-col cols="auto" class="pl-16">
                  <v-img
                    contain
                    :src="logo_cmr"
                    max-width="180px"
                    max-height="60px"
                  />
                </v-col>
              </v-row>
              
              <!-- Título -->
              <v-row class="justify-center">
                <v-col cols="12">
                  <p class="font-title text-h6">{{ mapTitle }}</p>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-row
            id="map-for-print-container"
            no-gutters
            style="width: 1230px;  overflow: hidden"
          >
            <v-col
              cols="12"
              class="pr-0 mt-2"
              style="max-height: 500px; position: relative"
            >
              <!-- MiniMap em cima do mapa principal -->
              <v-sheet class="mini-map-overlay">
                <MiniMap
                  v-if="currentBouldMap"
                  :current-bould-map="currentBouldMap"
                  :map-center="mapCenter"
                  :main-zoom="mainZoom"
                />
              </v-sheet>

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

            <!-- Lista CAR na legenda -->
            <v-row
              v-if="carData && carData.length > 0"
            >
              <p class="d-flex align-center ma-1">
                <strong class="mr-2">Cadastro Ambiental Rural (CAR)</strong>
                <v-chip x-small>
                  {{ carData.length }}
                </v-chip>
              </p>
              <v-col
                cols="12"
              >
                <v-row>
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
                        <span
                          class="white--text font-weight-bold"
                          style="font-size: 10px;"
                        >
                          {{ index + 1 }}
                        </span>
                      </v-avatar>
                      <span class="car-name">{{ getTerraIndigenaName(item) }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-divider />

            <v-row
              class="flex-nowrap justify-start align-start"
              style="gap: 5px; flex-wrap: wrap;"
            >
              <v-col
                v-if="showFeaturesMonitoring
                && hasActiveMonitoringStages
                && selectedItemsCount > 0"
                cols="2"
              >
                <p>
                  <strong>Monitoramento Diário</strong>
                  <v-chip x-small>
                    {{ monitoringCount }}
                  </v-chip>
                </p>
                <hr class="styled-divider-red">
                <CustomizedLegend
                  class="pt-1"
                  :items="monitoringItems"
                />
              </v-col>

              <v-col
                v-if="showFeaturesAlerts
                && hasActiveAlertsStages
                && selectedItemsCount > 0"
                cols="2"
              >
                <p>
                  <strong>Alerta Urgente</strong>
                  <v-chip x-small>
                    {{ alertsCount }}
                  </v-chip>
                </p>
                <hr class="styled-divider">
                <CustomizedLegend
                  class="pt-1"
                  :items="alertsItems"
                />
              </v-col>
              <v-col
                v-if="showFeaturesSupportLayers
                  && Object.values(supportLayers).filter(l => l.visible).length
                  && Object.values(supportLayers).filter(l => l.visible).length <= 7
                  && Object.values(supportLayerUser).filter(l => l.visible).length <= 7"
                cols="2"
              >
                <p style="width: 120px">
                  <strong>Sobreposição de camadas</strong>
                </p>
                <hr class="styled-divider">
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

              <v-col
                v-if="showFeaturesLandUse"
                cols="2"
              >
                <p>
                  <strong>Uso e Ocupação do Solo</strong>
                  <v-chip x-small>
                    {{ tableLandUse.length }}
                  </v-chip>
                </p>
                <hr class="styled-divider">
                <CustomizedLegend
                  class="pt-1"
                  :items="landUseItems"
                />
              </v-col>

              <v-col
                v-if="showFeaturesProdes"
                cols="2"
              >
                <p><strong>INPE - Prodes</strong></p>
                <hr class="styled-divider">
                <CustomizedLegend
                  class="pt-1"
                  :items="prodesItems"
                />
              </v-col>

              <v-col
                v-if="showFeaturesDeter"
                cols="2"
              >
                <p><strong>INPE - Deter</strong></p>
                <hr class="styled-divider">
                <CustomizedLegend
                  class="pt-1"
                  :items="deterItems"
                />
              </v-col>

              <v-col
                v-if="showFeaturesAquaMM || showFeaturesAquaMT"
                cols="2"
              >
                <p><strong>INPE - Focos de Calor</strong></p>
                <hr class="styled-divider">
                <CustomizedLegend
                  class="pt-1"
                  :items="filteredHeatFocusItems"
                />
              </v-col>
            </v-row>

            <v-divider />

            <!-- Tabela CAR detalhada -->
            <v-row
              v-if="carData && carData.length > 0"
              class="mt-2"
            >
              <v-col cols="12">
                <v-simple-table
                  dense
                  fixed-header
                  height="auto"
                  class="text-caption"
                >
                  <template v-slot:default>
                    <thead>
                      <tr class="text-caption">
                        <th class="text-center px-1">#</th>
                        <th class="text-left px-1">Código de origem</th>
                        <th class="text-left px-1">Nome da Terra Indígena</th>
                        <th class="text-left px-1">Município</th>
                        <th class="text-left px-1">UF</th>
                        <th class="text-left px-1">Etnia</th>
                        <th class="text-right px-1">Área (ha)</th>
                        <th class="text-left px-1">Situação</th>
                        <th class="text-left px-1">Condição do Imóvel</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(item, index) in carData"
                        :key="'car-table-' + index"
                        class="text-caption"
                      >
                        <td class="text-center px-1">
                          <v-avatar
                            :color="getCarColor(index)"
                            size="20"
                          >
                            <span class="white--text font-weight-bold text-caption">
                              {{ index + 1 }}
                            </span>
                          </v-avatar>
                        </td>
                        <td class="px-1">{{ item.properties?.co_imovel || '-' }}</td>
                        <td class="px-1">{{ getTerraIndigenaName(item) }}</td>
                        <td class="px-1">{{ getMunicipioName(item) }}</td>
                        <td class="px-1">{{ item.properties?.sg_uf || '-' }}</td>
                        <td class="px-1">{{ item.properties?.no_etnia || '-' }}</td>
                        <td class="text-right px-1">{{ formatNumber(item.properties?.nu_area_ha) }}</td>
                        <td class="px-1">{{ item.properties?.tp_situacao || '-' }}</td>
                        <td class="px-1">{{ item.properties?.ds_condicao_imovel || '-' }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
            </v-row>

            <v-col v-if="shouldShowCartographicSection">
              <v-divider />
              <!-- Texto sobre sistema geodésico -->
             <v-col class="py-2">
                <p>
                  {{ $t('geodetic-system-info-part1') }}
                  <strong>{{ $t('geodetic-system-info-strong') }}</strong>
                  {{ $t('geodetic-system-info-part2') }}
                </p>
              </v-col>
              <v-divider />
              <p class="d-block ml-3 mt-2">
                <strong>Bases Cartográficas:</strong>
              </p>

              <v-col
                v-for="layerCategory in layerCategories"
                :key="`${layerCategory.name}-${layerCategory.type}`"
              >
                <v-col
                  v-for="(layer, layerId) in layerCategory.layers"
                  :key="layerId"
                  class="pa-0 mb-1"
                >
                  <v-row
                    v-if="layer && layer.visible"
                    no-gutters
                    align="center"
                    class="image-container"
                  >
                    <v-col>
                      <p>
                        <strong>{{ layer.name || '-' }}.</strong>
                        Fonte:{{ layer.fonte || '-' }}, Data de
                        atualização:
                        {{ handleData(layer.dt_atualizacao) }}.
                      </p>
                    </v-col>
                  </v-row>
                </v-col>
              </v-col>
            </v-col>

            <v-col>
              <v-col
                v-for="(feature, index) in activePrintFeatures"
                :key="feature.key || index"
                class="py-1"
              >
                <p>
                  {{ $t(feature.label) }}
                  <span v-if="feature.type === 'date-range'">
                    {{ handleData(feature.startDate) }}
                    {{ $t('and') }}
                    {{ handleData(feature.endDate) }}
                  </span>
                  <span v-else-if="feature.type === 'years-list' && feature.years.length > 0">
                    <span
                      v-for="(year, yearIndex) in feature.years"
                      :key="'year-' + yearIndex"
                    >
                      {{ year }}<span v-if="yearIndex < feature.years.length - 1">, </span>
                    </span>
                  </span>
                  <span v-else-if="feature.type === 'single-year'">
                    {{ feature.yearHandler() }}
                  </span>
                </p>
              </v-col>
              <v-divider />
            </v-col>

            <v-col class="ml-3 py-1">
              <p>
                {{ print_info }}
                {{ $t('text-address0') }}
              </p>
              <p>
                {{ print_info }}
                {{ $t('text-address') }}
                {{ todayDate() }}
              </p>
            </v-col>
            <v-divider />
            <v-col class="ml-3 py-1">
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
            </v-col>
          </v-row>
        </v-container>
      </v-row>

      <!-- Footer com botões -->
      <v-footer class="print-dialog-footer no-print pa-4">
        <v-btn
          class="ml-2"
          @click="$emit('back')"
        >
          {{ $t('input-button-back-second-step') }}
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          class="mr-4"
          :disabled="loadingPrintImage"
          @click="generateMultiPagePDF"
        >
          <v-icon dark>
            mdi-file-export-outline
          </v-icon>
          {{ $t('input-button-pdf-image') }}
        </v-btn>
      </v-footer>
    </v-dialog>
    <PDFGenerator ref="pdfGenerator" />
  </v-container>
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
    "land-use-print-label": "Year usage and occupancy data",
    "monitoring-print-label": "Daily Monitoring Data between",
    "alerts-print-label": "Daily Urgent Alerts Data between",
    "and": "and",
    "prodes-print-label": "Prodes data between",
    "deter-print-label": "Deter data between",
    "heat-focus-print-label": "Heat focus data between",
    "aqua-morning": "Aqua Modis Morning",
    "aqua-afternoon": "Aqua Modis Afternoon",
    "geodetic-system-info-part1": "The geospatial information presented in this report is referenced to the geodetic system in geographic coordinates",
    "geodetic-system-info-strong": "SIRGAS2000 (EPSG:4674)",
    "geodetic-system-info-part2": ". All coordinates, measurements and cartographic representations follow this datum."
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
    "land-use-print-label": "Dados de Uso e Ocupação ano",
    "monitoring-print-label": "Dados de Monitoramento Diário entre",
    "alerts-print-label": "Dados de Alertas Urgente entre",
    "and": "e",
    "prodes-print-label": "Dados Prodes entre",
    "deter-print-label": "Dados Deter entre",
    "heat-focus-print-label": "Dados de Focos de Calor entre",
    "aqua-morning": "Aqua Modis Manhã",
    "aqua-afternoon": "Aqua Modis Tarde",
    "geodetic-system-info-part1": "As informações geoespaciais apresentadas neste relatório estão referenciadas ao sistema geodésico em coordenadas geográficas",
    "geodetic-system-info-strong": "SIRGAS2000 (EPSG:4674)",
    "geodetic-system-info-part2": ". Todas as coordenadas, medições e representações cartográficas seguem este datum."
  }
}
</i18n>

<script>
import { mapState, mapActions } from 'vuex';
import MapForPrint from './MapForPrint.vue';
import MiniMap from './MiniMap.vue';
import LayerList from './LayerListActive.vue';
import CustomizedLegend from './CustomizedLegendActive.vue';
import PDFGenerator from './PDFGenerator.vue';

export default {
  name: 'PrintTemplateMapLandscape',
  components: {
    MapForPrint,
    MiniMap,
    LayerList,
    CustomizedLegend,
    PDFGenerator
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
    filteredHeatFocusItems() {
      return this.heatFocusItems.filter((item) => (item.label === 'Aqua Modis Manhã' && this.showFeaturesAquaMM)
        || (item.label === 'Aqua Modis Tarde' && this.showFeaturesAquaMT));
    },

    activePrintFeatures() {
      const features = [];

      if (this.showFeaturesMonitoring) {
        features.push({
          type: 'date-range',
          label: 'monitoring-print-label',
          startDate: this.monitoringFilters.startDate,
          endDate: this.monitoringFilters.endDate
        });
      }

      if (this.showFeaturesAlerts) {
        features.push({
          type: 'date-range',
          label: 'alerts-print-label',
          startDate: this.alertsFilters.startDate,
          endDate: this.alertsFilters.endDate
        });
      }

      if (this.showFeaturesLandUse && this.uniqueYears.length > 0) {
        features.push({
          type: 'years-list',
          label: 'land-use-print-label',
          years: this.uniqueYears
        });
      }

      if (this.showFeaturesProdes) {
        features.push({
          type: 'single-year',
          label: 'prodes-print-label',
          yearHandler: this.handleProdesYear
        });
      }

      if (this.showFeaturesDeter) {
        features.push({
          type: 'date-range',
          label: 'deter-print-label',
          startDate: this.deterFilters.startDate,
          endDate: this.deterFilters.endDate
        });
      }

      if (this.showFeaturesAquaMM || this.showFeaturesAquaMT) {
        features.push({
          type: 'date-range',
          label: 'heat-focus-print-label',
          startDate: this.focoFilters.startDate,
          endDate: this.focoFilters.endDate
        });
      }

      return features;
    },

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
      const result = this.showFeaturesSupportLayers;
      return result;
    },

    hasVisibleCartographicLayers() {
      if (!this.showFeaturesSupportLayers) return false;

      const systemLayersVisible = this.supportLayers &&
        Object.values(this.supportLayers).some(layer => layer && layer.visible);

      const userLayersVisible = this.supportLayerUser &&
        Object.values(this.supportLayerUser).some(layer => layer && layer.visible);

      const result = systemLayersVisible || userLayersVisible;

      return result;
    },

    hasVisibleSupportLayers() {
      if (!this.showFeaturesSupportLayers) return false;
      
      const systemLayersVisible = this.supportLayers && 
        Object.values(this.supportLayers).some(layer => layer && layer.visible);
      
      const userLayersVisible = this.supportLayerUser && 
        Object.values(this.supportLayerUser).some(layer => layer && layer.visible);
      
      return systemLayersVisible || userLayersVisible;
    },

    layerCategories() {
      const categories = [];

      if (this.showFeaturesSupportLayers && this.supportLayers) {
        const visibleSystemLayers = Object.entries(this.supportLayers)
          .filter(([_, layer]) => layer && layer.visible)
          .reduce((acc, [key, layer]) => {
            acc[key] = layer;
            return acc;
          }, {});

        if (Object.keys(visibleSystemLayers).length > 0) {
          categories.push({
            name: 'Support Layers',
            layers: visibleSystemLayers,
            type: 'system'
          });
        }
      }

      if (this.showFeaturesSupportLayers && this.supportLayerUser) {
        const visibleUserLayers = Object.entries(this.supportLayerUser)
          .filter(([_, layer]) => layer && layer.visible)
          .reduce((acc, [key, layer]) => {
            acc[key] = layer;
            return acc;
          }, {});

        if (Object.keys(visibleUserLayers).length > 0) {
          categories.push({
            name: 'User Layers',
            layers: visibleUserLayers,
            type: 'user'
          });
        }
      }

      return categories;
    },

    shouldShowCartographicSection() {
      const result = this.hasCartographicDatasets && this.hasVisibleCartographicLayers;
      return result;
    },

    hasLegend() {
      return this.hasCartographicDatasets;
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
  },

  beforeDestroy() {
    this.removeCARFromMap();
  },

  methods: {
    async generateMultiPagePDF() {
      try {
        this.loadingPrintImage = true;

        // Use o componente PDFGenerator
        await this.$refs.pdfGenerator.generatePDF(this);

      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        this.$emit('error', 'Erro ao gerar o documento PDF');
      } finally {
        this.loadingPrintImage = false;
      }
    },

    getMunicipioName(carItem) {
      if (carItem.properties?.no_municipio_car) {
        return carItem.properties.no_municipio_car;
      }
      if (carItem.properties?.no_municipio) {
        return carItem.properties.no_municipio;
      }
      return '-';
    },

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
      window.print();
    },

    ...mapActions('monitoring', ['getDataTableMonitoring']),
    ...mapActions('land-use', ['getDataTableLandUse']),
    ...mapActions('urgent-alerts', ['getDataTableAlerts']),
  },
};
</script>

<style scoped>
/* ... (mantenha todos os estilos existentes do template) ... */
</style>
<style scoped>
.content-scroll-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Scroll personalizado */
.content-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.content-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.content-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.content-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* CONTAINER PRINCIPAL - SCROLL APENAS NO CONTEÚDO */
.dialog-content-wrapper {
  max-height: calc(95vh - 120px);
  display: flex;
  flex-direction: column;
}

/* SEÇÃO DO MAPA - FIXA SEM SCROLL */
.map-section-fixed {
  flex-shrink: 0;
  height: 780px;
  overflow: hidden;
}

/* SEÇÃO DE CONTEÚDO - COM SCROLL */
.content-section-scrollable {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(95vh - 780px - 120px);
  padding: 8px 0;
}

/* REMOVER SCROLL DO CONTAINER PRINCIPAL DO V-DIALOG */
:deep(.v-dialog__content) {
  overflow: visible !important;
}

:deep(.v-dialog) {
  overflow: visible !important;
}

/* REMOVER SCROLL DO V-CONTAINER */
:deep(.container) {
  overflow: visible !important;
}

/* Ajustes para garantir que não haja scroll duplo */
.table-print {
  display: flex;
  flex-direction: column;
}

.table-print tbody {
  display: flex;
  flex-direction: column;
}

/* SCROLL PERSONALIZADO PARA O CONTEÚDO */
.content-section-scrollable::-webkit-scrollbar {
  width: 8px;
}

.content-section-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.content-section-scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.content-section-scrollable::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Metadata */
.metadata {
  color: #666;
  font-size: 12px;
  font-style: italic;
}

.informacoes {
  line-height: normal;
  font-size: 13px;
  color: #666666;
}

section {
  width: 100%;
  height: 100%;
}
.section-map {
  width: 100%;
  height: 770px;
}

.section-info {
  width: 32%;
}

.infos-width {
  width: 100%;
}

.container-border {
  border: 1px solid black;
}

.dont-break {
  page-break-inside: avoid;
}

.space-footer {
    display: table-footer-group;
}
.modal-inventario-title h1 {
    color: #7F5539;
    font-size: 26px;
    font-weight: 400;
}
.modal-inventario-title i {
    color: #7F5539 !important;
}
.modal-inventario-header .logo {
    height: 40px;
}
/* Section */
.modal-inventario .section-title, .modal-inventario .section-title i {
    color: #7F5539;
}
.modal-inventario .section-title i {
    font-size: 22px;
}
.modal-inventario .section-title h3 {
    font-weight: 400;
    font-size: 18px;
}

.table-print {
  width: 100%;
}

.overlap h3 {
  color: #7F5539;
  font-weight: 500;
  font-size: 18px;
}

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

/* Legenda - lista de CAR SEM SCROLL */
.car-legend-section {
  margin-bottom: 8px;
}

/* REMOVER SCROLL DA LISTA CAR */
.car-list-container {
  /* REMOVER estas propriedades que causam scroll */
  /* max-height: 120px; */
  /* overflow-y: auto; */
}

.car-list-row {
  /* REMOVER estas propriedades que causam scroll */
  /* max-height: 120px; */
  /* overflow-y: auto; */
  margin: 0 -2px;
  flex-wrap: wrap;
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
  /* REMOVER SCROLL NA IMPRESSÃO */
  .dialog-content-wrapper {
    max-height: none !important;
    overflow: visible !important;
  }

  .content-section-scrollable {
    overflow: visible !important;
    max-height: none !important;
    padding: 0 !important;
  }

  .map-section-fixed {
    height: auto !important;
  }

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

  .informacoes {
    /* Show background color on print */
    -webkit-print-color-adjust: exact;
    /*chrome & webkit browsers*/
    color-adjust: exact;
    /*firefox & IE */
    padding-left: 11px;
    max-width: 1145px !important;
    /* width: 100%; */
  }
  .modal-inventario-header i,
  .modal-inventario-header h1 {
    color: white !important;
  }

  .modal-inventario-header .logo {
    background-color: whitesmoke;
  }
  .table-print, .modal-inventario-header {
    width: 151.5%;
  }

  :deep(.leaflet-control-attribution) {
    display: none !important;
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

:deep(.v-chip) { padding: 0 5px !important; }

@media (max-width: 600px) {
  :deep(.v-dialog) { background-color: #fff !important; }

  .dialog-content-wrapper {
    max-height: calc(100vh - 120px);
  }

  .content-section-scrollable {
    max-height: calc(100vh - 500px - 120px);
  }

  .map-section-fixed {
    height: 500px;
  }
}

/* CORREÇÃO SIMPLES - APENAS ISSO É NECESSÁRIO */
.content-scroll-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Garantir que todo o conteúdo abaixo do mapa seja rolável */
#map-for-print-container {
  display: block;
}

/* Remover qualquer altura fixa que impeça o scroll */
.table-print tbody {
  display: block;
}

/* Garantir que o v-container não limite o scroll */
:deep(.v-container) {
  overflow: visible !important;
}
</style>