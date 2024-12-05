<template>
  <v-dialog
    v-model="isModalOpen"
    max-width="100%"
    @click:outside="navigateHome"
  >
    <v-card>
      <v-card-title
        class="headline d-flex justify-space-between align-center"
      >
        <span>{{ $t('analytics-tab') }}</span>
        <v-btn
          icon
          @click="navigateHome"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <iframe
          :src="getUrl"
          class="container-iframe"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
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
      isModalOpen: false,
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

      this.$router.push('/');
    },
    checkModal() {
      if (this.$route.path === '/statistics') {
        this.openModal();
      }
    },
  },
};
</script>

<style scoped>
.container-iframe {
    display: inline-block;
    width: 90vw;
    height: 90vh;
    border: 0;
}
</style>
