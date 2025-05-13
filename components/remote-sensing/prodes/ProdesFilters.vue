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
    
    <v-row
      no-gutters
      align="center"
      class="mt-3"
    >
      <v-col
        v-if="showFeaturesMonitoring"
        class="ml-5"
      >
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

    <v-row
      v-if="showFeaturesMonitoring && !isLoadingFeatures"
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
    <v-divider></v-divider>
    <p class="font-weight-regular pt-2 grey--text text--darken-2">
  {{ $t('legend') }}
</p>

<!-- Legenda de anos com quadrados coloridos -->
<v-row v-if="selectedYears.length > 0" class="mt-2">
  <v-col cols="12">
    <div class="year-legend-list">
      <div 
        v-for="year in selectedYears" 
        :key="year"
        class="legend-item"
      >
        <div 
          class="color-square"
          :style="{ backgroundColor: yearColors[year] || '#CCCCCC' }"
        ></div>
        <span class="year-label">{{ year }}</span>
      </div>
    </div>
  </v-col>
</v-row>
  </v-col>
</template>

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
        "title-switch-disable-features": "Disable Monitoring Layer"
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
        "title-switch-disable-features": "Desabilitar Camada de Monitoramento"
    }
}
</i18n>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import legend from '@/assets/legend.png';

export default {
  name: 'ProdesFilters',

  data() {
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = 2015; year <= currentYear; year++) {
      yearOptions.push(year);
    }

    const yearColors = {
    2015: '#FF5733', 2016: '#33FF57', 2017: '#3357FF', 2018: '#F333FF',
    2019: '#F3FF33', 2020: '#FF33F3', 2021: '#33FFF3', 2022: '#8A2BE2',
    2023: '#FF6347', 2024: '#7CFC00', 2025: '#9932CC'
  };

    return {
      isGeoserver: process.env.MONITORING_GEOSERVER === 'true',
      yearOptions,
      yearColors,
      filters: {
        startYear: currentYear,
        endYear: currentYear,
        currentView: false,
        priority: null,
        cr: [],
        ti: null,
      },
      checkNewFilters: false,
      isLoadingTotal: false,
      legendData: legend,
      error: false,
      flattened: [],
      dialog: false,
    };
  },

  computed: {
    selectedYears() {
    if (!this.currentUrlWmsMonitoring) return [];
    

    const urlParams = new URLSearchParams(this.currentUrlWmsMonitoring.split('?')[1]);
    const cqlFilter = urlParams.get('CQL_FILTER') || '';
      
    const yearMatches = cqlFilter.match(/nu_ano >= \((\d+)\) AND nu_ano <= \((\d+)\)/);
    
    if (yearMatches && yearMatches.length >= 3) {
      const startYear = parseInt(yearMatches[1]);
      const endYear = parseInt(yearMatches[2]);
      
      // Retorna array com todos os anos no intervalo
      return Array.from({length: endYear - startYear + 1}, (_, i) => startYear + i);
    }
    
    return [];
  },
    opacity: {
      get() {
        return this.$store.state.prodes.opacity;
      },
      set(value) {
        this.$store.commit('prodes/setOpacity', value);
      },
    },

    featuresMonitoring: {
      get() {
        return this.$store.state.prodes.showFeaturesMonitoring;
      },
      set(value) {
        this.$store.commit(
          'prodes/setshowFeaturesMonitoring',
          value,
        );
      },
    },

    ...mapState('prodes', [
      'currentUrlWmsMonitoring',
      'isLoadingFeatures',
      'loadingMonitoring',
      'filterOptions',
      'features',
      'showFeaturesMonitoring',   
    ]),
  },

  watch: {
    'filters.cr': function (value) {
      const arrayCrPoulate = [];
      Object.values(value).forEach((item) => {
        arrayCrPoulate.push(item.co_cr);
      });
      this.populateTiOptions(arrayCrPoulate);
    },

    'filterOptions.regionalFilters': function () {
      this.populateCrOptions();
    },

    'filters.startYear'(newVal) {
      if (newVal > this.filters.endYear) {
        this.filters.endYear = newVal;
      }
    },
  },

  mounted() {
    this.getFilterOptions();
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
      if (cr) this.$store.dispatch('prodes/getTiOptions', cr);
      else this.filters.ti = null;
    },

    searchMonitoring() {
      const { filters } = this;
      const {
        currentView, cr, startYear, endYear,
      } = filters;

      if ((currentView || cr.length) && startYear && endYear) {
        this.error = false;
        
        // Convert years to dates for the store if needed
        const filtersForStore = {
          ...filters,
          startDate: `${startYear}-01-01`,
          endDate: `${endYear}-12-31`
        };
        
        this.setFilters(filtersForStore);
        this.getFeatures();
        return;
      }
      this.error = true;
    },
    
    ...mapMutations('prodes', [
      'setFilters',  
    ]),
    ...mapActions('prodes', [
      'getFilterOptions',
      'getFeatures',    
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
.year-legend-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-square {
  width: 16px;
  height: 16px;
  border: 1px solid #ddd;
  border-radius: 2px;
  flex-shrink: 0;
}

.year-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
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
  
  .color-square {
    width: 14px;
    height: 14px;
  }
  
  .year-label {
    font-size: 0.8rem;
  }
}
</style>