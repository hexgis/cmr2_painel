<template>
  <v-card style="max-width: 1100px; margin: auto; top: 5%;">
    <v-card-title
      class="text-h5"
      style="background: #D92B3F; color: white;"
    >
      {{ $t('access-request-analysis') }}
    </v-card-title>

    <v-container>
      <p style="font-size: 18px;">
        {{ $t('review-data') }}
      </p>
      <v-divider />

      <p>{{ $t('server') }}</p>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <p><strong>{{ $t('name') }}:</strong> {{ accessRequest.name }}</p>
          <p><strong>{{ $t('email') }}:</strong> {{ accessRequest.email }}</p>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <p><strong>{{ $t('institution') }}:</strong> {{ accessRequest.institution }}</p>
          <p><strong>{{ $t('registration') }}:</strong> {{ accessRequest.user_siape_registration }}</p>
        </v-col>
      </v-row>

      <v-divider />

      <p>{{ $t('coordinator') }}</p>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <p><strong>{{ $t('coordinator-name') }}:</strong> {{ accessRequest.coordinator_name }}</p>
          <p><strong>{{ $t('coordinator-email') }}:</strong> {{ accessRequest.coordinator_email }}</p>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <p><strong>{{ $t('coordinator-institution') }}:</strong> {{ accessRequest.coordinator_institution }}</p>
          <p><strong>{{ $t('siape-registration') }}:</strong> {{ accessRequest.coordinator_siape_registration }}</p>
        </v-col>
      </v-row>

      <v-btn
        color="success"
        class="mt-4"
        :loading="loadingSubmit"
        :disabled="loadingSubmit"
        @click="submitForm"
      >
        {{ $t('submit-request') }}
      </v-btn>
      <v-btn
        color="error"
        class="mt-4 ml-4"
        :loading="loadingReject"
        :disabled="loadingReject"
        @click="rejectRequest"
      >
        {{ $t('reject-request') }}
      </v-btn>
    </v-container>

    <!-- DIALOG -->
    <v-dialog
      v-model="showModal"
      max-width="400"
    >
      <v-card>
        <v-card-title
          :style="{ background: isSuccess ? '#ffce03' : '' }"
          class="pb-0"
        >
          {{ modalTitle }}
        </v-card-title>
        <v-card-text :style="{ background: isSuccess ? '#ffce03' : '' }">
          {{ modalMessage }}
        </v-card-text>
        <p
          v-if="isSuccess"
          class="pa-6 pt-2 pb-0"
        >
          {{ $t('sucess-message') }}
        </p>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="isSuccess"
            color="primary"
            @click="redirectToPortal"
          >
            {{ $t('ok') }}
          </v-btn>
          <v-btn
            v-else
            color="primary"
            @click="closeModal"
          >
            {{ $t('close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<i18n>
{
  "en": {
    "access-request-analysis": "Analyze Access Request",
    "server": "Server",
    "coordinator": "Coordinator",
    "name": "Name",
    "email": "Email",
    "institution": "Institution",
    "registration": "Registration",
    "email-valid": "Email must be valid",
    "coordinator-name": "Coordinator's Name",
    "coordinator-email": "Coordinator's Email",
    "coordinator-institution": "Coordinator's Institution",
    "siape-registration": "Siape Registration",
    "submit-request": "Approve Request",
    "reject-request": "Reject Request",
    "review-data": "Review the data entered before approving the request:",
    "success": "Success",
    "error": "Error",
    "rejected": "Rejected",
    "request-submitted-successfully": "Your request has been submitted successfully!",
    "rejection-message": "The request has been rejected.",
    "request-failed": "There was an error submitting your request. Please try again.",
    "ok": "OK",
    "close": "Close",
    "sucess-message": "The access request can now be viewed and approved in the Admin Panel."
  },
  "pt-br": {
    "access-request-analysis": "Análise de Solicitação de Acesso",
    "server": "Servidor",
    "coordinator": "Coordenador",
    "name": "Nome do servidor",
    "email": "Email do servidor",
    "institution": "Lotação",
    "registration": "Matrícula Siape",
    "email-valid": "Email deve ser válido",
    "coordinator-name": "Nome do Coordenador responsável",
    "coordinator-email": "Email do Coordenador responsável",
    "coordinator-institution": "Lotação do Coordenador",
    "siape-registration": "Matrícula Siape",
    "submit-request": "Aprovar Solicitação",
    "reject-request": "Reprovar Solicitação",
    "review-data": "Revise os dados inseridos antes de aprovar a solicitação:",
    "success": "Sucesso",
    "error": "Erro",
    "rejected": "Reprovada",
    "request-submitted-successfully": "Sua solicitação foi enviada com sucesso!",
    "rejection-message": "A solicitação foi reprovada.",
    "request-failed": "Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.",
    "ok": "OK",
    "close": "Fechar",
    "sucess-message": "A solicitação de acesso agora pode ser visualizada e aprovada no Painel Administrativo."
  }
}
</i18n>

<script>
export default {
  name: 'AnalisarSolicitacaoAcesso',
  layout: 'login',
  data() {
    return {
      valid: false,
      loadingSubmit: false,
      loadingReject: false,
      accessRequest: {
        name: '',
        email: '',
        institution: '',
        user_siape_registration: '',
        coordinator_name: '',
        coordinator_email: '',
        coordinator_institution: '',
        coordinator_siape_registration: '',
      },
      showModal: false,
      modalTitle: '',
      modalMessage: '',
      isSuccess: false,
    };
  },
  async fetch() {
    try {
      await this.$store.dispatch('userProfile/getUserData');
      const response = await this.$api.get(`/user/access-requests/${this.$route.params.id}`);
      this.accessRequest = response.data;
    } catch (error) {
      this.$router.replace(this.localePath('/'));
    }
  },
  mounted() {
    const isGestor = this.$store.state.userProfile.user.roles.some((role) => role.name === 'Gestor');
    const isAdministrador = this.$store.state.userProfile.user.roles.some((role) => role.name === 'Administrador');
    if (!isGestor && !isAdministrador) {
      this.$router.replace(this.localePath('/'));
    }
  },
  methods: {
    async submitForm() {
      this.loadingSubmit = true;
      try {
        const isGestor = this.$store.state.userProfile.user.roles.some((role) => role.name === 'Gestor');
        const isAdministrador = this.$store.state.userProfile.user.roles.some((role) => role.name === 'Administrador');
        if (isGestor) {
          await this.$api.post(`/user/access-requests/${this.accessRequest.id}/gestor-approve/`);
        } else if (isAdministrador) {
          await this.$api.post(`/user/access-requests/${this.accessRequest.id}/admin-approve/`);
        } else {
          throw new Error('Unauthorized');
        }
        this.isSuccess = true;
        this.modalTitle = this.$t('success');
        this.modalMessage = this.$t('request-submitted-successfully');
      } catch (error) {
        this.isSuccess = false;
        this.modalTitle = this.$t('error');
        this.modalMessage = this.$t('request-failed');
      } finally {
        this.showModal = true;
        this.loadingSubmit = false;
      }
    },
    async rejectRequest() {
      this.loadingReject = true;
      try {
        await this.$api.patch(`/user/access-requests/${this.accessRequest.id}/reject/`);
        this.isSuccess = true;
        this.modalTitle = this.$t('rejected');
        this.modalMessage = this.$t('rejection-message');
      } catch (error) {
        this.isSuccess = false;
        this.modalTitle = this.$t('error');
        this.modalMessage = this.$t('request-failed');
      } finally {
        this.showModal = true;
        this.loadingReject = false;
      }
    },
    redirectToPortal() {
      this.$router.push('/');
    },
    closeModal() {
      this.showModal = false;
    },
  },
};
</script>
