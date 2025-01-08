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
    <div id="chart" class="chart">
        <div class="chart-header elevated">
            <v-img class="m-auto flex chart-header-logo" :src="logo_funai" />
        </div>
        <h2 class="pa-md-2 d-flex justify-center">{{ $t('viewsControl') }}</h2>
        <div class="pa-md-4 mx-lg-auto">
            <div class="chart--btn-wrapper">
                <v-btn width="fit-content" text color="primary" @click="showModal = true">
                    <span>{{ $t('filter') }}<v-icon>mdi-filter-outline</v-icon></span>
                </v-btn>
                <div class="chart--btn-wrapper-saves">
                    <v-btn icon color="gray" @click="downloadCSV">
                        <v-icon>mdi-microsoft-excel</v-icon>
                    </v-btn>
                    <v-btn icon color="gray" @click="downloadPDF">
                        <v-icon>mdi-file-pdf-outline</v-icon>
                    </v-btn>
                    <v-btn icon color="gray" @click="downloadImg">
                        <v-icon>mdi-image-outline</v-icon>
                    </v-btn>
                </div>
            </div>
            <v-dialog v-model="showModal" max-width="600px">
                <v-card>
                    <v-card-title class="justify-lg-space-between">
                        <span>{{ $t('filterOptions') }}</span>

                        <v-btn flat color="white" text @click="showModal = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text>
                        <v-container fluid>
                            <v-row align="center" class="column" justify="space-around">
                                <v-col class="mt-7">
                                    <v-row>
                                        <v-col>
                                            <BaseDateField
                                                :label="$t('startDate')"
                                                :required="true"
                                                outlined
                                                v-model="startDate"
                                                :key="startDateKey"
                                            />
                                        </v-col>
                                        <v-col>
                                            <BaseDateField
                                                :label="$t('endDate')"
                                                :required="true"
                                                flex-row
                                                outlined
                                                v-model="endDate"
                                                :key="endDateKey"
                                            />
                                        </v-col>
                                    </v-row>
                                    <v-col>
                                        <v-row>
                                            <v-select
                                                :label="$t('searchingPerCities')"
                                                :items="citiesList"
                                                v-model="selectedCity"
                                            ></v-select>
                                        </v-row>
                                        <v-row class="input-row">
                                            <v-select
                                                :label="$t('searchingPerDevices')"
                                                :items="devicesList"
                                                v-model="selectedDevice"
                                            ></v-select>
                                            <v-select
                                                :label="$t('searchingPerBrowsers')"
                                                :items="browserList"
                                                v-model="selectedBrowser"
                                            ></v-select>
                                        </v-row>
                                    </v-col>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="secondary" @click="newSearch">
                            {{ $t('searchLabel') }}
                        </v-btn>
                        <v-spacer />
                        <v-btn width="fit-content" color="gray" plain @click="clearFields">
                            {{ $t('clearFieldsLabel') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-col class="elevation-2 chart--card">
                <p>{{ $t('lastAccesses') }}</p>
                <LineChartViews
                    :startDate="formatStartDate()"
                    :endDate="formatEndDate()"
                    :height=515
                />
                <br />
                <BarChartDefault :height=515 />
            </v-col>
            <v-col class="elevation-2 chart--card">
                <p>{{ $t('userAccessMap') }}</p>
                <MapUserViews />
            </v-col>
            <v-col>
                <v-row>
                    <v-col class="elevation-2 chart--card chart--card-row">
                        <p>{{ $t('cmrAccessMode') }}</p>
                        <DoughnutChartContainer />
                    </v-col>
                    <v-col class="elevation-2 chart--card chart--card-row">
                        <p>{{ $t('browserTypeUsed') }}</p>
                        <PieChartView />
                    </v-col>
                </v-row>
            </v-col>
            <v-col>
                <v-row>
                    <v-col class="elevation-2 chart--card chart--card-row">
                        <p>{{ $t('dailyAccessData') }}</p>
                        <TableDefault :labels="viewLabelsTitle" :dailyCounts="getDateCounts" />
                    </v-col>
                    <v-col class="elevation-2 chart--card chart--card-row">
                        <p>{{ $t('monthlyAccessData') }}</p>
                        <TableDefault
                            :labels="viewLabelsTitle"
                            :monthlyCounts="getDataChart.monthly_counts"
                            :total="true"
                        />
                    </v-col>
                </v-row>
            </v-col>
        </div>
          <v-dialog persistent v-model="showDownloadModal" max-width="500px">
            <v-card>
              <v-img
                class="align-top bottom-0"
                height="100"
                src="/img/login.jpg"
                cover
              >
                <v-card-title>
                  <v-spacer></v-spacer>
                  <v-btn icon @click="closeDownloadModal">
                    <v-icon color="white">mdi-close</v-icon>
                  </v-btn>
                </v-card-title>
              </v-img>
              <v-card-text class="d-flex pt-4 justify-md-center">
                <span v-if="downloadSuccess" class="d-flex flex-lg-column align-md-center">
                  <v-icon x-large color="success">mdi-check-circle</v-icon>
                  <p class="text-subtitle-1">{{ $t('downloadSuccessMessage') }}</p>
                </span>
                <span v-else class="d-flex flex-lg-column align-md-center">
                  <v-icon x-large color="error">mdi-cancel</v-icon>
                  <p >{{ $t('downloadErrorMessage') }}</p>
                </span>
              </v-card-text>
            </v-card>
          </v-dialog>
    </div>
</template>

<script>
import html2canvas from 'html2canvas'
import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';
import { mapGetters, mapActions } from 'vuex'
import { formatDate } from '@/store/charts'
import BarChartDefault from '@/components/graphics/dashboard/BarChartDefault.vue'
import DoughnutChartContainer from '@/components/graphics/dashboard/DoughnutChartContainer.vue'
import LineChartViews from '@/components/graphics/dashboard/LineChartViews.vue'
import PieChartView from '@/components/graphics/dashboard/PieChart.vue'
import RadarChart from '@/components/graphics/RadarChart.vue'
import BaseDateField from '@/components/base/BaseDateField.vue'
import TableDefault from '@/components/graphics/dashboard/TableDefault'
import MapUserViews from '@/components/map/MapUserViews.vue'

export default {
    name: 'ViewsChartPage',
    layout: 'analytics',
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
    async created() {
        await this.getDataChart
        await this.citiesList
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
            const citiesSet = new Set()
            this.getLocations.forEach((item) => {
                citiesSet.add(item.city)
            })
            return Array.from(citiesSet)
        },
        devicesList() {
            const devicesList = Object.keys(this.getTypeDeviceCounts)
            return devicesList
        },
        browserList() {
            const browserList = Object.keys(this.getBrowserCounts)
            return browserList
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
          const shareButtons = document.querySelectorAll('.chart--btn-wrapper, .chart--btn-wrapper-saves')
          const mapZoomControlBtn = document.querySelectorAll('.leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar')
          const shadowBoxCards = document.querySelectorAll('.v-application , .elevation-2')

          shareButtons.forEach((button) => (button.style.display = ''))
          mapZoomControlBtn.forEach((button) => (button.style.display = ''))
          shadowBoxCards.forEach((card) => (card.setAttribute('style', 'box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;')))
        },

        formatStartDate() {
            if (this.startDate) {
                return formatDate(new Date(this.startDate))
            }
            return ''
        },
        formatEndDate() {
            if (this.endDate) {
                return formatDate(new Date(this.endDate))
            }
            return ''
        },
        newSearch() {
            this.filter()
            this.showModal = false
        },
        filter() {
            const [startDate, endDate, location, typeDevice, browser] = [
                this.formatStartDate(),
                this.formatEndDate(),
                this.selectedCity || '',
                this.selectedDevice || '',
                this.selectedBrowser || '',
            ]

            const data = { startDate, endDate, location, typeDevice, browser }
            this.$store.dispatch('charts/dataChart', data)
        },
        clearFields() {
            this.startDate = ''
            this.endDate = ''
            this.selectedCity = null
            this.selectedDevice = null
            this.selectedBrowser = null
            this.startDateKey += 1
            this.endDateKey += 1
            this.filter()
        },
        prepareToExportData() {
            const shareButtons = document.querySelectorAll('.chart--btn-wrapper, .chart--btn-wrapper-saves')
            const mapZoomControlBtn = document.querySelectorAll('.leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar')
            const shadowBoxCards = document.querySelectorAll('.v-application .elevation-2')

            shareButtons.forEach((button) => (button.style.display = 'none'))
            mapZoomControlBtn.forEach((button) => (button.style.display = 'none'))
            shadowBoxCards.forEach((card) => (card.setAttribute('style', 'box-shadow: none !important; border: 1px solid #EEEE;')))
        },
        async downloadCSV() {
            try {
                const response = await this.$api.$get(
                    `/dashboard/download-csv/?startDate=${this.startDate || ''}&endDate=${
                        this.endDate || ''
                    }&location=${this.selectedCity || ''}&type_device=${
                        this.selectedDevice || ''
                    }&browser=${this.selectedBrowser || ''}`,
                    { responseType: 'blob' }
                )

                const url = window.URL.createObjectURL(new Blob([response]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'data.xlsx')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                this.downloadSuccess = true;
            } catch (error) {
                console.error('Erro ao baixar o CSV:', error)
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
          this.prepareToExportData()
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
}
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
