<template>
  <v-container>
    <v-card
      v-if="ticket && ticket.ticket_analysis_history && ticket.ticket_analysis_history.length"
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
          :color="getTimelineItemColor(history.status_category_display)"
          :icon="index === ticket.ticket_analysis_history.length - 1 ? 'mdi-flag-checkered' : ''"
        >
          <div v-if="history.status_category_display">
            <h4 class="text-uppercase">
              {{ history.status_category_display || $t('noStatusDefined') }}
            </h4>
            <v-divider />
          </div>
          <div v-if="history.comment">
            {{ history.comment }}
          </div>
          <div class="text-lightgray">
            <strong>{{ $t('user') }} {{ history.author }}</strong>
            {{ $t('on') }} {{ history.analyzed_update_formatted }}
          </div>
          <div
            v-if="history.status_history_attachments.length"
          >
            <v-divider class="my-2" />
            <div class="attachments-header mb-2">
              <v-icon
                small
                color="primary"
                class="mr-1"
              >
                mdi-paperclip
              </v-icon>
              <strong class="text-primary">
                {{ $t('attachments') }} ({{ history.status_history_attachments.length }})
              </strong>
            </div>
            <div class="attachments-grid">
              <v-card
                v-for="attachment in history.status_history_attachments"
                :key="attachment.id"
                outlined
                class="attachment-card ma-1 pa-2"
                hover
                @click="downloadAttachment(attachment)"
              >
                <div class="d-flex align-center">
                  <v-icon
                    :color="getFileIconColor(attachment.name_file)"
                    class="mr-2"
                  >
                    {{ getFileIcon(attachment.name_file) }}
                  </v-icon>
                  <div class="attachment-info flex-grow-1">
                    <div class="attachment-name text-body-2 font-weight-medium">
                      {{ truncateFileName(attachment.name_file, 25) }}
                    </div>
                    <div class="attachment-type caption grey--text">
                      {{ getFileType(attachment.name_file) }}
                    </div>
                  </div>
                  <v-btn
                    icon
                    small
                    color="primary"
                    :href="getDownloadLink(attachment)"
                    target="_blank"
                    @click.stop
                  >
                    >
                    <v-icon small>
                      mdi-download
                    </v-icon>
                  </v-btn>
                </div>
              </v-card>
            </div>
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
    getDownloadLink(attachment) {
      if (!attachment || !attachment.id) return '#';
      const baseUrl = this.$api.defaults.baseURL;
      const attachmentId = attachment.id;
      const attachmentType = 'answer';
      return `${baseUrl}adm-panel/tickets/download/${attachmentId}/${attachmentType}/`;
    },

    downloadAttachment(attachment) {
      const link = this.getDownloadLink(attachment);
      window.open(link, '_blank');
    },

    getFileIcon(fileName) {
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      switch (ext) {
        case '.pdf':
          return 'mdi-file-pdf-box';
        case '.doc':
        case '.docx':
          return 'mdi-file-word-box';
        case '.xls':
        case '.xlsx':
          return 'mdi-file-excel-box';
        case '.jpg':
        case '.jpeg':
        case '.png':
          return 'mdi-file-image-box';
        case '.txt':
          return 'mdi-file-document-box';
        case '.csv':
          return 'mdi-file-delimited-box';
        default:
          return 'mdi-file-box';
      }
    },

    getFileIconColor(fileName) {
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      switch (ext) {
        case '.pdf':
          return '#F44336';
        case '.doc':
        case '.docx':
          return '#2196F3';
        case '.xls':
        case '.xlsx':
          return '#4CAF50';
        case '.jpg':
        case '.jpeg':
        case '.png':
          return '#FF9800';
        case '.txt':
          return '#9E9E9E';
        case '.csv':
          return '#607D8B';
        default:
          return '#616161';
      }
    },

    getFileType(fileName) {
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      switch (ext) {
        case '.pdf':
          return 'PDF';
        case '.doc':
        case '.docx':
          return 'Word';
        case '.xls':
        case '.xlsx':
          return 'Excel';
        case '.jpg':
        case '.jpeg':
        case '.png':
          return 'Imagem';
        case '.txt':
          return 'Texto';
        case '.csv':
          return 'CSV';
        default:
          return 'Arquivo';
      }
    },

    truncateFileName(fileName, maxLength) {
      if (fileName.length <= maxLength) return fileName;

      const ext = fileName.substring(fileName.lastIndexOf('.'));
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      const availableLength = maxLength - ext.length - 3; // 3 for "..."

      if (availableLength <= 0) return fileName;

      return `${nameWithoutExt.substring(0, availableLength)}...${ext}`;
    },

    getTimelineItemColor(status) {
      switch (status) {
        case 'Aguardando Gestor':
          return '#D66A00'; // Laranja
        case 'Em Desenvolvimento':
          return '#F58A1F';
        case 'Desenvolvido':
          return '#1A535C'; // Verde específico para desenvolvido
        case 'Concluído':
          return '#12A844';
        case 'Em Teste':
          return '#FFCE03';
        case 'Inviável':
          return '#D92B3F';
        case 'Indeferido':
          return '#D92B3F';
        case 'Recusado':
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

.text-lightgray {
  color: #9A9997;
  font-size: 14px;
}

/* Attachments styling */
.attachments-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.attachments-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 8px;
}

.attachment-card {
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
  border: 1px solid #e0e0e0;
}

.attachment-card:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
  transform: translateY(-1px);
}

.attachment-info {
  min-width: 0; /* Allow text truncation */
}

.attachment-name {
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.attachment-type {
  font-size: 11px;
  line-height: 1.2;
  color: #7f8c8d;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .attachments-grid {
    grid-template-columns: 1fr;
  }

  .attachment-card {
    margin: 2px 0;
  }
}

/* Timeline item content improvements */
.v-timeline-item {
  padding-bottom: 24px;
}

.text-primary {
  color: #1976d2 !important;
}
</style>
