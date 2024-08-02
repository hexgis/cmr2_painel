<script>
import { Pie } from 'vue-chartjs';
import { mapGetters  } from 'vuex';


export default {
  extends: Pie,
  computed: {
    ...mapGetters('charts', ['getDataChart', 'getDates', 'getDateCounts', 'getTypeDeviceCounts', 'getBrowserCounts']),
  },
  mounted() {
    const labels = Object.keys(this.getBrowserCounts);
    const data = Object.values(this.getBrowserCounts);

    this.renderChart(
      {
        labels: labels,
        datasets: [
          {
            backgroundColor: [
              '#D92B3F',
              '#C5C3C6 ',
              '#FFCE03',
              '#91AEC1  ',
              '#F58A1F ',
              '#1985A1  ',
            ],
            data: data,
          },
        ],
      },
      { responsive: true, maintainAspectRatio: false },
    );
  },
};
</script>
