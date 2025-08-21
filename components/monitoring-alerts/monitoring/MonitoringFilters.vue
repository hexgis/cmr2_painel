<template>
    <v-card>
        <v-card-title class="d-flex justify-space-between">
            <v-checkbox :label="$t('current-view')" />
            <v-tooltip bottom :text="$t('title-switch-disable-features')">
                <template v-slot:activator="{ props }">
                    <v-switch v-bind="props" v-model="showFeaturesMonitoring" />
                </template>
            </v-tooltip>
        </v-card-title>
        <v-card-text>
            <v-row no-gutters>
                <v-combobox
                    v-model="currentRegionalCoordinates"
                    :label="$t('regional-coordination')"
                    :items="getRegionalCoordinators"
                    item-value="co_cr"
                    item-text="ds_cr"
                    hide-details
                    clearable
                    multiple
                    class="pa-0"
                    outlined
                />
                <v-combobox
                    v-show="currentRegionalCoordinates.length"
                    v-model="currentIndigenousLand"
                    :label="$t('indigenous-land')"
                    :items="getIndigenousLands"
                    item-text="no_ti"
                    :loading="loadingIndigenousLands"
                    :disabled="loadingIndigenousLands"
                    hide-details
                    clearable
                    multiple
                    class="mt-4"
                    outlined
                />
                <v-col cols="6" class="mt-5 pr-1">
                    <BaseDateField
                        v-model="getFilters.startDate"
                        :label="$t('start-date')"
                        required
                        outlined
                    />
                </v-col>
                <v-col cols="6" class="mt-5 pl-1">
                    <BaseDateField
                        v-model="getFilters.endDate"
                        :label="$t('end-date')"
                        required
                        outlined
                    />
                </v-col>
                <v-col cols="12" class="mt-4">
                    <v-btn
                        block
                        small
                        color="primary"
                        outlined
                        :loading="loadingMonitoring"
                        class="pa-0 mt-n6"
                        @click="searchMonitoring"
                    >
                        {{ $t('search-label') }}
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<i18n>
{
  "en": {
    "current-view": "Search in current area?",
    "title-switch-disable-features": "Disable Daily Monitoring",
    "title-switch-enable-features": "Enable Daily Monitoring",
    "regional-coordination": "Regional Coordination (All)",
    "indigenous-land": "Indigenous Land (All)",
    "start-date": "Start Date",
    "end-date": "End Date",
    "search-label": "Search"
  },
  "pt-br": {
    "current-view": "Pesquisar nesta área?",
    "title-switch-disable-features": "Desabilitar Monitoramento Diário",
    "title-switch-enable-features": "Habilitar Monitoramento Diário",
    "regional-coordination": "Coordenação Regional (Todas)",
    "indigenous-land": "Terras Indígenas (Todas)",
    "start-date": "Data Inicial",
    "end-date": "Data Final",
    "search-label": "Buscar"
  }
}
</i18n>

<script>
import { mapMutations, mapState, mapActions, mapGetters } from 'vuex'
import BaseDateField from '@/components/base/BaseDateField'

export default {
    name: 'MonitoringFilters',

    components: {
        BaseDateField,
    },

    data() {
        return {}
    },

    computed: {
        currentRegionalCoordinates: {
            get() {
                return this.filters.cr
            },
            set(value) {
                this.$store.commit('monitoring/setFilters', { cr: value })
                this.$store.dispatch('monitoring/getTiOptions')
            },
        },

        currentIndigenousLand: {
            get() {
                return this.filters.ti
            },
            set(value) {
                this.$store.commit('monitoring/setFilters', { ti: value })
            },
        },

        ...mapGetters('monitoring', [
          'getRegionalCoordinators', 
          'getFilters',
          'getIndigenousLands'
        ]),
        ...mapState('monitoring', [
          'filters',
          'showFeaturesMonitoring', 
          'loadingIndigenousLands'
        ]),
    },

    methods: {
      searchMonitoring() {
          this.$emit('search-monitoring')
      },

      ...mapActions('monitoring', ['getTiOptions']),
      ...mapMutations('monitoring', ['setShowFeaturesMonitoring']),
    },
}
</script>

<style scoped lang="scss"></style>
