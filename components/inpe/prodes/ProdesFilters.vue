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
                        v-if="currentUrlWmsProdes"
                        v-model="featuresProdes"
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
                <v-select
                    v-model="filters.startYear"
                    :label="$t('start-year-label')"
                    :items="yearOptions"
                    :required="true"
                    outlined
                />
            </v-col>
            <v-col class="py-0 full-width">
                <v-select
                    v-model="filters.endYear"
                    :label="$t('end-year-label')"
                    :items="yearOptions"
                    :required="true"
                    outlined
                />
            </v-col>
        </v-row>

        <v-row no-gutters align="center" class="mt-3">
            <v-col v-if="showFeaturesProdes">
                <v-btn
                    block
                    small
                    color="primary"
                    outlined
                    :loading="loadingProdes"
                    @click="searchProdes"
                >
                    {{ $t('search-label') }}
                </v-btn>
            </v-col>
            <v-col v-if="!showFeaturesProdes">
                <v-btn
                    block
                    small
                    color="primary"
                    outlined
                    :loading="loadingProdes"
                    @click="searchProdes"
                >
                    {{ $t('search-label') }}
                </v-btn>
            </v-col>
        </v-row>
        <v-divider
            v-if="showFeaturesProdes && !isLoadingFeatures"
            class="mt-4"
        />

        <v-row
            v-if="showFeaturesProdes && !isLoadingFeatures"
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
        <v-divider></v-divider>
        <div v-if="showFeaturesProdes && !isLoadingFeatures">
            <p class="font-weight-regular pt-2 grey--text text--darken-2 mb-n6">
                {{ $t('legend') }}
            </p>
            <!-- Legenda Dinâmica para Anos Selecionados -->
            <v-row v-if="prodesStyles && legendItems.length" class="mt-2">
                <v-col>
                    <v-list dense>
                        <v-list-item
                            v-for="item in legendItems"
                            :key="item.label"
                            class="mb-n4"
                        >
                            <v-list-item-icon>
                                <span
                                    class="legend-color"
                                    :style="{
                                        backgroundColor: item.color || '#000',
                                    }"
                                ></span>
                            </v-list-item-icon>
                            <v-list-item-content class="ml-n8 mb-1">
                                <v-list-item-title>{{
                                    item.label
                                }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-col>
            </v-row>
        </div>
    </v-col>
</template>
<script>
import { mapMutations, mapState, mapActions } from 'vuex'
import legend from '@/assets/legend.png'

export default {
    name: 'ProdesFilters',

    data() {
        const currentYear = new Date().getFullYear()
        const yearOptions = []
        for (let year = 2015; year <= currentYear; year++) {
            yearOptions.push(year)
        }

        return {
            yearOptions,
            filters: {
                startYear: currentYear,
                endYear: currentYear,
                currentView: false,
                priority: null,
                cr: [],
                ti: null,
            },
            filteredYears: [],
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
                return this.$store.state.prodes.opacity
            },
            set(value) {
                this.$store.commit('prodes/setOpacity', value)
            },
        },

        featuresProdes: {
            get() {
                return this.$store.state.prodes.showFeaturesProdes
            },
            set(value) {
                this.$store.commit('prodes/setshowFeaturesProdes', value)
            },
        },

        legendItems() {
            // Verificar se prodesStyles existe
            if (!this.$store.state.prodes.prodesStyles) {
                return []
            }

            // Obter todos os anos disponíveis no prodesStyles
            const availableYears = Object.keys(
                this.$store.state.prodes.prodesStyles
            )
                .filter((year) => {
                    // Verificar se o ano está dentro do intervalo de filtros
                    const yearNum = parseInt(year)
                    return (
                        yearNum >= this.filters.startYear &&
                        yearNum <= this.filters.endYear
                    )
                })
                .map((year) => parseInt(year)) // Converter para número para ordenação correta
                .sort((a, b) => b - a) // Ordenar do maior para o menor
                .map((year) => String(year)) // Converter de volta para string se necessário

            // Mapear anos para suas cores do prodesStyles
            return this.filteredYears.map((year) => ({
                label: String(year),
                color: this.$store.state.prodes.prodesStyles[year] || '#000000',
            }))
        },

        ...mapState('prodes', [
            'currentUrlWmsProdes',
            'isLoadingFeatures',
            'loadingProdes',
            'filterOptions',
            'features',
            'showFeaturesProdes',
            'prodesStyles',
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

        'filters.startYear'(newVal) {
            if (newVal > this.filters.endYear) {
                this.filters.endYear = newVal
            }
        },
    },

    mounted() {
        this.getFilterOptions()
        this.getProdesStyleFromGeoserver()
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
            if (cr) this.$store.dispatch('prodes/getTiOptions', cr)
            else this.filters.ti = null
        },

        getYearsInRange(startYear, endYear) {
            if (!this.$store.state.prodes.prodesStyles) return []

            return Object.keys(this.$store.state.prodes.prodesStyles)
                .filter((year) => {
                    const yearNum = parseInt(year)
                    return yearNum >= startYear && yearNum <= endYear
                })
                .map((year) => parseInt(year))
                .sort((a, b) => b - a)
        },

        searchProdes() {
            const { filters } = this
            const { currentView, cr, startYear, endYear } = filters

            if ((currentView || cr.length) && startYear && endYear) {
                this.error = false

                // Converter anos para datas para o store
                const filtersForStore = {
                    ...filters,
                    startDate: `${startYear}-01-01`,
                    endDate: `${endYear}-12-31`,
                }

                // Definir os anos filtrados apenas após a busca
                this.filteredYears = this.getYearsInRange(startYear, endYear)

                this.setFilters(filtersForStore)
                this.getFeatures()
                return
            }
            this.error = true
        },

        ...mapMutations('prodes', ['setFilters']),
        ...mapActions('prodes', [
            'getFilterOptions',
            'getFeatures',
            'getProdesStyleFromGeoserver',
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

<style scoped lang="scss">
.legend-color {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 2px;
    margin-right: 8px;
}

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

<i18n>
    {
        "en": {
            "legend": "Legend:",
            "search-label": "Search",
            "opacity-label": "Opacity",
            "current-view-label": "Search in current area?",
            "start-year-label": "Start Year",
            "end-year-label": "End Year",
            "total-area-label": "Total Area",
            "regional-coordination-label": "Regional Coordination (All)",
            "indigenous-lands-label": "Indigenous Lands",
            "title-switch-disable-features": "Disable Prodes Layer"
        },
        "pt-br": {
            "legend": "Legenda:",
            "search-label": "Buscar",
            "opacity-label": "Opacidade",
            "current-view-label": "Pesquisar nesta área?",
            "start-year-label": "Ano Início",
            "end-year-label": "Ano Final",
            "total-area-label": "Área total",
            "regional-coordination-label": "Coordenação Regional (Todas)",
            "indigenous-lands-label": "Terras Indígenas",
            "title-switch-disable-features": "Desabilitar Camada de Prodes"
        }
    }
</i18n>