<template>
  <div v-if="!isLoadingData">
    <AnalyticsESChartRates
      :month="month"
      :year="year"
      :previous-month="previousMonth"
      :previous-year="previousYear"
    />
    <v-row>
      <AnalyticsESProgressiveChart
        :name="
          $t('daily-growth') +
            getMonthName(params.month) +
            ' ' +
            params.year
        "
        :data="daysOfMonthData()"
        x-axis="type"
        y-axis="date"
        value-identifier="area_km"
      />
      <AnalyticsESBarChart
        :name="$t('monthly-index')"
        :data="monthPerYearData()"
        x-axis="year"
        y-axis="month"
        value-identifier="area_km"
        :month-label="true"
      />
      <AnalyticsESStackedChart
        :name="$t('year-compare')"
        :data="yearDifferentialData()"
        x-axis="year"
        y-axis="month"
        value-identifier="area_km"
        :month-label="true"
        graph-type="horizontal-bar"
      />
      <AnalyticsESStackedChart
        :name="$t('year-compare-monthly')"
        :data="monthDifferentialData()"
        x-axis="year"
        y-axis="month"
        value-identifier="area_km"
        :month-label="true"
        graph-type="horizontal-bar"
      />
      <AnalyticsESBarChart
        :name="$t('per-state-annual')"
        :data="statePerYearData()"
        x-axis="year"
        y-axis="month"
        value-identifier="area_km"
        :month-label="true"
      />
      <AnalyticsESBarChart
        :name="$t('system-per-state') + params.year"
        :data="systemPerStateYearData()"
        x-axis="year"
        y-axis="month"
        value-identifier="area_km"
        :month-label="true"
      />
      <AnalyticsESBarChart
        :name="
          $t('system-per-state') +
            getMonthName(params.month) +
            ' ' +
            params.year
        "
        :data="systemPerStateMonthYearData()"
        x-axis="year"
        y-axis="month"
        value-identifier="area_km"
        :month-label="true"
      />
      <AnalyticsESDoughnutChart
        :name="$t('state-compare') + params.year"
        :data="statePerYearPieData()"
        x-axis="state"
        value-identifier="area_km"
      />
      <AnalyticsESDoughnutChart
        :name="
          $t('state-compare') +
            getMonthName(params.month) +
            ' ' +
            params.year
        "
        :data="statePerMonthPieData()"
        x-axis="state"
        value-identifier="area_km"
      />
    </v-row>
  </div>
</template>

<i18n>
{
    "en": {
        "daily-growth": "Daily growth rate - ",
        "monthly-index": "Monthly rate per year",
        "year-compare": "Previous year comparison - Annual",
        "year-compare-monthly": "Previous year comparison - Monthly",
        "per-state-annual": "Rate per state - Yearly",
        "system-per-state": "System rate per state - ",
        "state-compare": "State comparison - ",
        "annual-value": "Total annual value",
        "monthly-value": "Total monthly value",
        "diff": "Difference",
        "lang-type": "en-US"
    },
    "pt-br": {
        "daily-growth": "Taxa de crescimento diário - ",
        "monthly-index": "Índice mensal por ano",
        "year-compare": "Comparativo com o ano anterior - Anual",
        "year-compare-monthly": "Comparativo com o Ano anterior - Mensal",
        "per-state-annual": "Índice por estado - Anual",
        "system-per-state": "Índice de sistema por estado - ",
        "state-compare": "Comparativo de estados - ",
        "annual-value": "Valor total do ano",
        "monthly-value": "Valor total do mês",
        "diff": "Diferença",
        "lang-type": "pt-BR"
    }
}
</i18n>

<script>
import { mapState } from 'vuex';

import AnalyticsESChartRates from '@/components/analytics/es-charts/AnalyticsESChartRates';
import AnalyticsESBarChart from '@/components/analytics/es-charts/AnalyticsESBarChart';
import AnalyticsESStackedChart from '@/components/analytics/es-charts/AnalyticsESStackedChart';
import AnalyticsESDoughnutChart from '@/components/analytics/es-charts/AnalyticsESDoughnutChart';
import AnalyticsESProgressiveChart from '@/components/analytics/es-charts/AnalyticsESProgressiveChart';

export default {
  name: 'AnalyticsChart',

  components: {
    AnalyticsESChartRates,
    AnalyticsESBarChart,
    AnalyticsESStackedChart,
    AnalyticsESDoughnutChart,
    AnalyticsESProgressiveChart,
  },

  computed: {
    ...mapState('analytics', [
      'dataMonth',
      'dataYear',
      'dataPreviousMonth',
      'dataPreviousYear',
      'esBuckets',
      'colors',
      'isLoadingData',
      'params',
    ]),
    getMonthList() {
      return this.$moment
        .monthsShort()
        .map((m) => m.charAt(0).toUpperCase() + m.slice(1));
    },
    month() {
      return parseFloat(
        (
          this.esBuckets.rates[
            `${this.params.year}-${this.params.month}`
          ] || 0
        ).toFixed(2),
      );
    },
    previousMonth() {
      return parseFloat(
        (
          this.esBuckets.rates[
            `${this.params.year}-${(
              parseInt(this.params.month) - 1
            ).toLocaleString(this.$t('lang-type'), {
              minimumIntegerDigits: 2,
            })}`
          ] || 0
        ).toFixed(2),
      );
    },
    year() {
      return parseFloat(
        (this.esBuckets.rates[this.params.year] || 0).toFixed(2),
      );
    },

    previousYear() {
      return parseFloat(
        (this.esBuckets.rates[this.params.year - 1] || 0).toFixed(2),
      );
    },
  },

  methods: {
    getMonthName(month) {
      const m = this.$moment(month, 'MM').format('MMMM');
      return m.charAt(0).toUpperCase() + m.slice(1);
    },
    accumulateDays(data) {
      let previous = 0;
      const days = Object.keys(data);

      const accumulated = [];

      days.forEach((day) => {
        accumulated.push({
          x: this.$moment(day),
          y: data[day] + previous,
        });

        previous += data[day];
      });

      const month = this.$moment(
        `${this.params.year}-${this.params.month}`,
      );

      if (accumulated.at(-1).x.date() !== month.endOf('month')) {
        accumulated.push({
          x: month.endOf('month'),
          y: accumulated.at(-1).y,
        });
      }

      return accumulated;
    },
    daysOfMonthData() {
      const graphData = this.esBuckets.graph1;

      const datasets = [];

      Object.keys(graphData).forEach((system) => {
        datasets.push({
          label: system,
          data: this.accumulateDays(graphData[system]),
          fill: true,
          lineTension: 0,
          backgroundColor: `${this.colors.type[system]}43`,
          borderColor: this.colors.type[system],
          borderWidth: 2,
          pointHitRadius: 6,
        });
      });

      return {
        datasets,
      };
    },

    monthPerYearData() {
      const labels = this.getMonthList;

      const datasets = [];

      Object.keys(this.esBuckets.graph2).forEach((label) => {
        const yearObject = this.esBuckets.graph2[label];

        datasets.push({
          label,
          data: labels.map(
            (_, monthIndex) => yearObject[monthIndex + 1] || 0,
          ),
          lineTension: 0,
          backgroundColor: this.colors.year[label],
          borderColor: this.colors.year[label],
        });
      });

      return {
        labels,
        datasets,
      };
    },

    yearDifferentialData() {
      const [previousYear, year] = [
        parseInt(this.params.year) - 1,
        this.params.year,
      ];

      const previousData = this.esBuckets.graph3[previousYear] || 0;
      const yearData = this.esBuckets.graph3[year] || 0;

      const sameData = Math.min(previousData, yearData);
      const difData = previousData - yearData;

      const datasets = [
        {
          label: this.$t('annual-value'),
          data: [sameData, sameData],
          lineTension: 0,
          backgroundColor: '#038cfc',
          borderColor: '#038cfc',
          values: [previousData, yearData],
        },
        {
          label: this.$t('diff'),
          data: difData >= 0 ? [difData, 0] : [0, difData * -1],
          lineTension: 0,
          backgroundColor: '#e00038',
          borderColor: '#e00038',
        },
      ];

      return {
        labels: [previousYear, year],
        datasets,
      };
    },

    monthDifferentialData() {
      const [previousYear, year] = [
        parseInt(this.params.year) - 1,
        this.params.year,
      ];
      const previousData = this.esBuckets.graph4[previousYear] || 0;
      const yearData = this.esBuckets.graph4[year] || 0;

      const sameData = Math.min(previousData, yearData);
      const difData = previousData - yearData;

      const datasets = [
        {
          label: this.$t('monthly-value'),
          data: [sameData, sameData],
          lineTension: 0,
          backgroundColor: '#038cfc',
          borderColor: '#038cfc',
          values: [previousData, yearData],
        },
        {
          label: this.$t('diff'),
          data: difData >= 0 ? [difData, 0] : [0, difData * -1],
          lineTension: 0,
          backgroundColor: '#e00038',
          borderColor: '#e00038',
        },
      ];

      const shortMonth = this.getMonthList[this.params.month - 1];

      return {
        labels: [
          `${shortMonth} ${previousYear}`,
          `${shortMonth} ${year}`,
        ],
        datasets,
      };
    },
    statePerYearData() {
      const graphData = this.esBuckets.graph5;
      let labels = [];

      //  get returned states with value
      Object.keys(graphData).forEach(
        (year) => (labels = [...labels, ...Object.keys(graphData[year])]),
      );
      labels = [...new Set(labels)].sort();

      const datasets = [];

      Object.keys(graphData).forEach((year) => {
        datasets.push({
          label: year,
          data: labels.map((state) => graphData[year][state] || 0),
          lineTension: 0,
          backgroundColor: this.colors.year[year],
          borderColor: this.colors.year[year],
        });
      });

      return {
        labels,
        datasets,
      };
    },
    systemPerStateYearData() {
      const graphData = this.esBuckets.graph6;
      let labels = [];

      Object.keys(graphData).forEach(
        (system) => (labels = [...labels, ...Object.keys(graphData[system])]),
      );
      labels = [...new Set(labels)].sort();

      const datasets = [];

      Object.keys(graphData).forEach((system) => {
        datasets.push({
          label: system,
          data: labels.map((state) => graphData[system][state] || 0),
          lineTension: 0,
          backgroundColor: this.colors.type[system],
          borderColor: this.colors.type[system],
        });
      });

      return {
        labels,
        datasets,
      };
    },
    systemPerStateMonthYearData() {
      const graphData = this.esBuckets.graph7;
      let labels = [];

      //  get returned states with value
      Object.keys(graphData).forEach(
        (year) => (labels = [...labels, ...Object.keys(graphData[year])]),
      );
      labels = [...new Set(labels)].sort();

      const datasets = [];

      Object.keys(graphData).forEach((system) => {
        datasets.push({
          label: system,
          data: labels.map((state) => graphData[system][state] || 0),
          lineTension: 0,
          backgroundColor: this.colors.type.CMR,
          borderColor: this.colors.type.CMR,
        });
      });

      return {
        labels,
        datasets,
      };
    },
    statePerYearPieData() {
      const data = this.systemPerStateYearData();

      return {
        labels: data.labels,
        datasets: data.datasets.map((d) => ({
          ...d,
          backgroundColor: data.labels.map(
            (state) => this.colors.state[state],
          ),
          borderColor: data.labels.map(
            (state) => this.colors.state[state],
          ),
        })),
        insideLabel: `${this.year} km²`,
      };
    },
    statePerMonthPieData() {
      const data = this.systemPerStateMonthYearData();

      return {
        labels: data.labels,
        datasets: data.datasets.map((d) => ({
          ...d,
          backgroundColor: data.labels.map(
            (state) => this.colors.state[state],
          ),
          borderColor: data.labels.map(
            (state) => this.colors.state[state],
          ),
        })),
        insideLabel: `${this.month} km²`,
      };
    },
  },
};
</script>

<style lang="sass">
.chart-card
    padding: 10px
</style>
