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
      <v-container style="background-color: white; max-width: 100%;">
        <div style="position: relative;">
          <v-btn
            icon
            x-small
            class="no-print"
            style="position: absolute; top: 10px; right: 10px; z-index: 1000"
            @click="$emit('close')"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-row
          id="map-for-print"
          no-gutters
          style="width: 1230px; height: 780px; max-height: 780px; overflow: hidden"
        >
          <v-col
            id="monitoring-data-details"
            cols="8"
            class="pr-0 mt-2"
            style="max-height: 780px;"
          >
            <div
              id="data-table"
              class="leaflet-bottom leaflet-right"
            >
              <template
                v-if="showFeaturesMonitoring
                  && hasActiveMonitoringStages && teste >= 0 && teste <= 7"
              >
                <!-- Bloco para Monitoramento -->
                <div
                  v-for="(item, index) in filteredMonitoringData"
                  :key="'monitoring-' + index"
                  class="text-center bordered-red"
                >
                  <p>
                    <strong>TI {{ item.no_ti }}</strong>
                  </p>
                  <p v-if="parseFloat(item.nu_area_ha) > 0">
                    Área da TI: {{ formatNumber(item.nu_area_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.monitoring.nu_area_cr_ha) > 0">
                    CR: {{ formatNumber(item.monitoring.nu_area_cr_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.monitoring.nu_area_dg_ha) > 0">
                    DG: {{ formatNumber(item.monitoring.nu_area_dg_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.monitoring.nu_area_dr_ha) > 0">
                    DR: {{ formatNumber(item.monitoring.nu_area_dr_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.monitoring.nu_area_ff_ha) > 0">
                    FF: {{ formatNumber(item.monitoring.nu_area_ff_ha) }} ha
                  </p>
                </div>
              </template>
              <template v-if="showFeaturesLandUse && teste >= 0 && teste <= 7">
                <!-- Bloco para Uso e Ocupação do Solo -->
                <div
                  v-for="(item, index) in filteredLandUseData"
                  :key="'landuse-' + index"
                  class="text-center bordered-blue"
                >
                  <p>
                    <strong>TI {{ item.no_ti }}</strong>
                  </p>
                  <p v-if="parseFloat(item.nu_area_ha) > 0">
                    Área da TI: {{ formatNumber(item.nu_area_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.landUse.nu_area_ag_ha) > 0">
                    AG: {{ formatNumber(item.landUse.nu_area_ag_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.landUse.nu_area_cr_ha) > 0">
                    CR: {{ formatNumber(item.landUse.nu_area_cr_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.landUse.nu_area_dg_ha) > 0">
                    DG: {{ formatNumber(item.landUse.nu_area_dg_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.landUse.nu_area_ma_ha) > 0">
                    MA: {{ formatNumber(item.landUse.nu_area_ma_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.landUse.nu_area_mi_ha) > 0">
                    MI: {{ formatNumber(item.landUse.nu_area_mi_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.landUse.nu_area_no_ha) > 0">
                    NO: {{ formatNumber(item.landUse.nu_area_no_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.landUse.nu_area_rv_ha) > 0">
                    RV: {{ formatNumber(item.landUse.nu_area_rv_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.landUse.nu_area_sv_ha) > 0">
                    SV: {{ formatNumber(item.landUse.nu_area_sv_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.landUse.nu_area_vn_ha) > 0">
                    VN: {{ formatNumber(item.landUse.nu_area_vn_ha) }} ha
                  </p>
                  <p v-if="parseFloat(item.landUse.nu_area_vi_ha) > 0">
                    VI: {{ formatNumber(item.landUse.nu_area_vi_ha) }} ha
                  </p>
                </div>
              </template>
            </div>
            <v-card
              v-if="showWarningMessage"
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
            />
          </v-col>
          <v-col
            cols="4"
            class="pl-1 mt-2"
          >
            <div class="border_container">
              <div class="d-flex justify-space-between pl-8 pr-8 ga-1 align-center ma-4">
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
              <div class="d-flex justify-center hight_container_mini_map">
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
                      <strong style="font-size: small">{{ $t('legend') }}</strong>
                    </p>
                    <div
                      class="ma-1 flex-wrap"
                      style="
                        width: 100%;
                        max-height: 100%;
                        overflow: hidden;
                      "
                    >
                      <div
                        style="
                          display: flex;
                          justify-content: flex-start;
                          align-items: flex-start;
                          gap: 5px;
                        "
                      />
                      <LayerList :layers="supportLayersCategoryFire" />

                      <div
                        style="
                          display: flex;
                          justify-content: flex-start;
                          align-items: flex-start;
                          gap: 5px;"
                      >
                        <div v-if="showFeaturesMonitoring && hasActiveMonitoringStages">
                          <p>
                            <strong> Monitoramento Diário </strong>
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
                          v-if="showFeaturesUrgentAlerts &&
                            (!showFeaturesLandUse || !showFeaturesSupportLayers)"
                        >
                          <p>
                            <strong>Alerta Urgente</strong>
                          </p>
                          <hr style="border: 1px solid blue;margin: 0; margin-top: 3px;">
                          <CustomizedLegend
                            v-if="showFeaturesUrgentAlerts"
                            :items="urgentAlertItems"
                          />
                        </div>

                        <div
                          v-if="showFeaturesSupportLayers
                            && (Object.values(supportLayers).filter(l => l.visible).length)
                            && (Object.values(supportLayers).filter(l => l.visible).length <= 7)
                            && (Object.values(supportLayerUser).filter(l => l.visible).length <= 7)"
                        >
                          <p>
                            <strong>Sobreposição de camadas</strong>
                          </p>
                          <hr style="border: 1px solid blue;margin: 0; margin-top: 3px;">
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
                          <p>
                            <strong>INPE - Prodes</strong>
                          </p>
                          <hr style="border: 1px solid blue; margin: 0; margin-top: 3px;">
                          <CustomizedLegend
                            class="pt-1"
                            :items="prodesItems"
                          />
                        </div>
                        <div v-if="showFeaturesDeter">
                          <p>
                            <strong>INPE - Deter</strong>
                          </p>
                          <hr style="border: 1px solid blue; margin: 0; margin-top: 3px;">
                          <CustomizedLegend
                            class="pt-1"
                            :items="deterItems"
                          />
                        </div>
                        <div v-if="showFeaturesAquaMM || showFeaturesAquaMT">
                          <p>
                            <strong>INPE - Focos de Calor</strong>
                          </p>
                          <hr style="border: 1px solid blue; margin: 0; margin-top: 3px;">
                          <CustomizedLegend
                            class="pt-1"
                            :items="heatFocusItems.filter(item =>
                              (item.label === 'Aqua Modis Manhã' && showFeaturesAquaMM) ||
                              (item.label === 'Aqua Modis Tarde' && showFeaturesAquaMT)
                            )"
                          />
                        </div>
                      </div>

                      <div
                        v-if="showFeaturesUrgentAlerts && showFeaturesMonitoring &&
                          showFeaturesLandUse && showFeaturesSupportLayers"
                      >
                        <p>
                          <strong>Alerta Urgente</strong>
                        </p>
                        <hr style="border: 1px solid blue;margin: 0;">
                        <CustomizedLegend
                          v-if="showFeaturesUrgentAlerts"
                          :items="urgentAlertItems"
                        />
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
                      v-if="activeRasterLayers.length"
                      class="ml-1"
                    >
                      <span
                        v-for="item in activeRasterLayers"
                        :key="item.id"
                      >
                        <p v-if="item.wms">
                          {{ item.name }}, fonte:
                          {{ item.wms?.geoserver?.name }}.
                        </p>
                        <p v-else-if="item.tms">
                          {{ item.name }}, fonte:
                          {{ item.tms?.url
                            ? 'SCCON. Atualizado em: ' +
                            handleData(
                              item.tms?.date
                            )
                            : ''
                          }}.
                        </p>
                      </span>
                    </div>
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
                      {{ handleData(monitoringFilters.startDate) }}
                      {{ $t('and') }}
                      {{ handleData(monitoringFilters.endDate) }}
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
  },

  data: () => ({
    teste: 0,
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
    logo_funai: process.env.DEFAULT_LOGO_IMAGE_FUNAI,
    logo_cmr: process.env.DEFAULT_LOGO_IMAGE_CMR,
    print_title: process.env.PRINT_TITLE,
    print_info: process.env.PRINT_INFO,
    showWarningMessage: false,
    activeMonitoringLabel: [],
    loadingPrintImage: false,
    urgentAlertItems: [
      { label: 'regeneration-deforestation', color: '#990099' },
      { label: 'degradation', color: '#ff8000' },
      { label: 'clear-cut', color: '#ff3333' },
    ],
    deterItems: [
      { label: 'Alerta', color: '#AAAAAA', border: '1px solid #000000' },
    ],
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
    filteredMonitoringData() {
      return this.combinedTableData.filter(
        (item) => item.monitoring
        && Object.keys(item.monitoring).some((key) => item.monitoring[key] > 0),
      );
    },

    filteredLandUseData() {
      return this.combinedTableData.filter(
        (item) => item.landUse
        && Object.keys(item.landUse).some((key) => item.landUse[key] > 0),
      );
    },

    filteredCombinedTableData() {
      return this.combinedTableData.filter((item) => {
        const hasMonitoring = this.showFeaturesMonitoring
                           && item.monitoring
                           && Object.keys(item.monitoring).some((key) => item.monitoring[key] > 0);

        const hasLandUse = this.showFeaturesLandUse
                         && item.landUse
                         && Object.keys(item.landUse).some((key) => item.landUse[key] > 0);

        return hasMonitoring || hasLandUse;
      });
    },
    combinedTableData() {
      const keys = {
        monitoring: ['cr_ha', 'dg_ha', 'dr_ha', 'ff_ha'],
        landUse: ['ag_ha', 'cr_ha', 'dg_ha', 'ma_ha', 'mi_ha', 'no_ha', 'rv_ha', 'sv_ha', 'vn_ha', 'vi_ha'],
      };
      const initializeObject = (keyList) => keyList.reduce((obj, key) => ({ ...obj, [`nu_area_${key}`]: 0 }), {});
      const initializeData = (noTi) => ({
        no_ti: noTi,
        nu_area_ha: 0,
        monitoring: initializeObject(keys.monitoring),
        landUse: initializeObject(keys.landUse),
      });
      const addValue = (target, key, value) => {
        const updatedValue = (target[key] || 0) + (parseFloat(value) || 0);
        // eslint-disable-next-line no-param-reassign
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
      if (!Array.isArray(this.tableMonitoring) || !Array.isArray(this.tableLandUse)) {
        console.warn('tableMonitoring ou tableLandUse não são arrays válidos.');
        return [];
      }
      processTable(this.tableMonitoring, 'monitoring');
      processTable(this.tableLandUse, 'landUse');
      return Object.values(combined);
    },

    totalAreas() {
      const monitoringKeys = ['cr_ha', 'dg_ha', 'dr_ha', 'ff_ha'];
      const landUseKeys = ['ag_ha', 'cr_ha', 'dg_ha', 'ma_ha', 'mi_ha', 'no_ha', 'rv_ha', 'sv_ha', 'vn_ha', 'vi_ha'];
      const initializeObject = (keys) => keys.reduce((obj, key) => ({ ...obj, [`nu_area_${key}`]: 0 }), {});
      const addValue = (target, key, value) => {
        // eslint-disable-next-line no-param-reassign
        target[key] += parseFloat(value) || 0;
      };
      if (!Array.isArray(this.combinedTableData)) {
        console.warn('combinedTableData não é um array válido.');
        return initializeObject(['ha', ...monitoringKeys, ...landUseKeys]);
      }
      return this.combinedTableData.reduce(
        (acc, item) => {
          addValue(acc, 'nu_area_ha', item.nu_area_ha);
          monitoringKeys.forEach((key) => addValue(acc.monitoring, `nu_area_${key}`, item.monitoring[`nu_area_${key}`]));
          landUseKeys.forEach((key) => addValue(acc.landUse, `nu_area_${key}`, item.landUse[`nu_area_${key}`]));
          return acc;
        },
        {
          nu_area_ha: 0,
          monitoring: initializeObject(monitoringKeys),
          landUse: initializeObject(landUseKeys),
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
      return [
        ['Support Layers', this.supportLayers, this.showFeaturesSupportLayers],
        ['Fire Category Layers', this.supportLayersCategoryFire, true],
      ]
        .map(([name, layers, show]) => ({ name, layers, show }))
        .filter(({ show }) => show);
    },

    activeRasterLayers() {
      return Object.values(this.supportLayersCategoryRaster).filter(
        (layer) => layer.visible,
      );
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
      return (
        this.layers
        && this.layers.aquaMM
        && this.layers.aquaMM.filters
      ) || {};
    },

    prodesItems() {
      return this.$store.getters['prodes/getLegendItems'];
    },

    monitoringItems() {
      return this.$store.getters['monitoring/getActiveLegendItems'];
    },

    landUseItems() {
      return this.$store.getters['land-use/getActiveLegendItems'];
    },

    monitoringCount() {
      return this.combinedTableData.filter(
        (item) => item.monitoring
          && Object.keys(item.monitoring).some(
            (key) => item.monitoring[key] > 0,
          ),
      ).length;
    },

    ...mapState({
      monitoringFilters: (state) => state.monitoring.filters,
      prodesFilters: (state) => state.prodes.filters,
      deterFilters: (state) => state.deter.filters,
      showFeaturesMonitoring: (state) => state.monitoring.showFeaturesMonitoring,
      monitoringFeatures: (state) => state.monitoring.features,
      tableMonitoring: (state) => state.monitoring.tableMonitoring,
      legendVisibility: (state) => state.monitoring.legendVisibility,
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
      supportLayersCategoryFire: (state) => state.supportLayers.supportLayersCategoryFire,
      supportLayersCategoryBase: (state) => state.supportLayers.supportLayersCategoryBase,
      supportLayersCategoryRaster: (state) => state.supportLayers.supportLayersCategoryRaster,
      supportLayersCategoryAntropismo: (state) => state.supportLayers.supportLayersCategoryAntropismo,
      showFeaturesUrgentAlerts: (state) => state['urgent-alerts'].showFeaturesUrgentAlerts,
      layers: (state) => state.foco.layers,
      filterOptions: (state) => state.foco.filterOptions,
      isLoadingFeatures: (state) => state.foco.isLoadingFeatures,
      bounds: (state) => state.map.bounds,
    }),
  },

  watch: {
    monitoringFeatures(newVal) {
      if (newVal && newVal.features && newVal.features.length > 100) {
        this.showWarningMessage = true;
      }
    },

    combinedTableData(newVal) {
      this.teste = newVal.length;
      this.showWarningMessage = newVal.length > 7;
    },
  },

  async mounted() {
    if (this.showFeaturesMonitoring) {
      await this.getDataTableMonitoring();
    }
    if (this.showFeaturesLandUse) {
      await this.getDataTableLandUse();
    }
    this.teste = this.combinedTableData.length;
    this.showWarningMessage = this.teste > 7;

    const visibleLayersCount = Object.values(this.supportLayers)
      .filter((l) => l.visible).length;
    if (visibleLayersCount > 0) {
      if (visibleLayersCount > 7) {
        this.showWarningMessage = true;
      }
    }

    const visibleUserLayers = Object.values(this.supportLayerUser)
      .filter((l) => l.visible).length;
    if (visibleUserLayers > 0) {
      if (visibleUserLayers > 7) {
        this.showWarningMessage = true;
      }
    }
  },

  methods: {
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
      const node = document.getElementById('map-for-print');
      const mapBounds = document.getElementsByClassName('leaflet-control-mapbounds')[0];
      const mapControlZoom = document.getElementsByClassName('leaflet-control-zoom')[0];
      const infoControlRight = document.getElementsByClassName('leaflet-control-attribution')[1];

      try {
        const nameImageDownload = this.mapTitle;

        mapControlZoom.style.display = 'none';
        mapBounds.style.width = '250px';

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

        infoControlRight.setAttribute('style', 'width: 304px');

        const image = await domtoimage.toJpeg(node, options);

        const link = document.createElement('a');
        link.href = image;
        link.download = nameImageDownload
          ? `${nameImageDownload}.jpeg`
          : 'Mapa.jpeg';
        link.click();

        node.style.width = originalWidth;
        node.style.height = originalHeight;

        this.loadingPrintImage = false;
      } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        this.$emit('show-error', 'Ocorreu um erro ao gerar a imagem.');
        this.loadingPrintImage = false;
      } finally {
        infoControlRight.setAttribute('style', 'width: auto');
        mapBounds.style.width = 'auto';
        mapControlZoom.style.display = 'block';
      }
    },

    ...mapActions('monitoring', ['getDataTableMonitoring']),
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
