<template>
  <v-container
    fluid
    class="container"
  >
    <v-tabs
      dark
      background-color="secondary"
    >
      <v-tab>
        <v-icon>mdi-chart-bar </v-icon>
      </v-tab>
      <v-tab>
        <v-icon>mdi-file-chart-outline </v-icon>
      </v-tab>

      <v-tab-item class="tab-content">
        <v-row>
          <v-col>
            <AnalyticsFilter />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <AnalyticsChart />
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item class="tab-content">
        <v-row>
          <v-col>
            <AnalyticsAgroFilter />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <AnalyticsCards />
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs>

    <v-snackbar
      v-model="analyticsError"
      :timeout="alertTimeout"
    >
      {{ $t('error') }}
    </v-snackbar>
  </v-container>
</template>

<i18n>
{
    "en": {
        "error": "An error has ocurred while retriving data."
    },
    "pt-br": {
        "error": "Ocorreu um erro ao resgatar os dados."
    }
}
</i18n>

<script>
import { mapActions } from 'vuex';

import AnalyticsFilter from '@/components/analytics/AnalyticsFilter';
import AnalyticsAgroFilter from '@/components/analytics/AnalyticsAgroFilter';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import AnalyticsCards from '@/components/analytics/AnalyticsCards';

export default {
  name: 'Analytics',

  components: {
    AnalyticsFilter,
    AnalyticsAgroFilter,
    AnalyticsChart,
    AnalyticsCards,
  },

  layout: 'analytics',

  data: () => ({
    alertTimeout: 5000,
  }),

  computed: {
    analyticsError: {
      get() {
        return this.$store.state.analytics.analyticsError;
      },
      set(status) {
        this.$store.commit('analytics/setAnalyticsError', status);
      },
    },
    ...mapActions('analytics', ['getData']),
  },

  beforeRouteEnter(to, from, next) {
    if (process.env.ANALYTICS !== 'true') {
      next('/');
    } else {
      next();
    }
  },

  beforeRouteLeave(to, from, next) {
    this.$store.commit('analytics/setMonthData', []);
    this.$store.commit('analytics/setYearData', []);
    this.$store.commit('analytics/setPreviousMonthData', []);
    this.$store.commit('analytics/setPreviousYearData', []);
    this.$store.commit('analytics/setParams', {});
    next();
  },
};
</script>

<style scoped>
.container {
    width: 90%;
}

.tab-content {
    padding: 20px;
}
</style>
