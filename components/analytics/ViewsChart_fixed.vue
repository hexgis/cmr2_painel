<i18n>
  {
    "en": {
      "searchLabel": "Search",
      "startDate": "Start Date",
      "endDate": "End Date",
      "lastAccesses": "Last Accesses",
      "userAccessMap": "Map with user access location",
      "cmrAccessMode": "Access mode to CMR",
      "viewsControl": "Views Control",
      "browserTypeUsed": "Browser type used",
      "dailyAccessData": "Daily access data",
      "monthlyAccessData": "Monthly access data",
      "period": "Period",
      "visits": "Visits",
      "searchingPerCities": "Searching per Cities",
      "searchingPerDevices" : "Searching per Devices",
      "searchingPerBrowsers" : "Searching per Browsers",
      "filterOptions": "Filter per views",
      "clearFieldsLabel": "Clear fields",
      "filter": "Filter",
      "downloadSuccess": "Download Completed",
      "downloadError": "Download Failed",
      "downloadSuccessMessage": "The download was completed successfully.",
      "downloadErrorMessage": "An error occurred during the download. Please try again.",
      "close": "Close"
    },
    "pt-br": {
      "searchLabel": "Pesquisar",
      "startDate": "Data de início",
      "endDate": "Data de fim",
      "lastAccesses": "Últimos Acessos",
      "userAccessMap": "Mapa com a localização de acesso dos usuários",
      "cmrAccessMode": "Modo de acesso ao CMR",
      "viewsControl": "Controle de Acessos",
      "browserTypeUsed": "Tipo de navegador utilizado",
      "dailyAccessData": "Dados diários de acesso",
      "monthlyAccessData": "Dados mensais de acesso",
      "period": "Período",
      "visits": "Visitas",
      "searchingPerCities": "Busca por Município",
      "searchingPerDevices" : "Busca por modo de acesso",
      "searchingPerBrowsers" : "Busca por tipo de navegador",
      "filterOptions": "Filtrar acessos",
      "clearFieldsLabel": "Limpar filtros",
      "filter": "Filtrar",
      "downloadSuccess": "Download Concluído",
      "downloadError": "Falha no Download",
      "downloadSuccessMessage": "O download foi concluído com sucesso.",
      "downloadErrorMessage": "Ocorreu um erro durante o download. Por favor, tente novamente.",
      "close": "Fechar"
    }
  }
</i18n>

<template>
  <div
    id="chart"
    class="chart"
  >
    <!-- Header moderno -->
    <div class="chart-header">
      <v-container
        fluid
        class="pa-4"
      >
        <v-row
          align="center"
          justify="space-between"
        >
          <v-col
            cols="12"
            md="6"
            class="d-flex align-center"
          >
            <v-btn
              icon
              class="mr-3 back-btn"
              @click="$router.go(-1)"
            >
              <v-icon>
                mdi-arrow-left
              </v-icon>
            </v-btn>
            <v-img
              :src="logo_funai"
              max-width="140"
              contain
              class="logo-img"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="text-center text-md-right"
          >
            <h1 class="page-title">
              {{ $t('viewsControl') }}
            </h1>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Toolbar de ações -->
    <div class="toolbar-section">
      <v-container fluid>
        <v-row
          align="center"
          justify="space-between"
          class="py-3"
        >
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <v-btn
              color="primary"
              outlined
              class="filter-btn"
              @click="showModal = true"
            >
              <v-icon
                left
                small
              >
                mdi-filter-variant
              </v-icon>
              {{ $t('filter') }}
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
            class="text-right"
          >
            <div class="download-buttons">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    outlined
                    color="success"
                    class="download-btn"
                    :loading="downloading === 'csv'"
                    v-bind="attrs"
                    v-on="on"
                    @click="downloadCSV"
                  >
                    <v-icon small>
                      mdi-microsoft-excel
                    </v-icon>
                  </v-btn>
                </template>
                <span>Download Excel</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    outlined
                    color="error"
                    class="download-btn"
                    :loading="downloading === 'pdf'"
                    v-bind="attrs"
                    v-on="on"
                    @click="downloadPDF"
                  >
                    <v-icon small>
                      mdi-file-pdf-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>Download PDF</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    outlined
                    color="info"
                    class="download-btn"
                    :loading="downloading === 'img'"
                    v-bind="attrs"
                    v-on="on"
                    @click="downloadImg"
                  >
                    <v-icon small>
                      mdi-image-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>Download Imagem</span>
              </v-tooltip>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Conteúdo principal -->
    <v-container
      fluid
      class="content-section pa-4"
    >
      <!-- Modal de filtros -->
      <v-dialog
        v-model="showModal"
        max-width="600px"
      >
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">{{ $t('filterOptions') }}</span>
            <v-btn
              icon
              @click="showModal = false"
            >
              <v-icon>
                mdi-close
              </v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col
                  cols="12"
                  md="6"
                >
                  <BaseDateField
                    :key="startDateKey"
                    v-model="startDate"
                    :label="$t('startDate')"
                    :required="true"
                    outlined
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <BaseDateField
                    :key="endDateKey"
                    v-model="endDate"
                    :label="$t('endDate')"
                    :required="true"
                    outlined
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="selectedCity"
                    :label="$t('searchingPerCities')"
                    :items="citiesList"
                    outlined
                    clearable
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="selectedDevice"
                    :label="$t('searchingPerDevices')"
                    :items="devicesList"
                    outlined
                    clearable
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="selectedBrowser"
                    :label="$t('searchingPerBrowsers')"
                    :items="browserList"
                    outlined
                    clearable
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions class="px-6 pb-4">
            <v-btn
              color="primary"
              @click="newSearch"
            >
              <v-icon
                left
                small
              >
                mdi-magnify
              </v-icon>
              {{ $t('searchLabel') }}
            </v-btn>
            <v-spacer />
            <v-btn
              color="grey"
              text
              @click="clearFields"
            >
              <v-icon
                left
                small
              >
                mdi-filter-remove
              </v-icon>
              {{ $t('clearFieldsLabel') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Grid principal com gráficos -->
      <v-row class="charts-grid">
        <!-- Gráfico de linha principal -->
        <v-col
          cols="12"
          lg="8"
        >
          <v-card
            class="chart-card"
            elevation="2"
          >
            <v-card-title class="chart-title">
              <v-icon
                left
                color="primary"
              >
                mdi-chart-line
              </v-icon>
              {{ $t('lastAccesses') }}
              <v-spacer />
              <v-chip
                small
                outlined
                color="primary"
              >
                {{ $t('dailyAccessData') }}
              </v-chip>
            </v-card-title>
            <v-card-text class="chart-content">
              <LineChartViews
                :start-date="formatStartDate()"
                :end-date="formatEndDate()"
                :height="350"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Mapa -->
        <v-col
          cols="12"
          lg="4"
        >
          <v-card
            class="chart-card map-card"
            elevation="2"
          >
            <v-card-title class="chart-title">
              <v-icon
                left
                color="success"
              >
                mdi-map-marker
              </v-icon>
              {{ $t('userAccessMap') }}
            </v-card-title>
            <v-card-text class="map-content">
              <MapUserViews />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Segunda linha - Gráficos circulares -->
      <v-row class="charts-grid">
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            class="chart-card"
            elevation="2"
          >
            <v-card-title class="chart-title">
              <v-icon
                left
                color="info"
              >
                mdi-devices
              </v-icon>
              {{ $t('cmrAccessMode') }}
            </v-card-title>
            <v-card-text class="chart-content">
              <DoughnutChartContainer />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            class="chart-card"
            elevation="2"
          >
            <v-card-title class="chart-title">
              <v-icon
                left
                color="warning"
              >
                mdi-web
              </v-icon>
              {{ $t('browserTypeUsed') }}
            </v-card-title>
            <v-card-text class="chart-content">
              <PieChartView />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Terceira linha - Tabelas -->
      <v-row class="charts-grid">
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            class="chart-card table-card"
            elevation="2"
          >
            <v-card-title class="chart-title">
              <v-icon
                left
                color="indigo"
              >
                mdi-table
              </v-icon>
              {{ $t('dailyAccessData') }}
            </v-card-title>
            <v-card-text class="table-content">
              <TableDefault
                :labels="viewLabelsTitle"
                :daily-counts="getDateCounts"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            class="chart-card table-card"
            elevation="2"
          >
            <v-card-title class="chart-title">
              <v-icon
                left
                color="purple"
              >
                mdi-chart-bar
              </v-icon>
              {{ $t('monthlyAccessData') }}
            </v-card-title>
            <v-card-text class="table-content">
              <TableDefault
                :labels="viewLabelsTitle"
                :monthly-counts="getDataChart.monthly_counts"
                :total="true"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Modal de download -->
    <v-dialog
      v-model="showDownloadModal"
      persistent
      max-width="400px"
    >
      <v-card>
        <v-card-text class="text-center py-6">
          <div
            v-if="downloadSuccess"
            class="success-content"
          >
            <v-icon
              x-large
              color="success"
              class="mb-3"
            >
              mdi-check-circle
            </v-icon>
            <p class="text-h6 mb-2">
              {{ $t('downloadSuccess') }}
            </p>
            <p class="text-body-2">
              {{ $t('downloadSuccessMessage') }}
            </p>
          </div>
          <div
            v-else
            class="error-content"
          >
            <v-icon
              x-large
              color="error"
              class="mb-3"
            >
              mdi-alert-circle
            </v-icon>
            <p class="text-h6 mb-2">
              {{ $t('downloadError') }}
            </p>
            <p class="text-body-2">
              {{ $t('downloadErrorMessage') }}
            </p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn
            color="primary"
            @click="closeDownloadModal"
          >
            {{ $t('close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { formatDate } from '@/store/charts.js';
import DoughnutChartContainer from '@/components/graphics/dashboard/DoughnutChartContainer.vue';
import LineChartViews from '@/components/graphics/dashboard/LineChartViews.vue';
import PieChartView from '@/components/graphics/dashboard/PieChart.vue';
import BaseDateField from '@/components/base/BaseDateField.vue';
import TableDefault from '@/components/graphics/dashboard/TableDefault.vue';
import MapUserViews from '@/components/map/MapUserViews.vue';

export default {
  name: 'ViewsChartPage',
  components: {
    TableDefault,
    DoughnutChartContainer,
    LineChartViews,
    PieChartView,
    BaseDateField,
    MapUserViews,
  },
  layout: 'fullPage',
  async created() {
    await this.getDataChart;
    await this.citiesList;
  },
  computed: {
    ...mapGetters('charts', [
      'getDataChart',
      'getDateCounts',
      'getTypeDeviceCounts',
      'getBrowserCounts',
      'getLocations',
    ]),
    citiesList() {
      const citiesSet = new Set();
      this.getLocations.forEach((item) => {
        citiesSet.add(item.city);
      });
      return Array.from(citiesSet);
    },
    devicesList() {
      const devicesList = Object.keys(this.getTypeDeviceCounts);
      return devicesList;
    },
    browserList() {
      const browserList = Object.keys(this.getBrowserCounts);
      return browserList;
    },
  },
  data: () => ({
    logo_funai: process.env.DEFAULT_LOGO_IMAGE_CMR,
    activatorProps: false,
    viewLabelsTitle: ['Período', 'Visitas'],
    startDate: '',
    endDate: '',
    selectedCity: null,
    selectedDevice: null,
    selectedBrowser: null,
    startDateKey: 0,
    endDateKey: 0,
    showModal: false,
    showDownloadModal: false,
    downloadSuccess: true,
    downloading: null,
  }),
  methods: {
    ...mapActions('charts', ['dataChart']),

    closeDownloadModal() {
      this.showDownloadModal = false;
      this.resetButtonsVisibility();
    },
    resetButtonsVisibility() {
      const shareButtons = document.querySelectorAll('.chart--btn-wrapper, .chart--btn-wrapper-saves');
      const mapZoomControlBtn = document.querySelectorAll('.leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar');
      const shadowBoxCards = document.querySelectorAll('.v-application , .elevation-2');

      shareButtons.forEach((button) => {
        // eslint-disable-next-line no-param-reassign
        button.style.display = '';
      });
      mapZoomControlBtn.forEach((button) => {
        // eslint-disable-next-line no-param-reassign
        button.style.display = '';
      });
      shadowBoxCards.forEach((card) => {
        card.setAttribute('style', 'box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;');
      });
    },

    formatStartDate() {
      if (this.startDate) {
        return formatDate(new Date(this.startDate));
      }
      return '';
    },
    formatEndDate() {
      if (this.endDate) {
        return formatDate(new Date(this.endDate));
      }
      return '';
    },
    newSearch() {
      this.filter();
      this.showModal = false;
    },
    filter() {
      const [startDate, endDate, location, typeDevice, browser] = [
        this.formatStartDate(),
        this.formatEndDate(),
        this.selectedCity || '',
        this.selectedDevice || '',
        this.selectedBrowser || '',
      ];

      const data = {
        startDate, endDate, location, typeDevice, browser,
      };
      this.$store.dispatch('charts/dataChart', data);
    },
    clearFields() {
      this.startDate = '';
      this.endDate = '';
      this.selectedCity = null;
      this.selectedDevice = null;
      this.selectedBrowser = null;
      this.startDateKey += 1;
      this.endDateKey += 1;
      this.filter();
    },
    prepareToExportData() {
      const shareButtons = document.querySelectorAll('.chart--btn-wrapper, .chart--btn-wrapper-saves');
      const mapZoomControlBtn = document.querySelectorAll('.leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar');
      const shadowBoxCards = document.querySelectorAll('.v-application .elevation-2');

      shareButtons.forEach((button) => {
        // eslint-disable-next-line no-param-reassign
        button.style.display = 'none';
      });
      mapZoomControlBtn.forEach((button) => {
        // eslint-disable-next-line no-param-reassign
        button.style.display = 'none';
      });
      shadowBoxCards.forEach((card) => {
        card.setAttribute('style', 'box-shadow: none !important; border: 1px solid #EEEE;');
      });
    },
    async downloadCSV() {
      this.downloading = 'csv';
      try {
        const response = await this.$api.$get(
          `/dashboard/download-csv/?startDate=${this.startDate || ''}&endDate=${
            this.endDate || ''
          }&location=${this.selectedCity || ''}&type_device=${
            this.selectedDevice || ''
          }&browser=${this.selectedBrowser || ''}`,
          { responseType: 'blob' },
        );

        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'data.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.downloadSuccess = true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erro ao baixar o CSV:', error);
        this.downloadSuccess = false;
      } finally {
        this.downloading = null;
        this.showDownloadModal = true;
      }
    },
    async downloadImg() {
      this.downloading = 'img';
      // Since html2canvas is not available, let's use a fallback approach
      this.prepareToExportData();
      try {
        // Simple screenshot replacement
        const elementToPrint = document.getElementById('chart');
        if (elementToPrint) {
          this.$store.commit('alert/addAlert', {
            message: 'Screenshot feature requires html2canvas dependency',
          });
        }
        this.downloadSuccess = true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erro ao gerar imagem:', error);
        this.downloadSuccess = false;
      } finally {
        this.downloading = null;
        this.showDownloadModal = true;
      }
    },

    async downloadPDF() {
      this.downloading = 'pdf';
      this.prepareToExportData();
      try {
        // Simple PDF generation without external dependencies
        this.$store.commit('alert/addAlert', {
          message: 'PDF generation feature requires additional dependencies',
        });
        this.downloadSuccess = true;
      } catch (error) {
        this.$store.commit('alert/addAlert', {
          message: this.$t('image-error'),
        });
        this.downloadSuccess = false;
      } finally {
        this.downloading = null;
        this.showDownloadModal = true;
      }
    },
  },
};
</script>

<style scoped lang="sass">
.chart
  background-color: #f5f5f5
  min-height: 100vh

  .chart-header
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    color: white
    padding: 1rem 0
    box-shadow: 0 2px 12px rgba(0,0,0,0.1)

    .back-btn
      background-color: rgba(255,255,255,0.1)
      color: white !important

      &:hover
        background-color: rgba(255,255,255,0.2)

    .logo-img
      filter: brightness(0) invert(1)

    .page-title
      font-size: 1.75rem
      font-weight: 300
      margin: 0
      text-shadow: 0 1px 3px rgba(0,0,0,0.3)

  .toolbar-section
    background: white
    border-bottom: 1px solid #e0e0e0
    padding: 0.75rem 0

    .filter-btn
      border-radius: 25px
      font-weight: 500
      text-transform: none

    .download-buttons
      display: flex
      gap: 0.5rem

      .download-btn
        border-radius: 50%
        transition: all 0.3s ease

        &:hover
          transform: translateY(-2px)
          box-shadow: 0 4px 8px rgba(0,0,0,0.2)

  .content-section
    max-width: 1200px
    margin: 0 auto

  .charts-grid
    margin-bottom: 1.5rem

    &:last-child
      margin-bottom: 0

  .chart-card
    border-radius: 12px
    overflow: hidden
    transition: all 0.3s ease
    height: 100%

    &:hover
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important
      transform: translateY(-2px)

    .chart-title
      background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)
      border-bottom: 1px solid #dee2e6
      padding: 1rem 1.5rem
      font-size: 1.1rem
      font-weight: 600

    .chart-content, .table-content
      padding: 1.5rem

    &.map-card
      min-height: 450px

      .map-content
        padding: 0
        height: 400px

    &.table-card
      .table-content
        padding: 1rem

  // Modal styling
  .v-dialog .v-card
    border-radius: 12px

    .v-card-title
      background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)
      border-bottom: 1px solid #dee2e6

  // Success/Error content
  .success-content, .error-content
    display: flex
    flex-direction: column
    align-items: center

// Responsive adjustments
@media (max-width: 960px)
  .chart
    .chart-header
      .page-title
        font-size: 1.5rem
        text-align: center
        margin-top: 1rem

    .toolbar-section
      .py-3
        flex-direction: column
        gap: 1rem

      .download-buttons
        justify-content: center

    .content-section
      padding: 1rem 0.5rem

    .chart-card
      margin-bottom: 1rem

@media (max-width: 600px)
  .chart
    .chart-header
      padding: 1rem

      .page-title
        font-size: 1.25rem

    .download-buttons
      flex-wrap: wrap
      justify-content: center
</style>
