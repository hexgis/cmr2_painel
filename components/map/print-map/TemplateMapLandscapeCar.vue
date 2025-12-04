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
      <v-row class="justify-center text-center mt-n4">
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
        <v-col cols="12" class="mt-n4">
          <p class="font-title text-h6">
            {{ mapTitle }}
          </p>
        </v-col>
      </v-row>

      <div>
        <v-col cols="12" class="pr-0 mt-n6" style="height: 70vh; position: relative">
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

    <!-- Página 2: Lista de CARs e Legendas -->
    <div class="page-section car-list-section">
      <div class="car-list">
        <div v-if="carData.length > 0">
          <p class="d-flex align-center ma-4 pb-4">
            <strong class="mr-2">Cadastro Ambiental Rural (CAR)</strong>
            <v-chip x-small>
              {{ carData.length }}
            </v-chip>
          </p>

          <v-row class="car-list-row">
            <v-col
              v-for="(item, index) in carData"
              :key="'car-' + index"
              cols="12"
              sm="6"
              md="4"
              class="car-list-col"
            >
              <div class="car-list-item pl-4">
                <div class="d-flex align-center">
                  <v-avatar
                    :color="getCarColor(index)"
                    size="20"
                    class="mr-1 car-number-avatar"
                  >
                    <span class="white--text font-weight-bold" style="font-size: 10px">
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

      <div class="legends-container">
        <v-row class="legends-row flex-nowrap justify-start align-start" style="gap: 12px; overflow-x: auto; padding-bottom: 8px">
          <!-- Monitoramento Diário -->
          <v-col v-if="showFeaturesMonitoring && hasActiveMonitoringStages" cols="auto" style="min-width: 180px">
            <div class="d-flex align-center mb-2">
              <strong style="font-size: 12px">Monitoramento Diário</strong>
              <v-chip x-small class="ml-1" color="red" text-color="white">
                {{ monitoringTICount }}
              </v-chip>
            </div>
            <hr class="styled-divider-red" style="margin: 4px 0 8px 0" />
            <CustomizedLegend class="pt-1" :items="monitoringItems" />
          </v-col>

          <!-- Alerta Urgente -->
          <v-col v-if="showFeaturesAlerts && hasActiveAlertsStages" cols="auto" style="min-width: 180px">
            <div class="d-flex align-center mb-2">
              <strong style="font-size: 12px">Alerta Urgente</strong>
              <v-chip x-small class="ml-1" color="orange" text-color="white">
                {{ alertsCount }}
              </v-chip>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0" />
            <CustomizedLegend class="pt-1" :items="alertsItems" />
          </v-col>

          <!-- Camadas de Sobreposição -->
          <v-col v-if="showFeaturesSupportLayers && hasVisibleSupportLayers" cols="auto" style="min-width: 200px">
            <div>
              <strong style="font-size: 12px">Sobreposição de camadas</strong>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0" />
            <LayerList v-if="visibleUserLayers.length > 0" :layers="supportLayerUser" :is-user-layer="true" />
            <LayerList v-if="visibleSystemLayers.length > 0" :layers="supportLayers" class="mt-1" />
          </v-col>

          <!-- Uso e Ocupação do Solo -->
          <v-col v-if="showFeaturesLandUse" cols="auto" style="min-width: 180px">
            <div class="d-flex align-center mb-2">
              <strong style="font-size: 12px">Uso e Ocupação do Solo</strong>
              <v-chip x-small class="ml-1" color="green" text-color="white">
                {{ tableLandUse.length }}
              </v-chip>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0" />
            <CustomizedLegend class="pt-1" :items="landUseItems" />
          </v-col>

          <!-- INPE - Prodes -->
          <v-col v-if="showFeaturesProdes" cols="auto" style="min-width: 160px">
            <div class="mb-2">
              <strong style="font-size: 12px">INPE - Prodes</strong>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0" />
            <CustomizedLegend class="pt-1" :items="prodesItems" />
          </v-col>

          <!-- INPE - Deter -->
          <v-col v-if="showFeaturesDeter" cols="auto" style="min-width: 160px">
            <div class="mb-2">
              <strong style="font-size: 12px">INPE - Deter</strong>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0" />
            <CustomizedLegend class="pt-1" :items="deterItems" />
          </v-col>

          <!-- INPE - Focos de Calor -->
          <v-col v-if="showFeaturesAquaMM || showFeaturesAquaMT" cols="auto" style="min-width: 180px">
            <div class="mb-2">
              <strong style="font-size: 12px">INPE - Focos de Calor</strong>
            </div>
            <hr class="styled-divider" style="margin: 4px 0 8px 0" />
            <CustomizedLegend class="pt-1" :items="filteredHeatFocusItems" />
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Página 3: Tabela de CARs -->
    <div class="page-section car-table-section">
      <div style="background-color: #fff" class="teste-print">
        <v-divider class="mt-4" />

        <div v-if="carData.length > 0" class="car-list pa-4 table-container">
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
                <tr v-for="(car, index) in carData" :key="index">
                  <td>
                    <v-avatar :color="getCarColor(index)" size="24">
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
              <v-row v-if="layer && layer.visible" no-gutters align="center" class="image-container">
                <v-col>
                  <p>
                    <strong>{{ layer.name || '-' }}.</strong>
                    Fonte:{{ layer.fonte || '-' }}, Data de atualização:
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
                  <span v-for="(year, yearIndex) in feature.years" :key="'year-' + yearIndex">
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
import { mapState, mapMutations, mapActions } from 'vuex'
import BaseModal from '../../base/BaseModal.vue'
import MapForPrint from './MapForPrint.vue'
import MiniMap from './MiniMap.vue'
import LayerList from './LayerListActive.vue'
import CustomizedLegend from './CustomizedLegendActive.vue'

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
  }),

  computed: {
    visibleUserLayers() {
      return Object.values(this.supportLayerUser || {}).filter(l => l?.visible) || []
    },

    visibleSystemLayers() {
      return Object.values(this.supportLayers || {}).filter(l => l?.visible) || []
    },

    monitoringTICount() {
      if (!this.showFeaturesMonitoring) return 0
      if (!this.combinedTableData || !Array.isArray(this.combinedTableData)) return 0

      const tisComMonitoramento = new Set()

      this.combinedTableData.forEach((item) => {
        if (item?.monitoring && Object.keys(item.monitoring).some((key) => item.monitoring[key] > 0)) {
          if (item.no_ti) {
            tisComMonitoramento.add(item.no_ti)
          }
        }
      })

      return tisComMonitoramento.size
    },

    combinedTableData() {
      const keys = {
        monitoring: ['cr_ha', 'dg_ha', 'dr_ha', 'ff_ha'],
        landUse: ['ag_ha', 'cr_ha', 'dg_ha', 'ma_ha', 'mi_ha', 'no_ha', 'rv_ha', 'sv_ha', 'vn_ha', 'vi_ha'],
        alerts: ['cr_ha', 'dg_ha', 'dr_ha'],
      }

      const initializeObject = (keyList) => keyList.reduce((obj, key) => ({ ...obj, [`nu_area_${key}`]: 0 }), {})
      const initializeData = (noTi) => ({
        no_ti: noTi,
        nu_area_ha: 0,
        monitoring: initializeObject(keys.monitoring),
        landUse: initializeObject(keys.landUse),
        alerts: initializeObject(keys.alerts),
      })

      const addValue = (target, key, value) => {
        const updatedValue = (target[key] || 0) + (parseFloat(value) || 0)
        target[key] = updatedValue
      }

      const combined = {}

      const processTable = (table, type) => {
        if (!Array.isArray(table)) return

        table.forEach((item) => {
          if (!item.no_ti) return
          if (!combined[item.no_ti]) combined[item.no_ti] = initializeData(item.no_ti)
          const data = combined[item.no_ti]
          addValue(data, 'nu_area_ha', item.nu_area_ha)
          keys[type].forEach((key) => addValue(data[type], `nu_area_${key}`, item[`nu_area_${key}`]))
        })
      }

      processTable(this.tableMonitoring, 'monitoring')
      processTable(this.tableLandUse, 'landUse')
      processTable(this.tableAlerts, 'alerts')

      return Object.values(combined)
    },

    showFeaturesAquaMM() {
      return this.isLayerActive('aquaMM')
    },

    showFeaturesAquaMT() {
      return this.isLayerActive('aquaMT')
    },

    filteredHeatFocusItems() {
      if (!this.heatFocusItems || !Array.isArray(this.heatFocusItems)) return []

      return this.heatFocusItems.filter(item => {
        if (!item || !item.label) return false
        return (
          (item.label === 'Aqua Modis Manhã' && this.showFeaturesAquaMM) ||
          (item.label === 'Aqua Modis Tarde' && this.showFeaturesAquaMT)
        )
      })
    },

    prodesItems() {
      return this.$store.getters['prodes/getLegendItems']
    },

    monitoringItems() {
      return this.$store.getters['monitoring/getActiveLegendItems']
    },

    alertsItems() {
      return this.$store.getters['urgent-alerts/getLegendItems']
    },

    landUseItems() {
      return this.$store.getters['land-use/getActiveLegendItems']
    },

    alertsCount() {
      return this.tableAlerts?.length || 0
    },

    hasActiveMonitoringStages() {
      if (!this.legendVisibility) return false
      return Object.values(this.legendVisibility).some((visible) => visible)
    },

    hasActiveAlertsStages() {
      if (!this.legendVisibilityalerts) return false
      return Object.values(this.legendVisibilityalerts).some((visible) => visible)
    },

    hasVisibleSupportLayers() {
      if (!this.showFeaturesSupportLayers) return false

      const systemLayersVisible = this.supportLayers &&
        Object.values(this.supportLayers).some(layer => layer && layer.visible)

      const userLayersVisible = this.supportLayerUser &&
        Object.values(this.supportLayerUser).some(layer => layer && layer.visible)

      return systemLayersVisible || userLayersVisible
    },

    uniqueYears() {
      if (!Array.isArray(this.tableLandUse)) return []
      const years = this.tableLandUse
        .map((item) => item?.nu_ano)
        .filter(year => year != null)
      return [...new Set(years)]
    },

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
          startDate: this.layers?.aquaMM?.filters?.startDate,
          endDate: this.layers?.aquaMM?.filters?.endDate
        }
      ]

      return conditions
        .filter(item => item.condition)
        .map(({ condition, ...rest }) => rest)
    },

    layerCategories() {
      const categories = []

      if (this.showFeaturesSupportLayers && this.supportLayers) {
        const visibleSystemLayers = Object.entries(this.supportLayers)
          .filter(([_, layer]) => layer && layer.visible)
          .reduce((acc, [key, layer]) => {
            acc[key] = layer
            return acc
          }, {})

        if (Object.keys(visibleSystemLayers).length > 0) {
          categories.push({
            name: 'Support Layers',
            layers: visibleSystemLayers,
            type: 'system'
          })
        }
      }

      if (this.showFeaturesSupportLayers && this.supportLayerUser) {
        const visibleUserLayers = Object.entries(this.supportLayerUser)
          .filter(([_, layer]) => layer && layer.visible)
          .reduce((acc, [key, layer]) => {
            acc[key] = layer
            return acc
          }, {})

        if (Object.keys(visibleUserLayers).length > 0) {
          categories.push({
            name: 'User Layers',
            layers: visibleUserLayers,
            type: 'user'
          })
        }
      }

      return categories
    },

    showDialog() {
      return this.showTemplateMapLandscapeCar && this.carPrintData.visible
    },

    mapTitle() {
      return this.carPrintData.mapTitle || 'Mapa de Imóveis CAR'
    },

    leafSize() {
      return this.carPrintData.leafSize || { type: 'A4' }
    },

    mapBounds() {
      return this.carPrintData.mapBounds
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
        }
      }
      return null
    },

    carData() {
      return this.carPrintData.carData || []
    },

    map() {
      return window.mapMain || null
    },

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
          await this.$nextTick()

          const promises = []

          if (this.showFeaturesMonitoring && (!this.tableMonitoring || this.tableMonitoring.length === 0)) {
            promises.push(this.getDataTableMonitoring())
          }

          if (this.showFeaturesLandUse && (!this.tableLandUse || this.tableLandUse.length === 0)) {
            promises.push(this.getDataTableLandUse())
          }

          if (this.showFeaturesAlerts && (!this.tableAlerts || this.tableAlerts.length === 0)) {
            promises.push(this.getDataTableAlerts())
          }

          if (promises.length > 0) {
            await Promise.all(promises)
          }

          await this.$nextTick()
        }
      },
      immediate: true
    },
  },

  mounted() {
    if (this.showDialog) {
      this.loadData()
    }
  },

  beforeDestroy() {
    this.printMap = null
  },

  methods: {
    async loadData() {
      const promises = []

      if (this.showFeaturesMonitoring) {
        promises.push(this.getDataTableMonitoring())
      }

      if (this.showFeaturesLandUse) {
        promises.push(this.getDataTableLandUse())
      }

      if (this.showFeaturesAlerts) {
        promises.push(this.getDataTableAlerts())
      }

      if (promises.length > 0) {
        await Promise.all(promises)
      }

      await this.$nextTick()
    },

    isLayerActive(layerName) {
      return this.layers?.[layerName]?.showFeatures || false
    },

    updateBounds(bounds) {
      this.currentBounds = bounds
    },

    handleBack() {
      this.$emit('back-to-printer')
      this.setShowTemplateMapLandscapeCar(false)
    },

    handleClose() {
      this.setShowTemplateMapLandscapeCar(false)
      this.clearCarPrintData()
      this.$emit('close-completely')
    },

    handleProdesYear() {
      if (!this.prodesFilters) return '-'
      if (this.prodesFilters.startYear === this.prodesFilters.endYear) {
        return this.prodesFilters.startYear
      }
      return `${this.prodesFilters.startYear} ${this.$t('and')} ${this.prodesFilters.endYear}`
    },

    handleData(data) {
      if (!data || typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return 'Data indisponível'
      }
      const [year, month, day] = data.split('-')
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
    },

    onMapReady(map) {
      this.printMap = map
      map.invalidateSize(true)
      this.displayCAROnMap(this.carData)
    },

    getCenter(center) {
      this.mapCenter = center
    },

    getZoom(zoom) {
      this.mainZoom = zoom
    },

    getMunicipioName(carItem) {
      return carItem.properties.no_municipio_car
        || carItem.properties.no_municipio
        || carItem.properties.municipio || '-'
    },

    getTerraIndigenaName(carItem) {
      return carItem.properties.no_terra_indigena
        || carItem.properties.terra_indigena
        || carItem.properties.nome
        || 'Nome não disponível'
    },

    getCarColor(index) {
      return this.CAR_COLORS[index % this.CAR_COLORS.length]
    },

    formatNumber(value) {
      if (value == null || value === '') return '-'

      try {
        const num = typeof value === 'string'
          ? parseFloat(value.replace(/\./g, '').replace(',', '.'))
          : Number(value)

        if (isNaN(num)) return '-'

        if (Number.isInteger(num)) {
          return num.toLocaleString('pt-BR')
        }

        return num.toLocaleString('pt-BR', {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        })
      } catch {
        return '-'
      }
    },

    todayDate() {
      const date = new Date()
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const yyyy = date.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    },

    displayCAROnMap(features) {
      try {
        if (!Array.isArray(features) || features.length === 0 || !this.printMap) {
          return
        }

        if (this.carLayer && this.printMap) {
          this.printMap.removeLayer(this.carLayer)
          this.carLayer = null
        }

        const carLayers = features.map((feature, index) => {
          const color = this.getCarColor(index)
          const numero = index + 1

          const carStyle = {
            color,
            weight: 3,
            opacity: 0.9,
            fillColor: color,
            fillOpacity: 0.3,
          }

          const layer = window.L.geoJSON(feature, {
            style: carStyle,
          })

          const center = layer.getBounds().getCenter()

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
          })

          return window.L.layerGroup([layer, numberMarker])
        })

        this.carLayer = window.L.layerGroup(carLayers)
        this.carLayer.addTo(this.printMap)

        const allLayers = carLayers.flatMap((layerGroup) => layerGroup.getLayers())
        const group = window.L.featureGroup(allLayers)
        this.printMap.fitBounds(group.getBounds().pad(0.1))
      } catch (error) {
        console.error('Erro ao exibir CAR no mapa de impressão:', error)
      }
    },

    ...mapMutations('map', ['setShowTemplateMapLandscapeCar', 'clearCarPrintData']),
    ...mapActions('monitoring', ['getDataTableMonitoring']),
    ...mapActions('land-use', ['getDataTableLandUse']),
    ...mapActions('urgent-alerts', ['getDataTableAlerts']),
  },
}
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

@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  @page {
    margin: 0.3cm !important;
    background: white !important;
    size: landscape;
    marks: none !important;
  }

  html, body {
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
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
    margin: 0 !important;
    padding: 0 !important;
  }

  .page-section.map-print {
    page-break-after: always !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    position: relative !important;
    background: transparent !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0.2cm 0.3cm 0.3cm 0.3cm !important;
    margin: 0 !important;
  }

  .map-print > div > .v-col {
    max-height: 600px !important;
    min-height: 480px !important;
  }

  .mini-map-overlay {
    background: white !important;
    border: 1px solid #999 !important;
  }

  .page-section.car-list-section {
    page-break-before: auto !important;
    page-break-inside: auto !important;
    break-inside: auto !important;
    position: relative !important;
    background: transparent !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0.1cm 0.3cm 0.3cm 0.3cm !important;
    margin: 0 !important;
    overflow: visible !important;
  }

  .car-list-section .car-list > div:first-child {
    page-break-after: avoid !important;
    page-break-inside: avoid !important;
    margin: 0 !important;
    padding: 0 !important;
    position: relative;
    top: 0 !important;
  }

  .car-list-section .d-flex.align-center.ma-4.pb-4 {
    margin: 0 0 0.1cm 0 !important;
    padding: 0.05cm 0 0.05cm 0 !important;
    line-height: 1 !important;
    height: auto !important;
    min-height: 0 !important;
    display: flex !important;
    align-items: center !important;
    page-break-after: avoid !important;
    page-break-before: avoid !important;
    orphans: 3 !important;
    widows: 3 !important;
  }

  .car-list-section .car-list {
    page-break-inside: auto !important;
    break-inside: auto !important;
    position: relative !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
  }

  .car-list-row {
    display: flex !important;
    flex-wrap: wrap !important;
    width: 100% !important;
    margin: 0 -2px !important;
    page-break-inside: auto !important;
    break-inside: auto !important;
    margin-top: 0 !important;
    padding-top: 0 !important;
    position: relative;
    top: 0 !important;
  }

  .car-list-col {
    flex: 0 0 33.333333% !important;
    max-width: 33.333333% !important;
    width: 33.333333% !important;
    padding: 0 2px 2px 2px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin-bottom: 2px !important;
    min-height: 20px !important;
    margin-top: 0 !important;
  }

  .car-list-item {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    display: flex !important;
    align-items: center !important;
    min-height: 18px !important;
    padding: 0 !important;
    margin: 0 !important;
    height: 18px !important;
    line-height: 18px !important;
    margin-top: 0 !important;
  }

  .car-list-item.pl-4 {
    padding-left: 8px !important;
    padding-top: 0 !important;
    margin-top: 0 !important;
  }

  .car-name {
    font-size: 7px !important;
    line-height: 1 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    max-width: calc(100% - 22px) !important;
    margin-left: 2px !important;
    padding: 0 !important;
  }

  .car-number-avatar {
    min-width: 16px !important;
    width: 16px !important;
    height: 16px !important;
    flex-shrink: 0 !important;
  }

  .car-number-avatar span {
    font-size: 6px !important;
    line-height: 16px !important;
  }

  .car-list > div:first-child {
    page-break-after: avoid !important;
  }

  .car-list-col:nth-child(3n+1) {
    page-break-before: auto !important;
  }

  .car-list .mt-4 {
    margin-top: 0.1cm !important;
    margin-bottom: 0.1cm !important;
    border-top: 1px solid #e0e0e0 !important;
    border-bottom: none !important;
    border-left: none !important;
    border-right: none !important;
  }

  .legend-header {
    margin: 0.1cm 0 0.1cm 0 !important;
    padding: 0 !important;
    page-break-before: avoid !important;
  }

  .legend-header .d-flex.align-center.py-4 {
    margin: 0 !important;
    padding: 0.05cm 0 !important;
    line-height: 1.2 !important;
  }

  .legends-container {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
  }

  .legends-row {
    flex-wrap: nowrap !important;
    justify-content: flex-start !important;
    overflow-x: visible !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin: 0 !important;
    padding: 0 !important;
    gap: 6px !important;
  }

  .page-section.car-table-section {
    page-break-before: always !important;
    page-break-inside: auto !important;
    break-inside: auto !important;
    position: relative !important;
    background: transparent !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0.1cm 0.3cm 0.3cm 0.3cm !important;
    margin: 0 !important;
  }

  .table-container {
    page-break-inside: auto !important;
    break-inside: auto !important;
    background: transparent !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .table-container h3 {
    margin: 0 0 0.1cm 0 !important;
    padding: 0 !important;
    font-size: 10pt !important;
  }

  table {
    page-break-inside: auto !important;
    break-inside: auto !important;
    background: transparent !important;
    margin: 0 !important;
  }

  thead {
    display: table-header-group !important;
    background-color: #f5f5f5 !important;
    -webkit-print-color-adjust: exact !important;
  }

  .v-data-table {
    font-size: 8pt !important;
    width: 100% !important;
    background: transparent !important;
  }

  .v-data-table >>> th {
    font-size: 8pt !important;
    font-weight: bold !important;
    background-color: #f5f5f5 !important;
    -webkit-print-color-adjust: exact !important;
    padding: 4px 6px !important;
  }

  .v-data-table >>> td {
    font-size: 8pt !important;
    border-bottom: 1px solid #e0e0e0 !important;
    background: transparent !important;
    padding: 4px 6px !important;
  }

  .pa-4 {
    padding: 4px !important;
  }

  .ma-4 {
    margin: 4px !important;
  }

  .v-avatar {
    -webkit-print-color-adjust: exact !important;
  }

  .v-chip {
    background-color: inherit !important;
    color: inherit !important;
    font-size: 7px !important;
    height: 16px !important;
    padding: 0 4px !important;
  }

  .page-section,
  .v-col,
  .v-row,
  .car-list-section,
  .car-list,
  .legends-container {
    border-left: none !important;
    border-right: none !important;
  }

  * {
    border-left: none !important;
    border-right: none !important;
  }

  .additional-info {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin: 0.2cm 0 0 0 !important;
    padding: 0 !important;
  }

  .car-list-section {
    orphans: 4 !important;
    widows: 4 !important;
  }

  .car-list > div:first-child {
    orphans: 3 !important;
    widows: 3 !important;
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

body > .leaflet-container:not(.print-dialog .leaflet-container),
.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom:not(.page-section.map-print .leaflet-container),
div.leaflet-container:last-of-type:not(.page-section .leaflet-container) {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  width: 0 !important;
  position: fixed !important;
  top: -9999px !important;
  left: -9999px !important;
  opacity: 0 !important;
}

.page-section.map-print .leaflet-container,
.print-dialog .leaflet-container {
  display: block !important;
  visibility: visible !important;
  height: auto !important;
  width: 100% !important;
  position: relative !important;
  opacity: 1 !important;
}
</style>