<script>
import { Line } from 'vue-chartjs';

export default {
  extends: Line,
  mounted() {
    this.renderChart(
      {
        labels: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
        ],
        datasets: [
          {
            label: 'Polígonos',
            data: [2, 10, 5, 9, 0, 6, 20],
            backgroundColor: 'transparent',
            borderColor: 'rgba(1, 116, 188, 0.50)',
            pointBackgroundColor: 'rgba(171, 71, 188, 1)',
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: 'Polígonos de Prioridade Média',
        },
      },
    );
  },
};
</script>
