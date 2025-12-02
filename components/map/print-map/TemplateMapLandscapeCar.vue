<template>
  <BaseModal
    :value="showDialog"
    width="90%"
    max-width="1200px"
    content-class="print-dialog"
    :emit-back-as-printer-back="true"
    :back-button-text="$t('input-button-back-second-step')"
    :print-button-text="$t('input-button-pdf-image')"
    @close="handleClose"
    @printer-back="handleBack"
  >
    <!-- Página 1: Logos, Título e Mapa -->
    <div class="page-section map-print">
      <!-- Logos e Título centralizados -->
      <v-row class="justify-center text-center ma-2">
        <v-col
          cols="6"
          class="d-flex justify-end align-end"
        >
          <v-img
            contain
            :src="logo_funai"
            max-width="120px"
            max-height="60px"
          />
        </v-col>
        <v-col
          cols="6"
          class="mt-2"
        >
          <v-img
            contain
            :src="logo_cmr"
            max-width="180px"
            max-height="60px"
          />
        </v-col>
        <v-col cols="12">
          <p class="font-title text-h6">
            {{ mapTitle }}
          </p>
        </v-col>
      </v-row>
      <!-- Mapa usando o componente MapForPrint -->
      <div>
        <v-col
          cols="12"
          class="pr-0 mt-2"
          style="max-height: 500px; position: relative"
        >
          <v-sheet class="mini-map-overlay">
            <MiniMap
              v-if="currentBounds"
              :current-bould-map="currentBounds"
              :map-center="mapCenter"
              :main-zoom="mainZoom"
            />
          </v-sheet>

          <MapForPrint
            ref="mapForPrint"
            :leaf-size="leafSize"
            :main-map="map"
            :bounds="mapBounds"
            :selected-base-map="selectedBaseMap"
            :car-data="carData"
            :car-colors="CAR_COLORS"
            :dialog-visible="showDialog"
            @updateBounds="updateBounds"
            @getCenter="getCenter"
            @getZoom="getZoom"
            @mapReady="onMapReady"
          />
        </v-col>
      </div>
    </div>

    <!-- Página 2: Lista de CARs -->
    <div class="page-section car-list-section">
      <div class="car-list">
        <div v-if="carData && carData.length > 0">
          <p class="d-flex align-center ma-4 pb-4">
            <strong class="mr-2">Cadastro Ambiental Rural (CAR)</strong>
            <v-chip x-small>
              {{ carData.length }}
            </v-chip>
          </p>

          <v-row>
            <v-col
              v-for="(item, index) in carData"
              :key="'car-' + index"
              cols="12"
              sm="6"
              md="4"
            >
              <div class="car-list-item pl-4 mt-n4">
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
              </div>
            </v-col>
          </v-row>
          <v-divider class="mt-4" />
        </div>
      </div>
       <div class="legend-header">
        <p class="d-flex align-center py-4">
          <strong class="mr-2">Legendas</strong>
        </p>
      </div>

      <!-- Container principal de legendas -->
      <div class="legends-container">
        <v-row
          class="legends-row flex-nowrap justify-start align-start"
          style="gap: 12px; overflow-x: auto; padding-bottom: 8px;"
        >
          <!-- Monitoramento Diário -->
          <v-col
            v-if="showFeaturesMonitoring && hasActiveMonitoringStages"
            cols="auto"
            style="min-width: 180px;"
          >
            <div class="d-flex align-center mb-2">
              <strong style="font-size: 12px;">Monitoramento Diário</strong>
              <v-chip
                x-small
                class="ml-1"
                color="red"
                text-color="white"
              >
                {{ monitoringTICount }}
              </v-chip>
            </div>
            <hr class="styled-divider-red" style="margin: 4px 0 8px 0;">
            <CustomizedLegend
              class="pt-1"
              :items="monitoringItems"
            />
          </v-col>

          <!-- Alerta Urgente -->
          <v-col
            v-if="showFeaturesAlerts && hasActiveAlertsStages"
            cols="auto"
            style="min-width: 180px;"
          >
            <div class="d-flex align-center mb-2">
              <strong style="font-size: 12px;">Alerta Urgente</strong>
              <v-chip
                x-small
                class="ml-1"
                color="orange"
                text-color="white"
              >
                {{ alertsCount }}
              </v-chip>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0;">
            <CustomizedLegend
              class="pt-1"
              :items="alertsItems"
            />
          </v-col>

          <!-- Camadas de Sobreposição -->
          <v-col
            v-if="showFeaturesSupportLayers && hasVisibleSupportLayers"
            cols="auto"
            style="min-width: 200px;"
          >
            <div>
              <strong style="font-size: 12px;">Sobreposição de camadas</strong>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0;">
            <LayerList
              v-if="visibleUserLayers.length > 0"
              :layers="supportLayerUser"
              :is-user-layer="true"
            />
            <LayerList
              v-if="visibleSystemLayers.length > 0"
              :layers="supportLayers"
              class="mt-1"
            />
          </v-col>

          <!-- Uso e Ocupação do Solo -->
          <v-col
            v-if="showFeaturesLandUse"
            cols="auto"
            style="min-width: 180px;"
          >
            <div class="d-flex align-center mb-2">
              <strong style="font-size: 12px;">Uso e Ocupação do Solo</strong>
              <v-chip
                x-small
                class="ml-1"
                color="green"
                text-color="white"
              >
                {{ tableLandUse.length }}
              </v-chip>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0;">
            <CustomizedLegend
              class="pt-1"
              :items="landUseItems"
            />
          </v-col>

          <!-- INPE - Prodes -->
          <v-col
            v-if="showFeaturesProdes"
            cols="auto"
            style="min-width: 160px;"
          >
            <div class="mb-2">
              <strong style="font-size: 12px;">INPE - Prodes</strong>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0;">
            <CustomizedLegend
              class="pt-1"
              :items="prodesItems"
            />
          </v-col>

          <!-- INPE - Deter -->
          <v-col
            v-if="showFeaturesDeter"
            cols="auto"
            style="min-width: 160px;"
          >
            <div class="mb-2">
              <strong style="font-size: 12px;">INPE - Deter</strong>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0;">
            <CustomizedLegend
              class="pt-1"
              :items="deterItems"
            />
          </v-col>

          <!-- INPE - Focos de Calor -->
          <v-col
            v-if="showFeaturesAquaMM || showFeaturesAquaMT"
            cols="auto"
            style="min-width: 180px;"
          >
            <div class="mb-2">
              <strong style="font-size: 12px;">INPE - Focos de Calor</strong>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0;">
            <CustomizedLegend
              class="pt-1"
              :items="filteredHeatFocusItems"
            />
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Página 3: Tabela de CARs - Permite quebra -->
    <div class="page-section car-table-section">
      <div
        style="background-color: #fff;"
        class="teste-print"
      >
        <v-divider class="mt-4" />

        <!-- Lista de CARs encontrados -->
        <div
          v-if="carData.length > 0"
          class="car-list pa-4 table-container"
        >
          <h3>Imóveis CAR Encontrados ({{ carData.length }})</h3>
          <v-simple-table>
            <template #default>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Município</th>
                  <th>Terra Indígena</th>
                  <th>Área (ha)</th>
                  <th>Código</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(car, index) in carData"
                  :key="index"
                >
                  <td>
                    <v-avatar
                      :color="getCarColor(index)"
                      size="24"
                    >
                      <span class="white--text">{{ index + 1 }}</span>
                    </v-avatar>
                  </td>
                  <td>{{ getMunicipioName(car) }}</td>
                  <td>{{ getTerraIndigenaName(car) }}</td>
                  <td>{{ formatNumber(car.properties?.nu_area_ha || car.properties?.area_ha) }}</td>
                  <td>{{ car.properties?.co_imovel || '-' }}</td>
                  <td>{{ car.properties?.tp_situacao || '-' }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
       <div class="additional-info">
        <v-col class="pa-3">
          <p>
            {{ $t('geodetic-system-info-part1') }}
            <strong>{{ $t('geodetic-system-info-strong') }}</strong>
            {{ $t('geodetic-system-info-part2') }}
          </p>
        </v-col>

        <v-divider />

        <p class="d-block px-3 py-2">
          <strong>Bases Cartográficas:</strong>
        </p>

        <v-col
          v-for="layerCategory in layerCategories"
          :key="`${layerCategory.name}-${layerCategory.type}`"
        >
          <v-col
            v-for="(layer, layerId) in layerCategory.layers"
            :key="layerId"
            class="py-1"
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

        <v-divider />

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

        <v-col class="ml-2 py-1">
          <p>
            {{ $t('text-address0') }}
          </p>
          <p>
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
      </div>
      </div>
    </div>



  </BaseModal>
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
import { mapState, mapMutations, mapActions } from 'vuex';
import BaseModal from '../../base/BaseModal.vue';
import MapForPrint from './MapForPrint.vue';
import MiniMap from './MiniMap.vue';
import LayerList from './LayerListActive.vue';
import CustomizedLegend from './CustomizedLegendActive.vue';

export default {
  name: 'MapLandscapeCar',

  components: {
    BaseModal,
    MapForPrint,
    MiniMap,
    LayerList,
    CustomizedLegend,
  },

  data: () => ({
    selectedItemsCount: 0,
    logo_funai: process.env.DEFAULT_LOGO_IMAGE_FUNAI,
    logo_cmr: process.env.DEFAULT_LOGO_IMAGE_CMR,
    currentBounds: null,
    printMap: null,
    mapCenter: null,
    carLayer: null,
    mainZoom: null,
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
    CAR_COLORS: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      '#F9E79F', '#A9DFBF', '#F5B7B1', '#AED6F1', '#E8DAEF',
      '#A3E4D7', '#FAD7A0', '#D2B4DE', '#A9CCE3', '#F9E79F',
      '#ABEBC6',
    ],
    isLoadingData: false,
  }),

  computed: {
    visibleUserLayers() {
      return Object.values(this.supportLayerUser || {}).filter(l => l?.visible) || [];
    },

    visibleSystemLayers() {
      return Object.values(this.supportLayers || {}).filter(l => l?.visible) || [];
    },

    // Total de TIs ÚNICAS (com ou sem monitoramento)
    monitoringTICount() {
      if (!this.showFeaturesMonitoring) {
        return 0;
      }

      if (!this.combinedTableData || !Array.isArray(this.combinedTableData)) {
        return 0;
      }

      const tisComMonitoramento = new Set();

      this.combinedTableData.forEach((item) => {
        if (item?.monitoring && Object.keys(item.monitoring).some((key) => item.monitoring[key] > 0)) {
          if (item.no_ti) {
            tisComMonitoramento.add(item.no_ti);
          }
        }
      });

      return tisComMonitoramento.size;
    },

    // Replica a lógica do PrintTemplateMapLandscape
    combinedTableData() {
      const keys = {
        monitoring: ['cr_ha', 'dg_ha', 'dr_ha', 'ff_ha'],
        landUse: [
          'ag_ha',
          'cr_ha',
          'dg_ha',
          'ma_ha',
          'mi_ha',
          'no_ha',
          'rv_ha',
          'sv_ha',
          'vn_ha',
          'vi_ha',
        ],
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

    // Propriedades computadas para foco/calor
    showFeaturesAquaMM() {
      return this.isLayerActive('aquaMM');
    },

    showFeaturesAquaMT() {
      return this.isLayerActive('aquaMT');
    },

    focoFilters() {
      return this.layers?.aquaMM?.filters || {};
    },

    filteredHeatFocusItems() {
      const { showFeaturesAquaMM, showFeaturesAquaMT } = this;

      if (!this.heatFocusItems || !Array.isArray(this.heatFocusItems)) {
        return [];
      }

      return this.heatFocusItems.filter(item => {
        if (!item || !item.label) return false;

        return (
          (item.label === 'Aqua Modis Manhã' && showFeaturesAquaMM) ||
          (item.label === 'Aqua Modis Tarde' && showFeaturesAquaMT)
        );
      });
    },

    // Propriedades computadas para legendas/getters
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

    // Contadores e verificações
    alertsCount() {
      return this.tableAlerts?.length || 0;
    },

    hasActiveMonitoringStages() {
      if (!this.legendVisibility) return false;
      return Object.values(this.legendVisibility).some((visible) => visible);
    },

    hasActiveAlertsStages() {
      if (!this.legendVisibilityalerts) return false;
      return Object.values(this.legendVisibilityalerts).some((visible) => visible);
    },

    hasVisibleSupportLayers() {
      if (!this.showFeaturesSupportLayers) return false;

      const systemLayersVisible = this.supportLayers &&
        Object.values(this.supportLayers).some(layer => layer && layer.visible);

      const userLayersVisible = this.supportLayerUser &&
        Object.values(this.supportLayerUser).some(layer => layer && layer.visible);

      return systemLayersVisible || userLayersVisible;
    },

    // Propriedades para anos únicos (land use)
    uniqueYears() {
      if (!Array.isArray(this.tableLandUse)) return [];
      const years = this.tableLandUse
        .map((item) => item?.nu_ano)
        .filter(year => year != null);
      return [...new Set(years)];
    },

    // Propriedades para impressão
    activePrintFeatures() {
      const conditions = [
        {
          condition: this.showFeaturesMonitoring,
          type: 'date-range',
          label: 'monitoring-print-label',
          startDate: this.monitoringFilters?.startDate,
          endDate: this.monitoringFilters?.endDate
        },
        {
          condition: this.showFeaturesAlerts,
          type: 'date-range',
          label: 'alerts-print-label',
          startDate: this.alertsFilters?.startDate,
          endDate: this.alertsFilters?.endDate
        },
        {
          condition: this.showFeaturesLandUse && this.uniqueYears.length > 0,
          type: 'years-list',
          label: 'land-use-print-label',
          years: this.uniqueYears
        },
        {
          condition: this.showFeaturesProdes,
          type: 'single-year',
          label: 'prodes-print-label',
          yearHandler: this.handleProdesYear
        },
        {
          condition: this.showFeaturesDeter,
          type: 'date-range',
          label: 'deter-print-label',
          startDate: this.deterFilters?.startDate,
          endDate: this.deterFilters?.endDate
        },
        {
          condition: this.showFeaturesAquaMM || this.showFeaturesAquaMT,
          type: 'date-range',
          label: 'heat-focus-print-label',
          startDate: this.focoFilters?.startDate,
          endDate: this.focoFilters?.endDate
        }
      ];

      return conditions
        .filter(item => item.condition)
        .map(({ condition, ...rest }) => rest);
    },

    // Propriedades para camadas de suporte
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

    // Propriedades para diálogo/impressão CAR
    showDialog() {
      return this.showTemplateMapLandscapeCar && this.carPrintData.visible;
    },

    mapTitle() {
      return this.carPrintData.mapTitle || 'Mapa de Imóveis CAR';
    },

    leafSize() {
      return this.carPrintData.leafSize || { type: 'A4' };
    },

    mapBounds() {
      return this.carPrintData.mapBounds;
    },

    selectedBaseMap() {
      if (this.carPrintData.selectedBaseMapUrl) {
        return {
          _url: this.carPrintData.selectedBaseMapUrl,
          url: this.carPrintData.selectedBaseMapUrl,
          options: {
            label: 'Custom Base Map',
            attribution: '© CMR Funai',
          },
        };
      }
      return null;
    },

    carData() {
      return this.carPrintData.carData || [];
    },

    map() {
      return window.mapMain || null;
    },

    // Mapeamento de estados usando mapState
    ...mapState('map', ['carPrintData', 'showTemplateMapLandscapeCar']),
    ...mapState({
      monitoringFilters: (state) => state.monitoring.filters,
      alertsFilters: (state) => state['urgent-alerts'].filters,
      prodesFilters: (state) => state.prodes.filters,
      deterFilters: (state) => state.deter.filters,
      showFeaturesMonitoring: (state) => state.monitoring.showFeaturesMonitoring,
      showFeaturesAlerts: (state) => state['urgent-alerts'].showFeaturesAlerts,
      tableMonitoring: (state) => state.monitoring.tableMonitoring,
      tableAlerts: (state) => state['urgent-alerts'].tableAlerts,
      legendVisibility: (state) => state.monitoring.legendVisibility,
      legendVisibilityalerts: (state) => state['urgent-alerts'].legendVisibility,
      showFeaturesProdes: (state) => state.prodes.showFeaturesProdes,
      showFeaturesDeter: (state) => state.deter.showFeaturesDeter,
      showFeaturesLandUse: (state) => state['land-use'].showFeaturesLandUse,
      tableLandUse: (state) => state['land-use'].tableLandUse,
      supportLayerUser: (state) => state.supportLayersUser.supportLayerUser,
      showFeaturesSupportLayers: (state) => state.supportLayers.showFeaturesSupportLayers,
      supportLayers: (state) => state.supportLayers.supportLayers,
      layers: (state) => state.foco.layers,
    }),
  },

  watch: {
    showDialog: {
      async handler(newVal) {
        if (newVal) {
          await this.$nextTick();

          if (this.showFeaturesMonitoring && (!this.tableMonitoring || this.tableMonitoring.length === 0)) {
            await this.getDataTableMonitoring();
          }

          if (this.showFeaturesLandUse && (!this.tableLandUse || this.tableLandUse.length === 0)) {
            await this.getDataTableLandUse();
          }

          if (this.showFeaturesAlerts && (!this.tableAlerts || this.tableAlerts.length === 0)) {
            await this.getDataTableAlerts();
          }

          await this.$nextTick();
        }
      },
      immediate: true
    },
  },

  async mounted() {
    try {
      if (this.showDialog) {
        await this.loadData();
      }

      this.updateSelectedItemsCount();
    } catch (error) {
      console.error('Error in mounted:', error);
    }
  },

  beforeDestroy() {
    this.printMap = null;
  },

  methods: {
    async loadData() {
      try {
        this.isLoadingData = true;

        const promises = [];

        if (this.showFeaturesMonitoring) {
          promises.push(this.getDataTableMonitoring());
        }

        if (this.showFeaturesLandUse) {
          promises.push(this.getDataTableLandUse());
        }

        if (this.showFeaturesAlerts) {
          promises.push(this.getDataTableAlerts());
        }

        if (promises.length > 0) {
          await Promise.all(promises);
        }

        await this.$nextTick();

      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
      } finally {
        this.isLoadingData = false;
      }
    },

    isLayerActive(layerName) {
      return this.layers?.[layerName]?.showFeatures || false;
    },

    updateBounds(bounds) {
      this.currentBounds = bounds;
    },

    handleBack() {
      this.$emit('back-to-printer');
      this.setShowTemplateMapLandscapeCar(false);
    },

    handleClose() {
      this.setShowTemplateMapLandscapeCar(false);
      this.clearCarPrintData();
      this.$emit('close-completely');
    },

    removeCARFromMap() {
      if (this.carLayer && this.printMap) {
        this.printMap.removeLayer(this.carLayer);
        this.carLayer = null;
      }
    },

    updateSelectedItemsCount() {
      this.selectedItemsCount = Math.max(
        this.tableMonitoring?.length || 0,
        this.tableAlerts?.length || 0,
        this.tableLandUse?.length || 0
      );
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
        return 'Data indisponível';
      }
      const [year, month, day] = data.split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    },

    displayCAROnMap(features) {
      try {
        if (!Array.isArray(features) || features.length === 0 || !this.printMap) {
          return;
        }

        this.removeCARFromMap();

        const carLayers = features.map((feature, index) => {
          const color = this.getCarColor(index);
          const numero = index + 1;

          const carStyle = {
            color,
            weight: 3,
            opacity: 0.9,
            fillColor: color,
            fillOpacity: 0.3,
          };

          const layer = window.L.geoJSON(feature, {
            style: carStyle,
          });

          const center = layer.getBounds().getCenter();

          const numberMarker = window.L.marker(center, {
            icon: window.L.divIcon({
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

          return window.L.layerGroup([layer, numberMarker]);
        });

        this.carLayer = window.L.layerGroup(carLayers);
        this.carLayer.addTo(this.printMap);

        const allLayers = carLayers.flatMap((layerGroup) => layerGroup.getLayers());
        const group = window.L.featureGroup(allLayers);
        this.printMap.fitBounds(group.getBounds().pad(0.1));
      } catch (error) {
        console.error('❌ Erro ao exibir CAR no mapa de impressão:', error);
      }
    },

    onMapReady(map) {
      this.printMap = map;
      map.invalidateSize(true);
      this.displayCAROnMap(this.carData);
    },

    getCenter(center) {
      this.mapCenter = center;
    },

    getZoom(zoom) {
      this.mainZoom = zoom;
    },

    // Métodos auxiliares
    getMunicipioName(carItem) {
      return carItem.properties.no_municipio_car
        || carItem.properties.no_municipio
        || carItem.properties.municipio || '-';
    },

    getTerraIndigenaName(carItem) {
      return carItem.properties.no_terra_indigena
        || carItem.properties.terra_indigena
        || carItem.properties.nome
        || 'Nome não disponível';
    },

    getCarColor(index) {
      return this.CAR_COLORS[index % this.CAR_COLORS.length];
    },

    formatNumber(value) {
      if (value == null || value === '') return '-';

      try {
        const num = typeof value === 'string'
          ? parseFloat(value.replace(/\./g, '').replace(',', '.'))
          : Number(value);

        if (isNaN(num)) return '-';

        if (Number.isInteger(num)) {
          return num.toLocaleString('pt-BR');
        }

        const formatted = num.toLocaleString('pt-BR', {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        });

        return formatted;
      } catch (error) {
        return '-';
      }
    },

    todayDate() {
      const date = new Date();
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    },

    print() {
      window.print();
    },

    ...mapMutations('map', ['setShowTemplateMapLandscapeCar', 'clearCarPrintData']),
    ...mapActions('monitoring', ['getDataTableMonitoring']),
    ...mapActions('land-use', ['getDataTableLandUse']),
    ...mapActions('urgent-alerts', ['getDataTableAlerts']),
  },
};
</script>

<style scoped>
.print-dialog {
  overflow-y: auto;
  max-height: 90vh;
}

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
  margin-top: 15px;
}

.styled-divider {
  border: 1px solid #e0e0e0;
  margin: 4px 0;
}

.styled-divider-red {
  border: 1px solid #f44336;
  margin: 4px 0;
}

.car-number-marker {
  background: transparent !important;
  border: none !important;
}

.car-list-item {
  margin-bottom: 8px;
}

.car-name {
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
}

.car-number-avatar {
  flex-shrink: 0;
}

/* Estilos para impressão */
@media print {
  /* Reset para impressão */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* GARANTIR QUE O PAPEL (BACKGROUND DA PÁGINA) SEJA BRANCO */
  @page {
    margin: 0.5cm;
    background: white !important;
    size: landscape;
  }

  html, body {
    background-color: white !important;
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
  }

  /* FUNDO BRANCO PARA TODO O DOCUMENTO */
  body::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white !important;
    z-index: -9999;
  }

  .no-print {
    display: none !important;
  }

  .v-dialog {
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    box-shadow: none !important;
    overflow: visible !important;
    background: transparent !important;
    page-break-inside: avoid !important;
  }

  /* Cada seção inicia em uma nova página - REMOVI min-height: 100vh */
  .page-section {
    page-break-before: always !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    position: relative !important;
    background: transparent !important;
    height: auto !important;
    min-height: 0 !important;
    padding-bottom: 2cm !important; /* Adiciona espaço no final para garantir fundo branco */
  }

  /* FUNDO BRANCO APENAS PARA O ESPAÇO RESTANTE DA PÁGINA */
  .page-section::after {
    content: "";
    position: absolute;
    top: 100%; /* Começa depois do conteúdo */
    left: 0;
    right: 0;
    bottom: -100vh; /* Estende para baixo */
    background: white !important;
    z-index: -1;
    pointer-events: none;
  }

  /* Primeira seção não precisa de quebra antes */
  .page-section:first-child {
    page-break-before: auto !important;
  }

  /* Seção da tabela - permite quebra */
  .car-table-section {
    page-break-inside: auto !important;
    break-inside: auto !important;
  }

  /* Container da tabela - permite quebra */
  .table-container {
    page-break-inside: auto !important;
    break-inside: auto !important;
    background: transparent !important;
  }

  /* Tabela e linhas - permitem quebra */
  table {
    page-break-inside: auto !important;
    break-inside: auto !important;
    background: transparent !important;
  }

  tr {
    page-break-inside: auto !important;
    page-break-after: auto !important;
    break-inside: auto !important;
    background: transparent !important;
  }

  /* Garantir que o cabeçalho da tabela se repita em cada página */
  thead {
    display: table-header-group !important;
    background-color: #f5f5f5 !important;
  }

  /* Ajustar tamanho da tabela para impressão */
  .v-data-table {
    font-size: 10pt !important;
    width: 100% !important;
    background: transparent !important;
  }

  .v-data-table >>> th {
    font-size: 10pt !important;
    font-weight: bold !important;
    background-color: #f5f5f5 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .v-data-table >>> td {
    font-size: 10pt !important;
    border-bottom: 1px solid #e0e0e0 !important;
    background: transparent !important;
  }

  /* Ajustar espaçamento para impressão */
  .pa-4 {
    padding: 16px !important;
  }

  /* Garantir que o avatar tenha cor na impressão */
  .v-avatar {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Manter cores dos conteúdos */
  .car-list-item,
  .legend-header,
  .legends-container,
  .legends-row,
  .v-col,
  .v-row,
  .additional-info,
  .car-list,
  .legend-section {
    background: transparent !important;
    background-color: transparent !important;
  }

  /* Ajustar cores específicas */
  .v-chip {
    background-color: inherit !important;
    color: inherit !important;
  }

  .styled-divider-red {
    border-color: #f44336 !important;
  }

  /* Se houver problema com cores de texto */
  * {
    color: inherit !important;
  }

  /* Garantir que mini-mapa tenha fundo branco (é um caso especial) */
  .mini-map-overlay {
    background: white !important;
  }

  /* Remover qualquer background-image que possa interferir */
  .page-section,
  .v-dialog,
  .print-dialog {
    background-image: none !important;
  }

  /* Ajustar o mapa para landscape */
  .map-print > div > .v-col {
    max-height: 600px !important;
  }

  /* Ajustar legendas para landscape */
  .legends-row {
    flex-wrap: nowrap !important;
    justify-content: flex-start !important;
    overflow-x: visible !important;
  }

  /* Garantir que as páginas que terminam cedo tenham fundo branco */
  .page-section:last-child {
    min-height: 0 !important;
  }

  /* Para a tabela que pode ter múltiplas páginas */
  .car-table-section::after {
    display: none; /* Não precisa do pseudo-elemento na seção da tabela */
  }
}

.v-data-table {
  font-size: 12px;
}

.v-data-table >>> th {
  font-size: 12px;
  font-weight: bold;
}

.v-data-table >>> td {
  font-size: 12px;
}
</style>
