<script>
import { Doughnut } from 'vue-chartjs';
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  extends: Doughnut,
  computed: {
    ...mapGetters('charts', ['getDataChart', 'getDates', 'getDateCounts', 'getTypeDeviceCounts', 'getBrowserCounts']),
  },
  mounted() {
    const labels = Object.keys(this.getTypeDeviceCounts);
    const data = Object.values(this.getTypeDeviceCounts);

    this.renderChart(
      {
        labels: labels,
        datasets: [
          {
            label: 'Modo de acesso ao CMR',
            backgroundColor: ['#D92B3F', '#F58A1F', '#FFCE03'],
            data: data,
          },
        ],
      },
      { responsive: true, maintainAspectRatio: false },
    );
  },
};
</script>
