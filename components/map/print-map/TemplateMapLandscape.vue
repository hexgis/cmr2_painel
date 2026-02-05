<template>
  <div>
    <v-dialog
      v-model="showDialog"
      :max-width="dialogWidth"
      :max-height="dialogHeight"
      content-class="dialog-no-scroll"
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
            style="width: 1230px; height: 780px; overflow: hidden"
          >
            <v-col
              id="monitoring-data-details"
              cols="8"
              class="pr-0 mt-2"
            >
              <div
                v-if="selectedItemsCount <= 7"
                id="data-table"
                class="leaflet-bottom leaflet-right"
              >
                <template v-if="getMonitoringShowFeatures && monitoringStatsByStages.length">
                  <!-- Bloco para Monitoramento -->
                  <div
                    v-for="(item, index) in monitoringStatsTiByStages"
                    :key="'monitoring-' + index"
                    class="text-center bordered-red"
                  >
                    <p>
                      <strong>TI {{ item.no_ti }}</strong>
                    </p>
                    <p v-if="parseFloat(item.nu_area_ha) > 0">
                      Área da TI: {{ formatNumber(item.nu_area_ha) }} ha
                    </p>

                    <template v-for="(stage, key) in item.stages">
                      <p
                        v-if="parseFloat(stage.area_ha) > 0
                          && getMonitoringCheckStageActives(stage)"
                        :key="key"
                      >
                        {{ stage.no_estagio }} {{ formatNumber(stage.area_ha) }} ha
                      </p>
                    </template>
                  </div>
                </template>
                <template v-if="showFeaturesLandUse && landUseStatsByStages.length">
                  <!-- Bloco para Uso e Ocupação do Solo -->
                  <div
                    v-for="(item, index) in landUseStatsTiByStages"
                    :key="'landuse-' + index"
                    class="text-center bordered-blue"
                  >
                    <p>
                      <strong>TI {{ item.no_ti }}</strong>
                    </p>
                    <p v-if="parseFloat(item.nu_area_ha) > 0">
                      Área da TI: {{ formatNumber(item.nu_area_ha) }} ha
                    </p>
                    <template v-for="(stage, key) in item.stages">
                      <p
                        v-if="parseFloat(stage.area_ha) > 0 && getLandUseCheckStageActives(stage)"
                        :key="key"
                      >
                        {{ stage.no_estagio }} {{ formatNumber(stage.area_ha) }} ha
                      </p>
                    </template>
                  </div>
                </template>
              </div>
              <v-card
                v-if="showWarningMessage &&
                  !(getUrgentAlertsShowFeatures &&
                    !getMonitoringShowFeatures && !showFeaturesLandUse)"
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
                :leaf-size="leafSize"
                :main-map="mainMap"
                :selected-base-map="selectedBaseMap"
                class="map-wrapper"
                @updateBounds="updateBounds"
                @getCenter="getCenter"
                @getZoom="getZoom"
                @ready="onMapReady"
              />
            </v-col>
            <v-col
              cols="4"
              class="pl-1 mt-2"
            >
              <div class="border-container">
                <div
                  class="
                      d-flex
                      justify-space-between
                      pl-8
                      pr-8
                      ga-1
                      align-center
                      ma-4
                  "
                >
                  <div style="width: 20%">
                    <v-img
                      contain
                      :src="logo_funai"
                      class="logo"
                    />
                  </div>
                  <div style="width: 60%">
                    <v-img
                      contain
                      :src="logo_cmr"
                      class="logo"
                    />
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
                <div
                  id="details-print"
                  class="legend-info-map"
                >
                  <div class="legend-info-map legend-info-map-details">
                    <div>
                      <p
                        v-if="hasLegend"
                        class="d-block ma-1"
                      >
                        <strong>{{ $t('legend') }}</strong>
                      </p>
                      <div
                        class="ma-1 flex-wrap"
                        style="width: 100%; max-height: 100%; overflow: hidden"
                      >
                        <div
                          style="
                              display: flex;
                              justify-content: flex-start;
                              align-items: flex-start;
                              gap: 5px;
                          "
                        />

                        <div
                          style="
                              display: flex;
                              justify-content: flex-start;
                              align-items: flex-start;
                              gap: 5px;
                          "
                        >
                          <div v-if="getMonitoringShowFeatures && monitoringStatsByStages.length">
                            <p>
                              <strong> Monitoramento Diário </strong>
                              <v-chip x-small>
                                {{ monitoringCount }}
                              </v-chip>
                            </p>
                            <hr
                              style="
                                  border: 1px solid red;
                                  margin: 0;
                                  margin-top: 0px;
                              "
                            >
                            <CustomizedLegend
                              class="pt-1"
                              :items="monitoringStatsByStages"
                            />
                          </div>
                          <div
                            v-if="getUrgentAlertsShowFeatures
                              && urgentAlertsStatsByStages.length"
                          >
                            <p>
                              <strong>Alerta Urgente</strong>
                              <v-chip x-small>
                                {{ urgentAlertsCount }}
                              </v-chip>
                            </p>
                            <hr
                              style="
                                  border: 1px solid blue;
                                  margin: 0;
                                  margin-top: 3px;
                              "
                            >
                            <CustomizedLegend
                              class="pt-1"
                              :items="urgentAlertsStatsByStages"
                            />
                          </div>
                          <div
                            v-if="showFeaturesSupportLayers
                              && (Object.values(supportLayers).filter(l => l.visible).length)
                              && (Object.values(supportLayers).filter(l => l.visible).length <= 7)
                              && (Object.values(supportLayerUser).filter(
                                l => l.visible).length <= 7)"
                          >
                            <p style="min-width: 120px; max-width: 500px;">
                              <strong>Sobreposição de camadas</strong>
                            </p>
                            <hr
                              style="
                                  border: 1px solid blue;
                                  margin: 0;
                                  margin-top: 3px;
                              "
                            >
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

                          <div v-if="showFeaturesLandUse && landUseStatsByStages.length">
                            <p>
                              <strong>Uso e Ocupação do Solo</strong>
                              <v-chip x-small>
                                {{ landUseCount }}
                              </v-chip>
                            </p>
                            <hr
                              style="
                                  border: 1px solid blue;
                                  margin: 0;
                                  margin-top: 0px;
                              "
                            >
                            <CustomizedLegend
                              class="pt-1"
                              :items="landUseStatsByStages"
                            />
                          </div>

                          <div v-if="showFeaturesProdes">
                            <p>
                              <strong>INPE - Prodes</strong>
                            </p>
                            <hr
                              style="
                                  border: 1px solid blue;
                                  margin: 0;
                                  margin-top: 3px;
                              "
                            >
                            <CustomizedLegend
                              class="pt-1"
                              :items="prodesItems"
                            />
                          </div>
                          <div v-if="showFeaturesDeter">
                            <p>
                              <strong>INPE - Deter</strong>
                            </p>
                            <hr
                              style="
                                  border: 1px solid blue;
                                  margin: 0;
                                  margin-top: 3px;
                              "
                            >
                            <CustomizedLegend
                              class="pt-1"
                              :items="deterItems"
                            />
                          </div>
                          <div
                            v-if="showFeaturesAquaMM || showFeaturesAquaMT"
                          >
                            <p>
                              <strong>INPE - Focos de Calor</strong>
                            </p>
                            <hr
                              style="
                                  border: 1px solid blue;
                                  margin: 0;
                                  margin-top: 3px;
                              "
                            >
                            <CustomizedLegend
                              class="pt-1"
                              :items="
                                heatFocusItems.filter(
                                  (item) =>
                                    (item.label ===
                                      'Aqua Modis Manhã' &&
                                      showFeaturesAquaMM) ||
                                    (item.label ===
                                      'Aqua Modis Tarde' &&
                                      showFeaturesAquaMT)
                                )
                              "
                            />
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
                    <div v-if="getMonitoringShowFeatures">
                      <p class="ml-1">
                        {{ $t('monitoring-print-label') }}
                        {{ handleData(monitoringFilters.startDate) }}
                        {{ $t('and') }}
                        {{ handleData(monitoringFilters.endDate) }}
                      </p>
                    </div>
                    <div v-if="getUrgentAlertsShowFeatures">
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
                          {{ year }}<span v-if="index < uniqueYears.length - 1">,
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
        </v-container>
      </div>
      <div class="print-dialog-footer no-print fixed-footer">
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
            :disabled="showWarningMessage || loadingPrintImage || loadingPrintPdf"
            :loading="loadingPrintPdf"
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
    selectedItemsCount: 0,
    totalMonitoring: 0,
    totalLandUse: 0,
    headers: [
      { text: 'TI', value: 'no_ti' },
      { text: 'Área CR (ha)', value: 'nu_area_cr_ha' },
      { text: 'Área DG (ha)', value: 'nu_area_dg_ha' },
      { text: 'Área DR (ha)', value: 'nu_area_dr_ha' },
      { text: 'Área FF (ha)', value: 'nu_area_ff_ha' },
    ],
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
    loadingPrintPdf: false,

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
      return Object.values(
        this.legendVisibility.map((l) => ({ ...l, label: l.name })),
      ).some((visible) => visible);
    },
    hasActiveAlertsStages() {
      return Object.values(this.legendVisibilityalerts).some((visible) => visible);
    },
    filteredAlertsData() {
      return this.combinedTableData.filter(
        (item) => item.alerts && Object.keys(item.alerts).some((key) => item.alerts[key] > 0),
      );
    },
    filteredCombinedTableData() {
      return this.combinedTableData.filter((item) => {
        const hasMonitoring = this.getMonitoringShowFeatures
                    && item.monitoring
                    && Object.keys(item.monitoring).some((key) => item.monitoring[key] > 0);
        const hasLandUse = this.showFeaturesLandUse
                    && item.landUse
                    && Object.keys(item.landUse).some((key) => item.landUse[key] > 0);
        const hasAlerts = this.getUrgentAlertsShowFeatures
                    && item.alerts
                    && Object.keys(item.alerts).some((key) => item.alerts[key] > 0);
        return hasMonitoring || hasLandUse || hasAlerts;
      });
    },
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
        table.forEach((item) => {
          if (!item.no_ti) return;
          if (!combined[item.no_ti]) combined[item.no_ti] = initializeData(item.no_ti);
          const data = combined[item.no_ti];
          addValue(data, 'nu_area_ha', item.nu_area_ha);
          keys[type].forEach((key) => addValue(data[type], `nu_area_${key}`, item[`nu_area_${key}`]));
        });
      };
      if (
        !Array.isArray(this.tableMonitoring)
                || !Array.isArray(this.tableLandUse)
                || !Array.isArray(this.tableAlerts)
      ) {
        console.warn('tableMonitoring, tableLandUse ou tableAlerts não são arrays válidos.');
        return [];
      }
      processTable(this.tableMonitoring, 'monitoring');
      processTable(this.tableLandUse, 'landUse');
      processTable(this.tableAlerts, 'alerts');
      return Object.values(combined);
    },
    totalAreas() {
      const monitoringKeys = ['cr_ha', 'dg_ha', 'dr_ha', 'ff_ha'];
      const landUseKeys = [
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
      ];
      const alertsKeys = ['cr_ha', 'dg_ha', 'dr_ha'];
      const initializeObject = (keys) => keys.reduce((obj, key) => ({ ...obj, [`nu_area_${key}`]: 0 }), {});
      const addValue = (target, key, value) => {
        target[key] += parseFloat(value) || 0;
      };
      if (!Array.isArray(this.combinedTableData)) {
        console.warn('combinedTableData não é um array válido.');
        return initializeObject(['ha', ...monitoringKeys, ...landUseKeys, ...alertsKeys]);
      }
      return this.combinedTableData.reduce(
        (acc, item) => {
          addValue(acc, 'nu_area_ha', item.nu_area_ha);
          monitoringKeys.forEach((key) => addValue(
            acc.monitoring,
            `nu_area_${key}`,
            item.monitoring[`nu_area_${key}`],
          ));
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
    monitoringCount() {
      if (this.getMonitoringStats.tiByStages) return this.getMonitoringStats.tiByStages.length;
      return 0;
    },
    urgentAlertsCount() {
      if (this.getUrgentAlertsStats.tiByStages) return this.getUrgentAlertsStats.tiByStages.length;
      return 0;
    },
    landUseCount() {
      if (this.getLandUseStats.tiByStages) return this.getLandUseStats.tiByStages.length;
      return 0;
    },
    alertsCount() {
      return this.filteredAlertsData.length;
    },

    monitoringStatsTiByStages() {
      if (!this.getMonitoringStats || !this.getMonitoringStats.tiByStages) return [];
      if (this.getMonitoringStats.tiByStages.length > 7) return [];
      return this.getMonitoringStats.tiByStages;
    },

    monitoringStatsByStages() {
      return this.getMonitoringStats.stages.filter((s) => s.visible);
    },

    urgentAlertsStatsTiByStages() {
      if (!this.getUrgentAlertsStats || !this.getUrgentAlertsStats.tiByStages) return [];
      if (this.getUrgentAlertsStats.tiByStages.length > 7) return [];
      return this.getUrgentAlertsStats.tiByStages;
    },

    urgentAlertsStatsByStages() {
      return this.getUrgentAlertsStats.stages.filter((s) => s.visible);
    },

    landUseStatsTiByStages() {
      if (!this.getLandUseStats || !this.getLandUseStats.tiByStages) return [];
      if (this.getLandUseStats.tiByStages.length > 7) return [];
      return this.getLandUseStats.tiByStages;
    },

    landUseStatsByStages() {
      return this.getLandUseStats.stages.filter((s) => s.visible);
    },

    ...mapState({
      monitoringFilters: (state) => {
        if (!state.monitoring.stats.currentTab) return null;

        if (state.monitoring.stats.currentTab === 'data') {
          return {
            startDate: state.monitoring.filters.startDate,
            endDate: state.monitoring.filters.endDate,
          };
        }

        return {
          startDate: state.monitoring.stats.rangeCycles.start_date || null,
          endDate: state.monitoring.stats.rangeCycles.end_date || null,
        };
      },
      alertsFilters: (state) => state['urgent-alerts'].filters,
      prodesFilters: (state) => state.prodes.filters,
      deterFilters: (state) => state.deter.filters,
      monitoringFeatures: (state) => state.monitoring.features,
      tableMonitoring: (state) => state.monitoring.stats.tableMonitoring,
      tableAlerts: (state) => state['urgent-alerts'].tableAlerts,
      legendVisibility: (state) => state.monitoring.stats.stages,
      legendVisibilityalerts: (state) => state['urgent-alerts'].legendVisibility,
      showFeaturesProdes: (state) => state.prodes.showFeaturesProdes,
      prodesFeatures: (state) => state.prodes.features,
      showFeaturesDeter: (state) => state.deter.showFeaturesDeter,
      deterFeatures: (state) => state.deter.features,
      showFeaturesLandUse: (state) => state['land-use'].showFeaturesLandUse,
      landUseFeatures: (state) => state['land-use'].features,
      tableLandUse: (state) => state['land-use'].stats.tableLandUse,
      supportLayerUser: (state) => state.supportLayersUser.supportLayerUser,
      showFeaturesSupportLayers: (state) => state.supportLayers.showFeaturesSupportLayers,
      supportLayers: (state) => state.supportLayers.supportLayers,
      supportLayersCategoryBase: (state) => state.supportLayers.supportLayersCategoryBase,
      showFeaturesUrgentAlerts: (state) => state['urgent-alerts'].showFeaturesUrgentAlerts,
      layers: (state) => state.foco.layers,
      filterOptions: (state) => state.foco.filterOptions,
      isLoadingFeatures: (state) => state.foco.isLoadingFeatures,
      bounds: (state) => state.map.bounds,

      // monitoring
      getMonitoringStats: (state) => state.monitoring.stats,
      getMonitoringShowFeatures: (state) => state.monitoring.showFeaturesMonitoring,

      // urgent alerts
      getUrgentAlertsStats: (state) => state['urgent-alerts'].stats,
      getUrgentAlertsShowFeatures: (state) => state['urgent-alerts'].showFeaturesUrgentAlert,

      // land use
      getLandUseStats: (state) => state['land-use'].stats,
      getLandUseShowFeatures: (state) => state['land-use'].showFeaturesLandUse,
    }),

    // ...mapGetters('monitoring', ['checkStageActive']),
    ...mapGetters({
      getMonitoringCheckStageActives: 'monitoring/checkStageActive',
      getUrgentAlertsCheckStageActives: 'urgent-alerts/checkStageActive',
      getLandUseCheckStageActives: 'land-use/checkStageActive',
    }),
  },

  watch: {
    leafSize: {
      handler(newSize) {
        if (newSize && newSize.type && this.map) {
          this.adjustMapSizeForPrint(newSize.type);
        }
      },
      immediate: true,
      deep: true,
    },

    showDialog: {
      handler(newVal) {
        if (newVal && this.leafSize && this.leafSize.type) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.adjustMapSizeForPrint(this.leafSize.type);
            }, 100);
          });
        }
      },
      immediate: true,
    },

    monitoringFeatures(newVal) {
      if (newVal && newVal.features && newVal.features.length > 100) {
        this.showWarningMessage = true;
      }
    },
    combinedTableData(newVal) {
      this.selectedItemsCount = newVal.length;
      this.showWarningMessage = (this.getMonitoringShowFeatures
      || this.showFeaturesLandUse) && newVal.length > 7;
    },
  },

  async mounted() {
    if (this.leafSize && this.leafSize.type && this.showDialog) {
      this.$nextTick(() => {
        setTimeout(() => {
          this.adjustMapSizeForPrint(this.leafSize.type);
        }, 300);
      });
    }
    let count = 0;
    // Check monitoring TI count
    if (
      this.getMonitoringShowFeatures
      && this.getMonitoringStats.tiByStages
      && this.monitoringStatsByStages.length) {
      count += this.getMonitoringStats.tiByStages.length;
    }

    // Check land use TI count
    if (this.showFeaturesLandUse
    && this.getLandUseStats.tiByStages
    && this.landUseStatsByStages.length) {
      count += this.getLandUseStats.tiByStages.length;
    }
    this.selectedItemsCount = count;

    if (count > 7) this.showWarningMessage = true;

    const visibleLayersCount = Object.values(this.supportLayers).filter((l) => l.visible).length;
    if (visibleLayersCount > 0) {
      if (visibleLayersCount > 7) {
        this.showWarningMessage = true;
      }
    }

    const visibleUserLayers = Object.values(this.supportLayerUser).filter(
      (l) => l.visible,
    ).length;
    if (visibleUserLayers > 0) {
      if (visibleUserLayers > 7) {
        this.showWarningMessage = true;
      }
    }
  },

  methods: {
    onMapReady(mapInstance) {
      this.map = mapInstance;
    },

    onMiniMapReady(miniMapInstance) {
      this.miniMap = miniMapInstance;
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
      const miniMapDimensions = this.getMiniMapDimensions(tamanho);
      document.getElementById('map-for-print').style.width = `${mapDimensions.width}px`;
      document.getElementById('map-for-print').style.height = `${mapDimensions.height}px`;
      document.getElementById('container-mini-map').style.height = `${miniMapDimensions.height}px`;
      document.getElementById('miniPrintMap').style.height = `${miniMapDimensions.height}px`;

      // set Minimap Title
      document.getElementsByClassName('print-mini-map-text')[0]
        .style.fontSize = `${this.getFontSizeWidth(tamanho)}px`;

      // get paragraphs details-print
      const divDetails = document.getElementById('details-print');
      const paragraphs = divDetails.querySelectorAll('p');
      paragraphs.forEach((p) => {
        // eslint-disable-next-line no-param-reassign
        p.style.fontSize = `${this.getFontSizeWidth(tamanho)}px`;
      });

      // recreate map size
      if (this.map) this.map.invalidateSize();
      if (this.miniMap) this.miniMap.invalidateSize();
    },

    getMapDimensions(tamanho) {
      switch (tamanho) {
        case 'A0':
          return { width: 4409, height: 3140 };
        case 'A1':
          return { width: 3138, height: 2220 };
        case 'A2':
          return { width: 2214, height: 1570 };
        case 'A3':
          return { width: 1557, height: 1105 };
        case 'A4':
          return { width: 1105, height: 770 };
        default:
          return { width: 1105, height: 770 };
      }
    },

    getMiniMapDimensions(tamanho) {
      switch (tamanho) {
        case 'A0':
          return { height: 800 };
        case 'A1':
          return { height: 600 };
        case 'A2':
          return { height: 400 };
        case 'A3':
          return { height: 200 };
        case 'A4':
          return { height: 150 };
        default:
          return { height: 150 };
      }
    },

    getFontSizeWidth(tamanho) {
      switch (tamanho) {
        case 'A0':
          return 34;
        case 'A1':
          return 20;
        case 'A2':
          return 16;
        case 'A3':
          return 12;
        case 'A4':
          return 10;
        default:
          return 10;
      }
    },

    resetConfigPrint() {
      if (this.leafSize && this.leafSize.type) {
        this.adjustMapSizeForPrint(this.leafSize.type);
      } else {
        document.getElementById('map-for-print').style.width = '1105px';
        document.getElementById('map-for-print').style.height = '770px';
      }
      document.getElementById('container-mini-map').style.height = '150px';
      document.getElementById('miniPrintMap').style.height = '150px';

      // set Minimap Title
      document.getElementsByClassName('print-mini-map-text')[0]
        .style.fontSize = '10px';

      // get paragraphs details-print
      const divDetails = document.getElementById('details-print');
      const paragraphs = divDetails.querySelectorAll('p');
      paragraphs.forEach((p) => {
        // eslint-disable-next-line no-param-reassign
        p.style.fontSize = '10px';
      });

      // recreate map size
      if (this.map) this.map.invalidateSize();
      if (this.miniMap) this.miniMap.invalidateSize();
      this.loadingPrintPdf = false;
      window.removeEventListener('afterprint', this.resetConfigPrint);
    },

    print() {
      this.adjustMapSizeForPrint(this.leafSize.type);
      const style = document.createElement('style');
      style.setAttribute('media', 'print');
      // create a promise print and return after close window print

      this.loadingPrintPdf = true;
      window.addEventListener('afterprint', this.resetConfigPrint);
      setTimeout(() => {
        window.print();
      }, 2000);
      if (this.map) this.map.invalidateSize();
    },

    async saveImage() {
      this.loadingPrintImage = true;
      const node = document.getElementById('map-for-print');
      const mapBounds = document.getElementsByClassName('leaflet-control-mapbounds')[0];
      const mapControlZoom = document.getElementsByClassName('leaflet-control-zoom')[0];
      const infoControlRight = document.getElementsByClassName(
        'leaflet-control-attribution',
      )[1];
      const legends = document.getElementsByClassName('text-legend-customized');
      const originalLegends = [];

      const originalStyle = infoControlRight.getAttribute('style');
      const currentWidth = parseFloat(window.getComputedStyle(infoControlRight).width);
      infoControlRight.style.width = `${currentWidth + 30}px`;

      try {
        const nameImageDownload = this.mapTitle;

        mapControlZoom.style.display = 'none';
        mapBounds.style.width = '250px';

        const originalWidth = node.style.width;
        const originalHeight = node.style.height;

        const mapDimensions = this.getMapDimensions(this.leafSize.type);
        node.style.width = `${mapDimensions.width}px`;
        node.style.height = `${mapDimensions.height}px`;

        if (legends && legends.length > 0) {
          Array.from(legends).forEach((legend) => {
            originalLegends.push(legend.style.width);
            const legendWidth = Math.min(150, mapDimensions.width * 0.12);
            // eslint-disable-next-line no-param-reassign
            legend.style.width = `${legendWidth}px`;
          });
        }

        const options = {
          quality: 1,
          bgcolor: 'white',
          width: mapDimensions.width,
          height: mapDimensions.height,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
          },
          filter: (node) => {
            const excludeClasses = ['no-print', 'print-dialog-header', 'print-dialog-footer'];
            const hasExcludeClass = excludeClasses.some(className =>
              node.classList && node.classList.contains(className));
            return !hasExcludeClass;
          },
          scrollX: 0,
          scrollY: 0,
          imagePlaceholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        };

        infoControlRight.setAttribute('style', 'width: 304px');

        if (this.leafSize.type === 'A0' || this.leafSize.type === 'A1') {
          options.cacheBust = true;
          options.imageTimeout = 30000;
        }

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

        if (this.leafSize.type === 'A0' || this.leafSize.type === 'A1') {
          await this.tryAlternativeImageSave();
        } else {
          this.$emit('show-error', 'Ocorreu um erro ao gerar a imagem.');
          this.loadingPrintImage = false;
        }
      } finally {
        infoControlRight.setAttribute('style', 'width: auto');
        mapBounds.style.width = 'auto';
        mapControlZoom.style.display = 'block';
        if (originalLegends && originalLegends.length > 0) {
          Array.from(legends).forEach((legend, index) => {
            // eslint-disable-next-line no-param-reassign
            legend.style.width = originalLegends[index];
          });
        }
        infoControlRight.setAttribute('style', originalStyle);
      }
    },

    ...mapActions('monitoring', ['getDataTableMonitoring']),
    ...mapActions('land-use', ['getDataTableLandUse']),
    ...mapActions('urgent-alerts', ['getDataTableAlerts']),
  },
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
}

.bordered-red {
    border: 2px solid red;
}

.bordered-blue {
    border: 2px solid blue;
}

.bordered-black {
    border: 2px solid black;
}

#data-table > div {
    background: #fffbfb;
    opacity: 0.9;
    padding: 5px;
}

.map-wrapper {
    width: 100%;
}

.vue-leaflet-map {
    height: 100% !important;
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
}

@media (max-width: 600px) {
    :deep(.v-dialog) {
        background-color: #fff !important;
    }
}
</style>
