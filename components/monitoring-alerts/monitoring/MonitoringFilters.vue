<template>
  <v-form ref="monitoringForm">
    <v-card class="pa-0">
      <v-card-title class="py-0 pt-4 d-flex justify-space-between">
        <v-checkbox
          v-model="currentViewArea"
          :label="$t('current-view')"
          :rules="currentViewRules"
          class="ma-0 pa-0"
        />
        <v-tooltip
          v-if="getUrlWmsMonitoring"
          bottom
          :text="$t('title-switch-disable-features')"
        >
          <template #activator="{ props }">
            <v-switch
              v-bind="props"
              v-model="showFeaturesMonitoring"
              class="ma-0 pa-0"
            />
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
            :loading="loadingRegionalCoordinators"
            :disabled="loadingRegionalCoordinators || loadingSearchMonitoring"
            :rules="regionalCoordinationRules"
            :menu-props="comboboxMenuProps"
            clearable
            multiple
            class="pa-0"
            outlined
            @clear="clearRegionalandIndigenous"
          />
          <v-combobox
            v-show="currentRegionalCoordinates.length"
            v-model="currentIndigenousLand"
            :label="$t('indigenous-land')"
            :items="getIndigenousLands"
            item-text="no_ti"
            item-value="co_funai"
            :loading="loadingIndigenousLands"
            :disabled="loadingIndigenousLands || loadingSearchMonitoring"
            :menu-props="comboboxMenuProps"
            hide-details
            clearable
            multiple
            class="mt-4"
            outlined
            @clear="currentIndigenousLand = []"
          />

          <v-tabs
            v-model="currentTab"
            fixed-tabs
            color="primary"
            class="mt-4"
          >
            <v-tab href="#data">
              {{ $t('data-label') }}
            </v-tab>
            <v-tab href="#cycle">
              {{ $t('cycle-label') }}
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="currentTab">
            <v-tab-item value="data">
              <v-row class="mt-2">
                <v-col
                  cols="6"
                  class="pr-1"
                >
                  <BaseDateField
                    v-model="currentStartDate"
                    :label="$t('start-date')"
                    :required="true"
                    outlined
                    :min-date="'2015-01-01'"
                  />
                </v-col>

                <v-col
                  cols="6"
                  class="pl-1"
                >
                  <BaseDateField
                    v-model="currentEndDate"
                    :label="$t('end-date')"
                    :required="true"
                    outlined
                    :min-date="'2015-01-01'"
                  />
                </v-col>
              </v-row>
            </v-tab-item>
            <v-tab-item value="cycle">
              <v-row class="mt-2">
                <v-col cols="6">
                  <v-combobox
                    v-model="currentStartCycle"
                    :label="$t('start_cycle')"
                    :items="getCycles"
                    item-text="no_ciclo"
                    item-value="no_ciclo"
                    :loading="loadingCycles"
                    :disabled="loadingCycles || !getCycles.length"
                    :menu-props="comboboxMenuProps"
                    hide-details
                    clearable
                    class="mb-7"
                    outlined
                    @clear="currentEndCycle = null"
                  />
                </v-col>

                <v-col cols="6">
                  <v-combobox
                    v-model="currentEndCycle"
                    :label="$t('end_cycle')"
                    :items="getCycles"
                    item-text="no_ciclo"
                    item-value="no_ciclo"
                    :loading="loadingCycles"
                    :disabled="loadingCycles || !getCycles.length"
                    :menu-props="comboboxMenuProps"
                    hide-details
                    clearable
                    class="mb-7"
                    outlined
                    @clear="currentEndCycle = null"
                  />
                </v-col>
              </v-row>
            </v-tab-item>
          </v-tabs-items>

          <v-col
            cols="12"
            class="mt-4"
          >
            <v-btn
              block
              small
              color="primary"
              outlined
              :loading="loadingSearchMonitoring"
              :disabled="!currentStartDate || !currentEndDate || loadingSearchMonitoring"
              class="pa-0 mt-n6"
              @click="searchMonitoring"
            >
              {{ $t('search-label') }}
            </v-btn>
          </v-col>
        </v-row>

        <template v-if="getShowFeaturesMonitoring">
          <v-divider class="mt-4" />
          <MonitoringResults />
        </template>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<i18n>
{
  "en": {
    "invalid-date": "Invalid date",
    "date-format": "YYYY-MM-DD",
    "current-view": "Search in current area?",
    "title-switch-disable-features": "Disable Daily Monitoring",
    "title-switch-enable-features": "Enable Daily Monitoring",
    "regional-coordination": "Regional Coordination (All)",
    "indigenous-land": "Indigenous Land (All)",
    "start-date": "Start Date",
    "end-date": "End Date",
    "search-label": "Search",
    "cycle-label": "Cycle",
    "data-label": "Date",
    "start_cycle": "Start Cycle",
    "end_cycle": "End Cycle"
  },
  "pt-br": {
    "invalid-date": "Data inválida",
    "date-format": "DD/MM/YYYY",
    "current-view": "Pesquisar nesta área?",
    "title-switch-disable-features": "Desabilitar Monitoramento Diário",
    "title-switch-enable-features": "Habilitar Monitoramento Diário",
    "regional-coordination": "Coordenação Regional (Todas)",
    "indigenous-land": "Terras Indígenas (Todas)",
    "start-date": "Data Inicial",
    "end-date": "Data Final",
    "search-label": "Buscar",
    "cycle-label": "Ciclo",
    "data-label": "Data",
    "start_cycle": "Ciclo Inicial",
    "end_cycle": "Ciclo Final"
  }
}
</i18n>

<script>
import { mapState, mapGetters } from 'vuex';
import BaseDateField from '@/components/base/BaseDateField';
import MonitoringResults from './MonitoringResults.vue';

export default {
  name: 'MonitoringFilters',

  components: {
    BaseDateField,
    MonitoringResults,
  },

  data() {
    return {
      comboboxMenuProps: {
        maxHeight: 300,
        maxWidth: 330,
      },
      currentViewRules: [
        (v) => (!!v || !!(this.filters.cr && this.filters.cr.length)) || false,
      ],
      regionalCoordinationRules: [
        (v) => ((!!v && !!v.length) || !!this.filters.currentView) || false,
      ],
    };
  },

  computed: {
    showFeaturesMonitoring: {
      get() {
        return this.$store.state.monitoring.showFeaturesMonitoring;
      },
      set(value) {
        this.$store.commit('monitoring/setShowFeaturesMonitoring', value);
      },
    },

    currentViewArea: {
      get() {
        return this.filters.currentView;
      },
      set(value) {
        this.$store.commit('monitoring/setFilters', { currentView: value });
        if (value && this.currentRegionalCoordinates.length) this.clearRegionalandIndigenous();
      },
    },

    currentRegionalCoordinates: {
      get() {
        return this.filters.cr;
      },
      set(value) {
        if (!value.length) this.currentIndigenousLand = [];
        this.$store.commit('monitoring/setFilters', { cr: value });
        this.$store.dispatch('monitoring/getTiOptions');
        if (value.length && this.currentViewArea) {
          this.$store.commit('monitoring/setFilters', { currentView: false });
        }
      },
    },

    currentIndigenousLand: {
      get() {
        return this.filters.ti;
      },
      set(value) {
        this.$store.commit('monitoring/setFilters', { ti: value });
      },
    },

    currentStartCycle: {
      get() {
        return this.filters.startCycle;
      },
      set(value) {
        this.$store.commit('monitoring/setFilters', { startCycle: value });
      },
    },

    currentEndCycle: {
      get() {
        return this.filters.endCycle;
      },
      set(value) {
        this.$store.commit('monitoring/setFilters', { endCycle: value });
      },
    },

    currentStartDate: {
      get() {
        return this.filters.startDate || '';
      },
      set(value) {
        this.$store.commit('monitoring/setFilters', { startDate: value });
      },
    },

    currentEndDate: {
      get() {
        return this.filters.endDate || '';
      },
      set(value) {
        this.$store.commit('monitoring/setFilters', { endDate: value });
      },
    },

    currentTab: {
      get() {
        return this.filters.currentTab;
      },
      set(value) {
        this.$store.commit('monitoring/setFilters', { currentTab: value });
      },
    },

    ...mapGetters('monitoring', [
      'getRegionalCoordinators',
      'getFilters',
      'getIndigenousLands',
      'getCycles',
      'getShowFeaturesMonitoring',
      'getUrlWmsMonitoring',
    ]),
    ...mapState('monitoring', [
      'filters',
      'loadingIndigenousLands',
      'loadingRegionalCoordinators',
      'loadingSearchMonitoring',
      'loadingCycles',
    ]),
  },

  created() {
    this.initializeDates();
  },

  methods: {
    initializeDates() {
      // 1 month later
      this.currentStartDate = this.$moment().subtract(1, 'month').format('YYYY-MM-DD') || '';
      // current date
      this.currentEndDate = this.$moment().format('YYYY-MM-DD') || '';
    },

    validCurrentViewArea(value) {
      if (!value || (this.filters.cr && this.filters.cr.length)) {
        return true;
      }
      return false;
    },

    validRegionalCoordination(value) {
      if (!value || (this.filters.currentView)) {
        return true;
      }
      return false;
    },

    searchMonitoring() {
      if (this.$refs.monitoringForm.validate()) {
        this.$store.commit('monitoring/setUrlWmsMonitoring', '');
        this.$store.dispatch('monitoring/generateUrlWmsMonitoring');
      }
    },

    clearRegionalandIndigenous() {
      this.currentIndigenousLand = [];
      this.currentRegionalCoordinates = [];
    },
  },
};
</script>

<style scoped lang="scss"></style>
