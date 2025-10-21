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
              {{ noDataMessage }}
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
    dataType: {
      type: String,
      default: 'devices',
    },
    datasetLabel: {
      type: String,
      default: 'Modo de acesso ao CMR',
    },
    noDataMessage: {
      type: String,
      default: 'Dados não disponíveis',
    },
    colors: {
      type: Array,
      default: () => ['#D92B3F', '#F58A1F', '#FFCE03', '#A5D85E', '#36A2EB', '#9966FF'],
    },
  },
  data() {
    return {
      chartData: null,
      chartKey: 0,
      loading: false,
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
      'getBrowserCounts',
      'getInstitutionCrCounts',
    ]),
    activeData() {
      let data;
      let label;

      switch (this.dataType) {
        case 'devices':
          data = this.getTypeDeviceCounts;
          label = 'Modo de acesso ao CMR';
          break;
        case 'browsers':
          data = this.getBrowserCounts;
          label = 'Navegadores utilizados';
          break;
        case 'institutions':
          data = this.getInstitutionCrCounts;
          label = 'Instituições CR';
          break;
        default:
          data = null;
          label = this.datasetLabel;
      }
      return { data, label };
    },
  },
  watch: {
    getTypeDeviceCounts: {
      async handler() {
        if (this.dataType === 'devices') {
          this.loading = true;
          await this.prepareChartData();
          this.loading = false;
        }
      },
      deep: true,
      immediate: true,
    },
    getBrowserCounts: {
      async handler() {
        if (this.dataType === 'browsers') {
          this.loading = true;
          await this.prepareChartData();
          this.loading = false;
        }
      },
      deep: true,
      immediate: true,
    },
    getInstitutionCrCounts: {
      async handler() {
        if (this.dataType === 'institutions') {
          this.loading = true;
          await this.prepareChartData();
          this.loading = false;
        }
      },
      deep: true,
      immediate: true,
    },
    dataType: {
      async handler() {
        this.loading = true;
        await this.prepareChartData();
        this.loading = false;
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
        const { data: rawCounts, label: chartLabel } = this.activeData;

        if (!rawCounts || typeof rawCounts !== 'object') {
          this.setEmptyState();
          return;
        }

        const keys = Object.keys(rawCounts);
        const values = Object.values(rawCounts);

        if (keys.length === 0) {
          this.setEmptyState();
          return;
        }

        const numericValues = values.map(val => Number(val));
        const labels = keys;
        const data = numericValues;
        const backgroundColors = this.colors;

        const total = data.reduce((sum, value) => sum + value, 0);

        this.legendItems = labels.map((label, index) => ({
          label,
          count: total ? Math.round((data[index] / total) * 100) : 0,
          color: backgroundColors[index % backgroundColors.length],
          value: data[index],
        }));

        this.chartData = {
          labels,
          datasets: [{
            label: chartLabel || this.datasetLabel,
            backgroundColor: backgroundColors,
            data,
            borderWidth: 0,
            hoverOffset: 10,
          }],
        };

        this.chartKey += 1;
      } catch (error) {
        this.setEmptyState();
      }
    },
    setEmptyState() {
      this.chartData = null;
      this.legendItems = [{
        label: this.noDataMessage,
        count: 0,
        color: '#e0e0e0',
        value: 0,
      }];
      this.chartKey += 1;
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

.loading-wrapper
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  height: 100%
  text-align: center

  p
    margin-top: 16px
    color: #666

.v-container
  text-align: center

.mt-2
  margin-top: 8px !important
</style>
