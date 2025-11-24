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
          v-if="getUrlWmsLandUse"
          bottom
          :text="$t('title-switch-disable-features')"
        >
          <template #activator="{ props }">
            <v-switch
              v-bind="props"
              v-model="showFeaturesLandUse"
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
            :disabled="loadingRegionalCoordinators || loadingSearchLandUse"
            :rules="regionalCoordinationRules"
            clearable
            multiple
            class="pa-0"
            outlined
            @clear="currentRegionalCoordinates = [], currentIndigenousLand = []"
          />
          <v-combobox
            v-show="currentRegionalCoordinates.length"
            v-model="currentIndigenousLand"
            :label="$t('indigenous-land')"
            :items="getIndigenousLands"
            item-text="no_ti"
            item-value="co_funai"
            :loading="loadingIndigenousLands"
            :disabled="loadingIndigenousLands || loadingSearchLandUse"
            hide-details
            clearable
            multiple
            class="mt-4"
            outlined
            @clear="currentIndigenousLand = []"
          />

          <v-combobox
            v-model="currentYear"
            :label="$i18n.t('year')"
            :items="getYearItems"
            item-text="text"
            item-value="value"
            :loading="loadingYearsItems"
            hide-details
            clearable
            class="mt-4"
            outlined
            :rules="ruleYearsItems"
            @clear="currentYear = []"
          />

          <v-col
            cols="12"
            class="mt-8"
          >
            <v-btn
              block
              small
              color="primary"
              outlined
              :loading="loadingSearchLandUse"
              :disabled="!currentStartDate || !currentEndDate || loadingSearchLandUse"
              class="pa-0 mt-n6"
              @click="searchLandUse"
            >
              {{ $t('search-label') }}
            </v-btn>
          </v-col>
        </v-row>

        <template v-if="getShowFeaturesLandUse">
          <v-divider class="mt-4" />
          <LandUseResults />
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
    "data-label": "Date"
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
    "data-label": "Data"
  }
}
</i18n>

<script>
import { mapState, mapGetters } from 'vuex';
import LandUseResults from './LandUseResults.vue';

export default {
  name: 'LandUseFilters',

  components: {
    LandUseResults,
  },

  data() {
    return {
      currentViewRules: [
        (v) => (!!v || !!(this.filters.cr && this.filters.cr.length)) || false,
      ],
      regionalCoordinationRules: [
        (v) => ((!!v && !!v.length) || !!this.filters.currentView) || false,
      ],
      ruleYearsItems: [
        (v) => !!v || false,
      ],
    };
  },

  computed: {
    showFeaturesLandUse: {
      get() {
        return this.$store.state['land-use'].showFeaturesLandUse;
      },
      set(value) {
        this.$store.commit('land-use/setShowFeaturesLandUse', value);
      },
    },

    currentViewArea: {
      get() {
        return this.filters.currentView;
      },
      set(value) {
        this.$store.commit('land-use/setFilters', { currentView: value });
        if (value && this.currentRegionalCoordinates.length) this.currentRegionalCoordinates = [];
      },
    },

    currentRegionalCoordinates: {
      get() {
        return this.filters.cr;
      },
      set(value) {
        this.$store.commit('land-use/setFilters', { cr: value });
        this.$store.dispatch('land-use/getTiOptions');
        if (value.length && this.currentViewArea) {
          this.$store.commit('land-use/setFilters', { currentView: false });
        }
      },
    },

    currentIndigenousLand: {
      get() {
        return this.filters.ti;
      },
      set(value) {
        this.$store.commit('land-use/setFilters', { ti: value });
      },
    },

    currentYear: {
      get() {
        return this.filters.year;
      },
      set(value) {
        this.$store.commit('land-use/setFilters', { year: value });
      },
    },

    currentTab: {
      get() {
        return this.filters.currentTab;
      },
      set(value) {
        this.$store.commit('land-use/setFilters', { currentTab: value });
      },
    },

    ...mapGetters('land-use', [
      'getRegionalCoordinators',
      'getFilters',
      'getIndigenousLands',
      'getYearItems',
      'getShowFeaturesLandUse',
      'getUrlWmsLandUse',
    ]),
    ...mapState('land-use', [
      'filters',
      'loadingIndigenousLands',
      'loadingRegionalCoordinators',
      'loadingSearchLandUse',
      'loadingYearsItems',
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

    searchLandUse() {
      if (this.$refs.urgentAlertForm.validate()) {
        this.$store.commit('land-use/setUrlWmsLandUse', '');
        this.$store.dispatch('land-use/generateUrlWmsLandUse');
      }
    },
  },
};
</script>

<style scoped lang="scss"></style>
