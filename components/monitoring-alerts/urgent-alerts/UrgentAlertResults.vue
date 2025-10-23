<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <v-col
        cols="12"
        class="mt-2"
      >
        <v-btn
          :loading="isLoadingDownloadGeojson"
          small
          color="accent"
          icon
          @click="downloadMonitoringGeojson(true)"
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
          :loading="isLoadingStatistic"
          small
          color="accent"
          icon
          @click="showTableDialogAnalytics(true)"
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
          small
          color="accent"
          icon
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
    </v-row>

    <v-divider class="mt-1" />

    <v-row>
      <v-col
        class="grey--text text--darken-2"
        cols="6"
      >
        <span>{{ $t('total-poligono-label') }}:</span>
      </v-col>
      <v-col
        class="grey--text text--darken-2 text-right"
        cols="6"
      >
        <v-progress-circular
          v-if="isLoadingStats"
          indeterminate
          color="primary"
          size="20"
          width="2"
        />
        <span v-else>
          {{ getStats.totalFeatures }}
        </span>
      </v-col>
      <v-col
        class="grey--text text--darken-2 mt-0 pt-0"
        cols="6"
      >
        <span>{{ $t('total-area-label') }}:</span>
      </v-col>
      <v-col
        class="grey--text text--darken-2 mt-0 pt-0 text-right"
        cols="6"
      >
        <v-progress-circular
          v-if="isLoadingStats"
          indeterminate
          color="primary"
          size="20"
          width="2"
        />
        <span v-else>{{ formatFieldValue(getStats.totalArea) }} ha</span>
      </v-col>
    </v-row>

    <v-divider class="mt-1" />

    <v-row class="mt-1">
      <v-col
        class="grey--text text--darken-2"
        cols="4"
      >
        <span>
          {{ $t('opacity-label') }}
        </span>
      </v-col>
      <v-col
        class="grey--text text--darken-2 text-right pa-0 pt-1"
        cols="8"
      >
        <v-slider
          :value="currentOpacity"
          hide-details
          thumb-label
          min="0"
          max="100"
          @end="updateOpacity"
        />
      </v-col>
      <v-col
        class="grey--text text--darken-2 mt-1 pt-0"
        cols="10"
      >
        <span>
          {{ $t('heat-map-label') }}:
        </span>
      </v-col>
      <v-col
        class="grey--text text--darken-2 pt-0"
        cols="2"
      >
        <v-switch
          :input-value="getHeatMapMonitoring"
          class="ma-0 pa-0"
          :loading="isLoadingHeatmap"
          :disabled="isLoadingHeatmap || getActiveLegendItems"
          hide-details
          @change="toggleHeatMapLayer($event)"
        />
      </v-col>
    </v-row>

    <v-divider class="mt-1" />

    <v-row no-gutters>
      <v-col
        v-if="isLoadingSearchMonitoring"
        cols="12"
      >
        <v-skeleton-loader
          v-for="n in 4"
          :key="n"
          class="ma-0 pa-0"
          max-width="500"
          type="list-item"
        />
      </v-col>

      <v-col
        v-else
        cols="12"
        class="mt-2 pb-0"
      >
        <p class="font-weight-regular grey--text text--darken-2">
          {{ $t('legend') }}
        </p>
      </v-col>

      <template v-for="(value, key) in getStats.stages">
        <v-col
          :key="`${key}-details`"
          cols="10"
        >
          <div class="d-flex align-center">
            <span
              class="legend-color"
              :style="{ backgroundColor: value.color }"
            />
            <span class="grey--text text--darken-2 compact-text ml-1">
              {{ nameLegends(value.name) }}
            </span>
          </div>
        </v-col>
        <v-col
          :key="`${key}-switch`"
          cols="2"
          class="d-flex justify-end align-center"
        >
          <v-switch
            :input-value="value.visible"
            hide-details
            class="ma-0 pa-0"
            @change="toggleStages(key, $event)"
          />
        </v-col>
      </template>
    </v-row>

    <!-- Modais -->
    <TableDialog
      v-if="tableDialog"
      :value="tableDialog"
      :headers="headers"
      :table="formattedTableMonitoring()"
      :loading-table="isLoadingTable"
      :table-name="$t('table-name')"
      :f-close-table="closeTableDialog"
    />

    <AnalyticalDialog
      v-if="analyticDialog && formattedAnalyticData"
      :value="analyticDialog"
      :close-dialog="closeAnalyticalDialog"
      :table="formattedAnalyticData"
      :loading="isLoadingStatistic"
      @update:group="updateAnalyticDialog"
      @download="downloadAnalytics"
    />
  </v-container>
</template>

<i18n>
{
  "en": {
    "download-label": "Download",
    "statistics-label": "Statistics",
    "table-label": "Table",
    "total-poligono-label": "Total polygons",
    "total-area-label": "Total area",
    "opacity-label": "Opacity",
    "heat-map-label": "Heat Map",
    "legend": "Legend:",
    "table-name": "Table Daily Monitoring"
  },
  "pt-br": {
    "download-label": "Baixar",
    "statistics-label": "Estatísticas",
    "table-label": "Tabela",
    "total-poligono-label": "Total de polígonos",
    "total-area-label": "Área total",
    "opacity-label": "Opacidade",
    "heat-map-label": "Mapa de Calor",
    "legend": "Legenda:",
    "table-name": "Tabela de Monitoramento Diário"
  }
}
</i18n>

<script>
import { mapGetters } from 'vuex';
import TableDialog from '../../base/TableDialog.vue';
import AnalyticalDialog from '../../base/AnalyticalDialog.vue';

export default {
  name: 'MonitoringResults',

  components: {
    TableDialog,
    AnalyticalDialog,
  },

  data() {
    return {
      dialogConfirmDownload: false,
      tableDialog: false,
      analyticDialog: false,
      isLoadingCSV: false,
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
    };
  },

  computed: {
    currentOpacity() {
      return this.$store.state.monitoring.opacity;
    },

    isLoadingSearchMonitoring() {
      return this.$store.state.monitoring.loadingSearchMonitoring;
    },

    isLoadingDownloadGeojson() {
      return this.$store.state.monitoring.loadingDownloadGeojson;
    },

    isLoadingStatistic() {
      return this.$store.state.monitoring.loadingStatistic;
    },

    isLoadingTable() {
      return this.$store.state.monitoring.loadingTable;
    },

    isLoadingStats() {
      return this.$store.state.monitoring.loadingStats;
    },

    isLoadingHeatmap() {
      return this.$store.state.monitoring.loadingHeatmap;
    },

    getActiveLegendItems() {
      return !this.$store.getters['monitoring/getActiveLegendItems'].length;
    },

    statsTableMonitoring() {
      return this.$store.state.monitoring.stats.tableMonitoring;
    },

    formattedAnalyticData() {
      return this.$store.state.monitoring.analyticsData;
    },

    getHeatMapMonitoring() {
      return this.$store.state.monitoring.heatMapMonitoring;
    },

    ...mapGetters('monitoring', ['getStats']),
  },

  methods: {
    async downloadMonitoringGeojson() {
      this.$store.dispatch('monitoring/downloadMonitoringGeojson');
    },

    async showTableDialogAnalytics() {
      this.analyticDialog = true;
      this.$store.dispatch('monitoring/getDataAnalyticsMonitoring');
    },

    async showTableDialog() {
      this.tableDialog = true;
      await this.$store.dispatch('monitoring/getDataTableMonitoring');
    },

    async updateAnalyticDialog(type) {
      await this.$store.dispatch('monitoring/getDataAnalyticsMonitoring', `monitoring_by_${type}`);
    },

    async downloadAnalytics(type) {
      let defaultFileName;
      switch (type) {
        case 'day':
          defaultFileName = 'poligono_monitoramento_estatisticas_por_dia.csv';
          break;
        case 'monthYear':
          defaultFileName = 'poligono_monitoramento_estatisticas_por_mes_e_ano.csv';
          break;
        case 'year':
          defaultFileName = 'poligono_monitoramento_estatisticas_por_ano.csv';
          break;
        case 'funai':
          defaultFileName = 'poligono_monitoramento_estatisticas_por_co_funai_e_dia.csv';
          break;
        case 'funaiMonthYear':
          defaultFileName = 'poligono_monitoramento_estatisticas_por_co_funai_mes_e_ano.csv';
          break;
        case 'funaiYear':
          defaultFileName = 'poligono_monitoramento_estatisticas_por_co_funai_e_ano.csv';
          break;
        default:
          defaultFileName = 'monitoramento_diario_estatisticas.csv';
          break;
      }
      this.$store.dispatch('monitoring/downloadAnalyticCSV', defaultFileName);
    },

    formattedTableMonitoring() {
      const tableMonitoring = this.$store.state.monitoring.stats.tableMonitoring || [];
      return tableMonitoring.map((item) => {
        const formattedItem = { ...item };
        this.headers.forEach((header) => {
          const field = header.value;
          formattedItem[field] = this.formatFieldValue(item[field], field);
        });
        return formattedItem;
      });
    },

    closeTableDialog() {
      this.tableDialog = false;
      this.$store.commit('monitoring/clearTableMonitoring');
    },

    closeAnalyticalDialog() {
      this.analyticDialog = false;
      this.$store.commit('monitoring/clearAnalyticsData');
    },

    async updateOpacity(value) {
      this.$store.commit('monitoring/setOpacity', value);
    },

    async toggleStages(key, value) {
      this.$store.commit('monitoring/toggleStatsStages', { key, value });
      this.$store.dispatch('monitoring/updateWmsMonitoring');
      this.$store.dispatch('monitoring/generateMonitoringStats', true);
    },

    async toggleHeatMapLayer(value) {
      if (value) {
        await this.$store.dispatch('monitoring/generateHeatmapMonitoring');
      }
      this.$store.commit('monitoring/setHeatMapMonitoring', value);
    },

    nameLegends(name) {
      switch (name) {
        case 'CR':
          return 'Corte Raso (CR)';
        case 'DG':
          return 'Degradação (DG)';
        case 'DR':
          return 'Desmatamento em Regeneração (DR)';
        case 'FF':
          return 'Fogo em Floresta (FF)';
        default:
          return name;
      }
    },

    formatFieldValue(value, field = '') {
      if (value == null) return '0';

      const fieldName = field.toLowerCase();

      if (typeof value === 'string' && /^(dt_|data_|date)/.test(fieldName) && this.$moment(value).isValid()) {
        return this.$moment(value).format('DD/MM/YYYY');
      }

      if (typeof value === 'boolean') return value ? 'Sim' : 'Não';

      if (typeof value === 'number' || fieldName.startsWith('nu_')) {
        const num = +value;
        if (Number.isNaN(num)) return 'N/A';

        if (/(lat|lng|long|latitude|longitude)/.test(fieldName)) return num.toFixed(5);

        const rounded = num.toFixed(2);
        const [int, dec] = rounded.split('.');

        return (dec !== '00' || fieldName.includes('area'))
          ? `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`
          : parseInt(num, 10).toLocaleString('pt-BR');
      }

      return value.toString() || '0';
    },
  },
};
</script>

<style scoped>
.legend-color {
  display: inline-block;
  width: 16px;
  height: 16px;
}
</style>
