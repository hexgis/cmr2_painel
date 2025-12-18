<template>
  <v-form ref="urgentAlertForm">
    <v-card class="pa-0">
      <v-card-title class="py-0 pt-4 d-flex justify-space-between">
        <v-checkbox
          v-model="currentViewArea"
          :label="$t('current-view')"
          :rules="currentViewRules"
          class="ma-0 pa-0"
        />
        <v-tooltip
          v-if="getUrlWmsUrgentAlert"
          bottom
          :text="$t('title-switch-disable-features')"
        >
          <template #activator="{ props }">
            <v-switch
              v-bind="props"
              v-model="showFeaturesUrgentAlert"
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
            :disabled="loadingRegionalCoordinators || loadingSearchUrgentAlert"
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
            :menu-props="comboboxMenuProps"
            item-value="co_funai"
            :loading="loadingIndigenousLands"
            :disabled="loadingIndigenousLands || loadingSearchUrgentAlert"
            hide-details
            clearable
            multiple
            class="mt-4"
            outlined
            @clear="currentIndigenousLand = []"
          />

          <v-col
            cols="6"
            class="pr-1 mt-4"
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
            class="pl-1 mt-4"
          >
            <BaseDateField
              v-model="currentEndDate"
              :label="$t('end-date')"
              :required="true"
              outlined
              :min-date="'2015-01-01'"
            />
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
              :loading="loadingSearchUrgentAlert"
              :disabled="!currentStartDate || !currentEndDate || loadingSearchUrgentAlert"
              class="pa-0 mt-n6"
              @click="searchUrgentAlert"
            >
              {{ $t('search-label') }}
            </v-btn>
          </v-col>
        </v-row>

        <template v-if="getShowFeaturesUrgentAlert">
          <v-divider class="mt-4" />
          <UrgentAlertResults />
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
    "title-switch-disable-features": "Disable Daily Urgent Alert",
    "title-switch-enable-features": "Enable Daily Urgent Alert",
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
    "title-switch-disable-features": "Desabilitar Alertas Urgentes",
    "title-switch-enable-features": "Habilitar Alertas Urgentes",
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
import UrgentAlertResults from './UrgentAlertResults.vue';

export default {
  name: 'UrgentAlertFilters',

  components: {
    BaseDateField,
    UrgentAlertResults,
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
    showFeaturesUrgentAlert: {
      get() {
        return this.$store.state['urgent-alerts'].showFeaturesUrgentAlert;
      },
      set(value) {
        this.$store.commit('urgent-alerts/setShowFeaturesUrgentAlert', value);
      },
    },

    currentViewArea: {
      get() {
        return this.filters.currentView;
      },
      set(value) {
        this.$store.commit('urgent-alerts/setFilters', { currentView: value });
        if (value && this.currentRegionalCoordinates.length) this.clearRegionalandIndigenous();
      },
    },

    currentRegionalCoordinates: {
      get() {
        return this.filters.cr;
      },
      set(value) {
        if (!value.length) this.currentIndigenousLand = [];
        this.$store.commit('urgent-alerts/setFilters', { cr: value });
        this.$store.dispatch('urgent-alerts/getTiOptions');
        if (value.length && this.currentViewArea) {
          this.$store.commit('urgent-alerts/setFilters', { currentView: false });
        }
      },
    },

    currentIndigenousLand: {
      get() {
        return this.filters.ti;
      },
      set(value) {
        this.$store.commit('urgent-alerts/setFilters', { ti: value });
      },
    },

    currentStartCycle: {
      get() {
        return this.filters.startCycle;
      },
      set(value) {
        this.$store.commit('urgent-alerts/setFilters', { startCycle: value });
      },
    },

    currentEndCycle: {
      get() {
        return this.filters.endCycle;
      },
      set(value) {
        this.$store.commit('urgent-alerts/setFilters', { endCycle: value });
      },
    },

    currentStartDate: {
      get() {
        return this.filters.startDate || '';
      },
      set(value) {
        this.$store.commit('urgent-alerts/setFilters', { startDate: value });
      },
    },

    currentEndDate: {
      get() {
        return this.filters.endDate || '';
      },
      set(value) {
        this.$store.commit('urgent-alerts/setFilters', { endDate: value });
      },
    },

    currentTab: {
      get() {
        return this.filters.currentTab;
      },
      set(value) {
        this.$store.commit('urgent-alerts/setFilters', { currentTab: value });
      },
    },

    ...mapGetters('urgent-alerts', [
      'getRegionalCoordinators',
      'getFilters',
      'getIndigenousLands',
      'getShowFeaturesUrgentAlert',
      'getUrlWmsUrgentAlert',
    ]),
    ...mapState('urgent-alerts', [
      'filters',
      'loadingIndigenousLands',
      'loadingRegionalCoordinators',
      'loadingSearchUrgentAlert',
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

    searchUrgentAlert() {
      if (this.$refs.urgentAlertForm.validate()) {
        this.$store.commit('urgent-alerts/setUrlWmsUrgentAlert', '');
        this.$store.dispatch('urgent-alerts/generateUrlWmsUrgentAlert');
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
