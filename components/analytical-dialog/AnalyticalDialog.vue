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
                    <v-icon> mdi-download </v-icon>
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
                  :class="btn_ti_year ? 'button-pressed' : ''"
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
            :items-per-page="-1"
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

export default {
  name: 'AnalyticalDialog',

  props: {
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
      btn_ti_year: false,
      btn_day: true,
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
  },

  created() {
    this.headers = Object.values(this.headers);
    this.selectedHeaders = this.headers;
  },
  mounted() {
    this.dialog = this.value;
  },

  methods: {
    pressedButton(btn) {
      const buttons = ['btn_ti_year', 'btn_ti_month_year', 'btn_day', 'btn_ti', 'btn_year', 'btn_month_year'];
      buttons.forEach((button) => {
        this[button] = button === btn;
      });
    },
    groupByFunaiYear() {
      this.pressedButton('btn_ti_year');
      this.getDataAnalyticsMonitoring('grouping_by_co_funai_year');
    },
    groupByFunaiMonthYear() {
      this.pressedButton('btn_ti_month_year');
      this.getDataAnalyticsMonitoring('grouping_by_co_funai_and_monthyear');
    },
    groupByDay() {
      this.pressedButton('btn_day');
      this.getDataAnalyticsMonitoring('grouping_by_day');
    },
    groupByFunai() {
      this.pressedButton('btn_ti');
      this.getDataAnalyticsMonitoring('grouping_by_funai');
    },
    groupByYear() {
      this.pressedButton('btn_year');
      this.getDataAnalyticsMonitoring('grouping_by_year');
    },
    groupByMonthYear() {
      this.pressedButton('btn_month_year');
      this.getDataAnalyticsMonitoring('grouping_by_monthyear');
    },

    downloadCSV() {
      let type;
      if (this.btn_ti_year) {
        type = 'byFunaiYear';
      } else if (this.btn_ti_month_year) {
        type = 'byFunaiMonthYear';
      } else if (this.btn_day) {
        type = 'byDay';
      } else if (this.btn_ti) {
        type = 'byFunai';
      } else if (this.btn_year) {
        type = 'byYear';
      } else {
        type = 'byMonthYear';
      }
      this.downloadTableMonitoringAnalytics(type);
    },

    ...mapMutations('monitoring', [
      'setanalyticsMonitoringDialog',
      'setFilters',
      'isLoadingGeoJson',
    ]),

    ...mapMutations('tableDialog', ['setshowTableDialog']),

    ...mapActions('monitoring', [
      'getDataAnalyticsMonitoring',
      'downloadTableMonitoringAnalytics',
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

</style>
