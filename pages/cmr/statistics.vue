<template>
  <div>
    <v-container
      fluid
      class="pa-0 overflow-hidden"
    >
      <div class="tab-header justify-space-between">
        <div class="d-flex align-center">
          <h4 class="subtitle-2 text-uppercase font-weight-regular">
            {{ $t('analytics-tab') }}
          </h4>
        </div>
      </div>
      <v-row class="pa-4">
        <v-col
          v-for="(analytic, index) in analytics"
          :key="index"
          cols="12"
          md="6"
          class="pa-3"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-tooltip
              bottom
              max-width="400"
              color="grey darken-4"
            >
              <template #activator="{ on }">
                <v-card
                  class="rounded-lg overflow-hidden"
                  width="158"
                  height="140"
                  :elevation="isHovering ? 8 : 2"
                  v-bind="props"
                  v-on="on"
                  @click="openModal(analytic)"
                >
                  <v-img
                    class="fill-height position-relative"
                    cover
                    height="100%"
                    :src="`data:image/png;base64,${analytic.image}`"
                  >
                    <div
                      class="overlay-title"
                      style="background: rgba(0, 0, 0, 0.5);"
                    >
                      <p class="ma-0 text-body-2 font-weight-medium text-truncate white--text">
                        {{ analytic.name }}
                      </p>
                    </div>
                  </v-img>
                </v-card>
              </template>
              <span> {{ analytic.name }} </span>
              <v-divider :dark="true" />
              <span> {{ analytic.tooltip }} </span>
            </v-tooltip>
          </v-hover>
        </v-col>
      </v-row>
      <v-row
        v-if="isLoading"
        justify="center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </v-row>
    </v-container>

    <v-dialog
      v-model="isModalOpen"
      max-width="100%"
      fullscreen
      hide-overlay
      @click:outside="closeModal"
    >
      <v-card>
        <v-card-title
          class="d-flex justify-space-between align-center"
        >
          <span>{{ $t('analytics-tab') }}</span>
          <v-btn
            icon
            @click="closeModal"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="ma-0 pa-0">
          <iframe
            :src="selectedAnalytic ? selectedAnalytic.url : ''"
            style="width: 100%; height: calc(100vh - 58px);"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<i18n>
{
    "en": {
        "analytics-tab": "Statistics",
        "no-url": "No URL available for this analytic.",
        "failed-to-load-analytics": "Failed to load analytics data."
    },
    "pt-br": {
        "analytics-tab": "Estatísticas",
        "no-url": "Nenhuma URL disponível para esta análise.",
        "failed-to-load-analytics": "Falha ao carregar os dados de análise."
    }
}
</i18n>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'PageAnalytics',
  layout: 'analytics',
  data() {
    return {
      isModalOpen: false,
      selectedAnalytic: null,
    };
  },
  computed: {
    ...mapState('statistics', ['data', 'isLoading']),
    analytics() {
      return this.data || [];
    },
  },
  mounted() {
    this.getAnalytics(this.$t('failed-to-load-analytics'));
  },
  methods: {
    ...mapActions('statistics', ['getAnalytics']),
    openModal(analytic) {
      this.selectedAnalytic = analytic;
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.selectedAnalytic = null;
    },
    navigateHome() {
      this.closeModal();
    },
  },
};
</script>

<style scoped>

.overlay-title {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
}
</style>
