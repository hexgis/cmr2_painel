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
        <v-tooltip bottom>
          <template #activator="{ on }">
            <div
              class="d-flex justify-end align-center mt-1"
              v-on="on"
            >
              <v-switch
                v-if="currentUrlWmsLandUse"
                v-model="featuresLandUse"
                class="mt-3"
                hide-details
              />
            </div>
          </template>
          <span>
            {{
              featuresLandUse
                ? $t('title-switch-disable-features')
                : $t('title-switch-enable-features')
            }}
          </span>
        </v-tooltip>
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
            class="pa-0 mt-n3"
            outlined
          />
        </v-slide-y-transition>
      </v-col>
      <v-col class="py-0 full-width">
        <v-select
          v-model="filters.year"
          :label="$t('year-label')"
          :items="yearOptions"
          :required="true"
          outlined
          :menu-props="{ top: false, offsetY: true }"
        />
      </v-col>
      <v-col cols="12">
        <v-btn
          block
          small
          color="primary"
          outlined
          :loading="loadingLandUse"
          class="pa-0 mt-n8"
          @click="searchLandUse"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row
      v-if="showFeaturesLandUse && features && features.features && features.features.length > 0"
      no-gutters
      align="center"
      class="mt-3"
    >
      <v-col
        cols="12"
        class="mt-n3 mb-1"
      >
        <v-btn
          color="accent"
          :loading="isLoadingGeoJson"
          fab
          small
          icon
          @click="downloadGeoJsonLandUse()"
        >
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-icon v-on="on">
                mdi-download
              </v-icon>
            </template>
            <span>{{ $t('download-label') }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          :loading="isLoadingTable"
          icon
          fab
          small
          color="accent"
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
      <v-row class="mt-2">
        <v-col
          cols="4"
          class="grey--text text--darken-2"
        >
          {{ $t('opacity-label') }}
        </v-col>
        <v-col cols="8">
          <v-slider
            v-if="opacity !== null"
            v-model="opacity"
            hide-details
            thumb-label
            @input="updateOpacity"
          />
        </v-col>
      </v-row>
      <v-col cols="12">
        <v-divider />
      </v-col>
      <v-col cols="12">
        <p class="font-weight-regular pt-2 grey--text text--darken-2 mb-n6">
          {{ $t('legend') }}
        </p>
      </v-col>
      <v-row
        v-if="legendItems.length"
        class="mt-2"
      >
        <v-col>
          <v-list
            dense
            flat
          >
            <v-list-item
              v-for="item in legendItems"
              :key="item.estagio"
              class="pa-1 compact-list-item"
              :class="{ 'active-legend-item': item.active }"
            >
              <v-list-item-icon class="my-0">
                <span
                  class="legend-color"
                  :style="{ backgroundColor: item.color }"
                />
              </v-list-item-icon>
              <v-list-item-content class="py-0">
                <span class="grey--text text--darken-2 compact-text">
                  {{ item.label }}
                </span>
              </v-list-item-content>
              <v-list-item-action class="my-0 compact-action">
                <v-switch
                  v-model="item.visible"
                  :loading="loadingEstagios[item.estagio]"
                  @change="toggleLegendItem(item)"
                />
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-row>
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
  </v-col>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import TableDialog from '../table-dialog/TableDialog.vue';

export default {
  name: 'LandUseFilters',
  components: { TableDialog },
  data() {
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = 2015; year <= currentYear; year += 1) {
      yearOptions.push(year);
    }

    return {
      yearOptions: [2015, 2019].filter((year) => year <= new Date().getFullYear()),
      filters: {
        year: currentYear,
        currentView: false,
        priority: null,
        cr: [],
        ti: [],
      },
      error: false,
      headers: [
        { text: 'Código Funai', value: 'co_funai' },
        { text: 'Coordenação Regional', value: 'ds_cr' },
        { text: 'Terra Indígena', value: 'no_ti' },
        { text: 'Ano', value: 'nu_ano' },
        { text: 'Agropecuária (ha)', value: 'nu_area_ag_ha' },
        { text: 'Corte raso (ha)', value: 'nu_area_cr_ha' },
        { text: 'Degradação (ha)', value: 'nu_area_dg_ha' },
        { text: 'Massa de água (ha)', value: 'nu_area_ma_ha' },
        { text: 'Silvicultura (ha)', value: 'nu_area_sv_ha' },
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
      flattened: [],
      dialog: false,
      tableDialogLand: false,
      isLoadingTable: false,
      isLoadingCSV: false,
      isLoadingGeoJson: false,
      loadingEstagios: {}, // Objeto para rastrear o estado de carregamento de cada estágio
    };
  },
  computed: {
    totalArea() {
      if (this.features && this.features.features && this.features.features.length) {
        const total = this.features.features.reduce(
          (sum, feature) => sum + ((feature.properties && feature.properties.nu_area_ha) || 0),
          0,
        );
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
      'loadingLandUse',
      'filterOptions',
      'features',
      'showFeaturesLandUse',
    ]),
  },
  watch: {
    'filters.cr': function filtersCrWatcher(value) {
      const arrayCrPopulate = value.map((item) => item.co_cr);
      this.populateTiOptions(arrayCrPopulate);
    },
    'filterOptions.regionalFilters': function regionalFiltersWatcher() {
      this.populateCrOptions();
    },
    opacity() {
      this.$store.dispatch('land-use/generateUrlWmsLandUse');
    },
  },
  mounted() {
    this.getFilterOptions();
    this.getLandUseStyleFromGeoserver();
  },
  methods: {
    debounce(func, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    },

    // Método updateOpacity usando debounce
    updateOpacity(value) {
      this.debounce((val) => {
        this.opacity = val;
      }, 100)(value);
    },

    formatFieldValue(value, field = '') {
      if (value === null || value === undefined) {
        return 'N/A';
      }

      const fieldName = field.toLowerCase();
      const isDateField = typeof value === 'string'
        && (fieldName.startsWith('dt_')
          || fieldName.startsWith('data_')
          || fieldName.startsWith('date'))
        && this.$moment(value).isValid();
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
        let parsedValue = value;
        if (typeof value === 'string') {
          parsedValue = parseFloat(value);
        }
        if (Number.isNaN(parsedValue)) {
          return 'N/A';
        }
        const rounded = parsedValue.toFixed(2);
        const [intPart, decimalPart] = rounded.split('.');

        return decimalPart !== '00' || (fieldName.startsWith('nu_') && fieldName.includes('area'))
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`
          : parseInt(value, 10).toString();
      }

      return value.toString() || 'N/A';
    },
    populateCrOptions() {
      this.flattened = [];
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
        this.flattened.push({ header: categoryId });
        this.flattened.push(...category.list);
      });
    },
    populateTiOptions(cr) {
      if (cr && cr.length) {
        this.$store.dispatch('land-use/getTiOptions', cr);
      } else {
        this.filters.ti = [];
      }
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

        // Verificar se todos os estágios estão desativados
        const allEstagiosDisabled = Object.values(this.$store.state['land-use'].legendVisibility).every(
          (visible) => !visible,
        );

        if (allEstagiosDisabled) {
          // Limpar legendVisibility, features e tableLandUse
          this.$store.commit('land-use/resetLegendVisibility');
          this.$store.commit('land-use/clearFeatures');
          this.$store.commit('land-use/setTableLandUse', []);
        }

        this.filteredYears = [year];
        this.setFilters(filtersForStore);
        this.getFeatures().then(() => {
          this.getDataTableLandUse();
        });
      } else {
        this.error = true;
      }
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

    toggleLegendItem(item) {
      return this.debounce(async () => {
        try {
        // Ativa o loading para o estágio específico
          this.$set(this.loadingEstagios, item.estagio, true);
          await this.$store.dispatch('land-use/toggleLegendVisibility', {
            estagio: item.estagio,
            visible: item.visible,
          });
        } catch (error) {
          console.error('Erro ao alternar visibilidade do estágio:', error);
          // Reverte o switch para o estado anterior em caso de erro
          const revertedItem = { ...item, visible: !item.visible };
          const idx = this.legendItems.findIndex((i) => i.estagio === item.estagio);
          this.$set(this.legendItems, idx, revertedItem);
        } finally {
        // Desativa o loading para o estágio
          this.$set(this.loadingEstagios, item.estagio, false);
        }
      }, 300)();
    },
    ...mapMutations('land-use', ['setFilters']),
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
  margin-top: 12px;
  padding: 0px;
}

.compact-list-item {
  min-height: 32px !important;
  margin: 0 !important;
  padding: 0px 0px !important;
}

.compact-text {
  font-size: 14px !important;
  line-height: 1.4 !important;
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
    "download-label": "Download",
    "table-label": "Table",
    "table-name": "Table Land Use",
    "title-switch-disable-features": "Disable LandUse Layer",
    "title-switch-enable-features": "Enable LandUse Layer"

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
    "title-switch-disable-features": "Desabilitar Camada de Uso e Ocupação do Solo",
    "download-label": "Baixar",
    "table-label": "Tabela",
     "table-name": "Tabela de Uso e Ocupação do Solo",
    "title-switch-disable-features": "Desabilitar Camada de Uso e Ocupação do Solo",
    "title-switch-enable-features": "Habilitar Camada de Uso e Ocupação do Solo"

  }
}
</i18n>
