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
        <span>
          {{ $t('total-poligono-label') }}:
        </span>
      </v-col>
      <v-col
        class="grey--text text--darken-2 text-right"
        cols="6"
      >
        <span>
          0
        </span>
      </v-col>
      <v-col
        class="grey--text text--darken-2 mt-0 pt-0"
        cols="6"
      >
        <span>
          {{ $t('total-area-label') }}:
        </span>
      </v-col>
      <v-col
        class="grey--text text--darken-2 mt-0 pt-0 text-right"
        cols="6"
      >
        <span>
          0
        </span>
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
        <!-- <v-switch
          v-model="heatMap"
          class="ma-0 pa-0"
          :loading="loadingHeatmap"
          :disabled="loadingHeatmap || !hasFeatures"
          hide-details
        /> -->
      </v-col>
    </v-row>

    <v-divider class="mt-1" />

    <v-row no-gutters>
      <v-col
        cols="12"
        class="mt-2 pb-0"
      >
        <p class="font-weight-regular grey--text text--darken-2">
          {{ $t('legend') }}
        </p>
      </v-col>

      <template v-for="(value, key) in getSublayers">
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
              {{ value.title }}
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
            @change="toggleSublayer(key, $event)"
          />
        </v-col>
      </template>
    </v-row>
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
    "legend": "Legend:"
  },
  "pt-br": {
    "download-label": "Baixar",
    "statistics-label": "Estatísticas",
    "table-label": "Tabela",
    "total-poligono-label": "Total de polígonos",
    "total-area-label": "Área total",
    "opacity-label": "Opacidade",
    "heat-map-label": "Mapa de Calor",
    "legend": "Legenda:"
  }
}
</i18n>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'MonitoringResults',

  components: {
  },

  data() {
    return {
      dialogConfirmDownload: false,
    };
  },

  computed: {
    currentOpacity() {
      return this.$store.state.monitoring.opacity;
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

    ...mapGetters('monitoring', ['getSublayers']),
  },

  methods: {
    async downloadMonitoringGeojson() {
      const ok = await this.$confirm();
      console.log(ok);
    },

    async showTableDialogAnalytics() {
      const ok = await this.$confirm();
      console.log(ok);
    },

    async showTableDialog() {
      const ok = await this.$confirm();
      console.log(ok);
    },

    async updateOpacity(value) {
      this.$store.commit('monitoring/setOpacity', value);
    },

    async toggleSublayer(key, value) {
      console.log('🚀 ~ toggleSublayer ~ value:', key, value);
      this.$store.commit('monitoring/toggleSublayer', key, value);
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
