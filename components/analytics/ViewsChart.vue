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
      "close": "Close",
      "agencias": "Agencies",
      "funai": "Funai"
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
      "close": "Fechar",
      "agencias": "Agências",
      "funai": "Funai"
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
        class="header-container"
      >
        <v-row
          align="center"
          justify="space-between"
          no-gutters
        >
          <v-col
            cols="12"
            md="6"
            class="d-flex align-center"
          >
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
          <v-col
            cols="12"
            md="6"
            class="d-flex align-center justify-end"
          >
            <div class="header-actions d-flex align-center ga-3">
              <div class="toggle_container d-flex align-center ga-4 mr-2">
                <div class="toggle_wrapper">
                  <input
                    id="agencias"
                    v-model="institutionType"
                    class="toggle_input"
                    type="radio"
                    value="AGÊNCIAS"
                    @change="updateInstitution"
                  >
                  <label
                    class="toggle_button"
                    for="agencias"
                  >
                    {{ $t('agencias') }}
                  </label>
                  <input
                    id="funai"
                    v-model="institutionType"
                    class="toggle_input"
                    type="radio"
                    value="FUNAI"
                    @change="updateInstitution"
                  >
                  <label
                    class="toggle_button"
                    for="funai"
                  >
                    {{ $t('funai') }}
                  </label>
                  <div
                    class="toggle_slider"
                    :class="{ right: institutionType === 'FUNAI' }"
                  />
                </div>
              </div>

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

              <div class="download-buttons d-flex ga-2">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      icon
                      small
                      outlined
                      color="grey"
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
                      color="grey"
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
                      color="grey"
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
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <!-- Conteúdo principal -->
    <v-container
      fluid
      class="content-section pa-0"
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
      <v-row class="charts-grid ma-0">
        <!-- Gráfico de linha principal -->
        <v-col
          cols="12"
          lg="6"
          class="pa-2"
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
          lg="6"
          class="pa-2"
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

      <!-- Segunda linha - Gráficos circulares e dados -->
      <v-row class="charts-grid ma-0">
        <v-col
          cols="12"
          md="3"
          class="pa-2"
        >
          <v-card
            class="chart-card compact-chart"
            elevation="2"
          >
            <v-card-title class="chart-title compact-title">
              <v-icon
                left
                small
                color="warning"
              >
                mdi-web
              </v-icon>
              {{ $t('browserTypeUsed') }}
            </v-card-title>
            <v-card-text class="chart-content compact-chart-content">
              <PieChartView />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="3"
          class="pa-2"
        >
          <v-card
            class="chart-card compact-chart"
            elevation="2"
          >
            <v-card-title class="chart-title compact-title">
              <v-icon
                left
                small
                color="info"
              >
                mdi-devices
              </v-icon>
              {{ $t('cmrAccessMode') }}
            </v-card-title>
            <v-card-text class="chart-content compact-chart-content">
              <DoughnutChartContainer />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="3"
          class="pa-2"
        >
          <!-- Dados diários -->
          <v-card
            class="chart-card table-card"
            elevation="2"
          >
            <v-card-title class="chart-title compact-title">
              <v-icon
                left
                small
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
          md="3"
          class="pa-2"
        >
          <!-- Dados mensais -->
          <v-card
            class="chart-card table-card"
            elevation="2"
          >
            <v-card-title class="chart-title compact-title">
              <v-icon
                left
                small
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
                :institution-type="institutionType"
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
import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';
import { mapGetters, mapActions } from 'vuex';
import { formatDate } from '@/store/charts';
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
    institutionType: 'AGÊNCIAS',
  }),

  computed: {
    ...mapGetters('charts', [
      'getDataChart',
      'getDateCounts',
      'getTypeDeviceCounts',
      'getBrowserCounts',
      'getLocations',
      'getInstitutionFilter',
    ]),
    citiesList() {
      const citiesSet = new Set();
      this.getLocations.forEach((item) => {
        citiesSet.add(item.city);
      });
      return Array.from(citiesSet);
    },
    devicesList() {
      return Object.keys(this.getTypeDeviceCounts);
    },
    browserList() {
      return Object.keys(this.getBrowserCounts);
    },
  },

  async created() {
    await this.dataChart({
      startDate: this.startDate,
      endDate: this.endDate,
      location: this.selectedCity,
      typeDevice: this.selectedDevice,
      browser: this.selectedBrowser,
    });
  },

  methods: {
    ...mapActions('charts', ['dataChart', 'setInstitutionFilter']),

    updateInstitution() {
      this.setInstitutionFilter(this.institutionType).then(() => {
        this.filter();
      });
    },

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
      const data = {
        startDate: this.formatStartDate(),
        endDate: this.formatEndDate(),
        location: this.selectedCity || '',
        typeDevice: this.selectedDevice || '',
        browser: this.selectedBrowser || '',
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
      this.prepareToExportData();
      try {
        const elementToPrint = document.getElementById('chart');
        const options = {
          quality: 1,
          bgcolor: 'white',
        };

        const dataUrl = await domtoimage.toPng(elementToPrint, options);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.setAttribute('download', 'dashboard.png');
        link.click();

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
        const nameImageDownload = `${this.$t('viewsControl')}|${this.startDate ? this.startDate : ''}|${this.endDate ? this.endDate : ''}`;
        const options = {
          quality: 1,
          bgcolor: 'white',
        };
        const node = document.getElementById('chart');

        const image = await domtoimage.toJpeg(node, options);
        const doc = new jsPDF({
          orientation: 'portrait',
          format: 'A4',
          compression: 'SLOW',
        });
        doc.addImage(image, 'JPEG', 0, 0, 210, 295);
        doc.save(`${nameImageDownload}.pdf`);

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

<style scoped>
.toggle_wrapper {
  display: flex;
  position: relative;
  width: 230px;
  height: 35px;
  background-color: #f5f5f5;
  padding: 4px;
  border-radius: 200px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.toggle_button {
  flex: 1;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  color: #757575;
  z-index: 2;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toggle_slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  border: 1px solid rgba(0, 0, 0, 0.33);
  border-radius: 11.5px;
  background: #D92B3F;
  box-shadow: 0 1px 2.2px 0 rgba(0, 0, 0, 0.33);
  transition: transform 0.3s ease-in-out;
  z-index: 1;
}

.toggle_slider.right {
  transform: translateX(100%);
}

.toggle_input {
  display: none;
}

.toggle_input:checked + .toggle_button {
  color: white;
  font-weight: 500;
}
</style>

<style scoped lang="sass">
.position-relative
  position: relative

.position-absolute
  position: absolute

.left-btn
  left: 1rem

.chart
  background-color: #f5f5f5
  min-height: 100vh

  .chart-header
    background: white
    color: #333
    padding: 1rem 0
    box-shadow: 0 2px 12px rgba(0,0,0,0.1)

    .back-btn
      background-color: rgba(0,0,0,0.05)
      color: #333 !important

      &:hover
        background-color: rgba(0,0,0,0.1)

    .logo-img
      filter: none

    .header-actions
      .filter-btn
        border-color: #D92B3F
        color: #D92B3F
        border-radius: 25px
        font-weight: 500
        text-transform: none

        &:hover
          background-color: rgba(217, 43, 63, 0.1)

      .download-buttons
        .download-btn
          border-color: #666
          color: #666
          transition: all 0.3s ease

          &:hover
            background-color: rgba(0,0,0,0.05)
            transform: translateY(-2px)
            box-shadow: 0 4px 8px rgba(0,0,0,0.2)

  .content-section
    margin: 0
    padding: 0

  .charts-grid
    margin: 0

    .pa-2
      padding: 8px

    &:last-child
      margin-bottom: 0

  .compact-table
    height: auto
    max-height: 180px

    .compact-title
      padding: 8px 16px !important
      font-size: 0.9rem !important

    .compact-content
      padding: 8px 16px !important
      max-height: 120px
      overflow-y: auto

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

  .compact-table
    height: auto
    max-height: 180px

    .compact-title
      padding: 8px 16px
      font-size: 0.9rem

    .compact-content
      padding: 8px 16px
      max-height: 120px
      overflow-y: auto

      .v-data-table
        font-size: 0.8rem

        .v-data-table__wrapper
          max-height: 100px
          overflow-y: auto

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
