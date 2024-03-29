<template>
  <v-col
    v-if="data.datasets.length"
    :cols="cols"
  >
    <v-card class="elevation-5 chart-card">
      <v-card-title> {{ name }}</v-card-title>
      <client-only>
        <LineChart
          :data="generateData()"
          :options="chartOptions"
        />
      </client-only>
    </v-card>
  </v-col>
</template>

<i18n>
{
    "en": {
        "date-axis-format": "MMM D"
    },
    "pt-br": {
        "date-axis-format": "DD/MM"
    }
}
</i18n>

<script>
import { mapState } from 'vuex';
import moment from 'moment';

function getTooltipDate(date) {
  return moment(date, 'MMM D, YYYY, HH:mm:ss').format('LL');
}

export default {
  name: 'AnalyticsChartTime',

  props: {
    name: {
      type: String,
      default: '',
    },
    data: {
      type: Object,
      default: () => {},
    },
    xAxis: {
      type: String,
      default: 'type',
    },
    yAxis: {
      type: String,
      default: 'time',
    },
    valueIdentifier: {
      type: String,
      default: 'area_km',
    },
    cols: {
      type: Number,
      default: 6,
    },
  },

  computed: {
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
          mode: 'x',
          callbacks: {
            title(tooltip) {
              return getTooltipDate(tooltip[0].xLabel);
            },
            label(tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label
                                || '';

              if (label) {
                label += ': ';
              }
              label += `${tooltipItem.yLabel.toFixed(2)} km²`;
              return label;
            },
          },
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'day',
                displayFormats: {
                  day: this.$t('date-axis-format'),
                },
              },
              ticks: {
                padding: 1,
              },
              offset: true,
            },
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        legend: {
          position: 'bottom',
        },
        elements: {
          point: {
            radius: 1,
          },
        },
      };
    },

    ...mapState('analytics', ['colors']),
  },

  methods: {
    generateData() {
      return {
        datasets: this.data.datasets,
      };
    },
  },
};
</script>
