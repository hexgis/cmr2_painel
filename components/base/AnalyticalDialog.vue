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
        dense
      >
        <h3>{{ $t('analyticsTitle') }}</h3>
        <v-spacer />
        <v-btn
          icon
          small
          class="mr-1"
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
                <a class="d-flex justify-end">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        x-small
                        fab
                        color="secondary"
                        :loading="loadingCsv"
                        v-bind="attrs"
                        v-on="on"
                        @click="downloadCSV"
                      >
                        <v-icon>mdi-download</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('download-csv') }}</span>
                  </v-tooltip>
                </a>
              </div>
              <div class="mb-2">
                <span class="text-uppercase text-caption">{{ $t('groupBy') }}:</span>

                <v-btn
                  class="mx-1"
                  :class="{ 'button-pressed': currentType === 'funai' }"
                  :disabled="loading"
                  small
                  @click="groupAnalyticByType('funai')"
                >
                  {{ $t('indigenousLand') }}
                </v-btn>
                <v-btn
                  class="mx-1"
                  :class="{ 'button-pressed': currentType === 'co_funai_and_monthyear' }"
                  :disabled="loading"
                  small
                  @click="groupAnalyticByType('co_funai_and_monthyear')"
                >
                  {{ $t('indigenousLandMonthYear') }}
                </v-btn>
                <v-btn
                  class="mx-1"
                  :class="{ 'button-pressed': currentType === 'monthyear' }"
                  :disabled="loading"
                  small
                  @click="groupAnalyticByType('monthyear')"
                >
                  {{ $t('monthYear') }}
                </v-btn>
                <v-btn
                  class="mx-1"
                  :class="{ 'button-pressed': currentType === 'year' }"
                  :disabled="loading"
                  small
                  @click="groupAnalyticByType('year')"
                >
                  {{ $t('year') }}
                </v-btn>
                <v-btn
                  class="mx-1"
                  :class="{ 'button-pressed': currentType === 'day' }"
                  :disabled="loading"
                  small
                  @click="groupAnalyticByType('day')"
                >
                  {{ $t('day') }}
                </v-btn>
                <v-btn
                  class="mx-1"
                  :class="{ 'button-pressed': currentType === 'co_funai_year' }"
                  :disabled="loading"
                  small
                  @click="groupAnalyticByType('co_funai_year')"
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
                  :disabled="loading"
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
            :items="table"
            :items-per-page="10"
            :loading="loading"
            :disable-pagination="loading"
            height="40vh"
            multi-sort
            fixed-header
            mobile-breakpoint="0"
            :footer-props="{
              itemsPerPageText: $t('itemsPerPageText'),
              itemsPerPageAllText: $t('itemsPerPageAllText'),
              pageText: $t('pageText'),
              showFirstLastPage: true,
            }"
            :no-data-text="$t('noDataText')"
            :loading-text="$t('loadingText')"
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
    "columns": "columns",
    "itemsPerPageText": "Items per page:",
    "itemsPerPageAllText": "All",
    "pageText": "{0}-{1} of {2}",
    "noDataText": "No data available",
    "loadingText": "Loading items...",
    "download-csv": "Download CSV"
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
    "columns": "colunas",
    "itemsPerPageText": "Itens por página:",
    "itemsPerPageAllText": "Todos",
    "pageText": "{0}-{1} de {2}",
    "noDataText": "Nenhum dado disponível",
    "loadingText": "Carregando itens...",
    "download-csv": "Baixar CSV"
  }
}
</i18n>

<script>
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
    table: {
      type: Array,
      require: true,
      default: () => [],
    },
    loading: {
      type: Boolean,
      require: true,
      default: false,
    },
    loadingCsv: {
      type: Boolean,
      require: true,
      default: false,
    },
  },

  data() {
    return {
      dialog: false,
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
      currentType: 'day',
    };
  },

  computed: {
    showHeaders() {
      return this.headers.filter((s) => this.selectedHeaders.includes(s));
    },
  },

  created() {
    this.headers = Object.values(this.headers);
    this.selectedHeaders = this.headers;
  },

  mounted() {
    this.dialog = this.value;
  },

  methods: {
    groupAnalyticByType(type) {
      this.currentType = type;
      this.$emit('update:group', type);
    },

    downloadCSV() {
      this.$emit('download', this.currentType);
    },
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
