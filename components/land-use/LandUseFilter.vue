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
            v-if="currentUrlWmsLandUse"
            v-model="featuresLandUse"
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
          v-model="filters.year"
          :label="$t('year-label')"
          :items="yearOptions"
          :required="true"
          outlined
        />
      </v-col>
    </v-row>

    <v-row
      no-gutters
      align="center"
      class="mt-3"
    >
      <v-col v-if="showFeaturesLandUse">
        <v-btn
          block
          small
          color="primary"
          outlined
          :loading="loadingLandUse"
          @click="searchLandUse"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
      <v-col v-if="!showFeaturesLandUse">
        <v-btn
          block
          small
          color="primary"
          outlined
          :loading="loadingLandUse"
          @click="searchLandUse"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-divider
      v-if="showFeaturesLandUse && !isLoadingFeatures"
      class="mt-4"
    />

    <v-row
      v-if="showFeaturesLandUse && !isLoadingFeatures"
      align="center"
      class="mt-2"
    >
      <v-col
        cols="4"
        class="grey--text text--darken-2"
      >
        {{ $t('opacity-label') }}
      </v-col>
      <v-col cols="8">
        <v-slider
          v-model="opacity"
          hide-details
          thumb-label
        />
      </v-col>
    </v-row>
    <v-divider />
    <div v-if="showFeaturesLandUse && !isLoadingFeatures">
      <p class="font-weight-regular pt-2 grey--text text--darken-2 mb-n6">
        {{ $t('legend') }}
      </p>
      <!-- Legenda Dinâmica para Ano Selecionado-->
      <div v-if="showFeaturesLandUse && !isLoadingFeatures">
        <v-row
          v-if="legendItems.length"
          class="mt-2"
        >
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
                    :style="{ backgroundColor: item.color }"
                  />
                </v-list-item-icon>
                <v-list-item-content class="ml-n8 mb-1">
                  <v-list-item-title>
                    {{ item.label }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-col>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';

export default {
  name: 'LandUseFilters',

  data() {
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = 2015; year <= currentYear; year += 1) {
      yearOptions.push(year);
    }

    return {
      yearOptions,
      filters: {
        year: currentYear,
        currentView: false,
        priority: null,
        cr: [],
        ti: null,
      },
      filteredYears: [],
      checkNewFilters: false,
      isLoadingTotal: false,
      error: false,
      flattened: [],
      dialog: false,
    };
  },

  computed: {
    opacity: {
      get() {
        return this.$store.state['land-use'].opacity;
      },
      set(value) {
        this.$store.commit('land-use/setOpacity', value);
      },
    },

    featuresLandUse: {
      get() {
        return this.$store.state['land-use'].showFeaturesLandUse;
      },
      set(value) {
        this.$store.commit('land-use/setshowFeaturesLandUse', value);
      },
    },

    legendItems() {
      return this.$store.getters['land-use/getLegendItems'];
    },

    ...mapState('land-use', [
      'currentUrlWmsLandUse',
      'isLoadingFeatures',
      'loadingLandUse',
      'filterOptions',
      'features',
      'showFeaturesLandUse',
      'landUseStyles',
    ]),
  },

  watch: {
    'filters.cr': function filtersCrWatcher(value) {
      const arrayCrPoulate = [];
      Object.values(value).forEach((item) => {
        arrayCrPoulate.push(item.co_cr);
      });
      this.populateTiOptions(arrayCrPoulate);
    },

    'filterOptions.regionalFilters': function regionalFiltersWatcher() {
      this.populateCrOptions();
    },
  },

  mounted() {
    this.getFilterOptions();
    this.getLandUseStyleFromGeoserver();
    this.$store.commit('land-use/setshowFeaturesLandUse', true);
  },

  methods: {
    populateCrOptions() {
      const groups = {};

      this.filterOptions.regionalFilters.forEach((x) => {
        groups[x.no_regiao] = groups[x.no_regiao] || {
          ds_cr: x.ds_cr,
          list: [],
        };

        groups[x.no_regiao].list.push(x);
      });

      Object.keys(groups).forEach((categoryId) => {
        const category = groups[categoryId];
        const categoryRegiao = categoryId;
        this.flattened.push({ header: categoryRegiao });
        this.flattened.push(...category.list);
      });

      return this.flattened;
    },

    populateTiOptions(cr) {
      if (cr) this.$store.dispatch('land-use/getTiOptions', cr);
      else this.filters.ti = null;
    },

    searchLandUse() {
      const { filters } = this;
      const {
        currentView, cr, year,
      } = filters;

      if ((currentView || cr.length) && year) {
        this.error = false;

        // Converter ano para datas para o store (usando o mesmo ano para início e fim)
        const filtersForStore = {
          ...filters,
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
        };

        // Definir o ano filtrado
        this.filteredYears = [year];

        this.setFilters(filtersForStore);
        this.getFeatures();
        return;
      }
      this.error = true;
    },

    ...mapMutations('land-use', ['setFilters']),
    ...mapActions('land-use', [
      'getFilterOptions',
      'getFeatures',
      'getLandUseStyleFromGeoserver',
    ]),
  },
};
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
          "year-label": "Year",
          "total-area-label": "Total Area",
          "regional-coordination-label": "Regional Coordination (All)",
          "indigenous-lands-label": "Indigenous Lands",
          "title-switch-disable-features": "Disable LandUse Layer"
      },
      "pt-br": {
          "legend": "Legenda:",
          "search-label": "Buscar",
          "opacity-label": "Opacidade",
          "current-view-label": "Pesquisar nesta área?",
          "year-label": "Ano",
          "total-area-label": "Área total",
          "regional-coordination-label": "Coordenação Regional (Todas)",
          "indigenous-lands-label": "Terras Indígenas",
          "title-switch-disable-features": "Desabilitar Camada de LandUse"
      }
  }
</i18n>
