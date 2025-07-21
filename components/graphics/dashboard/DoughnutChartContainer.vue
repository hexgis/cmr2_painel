<template>
  <v-container class="pa-2">
    <v-row class="justify-center">
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <div class="chart-wrapper">
          <doughnut-chart
            v-if="chartData"
            :chart-data="chartData"
            :chart-options="chartOptions"
          />
        </div>
      </v-col>
    </v-row>
    <v-row class="justify-center mt-2">
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
import { mapGetters } from 'vuex';
import DoughnutChart from './DoughnutChart.vue';
import LegendList from './LegendList.vue';

export default {
  components: {
    DoughnutChart,
    LegendList,
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
        cutout: '60%',
      },
      legendItems: [],
    };
  },
  computed: {
    ...mapGetters('charts', [
      'getTypeDeviceCounts',
    ]),
  },
  watch: {
    getTypeDeviceCounts: {
      async handler() {
        await this.prepareChartData();
      },
    },
  },
  methods: {
    async prepareChartData() {
      const labels = Object.keys(await this.getTypeDeviceCounts);
      const data = Object.values(await this.getTypeDeviceCounts);
      const backgroundColors = ['#D92B3F', '#F58A1F', '#FFCE03'];

      const total = data.reduce((sum, value) => sum + value, 0);

      this.legendItems = labels.map((label, index) => ({
        label,
        count: (data[index] / total * 100).toFixed(0),
        color: backgroundColors[index],
      }));

      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Modo de acesso ao CMR',
            backgroundColor: backgroundColors,
            data,
          },
        ],
      };
    },
  },
};
</script>

<style lang="sass" scoped>
.chart-wrapper
  width: 300px
  height: 300px

.v-container
  text-align: center

.mt-2
  margin-top: 8px !important
</style>
