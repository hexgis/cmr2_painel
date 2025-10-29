<i18n>
  {
    "en": {
      "January": "January",
      "February": "February",
      "March": "March",
      "April": "April",
      "May": "May",
      "June": "June",
      "July": "July",
      "August": "August",
      "September": "September",
      "October": "October",
      "November": "November",
      "December": "December",
      "error": "Something got wrong. Please try it again."
    },
    "pt-br": {
      "January": "Janeiro",
      "February": "Fevereiro",
      "March": "Março",
      "April": "Abril",
      "May": "Maio",
      "June": "Junho",
      "July": "Julho",
      "August": "Agosto",
      "September": "Setembro",
      "October": "Outubro",
      "November": "Novembro",
      "December": "Dezembro",
      "error": "Algo deu errado. Por favor, tente novamente"
    }
  }
  </i18n>

<script>
import { Bar } from 'vue-chartjs';
import { mapGetters } from 'vuex';

export default {
  extends: Bar,
  data: () => ({
    monthlyCounts: [],
  }),
  computed: {
    ...mapGetters('charts', ['getTodayDate']),
  },
  async mounted() {
    let actualYear = new Date();
    actualYear = actualYear.getUTCFullYear();

    try {
      const response = await this.$api.$get(
        `/dashboard/?date_after=${actualYear - 1}-01-01&date_before=${this.getTodayDate}`,
      );
      this.monthlyCounts = response.monthly_counts;

      const monthLabels = [
        this.$t('January'), this.$t('February'), this.$t('March'), this.$t('April'), this.$t('May'),
        this.$t('June'), this.$t('July'), this.$t('August'), this.$t('September'), this.$t('October'),
        this.$t('November'), this.$t('December'),
      ];

      const labels = this.monthlyCounts.map(
        (item) => `${monthLabels[item.month - 1]} ${item.year}`,
      );
      const data = this.monthlyCounts.map((item) => item.count);

      const chartData = {
        labels,
        datasets: [
          {
            label: 'Quantidade de Acessos por mês',
            backgroundColor: '#F58A1F',
            data,
          },
        ],
      };
      this.renderChart(chartData, { responsive: true, maintainAspectRatio: false });
    } catch (error) {
      this.$store.commit('alert/addAlert', {
        message: this.$t('error'),
      });
      console.error('Failed to fetch data:', error);
    }
  },
};
</script>
