<script>
import { Line } from 'vue-chartjs';
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  extends: Line,
  computed: {
    ...mapGetters('charts', ['getDataChart', 'getDates', 'getDateCounts', 'getTypeDeviceCounts', 'getBrowserCounts']),
  },
  methods: {
    ...mapActions('charts', ['dataChart']),
  },
  mounted() {
    this.dataChart({
      startDate: '',
      endDate: '',
      location: '',
      typeDevice: '',
      browser: ''
    }).then(() => {
      console.log(this.getDataChart, "GET")
      console.log(this.getDates, "Unique Dates")
      console.log(this.getDateCounts, "Date Counts")
      console.log(this.getTypeDeviceCounts, "Type Device Counts");
      console.log(this.getBrowserCounts, "Browser Counts");

      const chartData = this.getDates.map(date => this.getDateCounts[date]);
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
          title: {
            display: true,
            text: 'Acessos ao CMR',
          },
        },
      );
    });
  },
};
</script>
