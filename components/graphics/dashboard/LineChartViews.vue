<script>
import { Line } from 'vue-chartjs';
import { mapGetters, mapActions } from 'vuex';

export default {
  extends: Line,
  props: {
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
  },
  computed: {
    ...mapGetters('charts', [
      'getDataChart',
      'getTodayDate',
      'getDates',
      'getDateCounts',
      'getTypeDeviceCounts',
      'getBrowserCounts',
    ]),
  },
  methods: {
    ...mapActions('charts', ['dataChart']),
    updateChart() {
      const chartData = this.getDates.map((date) => this.getDateCounts[date]);
      this.renderChart(
        {
          labels: this.getDates,
          datasets: [
            {
              label: 'Quantidade de acessos por dia',
              data: chartData,
              backgroundColor: 'transparent',
              borderColor: '#D92B3F',
              pointBackgroundColor: '#FFCE03',
            },
          ],
        },
        {
          responsive: true,
          maintainAspectRatio: false,
        },
      );
    },
  },
  watch: {
    getDates: 'updateChart',
    getDateCounts: 'updateChart',
  },
  mounted() {
    this.dataChart({
      startDate: this.startDate || '',
      endDate: this.endDate || this.getTodayDate,
      location: '',
      typeDevice: '',
      browser: '',
    }).then(() => {
      this.updateChart();
    });
  },
};
</script>
