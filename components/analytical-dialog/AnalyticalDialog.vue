<template>
  <v-dialog
    v-model="dialog"
    width="80vw"
    persistent
    no-click-animation
    color="primary"
    transition="dialog-transition"
    :fullscreen="$vuetify.breakpoint.smAndDown"
  >
    <v-card>
      <v-toolbar
        dark
        color="secondary"
      >
        <h3>{{ $t('analyticsTitle') }}</h3>
        <v-spacer />
        <v-btn
          icon
          @click="closeDialog(false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-container fluid>
        <v-container grid-list-xs>
          <v-row>
            <v-col cols="12">
              <div>
                <span class="text-uppercase">{{ $t('groupBy') }}:</span>
                <a class="d-flex justify-end">
                  <v-btn
                    small
                    :loading="isLoadingCSVMonitoring"
                    fab
                    color="secondary"
                    @click="downloadCSV()"
                  >
                    <v-icon> mdi-download</v-icon>
                  </v-btn>
                </a>
              </div>
              <div class="mb-2">
                <v-btn
                  class="mx-1 my-2"
                  :class="btn_ti ? 'button-pressed' : ''"
                  :disabled="isLoadingFeatures"
                  @click="groupByFunai()"
                >
                  {{ $t('indigenousLand') }}
                </v-btn>
                <v-btn
                  class="mx-1 my-2"
                  :class="btn_ti_month_year ? 'button-pressed' : ''"
                  :disabled="isLoadingFeatures"
                  @click="groupByFunaiMonthYear()"
                >
                  {{ $t('indigenousLandMonthYear') }}
                </v-btn>
                <v-btn
                  class="mx-1 my-2"
                  :class="btn_month_year ? 'button-pressed' : ''"
                  :disabled="isLoadingFeatures"
                  @click="groupByMonthYear()"
                >
                  {{ $t('monthYear') }}
                </v-btn>
                <v-btn
                  class="mx-1 my-2"
                  :class="btn_year ? 'button-pressed' : ''"
                  :disabled="isLoadingFeatures"
                  @click="groupByYear()"
                >
                  {{ $t('year') }}
                </v-btn>
                <v-btn
                  class="mx-1 my-2"
                  :class="btn_day ? 'button-pressed' : ''"
                  :disabled="isLoadingFeatures"
                  @click="groupByDay()"
                >
                  {{ $t('day') }}
                </v-btn>
                <v-btn
                  class="mx-1 my-2"
                  :class="btn_ti_year ? 'button-pressed' : '' "
                  :disabled="isLoadingFeatures"
                  @click="groupByFunaiYear()"
                >
                  {{ $t('indigenousLandYear') }}
                </v-btn>
              </div>
            </v-col>

            <v-spacer />

            <v-col>
              <div>
                <v-select
                  v-model="selectedHeaders"
                  :items="headers"
                  :disabled="isLoadingFeatures"
                  :label="$t('selectColumns')"
                  multiple
                  outlined
                  return-object
                >
                  <template #selection="{ item, index }">
                    <v-chip v-if="index < 8">
                      <span>{{ item.text }}</span>
                    </v-chip>
                    <span
                      v-if="index === 8"
                      class="grey--text caption"
                    >(+{{ selectedHeaders.length - 8 }} {{ $t('columns') }})</span>
                  </template>
                </v-select>
              </div>
            </v-col>
          </v-row>
          <v-divider class="my-2" />
          <v-data-table
            :headers="showHeaders"
            :items="analyticsMonitoring"
            :items-per-page="5"
            :loading="isLoadingStatistic"
            class="elevation-1"
            multi-sort
            mobile-breakpoint="0"
          />
        </v-container>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<i18n>
{
  "en": {
    "analyticsTitle": "Analytics",
    "groupBy": "Group by",
    "indigenousLand": "Indigenous Land",
    "indigenousLandMonthYear": "Indigenous Land, Month and Year",
    "monthYear": "Month and Year",
    "year": "Year",
    "day": "Day",
    "indigenousLandYear": "Indigenous Land and Year",
    "selectColumns": "Select the Columns to Display",
    "columns": "columns"
  },
  "pt-br": {
    "analyticsTitle": "Analítico",
    "groupBy": "Agrupar por",
    "indigenousLand": "Terra Indígena",
    "indigenousLandMonthYear": "Terra Indígena, Mês e Ano",
    "monthYear": "Mês e Ano",
    "year": "Ano",
    "day": "Dia",
    "indigenousLandYear": "Terra Indígena e Ano",
    "selectColumns": "Selecione as Colunas que Serão Apresentadas",
    "columns": "colunas"
  }
}
</i18n>
<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import AnalyticsFilter from '@/components/analytics/AnalyticsFilter';
import AreaChart from '@/components/graphics/AreaChart.vue';
import PieChart from '@/components/graphics/PieChart.vue';
import BarChart from '@/components/graphics/BarChart.vue';
import RadarChart from '@/components/graphics/RadarChart.vue';
import LineChart from '@/components/graphics/LineChart.vue';
import DoughnutChart from '~/components/graphics/DoughnutChart.vue';

export default {
  name: 'AnalyticalDialog',

  components: {
    AnalyticsFilter,
    AreaChart,
    PieChart,
    BarChart,
    RadarChart,
    LineChart,
    DoughnutChart,
  },
  props: {
    // content: String,
    value: {
      type: Boolean,
      require: true,
      default: false,
    },
    closeDialog: {
      type: Function,
      require: true,
      default: null,
    },
  },

  data() {
    return {
      dialog: false,
      chipSelected: false,
      headers: [
        { text: 'Código Funai', value: 'co_funai' },
        { text: 'Nome TI', value: 'no_ti' },
        { text: 'Ano', value: 'ano' },
        { text: 'Mês', value: 'mes' },
        { text: 'CR Área Ha', value: 'cr_nu_area_ha' },
        { text: 'DG Área Ha', value: 'dg_nu_area_ha' },
        { text: 'DR Área Ha', value: 'dr_nu_area_ha' },
        { text: 'FF Área Ha', value: 'ff_nu_area_ha' },
        { text: 'Total Área Ha', value: 'total_nu_area_ha' },
        { text: 'TI Área Ha', value: 'ti_nu_area_ha' },
        { text: 'Data', value: 'dt_t_um' },
        { text: 'CR Área Perc', value: 'cr_nu_area_perc' },
        { text: 'DG Área Perc', value: 'dg_nu_area_perc' },
        { text: 'DR Área Perc', value: 'dr_nu_area_perc' },
        { text: 'FF Área Perc', value: 'ff_nu_area_perc' },
      ],
      selectedHeaders: [],
      filters: {
        grouping: '',
      },
      checkNewFilters: false,
      btn_ti: false,
      btn_ti_month_year: false,
      btn_month_year: false,
      btn_year: false,
      btn_ti_year: true,
      btn_day: false,
    };
  },

  computed: {
    showHeaders() {
      return this.headers.filter((s) => this.selectedHeaders.includes(s));
    },

    ...mapState('monitoring', [
      'analyticsMonitoring',
      'features',
      'isLoadingFeatures',
      'isLoadingStatistic',
      'isLoadingCSVMonitoring',
    ]),

    ...mapMutations('monitoring', [
      'setanalyticsMonitoringDialog',
      'setFilters',
      'isLoadingGeoJson',
    ]),

    ...mapMutations('tableDialog', ['setshowTableDialog']),

  },

  created() {
    this.headers = Object.values(this.headers);
    this.selectedHeaders = this.headers;
  },
  mounted() {
    this.dialog = this.value;
  },

  methods: {
    pressedBUtton(btn) {
      this.btn_ti_month_year = false;
      this.btn_month_year = false;
      this.btn_year = false;
      this.btn_ti_year = false;
      this.btn_day = false;
      this.btn_ti = false;
      switch (btn) {
        case 'btn_ti_year':
          this.btn_ti_year = true;
          break;
        case 'btn_ti_month_year':
          this.btn_ti_month_year = true;
          break;
        case 'btn_day':
          this.btn_day = true;
          break;
        case 'btn_ti':
          this.btn_ti = true;
          break;
        case 'btn_year':
          this.btn_year = true;
          break;
        case 'btn_month_year':
          this.btn_month_year = true;
          break;
        default:
          break;
      }
    },
    groupByFunaiYear() {
      this.pressedBUtton('btn_ti_year');
      this.getDataAnalyticsMonitoringByFunaiYear();
    },
    groupByFunaiMonthYear() {
      this.pressedBUtton('btn_ti_month_year');
      this.getDataAnalyticsMonitoringByFunaiMonthYear();
    },
    groupByDay() {
      this.pressedBUtton('btn_day');
      this.getDataAnalyticsMonitoringByDay();
    },
    groupByFunai() {
      this.pressedBUtton('btn_ti');
      this.getDataAnalyticsMonitoringByFunai();
    },
    groupByYear() {
      this.pressedBUtton('btn_year');
      this.getDataAnalyticsMonitoringByYear();
    },
    groupByMonthYear() {
      this.pressedBUtton('btn_month_year');
      this.getDataAnalyticsMonitoringByMonthYear();
    },

    downloadCSV() {
      if (this.btn_ti_year === true) {
        this.downloadTableMonitoringAnalyticsByFunaiYear();
      } else if (this.btn_ti_month_year === true) {
        this.downloadTableMonitoringAnalyticsByFunaiMonthYear();
      } else if (this.btn_day === true) {
        this.downloadTableMonitoringAnalyticsByDay();
      } else if (this.btn_ti === true) {
        this.downloadTableMonitoringAnalyticsByFunai();
      } else if (this.btn_year === true) {
        this.downloadTableMonitoringAnalyticsByYear();
      } else {
        this.downloadTableMonitoringAnalyticsByMonthYear();
      }
    },

    ...mapActions('monitoring', [
      'getDataAnalyticsMonitoringByFunaiYear',
      'getDataAnalyticsMonitoringByDay',
      'getDataAnalyticsMonitoringByFunai',
      'getDataAnalyticsMonitoringByYear',
      'downloadTableMonitoringAnalytics',
      'getDataAnalyticsMonitoringByPercentage',
      'getDataAnalyticsMonitoringByMonthYear',
      'getDataAnalyticsMonitoringByFunaiMonthYear',
      'downloadTableMonitoringAnalyticsByDay',
      'downloadTableMonitoringAnalyticsByMonthYear',
      'downloadTableMonitoringAnalyticsByFunai',
      'downloadTableMonitoringAnalyticsByFunaiMonthYear',
      'downloadTableMonitoringAnalyticsByFunaiYear',
      'downloadTableMonitoringAnalyticsByYear',
    ]),
  },

};
</script>

<style scoped>
.button-pressed {
  background-color: #3e8e41;
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}

.v-dialog__content {
    /* justify-content: flex-start; */
}

/* @media (max-width: 900px) {
    .v-dialog__content {
        justify-content: center;
    }
}

@media (min-width: 901px) {
    .v-dialog__content {
        width: 55%;
    }
}

@media (min-width: 1000px) {
    .v-dialog__content {
        width: 60%;
    }
}

@media (min-width: 1200px) {
    .v-dialog__content {
        width: 66%;
    }
}

@media (min-width: 1264px) {
    .v-dialog__content {
        width: 68%;
    }
}

@media (min-width: 1600px) {
    .v-dialog__content {
        width: 75%;
    }
}

@media (min-width: 1920px) {
    .v-dialog__content {
        width: 100%;
    }
} */
</style>
