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
            clearable
            multiple
            class="pa-0"
            outlined
            @clear="currentRegionalCoordinates = []"
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
            hide-details
            clearable
            multiple
            class="mt-4"
            outlined
            @clear="currentIndigenousLand = []"
          />
          <v-col cols="6">
            <v-text-field
              v-model="currentStartCycle"
              type="number"
              :label="$t('cycle')"
              :loading="loadingIndigenousLands"
              :disabled="loadingIndigenousLands || loadingSearchMonitoring"
              class="mt-4 pr-1"
              outlined
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
              v-model="currentEndCycle"
              type="number"
              :label="$t('cycle')"
              :loading="loadingIndigenousLands"
              :disabled="loadingIndigenousLands || loadingSearchMonitoring"
              class="mt-4 pl-1"
              outlined
            />
          </v-col>

          <v-col
            cols="6"
            class="pr-1"
          >
            <v-tooltip
              top
              :disabled="!currentStartCycle || !currentEndCycle"
              open-delay="1200"
            >
              <template #activator="{ on, attrs }">
                <div
                  v-bind="attrs"
                  v-on="on"
                >
                  <BaseDateField
                    v-model="currentStartDate"
                    :label="$t('start-date')"
                    :required="true"
                    :disabled="!!currentStartCycle || !!currentEndCycle"
                    outlined
                    :min-date="'2015-01-01'"
                  />
                </div>
              </template>
              <span>{{ $t('message-cycle-or-dates') }}</span>
            </v-tooltip>
          </v-col>

          <v-col
            cols="6"
            class="pl-1"
          >
            <v-tooltip
              top
              :disabled="!currentStartCycle || !currentEndCycle"
              open-delay="800"
            >
              <template #activator="{ on, attrs }">
                <div
                  v-bind="attrs"
                  v-on="on"
                >
                  <BaseDateField
                    v-model="currentEndDate"
                    :label="$t('end-date')"
                    :required="true"
                    :disabled="!!currentStartCycle || !!currentEndCycle"
                    outlined
                    :min-date="'2015-01-01'"
                  />
                </div>
              </template>
              <span>{{ $t('message-cycle-or-dates') }}</span>
            </v-tooltip>
          </v-col>

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
    "message-cycle-or-dates": "Disabled when filling in the Cycle field"
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
    "message-cycle-or-dates": "Desativado ao preencher o campo Ciclo"
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
        if (value && this.currentRegionalCoordinates.length) this.currentRegionalCoordinates = [];
      },
    },

    currentRegionalCoordinates: {
      get() {
        return this.filters.cr;
      },
      set(value) {
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

    ...mapGetters('monitoring', [
      'getRegionalCoordinators',
      'getFilters',
      'getIndigenousLands',
      'getShowFeaturesMonitoring',
    ]),
    ...mapState('monitoring', [
      'filters',
      'loadingIndigenousLands',
      'loadingRegionalCoordinators',
      'loadingSearchMonitoring',
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
  },
};
</script>

<style scoped lang="scss"></style>
