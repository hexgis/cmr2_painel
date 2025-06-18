<template>
  <v-container class="pa-0">
    <div
      v-if="tab === 'tab-1'"
      class="tab-header justify-space-between"
    >
      <div class="d-flex align-center">
        <h4
          class="subtitle-2 text-uppercase font-weight-regular"
        >
          {{ $t('title-monitoring') }}
        </h4>

        <v-tooltip
          bottom
          max-width="400"
          color="grey darken-4"
        >
          <template #activator="{ on }">
            <v-icon
              class="ml-2"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            {{ $t('monitoring-info-part1') }}
            <br>
            {{ $t('monitoring-info-part2') }}
            <br>
            {{ $t('monitoring-info-part3') }}
            <br>
            {{ $t('monitoring-info-part4') }}
          </span>
        </v-tooltip>
      </div>
    </div>
    <div
      v-else-if="tab === 'tab-2'"
      class="tab-header align-center"
    >
      <h4
        class="subtitle-2 text-uppercase font-weight-regular"
      >
        {{ $t('title-alerts') }}
      </h4>
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-icon
            class="ml-2"
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
    </div>

    <v-tabs
      v-model="tab"
      background-color="#D42A3E"
      centered
      dark
      icons-and-text
    >
      <v-tabs-slider />
      <v-tab href="#tab-1">
        Monitoramento<br>
        Diário
        <v-icon>mdi-map-search</v-icon>
      </v-tab>

      <v-tab href="#tab-2">
        Alerta <br>
        Urgente
        <v-icon>mdi-alarm-light</v-icon>
      </v-tab>
    </v-tabs>

    <div>
      <v-tabs-items v-model="tab">
        <v-tab-item value="tab-1">
          <MonitoringFilters />
        </v-tab-item>
        <v-tab-item value="tab-2">
          <Alerts />
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>

<i18n>
{
  "en": {
    "title-monitoring": "Daily Monitoring",
    "title-alerts": "Urgent Alerts",
    "monitoring-info-part1": "Monitoring is based on visual interpretation",
    "monitoring-info-part2": "of Landsat-8 with a 32-day interval.",
    "monitoring-info-part3": "Monitoring detections are available",
    "monitoring-info-part4": "from August 30, 2015 (variable by orbit-point).",
    "update-info": "Frequently updated by the CMR cartography team.",
    "data-source": "Data source: Database - FUNAI",
    "legend": "Legend:",
    "monitoring-categories": {
      "recovery-deforestation": "Regenerating Deforestation",
      "forest-fire": "Forest Fire",
      "degradation": "Degradation",
      "clear-cutting": "Clear-Cutting"
    }
  },
  "pt-br": {
    "title-monitoring": "Monitoramento Diário",
    "title-alerts": "Alerta urgente",
    "monitoring-info-part1": "O Monitoramento é baseado na interpretação",
    "monitoring-info-part2": "visual do Landsat-8 com intervalo de 32 dias.",
    "monitoring-info-part3": "As detecções do monitoramento são contempladas",
    "monitoring-info-part4": "a partir de 30 de agosto de 2015 (variável por órbita-ponto).",
    "update-info": "Atualizado frequentemente pela equipe de cartografia do CMR.",
    "data-source": "Fonte de dados: Banco de dados - FUNAI",
    "legend": "Legenda:",
    "monitoring-categories": {
      "recovery-deforestation": "Desmatamento em Regeneração",
      "forest-fire": "Fogo em Floresta",
      "degradation": "Degradação",
      "clear-cutting": "Corte Raso"
    }
  }
}
</i18n>

<script>
import Alerts from '~/components/monitoring/Alerts.vue';
import MonitoringFilters from '@/components/monitoring/MonitoringFilters.vue';

export default {
  components: {
    Alerts,
    MonitoringFilters,
  },

  data() {
    return {
      tab: 'tab-1',
      dialog: false,
    };
  },
};
</script>
