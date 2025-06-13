<template>
  <v-col class="px-4">
    <!-- Filtros de Pesquisa -->
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
                v-if="currentUrlWmsMonitoring"
                v-model="featuresMonitoring"
                class="mt-3"
                hide-details
              />
            </div>
          </template>
          <span>
            {{
              featuresMonitoring
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
      <v-col
        cols="6"
        class="py-0"
      >
        <BaseDateField
          v-model="filters.startDate"
          :label="$t('start-date-label')"
          :required="true"
          outlined
          :min-date="'2015-01-01'"
        />
      </v-col>
      <v-col
        cols="6"
        class="py-0"
      >
        <BaseDateField
          v-model="filters.endDate"
          :label="$t('end-date-label')"
          :required="true"
          outlined
          :error="error"
          :min-date="'2015-01-01'"
        />
      </v-col>
      <v-col cols="12">
        <v-btn
          block
          small
          color="primary"
          outlined
          :loading="loadingMonitoring"
          class="pa-0 mt-n8"
          @click="searchMonitoring"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Resultados e Controles -->
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
    <v-row
      v-else-if="
        showFeaturesMonitoring
          && features.features.length > 0"
      no-gutters
      align="center"
      class="mt-3"
    >
      <v-col
        cols="12"
        class="mt-n3 mb-1"
      >
        <DialogConfirmDownload />
        <v-btn
          :loading="isLoadingStatistic"
          small
          color="accent"
          icon
          @click="showTableDialogAnalytics(true), (dialog = true)"
        >
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-icon v-on="on">
                mdi-chart-box
              </v-icon>
            </template>
            <span>{{ $t('statistics-label') }}</span>
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
      <v-col
        cols="12"
        class="mt-2"
      >
        <v-divider />
      </v-col>
      <v-row class="mt-0">
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
        <v-col class="mt-n6">
          <span class="grey--text text--darken-2">{{ $t('heat-map-label') }}</span>
        </v-col>
        <v-col
          cols="3"
          class="d-flex justify-end mt-n7 pr-1"
        >
          <v-switch
            v-model="heatMap"
            class="mt-0 pt-0"
            :loading="loadingHeatmap"
            :disabled="loadingHeatmap || !hasFeatures"
            hide-details
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
                <span class="grey--text text--darken-2 compact-text">{{ item.label }}</span>
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

    <!-- Diálogos -->
    <TableDialog
      :table="tableDialogMonitoring"
      :headers="headers"
      :value="formattedTableMonitoring"
      :loading-table="isLoadingTable"
      :loading-c-s-v="isLoadingCSV"
      :table-name="$t('table-name')"
      :f-download-c-s-v="downloadTableMonitoring"
      :f-close-table="closeTable"
    />
    <div
      v-if="dialog"
      class="d-none"
    >
      <AnalyticalDialog
        :value="analyticsMonitoringDialog"
        :close-dialog="closeAnalyticalDialog"
      />
    </div>
  </v-col>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import TableDialog from '../table-dialog/TableDialog.vue';
import BaseDateField from '../base/BaseDateField.vue';
import DialogConfirmDownload from './DialogConfirmDownload.vue';
import AnalyticalDialog from '../analytical-dialog/AnalyticalDialog.vue';

export default {
  name: 'MonitoringFilters',
  components: {
    TableDialog,
    BaseDateField,
    DialogConfirmDownload,
    AnalyticalDialog,
  },
  data() {
    return {
      filters: {
        startDate: this.$moment().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: this.$moment().format('YYYY-MM-DD'),
        currentView: false,
        priority: null,
        cr: [],
        ti: null,
      },
      error: false,
      headers: [
        { text: 'ID', value: 'origin_id' },
        { text: 'Código Funai', value: 'co_funai' },
        { text: 'Terra Indígena', value: 'no_ti' },
        { text: 'Coordenação Regional', value: 'ds_cr' },
        { text: 'Classe', value: 'no_estagio' },
        { text: 'Data da Imagem', value: 'dt_imagem' },
        { text: 'Área do Polígono (ha)', value: 'nu_area_ha' },
        { text: 'Latitude', value: 'nu_latitude' },
        { text: 'Longitude', value: 'nu_longitude' },
      ],
      filteredYears: [],
      checkNewFilters: false,
      isLoadingTotal: false,
      isLoadingFeatures: false, // Adicionado para controlar o skeleton loader
      flattened: [],
      dialog: false,
      tableDialogMonitoring: false,
      isLoadingTable: false,
      isLoadingCSV: false,
      isLoadingGeoJson: false,
      loadingEstagios: {},
    };
  },
  computed: {
    hasFeatures() {
      return this.features.features.length > 0;
    },
    totalArea() {
      if (this.features.features.length) {
        const total = this.features.features.reduce(
          (sum, feature) => sum + ((feature.properties && feature.properties.nu_area_ha) || 0),
          0,
        );
        return this.formatFieldValue(total, 'nu_area_ha');
      }
      return this.formatFieldValue(0, 'nu_area_ha');
    },
    formattedTableMonitoring() {
      if (!this.tableMonitoring || !this.tableMonitoring.length) {
        return [];
      }
      return this.tableMonitoring.map((item) => {
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
        return this.$store.state.monitoring.opacity;
      },
      set(value) {
        this.$store.commit('monitoring/setOpacity', value);
      },
    },
    heatMap: {
      get() {
        return this.$store.state.monitoring.heatMap;
      },
      set(value) {
        this.$store.dispatch('monitoring/generateHeatmapMonitoring', value);
      },
    },
    featuresMonitoring: {
      get() {
        return this.$store.state.monitoring.showFeaturesMonitoring;
      },
      set(value) {
        this.$store.commit('monitoring/setshowFeaturesMonitoring', value);
      },
    },
    legendItems() {
      return this.$store.getters['monitoring/getLegendItems'];
    },
    tableMonitoring() {
      return this.$store.state.monitoring.tableMonitoring;
    },
    ...mapState('monitoring', [
      'currentUrlWmsMonitoring',
      'loadingMonitoring',
      'filterOptions',
      'features',
      'analyticsMonitoringDialog',
      'isLoadingStatistic',
      'showFeaturesMonitoring',
      'loadingHeatmap',
    ]),
  },
  watch: {
    'filters.currentView': function filtersCurrentViewWatcher(value) {
      if (value && this.filters.cr.length > 0) {
        this.filters.cr = []; // Limpa o v-combobox se o checkbox for marcado
      }
    },
    'filters.cr': function filtersCrWatcher(value) {
      if (value.length > 0 && this.filters.currentView) {
        this.filters.currentView = false; // Desmarca o checkbox se algo for selecionado no combobox
      }
      const arrayCrPopulate = value.map((item) => item.co_cr);
      this.populateTiOptions(arrayCrPopulate);
    },
    'filterOptions.regionalFilters': function filterOptionsRegionalFiltersWatcher() {
      this.populateCrOptions();
    },
    opacity() {
      this.$store.dispatch('monitoring/generateUrlWmsMonitoring');
    },
  },
  mounted() {
    this.getFilterOptions();
    this.getMonitoringStyleFromGeoserver();
  },
  methods: {
    debounce(func, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    },
    updateOpacity(value) {
      this.debounce((val) => {
        this.opacity = val;
      }, 100)(value);
    },
    formatFieldValue(value, field = '') {
      if (value === null || value === undefined) return 'N/A';

      const fieldName = field.toLowerCase();
      const isDateField = typeof value === 'string'
        && (fieldName.startsWith('dt_') || fieldName.startsWith('data_') || fieldName.startsWith('date'))
        && this.$moment(value).isValid();
      const isBooleanField = typeof value === 'boolean';
      const isNumberField = typeof value === 'number';
      const isLatLongField = ['lat', 'lng', 'long', 'latitude', 'longitude'].some((key) => fieldName.includes(key));

      if (isDateField) return this.$moment(value).format('DD/MM/YYYY');
      if (isBooleanField) return value ? 'Sim' : 'Não';
      if (isNumberField || fieldName.startsWith('nu_')) {
        if (isLatLongField) return value.toFixed(5);
        let parsedValue = value;
        if (typeof value === 'string') parsedValue = parseFloat(value);
        if (Number.isNaN(parsedValue)) return 'N/A';
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
        groups[x.no_regiao] = groups[x.no_regiao] || { ds_cr: x.ds_cr, list: [] };
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
        this.$store.dispatch('monitoring/getTiOptions', cr);
      } else {
        this.filters.ti = [];
      }
    },
    showTableDialogAnalytics(value) {
      if (this.currentUrlWmsMonitoring) {
        this.setanalyticsMonitoringDialog(value);
        this.getDataAnalyticsMonitoring();
      }
    },
    searchMonitoring() {
      const { filters } = this;
      const {
        currentView, cr, startDate, endDate,
      } = filters;

      if (
        (currentView || cr.length)
        && startDate
        && endDate
        && this.$moment(startDate).isValid()
        && this.$moment(endDate).isValid()
      ) {
        this.error = false;
        const filtersForStore = {
          ...filters,
          startDate: this.$moment(startDate).format('YYYY-MM-DD'),
          endDate: this.$moment(endDate).format('YYYY-MM-DD'),
        };

        if (this.$moment(startDate).isAfter(endDate)) {
          this.error = true;
          this.$store.commit(
            'alert/addAlert',
            { message: this.$t('invalid-date-range'), type: 'error' },
            { root: true },
          );
          return;
        }

        const allEstagiosDisabled = Object.values(
          this.$store.state.monitoring.legendVisibility,
        ).every(
          (visible) => !visible,
        );

        if (allEstagiosDisabled) {
          this.$store.commit('monitoring/resetLegendVisibility');
          this.$store.commit('monitoring/clearFeatures');
          this.$store.commit('monitoring/setTableMonitoring', []);
        }

        this.setFilters(filtersForStore);
        this.isLoadingFeatures = true;
        this.getFeatures().then(() => {
          this.getDataTableMonitoring();
          this.isLoadingFeatures = false;
        }).catch(() => {
          this.isLoadingFeatures = false;
        });
      } else {
        this.error = true;
      }
    },
    showTableDialog(value) {
      if (this.features) {
        this.tableDialogMonitoring = value;
        this.getDataTableMonitoring();
      }
    },
    closeTable(value) {
      this.tableDialogMonitoring = value;
      if (this.checkNewFilters) {
        this.getFeatures();
        this.checkNewFilters = false;
      }
    },
    closeAnalyticalDialog(value) {
      this.dialog = value;
    },
    toggleLegendItem(item) {
      return this.debounce(async () => {
        try {
          // Tenta acessar a instância do mapa
          const map = window.mapMain;
          let currentZoom = null;
          let currentCenter = null;

          // Verifica se o mapa está disponível
          if (map && typeof map.getZoom === 'function' && typeof map.getCenter === 'function') {
            currentZoom = map.getZoom();
            currentCenter = map.getCenter();
          } else {
            console.warn('Instância do mapa não está disponível. O zoom não será preservado.');
          }

          // Marca o item como carregando
          this.$set(this.loadingEstagios, item.estagio, true);

          // Dispara a ação de alternar visibilidade no Vuex
          await this.$store.dispatch('monitoring/toggleLegendVisibility', {
            estagio: item.estagio,
            visible: item.visible,
          });

          // Restaura o estado do mapa, se disponível
          if (map && currentZoom !== null && currentCenter !== null) {
            map.setView(currentCenter, currentZoom);
          }
        } catch (error) {
          console.error('Erro ao alternar visibilidade do estágio:', error);
          // Reverte a visibilidade em caso de erro
          const revertedItem = { ...item, visible: !item.visible };
          const idx = this.legendItems.findIndex((i) => i.estagio === item.estagio);
          this.$set(this.legendItems, idx, revertedItem);
        } finally {
          // Remove o estado de carregamento
          this.$set(this.loadingEstagios, item.estagio, false);
        }
      }, 300)();
    },
    ...mapMutations('monitoring', ['setFilters', 'setLoadingStatistic', 'setanalyticsMonitoringDialog']),
    ...mapActions('monitoring', [
      'getFilterOptions',
      'getFeatures',
      'getMonitoringStyleFromGeoserver',
      'downloadGeoJsonMonitoring',
      'getDataTableMonitoring',
      'downloadTableMonitoring',
      'getDataAnalyticsMonitoring',
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
    "start-date-label": "Start Date",
    "end-date-label": "End Date",
    "total-area-label": "Total area",
    "heat-map-label": "Heat Map",
    "total-poligono-label": "Total polygons",
    "regional-coordination-label": "Regional Coordination (All)",
    "indigenous-lands-label": "Indigenous Lands",
    "title-switch-disable-features": "Disable Monitoring Layer",
    "title-switch-enable-features": "Enable Monitoring Layer",
    "download-label": "Download",
    "statistics-label": "Statistics",
    "table-label": "Table",
    "table-name": "Land Use Table",
    "invalid-date-range": "Start date cannot be after end date",
    "heatmap": "Heat Map"
  },
  "pt-br": {
    "legend": "Legenda:",
    "search-label": "Buscar",
    "opacity-label": "Opacidade",
    "current-view-label": "Pesquisar nesta área?",
    "start-date-label": "Data Inicial",
    "end-date-label": "Data Final",
    "total-area-label": "Área total",
    "heat-map-label": "Mapa de Calor",
    "total-poligono-label": "Total de polígonos",
    "regional-coordination-label": "Coordenação Regional (Todas)",
    "indigenous-lands-label": "Terras Indígenas",
    "title-switch-disable-features": "Desabilitar Camada de Monitoramento Diário",
    "title-switch-enable-features": "Habilitar Camada de Monitoramento Diário",
    "download-label": "Baixar",
    "statistics-label": "Estatísticas",
    "table-label": "Tabela",
    "table-name": "Tabela de Monitoramento Diário",
    "invalid-date-range": "A data inicial não pode ser posterior à data final",
    "heatmap": "Mapa de Calor"
  }
}
</i18n>
