<template>
  <v-container class="pa-0">
    <div
      v-if="tab === 'tab-1'"
      class="tab-header justify-space-between"
    >
      <v-row>
        <h6
          class="subtitle-2 text-uppercase font-weight-regular header-title"
        >
          {{ $t('title') }}
        </h6>

        <v-tooltip
          bottom
          max-width="600"
          color="grey darken-4"
        >
          <template #activator="{ on }">
            <v-icon
              class="infoIconMargin"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span class="mt-10">
            {{ $t('monitoring-info-part1') }}
            <br>
            {{ $t('monitoring-info-part2') }}
            <br>
            {{ $t('monitoring-info-part3') }}
            <br>
            {{ $t('monitoring-info-part4') }}
          </span>
        </v-tooltip>
      </v-row>
    </div>
    <div
      v-else-if="tab === 'tab-2'"
      class="tab-header justify-space-between"
    >
      <v-row>
        <h4
          class="subtitle-2 text-uppercase font-weight-regular header-title"
        >
          {{ $t('title-alerts') }}
        </h4>
        <v-tooltip
          bottom
          max-width="600px"
          color="grey darken-4"
        >
          <template #activator="{ on }">
            <v-icon
              class="infoIconMargin"
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
    </div>

    <v-tabs
      v-model="tab"
      background-color="#D42A3E"
      centered
      dark
      icons-and-text
    >
      <v-tabs-slider />
      <v-tab
        href="#tab-1"
        class="tab-item"
      >
        Monitoramento<br>
        Diário
        <v-icon>mdi-map-search</v-icon>
      </v-tab>

      <v-tab
        href="#tab-2"
        class="tab-item"
      >
        Alerta <br>
        Urgente
        <v-icon>mdi-alarm-light</v-icon>
      </v-tab>
    </v-tabs>

    <div class="list-container">
      <v-tabs-items v-model="tab">
        <v-tab-item value="tab-1">
          <MonitoringFilters />
        </v-tab-item>
        <v-tab-item value="tab-2">
          <AlertsFilters />
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>

<i18n>
{
  "en": {
    "title": "Daily Monitoring",
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
    "title": "Monitoramento Diário",
    "title-alerts": "Alertas Urgente",
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

import AlertsFilters from '~/components/monitoring-alerts/urgent-alerts/AlertsFilters.vue';
import MonitoringFilters from '@/components/monitoring-alerts/monitoring/MonitoringFilters.vue';

export default {
  name: 'MonitoringAlerts',

  components: {
    AlertsFilters,
    MonitoringFilters,
  },
  transition: 'scroll-y-transition',

  data() {
    return {
      tab: 'tab-1',
      dialog: false,
    };
  },
};
</script>

<style scoped>
.tab-item {
  flex: 1; /* Distribui o espaço igualmente */
  text-align: center;
  white-space: nowrap; /* Evita que o texto quebre */
  min-width: 100px; /* Define um tamanho mínimo */
  max-width: 150px; /* Limita o tamanho */
}
</style>
