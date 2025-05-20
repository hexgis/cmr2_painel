<template>
    <div>
        <v-col class="px-4">
            <template>
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
                                v-if="
                                    currentUrlWms &&
                                    (switchAquaMM || switchAquaMT)
                                "
                                v-model="showActiveFeatures"
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
                    <v-col>
                        <v-btn
                            block
                            small
                            color="primary"
                            outlined
                            :loading="loading"
                            @click="searchFoco"
                        >
                            {{ $t('search-label') }}
                        </v-btn>
                    </v-col>
                </v-row>

                <!-- Mostrar os switches apenas após a busca -->
                <template v-if="searchPerformed">
                    <v-divider class="mt-4"></v-divider>

                    <!-- AQUA M-M Section -->
                    <v-row class="align-center mt-2">
                        <v-icon color="yellow" class="ml-1">mdi-fire</v-icon>
                        <span class="ml-1">AQUA (Sensor MODIS - Manhã)</span>
                        <v-spacer></v-spacer>
                        <v-switch
                            v-model="switchAquaMM"
                            @change="toggleLayer('aquaMM')"
                            class="ml-2"
                        ></v-switch>
                    </v-row>
                    <v-row v-if="switchAquaMM" align="center" class="mt-n6">
                        <v-col cols="4" class="grey--text text--darken-2">
                            {{ $t('opacity-label') }}
                        </v-col>
                        <v-col cols="8">
                            <v-slider
                                v-model="opacityAquaMM"
                                hide-details
                                thumb-label
                                @input="handleOpacityChange('aquaMM', $event)"
                            />
                        </v-col>
                    </v-row>

                    <!-- AQUA M-T Section -->
                    <v-row class="align-center mt-n2">
                        <v-icon color="red" class="ml-1">mdi-fire</v-icon>
                        <span class="ml-1">AQUA (Sensor MODIS - Tarde)</span>
                        <v-spacer></v-spacer>
                        <v-switch
                            v-model="switchAquaMT"
                            @change="toggleLayer('aquaMT')"
                            class="ml-2"
                        >
                        </v-switch>
                    </v-row>
                    <v-row v-if="switchAquaMT" align="center" class="mt-n6">
                        <v-col cols="4" class="grey--text text--darken-2">
                            {{ $t('opacity-label') }}
                        </v-col>
                        <v-col cols="8">
                            <v-slider
                                v-model="opacityAquaMT"
                                hide-details
                                thumb-label
                                @input="handleOpacityChange('aquaMT', $event)"
                            />
                        </v-col>
                    </v-row>
                </template>
            </template>
        </v-col>
    </div>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex'
import legend from '@/assets/legend.png'
import BaseDateField from '@/components/base/BaseDateField'

export default {
    name: 'FocoFilters',

    components: { BaseDateField },

    data() {
        const initialFilters = {
            startDate: this.$moment().subtract(30, 'days').format('YYYY-MM-DD'),
            endDate: this.$moment().format('YYYY-MM-DD'),
            currentView: false,
            cr: [],
            ti: null,
        }

        return {
            filters: JSON.parse(JSON.stringify(initialFilters)),
            checkNewFilters: false,
            isLoadingTotal: false,
            legendData: legend,
            error: false,
            flattened: [],
            dialog: false,
            switchAquaMM: false,
            switchAquaMT: false,
            opacityAquaMM: 100,
            opacityAquaMT: 100,
            searchPerformed: false,
        }
    },

    computed: {
        ...mapState('foco', ['filterOptions', 'isLoadingFeatures', 'layers']),

        showActiveFeatures: {
            get() {
                // Verifica qual camada está ativa e retorna seu status
                if (this.switchAquaMM) return this.layers.aquaMM.showFeatures
                if (this.switchAquaMT) return this.layers.aquaMT.showFeatures
                return false
            },
            set(value) {
                // Aplica apenas à camada ativa
                if (this.switchAquaMM)
                    this.setShowFeatures({
                        layer: 'aquaMM',
                        showFeatures: value,
                    })
                if (this.switchAquaMT)
                    this.setShowFeatures({
                        layer: 'aquaMT',
                        showFeatures: value,
                    })
            },
        },

        opacity: {
            get() {
                return this.layers.aquaMM.opacity
            },
            set(value) {
                this.setOpacity({ layer: 'aquaMM', opacity: value })
                this.setOpacity({ layer: 'aquaMT', opacity: value })
            },
        },

        loading() {
            return this.layers.aquaMM.loading || this.layers.aquaMT.loading
        },

        currentUrlWms() {
            return (
                this.layers.aquaMM.currentUrlWms ||
                this.layers.aquaMT.currentUrlWms
            )
        },
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
        handleOpacityChange(layer, value) {
            this.setOpacity({ layer, opacity: value })
        },

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
            if (cr) this.getTiOptions(cr)
        },

        async searchFoco() {
            const { currentView, cr, startDate, endDate } = this.filters

            if ((currentView || cr.length) && startDate && endDate) {
                this.error = false

                if (new Date(endDate) < new Date(startDate)) {
                    this.error = true
                    this.$store.commit(
                        'alert/addAlert',
                        {
                            message: this.$i18n.t(
                                'A data final deve ser maior ou igual à data inicial'
                            ),
                        },
                        { root: true }
                    )
                    return
                }

                // 1. Força o desligamento do switch (visualmente)
                this.showActiveFeatures = false

                // 2. Aplica os filtros e busca os dados
                this.setFilters({ layer: 'aquaMM', filters: this.filters })
                this.setFilters({ layer: 'aquaMT', filters: this.filters })
                await this.getFeatures('aquaMM')
                await this.getFeatures('aquaMT')

                // 3. Ativa as camadas e mostra os resultados IMEDIATAMENTE
                this.searchPerformed = true
                this.switchAquaMM = true
                this.switchAquaMT = true
                this.setShowFeatures({ layer: 'aquaMM', showFeatures: true }) // Mostra os features
                this.setShowFeatures({ layer: 'aquaMT', showFeatures: true }) // Mostra os features

                // 4. Ajusta a opacidade
                this.setOpacity({
                    layer: 'aquaMM',
                    opacity: this.opacityAquaMM,
                })
                this.setOpacity({
                    layer: 'aquaMT',
                    opacity: this.opacityAquaMT,
                })

                return
            }
            this.error = true
        },

        toggleLayer(layer) {
            if (layer === 'aquaMM') {
                if (this.switchAquaMM) {
                    this.setShowFeatures({ layer, showFeatures: true })
                } else {
                    this.setShowFeatures({ layer, showFeatures: false })
                }
            } else if (layer === 'aquaMT') {
                if (this.switchAquaMT) {
                    this.setShowFeatures({ layer, showFeatures: true })
                } else {
                    this.setShowFeatures({ layer, showFeatures: false })
                }
            }
        },

        ...mapMutations('foco', [
            'setFilters',
            'setShowFeatures',
            'setOpacity',
            'clearFeatures',
        ]),

        ...mapActions('foco', [
            'getFilterOptions',
            'getTiOptions',
            'getFeatures',
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

<i18n>
{
    "en": {
        "legend": "Legend:",
        "search-label": "Search",
        "opacity-label": "Opacity",
        "current-view-label": "Search in current area?",
        "start-date-label": "Start Date",
        "end-date-label": "End Date",
        "total-area-label": "Total Area",
        "regional-coordination-label": "Regional Coordination (All)",
        "indigenous-lands-label": "Indigenous Lands",
        "title-switch-disable-features": "Disable Foco Layer",
        "A data final deve ser maior ou igual à data inicial": "End date must be greater than or equal to start date"
    },
    "pt-br": {
        "legend": "Legenda:",
        "search-label": "Buscar",
        "opacity-label": "Opacidade",
        "current-view-label": "Pesquisar nesta área?",
        "start-date-label": "Data Início",
        "end-date-label": "Data Final",
        "total-area-label": "Área total",
        "regional-coordination-label": "Coordenação Regional (Todas)",
        "indigenous-lands-label": "Terras Indígenas",
        "title-switch-disable-features": "Desabilitar Camada de Foco",
        "A data final deve ser maior ou igual à data inicial": "A data final deve ser maior ou igual à data inicial"
    }
}
</i18n>