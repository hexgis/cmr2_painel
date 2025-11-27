<template>
  <v-container>
    <v-dialog
      v-model="showDialog"
      width="1230px"
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
              <v-col cols="6" class="d-flex justify-end align-end">
                <v-img
                  contain
                  :src="logo_funai"
                  max-width="120px"
                  max-height="60px"
                />
              </v-col>
              <v-col cols="6" class="mt-2">
                <v-img
                  contain
                  :src="logo_cmr"
                  max-width="180px"
                  max-height="60px"
                />
              </v-col>
              <v-col cols="12">
                <p class="font-title text-h6">{{ mapTitle }}</p>
              </v-col>
          </v-row>

          <!-- Mapa principal e legenda -->
          <v-row
            id="map-for-print-container"
            no-gutters
            style="overflow: hidden"
          >

          <!-- MiniMap em cima do mapa principal -->
            <v-col
              cols="12"
              class="pr-0 mt-2"
              style="max-height: 500px; position: relative"
            >
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


            <!-- Legendas das camadas -->
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

            <v-divider />

            <!-- Seção de informações adicionais -->
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
          :disabled="showWarningMessage || loadingPrintImage"
          @click="print"
        >
          <v-icon dark>
            mdi-file-export-outline
          </v-icon>
          {{ $t('input-button-pdf-image') }}
        </v-btn>
      </v-footer>
    </v-dialog>
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
    currentBouldMap: null,
    mapCenter: null,
    mainZoom: null,
    logo_funai: process.env.DEFAULT_LOGO_IMAGE_FUNAI,
    logo_cmr: process.env.DEFAULT_LOGO_IMAGE_CMR,
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
    CAR_COLORS: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      '#F9E79F', '#A9DFBF', '#F5B7B1', '#AED6F1', '#E8DAEF',
      '#A3E4D7', '#FAD7A0', '#D2B4DE', '#A9CCE3', '#F9E79F',
      '#ABEBC6',
    ],
  }),

  computed: {
    filteredHeatFocusItems() {
      const { showFeaturesAquaMM, showFeaturesAquaMT } = this;
      return this.heatFocusItems.filter(item =>
        (item.label === 'Aqua Modis Manhã' && showFeaturesAquaMM) ||
        (item.label === 'Aqua Modis Tarde' && showFeaturesAquaMT)
      );
    },

    activePrintFeatures() {
      const features = [];
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

    hasActiveMonitoringStages() {
      return Object.values(this.legendVisibility).some((visible) => visible);
    },

    hasActiveAlertsStages() {
      return Object.values(this.legendVisibilityalerts).some((visible) => visible);
    },

    monitoringCount() {
      return this.tableMonitoring?.length || 0;
    },

    alertsCount() {
      return this.tableAlerts?.length || 0;
    },

    uniqueYears() {
      if (!Array.isArray(this.tableLandUse)) return [];
      const years = this.tableLandUse.map((item) => item.nu_ano);
      return [...new Set(years)];
    },

    showDialog() {
      return this.showDialogLandscape;
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

    // Computed properties simplificadas usando métodos
    showFeaturesAquaMM() {
      return this.isLayerActive('aquaMM');
    },

    showFeaturesAquaMT() {
      return this.isLayerActive('aquaMT');
    },

    featuresAquaMM() {
      return this.getLayerFeatures('aquaMM');
    },

    featuresAquaMT() {
      return this.getLayerFeatures('aquaMT');
    },

    focoFilters() {
      return this.layers?.aquaMM?.filters || {};
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
    carData: {
      handler(newData, oldData) {
        // Evitar processamento desnecessário se dados não mudaram
        if (JSON.stringify(newData) === JSON.stringify(oldData)) return;

        if (newData?.length > 0) {
          if (this.printMap) {
            console.log('🗺️ Recebidos dados CAR para exibir:', newData.length);
            this.$nextTick(() => {
              this.displayCAROnMap(newData);
            });
          } else {
            console.log('⏳ Dados CAR recebidos, aguardando mapa...');
          }
        } else {
          this.removeCARFromMap();
        }
      },
      immediate: true,
      deep: true,
    },
  },

  async mounted() {
    const promises = [];

    if (this.showFeaturesMonitoring && this.getDataTableMonitoring) {
      promises.push(this.getDataTableMonitoring());
    }
    if (this.showFeaturesLandUse && this.getDataTableLandUse) {
      promises.push(this.getDataTableLandUse());
    }
    if (this.showFeaturesAlerts && this.getDataTableAlerts) {
      promises.push(this.getDataTableAlerts());
    }

    await Promise.all(promises);
    this.updateSelectedItemsCount();
  },

  beforeDestroy() {
    this.removeCARFromMap();
    this.printMap = null;
    this.carLayer = null;
  },

  methods: {
    // Métodos auxiliares para layers
    isLayerActive(layerName) {
      return this.layers?.[layerName]?.showFeatures || false;
    },

    getLayerFeatures(layerName) {
      return this.layers?.[layerName]?.features || null;
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
      return this.CAR_COLORS[index % this.CAR_COLORS.length];
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
      if (value == null || value === '') return '-';

      try {
        const num = typeof value === 'string'
          ? parseFloat(value.replace(/\./g, '').replace(',', '.'))
          : Number(value);

        if (isNaN(num)) return '-';

        // Verificar se é inteiro
        if (Number.isInteger(num)) {
          return num.toLocaleString('pt-BR');
        }

        // Para decimais
        const formatted = num.toLocaleString('pt-BR', {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3
        });

        return formatted;
      } catch {
        return '-';
      }
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
        // Validar features
        if (!Array.isArray(features) || features.length === 0) {
          console.warn('⚠️ Nenhum dado CAR válido para exibir');
          return;
        }

        console.log('🗺️ Adicionando CAR ao mapa de impressão...');
        console.log('📋 Dados CAR recebidos:', features);

        if (!this.printMap) {
          console.error('❌ Mapa de impressão ainda não está pronto');
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
      const mapContainer = document.getElementById('map-for-print-container');
      if (mapContainer) {
        mapContainer.style.width = `${mapDimensions.width}px`;
        mapContainer.style.height = `${mapDimensions.height}px`;
      }
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
      // Salvar o estado atual
      const originalBodyStyle = document.body.style.cssText;
      const originalContainerStyle = document.getElementById('map-for-print-container').style.cssText;
      
      // Aplicar ajustes para impressão
      this.adjustMapSizeForPrint(this.leafSize.type);
      
      // Adicionar evento para restaurar estado após impressão
      const afterPrint = () => {
        this.restoreStyles(originalBodyStyle, originalContainerStyle);
        window.removeEventListener('afterprint', afterPrint);
      };
      
      window.addEventListener('afterprint', afterPrint);
      
      // Forçar reflow e impressão
      this.$nextTick(() => {
        setTimeout(() => {
          window.print();
        }, 1000); // Aumentei o tempo para garantir que tudo esteja renderizado
      });
    },

    restoreStyles(bodyStyle, containerStyle) {
      document.body.style.cssText = bodyStyle;
      const mapContainer = document.getElementById('map-for-print-container');
      if (mapContainer) {
        mapContainer.style.cssText = containerStyle;
      }
      this.$forceUpdate();
    },

    restoreStyles(bodyStyle, containerStyle) {
      // Restaurar estilos originais
      document.body.style.cssText = bodyStyle;
      const mapContainer = document.getElementById('map-for-print-container');
      if (mapContainer) {
        mapContainer.style.cssText = containerStyle;
      }
      
      // Forçar redraw dos componentes Vue
      this.$forceUpdate();
    },

    ...mapActions('monitoring', ['getDataTableMonitoring']),
    ...mapActions('land-use', ['getDataTableLandUse']),
    ...mapActions('urgent-alerts', ['getDataTableAlerts']),
  },
};
</script>

<style scoped>
/* ===== VARIÁVEIS E CONFIGURAÇÕES GLOBAIS ===== */
:deep(.v-dialog) {
  overflow: visible !important;
}

:deep(.v-chip) {
  padding: 0 5px !important;
}

/* ===== LAYOUT E CONTAINERS ===== */
.row {
  margin: 0 !important;
}

.content-scroll-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
}

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

/* ===== COMPONENTES DE DIALOG ===== */
.print-dialog-header {
  background: var(--v-primary-base);
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 16px;
  display: flex;
  justify-content: flex-end;
}

/* ===== COMPONENTES DE MAPA ===== */
#map-for-print-container {
  display: block;
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
}

/* ===== COMPONENTES DE LISTA ===== */
.car-list-item {
  padding: 1px 2px;
  margin-bottom: 1px;
}

.car-name {
  font-size: 8px;
  line-height: 1.1;
  word-break: break-word;
}

/* ===== ELEMENTOS DE FORMATAÇÃO ===== */
p {
  font-size: xx-small;
  margin: 0;
}

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

/* ===== IMPRESSÃO - MANTÉM LAYOUT EXATO DA TELA ===== */
@media print {

  @page {
    margin: 10px; /* top, right, bottom, left */
    size: landscape;
  }
 
  /* Remove elementos não essenciais */
  .no-print {
    display: none !important;
  }



  /* Container principal - ajustes de layout */
  .content-scroll-container {
    max-height: 100%!important;
    height: 100% !important;
    }
  
}

/* ===== MELHORIAS ADICIONAIS PARA IMPRESSÃO ===== */
@media print {
  /* Garante contraste adequado */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
 
}
</style>