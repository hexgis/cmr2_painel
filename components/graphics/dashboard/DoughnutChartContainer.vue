<template>
  <v-container>
    <v-row class="align-sm-center">
      <v-col cols="8">
        <doughnut-chart
          v-if="chartData"
          :chartData="chartData"
          :chartOptions="chartOptions"
        ></doughnut-chart>
      </v-col>
      <v-col cols="4">
        <legend-list :legendItems="legendItems"></legend-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DoughnutChart from './DoughnutChart.vue';
import LegendList from './LegendList.vue';
import { mapGetters } from 'vuex';

export default {
  components: {
    DoughnutChart,
    LegendList
  },
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        }
      },
      legendItems: []
    };
  },
  computed: {
    ...mapGetters('charts', [
      'getTypeDeviceCounts'
    ])
  },
  watch:{
    getTypeDeviceCounts: {
      async handler(){
        await this.prepareChartData()
      }
    }
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
        color: backgroundColors[index]
      }));

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Modo de acesso ao CMR',
            backgroundColor: backgroundColors,
            data: data
          }
        ]
      };
    }
  }
};
</script>
<style lang="sass" scoped>
  .col-8
    height: 400px !important
</style>
