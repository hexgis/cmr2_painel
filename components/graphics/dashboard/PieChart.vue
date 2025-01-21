<template>
  <v-container>
    <v-row class="align-sm-center">
      <v-col cols="8">
        <pie-chart
          ref="pieChart"
          :chartData="chartData"
          :chartOptions="chartOptions"
        ></pie-chart>
      </v-col>
      <v-col cols="4">
        <legend-list :legendItems="legendItems"></legend-list>
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
      legendItems: [],
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        }
      },
    };
  },
  watch:{
    getBrowserCounts: {
      async handler(){
        await this.prepareChartData()
      }
    }
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
  methods: {
    async prepareChartData() {
      const labels = Object.keys(await this.getBrowserCounts);
      const data = Object.values(await this.getBrowserCounts);
      const backgroundColors = ['#D92B3F','#C5C3C6','#FFCE03','#91AEC1','#F58A1F','#1985A1'];

      const total = data.reduce((sum, value) => sum + value, 0);

      this.legendItems = labels.map((label, index) => ({
        label,
        count: (data[index] / total * 100).toFixed(0),
        color: backgroundColors[index]
      }));
         this.$refs.pieChart.renderChart(
      {
        labels: labels,
        datasets: [
          {
            backgroundColor: backgroundColors,
            data: data,
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
  }
};
</script>
<style lang="sass" scoped>
  .theme--light.v-list
    background: transparent

  .v-list-item__title
    margin-bottom: 0 !important

</style>
