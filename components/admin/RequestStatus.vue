<template>
  <div v-if="isRestrictedAreaCard">
    <span v-if="isRestrictedAreaCard === 'Pendente'" class="center">
      <a class="link" @click="viewFileDetails">{{ $t('viewForm') }}</a>
      <p class="light--text text-center">{{ $t('requestedOn') }} {{ requestData.access_request.solicitation_date_formatted || '-'}}.</p>
    </span>
    <span v-else-if="isRestrictedAreaCard" class="light--text">
      <p v-if="requestData.denied_details">{{ $t('rejectedBy') }}</p>
      <p v-else-if="isRestrictedAreaCard === 'Concedida'">{{ $t('grantedBy') }}</p>
      <p class="font-weight-bold text-uppercase">{{ requestData.reviewed_by_name || '-' }}</p>
      <p>{{ $t('evaluatedOn') }} {{ requestData.reviewed_date_formatted || '-' }}.</p>
    </span>
  </div>
  <div v-else>
    <span>
      <p>{{ $t('requester')}}</p>
      <p class="font-weight-bold text-uppercase">{{ requestData.requesting || '-' }}</p>
    </span>
    <span v-if="ticketAlreadyAnalyzed" class="light--text">
      <p>{{ $t('analyzedOn') }} {{ requestData.ticket_status.analyzed_in_formatted || requestData.ticket_status?.formated_info?.analyzed_in_formatted || '-' }}</p>
      <p>por {{ requestData.ticket_status.analyzed_by || requestData.ticket_status?.user_info?.analyzer || '-' }}</p>
    </span>
    <span v-else class="light--text">
      <p>{{ $t('notAnalyzed')}}</p>
    </span>
  </div>
</template>
<i18n>
  {
      "en": {
          "viewForm": "View Form",
          "requestedOn": "Requested On",
          "rejectedBy": "Rejected By",
          "grantedBy": "Granted By",
          "evaluatedOn": "Evaluated On",
          "requester": "Requester",
          "analyzedOn": "Analyzed On",
          "notAnalyzed": "Not Analyzed."
      },
      "pt-br": {
          "viewForm": "Visualizar Formulário",
          "requestedOn": "Solicitada em",
          "rejectedBy": "Recusada por",
          "grantedBy": "Concedida por",
          "evaluatedOn": "Avaliado em",
          "requester": "Solicitante",
          "analyzedOn": "Analisado em",
          "notAnalyzed": "Não analisado."
      }
  }
</i18n>

<script>
export default {
  name: 'RequestStatus',
  props: {
    requestData: {
      type: Object,
      required: true,
    },
  },
  methods: {
    viewFileDetails() {
      if (this.requestData.access_request.attachment) {
        window.open(this.requestData.access_request.attachment, '_blank');
      } else {
        console.warn("Nenhum arquivo disponível para visualização.");
      }
    }
  },
  computed: {
    ticketAlreadyAnalyzed() {
      const statusCategoryName = this.requestData?.ticket_status?.status_category_name;
      const analyzedInFormatted = this.requestData?.ticket_status?.formated_info?.analyzed_in_formatted;

      return (
        statusCategoryName != null &&
        statusCategoryName !== 'Não Analisado' ||
        analyzedInFormatted != null &&
        analyzedInFormatted !== 'Não Analisado'
      );
    },

    isRestrictedAreaCard() {
      return this.requestData.status_name
    }
  }
};
</script>
<style lang="sass" scoped>
p
  margin: 0

.center
  display: flex
  flex-direction: column
  align-content: center

.link
  color: #F58A1F
  font-weight: bold
  text-decoration: underline
  margin: 0 auto

.light--text
  color: #9A9997
  font-size: 12px
</style>
