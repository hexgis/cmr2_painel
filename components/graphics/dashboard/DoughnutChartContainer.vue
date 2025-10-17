<template>
  <v-container class="pa-2 text-center">
    <v-row class="justify-center">
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <div class="chart-wrapper position-relative">
          <doughnut-chart
            v-if="chartData"
            :key="chartKey"
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
  name: 'DoughnutChartContainer',
  components: {
    DoughnutChart,
    LegendList,
  },
  props: {
    customData: {
      type: Object,
      default: null,
    },
    dataType: {
      type: String,
      default: 'devices',
    },
    chartLabel: {
      type: String,
      default: 'Modo de acesso ao CMR',
    },
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
    activeData() {
      if (this.dataType === 'funai' && this.customData) {
        return {
          data: this.customData,
          label: 'Acessos por CR - FUNAI',
          colors: ['#D92B3F', '#F58A1F', '#FFCE03', '#A5D85E', '#36A2EB', '#9966FF'],
        };
      }
      if (this.dataType === 'devices' && this.getTypeDeviceCounts) {
        return {
          data: this.getTypeDeviceCounts,
          label: this.chartLabel,
          colors: ['#D92B3F', '#F58A1F', '#FFCE03', '#A5D85E', '#36A2EB'],
        };
      }
      return null;
    },
  },
  watch: {
    activeData: {
      async handler(newData) {
        await this.prepareChartData(newData);
        this.chartKey += 1;
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async prepareChartData(dataConfig) {
      try {
        if (!dataConfig || !dataConfig.data || Object.keys(dataConfig.data).length === 0) {
          this.setEmptyState();
          return;
        }

        const { data, label, colors } = dataConfig;
        const labels = Object.keys(data);
        const values = Object.values(data).map(Number);

        this.prepareChart(labels, values, colors, label);
      } catch (error) {
        console.error('Erro ao preparar dados do gráfico:', error);
        this.setEmptyState();
      }
    },

    prepareChart(labels, data, backgroundColors, label) {
      // Calculate total and prepare legend items
      const total = data.reduce((sum, value) => sum + value, 0);
      this.legendItems = labels.map((itemLabel, index) => ({
        label: itemLabel,
        count: total ? Math.round((data[index] / total) * 100) : 0,
        color: backgroundColors[index % backgroundColors.length],
        value: data[index],
      }));

      // Prepare chart data
      this.chartData = {
        labels,
        datasets: [{
          label,
          backgroundColor: backgroundColors,
          data,
          borderWidth: 0,
          hoverOffset: 10,
        }],
      };
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
