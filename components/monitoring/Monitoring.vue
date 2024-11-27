<template>
    <div>
        <div>
            <MonitoringFilter @onSearch="search()" />
            <ShowDialog />
        </div>
        <div v-if="showFeaturesMonitoring && !isLoadingFeatures" class="mx-4">
            <v-divider />
            <p class="font-weight-regular pt-2 grey--text text--darken-2">
                {{ $t('legend') }}
            </p>
            <v-col class="grey--text text--darken-2">
                <v-row>
                    <v-col>
                        <v-icon class="mr-2" color="#990099">
                            mdi-square
                        </v-icon>
                        <span class="grey--text text--darken-2">
                            {{ $t('recovery-deforestation') }}
                        </span>
                    </v-col>
                    <v-col cols="3" class="px-0 d-flex justify-end">
                        <v-switch v-model="dr" class="mt-0 pt-0" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-icon class="mr-2" color="#b35900">
                            mdi-square
                        </v-icon>
                        <span class="grey--text text--darken-2">
                            {{ $t('forest-fire') }}
                        </span>
                    </v-col>
                    <v-col cols="3" class="px-0 d-flex justify-end">
                        <v-switch v-model="ff" class="mt-0 pt-0" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-icon class="mr-2" color="#ff8000">
                            mdi-square
                        </v-icon>

                        <span class="grey--text text--darken-2">
                            {{ $t('degradation') }}
                        </span>
                    </v-col>
                    <v-col cols="3" class="px-0 d-flex justify-end">
                        <v-switch v-model="dg" class="mt-0 pt-0" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-icon class="mr-2" color="#ff3333">
                            mdi-square
                        </v-icon>
                        <span class="grey--text text--darken-2">
                            {{ $t('clear-cutting') }}
                        </span>
                    </v-col>
                    <v-col cols="3" class="px-0 d-flex justify-end">
                        <v-switch v-model="cr" class="mt-0 pt-0" />
                    </v-col>
                </v-row>

                <v-spacer />
            </v-col>
        </div>
    </div>
</template>

<i18n>
{
    "en": {
        "legend": "Legend:",
        "monitoring-info-part1": "Monitoring is based on visual interpretation",
        "monitoring-info-part2": "of Landsat-8 with a 32-day interval.",
        "monitoring-info-part3": "Monitoring detections are available",
        "monitoring-info-part4": "from August 30, 2015 (variable by orbit-point).",
        "recovery-deforestation": "Regenerating Deforestation",
        "forest-fire": "Forest Fire",
        "degradation": "Degradation",
        "clear-cutting": "Clear-Cutting"
    },
    "pt-br": {
        "legend": "Legenda:",
        "monitoring-info-part1": "O Monitoramento é baseado na interpretação",
        "monitoring-info-part2": "visual do Landsat-8 com intervalo de 32 dias.",
        "monitoring-info-part3": "As detecções do monitoramento são contempladas",
        "monitoring-info-part4": "a partir de 30 de agosto de 2015 (variável por órbita-ponto).",
        "recovery-deforestation": "Desmatamento em Regeneração",
        "forest-fire": "Fogo em Floresta",
        "degradation": "Degradação",
        "clear-cutting": "Corte Raso"
    }
}
</i18n>

<script>
import { mapActions, mapState } from 'vuex'
import MonitoringFilter from '@/components/monitoring/MonitoringFilter'
import ShowDialog from '@/components/show-dialog/ShowDialog'

export default {
    components: {
        MonitoringFilter,
        ShowDialog,
    },

    data() {
        return {
            checkNewFilters: false,
            dr: true,
            ff: true,
            dg: true,
            cr: true,
        }
    },

    watch: {
        dr(newValue) {
            this.handleCheckboxChange(newValue, 'DR')
        },
        ff(newValue) {
            this.handleCheckboxChange(newValue, 'FF')
        },
        dg(newValue) {
            this.handleCheckboxChange(newValue, 'DG')
        },
        cr(newValue) {
            this.handleCheckboxChange(newValue, 'CR')
        },
    },

    computed: {
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
            'showFeaturesMonitoring',
            'features',
            'tableDialogMonitoring',
            'isLoadingFeatures',
            'isLoadingStatistic',
            'analyticsMonitoringDialog',
            'stageItemActive',
            'selectedStages',
            'setStageItemActive',
        ]),
    },

    methods: {
        async handleCheckboxChange(newValue, description) {
            if (newValue) {
                await this.updateDescription(description)
            } else {
                await this.removeDescription(description)
            }
        },

        updateStageItemList() {
            const stageItemActive = []
            this.features.features.map((item) => {
                this.selectedStages.map((stageActive) => {
                    stageActive === item.properties.no_estagio
                        ? stageItemActive.push(item)
                        : ''
                })
            })
            this.$store.commit('monitoring/setStageItemActive', stageItemActive)
        },

        async updateDescription(value) {
            this.updateStageItemList()
            this.$store.commit('monitoring/setSelectedStages', value)
            await this.updateFeatures()
        },

        async removeDescription(value) {
            this.$store.commit('monitoring/removeSelectedStages', value)
            this.updateStageItemList()
            await this.updateFeatures()
        },

        search() {
            if (this.tableDialogMonitoring) {
                this.checkNewFilters = true
                this.getDataTableMonitoring()
            }
            if (this.analyticsMonitoringDialog) {
                this.checkNewFilters = true
                this.isLoadingStatistic = true
                this.getDataAnalyticsMonitoringByFunaiYear()
            }
            if (!this.tableDialogMonitoring) this.getFeatures()
        },

        ...mapActions('monitoring', [
            'getFeatures',
            'updateFeatures',
            'getDataTableMonitoring',
            'getDataAnalyticsMonitoringByFunaiYear',
        ]),
    },
}
</script>

<style scoped lang="scss">
.infoIconMargin {
    margin-left: 14px;
    margin-top: 16px;
}

@media (max-width: 768px) {
    .infoIconMargin {
        margin-left: 2px;
    }
}
</style>
