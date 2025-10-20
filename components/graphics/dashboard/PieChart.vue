<template>
  <v-container class="pa-2 text-center">
    <v-row class="justify-center">
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <div class="chart-wrapper position-relative">
          <pie-chart
            v-if="chartData && chartData.labels && chartData.labels.length > 0"
            ref="pieChart"
            :chart-data="chartData"
            :chart-options="chartOptions"
          />
          <div
            v-else
            class="mt-16"
          >
            <v-icon
              large
              color="grey lighten-1"
            >
              mdi-chart-donut
            </v-icon>
            <p class="grey--text text--lighten-1 mt-2">
              Dados não disponíveis
            </p>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row
      v-if="legendItems.length > 0"
      class="justify-center mt-2"
    >
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <legend-list :legend-items="legendItems" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Pie } from 'vue-chartjs';
import { mapGetters } from 'vuex';
import LegendList from './LegendList.vue';

export default {
  components: {
    LegendList,
    PieChart: {
      extends: Pie,
      props: ['chartData', 'chartOptions'],
      mounted() {
        this.renderChart(this.chartData, this.chartOptions);
      },
      watch: {
        chartData: {
          handler(newData) {
            this.renderChart(newData, this.chartOptions);
          },
          deep: true,
        },
        chartOptions: {
          handler(newOptions) {
            this.renderChart(this.chartData, newOptions);
          },
          deep: true,
        },
      },
    },
  },
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
        legend: {
          display: false,
        },
        tooltips: {
          enabled: true,
        },
      },
      legendItems: [],
    };
  },
  computed: {
    ...mapGetters('charts', [
      'getDataChart',
      'getDates',
      'getDateCounts',
      'getTypeDeviceCounts',
      'getBrowserCounts',
    ]),
  },
  watch: {
    getBrowserCounts: {
      async handler() {
        await this.prepareChartData();
      },
      immediate: true,
    },
  },
  mounted() {
    this.prepareChartData();
  },
  methods: {
    async prepareChartData() {
      try {
        const browserCounts = await this.getBrowserCounts;
        if (!browserCounts || Object.keys(browserCounts).length === 0) {
          this.setEmptyState();
          return;
        }

        const labels = Object.keys(browserCounts);
        const data = Object.values(browserCounts);
        const backgroundColors = ['#D92B3F', '#C5C3C6', '#FFCE03', '#91AEC1', '#F58A1F', '#1985A1', '#4CAF50', '#9C27B0'];

        const total = data.reduce((sum, value) => sum + value, 0);

        this.legendItems = labels.map((label, index) => ({
          label,
          count: total ? ((data[index] / total) * 100).toFixed(0) : 0,
          color: backgroundColors[index % backgroundColors.length],
        }));

        this.chartData = {
          labels,
          datasets: [
            {
              backgroundColor: backgroundColors,
              data,
            },
          ],
        };
      } catch (error) {
        console.error('Error preparing chart data:', error);
        this.setEmptyState();
      }
    },
    setEmptyState() {
      this.chartData = null;
      this.legendItems = [{
        label: 'Sem dados disponíveis',
        count: 0,
        color: '#e0e0e0',
        value: 0,
      }];
    },
  },
};
</script>

<style lang="sass" scoped>
.chart-wrapper
  width: 300px
  height: 300px

</style>
