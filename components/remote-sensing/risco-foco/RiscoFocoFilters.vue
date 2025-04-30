<template>
    <v-col class="px-4">
        <v-row>
            <v-col cols="9">
                <v-checkbox
                    v-model="filters.currentView"
                    :label="$t('current-view-label')"
                    :error="error"
                    hide-details
                />
            </v-col>
            <v-col cols="3">
                <div class="d-flex justify-end align-center mt-1">
                    <v-switch
                        v-if="currentUrlWmsMonitoring"
                        v-model="featuresMonitoring"
                        class="mt-3"
                        hide-details
                        :title="$t('title-switch-disable-features')"
                    />
                </div>
            </v-col>
            <v-col cols="12">
                <v-combobox
                    v-model="filters.cr"
                    :label="$t('regional-coordination-label')"
                    :items="flattened"
                    item-value="co_cr"
                    item-text="ds_cr"
                    hide-details
                    clearable
                    multiple
                    :error="error"
                    class="pa-0"
                    outlined
                />
            </v-col>
            <v-col cols="12">
                <v-slide-y-transition>
                    <v-combobox
                        v-if="filters.cr && filterOptions.tiFilters"
                        v-model="filters.ti"
                        :label="$t('indigenous-lands-label')"
                        :items="filterOptions.tiFilters"
                        item-text="no_ti"
                        item-value="co_funai"
                        hide-details
                        multiple
                        clearable
                        class="pa-0"
                        outlined
                    />
                </v-slide-y-transition>
            </v-col>
        </v-row>
        <v-row class="pt-3">
            <v-col class="py-0 full-width">
                <BaseDateField
                    v-model="filters.startDate"
                    :label="$t('start-date-label')"
                    :required="true"
                    outlined
                    :min-date="'2015-01-01'"
                />
            </v-col>
            <v-col class="py-0 full-width">
                <BaseDateField
                    v-model="filters.endDate"
                    :label="$t('end-date-label')"
                    :required="true"
                    outlined
                    :min-date="'2015-01-01'"
                />
            </v-col>
        </v-row>
        <v-row no-gutters align="center" class="mt-3">
            <v-col v-show="showFeaturesMonitoring">
                <!-- Button Download -->
                <DialogConfirmDownload />

                <v-btn
                    :loading="isLoadingStatistic"
                    small
                    color="accent"
                    icon
                    @click="showTableDialogAnalytics(true), (dialog = true)"
                >
                    <v-tooltip left>
                        <template #activator="{ on }">
                            <v-icon v-on="on"> mdi-chart-box </v-icon>
                        </template>
                        <span>{{ $t('statistics-label') }}</span>
                    </v-tooltip>
                </v-btn>

                <v-btn
                    small
                    :loading="loadingSearchTableMonitoring"
                    color="accent"
                    icon
                    @click="setShowTableDialogMonitoring(true)"
                >
                    <v-tooltip left>
                        <template #activator="{ on }">
                            <v-icon v-on="on"> mdi-table </v-icon>
                        </template>
                        <span>{{ $t('table-label') }}</span>
                    </v-tooltip>
                </v-btn>
            </v-col>
            <v-col v-if="showFeaturesMonitoring" class="ml-5">
                <v-btn
                    block
                    small
                    color="primary"
                    outlined
                    :loading="loadingMonitoring"
                    @click="searchMonitoring"
                >
                    {{ $t('search-label') }}
                </v-btn>
            </v-col>
            <v-col v-if="!showFeaturesMonitoring">
                <v-btn
                    block
                    small
                    color="primary"
                    outlined
                    :loading="loadingMonitoring"
                    @click="searchMonitoring"
                >
                    {{ $t('search-label') }}
                </v-btn>
            </v-col>
        </v-row>
        <v-divider
            v-if="showFeaturesMonitoring && !isLoadingFeatures"
            class="mt-4"
        />

        <div v-if="isLoadingFeatures" class="mt-1">
            <v-row no-gutters justify="center">
                <v-col cols="6">
                    <v-skeleton-loader type="table-cell@4" />
                </v-col>
                <v-col cols="6">
                    <div class="d-flex justify-end">
                        <v-skeleton-loader type="table-cell@4" />
                    </div>
                </v-col>
            </v-row>
            <v-divider class="mt-1" />
            <div>
                <v-skeleton-loader type="table-cell" />
                <v-row
                    v-for="n in 4"
                    :key="n"
                    no-gutters
                    align="center"
                    class="mb-4"
                >
                    <v-col cols="1">
                        <v-skeleton-loader
                            width="20"
                            height="20"
                            tile
                            type="avatar"
                        />
                    </v-col>

                    <v-col cols="10">
                        <v-skeleton-loader type="text" />
                    </v-col>
                </v-row>
            </div>
        </div>

        <v-row
            v-if="showFeaturesMonitoring && total && !isLoadingFeatures"
            class="mt-3"
        >
            <v-col cols="7" class="grey--text text--darken-2 text-label">
                {{ $t('polygon-label') }}:
            </v-col>
            <v-col cols="5" class="text-right grey--text text--darken-2">
                {{ total.total }}
            </v-col>
        </v-row>

        <v-row
            v-if="
                showFeaturesMonitoring &&
                total &&
                total.area_ha &&
                !isLoadingFeatures
            "
        >
            <v-col cols="7" class="grey--text text--darken-2">
                {{ $t('total-area-label') }}:
            </v-col>
            <v-col cols="5" class="text-right grey--text text--darken-2">
                {{
                    total.area_ha.toLocaleString($i18n.locale, {
                        maximumFractionDigits: 2,
                    })
                }}
                ha
            </v-col>
        </v-row>
        <v-row
            v-if="showFeaturesMonitoring && !isLoadingFeatures"
            align="center"
            class="mt-2"
        >
            <v-col cols="4" class="grey--text text--darken-2">
                {{ $t('opacity-label') }}
            </v-col>
            <v-col cols="8">
                <v-slider v-model="opacity" hide-details thumb-label />
            </v-col>
        </v-row>
        <v-row
            v-if="showFeaturesMonitoring && !isLoadingFeatures"
            align="center"
            justify="space-between"
        >
            <v-col>
                <span class="grey--text text--darken-2">
                    {{ $t('heat-map-label') }}
                </span>
            </v-col>
            <v-col cols="3" class="d-flex justify-end">
                <v-switch
                    v-model="heatMap"
                    class="mt-0 pt-0"
                    :loading="loadingHeatmap"
                    :disabled="loadingHeatmap"
                    hide-details
                />
            </v-col>
        </v-row>
        <div v-if="showTableDialogMonitoring" class="d-none">
            <TableProperties />
        </div>
        <div v-if="dialog" class="d-none">
            <AnalyticalDialog
                :value="analyticsMonitoringDialog"
                :close-dialog="closeAnalyticalDialog"
            />
        </div>
    </v-col>
</template>
  
  <i18n>
  {
      "en": {
          "search-label": "Search",
          "opacity-label": "Opacity",
          "current-view-label": "Search in current area?",
          "start-date-label": "Start Date",
          "end-date-label": "End Date",
          "total-area-label": "Total Area",
          "heat-map-label": "Heat Map",
          "polygon-label": "Polygon Count",
          "table-name": "Monitoring Table",
          "regional-coordination-label": "Regional Coordination (All)",
          "indigenous-lands-label": "Indigenous Lands",
          "download-label": "Download",
          "statistics-label": "Statistics",
          "table-label": "Table",
          "title-switch-disable-features": "Disable Monitoring Layer"
      },
      "pt-br": {
          "search-label": "Buscar",
          "opacity-label": "Opacidade",
          "current-view-label": "Pesquisar nesta área?",
          "start-date-label": "Data Início",
          "end-date-label": "Data Final",
          "total-area-label": "Área total",
          "heat-map-label": "Mapa de Calor",
          "polygon-label": "Total de polígonos",
          "table-name": "Tabela de Monitoramento",
          "regional-coordination-label": "Coordenação Regional (Todas)",
          "indigenous-lands-label": "Terras Indígenas",
          "download-label": "Baixar",
          "statistics-label": "Estatísticas",
          "table-label": "Tabela",
          "title-switch-disable-features": "Desabilitar Camada de Monitoramento"
      }
  }
  </i18n>
  
  <script>
import { mapMutations, mapState, mapActions } from 'vuex'
import BaseDateField from '@/components/base/BaseDateField'
import legend from '@/assets/legend.png'
//import TableDialog from '@/components/table-dialog/TableDialog.vue';
//import AnalyticalDialog from '../analytical-dialog/AnalyticalDialog.vue';
//import TableProperties from './TableProperties.vue';
//import DialogConfirmDownload from '@/components/monitoring/DialogConfirmDownload.vue';

export default {
    name: 'RiscoFocoFilters',

    components: {
        BaseDateField,
        // TableDialog,
        // AnalyticalDialog,
        // TableProperties,
        // DialogConfirmDownload,
    },

    data() {
        return {
            isGeoserver: process.env.MONITORING_GEOSERVER === 'true',
            filters: {
                startDate: this.$moment().format('YYYY-MM-DD'),
                endDate: this.$moment().format('YYYY-MM-DD'),
                currentView: false,
                priority: null,
                cr: [],
                ti: null,
            },
            headers: [
                { text: 'Código Funai', value: 'co_funai' },
                { text: 'Terra Indígena', value: 'no_ti' },
                { text: 'Coordenação Regional', value: 'ds_cr' },
                { text: 'Classe', value: 'no_estagio' },
                { text: 'Data da Imagem', value: 'dt_imagem' },
                { text: 'Área do Polígono (ha)', value: 'nu_area_ha' },
                { text: 'Latitude', value: 'nu_latitude' },
                { text: 'Longitude', value: 'nu_longitude' },
            ],
            checkNewFilters: false,
            isLoadingTotal: false,
            legendData: legend,
            error: false,
            flattened: [],
            dialog: false,
        }
    },

    computed: {
        opacity: {
            get() {
                return this.$store.state.monitoring.opacity
            },

            set(value) {
                this.$store.commit('monitoring/setOpacity', value)
            },
        },

        heatMap: {
            get() {
                return this.$store.state.monitoring.heatMap
            },

            set(value) {
                this.$store.dispatch(
                    'monitoring/generateHeatmapMonitoring',
                    value
                )
            },
        },

        featuresMonitoring: {
            get() {
                return this.$store.state.monitoring.showFeaturesMonitoring
            },

            set(value) {
                this.$store.commit(
                    'monitoring/setshowFeaturesMonitoring',
                    value
                )
            },
        },

        ...mapState('monitoring', [
            'currentUrlWmsMonitoring',
            'isLoadingFeatures',
            'loadingSearchTableMonitoring',
            'loadingMonitoring',
            'filterOptions',
            'features',
            'showFeaturesMonitoring',
            'total',
            'analyticsMonitoring',
            'isLoadingGeoJson',
            'showTableDialogMonitoring',
            'tableMonitoring',
            'isLoadingTableMonitoring',
            'isLoadingCSVMonitoring',
            'isLoadingStatistic',
            'analyticsMonitoringDialog',
            'loadingHeatmap',
        ]),
    },

    watch: {
        'filters.cr': function (value) {
            const arrayCrPoulate = []
            Object.values(value).forEach((item) => {
                arrayCrPoulate.push(item.co_cr)
            })
            this.populateTiOptions(arrayCrPoulate)
        },

        'filterOptions.regionalFilters': function () {
            this.populateCrOptions()
        },
    },

    mounted() {
        this.getFilterOptions()
    },

    methods: {
        populateCrOptions() {
            const groups = {}

            this.filterOptions.regionalFilters.forEach((x) => {
                groups[x.no_regiao] = groups[x.no_regiao] || {
                    ds_cr: x.ds_cr,
                    list: [],
                }

                groups[x.no_regiao].list.push(x)
            })

            Object.keys(groups).forEach((categoryId) => {
                const category = groups[categoryId]
                const categoryRegiao = categoryId
                this.flattened.push({ header: categoryRegiao })
                this.flattened.push(...category.list)
            })

            return this.flattened
        },

        populateTiOptions(cr) {
            if (cr) this.$store.dispatch('monitoring/getTiOptions', cr)
            else this.filters.ti = null
        },

        closeAnalyticalDialog(value) {
            this.dialog = value
        },

        closeTable(value) {
            this.setShowTableDialogMonitoring(value)
            if (this.checkNewFilters) {
                // this.setshowTableDialog(value);
                this.getFeatures()
                this.checkNewFilters = false
            }
        },

        showTableDialogAnalytics(value) {
            if (this.currentUrlWmsMonitoring) {
                this.setanalyticsMonitoringDialog(value)
                this.getDataAnalyticsMonitoringByFunaiYear()
            }
        },

        searchMonitoring() {
            const { filters } = this
            const { currentView, cr, startDate, endDate } = filters

            if ((currentView || cr.length) && startDate && endDate) {
                const minDate = new Date('2015-01-01')
                const start = new Date(startDate)
                if (start < minDate) {
                    this.error = true
                    return
                }
                this.error = false
                this.setFilters(filters)
                if (this.showTableDialogMonitoring) {
                    this.$store.dispatch(
                        'monitoring/getPropertiesTableMonitoring'
                    )
                }
                this.$emit('onSearch')
                return
            }
            this.error = true
        },
        ...mapMutations('monitoring', [
            'setFilters',
            'setLoadingTable',
            'setLoadingStatistic',
            'setanalyticsMonitoringDialog',
            'setShowTableDialogMonitoring',
        ]),
        ...mapActions('monitoring', [
            'getFilterOptions',
            'getFeatures',
            'getDataAnalyticsMonitoringByDay',
            'downloadGeoJsonMonitoring',
            'downloadTableMonitoring',
            'getDataTableMonitoring',
            'getDataAnalyticsMonitoringByFunaiYear',
        ]),
    },
}
</script>
  
  <style scoped lang="scss">
@media (max-width: 768px) {
    .full-width {
        flex: 0 0 100%;
        max-width: 100%;
    }

    .text-label {
        font-size: 0.8rem;
        padding-right: 0px;
    }
}
</style>
  