<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import { Doughnut } from 'vue-chartjs';

export default {
  name: 'DoughnutChart',
  extends: Doughnut,
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Object,
      default: () => ({ responsive: true, maintainAspectRatio: false })
    }
  },
  mounted() {
    this.renderChart(this.chartData, this.chartOptions);
  }
};
</script>
