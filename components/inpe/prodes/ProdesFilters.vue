<template>
  <v-col>
    <v-row>
      <!-- Pesquisar nesta área -->
      <v-col
        cols="9"
        class="pt-0 mt-0"
      >
        <v-checkbox
          v-model="filters.currentView"
          :label="$t('current-view-label')"
          :error="error"
          hide-details
        />
      </v-col>
      <!-- Switch de camada -->
      <v-col
        cols="3"
        class="pt-0 mt-0"
      >
        <v-tooltip top>
          <template #activator="{ props }">
            <div
              class="d-flex justify-end align-center mt-1"
              v-bind="props"
            >
              <v-switch
                v-if="currentUrlWmsProdes"
                v-model="featuresProdes"
                class="mt-3"
                hide-details
              />
            </div>
          </template>
          <span>
            {{
              showFeaturesProdes
                ? $t('title-switch-disable-features')
                : $t('title-switch-enable-features')
            }}
          </span>
        </v-tooltip>
      </v-col>
      <!-- Coordenação Regional -->
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
      <!-- Terras Indígenas -->
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
            class="pa-0 mt-n3"
            outlined
          />
        </v-slide-y-transition>
      </v-col>
      <!-- Anos -->
      <v-col
        cols="6"
        class="py-0"
      >
        <v-select
          v-model="filters.startYear"
          :label="$t('start-year-label')"
          :items="getYearsRange"
          :required="true"
          outlined
        />
      </v-col>
      <v-col
        cols="6"
        class="py-0"
      >
        <v-select
          v-model="filters.endYear"
          :label="$t('end-year-label')"
          :items="getYearsRange"
          :required="true"
          outlined
        />
      </v-col>
      <!-- Botão Buscar -->
      <v-col
        cols="12"
        class="mt-n6"
      >
        <v-btn
          block
          small
          color="primary"
          outlined
          :loading="loadingProdes"
          @click="searchProdes"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
    </v-row>
    <!-- Loading Skeleton -->
    <div
      v-if="isLoadingFeatures"
      class="mt-1"
    >
      <v-row
        no-gutters
        justify="center"
      >
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
          v-for="n in 4"
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
          <v-col cols="10">
            <v-skeleton-loader type="text" />
          </v-col>
        </v-row>
      </div>
    </div>
    <!-- Resultados -->
    <v-row
      v-else-if="showFeaturesProdes && features.features.length > 0"
      no-gutters
      align="center"
      class="mt-3"
    >
      <!-- Botão Tabela -->
      <v-col
        cols="12"
        class="mt-n1 mb-1"
      >
        <v-btn
          icon
          small
          color="accent"
          :loading="isLoadingTable"
          @click="showTableDialog(true)"
        >
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-icon v-on="on">
                mdi-table
              </v-icon>
            </template>
            <span>{{ $t('table-label') }}</span>
          </v-tooltip>
        </v-btn>
      </v-col>
      <v-col cols="12">
        <v-divider />
      </v-col>
      <!-- Totais -->
      <v-col
        cols="12"
        class="grey--text text--darken-2 d-flex justify-space-between mt-2 mb-4"
      >
        <span>{{ $t('total-poligono-label') }}:</span>
        {{ features.features.length }}
      </v-col>
      <v-col
        cols="12"
        class="grey--text text--darken-2 d-flex justify-space-between"
      >
        <span>{{ $t('total-area-label') }}:</span>
        {{ totalArea }} ha
      </v-col>
      <v-col
        cols="12"
        class="mt-2"
      >
        <v-divider />
      </v-col>
      <!-- Opacidade -->
      <v-row class="mt-0">
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
      <v-col cols="12">
        <v-divider />
      </v-col>
      <!-- Legenda -->
      <v-col cols="12">
        <p class="font-weight-regular pt-2 grey--text text--darken-2 mb-n6">
          {{ $t('legend') }}
        </p>
      </v-col>
      <v-row
        v-if="legendItems.length"
        class="mt-2 mb-2"
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
                  :style="{ backgroundColor: item.color || '#000' }"
                />
              </v-list-item-icon>
              <v-list-item-content class="ml-n8 mb-1">
                <v-list-item-title>{{ item.label }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-row>
    <!-- Diálogo de Tabela -->
    <TableDialog
      :table="tableDialogProdes"
      :headers="headers"
      :value="formattedTableProdes"
      :loading-table="isLoadingTable"
      :loading-c-s-v="isLoadingCSV"
      :table-name="$t('table-name')"
      :f-download-c-s-v="downloadTableProdes"
      :f-close-table="closeTable"
    />
  </v-col>
</template>

<script>
import {
  mapMutations, mapState, mapActions, mapGetters,
} from 'vuex';
import TableDialog from '../../table-dialog/TableDialog.vue';

export default {
  name: 'ProdesFilters',
  components: { TableDialog },

  data() {
    return {
      filters: {
        startYear: null,
        endYear: null,
        currentView: false,
        cr: [],
        ti: null,
      },
      filteredYears: [],
      error: false,
      flattened: [],
      tableDialogProdes: false,
      isLoadingTable: false,
      isLoadingCSV: false,
      isLoadingFeatures: false,
      headers: [
        { text: 'Código Funai', value: 'co_funai' },
        { text: 'ID', value: 'origin_id' },
        { text: 'Terra Indígena', value: 'no_ti' },
        { text: 'Código CR', value: 'co_cr' },
        { text: 'Coordenação Regional', value: 'ds_cr' },
        { text: 'Classe', value: 'no_classe' },
        { text: 'UF', value: 'sg_uf' },
        { text: 'Ano', value: 'nu_ano' },
        { text: 'Órbita', value: 'nu_orbita' },
        { text: 'Ponto', value: 'nu_ponto' },
        { text: 'Data Imagem', value: 'dt_imagem' },
        { text: 'Área (km)', value: 'nu_area_km2' },
        { text: 'Área (ha)', value: 'nu_area_ha' },
      ],
    };
  },

  computed: {
    totalArea() {
      if (!this.features.features.length) return 0;
      const total = this.features.features.reduce(
        (sum, feature) => sum + (feature.properties.nu_area_ha || 0),
        0,
      );
      return this.formatFieldValue(total, 'nu_area_ha');
    },

    opacity: {
      get() {
        return this.$store.state.prodes.opacity;
      },
      set(value) {
        this.$store.commit('prodes/setOpacity', value);
      },
    },

    featuresProdes: {
      get() {
        return this.$store.state.prodes.showFeaturesProdes;
      },
      set(value) {
        this.$store.commit('prodes/setshowFeaturesProdes', value);
      },
    },

    legendItems() {
      const { prodesStyles } = this.$store.state.prodes;
      if (!prodesStyles) return [];
      const availableYears = Object.keys(prodesStyles)
        .filter((year) => {
          const y = parseInt(year, 10);
          return y >= this.filters.startYear && y <= this.filters.endYear;
        })
        .sort((a, b) => b - a);

      return availableYears.map((year) => ({
        label: String(year),
        color: prodesStyles[year] || '#000',
      }));
    },

    formattedTableProdes() {
      if (!this.tableProdes.length) return [];
      return this.tableProdes.map((item) => {
        const formattedItem = { ...item };
        this.headers.forEach((header) => {
          formattedItem[header.value] = this.formatFieldValue(
            item[header.value],
            header.value,
          );
        });
        return formattedItem;
      });
    },

    ...mapGetters('prodes', ['getYearsRange']),
    ...mapState('prodes', [
      'currentUrlWmsProdes',
      'loadingProdes',
      'filterOptions',
      'features',
      'showFeaturesProdes',
      'tableProdes',
    ]),
  },

  watch: {
    'filters.cr': function (val) {
      if (val.length) this.filters.currentView = false;
      const arrayCr = val.map((item) => item.co_cr);
      this.populateTiOptions(arrayCr);
    },

    'filters.currentView': function (val) {
      if (val) this.filters.cr = [];
    },

    'filterOptions.regionalFilters': function () {
      this.populateCrOptions();
    },

    'filters.startYear': function (newVal) {
      if (newVal > this.filters.endYear) {
        this.filters.endYear = newVal;
      }
    },
  },

  async mounted() {
    await this.getFilterOptions();
    await this.getProdesStyleFromGeoserver();
    this.initializeFilters();
  },

  methods: {
    formatFieldValue(value, field = '') {
      if (value === null || value === undefined) return 'N/A';
      const fieldName = field.toLowerCase();
      const isDate = typeof value === 'string'
        && (fieldName.startsWith('dt_')
          || fieldName.startsWith('data_')
          || fieldName.startsWith('date'))
        && this.$moment(value).isValid();
      if (isDate) return this.$moment(value).format('DD/MM/YYYY');
      if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
      if (typeof value === 'number' || fieldName.startsWith('nu_')) {
        const parsed = parseFloat(value);
        if (Number.isNaN(parsed)) return 'N/A';
        const rounded = parsed.toFixed(2);
        const [intPart, decPart] = rounded.split('.');
        return decPart !== '00'
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decPart}`
          : parseInt(value, 10).toString();
      }
      return value.toString();
    },

    populateCrOptions() {
      const groups = {};
      this.flattened = [];
      this.filterOptions.regionalFilters.forEach((x) => {
        groups[x.no_regiao] = groups[x.no_regiao] || [];
        groups[x.no_regiao].push(x);
      });
      Object.keys(groups).forEach((regiao) => {
        this.flattened.push({ header: regiao });
        this.flattened.push(...groups[regiao]);
      });

      return this.flattened;
    },

    populateTiOptions(cr) {
      if (cr.length) this.$store.dispatch('prodes/getTiOptions', cr);
      else this.filters.ti = null;
    },

    getYearsInRange(start, end) {
      if (!this.$store.state.prodes.prodesStyles) return [];
      return Object.keys(this.$store.state.prodes.prodesStyles)
        .map(Number)
        .filter((y) => y >= start && y <= end)
        .sort((a, b) => b - a);
    },

    searchProdes() {
      const {
        currentView, cr, startYear, endYear,
      } = this.filters;
      if ((currentView || cr.length) && startYear && endYear) {
        this.error = false;
        this.isLoadingFeatures = true;
        this.filteredYears = this.getYearsInRange(startYear, endYear);
        this.setFilters({
          ...this.filters,
          startDate: `${startYear}-01-01`,
          endDate: `${endYear}-12-31`,
        });
        this.getFeatures()
          .then(() => {
            this.getDataTableProdes();
            this.isLoadingFeatures = false;
          })
          .catch(() => {
            this.isLoadingFeatures = false;
          });
      } else {
        this.error = true;
      }
    },

    async showTableDialog() {
      this.isLoadingTable = true;
      this.tableDialogProdes = true;
      await this.getDataTableProdes();
      this.isLoadingTable = false;
    },

    closeTable(value) {
      this.tableDialogProdes = value;
    },

    async downloadTableProdes() {
      this.$store.commit('prodes/setLoadingCSV', true);
      try {
        if (!this.tableProdes.length) throw new Error('Nenhum dado disponível');
        const headers = [
          'Código Funai',
          'ID',
          'Terra Indígena',
          'Código CR',
          'Coordenação Regional',
          'Classe',
          'UF',
          'Ano',
          'Órbita',
          'Ponto',
          'Data Imagem',
          'Área (km)',
          'Área (ha)',
        ];
        const csvContent = [
          headers.join(','),
          ...this.tableProdes.map((r) => [
            r.co_funai,
            r.origin_id,
            `"${r.no_ti}"`,
            r.co_cr,
            `"${r.ds_cr}"`,
            r.no_classe,
            r.sg_uf,
            r.nu_ano,
            r.nu_orbita,
            r.nu_ponto,
            r.dt_imagem,
            r.nu_area_km2,
            r.nu_area_ha,
          ].join(',')),
        ].join('\n');
        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'prodes_table.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      } finally {
        this.$store.commit('prodes/setLoadingCSV', false);
      }
    },

    initializeFilters() {
      const [initialDate] = this.getYearsRange.reverse();
      this.filters.startYear = initialDate;
      this.filters.endYear = initialDate;
    },

    ...mapMutations('prodes', ['setFilters']),
    ...mapActions('prodes', [
      'getFilterOptions',
      'getFeatures',
      'getProdesStyleFromGeoserver',
      'getDataTableProdes',
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
            "table-name": "Prodes Table",
            "table-label": "Table",
            "search-label": "Search",
            "opacity-label": "Opacity",
            "current-view-label": "Search in current area?",
            "start-year-label": "Start Year",
            "end-year-label": "End Year",
            "total-area-label": "Total Area",
            "total-poligono-label": "Total polygons",
            "regional-coordination-label": "Regional Coordination (All)",
            "indigenous-lands-label": "Indigenous Lands",
            "title-switch-enable-features": "Enable Monitoring Layer",
            "title-switch-disable-features": "Disable Prodes Layer"
        },
        "pt-br": {
            "legend": "Legenda:",
            "table-name": "Tabela de Prodes",
            "table-label": "Tabela",
            "search-label": "Buscar",
            "opacity-label": "Opacidade",
            "current-view-label": "Pesquisar nesta área?",
            "start-year-label": "Ano Início",
            "end-year-label": "Ano Final",
            "total-area-label": "Área total",
            "total-poligono-label": "Total de polígonos",
            "regional-coordination-label": "Coordenação Regional (Todas)",
            "indigenous-lands-label": "Terras Indígenas",
            "title-switch-enable-features": "Habilitar Camada de Monitoramento Diário",
            "title-switch-disable-features": "Desabilitar Camada de Prodes"
        }
    }
</i18n>
