<template>
  <v-col class="px-4">
    <v-row class="px-3">
      <v-checkbox
        v-model="filters.currentView"
        :label="$t('current-view-label')"
      />
      afsdfasdf
    </v-row>

    <v-row class="px-3 pb-1">
      <v-combobox
        v-model="filters.cr"
        :label="$t('coordination-label')"
        :items="flattened"
        item-value="co_cr"
        item-text="ds_cr"
        hide-details
        clearable
        multiple
      />
    </v-row>

    <v-slide-y-transition>
      <v-row
        v-if="filters.cr && filterOptions.tiFilters"
        class="px-3 pb-1"
      >
        <v-combobox
          v-model="filters.ti"
          :label="$t('indigenous-lands-label')"
          :items="filterOptions.tiFilters"
          item-text="no_ti"
          item-value="co_funai"
          clearable
          multiple
          hide-details
        />
      </v-row>
    </v-slide-y-transition>

    <v-row class="px-3 pb-1">
      <v-select
        v-model="filters.priority"
        :label="$t('priorities-label')"
        :items="filterOptions.priority"
        item-text="no_pr"
        item-value="co_pr"
        clearable
        multiple
      />
    </v-row>

    <v-row class="pt-1">
      <v-col class="py-0 full-width">
        <BaseDateField
          v-model="filters.startDate"
          :label="$t('start-date-label')"
          :required="true"
          outlined
        />
      </v-col>

      <v-col class="py-0 full-width">
        <BaseDateField
          v-model="filters.endDate"
          :label="$t('end-date-label')"
          :required="true"
          :min-date="filters.startDate"
          outlined
        />
      </v-col>
    </v-row>

    <v-row
      no-gutters
      align="center"
    >
      <v-col v-show="showFeatures">
        <v-btn
          color="accent"
          :loading="isLoadingGeoJson"

          small
          icon
          @click="downloadGeoJson()"
        >
          <v-tooltip left>
            <template #activator="{ on }">
              <v-icon

                v-on="on"
              >
                mdi-download
              </v-icon>
            </template>
            <span>{{ $t('download-label') }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          small
          :loading="isLoadingTable"
          icon
          color="accent"
          @click="showTablePriority(true)"
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
      <v-col v-if="!showFeatures">
        <v-btn
          block
          small
          color="primary"
          outlined
          :loading="isLoadingFeatures"
          @click="search"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
      <v-col
        v-if="showFeatures"
        class="ml-6"
      >
        <v-btn
          block
          small
          color="primary"
          outlined
          :loading="isLoadingFeatures"
          @click="search"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-divider
      v-if="!isLoadingFeatures && showFeatures"
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
      <v-divider />
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
            cols="10"
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
      <v-row v-if="showFeatures && total">
        <v-col
          cols="7"
          class="grey--text text--darken-2 text-label"
        >
          {{ $t('polygon-label') }}:
        </v-col>
        <v-col
          cols="5"
          class="text-right text-label"
        >
          {{ total.total }}
        </v-col>
      </v-row>

      <v-row
        v-if="
          showFeatures && total && total.area_ha && !isLoadingFeatures
        "
      >
        <v-col
          cols="7"
          class="grey--text text--darken-2 text-label"
        >
          {{ $t('total-area-label') }}:
        </v-col>
        <v-col
          cols="5"
          class="text-right text-label"
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
      v-if="showFeatures && !isLoadingFeatures"
      align="center"
    >
      <v-col
        cols="4"
        class="grey--text text--darken-2 mt-1 text-label"
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
      v-if="showFeatures && !isLoadingFeatures"
      align="center"
      justify="space-between"
    >
      <v-col>
        <span class="grey--text text--darken-2 text-label">
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

    <v-row
      align="center"
      justify="space-around"
    >
      <div
        v-if="tableDialogPriority"
        class="d-none"
      >
        <TableDialog
          :table="tableDialogPriority"
          :value="table"
          :headers="headers"
          :loading-table="isLoadingTable"
          :loading-c-s-v="isLoadingCSV"
          :f-download-c-s-v="downloadTable"
          :f-close-table="closeTable"
          :table-name="$t('table-name')"
        />
      </div>
    </v-row>
  </v-col>
</template>

<i18n>
    {
        "en": {
            "search-label": "Search",
            "opacity-label": "Opacity",
            "current-view-label": "Search in current area?",
            "coordination-label": "Regional Coordination",
            "indigenous-lands-label": "Indigenous Lands",
            "priorities-label": "Priorities",
            "start-date-label": "Start Date",
            "total-area-label": "Total Area",
            "heat-map-label": "Heat Map",
            "polygon-label": "Polygon Count",
            "end-date-label": "End Date",
            "table-name": "Priority Polygons",
            "download-label": "Download",
            "table-label": "Table"
        },
        "pt-br": {
            "search-label": "Buscar",
            "opacity-label": "Opacidade",
            "current-view-label": "Pesquisar nesta área?",
            "coordination-label": "Coordenação Regional",
            "indigenous-lands-label": "Terras Indígenas",
            "priorities-label": "Prioridades",
            "total-area-label": "Área total",
            "heat-map-label": "Mapa de Calor",
            "polygon-label": "Total de polígonos",
            "start-date-label": "Data Início",
            "end-date-label": "Data Fim",
            "table-name": "Polígonos prioritários",
            "download-label": "Baixar",
            "table-label": "Tabela"
        }
    }
</i18n>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import BaseDateField from '@/components/base/BaseDateField';
import legend from '@/assets/legend.png';
import TableDialog from '@/components/table-dialog/TableDialog.vue';

export default {
  name: 'FunaiFilter',

  components: { BaseDateField, TableDialog },

  data() {
    return {
      isGeoserver: process.env.MONITORING_GEOSERVER === 'true',
      filters: {
        startDate: this.$moment()
          .subtract(30, 'days')
          .format('YYYY-MM-DD'),
        endDate: this.$moment().format('YYYY-MM-DD'),
        currentView: false,
        priority: null,
        cr: null,
        ti: null,
      },
      headers: [
        { text: 'Identificador', value: 'id' },
        { text: 'Código Funai', value: 'co_funai' },
        { text: 'Terra Indígena', value: 'no_ti' },
        { text: 'Coordenação Regional', value: 'ds_cr' },
        { text: 'Classe', value: 'no_estagio' },
        { text: 'Data da Imagem', value: 'dt_imagem' },
        { text: 'Área do Polígono (ha)', value: 'nu_area_ha' },
        { text: 'Latitude', value: 'nu_latitude' },
        { text: 'Longitude', value: 'nu_longitude' },
        { text: 'Prioridade', value: 'prioridade' },
        { text: 'Ações', value: 'actions' },
      ],
      isLoadingTotal: false,
      legendData: legend,
      checkNewFilters: false,
      dialog: false,
      flattened: [],
    };
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
  computed: {
    opacity: {
      get() {
        return this.$store.state.priority.opacity;
      },
      set(value) {
        this.$store.commit('priority/setOpacity', value);
      },
    },

    heatMap: {
      get() {
        return this.$store.state.priority.heatMap;
      },
      set(value) {
        this.$store.commit('priority/setHeatMap', value);
      },
    },

    ...mapState('priority', [
      'isLoadingGeoJson',
      'isLoadingTable',
      'isLoadingFeatures',
      'filterOptions',
      'showFeatures',
      'total',
      'params',
      'tableDialogPriority',
      'table',
      'isLoadingCSV',
      'features',
    ]),
  },

  mounted() {
    this.getFilterOptions();
  },

  methods: {
    populateCrOptions() {
      const groups = {};

      this.filterOptions.regionalFilters.forEach((x) => {
        groups[x.no_regiao] = groups[x.no_regiao] || { ds_cr: x.ds_cr, list: [] };

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
      if (cr) this.$store.dispatch('priority/getTiOptions', cr);
      else this.filters.ti = null;
    },

    showTablePriority(value) {
      if (this.features) {
        this.settableDialogPriority(value);
        this.setshowTableDialog(value);
        this.getDataTable();
      }
    },

    closeTable(value) {
      if (!this.checkNewFilters) {
        this.settableDialogPriority(value);
        this.setshowTableDialog(value);
      } else {
        this.settableDialogPriority(value);
        this.setshowTableDialog(value);
        this.getFeatures();
        this.checkNewFilters = false;
      }
    },

    search() {
      this.setFilters(this.filters);
      this.$emit('onSearch');
    },
    ...mapMutations('tableDialog', ['setshowTableDialog']),
    ...mapMutations('priority', ['setFilters', 'settableDialogPriority']),
    ...mapActions('priority', ['getFilterOptions', 'downloadGeoJson', 'downloadTable', 'getDataTable', 'getFeatures']),
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
