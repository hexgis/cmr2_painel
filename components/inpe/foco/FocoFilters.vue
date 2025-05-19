<template>
<div>
  <v-col class="px-4">
    <!-- Filtros (sempre visíveis) -->
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
            v-if="currentUrlWmsFoco"
            v-model="featuresFoco"
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
    <v-row
      no-gutters
      align="center"
      class="mt-3"
    >
      <v-col>
        <v-btn
          block
          small
          color="primary"
          outlined
          :loading="loadingFoco"
          @click="searchFoco"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Switches (aparecem apenas após busca) -->
    <template v-if="showFeaturesFoco && !isLoadingFeatures">
      <v-divider class="mt-4"/>
      
      <v-row class="mt-2">
        <v-col>
         <v-row class="align-center">
        <v-icon color="yellow" class="ml-1">mdi-fire</v-icon>
        <span class="ml-1">AQUA M-M</span>
        <v-spacer></v-spacer>
        <v-switch 
          v-model="switch1" 
        
          class="ml-2"
        ></v-switch>
      </v-row>
          <v-row class="align-center">
        <v-icon color="red" class="ml-1">mdi-fire</v-icon>
        <span class="ml-1">AQUA M-T</span>   
        <v-spacer></v-spacer>
        <v-switch 
          v-model="switch2" 
         
          class="ml-2">
        </v-switch>
      </v-row>
        </v-col>
      </v-row>

      <v-row
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
      <v-divider/>
    </template>
  </v-col>
</div>
</template>

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
        "title-switch-disable-features": "Disable Foco Layer"
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
        "title-switch-disable-features": "Desabilitar Camada de Foco"
    }
}
</i18n>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import BaseDateField from '@/components/base/BaseDateField';

export default {
  name: 'FocoFilters',

  components: { BaseDateField },

  data() {
    return {
      filters: {
        startDate: this.$moment()
          .subtract(30, 'days')
          .format('YYYY-MM-DD'),
        endDate: this.$moment().format('YYYY-MM-DD'),
        currentView: false,
        priority: null,
        cr: [],
        ti: null,
      },
      error: false,
      flattened: [],
      switch1: false,  // Para AQUA M-M
      switch2: false,
      activeLayers: [] // Array para controlar as camadas ativas
    };
  },

  computed: {
    opacity: {
      get() {
        return this.$store.state.foco.opacity;
      },
      set(value) {
        this.$store.commit('foco/setOpacity', value);
      },
    },

    featuresFoco: {
      get() {
        return this.$store.state.foco.showFeaturesFoco;
      },
      set(value) {
        this.$store.commit('foco/setshowFeaturesFoco', value);
      },
    },

    ...mapState('foco', [
      'currentUrlWmsFoco',
      'isLoadingFeatures',
      'loadingFoco',
      'filterOptions',
      'features',
      'showFeaturesFoco',   
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

    switch1(val) {
    this.$store.commit('foco/toggleLayer', {
      layer: 'aqua_m_m',
      isActive: val
    });
    if (this.showFeaturesFoco) this.searchFoco();
  },
  switch2(val) {
    this.$store.commit('foco/toggleLayer', {
      layer: 'aqua_m_t',
      isActive: val
    });
    if (this.showFeaturesFoco) this.searchFoco();
  }                                                                                     
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
      if (cr) this.$store.dispatch('foco/getTiOptions', cr);
      else this.filters.ti = null;
    },

    searchFoco() {
      const { filters } = this;
      const { currentView, cr, startDate, endDate } = filters;

      if ((currentView || cr.length) && startDate && endDate) {
        this.error = false;

        if (new Date(endDate) < new Date(startDate)) {  
          this.error = true;
          this.$store.commit('alert/addAlert', {
            message: this.$i18n.t('A data final deve ser maior ou igual à data inicial'),
          }, { root: true });
          return;
        }
        
        this.setFilters(filters);
        this.getFeatures();
        return;
      }
      this.error = true;
    },
    
    ...mapMutations('foco', [
      'setFilters',  
    ]),
    ...mapActions('foco', [
      'getFilterOptions',
      'getFeatures',    
    ]),
  },
};
</script>