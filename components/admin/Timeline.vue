<template>
  <v-container>
    <v-card
      v-if="ticket?.ticket_analysis_history?.length"
      class="pa-4"
      flat
    >
      <v-card-title>
        <h3>{{ $t('analysisHistory') }}</h3>
      </v-card-title>
      <v-card-subtitle>
        {{ $t('requester') }}: <strong>{{ ticket.requesting }}</strong>
      </v-card-subtitle>
      <v-divider />
      <v-timeline align-top>
        <v-timeline-item
          v-for="(history, index) in ticket.ticket_analysis_history"
          :key="history.id"
          :color="getTimelineItemColor(history.sub_status_name)"
          :icon="index === ticket.ticket_analysis_history.length - 1 ? 'mdi-flag-checkered' : ''"
        >
          <div v-if="history.sub_status_name">
            <h4 class="text-uppercase">
              {{ history.sub_status_name || $t('noStatusDefined') }}
            </h4>
            <v-divider />
          </div>
          <div v-if="history.comment">
            {{ history.comment }}
          </div>
          <div class="text-lightgray">
            <strong>{{ $t('user') }} {{ history.author }}</strong> {{ $t('on') }} {{ history.analyzed_update_formatted }}
          </div>
          <div
            v-if="history.status_history_attachments.length"
            class="text-lightgray"
          >
            <strong>{{ $t('attachments') }}:</strong>
            <a
              v-for="attachments in history.status_history_attachments"
              :key="attachments.id"
              :href="`http://localhost:8080/adm-panel/tickets/download` + attachments.file_path"
              target="_blank"
            >
              {{ attachments.name_file }}
            </a>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card>
    <p v-else>
      {{ $t('noRecords') }}
    </p>
  </v-container>
</template>
<i18n>
  {
    "en": {
      "analysisHistory": "Analysis History",
      "requester": "Requester",
      "noStatusDefined": "No status defined",
      "user": "User",
      "on": "on",
      "attachments": "Attachments",
      "noRecords": "No update records"
    },
    "pt-br": {
      "analysisHistory": "Histórico de Análises",
      "requester": "Solicitante",
      "noStatusDefined": "Sem status definido",
      "user": "Usuário",
      "on": "em",
      "attachments": "Anexos",
      "noRecords": "Não há registros de Atualizações"
    }
  }
</i18n>
<script>
export default {
  name: 'TicketTimeline',
  props: {
    ticket: {
      type: [Object, Array],
      required: true,
    },
  },
  methods: {
    getTimelineItemColor(status) {
      switch (status) {
        case 'Em Desenvolvimento':
          return '#F58A1F';
        case 'Concluído':
          return '#12A844';
        case 'Em Teste':
          return '#FFCE03';
        case 'Aguardando Gestor':
          return '#FFCE03';
        case 'Inviável':
          return '#D92B3F';
        case 'Indeferido':
          return '#D92B3F';
        default:
          return 'grey';
      }
    },
  },
};
</script>

<style scoped>
.v-timeline {
  max-width: 600px;
  margin: auto;
}
.v-timeline-item-opposite {
  flex-basis: 25%;
}
.text-lightgray{
  color: #9A9997;
  font-size: 14px;
}
</style>
