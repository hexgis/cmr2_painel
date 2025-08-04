<template>
  <v-container class="pa-2">
    <v-row class="justify-center">
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <div class="chart-wrapper">
          <pie-chart
            ref="pieChart"
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
import { Pie } from 'vue-chartjs';
import { mapGetters } from 'vuex';
import LegendList from './LegendList.vue';

export default {
  components: {
    LegendList,
    PieChart: {
      extends: Pie,
      props: ['data', 'options'],
      mounted() {
        this.renderChart(this.data, this.options);
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
    },
  },
  mounted() {
    this.prepareChartData();
  },
  methods: {
    async prepareChartData() {
      const labels = Object.keys(await this.getBrowserCounts);
      const data = Object.values(await this.getBrowserCounts);
      const backgroundColors = ['#D92B3F', '#C5C3C6', '#FFCE03', '#91AEC1', '#F58A1F', '#1985A1'];

      const total = data.reduce((sum, value) => sum + value, 0);

      this.legendItems = labels.map((label, index) => ({
        label,
        count: total ? ((data[index] / total) * 100).toFixed(0) : 0,
        color: backgroundColors[index],
      }));
      this.$refs.pieChart.renderChart(
        {
          labels,
          datasets: [
            {
              backgroundColor: backgroundColors,
              data,
            },
          ],
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
        },
      );
    },
  },
};
</script>

<style lang="sass" scoped>
.chart-wrapper
  width: 300px
  height: 300px
  margin-top: -3rem
  margin-bottom: 3rem

.v-container
  text-align: center

  .theme--light.v-list
    background: transparent

.mt-2
  margin-top: 8px !important

.v-list-item__title
  margin-bottom: 0 !important
</style>
