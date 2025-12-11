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
    <div class="page-section map-print">
      <v-row class="justify-center text-center">
        <v-col cols="6" class="logo-container logo-funai">
          <v-img
            contain
            :src="logo_funai"
            class="logo-image"
          />
        </v-col>
        <v-col cols="6" class="logo-container logo-cmr">
          <v-img
            contain
            :src="logo_cmr"
            class="logo-image"
          />
        </v-col>
        <v-col cols="12" class="mt-n4">
          <p class="text-h6">
            {{ mapTitle }}
          </p>
        </v-col>
      </v-row>

      <div>
        <v-col cols="12" class="map-container">
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
    <div class="page-section">
        <div v-if="carData.length > 0">
          <p class="mt-6">
            <strong>Cadastro Ambiental Rural (CAR)</strong>
            <v-chip  x-small>
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
              class="car-list-col"
            >
              <div class="car-list-item">

                  <v-avatar
                    :color="getCarColor(index)"
                    size="20"
                    class="car-number-avatar"
                  >
                    <span class="car-number-text">
                      {{ index + 1 }}
                    </span>
                  </v-avatar>
                  <span class="car-name">{{ getTerraIndigenaName(item) }}</span>

              </div>
            </v-col>
          </v-row>
          <v-divider class="car-list-divider" />
        </div>
      <div class="legend-header">
        <p>
          <strong>Legendas</strong>
        </p>
      </div>

      <div>
        <v-row>
          <!-- Monitoramento Diário -->
          <v-col v-if="showFeaturesMonitoring && hasActiveMonitoringStages" class="legend-column">
            <div>
              <strong class="legend-column-title">Monitoramento Diário</strong>
              <v-chip x-small color="red" text-color="white">
                {{ monitoringTICount }}
              </v-chip>
            </div>
            <hr class="styled-divider-red"/>
            <CustomizedLegend :items="monitoringItems" />
          </v-col>

          <!-- Alerta Urgente -->
          <v-col v-if="showFeaturesAlerts && hasActiveAlertsStages" class="legend-column">
            <div>
              <strong class="legend-column-title">Alerta Urgente</strong>
              <v-chip x-small color="red" text-color="white">
                {{ alertsCount }}
              </v-chip>
            </div>
            <hr class="styled-divider-red"/>
            <CustomizedLegend :items="alertsItems" />
          </v-col>

          <!-- Camadas de Sobreposição -->
          <v-col v-if="showFeaturesSupportLayers && hasVisibleSupportLayers" class="legend-column">
            <div>
              <strong class="legend-column-title">Sobreposição de camadas</strong>
            </div>
            <hr class="styled-divider" />
            <LayerList v-if="visibleUserLayers.length > 0" :layers="supportLayerUser" :is-user-layer="true" />
            <LayerList v-if="visibleSystemLayers.length > 0" :layers="supportLayers"/>
          </v-col>

          <!-- Uso e Ocupação do Solo -->
          <v-col v-if="showFeaturesLandUse" class="legend-column">
            <div>
              <strong class="legend-column-title">Uso e Ocupação do Solo</strong>
              <v-chip x-small color="green" text-color="white">
                {{ tableLandUse.length }}
              </v-chip>
            </div>
            <hr class="styled-divider" />
            <CustomizedLegend :items="landUseItems" />
          </v-col>

          <!-- INPE - Prodes -->
          <v-col v-if="showFeaturesProdes" class="legend-column">
            <div>
              <strong class="legend-column-title">INPE - Prodes</strong>
            </div>
            <hr class="styled-divider" />
            <CustomizedLegend :items="prodesItems" />
          </v-col>

          <!-- INPE - Deter -->
          <v-col v-if="showFeaturesDeter" class="legend-column">
            <div>
              <strong class="legend-column-title">INPE - Deter</strong>
            </div>
            <hr class="styled-divider" />
            <CustomizedLegend :items="deterItems" />
          </v-col>

          <!-- INPE - Focos de Calor -->
          <v-col v-if="showFeaturesAquaMM || showFeaturesAquaMT" class="legend-column">
            <div>
              <strong class="legend-column-title">INPE - Focos de Calor</strong>
            </div>
            <hr class="styled-divider" />
            <CustomizedLegend :items="filteredHeatFocusItems" />
          </v-col>
        </v-row>
      </div>
      <v-divider class="car-list-divider" />
    </div>
    <div class="page-section car-table-section">
      <div v-if="carData.length > 0">
        <div class="legend-header">
          <p>
            <strong>Imóveis CAR Encontrados ({{ carData.length }})</strong>
          </p>
        </div>

        <v-simple-table class="car-data-table">
          <template #default>
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Terra Indígena</th>
                <th>Município</th>
                <th>UF</th>
                <th>Etnia</th>
                <th>Área (ha)</th>
                <th>Situação</th>
                <th>Condição do Imóvel</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(car, index) in carData" :key="index">
                <td>
                  <v-avatar :color="getCarColor(index)" size="24" class="table-avatar">
                    <span class="avatar-text">{{ index + 1 }}</span>
                  </v-avatar>
                </td>
                <td class="code-cell">{{ car.properties?.co_imovel || '-' }}</td>
                <td class="ti-cell">{{ getTerraIndigenaName(car) }}</td>
                <td class="municipio-cell">{{ getMunicipioName(car) }}</td>
                <td class="status-cell">{{ car.properties?.sg_uf || '-' }}</td>
                <td class="status-cell">{{ car.properties?.no_etnia || '-' }}</td>
                <td class="area-cell">{{ formatNumber(car.properties?.nu_area_ha || car.properties?.area_ha) }}</td>
                <td class="status-cell">{{ car.properties?.tp_situacao || '-' }}</td>
                <td class="status-cell">{{ car.properties?.ds_condicao_imovel || '-' }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
        <v-divider class="car-list-divider" />
      </div>
    </div>
    <div class="page-section compact-text-section">
      <div class="compact-text">
        <p class="mb-2 mt-2">
          {{ $t('geodetic-system-info-part1') }}
          <strong>{{ $t('geodetic-system-info-strong') }}</strong>
          {{ $t('geodetic-system-info-part2') }}
        </p>

        <div v-for="layerCategory in layerCategories" :key="`${layerCategory.name}-${layerCategory.type}`">
          <v-divider class="my-3" />
          <p class="font-weight-bold mb-2">Bases Cartográficas:</p>
          <div v-for="(layer, layerId) in layerCategory.layers" :key="layerId">
            <p v-if="layer && layer.visible" class="mb-1">
              <strong>{{ layer.name || '-' }}.</strong>
              Fonte: {{ layer.fonte || '-' }}, Data de atualização:
              {{ handleData(layer.dt_atualizacao) }}.
            </p>
          </div>
        </div>

        <v-divider class="my-3" />

        <div v-for="(feature, index) in activePrintFeatures" :key="feature.key || index" class="mb-1">
          <p>
            {{ $t(feature.label) }}
            <span v-if="feature.type === 'date-range'" class="ml-1">
              {{ handleData(feature.startDate) }} {{ $t('and') }} {{ handleData(feature.endDate) }}
            </span>
            <span v-else-if="feature.type === 'years-list' && feature.years.length > 0" class="ml-1">
              {{ feature.years.join(', ') }}
            </span>
            <span v-else-if="feature.type === 'single-year'" class="ml-1">
              {{ feature.yearHandler() }}
            </span>
          </p>
        </div>

        <v-divider class="my-3" />

        <p class="mb-1">{{ $t('text-address0') }}</p>
        <p class="mb-1">{{ $t('text-address') }} {{ todayDate() }}</p>

        <v-divider class="my-3" />

        <p class="mb-1">{{ $t('author-label') }}</p>
        <p class="mb-1">{{ $t('text-info') }}</p>
        <p class="mb-1">{{ $t('text-format') }} {{ leafSize.type }}.</p>
      </div>
    </div>
  </BaseModal>
</template>

<i18n>
{
  "en": {
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
    "aqua-afternoon": "Aqua Modis Tarde",
    "geodetic-system-info-part1": "The geospatial information presented in this report is referenced to the geodetic system in geographic coordinates",
    "geodetic-system-info-strong": "SIRGAS2000 (EPSG:4674)",
    "geodetic-system-info-part2": ". All coordinates, measurements and cartographic representations follow this datum."
  },
  "pt-br": {

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

.logo-container {
  display: flex;
  align-items: flex-end;
}

.logo-funai {
  justify-content: flex-end;
}

.logo-image {
  max-width: 120px;
  max-height: 60px;
}

.logo-cmr .logo-image {
  max-width: 180px;
}

.map-container {
  margin-top: -24px;
  height: 70vh;
  border-radius: 4px;
  position: relative;
}

.mini-map-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 200px;
  height: 150px;
  z-index: 1000;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  margin-top: 15px;
}

.car-number-text {
  color: white;
  font-weight: bold;
  font-size: 10px;
}

.car-name {
  font-size: 10px;
}

.car-list-divider {
  margin-top: 12px;
  margin-bottom: 12px;
}

.legend-column {
  min-width: 200px;
  max-width: 200px;
}

.legend-column-title {
  font-size: 12px;
}

.styled-divider {
  border: 1px solid #e0e0e0;
  margin: 4px 0 8px 0;
}

.styled-divider-red {
  border: 1px solid #f44336;
  margin: 4px 0 8px 0;
}

.car-data-table >>> th {
  font-size: 10px;
  font-weight: bold;
  color: white !important;
  background-color: #d92b3f;
}

.car-data-table >>> td {
  font-size: 10px !important;
}

.avatar-text {
  color: white;
  font-weight: bold;
}

.compact-text-section {
    page-break-before: always !important;
    page-break-inside: avoid !important;
    break-before: page !important;
    break-inside: avoid !important;
    margin-top: 15px;
    min-height: auto !important;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

.compact-text {
  font-size: 10px;
  line-height: 1.4;
  padding: 0.5cm 0.8cm;
}

.compact-text p {
  margin-bottom: 4px;
}

.mb-1 { margin-bottom: 4px !important; }
.mb-2 { margin-bottom: 8px !important; }
.my-3 { margin-top: 12px !important; margin-bottom: 12px !important; }
.ml-1 { margin-left: 4px !important; }

@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  @page {
    margin: 0.3cm !important;
    size: landscape;
  }

  html, body {
    height: auto !important;
    min-height: auto !important;
  }

  .no-print {
    display: none !important;
  }

  .map-container {
    width: 100% !important;
    height: 640px !important;
    min-height: 500px !important;
    max-height: 650px !important;
    padding: 0 !important;
    margin: 0 !important;
    position: relative !important;
  }

  .car-list-col {
    flex: 0 0 33.333333% !important;
    max-width: 33.333333% !important;
    width: 33.333333% !important;
  }

  .car-number-text {
    font-size: 12px !important;
    line-height: 20px !important;
  }

  .legends-row .legend-column {
    flex: 0 0 calc(50% - 8px) !important;
    max-width: calc(50% - 8px) !important;
    min-width: 180px !important;
  }

  .page-section.car-table-section {
    page-break-before: always !important;
    padding: 0.1cm 0.3cm 0.3cm 0.3cm !important;
    margin: 0 !important;
  }

  .page-section.map-print + .page-section {
    padding-inline: 15px !important;
  }


  .compact-text-section {
    page-break-before: always !important;
    page-break-inside: avoid !important;
    break-before: page !important;
    break-inside: avoid !important;
    margin-top: 0.5cm;
    min-height: auto !important;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .compact-text {
    padding: 15px !important;
    width: 100%;
    height: auto;
  }

  .compact-text-section * {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
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

.page-section {
  width: 100%;
  box-sizing: border-box;
}
</style>
