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
          color="accent"
          :loading="isLoadingGeoJson"
          fab
          small
          icon
          @click="downloadGeoJsonLandUse()"
        >
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn
          :loading="isLoadingTable"
          icon
          fab
          small
          color="accent"
          @click="showTableDialog(true)"
        >
          <v-tooltip left>
            <template #activator="{ on }">
              <v-icon v-on="on">
                mdi-table
              </v-icon>
            </template>
            <span>{{ $t('table-label') }}</span>
          </v-tooltip>
        </v-btn>
      </v-col>
      <v-col>
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
      v-if="showFeaturesLandUse && !isLoadingFeatures && features && features.features"
      class="mt-2"
    >
      <v-col
        cols="12"
        class="grey--text text--darken-2 d-flex justify-space-between"
      >
        <span>
          {{ $t('total-poligono-label') }}:
        </span>
        {{ features.features.length }}
      </v-col>
      <v-col
        cols="12"
        class="grey--text text--darken-2 d-flex justify-space-between"
      >
        <span>
          {{ $t('total-area-label') }}:
        </span>
        {{ totalArea }} ha
      </v-col>
    </v-row>
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
    <v-divider />
    <div v-if="showFeaturesLandUse && !isLoadingFeatures">
      <p class="font-weight-regular pt-2 grey--text text--darken-2 mb-n6">
        {{ $t('legend') }}
      </p>
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

    <div
      v-if="tableDialogLand"
      class="d-none"
    >
      <TableDialog
        :table="tableDialogLand"
        :headers="headers"
        :value="formattedTableLandUse"
        :loading-table="isLoadingTable"
        :loading-c-s-v="isLoadingCSV"
        :table-name="$t('table-name')"
        :f-download-c-s-v="downloadTableLandUse"
        :f-close-table="closeTable"
      />
    </div>
  </v-col>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import legend from '../../assets/legend.png';
import TableDialog from '../table-dialog/TableDialog.vue';

export default {
  name: 'LandUseFilters',

  components: { TableDialog },

  data() {
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = 2015; year <= currentYear; year++) {
      yearOptions.push(year);
    }

    return {
      yearOptions: [2015, 2019].filter((year) => year <= new Date().getFullYear()),
      filters: {
        year: currentYear,
        currentView: false,
        priority: null,
        cr: [],
        ti: null,
      },
      headers: [
        { text: 'Código Funai', value: 'co_funai' },
        { text: 'Coordenação Regional', value: 'ds_cr' },
        { text: 'Terra Indígena', value: 'no_ti' },
        { text: 'Ano', value: 'nu_ano' },
        { text: 'Agropecuaria (ha)', value: 'nu_area_ag_ha' },
        { text: 'Corte raso (ha)', value: 'nu_area_cr_ha' },
        { text: 'Degradação (ha)', value: 'nu_area_dg_ha' },
        { text: 'Massa de água (ha)', value: 'nu_area_ma_ha' },
        { text: 'Silvicultura', value: 'nu_area_sv_ha' },
        { text: 'Vegetação natural (ha)', value: 'nu_area_vn_ha' },
        { text: 'Vilarejo (ha)', value: 'nu_area_vi_ha' },
        { text: 'Rodovia (ha)', value: 'nu_area_rv_ha' },
        { text: 'Mineração (ha)', value: 'nu_area_mi_ha' },
        { text: 'Não observado (ha)', value: 'nu_area_no_ha' },
        { text: 'Total (ha)', value: 'nu_area_ha' },
      ],
      filteredYears: [],
      checkNewFilters: false,
      isLoadingTotal: false,
      legendData: legend,
      error: false,
      flattened: [],
      dialog: false,
      tableDialogLand: false,
      isLoadingTable: false,
      isLoadingCSV: false,
      isLoadingGeoJson: false,
    };
  },

  computed: {
    totalArea() {
      if (this.features && this.features.features && this.features.features.length) {
        const total = this.features.features
          .reduce((total, feature) => total + (feature.properties.nu_area_ha || 0), 0);
        return this.formatFieldValue(total, 'nu_area_ha');
      }
      return this.formatFieldValue(0, 'nu_area_ha');
    },
    formattedTableLandUse() {
      if (!this.tableLandUse || !this.tableLandUse.length) {
        return [];
      }
      return this.tableLandUse.map((item) => {
        const formattedItem = { ...item };
        this.headers.forEach((header) => {
          const field = header.value;
          formattedItem[field] = this.formatFieldValue(item[field], field);
        });
        return formattedItem;
      });
    },
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
    tableLandUse() {
      return this.$store.state['land-use'].tableLandUse;
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
  },

  mounted() {
    this.getFilterOptions();
    this.getLandUseStyleFromGeoserver();
  },

  methods: {
    formatFieldValue(value, field = '') {
      if (value === null || value === undefined) {
        return 'N/A';
      }

      const fieldName = field.toLowerCase();

      const isDateField = (
        typeof value === 'string'
        && (fieldName.startsWith('dt_') || fieldName.startsWith('data_') || fieldName.startsWith('date'))
        && this.$moment(value).isValid()
      );

      const isBooleanField = typeof value === 'boolean';

      const isNumberField = typeof value === 'number';

      const isLatLongField = ['lat', 'lng', 'long', 'latitude', 'longitude'].some((key) => fieldName.includes(key));

      if (isDateField) {
        return this.$moment(value).format('DD/MM/YYYY');
      }

      if (isBooleanField) {
        return value ? 'Sim' : 'Não';
      }

      if (isNumberField || fieldName.startsWith('nu_')) {
        if (isLatLongField) {
          return value.toFixed(5);
        }
        if (typeof value === 'string') {
          // eslint-disable-next-line no-param-reassign
          value = parseFloat(value);
        }
        const rounded = value.toFixed(2);
        const [intPart, decimalPart] = rounded.split('.');

        return decimalPart !== '00' || (fieldName.startsWith('nu_') && fieldName.includes('area'))
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`
          : parseInt(value, 10);
      }

      // Valor padrão (string ou outros)
      return value || 'N/A';
    },
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
      const { currentView, cr, year } = filters;

      if ((currentView || cr.length) && year) {
        this.error = false;

        const filtersForStore = {
          ...filters,
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
        };

        this.filteredYears = [year];
        this.setFilters(filtersForStore);
        this.getFeatures();
        return;
      }
      this.error = true;
    },
    showTableDialog(value) {
      if (this.features) {
        this.tableDialogLand = value;
        this.getDataTableLandUse();
      }
    },
    closeTable(value) {
      this.tableDialogLand = value;
      if (this.checkNewFilters) {
        this.getFeatures();
        this.checkNewFilters = false;
      }
    },
    ...mapMutations('land-use', ['setFilters', 'settableDialogLand']),
    ...mapActions('land-use', [
      'getFilterOptions',
      'getFeatures',
      'getLandUseStyleFromGeoserver',
      'downloadGeoJsonLandUse',
      'getDataTableLandUse',
      'downloadTableLandUse',
    ]),
  },
};
</script>

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
    "total-area-label": "Total area",
    "total-poligono-label": "Total polygons",
    "regional-coordination-label": "Regional Coordination (All)",
    "indigenous-lands-label": "Indigenous Lands",
    "title-switch-disable-features": "Disable LandUse Layer",
    "table-label": "Table",
    "table-name": "Table Land Use"
  },
  "pt-br": {
    "legend": "Legenda:",
    "search-label": "Buscar",
    "opacity-label": "Opacidade",
    "current-view-label": "Pesquisar nesta área?",
    "year-label": "Ano",
    "total-area-label": "Área total",
    "total-poligono-label": "Total de polígonos",
    "regional-coordination-label": "Coordenação Regional (Todas)",
    "indigenous-lands-label": "Terras Indígenas",
    "title-switch-disable-features": "Desabilitar Camada de LandUse",
    "table-label": "Tabela",
    "table-name": "Tabela de Uso e Ocupação do Solo"
  }
}
</i18n>
