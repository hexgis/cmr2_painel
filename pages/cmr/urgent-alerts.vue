<template>
  <v-container class="overflow-auto container-height">
    <div class="tab-header">
      <v-row>
        <h4 class="subtitle-2 text-uppercase font-weight-regular">
          {{ $t('title') }}
        </h4>
        <v-tooltip
          bottom
          max-width="400"
          color="grey darken-4"
        >
          <template #activator="{ on }">
            <v-icon
              class="mr-2 ml-2"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            {{ $t('update-info') }}
            <br>
            {{ $t('data-source') }}
          </span>
        </v-tooltip>
      </v-row>
      <v-switch
        v-if="features"
        v-model="showFeaturesAlert"
        class="mt-n1 ml-5"
        hide-details
      />
    </div>

    <AlertFilter @onSearch="search()" />
    <ShowDialog />
    <div
      v-if="showFeaturesUrgentAlerts && !isLoadingFeatures"
      class="mx-4"
    >
      <v-divider class="mt-1" />
      <p class="font-weight-regular pt-2 grey--text text--darken-2">
        {{ $t('legend') }}:
      </p>
      <v-col class="grey--text text--darken-2">
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#990099"
          >
            mdi-square
          </v-icon>
          {{ $t('regeneration-deforestation') }}
        </v-row>
        <!-- <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#b35900"
          >
            mdi-square
          </v-icon>
          Fogo em Floresta
        </v-row> -->
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#ff8000"
          >
            mdi-square
          </v-icon>
          {{ $t('degradation') }}
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#ff3333"
          >
            mdi-square
          </v-icon>
          {{ $t('clear-cut') }}
        </v-row>
        <v-spacer />
      </v-col>
    </div>
  </v-container>
</template>

<i18n>
    {
        "en": {
            "title": "Urgent Alerts",
            "analytics-label": "Analytics",
            "map-label": "Map",
            "table-name": "Table Urgent Alerts",
            "update-info": "Frequently updated by the CMR cartography team.",
            "data-source": "Data source: Database - FUNAI",
            "legend": "Legend",
            "regeneration-deforestation": "Regeneration Deforestation",
            "degradation": "Degradation",
            "clear-cut": "Clear Cut"
        },
        "pt-br": {
            "title": "Alerta Urgente",
            "analytics-label": "Analítico",
            "map-label": "Mapa",
            "table-name": "Tabela de Alerta Urgente",
            "update-info": "Atualizado frequentemente pela equipe de cartografia do CMR.",
            "data-source": "Fonte de dados: Banco de dados - FUNAI",
            "legend": "Legenda",
            "regeneration-deforestation": "Desmatamento em Regeneração",
            "degradation": "Degradação",
            "clear-cut": "Corte Raso"
        }
    }
</i18n>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import AlertFilter from '@/components/monitoring/AlertFilter.vue';
import ShowDialog from '@/components/show-dialog/ShowDialog';

export default {
  components: { AlertFilter, ShowDialog },

  data() {
    return {
      tab: null,
      items: ['MapStage', 'AnalytcalStage'],
      text: 'Texto de teste.',
      timer: '',
      checkNewFilters: false,
    };
  },
  computed: {
    hasFeatures() {
      return (
        !!this.features
                && !!this.features.features
                && this.features.features.length > 0
      );
    },

    showFeaturesAlert: {
      get() {
        return this.$store.state['urgent-alerts']
          .showFeaturesUrgentAlerts;
      },

      set(value) {
        this.$store.commit(
          'urgent-alerts/setshowFeaturesUrgentAlerts',
          value,
        );
      },
    },

    ...mapState('urgent-alerts', [
      'showFeaturesUrgentAlerts',
      'features',
      'table',
      'tableDialogAlert',
      'isLoadingFeatures',
    ]),
  },

  methods: {
    search() {
      if (this.tableDialogAlert) {
        this.checkNewFilters = true;
        this.getDataTable();
      }
      if (!this.tableDialogAlert) this.getFeaturesUrgentAlerts();
    },

    ...mapActions('urgent-alerts', [
      'getFeaturesUrgentAlerts',
      'getDataTable',
    ]),
  },
};
</script>

<style scoped>
.container-height {
    max-height: 90vh;
}
</style>
