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
            :key="chartKey"
            :chart-data="chartData"
            :chart-options="chartOptions"
          />
          <div
            v-else
            class="no-data-message"
          >
            <v-icon
              large
              color="grey lighten-1"
            >
              mdi-chart-donut
            </v-icon>
            <p class="grey--text text--lighten-1">
              Dados não disponíveis
            </p>
          </div>
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
      chartKey: 0,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
        legend: {
          display: false,
        },
        cutout: '60%',
        plugins: {
          tooltip: {
            callbacks: {
              label(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
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
        this.chartKey += 1;
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async prepareChartData() {
      try {
        const rawCounts = this.getTypeDeviceCounts;

        if (!rawCounts || Object.keys(rawCounts).length === 0) {
          this.setEmptyState();
          return;
        }

        const labels = Object.keys(rawCounts);
        const data = Object.values(rawCounts).map(Number);
        const backgroundColors = ['#D92B3F', '#F58A1F', '#FFCE03', '#A5D85E', '#36A2EB'];

        // Calculate total and prepare legend items
        const total = data.reduce((sum, value) => sum + value, 0);
        this.legendItems = labels.map((label, index) => ({
          label,
          count: total ? Math.round((data[index] / total) * 100) : 0,
          color: backgroundColors[index % backgroundColors.length],
          value: data[index],
        }));

        // Prepare chart data
        this.chartData = {
          labels,
          datasets: [{
            label: 'Modo de acesso ao CMR',
            backgroundColor: backgroundColors,
            data,
            borderWidth: 0,
            hoverOffset: 10,
          }],
        };
      } catch (error) {
        console.error('Erro ao preparar dados do gráfico:', error);
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
  position: relative

.no-data-message
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  text-align: center
  width: 100%

.v-container
  text-align: center

.mt-2
  margin-top: 8px !important
</style>
