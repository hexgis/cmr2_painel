<template>
  <v-container
    fluid
    class="pa-0 overflow-hidden"
  >
    <div class="mb-4 tab-header">
      <h4 class="subtitle-2 text-uppercase font-weight-regular">
        {{ $t('analytics-tab') }}
      </h4>
    </div>
    <v-row class="pa-4">
      <v-col
        v-for="(analytic, index) in cards"
        :key="index"
        cols="12"
        md="6"
        class="pa-3"
      >
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            class="card-analytic"
            :elevation="isHovering ? 8 : 2"
            v-bind="props"
            @click="openMenu(analytic)"
          >
            <v-img
              class="img-analytic"
              cover
              height="100%"
              :src="`data:image/png;base64,${analytic.image}`"
            >
              <div class="overlay-title">
                <p class="ma-0 px-2 text-white text-body-2 font-weight-medium text-truncate">
                  {{ analytic.name }}
                </p>
              </div>
            </v-img>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
  </v-container>
</template>

<i18n>
{
    "en": {
        "analytics-tab": "Statistics"
    },
    "pt-br": {
        "analytics-tab": "Estatísticas"
    }
}
</i18n>

<script>
export default {
  name: 'PageAnalytics',
  layout: 'analytics',
  data() {
    return {
      cards: [
        {
          name: 'Sales Analytics',
          image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // placeholder base64 image
          url: `${process.env.URL_POWER_BI}/analytics/sales`,
        },
        {
          name: 'Performance Metrics',
          image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // placeholder base64 image
          url: `${process.env.URL_POWER_BI}/analytics/performance`,
        },
        {
          name: 'Revenue Reports',
          image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // placeholder base64 image
          url: `${process.env.URL_POWER_BI}/analytics/revenue`,
        },
        {
          name: 'Customer Insights',
          image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // placeholder base64 image
          url: `${process.env.URL_POWER_BI}/analytics/customers`,
        },
      ],
    };
  },
  computed: {
    getUrl() {
      return process.env.URL_POWER_BI;
    },
  },
  watch: {
    $route(to, from) {
      this.checkModal();
    },
  },
  mounted() {
    this.checkModal();
  },
  methods: {
    openModal() {
      this.isModalOpen = true;
    },
    navigateHome() {
      this.isModalOpen = false;

      this.$router.push('/cmr');
    },
    checkModal() {
      if (this.$route.path === '/cmr/statistics') {
        this.openModal();
      }
    },
  },
};
</script>

<style scoped>
.container-iframe {
  display: inline-block;
  width: 100%;
  height: calc(100vh - 48px);
  border: 0;
}

.card-analytic {
  width: 158px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
}

.img-analytic {
  height: 100%;
  position: relative;
}

.overlay-title {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
}
</style>
