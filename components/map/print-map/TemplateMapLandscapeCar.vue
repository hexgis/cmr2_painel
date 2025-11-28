<template>
  <BaseModal
    :value="value"
    @close="$emit('close')"
  >
     <!-- <v-toolbar dense class="print-dialog-header no-print" color="primary">
            <v-btn icon x-small color="white" class="close-btn mb-4" @click="$emit('close')">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-toolbar> -->

        <div style="background-color: #fff; height: 50vh;" class="teste-print">
          <!-- break pages in window.print -->
          <div v-for="n in 30" :key="n" class="page-break">
            <h2>Página {{ n }}</h2>
            <p>{{ n }} - Este é um exemplo de texto para demonstrar a impressão com quebra de página.</p>
            <p>Conteúdo adicional da página {{ n }}...</p>
          </div>
        </div>
  </BaseModal>

  <!-- <v-dialog v-model="showDialog" width="1230px" @click:outside="$emit('close')">



    </v-dialog> -->
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
import { mapState, mapActions } from 'vuex'
import MapForPrint from './MapForPrint.vue'
import MiniMap from './MiniMap.vue'
import LayerList from './LayerListActive.vue'
import CustomizedLegend from './CustomizedLegendActive.vue'
import BaseModal from '../../base/BaseModal.vue';

export default {
    name: 'PrintTemplateMapLandscape',
    components: {
        MapForPrint,
        MiniMap,
        LayerList,
        CustomizedLegend,
        BaseModal,
    },

    props: {
        value: {
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
            '#FF6B6B',
            '#4ECDC4',
            '#45B7D1',
            '#96CEB4',
            '#FFEAA7',
            '#DDA0DD',
            '#98D8C8',
            '#F7DC6F',
            '#BB8FCE',
            '#85C1E9',
            '#F8C471',
            '#82E0AA',
            '#F1948A',
            '#85C1E9',
            '#D7BDE2',
            '#F9E79F',
            '#A9DFBF',
            '#F5B7B1',
            '#AED6F1',
            '#E8DAEF',
            '#A3E4D7',
            '#FAD7A0',
            '#D2B4DE',
            '#A9CCE3',
            '#F9E79F',
            '#ABEBC6',
        ],
    }),

    computed: {
        filteredHeatFocusItems() {
            const { showFeaturesAquaMM, showFeaturesAquaMT } = this
            return this.heatFocusItems.filter(
                (item) =>
                    (item.label === 'Aqua Modis Manhã' && showFeaturesAquaMM) ||
                    (item.label === 'Aqua Modis Tarde' && showFeaturesAquaMT)
            )
        },

        activePrintFeatures() {
            const features = []
            const conditions = [
                {
                    condition: this.showFeaturesMonitoring,
                    type: 'date-range',
                    label: 'monitoring-print-label',
                    startDate: this.monitoringFilters?.startDate,
                    endDate: this.monitoringFilters?.endDate,
                },
                {
                    condition: this.showFeaturesAlerts,
                    type: 'date-range',
                    label: 'alerts-print-label',
                    startDate: this.alertsFilters?.startDate,
                    endDate: this.alertsFilters?.endDate,
                },
                {
                    condition: this.showFeaturesLandUse && this.uniqueYears.length > 0,
                    type: 'years-list',
                    label: 'land-use-print-label',
                    years: this.uniqueYears,
                },
                {
                    condition: this.showFeaturesProdes,
                    type: 'single-year',
                    label: 'prodes-print-label',
                    yearHandler: this.handleProdesYear,
                },
                {
                    condition: this.showFeaturesDeter,
                    type: 'date-range',
                    label: 'deter-print-label',
                    startDate: this.deterFilters?.startDate,
                    endDate: this.deterFilters?.endDate,
                },
                {
                    condition: this.showFeaturesAquaMM || this.showFeaturesAquaMT,
                    type: 'date-range',
                    label: 'heat-focus-print-label',
                    startDate: this.focoFilters?.startDate,
                    endDate: this.focoFilters?.endDate,
                },
            ]

            return conditions.filter((item) => item.condition).map(({ condition, ...rest }) => rest)
        },

        hasActiveMonitoringStages() {
            return Object.values(this.legendVisibility).some((visible) => visible)
        },

        hasActiveAlertsStages() {
            return Object.values(this.legendVisibilityalerts).some((visible) => visible)
        },

        monitoringCount() {
            return this.tableMonitoring?.length || 0
        },

        alertsCount() {
            return this.tableAlerts?.length || 0
        },

        uniqueYears() {
            if (!Array.isArray(this.tableLandUse)) return []
            const years = this.tableLandUse.map((item) => item.nu_ano)
            return [...new Set(years)]
        },

        showDialog() {
            return this.showDialogLandscape
        },

        hasVisibleSupportLayers() {
            if (!this.showFeaturesSupportLayers) return false

            const systemLayersVisible =
                this.supportLayers &&
                Object.values(this.supportLayers).some((layer) => layer && layer.visible)

            const userLayersVisible =
                this.supportLayerUser &&
                Object.values(this.supportLayerUser).some((layer) => layer && layer.visible)

            return systemLayersVisible || userLayersVisible
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
                        type: 'system',
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
                        type: 'user',
                    })
                }
            }

            return categories
        },

        // Computed properties simplificadas usando métodos
        showFeaturesAquaMM() {
            return this.isLayerActive('aquaMM')
        },

        showFeaturesAquaMT() {
            return this.isLayerActive('aquaMT')
        },

        featuresAquaMM() {
            return this.getLayerFeatures('aquaMM')
        },

        featuresAquaMT() {
            return this.getLayerFeatures('aquaMT')
        },

        focoFilters() {
            return this.layers?.aquaMM?.filters || {}
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
                if (JSON.stringify(newData) === JSON.stringify(oldData)) return

                if (newData?.length > 0) {
                    if (this.printMap) {
                        console.log('🗺️ Recebidos dados CAR para exibir:', newData.length)
                        this.$nextTick(() => {
                            this.displayCAROnMap(newData)
                        })
                    } else {
                        console.log('⏳ Dados CAR recebidos, aguardando mapa...')
                    }
                } else {
                    this.removeCARFromMap()
                }
            },
            immediate: true,
            deep: true,
        },
    },

    async mounted() {
        const promises = []

        if (this.showFeaturesMonitoring && this.getDataTableMonitoring) {
            promises.push(this.getDataTableMonitoring())
        }
        if (this.showFeaturesLandUse && this.getDataTableLandUse) {
            promises.push(this.getDataTableLandUse())
        }
        if (this.showFeaturesAlerts && this.getDataTableAlerts) {
            promises.push(this.getDataTableAlerts())
        }

        await Promise.all(promises)
        this.updateSelectedItemsCount()
    },

    beforeDestroy() {
        this.removeCARFromMap()
        this.printMap = null
        this.carLayer = null
    },

    methods: {
        // Métodos auxiliares para layers
        isLayerActive(layerName) {
            return this.layers?.[layerName]?.showFeatures || false
        },

        getLayerFeatures(layerName) {
            return this.layers?.[layerName]?.features || null
        },

        getMunicipioName(carItem) {
            if (carItem.properties?.no_municipio_car) {
                return carItem.properties.no_municipio_car
            }
            if (carItem.properties?.no_municipio) {
                return carItem.properties.no_municipio
            }
            return '-'
        },

        getCarColor(index) {
            return this.CAR_COLORS[index % this.CAR_COLORS.length]
        },

        getTerraIndigenaName(carItem) {
            if (carItem.properties && carItem.properties.no_terra_indigena) {
                return carItem.properties.no_terra_indigena
            }
            if (carItem.no_terra_indigena) {
                return carItem.no_terra_indigena
            }
            if (carItem.properties && carItem.properties.nome) {
                return carItem.properties.nome
            }
            return 'Nome não disponível'
        },

        formatNumber(value) {
            if (value == null || value === '') return '-'

            try {
                const num =
                    typeof value === 'string'
                        ? parseFloat(value.replace(/\./g, '').replace(',', '.'))
                        : Number(value)

                if (isNaN(num)) return '-'

                // Verificar se é inteiro
                if (Number.isInteger(num)) {
                    return num.toLocaleString('pt-BR')
                }

                // Para decimais
                const formatted = num.toLocaleString('pt-BR', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                })

                return formatted
            } catch {
                return '-'
            }
        },

        onMapReady(map) {
            console.log('🗺️ Mapa de impressão pronto!')
            this.printMap = map

            if (this.carData && this.carData.length > 0) {
                this.$nextTick(() => {
                    this.displayCAROnMap(this.carData)
                })
            }
        },

        displayCAROnMap(features) {
            try {
                // Validar features
                if (!Array.isArray(features) || features.length === 0) {
                    console.warn('⚠️ Nenhum dado CAR válido para exibir')
                    return
                }

                console.log('🗺️ Adicionando CAR ao mapa de impressão...')
                console.log('📋 Dados CAR recebidos:', features)

                if (!this.printMap) {
                    console.error('❌ Mapa de impressão ainda não está pronto')
                    return
                }

                this.removeCARFromMap()

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

                    const layer = L.geoJSON(feature, {
                        style: carStyle,
                    })

                    const center = layer.getBounds().getCenter()

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
                    })

                    return L.layerGroup([layer, numberMarker])
                })

                this.carLayer = L.layerGroup(carLayers)
                this.carLayer.addTo(this.printMap)

                console.log(
                    `✅ ${features.length} CARs adicionados ao mapa de impressão com números!`
                )

                const allLayers = carLayers.flatMap((layerGroup) => layerGroup.getLayers())
                const group = L.featureGroup(allLayers)
                this.printMap.fitBounds(group.getBounds().pad(0.1))
            } catch (error) {
                console.error('❌ Erro ao exibir CAR no mapa de impressão:', error)
            }
        },

        removeCARFromMap() {
            if (this.carLayer && this.printMap) {
                this.printMap.removeLayer(this.carLayer)
                this.carLayer = null
                console.log('🗑️ CAR removido do mapa de impressão')
            }
        },

        updateSelectedItemsCount() {
            this.selectedItemsCount = Math.max(
                this.tableMonitoring?.length || 0,
                this.tableAlerts?.length || 0,
                this.tableLandUse?.length || 0
            )
        },

        handleProdesYear() {
            const { prodesFilters } = this
            if (!prodesFilters) return '-'
            if (prodesFilters.startYear === prodesFilters.endYear) {
                return prodesFilters.startYear
            }
            return `${prodesFilters.startYear} ${this.$t('and')} ${prodesFilters.endYear}`
        },

        handleData(data) {
            if (!data || typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
                console.warn('Data inválida:', data)
                return 'Data indisponível'
            }
            const [year, month, day] = data.split('-')
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
        },

        todayDate() {
            const date = new Date()
            const dd = date.getDate()
            const mm = date.getMonth() + 1
            const yyyy = date.getFullYear()
            return `${dd < 10 ? `0${dd}` : dd}/${mm < 10 ? `0${mm}` : mm}/${yyyy}`
        },

        updateBounds(bounds) {
            this.currentBouldMap = bounds
        },

        getCenter(center) {
            this.mapCenter = center
        },

        getZoom(zoom) {
            this.mainZoom = zoom
        },

        adjustMapSizeForPrint(tamanho) {
            const mapDimensions = this.getMapDimensions(tamanho)
            const mapContainer = document.getElementById('map-for-print-container')
            if (mapContainer) {
                mapContainer.style.width = `${mapDimensions.width}px`
                mapContainer.style.height = `${mapDimensions.height}px`
            }
        },

        getMapDimensions(tamanho) {
            switch (tamanho) {
                case 'A4':
                    return { width: 1105, height: 770 }
                case 'A3':
                    return { width: 1450, height: 800 }
                default:
                    return { width: 210, height: 297 }
            }
        },

        print() {
            // Salvar o estado atual
            const originalBodyStyle = document.body.style.cssText
            const originalContainerStyle =
                document.getElementById('map-for-print-container').style.cssText

            // Aplicar ajustes para impressão
            this.adjustMapSizeForPrint(this.leafSize.type)

            // Adicionar evento para restaurar estado após impressão
            const afterPrint = () => {
                this.restoreStyles(originalBodyStyle, originalContainerStyle)
                window.removeEventListener('afterprint', afterPrint)
            }

            window.addEventListener('afterprint', afterPrint)

            // Forçar reflow e impressão
            this.$nextTick(() => {
                setTimeout(() => {
                    window.print()
                }, 1000) // Aumentei o tempo para garantir que tudo esteja renderizado
            })
        },

        restoreStyles(bodyStyle, containerStyle) {
            document.body.style.cssText = bodyStyle
            const mapContainer = document.getElementById('map-for-print-container')
            if (mapContainer) {
                mapContainer.style.cssText = containerStyle
            }
            this.$forceUpdate()
        },

        restoreStyles(bodyStyle, containerStyle) {
            // Restaurar estilos originais
            document.body.style.cssText = bodyStyle
            const mapContainer = document.getElementById('map-for-print-container')
            if (mapContainer) {
                mapContainer.style.cssText = containerStyle
            }

            // Forçar redraw dos componentes Vue
            this.$forceUpdate()
        },

        ...mapActions('monitoring', ['getDataTableMonitoring']),
        ...mapActions('land-use', ['getDataTableLandUse']),
        ...mapActions('urgent-alerts', ['getDataTableAlerts']),
    },
}
</script>

<style scoped>
@media print {
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .map-container {
      display: none !important;
    }

    .page-break {
        page-break-after: always;
        break-after: page;
        min-height: 100vh;
        padding: 20px;
        box-sizing: border-box;
    }

    .page-break:last-child {
        page-break-after: avoid;
        break-after: avoid;
    }

    @page {
        margin: 10px;
        size: landscape;
    }

    .no-print {
        display: none !important;
    }
}
</style>
