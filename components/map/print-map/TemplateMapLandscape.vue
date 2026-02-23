<template>
  <div>
    <v-dialog
      v-model="showDialog"
      content-class="dialog-no-scroll"
      :fullscreen="isSmallScreen"
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
      
      <div class="content-scroll-container">
        <v-container style="background-color: white; max-width: 100%">
          <v-row
            id="map-for-print"
            no-gutters
            style="width: 1105px; height: 770px; overflow: hidden; margin: 0 auto;"
          >
            <v-col
              id="monitoring-data-details"
              cols="8"
              class="pr-0 mt-2"
            >
              <!-- Tabelas de Estatísticas -->
              <div
                v-if="selectedItemsCount <= 7"
                id="data-table"
                class="leaflet-bottom leaflet-right"
              >
                <template v-for="type in statsTypes">
                  <div
                    v-for="item in getStatsByType(type)"
                    :key="`${type}-${item.no_ti}`"
                    v-if="hasVisibleFeatures(type) && getStatsByType(type).length"
                    :class="`bordered-${getBorderColor(type)}`"
                  >
                    <p><strong>TI {{ item.no_ti }}</strong></p>
                    <p v-if="item.ti_nu_area_ha">
                      Área da TI: {{ formatNumber(item.ti_nu_area_ha) }} ha
                    </p>
                    <template v-for="stage in item.stages">
                      <p
                        v-if="stage.area_ha > 0 && isStageActive(type, stage)"
                        :key="stage.no_estagio"
                      >
                        {{ stage.no_estagio }} {{ formatNumber(stage.area_ha) }} ha
                      </p>
                    </template>
                  </div>
                </template>
              </div>

              <!-- Warning Message -->
              <v-card
                v-if="showWarningMessage && !showOnlyAlerts"
                class="warning-message"
                elevated
              >
                <v-card-text>
                  <p class="text-subtitle-1">{{ $t('warning-message') }}</p>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" text @click="showWarningMessage = false">
                    {{ $t('agree') }}
                  </v-btn>
                </v-card-actions>
              </v-card>

              <!-- Mapa Principal -->
              <MapForPrint
                :leaf-size="leafSize"
                :main-map="mainMap"
                :selected-base-map="selectedBaseMap"
                class="map-wrapper"
                @updateBounds="updateBounds"
                @getCenter="center => mapCenter = center"
                @getZoom="zoom => mainZoom = zoom"
                @ready="onMapReady"
              />
            </v-col>

            <v-col cols="4" class="pl-1 mt-2">
              <div class="border-container">
                <!-- Logos -->
                <div class="d-flex justify-space-between pl-8 pr-8 ga-1 align-center ma-4">
                  <div style="width: 20%">
                    <v-img contain :src="logo_funai" class="logo" />
                  </div>
                  <div style="width: 60%">
                    <v-img contain :src="logo_cmr" class="logo" />
                  </div>
                </div>

                <!-- Título -->
                <div class="font-title pb-2">
                  <p>{{ mapTitle }}</p>
                  <p>{{ print_title }}</p>
                </div>

                <!-- Mini Mapa -->
                <div
                  id="container-mini-map"
                  class="d-flex justify-center height-container-mini-map"
                >
                  <MiniMap
                    v-if="currentBouldMap"
                    :current-bould-map="currentBouldMap"
                    :map-center="mapCenter"
                    :main-zoom="mainZoom"
                    :leaf-size="leafSize"
                    @ready="onMiniMapReady"
                  />
                </div>

                <!-- Informações e Legendas -->
                <div id="details-print" class="legend-info-map">
                  <div class="legend-info-map legend-info-map-details">
                    <!-- Legendas Dinâmicas -->
                    <div>
                      <p v-if="hasLegend" class="d-block ma-1">
                        <strong>{{ $t('legend') }}</strong>
                      </p>
                      
                      <div class="ma-1 flex-wrap" style="width: 100%; max-height: 100%; overflow: hidden">
                        <div style="display: flex; justify-content: flex-start; align-items: flex-start; gap: 5px">
                          <!-- Seções de Legenda -->
                          <div v-for="section in legendSections" :key="section.key">
                            <p>
                              <strong>{{ section.title }}</strong>
                              <v-chip x-small v-if="section.count !== undefined">
                                {{ section.count }}
                              </v-chip>
                            </p>
                            <hr :style="{ border: `1px solid ${section.borderColor}`, margin: '3px 0' }">
                            <CustomizedLegend
                              class="pt-1"
                              :items="section.items"
                            />
                          </div>

                          <!-- Camadas de Suporte -->
                          <div v-if="hasVisibleSupportLayers">
                            <p style="min-width: 120px; max-width: 500px;">
                              <strong>Sobreposição de camadas</strong>
                            </p>
                            <hr style="border: 1px solid blue; margin: 3px 0">
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
                        </div>
                      </div>
                    </div>

                    <!-- Bases Cartográficas -->
                    <div v-if="hasCartographicDatasets">
                      <v-divider />
                      <p class="d-block ma-1">Bases Cartográficas:</p>
                      <div v-for="layerCategory in layerCategories" :key="layerCategory.name">
                        <div v-for="layer in layerCategory.layers" :key="layer.id">
                          <v-row v-if="layer.visible" no-gutters align="center" class="image-container">
                            <v-col>
                              <p class="ml-1">
                                <strong>{{ layer.name || '-' }}.</strong>
                                Fonte:{{ layer.fonte || '-' }}, 
                                Data de atualização: {{ handleData(layer.dt_atualizacao) }}.
                              </p>
                            </v-col>
                          </v-row>
                        </div>
                      </div>
                    </div>

                    <!-- Períodos dos Dados -->
                    <div v-for="period in dataPeriods" :key="period.key" v-if="period.visible">
                      <p class="ml-1">{{ period.text }}</p>
                    </div>

                    <!-- Informações de Rodapé -->
                    <div>
                      <v-divider />
                      <div class="ma-1">
                        <p>{{ print_info }} {{ $t('text-address0') }}</p>
                        <p>{{ print_info }} {{ $t('text-address') }} {{ todayDate() }}</p>
                      </div>
                      <v-divider />
                      <div class="ma-1">
                        <p>{{ $t('author-label') }}</p>
                        <p>{{ $t('text-info') }}</p>
                        <p>{{ $t('text-format') }} {{ leafSize.type }}.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Footer com Botões -->
      <div class="print-dialog-footer no-print fixed-footer">
        <div class="d-flex align-center pa-4">
          <v-btn class="ml-2" @click="$emit('back')">
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
            <v-icon dark>mdi-image-outline</v-icon>
            {{ $t('download-image') }}
          </v-btn>
          <v-btn
            color="primary"
            class="mr-4"
            :disabled="showWarningMessage || loadingPrintImage || loadingPrintPdf"
            :loading="loadingPrintPdf"
            @click="print"
          >
            <v-icon dark>mdi-file-export-outline</v-icon>
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
import { mapState, mapActions, mapGetters } from 'vuex';
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
    analyticsData: { type: Array, default: () => [] },
    showDialogLandscape: { type: Boolean, default: false },
    mapTitle: { type: String, default: '' },
    leafSize: { type: Object, default: null },
    mainMap: { type: Object, default: null },
    selectedBaseMap: { type: Object, default: null },
    model: { type: Object, default: null },
  },

  data: () => ({
    selectedItemsCount: 0,
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
    loadingPrintImage: false,
    loadingPrintPdf: false,
    isSmallScreen: window.innerWidth < 768,
    
    // Itens de legenda fixos
    deterItems: [{ label: 'Alerta', color: '#AAAAAA', border: '1px solid #000000' }],
    heatFocusItems: [
      { label: 'Aqua Modis Manhã', color: '#FFA500', icon: 'mdi-fire' },
      { label: 'Aqua Modis Tarde', color: '#FF0000', icon: 'mdi-fire' },
    ],
    
    // Helpers
    formatters: {
      area: (value) => {
        if (!value) return '-';
        const num = typeof value === 'string' 
          ? parseFloat(value.replace(/\./g, '').replace(',', '.'))
          : parseFloat(value);
        if (isNaN(num)) return '-';
        const rounded = num.toFixed(3);
        const [int, dec] = rounded.split('.');
        return dec !== '000' 
          ? `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`
          : String(parseInt(num, 10));
      },
      date: (data) => {
        if (!data || typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
          return 'Data indisponível';
        }
        const [year, month, day] = data.split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      },
      today: () => {
        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    }
  }),

  computed: {
    // Estados Vuex agrupados
    ...mapState({
      monitoringState: state => state.monitoring,
      alertsState: state => state['urgent-alerts'],
      landUseState: state => state['land-use'],
      prodesState: state => state.prodes,
      deterState: state => state.deter,
      focoState: state => state.foco,
      supportState: state => state.supportLayers,
      supportUserState: state => state.supportLayersUser,
    }),

    // Getters específicos
    ...mapGetters({
      checkMonitoringStage: 'monitoring/checkStageActive',
      checkAlertsStage: 'urgent-alerts/checkStageActive',
      checkLandUseStage: 'land-use/checkStageActive',
    }),

    // Computed derivadas dos estados
    monitoringFilters() {
      const { stats, filters } = this.monitoringState;
      if (!stats?.currentTab) return null;
      
      const dates = stats.currentTab === 'data' ? filters : stats.rangeCycles;
      return {
        startDate: dates.start_date || dates.startDate,
        endDate: dates.end_date || dates.endDate
      };
    },

    alertsFilters() {
      return this.alertsState?.filters || {};
    },

    deterFilters() {
      return this.deterState?.filters || {};
    },

    focoFilters() {
      return this.focoState?.layers?.aquaMM?.filters || {};
    },

    getMonitoringStats() {
      return this.monitoringState?.stats || { stages: [], tiByStages: [] };
    },

    getMonitoringShowFeatures() {
      return this.monitoringState?.showFeaturesMonitoring || false;
    },

    getUrgentAlertsStats() {
      return this.alertsState?.stats || { stages: [], tiByStages: [] };
    },

    getUrgentAlertsShowFeatures() {
      return this.alertsState?.showFeaturesUrgentAlert || false;
    },

    getLandUseStats() {
      return this.landUseState?.stats || { stages: [], tiByStages: [] };
    },

    showFeaturesLandUse() {
      return this.landUseState?.showFeaturesLandUse || false;
    },

    showFeaturesProdes() {
      return this.prodesState?.showFeaturesProdes || false;
    },

    showFeaturesDeter() {
      return this.deterState?.showFeaturesDeter || false;
    },

    showFeaturesSupportLayers() {
      return this.supportState?.showFeaturesSupportLayers || false;
    },

    showFeaturesAquaMM() {
      return this.focoState?.layers?.aquaMM?.showFeatures || false;
    },

    showFeaturesAquaMT() {
      return this.focoState?.layers?.aquaMT?.showFeatures || false;
    },

    supportLayers() {
      return this.supportState?.supportLayers || {};
    },

    supportLayerUser() {
      return this.supportUserState?.supportLayerUser || {};
    },

    tableMonitoring() {
      return this.monitoringState?.stats?.tableMonitoring || [];
    },

    tableLandUse() {
      return this.landUseState?.stats?.tableLandUse || [];
    },

    tableAlerts() {
      return this.alertsState?.tableAlerts || [];
    },

    prodesItems() {
      return this.$store.getters['prodes/getLegendItems'] || [];
    },

    // Tipos de estatísticas disponíveis
    statsTypes() {
      return ['monitoring', 'alerts', 'landUse'];
    },

    // Verifica se só alertas estão ativos
    showOnlyAlerts() {
      return this.getUrgentAlertsShowFeatures && 
             !this.getMonitoringShowFeatures && 
             !this.showFeaturesLandUse;
    },

    // Verifica se há camadas de suporte visíveis
    hasVisibleSupportLayers() {
      const supportCount = Object.values(this.supportLayers).filter(l => l.visible).length;
      const userCount = Object.values(this.supportLayerUser).filter(l => l.visible).length;
      return this.showFeaturesSupportLayers && 
             (supportCount + userCount) > 0 &&
             supportCount <= 7 && 
             userCount <= 7;
    },

    // Seções de legenda dinâmicas
    legendSections() {
      const sections = [];
      
      if (this.hasVisibleFeatures('monitoring')) {
        sections.push({
          key: 'monitoring',
          title: 'Monitoramento Diário',
          items: this.getMonitoringStats.stages.filter(s => s.visible),
          count: this.getMonitoringStats.tiByStages?.length || 0,
          borderColor: 'red'
        });
      }

      if (this.hasVisibleFeatures('alerts')) {
        sections.push({
          key: 'alerts',
          title: 'Alerta Urgente',
          items: this.getUrgentAlertsStats.stages.filter(s => s.visible),
          count: this.getUrgentAlertsStats.tiByStages?.length || 0,
          borderColor: 'blue'
        });
      }

      if (this.hasVisibleFeatures('landUse')) {
        sections.push({
          key: 'landUse',
          title: 'Uso e Ocupação do Solo',
          items: this.getLandUseStats.stages.filter(s => s.visible),
          count: this.getLandUseStats.tiByStages?.length || 0,
          borderColor: 'blue'
        });
      }

      if (this.showFeaturesProdes) {
        sections.push({
          key: 'prodes',
          title: 'INPE - Prodes',
          items: this.prodesItems,
          borderColor: 'blue'
        });
      }

      if (this.showFeaturesDeter) {
        sections.push({
          key: 'deter',
          title: 'INPE - Deter',
          items: this.deterItems,
          borderColor: 'blue'
        });
      }

      if (this.showFeaturesAquaMM || this.showFeaturesAquaMT) {
        sections.push({
          key: 'aqua',
          title: 'INPE - Focos de Calor',
          items: this.heatFocusItems.filter(item => 
            (item.label === 'Aqua Modis Manhã' && this.showFeaturesAquaMM) ||
            (item.label === 'Aqua Modis Tarde' && this.showFeaturesAquaMT)
          ),
          borderColor: 'blue'
        });
      }

      return sections;
    },

    // Períodos dos dados para exibição
    dataPeriods() {
      const periods = [];
      
      if (this.getMonitoringShowFeatures && this.monitoringFilters) {
        periods.push({
          key: 'monitoring',
          visible: true,
          text: `${this.$t('monitoring-print-label')} ${this.handleData(this.monitoringFilters.startDate)} ${this.$t('and')} ${this.handleData(this.monitoringFilters.endDate)}`
        });
      }

      if (this.getUrgentAlertsShowFeatures && this.alertsFilters) {
        periods.push({
          key: 'alerts',
          visible: true,
          text: `${this.$t('alerts-print-label')} ${this.handleData(this.alertsFilters.startDate)} ${this.$t('and')} ${this.handleData(this.alertsFilters.endDate)}`
        });
      }

      if (this.showFeaturesLandUse && this.uniqueYears.length) {
        periods.push({
          key: 'landUse',
          visible: true,
          text: `${this.$t('land-use-print-label')} ${this.uniqueYears.join(', ')}`
        });
      }

      if (this.showFeaturesProdes) {
        periods.push({
          key: 'prodes',
          visible: true,
          text: `${this.$t('prodes-print-label')} ${this.handleProdesYear()}`
        });
      }

      if (this.showFeaturesDeter && this.deterFilters) {
        periods.push({
          key: 'deter',
          visible: true,
          text: `${this.$t('deter-print-label')} ${this.handleData(this.deterFilters.startDate)} ${this.$t('and')} ${this.handleData(this.deterFilters.endDate)}`
        });
      }

      if ((this.showFeaturesAquaMM || this.showFeaturesAquaMT) && this.focoFilters) {
        periods.push({
          key: 'aqua',
          visible: true,
          text: `${this.$t('heat-focus-print-label')} ${this.handleData(this.focoFilters.startDate)} ${this.$t('and')} ${this.handleData(this.focoFilters.endDate)}`
        });
      }

      return periods;
    },

    showDialog() {
      return this.showDialogLandscape;
    },

    hasLegend() {
      return this.legendSections.length > 0;
    },

    hasCartographicDatasets() {
      return this.layerCategories.some(cat => cat.show);
    },

    layerCategories() {
      return [{
        name: 'Support Layers',
        layers: Object.values(this.supportLayers),
        show: this.showFeaturesSupportLayers
      }].filter(({ show }) => show);
    },

    uniqueYears() {
      return [...new Set(this.tableLandUse.map(item => item.nu_ano))];
    },

    // Parse de área
    parseArea() {
      return (value) => {
        if (!value) return 0;
        if (typeof value === 'number') return value;
        return parseFloat(String(value).replace(/\./g, '').replace(',', '.')) || 0;
      };
    },

    // Mapa de áreas do analytics
    analyticsAreaMap() {
      return (this.analyticsData || [])
        .filter(item => item.no_ti)
        .reduce((map, item) => {
          map[item.no_ti] = this.parseArea(item.ti_nu_area_ha);
          return map;
        }, {});
    }
  },

  watch: {
    leafSize: {
      handler() {
        this.invalidateMaps();
      },
      immediate: true
    },

    showDialog: {
      handler(newVal) {
        if (newVal) {
          setTimeout(() => this.invalidateMaps(), 100);
        }
      },
      immediate: true
    },

    combinedTableData: {
      handler(newVal) {
        this.selectedItemsCount = newVal.length;
        this.showWarningMessage = (this.getMonitoringShowFeatures || this.showFeaturesLandUse) 
          && newVal.length > 7;
      },
      immediate: true
    }
  },

  async mounted() {
    this.updateSelectedCount();
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    // ...mapActions
    ...mapActions('monitoring', ['getDataTableMonitoring']),
    ...mapActions('land-use', ['getDataTableLandUse']),
    ...mapActions('urgent-alerts', ['getDataTableAlerts']),

    // Handlers de resize
    handleResize() {
      this.isSmallScreen = window.innerWidth < 768;
    },

    invalidateMaps() {
      this.$nextTick(() => {
        [this.map, this.miniMap].forEach(m => m?.invalidateSize());
      });
    },

    // Verificações de visibilidade
    hasVisibleFeatures(type) {
      const checks = {
        monitoring: this.getMonitoringShowFeatures && this.getMonitoringStats.stages?.some(s => s.visible),
        alerts: this.getUrgentAlertsShowFeatures && this.getUrgentAlertsStats.stages?.some(s => s.visible),
        landUse: this.showFeaturesLandUse && this.getLandUseStats.stages?.some(s => s.visible),
        prodes: this.showFeaturesProdes,
        deter: this.showFeaturesDeter,
        aqua: this.showFeaturesAquaMM || this.showFeaturesAquaMT
      };
      return checks[type] || false;
    },

    isStageActive(type, stage) {
      const checkers = {
        monitoring: this.checkMonitoringStage,
        alerts: this.checkAlertsStage,
        landUse: this.checkLandUseStage
      };
      return checkers[type]?.(stage) ?? true;
    },

    getBorderColor(type) {
      return {
        monitoring: 'red',
        alerts: 'blue',
        landUse: 'blue'
      }[type] || 'black';
    },

    // Estatísticas por tipo
    getStatsByType(type) {
      const statsMap = {
        monitoring: this.getMonitoringStats,
        alerts: this.getUrgentAlertsStats,
        landUse: this.getLandUseStats
      };
      
      const stats = statsMap[type];
      if (!stats?.tiByStages?.length || stats.tiByStages.length > 7) return [];

      return stats.tiByStages.map(ti => ({
        no_ti: ti.no_ti,
        ti_nu_area_ha: this.analyticsAreaMap[ti.no_ti] || 
                       this.parseArea(ti.total_area) || 
                       this.parseArea(ti.nu_area_ha),
        stages: (ti.stages || [])
          .map(s => ({ ...s, area_ha: this.parseArea(s.area_ha) }))
          .filter(s => s.area_ha > 0)
      })).filter(ti => ti.stages.length > 0);
    },

    // Dados combinados para tabela
    combinedTableData() {
      const keys = {
        monitoring: ['cr_ha', 'dg_ha', 'dr_ha', 'ff_ha'],
        landUse: ['ag_ha', 'cr_ha', 'dg_ha', 'ma_ha', 'mi_ha', 'no_ha', 'rv_ha', 'sv_ha', 'vn_ha', 'vi_ha'],
        alerts: ['cr_ha', 'dg_ha', 'dr_ha']
      };

      const initializeObject = (keyList) => 
        keyList.reduce((obj, key) => ({ ...obj, [`nu_area_${key}`]: 0 }), {});

      const initializeData = (noTi) => ({
        no_ti: noTi,
        nu_area_ha: 0,
        monitoring: initializeObject(keys.monitoring),
        landUse: initializeObject(keys.landUse),
        alerts: initializeObject(keys.alerts),
      });

      const addValue = (target, key, value) => {
        target[key] = (target[key] || 0) + (parseFloat(value) || 0);
      };

      const combined = {};

      const processTable = (table, type) => {
        (table || []).forEach(item => {
          if (!item.no_ti) return;
          if (!combined[item.no_ti]) combined[item.no_ti] = initializeData(item.no_ti);
          
          const data = combined[item.no_ti];
          addValue(data, 'nu_area_ha', item.nu_area_ha);
          
          keys[type].forEach(key => 
            addValue(data[type], `nu_area_${key}`, item[`nu_area_${key}`])
          );
        });
      };

      processTable(this.tableMonitoring, 'monitoring');
      processTable(this.tableLandUse, 'landUse');
      processTable(this.tableAlerts, 'alerts');

      return Object.values(combined);
    },

    // Atualizar contagem de itens selecionados
    updateSelectedCount() {
      let count = 0;
      
      if (this.getMonitoringShowFeatures && this.getMonitoringStats.tiByStages) {
        count += this.getMonitoringStats.tiByStages.length;
      }
      
      if (this.showFeaturesLandUse && this.getLandUseStats.tiByStages) {
        count += this.getLandUseStats.tiByStages.length;
      }
      
      count += Object.values(this.supportLayers).filter(l => l.visible).length;
      count += Object.values(this.supportLayerUser).filter(l => l.visible).length;
      
      this.selectedItemsCount = count;
      this.showWarningMessage = count > 7;
    },

    // Formatação
    formatNumber(value) {
      return this.formatters.area(value);
    },

    handleData(data) {
      return this.formatters.date(data);
    },

    todayDate() {
      return this.formatters.today();
    },

    handleProdesYear() {
      const { prodesFilters } = this;
      if (!prodesFilters) return '-';
      if (prodesFilters.startYear === prodesFilters.endYear) {
        return prodesFilters.startYear;
      }
      return `${prodesFilters.startYear} ${this.$t('and')} ${prodesFilters.endYear}`;
    },

    // Mapas
    onMapReady(mapInstance) {
      this.map = mapInstance;
      this.invalidateMaps();
    },

    onMiniMapReady(miniMapInstance) {
      this.miniMap = miniMapInstance;
      this.invalidateMaps();
    },

    updateBounds(bounds) {
      this.currentBouldMap = bounds;
    },

    // Dimensões para impressão
    getMapDimensions(size) {
      const dimensions = {
        'A0': { width: 4409, height: 3140 },
        'A1': { width: 3138, height: 2220 },
        'A2': { width: 2214, height: 1570 },
        'A3': { width: 1557, height: 1105 },
        'A4': { width: 1105, height: 770 }
      };
      return dimensions[size] || dimensions['A4'];
    },

    getMiniMapDimensions(size) {
      const heights = { 'A0': 800, 'A1': 600, 'A2': 400, 'A3': 200, 'A4': 150 };
      return { height: heights[size] || 150 };
    },

    getFontSize(size) {
      const sizes = { 'A0': 34, 'A1': 20, 'A2': 16, 'A3': 12, 'A4': 10 };
      return sizes[size] || 10;
    },

    // Estado do mapa para impressão
    saveMapState() {
      if (this.miniMap) {
        this.mapCenter = this.miniMap.getCenter();
        this.mainZoom = this.miniMap.getZoom();
      }
    },

    applyPrintStyles() {
      const mapEl = document.getElementById('map-for-print');
      const dims = this.getMapDimensions(this.leafSize.type);
      mapEl.style.width = `${dims.width}px`;
      mapEl.style.height = `${dims.height}px`;

      const miniMapContainer = document.getElementById('container-mini-map');
      const miniMapDims = this.getMiniMapDimensions(this.leafSize.type);
      miniMapContainer.style.height = `${miniMapDims.height}px`;

      const miniMapEl = document.getElementById('miniPrintMap');
      if (miniMapEl) miniMapEl.style.height = `${miniMapDims.height}px`;

      const fontSize = this.getFontSize(this.leafSize.type);
      const printText = document.getElementsByClassName('print-mini-map-text')[0];
      if (printText) printText.style.fontSize = `${fontSize}px`;

      const details = document.getElementById('details-print');
      details.querySelectorAll('p').forEach(p => p.style.fontSize = `${fontSize}px`);

      // Ajuste específico para A1
      if (this.leafSize.type === 'A1') {
        const rightColumn = document.querySelector('.col-4 .border-container');
        if (rightColumn) rightColumn.style.marginTop = '-50px';
        
        const detailsPrint = document.getElementById('details-print');
        if (detailsPrint) {
          detailsPrint.style.maxHeight = '1850px';
          detailsPrint.style.overflow = 'hidden';
        }
      }
    },

    resetPrintStyles() {
      const mapEl = document.getElementById('map-for-print');
      mapEl.style.width = '1105px';
      mapEl.style.height = '770px';

      const miniMapContainer = document.getElementById('container-mini-map');
      miniMapContainer.style.height = '150px';

      const miniMapEl = document.getElementById('miniPrintMap');
      if (miniMapEl) miniMapEl.style.height = '150px';

      const printText = document.getElementsByClassName('print-mini-map-text')[0];
      if (printText) printText.style.fontSize = '10px';

      const details = document.getElementById('details-print');
      details.querySelectorAll('p').forEach(p => p.style.fontSize = '10px');

      if (this.map) this.map.invalidateSize();
      if (this.miniMap && this.mapCenter && this.mainZoom) {
        this.miniMap.setView(this.mapCenter, this.mainZoom, { animate: false });
        this.miniMap.invalidateSize();
      }

      this.loadingPrintPdf = false;
      window.removeEventListener('afterprint', this.resetPrintStyles);
    },

    async prepareMapsForPrint() {
      if (this.map) this.map.invalidateSize();
      await this.$nextTick();
      
      if (this.miniMap && this.mapCenter && this.mainZoom) {
        this.miniMap.setView(this.mapCenter, this.mainZoom, { animate: false });
        this.miniMap.invalidateSize();
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    },

    // Ações principais
    async print() {
      this.saveMapState();
      this.applyPrintStyles();
      await this.prepareMapsForPrint();

      this.loadingPrintPdf = true;
      window.addEventListener('afterprint', this.resetPrintStyles);
      
      setTimeout(() => window.print(), 2000);
    },

    async saveImage() {
      this.loadingPrintImage = true;
      const node = document.getElementById('map-for-print');
      
      this.saveMapState();
      const originalWidth = node.style.width;
      const originalHeight = node.style.height;
      
      this.applyPrintStyles();

      // Prepara elementos para captura
      const mapBounds = document.getElementsByClassName('leaflet-control-mapbounds')[0];
      const mapControlZoom = document.getElementsByClassName('leaflet-control-zoom')[0];
      const infoControlRight = document.getElementsByClassName('leaflet-control-attribution')[1];
      const legends = document.getElementsByClassName('text-legend-customized');
      const originalLegendStyles = [];

      if (infoControlRight) {
        const currentWidth = parseFloat(window.getComputedStyle(infoControlRight).width);
        infoControlRight.style.width = `${currentWidth + 30}px`;
      }

      if (mapControlZoom) mapControlZoom.style.display = 'none';
      if (mapBounds) mapBounds.style.width = '250px';

      Array.from(legends).forEach(legend => {
        originalLegendStyles.push(legend.style.width);
        legend.style.width = `${Math.min(150, this.getMapDimensions(this.leafSize.type).width * 0.12)}px`;
      });

      await this.prepareMapsForPrint();

      try {
        const dims = this.getMapDimensions(this.leafSize.type);
        const options = {
          quality: 1,
          bgcolor: 'white',
          width: dims.width,
          height: dims.height,
          style: { transform: 'scale(1)', transformOrigin: 'top left' },
          filter: (node) => {
            const excludeClasses = ['no-print', 'print-dialog-header', 'print-dialog-footer'];
            return !excludeClasses.some(cls => node.classList?.contains(cls));
          },
          scrollX: 0,
          scrollY: 0,
          imagePlaceholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          ...(this.leafSize.type === 'A0' || this.leafSize.type === 'A1' ? {
            cacheBust: true,
            imageTimeout: 30000
          } : {})
        };

        const image = await domtoimage.toJpeg(node, options);
        
        const link = document.createElement('a');
        link.href = image;
        link.download = this.mapTitle ? `${this.mapTitle}.jpeg` : 'Mapa.jpeg';
        link.click();

      } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        
        if (this.leafSize.type === 'A0' || this.leafSize.type === 'A1') {
          this.$emit('show-error', 'O tamanho selecionado é muito grande. Tente um tamanho menor.');
        } else {
          this.$emit('show-error', 'Ocorreu um erro ao gerar a imagem.');
        }
      } finally {
        // Restaura estilos originais
        node.style.width = originalWidth;
        node.style.height = originalHeight;
        
        if (infoControlRight) infoControlRight.style.width = 'auto';
        if (mapBounds) mapBounds.style.width = 'auto';
        if (mapControlZoom) mapControlZoom.style.display = 'block';
        
        Array.from(legends).forEach((legend, i) => {
          legend.style.width = originalLegendStyles[i];
        });

        this.loadingPrintImage = false;
        this.invalidateMaps();
      }
    }
  }
};
</script>

<style scoped>
.content-scroll-container {
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  overflow-x: hidden;
  background-color: white;
}

.print-dialog-header {
  position: sticky;
  top: 0;
  flex-shrink: 0;
  background: var(--v-primary-base);
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 16px;
  display: flex;
  justify-content: flex-end;
  z-index: 10;
}

.print-dialog-footer {
  position: sticky;
  bottom: 0;
  flex-shrink: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  z-index: 10;
}

:deep(.dialog-no-scroll) {
  overflow: hidden !important;
  max-height: 95vh !important;
  max-width: 1200px !important;
}

:deep(.dialog-no-scroll .v-card) {
  overflow: hidden !important;
  max-height: 95vh !important;
}

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

.bordered-red,
.bordered-blue {
  padding: 10px;
  border-radius: 5px;
  background: #fffbfb;
  opacity: 0.9;
}

.bordered-red {
  border: 2px solid red;
}

.bordered-blue {
  border: 2px solid blue;
}

.map-wrapper {
  width: 100%;
  height: 100%;
}

.vue-leaflet-map {
  height: 100% !important;
  width: 100% !important;
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

  .content-scroll-container {
    max-height: none !important;
    overflow: visible !important;
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
  font-size: 10px;
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

.print-mini-map-text {
  color: dimgray !important;
  font-size: 10px;
  white-space: nowrap;
}

.border_container_legend {
  border: 0.5px gray;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 0 5px #bbb !important;
  height: 100%;
}

.border-container {
  height: 100%;
}

.height-container-mini-map {
  height: 150px;
  width: 100%;
}

.font-page p {
  font-size: large;
}

.image-container {
  width: 100%;
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

:deep(.v-chip) {
  padding: 0 5px !important;
  font-size: 8px !important;
  height: 16px !important;
}

@media (max-width: 600px) {
  :deep(.v-dialog) {
    background-color: #fff !important;
  }
}
</style>