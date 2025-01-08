<template>
  <v-col class="px-4">
    <v-row class="px-3 py-3">
      <v-autocomplete
        ref="filters.cr"
        v-model="filters.cr"
        :label="$t('regional-coordination-label')"
        :items="flattened"
        item-value="co_cr"
        item-text="ds_cr"
        multiple
        hide-details
        clearable
        required
        :error="errorRegional"
        :search-input.sync="searchCr"
        @change="clearSearchCr"
      />
    </v-row>

    <v-slide-y-transition>
      <v-row
        class="px-3 pb-3"
      >
        <v-autocomplete
          ref="filters.ti"
          v-model="filters.ti"
          :label="$t('indigenous-lands-label')"
          :items="filteredTiFilters"
          item-text="no_ti"
          item-value="co_funai"
          hide-details
          clearable
          chips
          required
          multiple
          :error="errorTi"
          :search-input.sync="searchTi"
          :disabled="isLoadingTi"
          @change="clearSearchTi"
        />
      </v-row>
    </v-slide-y-transition>

    <v-row
      v-if="filters.ti && filterOptions.tiFilters && filterOptions.year"
      class="pt-1 px-3"
    >
      <v-select
        v-model="filters.year"
        :label="$t('year-label')"
        :items="filterOptions.year"
        item-text="nu_ano"
        item-value="map_year"
        clearable
        multiple
        :error="errorAno"
        required
      />
    </v-row>
    <v-row
      no-gutters
      align="center"
      class="pt-3"
    >
      <v-col v-show="showFeaturesLandUse">
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
              <v-icon
                v-on="on"
              >
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
          :loading="isLoadingFeatures"
          @click="search()"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-divider
      v-if="showFeaturesLandUse && !isLoadingFeatures"
      class="mt-4"
    />
    <div
      v-if="isLoadingFeatures"
      class="mt-4"
    >
      <v-row justify="center">
        <v-col cols="6">
          <v-skeleton-loader type="table-cell@4" />
        </v-col>
        <v-col cols="6">
          <div class="d-flex justify-end">
            <v-skeleton-loader type="table-cell@4" />
          </div>
        </v-col>
      </v-row>
      <v-divider class="mt-1" />
      <div>
        <v-skeleton-loader type="table-cell" />
        <v-row
          v-for="n in 5"
          :key="n"
          no-gutters
          align="center"
          class="mb-4"
        >
          <v-col cols="1">
            <v-skeleton-loader
              width="20"
              height="20"
              tile
              type="avatar"
            />
          </v-col>

          <v-col
            cols="4"
            class="mt-1"
          >
            <v-skeleton-loader type="text" />
          </v-col>
        </v-row>
      </div>
    </div>

    <v-row
      v-if="total && !isLoadingFeatures"
      class="px-3 py-1 mt-7"
    >
      <v-row v-if="showFeaturesLandUse && total && total.area_ha">
        <v-col
          cols="7"
          class="grey--text text--darken-2"
        >
          {{ $t('polygon-label') }}:
        </v-col>
        <v-col
          cols="5"
          class="text-right"
        >
          {{ total.total }}
        </v-col>
        <v-col
          cols="7"
          class="grey--text text--darken-2"
        >
          {{ $t('total-area-label') }}:
        </v-col>
        <v-col
          cols="5"
          class="text-right"
        >
          {{
            total.area_ha.toLocaleString($i18n.locale, {
              maximumFractionDigits: 2,
            })
          }}
          ha
        </v-col>
      </v-row>
    </v-row>

    <v-row
      v-if="showFeaturesLandUse && !isLoadingFeatures"
      align="center"
    >
      <v-col
        cols="4"
        class="grey--text text--darken-2 mt-1"
      >
        {{ $t('opacity-label') }}
      </v-col>
      <v-col cols="8">
        <v-slider
          v-model="opacity"
          class="my-n2"
          hide-details
          thumb-label
        />
      </v-col>
    </v-row>
    <v-row
      v-if="showFeaturesLandUse && !isLoadingFeatures"
      align="center"
      justify="space-between"
    >
      <v-col>
        <span class="grey--text text--darken-2">
          {{ $t('heat-map-label') }}
        </span>
      </v-col>
      <v-col
        cols="3"
        class="d-flex justify-end"
      >
        <v-switch
          v-model="heatMap"
          class="mt-0 pt-0"
          hide-details
        />
      </v-col>
    </v-row>
    <div
      v-if="tableDialogLand"
      class="d-none"
    >
      <TableDialog
        :table="tableDialogLand"
        :headers="headers"
        :value="tableLandUse"
        :loading-table="isLoadingTable"
        :loading-c-s-v="isLoadingCSV"
        :table-name="$t('table-name')"
        :f-download-c-s-v="downloadTableLandUse"
        :f-close-table="closeTable"
      />
    </div>
  </v-col>
</template>

<i18n>
    {
        "en": {
            "regional-coordination-label": "Regional Coordination",
            "indigenous-lands-label": "Indigenous Lands",
            "year-label": "Year",
            "search-label": "Search",
            "opacity-label": "Opacity",
            "current-view-label": "Search in current area?",
            "start-date-label": "Start Date",
            "total-area-label": "Total area",
            "heat-map-label": "Heat map",
            "polygon-label": "Total polygons count",
            "end-date-label": "End Date",
            "table-label": "Table",
            "table-name": "Table Land Use"
        },
        "pt-br": {
            "regional-coordination-label": "Coordenação Regional",
            "indigenous-lands-label": "Terras Indígenas",
            "year-label": "Ano",
            "search-label": "Buscar",
            "opacity-label": "Opacidade",
            "current-view-label": "Pesquisar nesta área?",
            "total-area-label": "Área total",
            "heat-map-label": "Mapa de calor",
            "polygon-label": "Total de polígonos",
            "table-label": "Tabela",
            "start-date-label": "Data Início",
            "end-date-label": "Data Fim",
            "table-name": "Tabela de Uso e Ocupação do Solo"
        }
    }
</i18n>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import BaseDateField from '@/components/base/BaseDateField';
import legend from '@/assets/legend.png';
import TableDialog from '@/components/table-dialog/TableDialog.vue';

export default {
  name: 'LandUseFilter',

  components: { BaseDateField, TableDialog },

  data() {
    return {
      isLoadingTi: false,
      isGeoserver: process.env.MONITORING_GEOSERVER === 'true',
      searchTi: '',
      searchCr: '',
      filters: {
        currentView: false,
        year: [],
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
        { text: 'Total (ha)', value: 'nu_area_km2' },
      ],
      isLoadingTotal: false,
      legendData: legend,
      errorRegional: false,
      errorAno: false,
      errorTi: false,
      flattened: [],
    };
  },

  watch: {
    'filters.cr': function (value) {
      this.filters.ti = null;
      this.populateTiOptions(value);
    },

    'filters.ti': function (value) {
      this.populateYearsOptions(value);
    },

    'filterOptions.regionalFilters': function () {
      this.populateCrOptions();
    },
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

    heatMap: {
      get() {
        return this.$store.state['land-use'].heatMap;
      },
      set(value) {
        this.$store.commit('land-use/setHeatMap', value);
      },
    },
    filteredTiFilters() {
      if (this.searchTi) {
        return this.filterOptions.tiFilters.filter((item) => item.no_ti.toLowerCase().includes(this.searchTi.toLowerCase()));
      }
      return this.filterOptions.tiFilters;
    },
    ...mapState('land-use', [
      'features',
      'isLoadingGeoJson',
      'isLoadingFeatures',
      'filterOptions',
      'showFeaturesLandUse',
      'total',
      'params',
      'tableDialogLand',
      'tableLandUse',
      'isLoadingCSV',
      'isLoadingTable',
      'isLoadingFeatures',
    ]),
  },

  mounted() {
    this.getFilterOptions();
    this.populateTiOptions();
  },

  methods: {
    populateCrOptions() {
      const groups = {};

      this.filterOptions.regionalFilters.forEach((x) => {
        groups[x.no_regiao] = groups[x.no_regiao] || { ds_cr: x.ds_cr, list: [] };

        groups[x.no_regiao].list.push(x);
      });

      Object.keys(groups).forEach((categoryId) => {
        const categoryExists = this.flattened.some((item) => item.header === categoryId);
        if (!categoryExists) {
          const category = groups[categoryId];
          const categoryRegiao = categoryId;
          this.flattened.push({ header: categoryRegiao });
          this.flattened.push(...category.list);
        }
      });

      return this.flattened;
    },

    clearSearchCr() {
      this.searchCr = '';
    },

    clearSearchTi() {
      this.searchTi = '';
    },

    /**
 * Populates the TI options based on the provided regional coordination.
 * @param {Object|null} cr - The cr for filtering TI options. Pass `null` for no filtering.
 */
    populateTiOptions(cr) {
      this.isLoadingTi = true;
      const action = cr
        ? this.$store.dispatch('land-use/getTiOptions', cr)
        : this.$store.dispatch('land-use/getTiOptions');

      action.finally(() => {
        this.isLoadingTi = false;
      });
    },

    populateYearsOptions(ti) {
      if (ti) this.$store.dispatch('land-use/getYearsOptions', ti);
      else this.filters.year = null;
    },

    search() {
      this.errorAno = !this.filters.year.length;
      this.errorTi = !this.filters.ti.length;

      if (
        !this.errorAno
        && !this.errorTi
      ) {
        this.setFilters(this.filters);
        this.$emit('onSearch');
      }
    },

    closeTable(value) {
      if (!this.checkNewFilters) {
        this.settableDialogLand(value);
        this.setshowTableDialog(value);
      } else {
        this.settableDialogLand(value);
        this.setshowTableDialog(value);
        this.getFeatures();
        this.checkNewFilters = false;
      }
    },

    showTableDialog(value) {
      if (this.features) {
        this.settableDialogLand(value);
        this.setshowTableDialog(value);
        this.getDataTableLandUse();
      }
    },

    ...mapMutations('tableDialog', ['setshowTableDialog']),

    ...mapMutations('land-use', ['setFilters', 'settableDialogLand', 'setshowTableDialog']),
    ...mapActions('land-use', [
      'getFilterOptions',
      'downloadGeoJsonLandUse',
      'getDataTableLandUse',
      'getFeatures',
      'downloadTableLandUse',
    ]),
  },
};
</script>

<style scoped lang="sass"></style>
