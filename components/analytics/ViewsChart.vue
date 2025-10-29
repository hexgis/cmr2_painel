<template>
  <div
    id="chart"
    class="chart"
  >
    <!-- Header moderno -->
    <div class="chart-header">
      <v-container
        fluid
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
              class="mr-3"
              style="background-color: rgba(0,0,0,0.05)"
              color="grey-darken-4"
              @click="$router.go(-1)"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-img
              :src="logo_funai"
              max-width="140"
              contain
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="d-flex align-center justify-end"
          >
            <div class="d-flex align-center ga-3">
              <div class="d-flex align-center ga-4 mr-2">
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
                    {{ $t('general') }}
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
                rounded
                class="text-capitalize"
                @click="showFilterModal"
              >
                <v-icon
                  left
                  small
                >
                  mdi-filter-variant
                </v-icon>
                {{ $t('filter') }}
              </v-btn>

              <!-- Export buttons -->
              <div class="d-flex align-center ml-3">
                <div class="export-icons">
                  <div class="export-label text-uppercase mr-2">
                    Exportar
                  </div>

                  <v-tooltip top>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        color="#D92B3F"
                        v-bind="attrs"
                        class="mr-2"
                        :loading="downloading === 'pdf'"
                        v-on="on"
                        @click="downloadPDF"
                      >
                        <v-icon size="40">
                          mdi-file-pdf-box
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>PDF</span>
                  </v-tooltip>

                  <v-tooltip top>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        disabled
                        color="#43A047"
                        class="mr-2"
                        v-bind="attrs"
                        :loading="downloading === 'csv'"
                        v-on="on"
                        @click="downloadCSV"
                      >
                        <v-icon size="40">
                          mdi-file-excel-box
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>CSV</span>
                  </v-tooltip>

                  <v-tooltip top>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        color="#FF9800"
                        class="mr-3"
                        v-bind="attrs"
                        :loading="downloading === 'img'"
                        v-on="on"
                        @click="downloadImg"
                      >
                        <v-icon size="40">
                          mdi-image
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Imagem</span>
                  </v-tooltip>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <!-- Conteúdo principal -->
    <v-container
      fluid
      class="py-4 py-sm-2 px-2 px-sm-1"
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
              <v-row dense>
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
                <v-col cols="12">
                  <v-select
                    v-model="selectedCity"
                    :label="$t('searchingPerCities')"
                    :items="citiesList"
                    outlined
                    clearable
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="selectedCR"
                    :label="$t('searchingPerCR')"
                    :items="crList"
                    outlined
                    multiple
                    clearable
                  />
                </v-col>
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
                :start-date="formatDate(appliedFilters.startDate)"
                :end-date="formatDate(appliedFilters.endDate)"
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
          :md="institutionType === 'FUNAI' ? 'auto' : 3"
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
          :md="institutionType === 'FUNAI' ? 'auto' : 3"
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
          v-if="institutionType === 'FUNAI'"
          cols="12"
          md="auto"
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
                mdi-account-group
              </v-icon>
              {{ $t('accessByCR') }}
            </v-card-title>
            <v-card-text class="chart-content compact-chart-content">
              <DoughnutChartContainer
                data-type="institutions"
                :dataset-label="'Instituições CR'"
                :no-data-message="'Sem dados de instituições'"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          :md="institutionType === 'FUNAI' ? 'auto' : 3"
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
          :md="institutionType === 'FUNAI' ? 'auto' : 3"
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

<i18n>
  {
    "en": {
      "searchLabel": "Search",
      "startDate": "Start Date",
      "endDate": "End Date",
      "lastAccesses": "Last Accesses",
      "userAccessMap": "Map with user access location",
      "cmrAccessMode": "Access mode to CMR",
      "accessByCR": "Access by CR - FUNAI",
      "viewsControl": "Views Control",
      "browserTypeUsed": "Browser type used",
      "dailyAccessData": "Daily access data",
      "monthlyAccessData": "Monthly access data",
      "period": "Period",
      "visits": "Visits",
      "searchingPerCities": "Searching per Cities",
      "searchingPerCR": "Searching per Regional Coordination",
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
      "general": "General",
      "funai": "Funai"
    },
    "pt-br": {
      "searchLabel": "Pesquisar",
      "startDate": "Data de início",
      "endDate": "Data de fim",
      "lastAccesses": "Últimos Acessos",
      "userAccessMap": "Mapa com a localização de acesso dos usuários",
      "cmrAccessMode": "Modo de acesso ao CMR",
      "accessByCR": "Acessos por CR - FUNAI",
      "viewsControl": "Controle de Acessos",
      "browserTypeUsed": "Tipo de navegador utilizado",
      "dailyAccessData": "Dados diários de acesso",
      "monthlyAccessData": "Dados mensais de acesso",
      "period": "Período",
      "visits": "Visitas",
      "searchingPerCities": "Busca por Município",
      "searchingPerCR": "Busca por Coordenação Regional",
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
      "general": "Geral",
      "funai": "Funai"
    }
  }
</i18n>

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
    viewLabelsTitle: ['Período', 'Visitas'],
    appliedFilters: {
      startDate: '',
      endDate: '',
      city: null,
      cr: null,
      device: null,
      browser: null,
    },
    startDate: '',
    endDate: '',
    selectedCity: null,
    selectedDevice: null,
    selectedBrowser: null,
    selectedCR: null,
    startDateKey: 0,
    endDateKey: 0,
    showModal: false,
    showDownloadModal: false,
    downloadSuccess: true,
    downloading: null,
    institutionType: 'AGÊNCIAS',
    loading: false,
  }),

  computed: {
    ...mapGetters('charts', [
      'getDataChart',
      'getDateCounts',
      'getTypeDeviceCounts',
      'getBrowserCounts',
      'getLocations',
      'getInstitutionCrCounts',
    ]),
    citiesList() {
      const citiesSet = new Set();
      this.getLocations.forEach((item) => {
        if (item.city) {
          citiesSet.add(item.city);
        }
      });
      return Array.from(citiesSet);
    },
    crList() {
      return Object.keys(this.getInstitutionCrCounts || {});
    },
    devicesList() {
      return Object.keys(this.getTypeDeviceCounts);
    },
    browserList() {
      return Object.keys(this.getBrowserCounts);
    },
  },

  async created() {
    await this.initializeData();
  },

  async initializeData() {
    let institutionCrParam = '';
    if (this.appliedFilters.cr) {
      if (Array.isArray(this.appliedFilters.cr)) {
        institutionCrParam = this.appliedFilters.cr.join(',');
      } else {
        institutionCrParam = this.appliedFilters.cr;
      }
    }

    await this.dataChart({
      startDate: this.appliedFilters.startDate,
      endDate: this.appliedFilters.endDate,
      location: this.appliedFilters.city || '',
      typeDevice: this.appliedFilters.device || '',
      browser: this.appliedFilters.browser || '',
      institutionCr: institutionCrParam,
    });
  },

  methods: {
    ...mapActions('charts', ['dataChart', 'setInstitutionFilter']),

    formatDate(date) {
      if (date) {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
      }
      return '';
    },

    async initializeData() {
      await this.dataChart({
        startDate: this.appliedFilters.startDate,
        endDate: this.appliedFilters.endDate,
        location: this.appliedFilters.city || '',
        typeDevice: this.appliedFilters.device || '',
        browser: this.appliedFilters.browser || '',
        institutionAcronym: this.appliedFilters.cr || '',
      });
    },

    showFilterModal() {
      this.startDate = this.appliedFilters.startDate;
      this.endDate = this.appliedFilters.endDate;
      this.selectedCity = this.appliedFilters.city;
      this.selectedCR = this.appliedFilters.cr;
      this.selectedDevice = this.appliedFilters.device;
      this.selectedBrowser = this.appliedFilters.browser;
      this.showModal = true;
    },

    updateInstitution() {
      this.setInstitutionFilter(this.institutionType).then(() => {
        this.filter();
      });
    },

    closeDownloadModal() {
      this.showDownloadModal = false;
      this.resetButtonsVisibility();
    },

    toggleExportMode(hide = true) {
      const sel = {
        share: '.chart--btn-wrapper, .chart--btn-wrapper-saves',
        map: '.leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar',
        card: '.v-application .elevation-2',
        head: '.chart-header',
      };

      const disp = hide ? 'none' : '';
      const cardStyle = hide
        ? 'box-shadow:none!important;border:1px solid #EEE;'
        : 'box-shadow:0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)!important;';

      [sel.share, sel.map, sel.head].forEach((s) => document.querySelectorAll(s).forEach((e) => (e.style.display = disp)));

      document.querySelectorAll(sel.card)
        .forEach((c) => c.setAttribute('style', cardStyle));
    },

    prepareToExportData() {
      this.toggleExportMode(true);
    },

    resetButtonsVisibility() {
      this.toggleExportMode(false);
    },

    newSearch() {
      this.appliedFilters.startDate = this.startDate;
      this.appliedFilters.endDate = this.endDate;
      this.appliedFilters.city = this.selectedCity;
      this.appliedFilters.cr = this.selectedCR;
      this.appliedFilters.device = this.selectedDevice;
      this.appliedFilters.browser = this.selectedBrowser;
      this.showModal = false;
      this.filter();
    },

    async filter() {
      this.loading = true;
      let institutionCrParam = '';
      if (this.appliedFilters.cr) {
        if (Array.isArray(this.appliedFilters.cr)) {
          institutionCrParam = this.appliedFilters.cr.join(',');
        } else {
          institutionCrParam = this.appliedFilters.cr;
        }
      }

      const data = {
        startDate: this.appliedFilters.startDate || '',
        endDate: this.appliedFilters.endDate || '',
        location: this.appliedFilters.city || '',
        typeDevice: this.appliedFilters.device || '',
        browser: this.appliedFilters.browser || '',
        institutionCr: institutionCrParam,
      };

      try {
        await this.$store.dispatch('charts/dataChart', data);
        await this.$nextTick();
      } catch (error) {
        this.$store.commit('alert/addAlert', {
          message: this.$t('error'),
        });
      } finally {
        this.loading = false;
      }
    },

    clearFields() {
      this.startDate = '';
      this.endDate = '';
      this.selectedCity = null;
      this.selectedCR = null; // Isso limpará o select múltiplo
      this.selectedDevice = null;
      this.selectedBrowser = null;

      this.appliedFilters.startDate = '';
      this.appliedFilters.endDate = '';
      this.appliedFilters.city = null;
      this.appliedFilters.cr = null;
      this.appliedFilters.device = null;
      this.appliedFilters.browser = null;

      this.startDateKey += 1;
      this.endDateKey += 1;
      this.filter();
    },

    async downloadCSV() {
      this.downloading = 'csv';
      let institutionCrParam = '';
      if (this.appliedFilters.cr) {
        if (Array.isArray(this.appliedFilters.cr)) {
          institutionCrParam = this.appliedFilters.cr.join(',');
        } else {
          institutionCrParam = this.appliedFilters.cr;
        }
      }

      try {
        const response = await this.$api.$get(
          `/dashboard/download-csv/?startDate=${this.appliedFilters.startDate || ''}&endDate=${
            this.appliedFilters.endDate || ''
          }&location=${this.appliedFilters.city || ''}&type_device=${
            this.appliedFilters.device || ''
          }&browser=${this.appliedFilters.browser || ''}&institution_acronym=${
            institutionCrParam || ''
          }`,
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
        this.downloadSuccess = false;
        this.$store.commit('alert/addAlert', {
          message: this.$t('downloadErrorMessage'),
        });
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
        this.downloadSuccess = false;
        this.$store.commit('alert/addAlert', {
          message: this.$t('downloadErrorMessage'),
        });
      } finally {
        this.downloading = null;
        this.showDownloadModal = true;
        this.resetButtonsVisibility();
      }
    },

    formatTitleForDocument() {
      const title = this.$t('viewsControl');
      let filename = title;

      if (this.startDate && this.endDate) {
        filename += ` | ${this.startDate} → ${this.endDate}`;
      } else if (this.startDate) {
        filename += ` | ${this.startDate}`;
      } else if (this.endDate) {
        filename += ` | ${this.endDate}`;
      }

      return { title, filename };
    },

    async downloadPDF() {
      this.downloading = 'pdf';
      this.prepareToExportData();
      try {
        const { title, filename } = this.formatTitleForDocument();
        const node = document.getElementById('chart');

        // Render node to image
        const image = await domtoimage.toPng(node, {
          quality: 1,
          bgcolor: '#ffffff',
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
            filter: 'none',
          },
        });

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Title centered at the top
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, pageWidth / 2, 12, { align: 'center' });

        const img = new Image();
        img.src = image;
        await new Promise((resolve) => (img.onload = resolve));

        // Keep image ratio and center it
        const ratio = Math.min(pageWidth / img.width, (pageHeight - 20) / img.height);
        const imgWidth = img.width * ratio;
        const imgHeight = img.height * ratio;
        const marginX = (pageWidth - imgWidth) / 2;
        const marginY = (pageHeight - imgHeight) / 2 + 5;

        pdf.addImage(img, 'PNG', marginX, marginY, imgWidth, imgHeight);
        pdf.save(`${filename}.pdf`);

        this.downloadSuccess = true;
      } catch (error) {
        this.downloadSuccess = false;
        this.$store.commit('alert/addAlert', {
          message: this.$t('downloadErrorMessage'),
        });
      } finally {
        this.downloading = null;
        this.showDownloadModal = true;
        this.resetButtonsVisibility();
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
.download-buttons
  .download-btn
    border-color: #666
    color: #666
    transition: all 0.3s ease

    &:hover
      background-color: rgba(0,0,0,0.05)
      transform: translateY(-2px)
      box-shadow: 0 4px 8px rgba(0,0,0,0.2)

.chart
  background-color: #f5f5f5
  min-height: 100vh

  .chart-header
    background: white
    color: #333
    padding: 1rem 0
    box-shadow: 0 2px 12px rgba(0,0,0,0.1)

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

    &.map-card
      min-height: 450px

      .map-content
        padding: 0
        height: 400px

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

.charts-grid .pa-2
  flex: 1 1 auto
  min-width: 0

@media (max-width: 960px)
  .chart
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

// Export buttons styles
.export-label
  letter-spacing: 0.5px
  font-size: 0.8rem
  display: flex
  align-items: center

.export-icons
  display: flex
  align-items: center
  gap: 0.25rem
</style>
