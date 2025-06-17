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
    <!-- Header principal -->
    <div class="chart-header">
      <v-container fluid class="header-container">
        <v-row align="center" justify="space-between" no-gutters>
          <v-col cols="12" md="6" class="d-flex align-center">
            <v-btn
              icon
              class="back-btn mr-3"
              @click="$router.go(-1)"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-img
              :src="logo_funai"
              max-width="140"
              contain
              class="logo-img"
            />
          </v-col>
          <v-col cols="12" md="6" class="text-center text-md-right">
            <h1 class="page-title">
              {{ $t('viewsControl') }}
            </h1>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Barra de ações -->
    <div class="toolbar-section">
      <v-container fluid>
        <v-row align="center" justify="space-between" class="toolbar-row">
          <v-col cols="12" sm="6" md="4">
            <v-btn
              color="primary"
              outlined
              @click="showModal = true"
              class="filter-btn"
            >
              <v-icon left small>mdi-filter-variant</v-icon>
              {{ $t('filter') }}
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="4" class="text-right">
            <div class="download-buttons">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    outlined
                    color="success"
                    @click="downloadCSV"
                    :loading="downloading === 'csv'"
                    v-bind="attrs"
                    v-on="on"
                    class="download-btn"
                  >
                    <v-icon small>mdi-microsoft-excel</v-icon>
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
                    @click="downloadPDF"
                    :loading="downloading === 'pdf'"
                    v-bind="attrs"
                    v-on="on"
                    class="download-btn"
                  >
                    <v-icon small>mdi-file-pdf-outline</v-icon>
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
                    @click="downloadImg"
                    :loading="downloading === 'img'"
                    v-bind="attrs"
                    v-on="on"
                    class="download-btn"
                  >
                    <v-icon small>mdi-image-outline</v-icon>
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
    <v-container fluid class="content-section">
      <v-dialog
        v-model="showModal"
        max-width="600px"
      >
        <v-card>
          <v-card-title class="justify-lg-space-between">
            <span>{{ $t('filterOptions') }}</span>

            <v-btn
              flat
              color="white"
              text
              @click="showModal = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-container fluid>
              <v-row
                align="center"
                class="column"
                justify="space-around"
              >
                <v-col class="mt-7">
                  <v-row>
                    <v-col>
                      <BaseDateField
                        :key="startDateKey"
                        v-model="startDate"
                        :label="$t('startDate')"
                        :required="true"
                        outlined
                      />
                    </v-col>
                    <v-col>
                      <BaseDateField
                        :key="endDateKey"
                        v-model="endDate"
                        :label="$t('endDate')"
                        :required="true"
                        flex-row
                        outlined
                      />
                    </v-col>
                  </v-row>
                  <v-col>
                    <v-row>
                      <v-select
                        v-model="selectedCity"
                        :label="$t('searchingPerCities')"
                        :items="citiesList"
                      />
                    </v-row>
                    <v-row class="input-row">
                      <v-select
                        v-model="selectedDevice"
                        :label="$t('searchingPerDevices')"
                        :items="devicesList"
                      />
                      <v-select
                        v-model="selectedBrowser"
                        :label="$t('searchingPerBrowsers')"
                        :items="browserList"
                      />
                    </v-row>
                  </v-col>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="secondary"
              @click="newSearch"
            >
              {{ $t('searchLabel') }}
            </v-btn>
            <v-spacer />
            <v-btn
              width="fit-content"
              color="gray"
              plain
              @click="clearFields"
            >
              {{ $t('clearFieldsLabel') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- Grid principal com gráficos -->
      <v-row>
        <!-- Gráfico de linha principal -->
        <v-col cols="12" lg="8">
          <v-card class="chart-card mb-4" elevation="2">
            <v-card-title class="pb-2">
              <v-icon left color="primary">mdi-chart-line</v-icon>
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
            <v-card-text>
              <LineChartViews
                :start-date="formatStartDate()"
                :end-date="formatEndDate()"
                :height="350"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Mapa -->
        <v-col cols="12" lg="4">
          <v-card class="chart-card mb-4" elevation="2" height="450">
            <v-card-title class="pb-2">
              <v-icon left color="success">mdi-map-marker</v-icon>
              {{ $t('userAccessMap') }}
            </v-card-title>
            <v-card-text class="pa-0">
              <MapUserViews />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Segunda linha - Gráficos circulares -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="chart-card mb-4" elevation="2">
            <v-card-title class="pb-2">
              <v-icon left color="info">mdi-devices</v-icon>
              {{ $t('cmrAccessMode') }}
            </v-card-title>
            <v-card-text>
              <DoughnutChartContainer />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="chart-card mb-4" elevation="2">
            <v-card-title class="pb-2">
              <v-icon left color="warning">mdi-web</v-icon>
              {{ $t('browserTypeUsed') }}
            </v-card-title>
            <v-card-text>
              <PieChartView />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Terceira linha - Tabelas -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="chart-card mb-4" elevation="2">
            <v-card-title class="pb-2">
              <v-icon left color="indigo">mdi-table</v-icon>
              {{ $t('dailyAccessData') }}
            </v-card-title>
            <v-card-text>
              <TableDefault
                :labels="viewLabelsTitle"
                :daily-counts="getDateCounts"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="chart-card mb-4" elevation="2">
            <v-card-title class="pb-2">
              <v-icon left color="purple">mdi-chart-bar</v-icon>
              {{ $t('monthlyAccessData') }}
            </v-card-title>
            <v-card-text>
              <TableDefault
                :labels="viewLabelsTitle"
                :monthly-counts="getDataChart.monthly_counts"
                :total="true"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <v-dialog
      v-model="showDownloadModal"
      persistent
      max-width="500px"
    >
      <v-card>
        <v-img
          class="align-top bottom-0"
          height="100"
          src="/img/login.jpg"
          cover
        >
          <v-card-title>
            <v-spacer />
            <v-btn
              icon
              @click="closeDownloadModal"
            >
              <v-icon color="white">
                mdi-close
              </v-icon>
            </v-btn>
          </v-card-title>
        </v-img>
        <v-card-text class="d-flex pt-4 justify-md-center">
          <span
            v-if="downloadSuccess"
            class="d-flex flex-lg-column align-md-center"
          >
            <v-icon
              x-large
              color="success"
            >mdi-check-circle</v-icon>
            <p class="text-subtitle-1">{{ $t('downloadSuccessMessage') }}</p>
          </span>
          <span
            v-else
            class="d-flex flex-lg-column align-md-center"
          >
            <v-icon
              x-large
              color="error"
            >mdi-cancel</v-icon>
            <p>{{ $t('downloadErrorMessage') }}</p>
          </span>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';
import { mapGetters, mapActions } from 'vuex';
import { formatDate } from '@/store/charts';
import BarChartDefault from '@/components/graphics/dashboard/BarChartDefault.vue';
import DoughnutChartContainer from '@/components/graphics/dashboard/DoughnutChartContainer.vue';
import LineChartViews from '@/components/graphics/dashboard/LineChartViews.vue';
import PieChartView from '@/components/graphics/dashboard/PieChart.vue';
import RadarChart from '@/components/graphics/RadarChart.vue';
import BaseDateField from '@/components/base/BaseDateField.vue';
import TableDefault from '@/components/graphics/dashboard/TableDefault';
import MapUserViews from '@/components/map/MapUserViews.vue';

export default {
  name: 'ViewsChartPage',
  components: {
    TableDefault,
    BarChartDefault,
    DoughnutChartContainer,
    LineChartViews,
    PieChartView,
    RadarChart,
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

      shareButtons.forEach((button) => (button.style.display = ''));
      mapZoomControlBtn.forEach((button) => (button.style.display = ''));
      shadowBoxCards.forEach((card) => (card.setAttribute('style', 'box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;')));
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

      shareButtons.forEach((button) => (button.style.display = 'none'));
      mapZoomControlBtn.forEach((button) => (button.style.display = 'none'));
      shadowBoxCards.forEach((card) => (card.setAttribute('style', 'box-shadow: none !important; border: 1px solid #EEEE;')));
    },
    async downloadCSV() {
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
        console.error('Erro ao baixar o CSV:', error);
        this.downloadSuccess = false;
      } finally {
        this.showDownloadModal = true;
      }
    },
    async downloadImg() {
      const elementToPrint = document.getElementById('chart');
      this.prepareToExportData();
      try {
        const canvas = await html2canvas(elementToPrint, {
          useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.setAttribute('download', 'data.png');
        link.click();
        this.downloadSuccess = true;
      } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        this.downloadSuccess = false;
      } finally {
        this.showDownloadModal = true;
      }
    },

    async downloadPDF() {
      this.prepareToExportData();
      try {
        const nameImageDownload = `${this.$t('viewsControl')}|${this.startDate ? this.startDate : ''}|${this.endDate ? this.endDate : ''}`;
        const options = {
          quality: 1,
          bgcolor: 'white',
        };
        const node = document.getElementById('chart');
        await domtoimage.toJpeg(node, options).then((image) => {
          const doc = new jsPDF({
            orientation: 'portrait',
            format: 'A4',
            compression: 'SLOW',
          });
          doc.addImage(image, 'JPEG', 0, 0, 210, 295);
          doc.save(`${nameImageDownload}.pdf`);
        });
        this.showDownloadModal = true;
        this.downloadSuccess = true;
      } catch (error) {
        this.$store.commit('alert/addAlert', {
          message: this.$t('image-error'),
        });
        this.downloadSuccess = false;
      } finally {
        this.showDownloadModal = true;
      }
    },
  },
};
</script>

<style scoped lang="sass">
.v-image__image.v-image__image--cover
  background-position: bottom !important

.chart
  position: sticky
  top: 0
  z-index: 3

  &--btn-wrapper
    display: flex
    flex-wrap: wrap
    align-items: center
    justify-content: flex-end
    gap: 1rem

    &-saves
      border: 1px solid #d92b3f
      border-radius: 8px
      position: relative

      &::before
       content: 'Download'
       font-size: 12px
       position: absolute
       top: -20px

  &--card
    border-radius: 6px
    padding: 1.5rem
    background: #fff
    margin: 0.5rem 0

    &-row
      background: #fff
      margin-top: 0

      & + .chart--card-row
        margin-left: 0.5rem

  &--column
    border: 1px solid #EEEEEE !important

  &-header
    position: sticky
    top: 0
    padding: 0.5rem
    background: #EEEEEE
    z-index: 333

    &-logo
      width: 15rem
      margin: 0 auto

.container-iframe
    display: inline-block
    width: 100%
    height: 100vh
    border: 0

.input-row
    display: flex
    gap: 2rem
    flex-wrap: wrap
</style>
