<template>
  <v-card style="max-width: 800px; margin: auto; top: 25%;">
    <!-- Barra de título exibida apenas quando a modal não está exibindo formulários -->
    <v-card-title
      v-if="modalContent === 'welcome'"
      class="text-h5"
      style="
        background: #D92B3F;
        color: white;
      "
    >
      {{ $t('restricted-access-request') }}
    </v-card-title>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <!-- Seleção de tipo de usuário -->
      <div v-if="showUserTypeSelection && modalContent === 'welcome'">
        <v-container>
          <v-row
            justify="center"
          >
            <p class="text-h6 pt-4">
              {{ $t('user-type-question') }}
            </p>
          </v-row>
          <v-row
            justify="center"
            class="mt-2"
          >
            <v-col
              cols="12"
              md="5"
              class="text-center"
            >
              <v-btn
                x-large
                height="200"
                class="selection-button"
                block
                @click="openForm('funai')"
              >
                <v-row
                  align="center"
                  justify="center"
                  class="flex-column button-content"
                >
                  <div class="logo-container">
                    <v-img
                      :src="logo_funai"
                      contain
                      max-height="80"
                      max-width="120"
                      alt="Funai Logo"
                    />
                  </div>
                  <div class="text-h6 button-label">
                    {{ $t('funai-user') }}
                  </div>
                  <v-icon
                    v-if="userType === 'funai'"
                    large
                    class="mt-2"
                  >
                    mdi-check-circle
                  </v-icon>
                </v-row>
              </v-btn>
            </v-col>

            <v-col
              cols="12"
              md="5"
              class="text-center"
            >
              <v-btn
                x-large
                class="selection-button"
                height="200"
                block
                @click="openForm('external')"
              >
                <v-row
                  align="center"
                  justify="center"
                  class="flex-column button-content"
                >
                  <div class="logo-container">
                    <v-img
                      :src="logo_external"
                      contain
                      max-height="80"
                      max-width="120"
                      alt="External User Logo"
                    />
                  </div>
                  <div class="text-h6 button-label">
                    {{ $t('external-user') }}
                  </div>
                  <v-icon
                    v-if="userType === 'external'"
                    large
                    class="mt-2"
                  >
                    mdi-check-circle
                  </v-icon>
                </v-row>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Modal de Boas-Vindas/Formulários -->
      <v-dialog
        v-model="welcomeModal"
        max-width="800"
        persistent
      >
        <v-card :style="{ background: modalContent === 'welcome' ? '#ffce03' : '' }">
          <v-card-title
            class="pb-2"
            :style="modalContent !== 'welcome' ? { background: '#D92B3F', color: 'white' } : {}"
          >
            {{ modalContent === 'welcome' ? $t('important') : userType === 'funai' ? $t('funai-user') : $t('external-user') }}
            <v-spacer />
            <v-btn
              icon
              color="white"
              class="pb-2"
              @click="closeFormModal"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <!-- Conteúdo de boas-vindas -->
            <div v-if="modalContent === 'welcome'">
              <p class="pa-6 pt-2 pb-0">
                {{ $t('restricted-area-request') }}
              </p>
            </div>
            <!-- Formulário Funai -->
            <FunaiForm
              v-if="modalContent === 'form' && userType === 'funai'"
              :institution-options="institutionOptions"
              :coordinator-institution-options="coordinatorInstitutionOptions"
              @submit="handleFormSubmit"
            />
            <!-- Formulário Externo -->
            <ExternalForm
              v-if="modalContent === 'form' && userType === 'external'"
              :institution-options="institutionOptions"
              :coordinator-institution-options="coordinatorInstitutionOptions"
              @submit="handleFormSubmit"
            />
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Modal de Sucesso/Erro -->
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
            <v-spacer />
            <v-btn
              icon
              @click="closeModal"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text :style="{ background: isSuccess ? '#ffce03' : '' }">
            {{ modalMessage }}
          </v-card-text>
          <p
            v-if="isSuccess"
            class="pa-6 pt-2 pb-0"
          >
            <strong>{{ formData.name }}</strong>,<br>
            {{ $t('sucess-message') }}
            <strong>{{ formData.email }}</strong>
            {{ $t('sucess-message2') }}
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
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-form>
  </v-card>
</template>

<i18n>
  {
    "en": {
      "restricted-access-request": "Restricted Access Request",
      "server": "Server",
      "coordinator": "Coordinator",
      "form": "Form",
      "name": "Name",
      "email": "Email",
      "institution": "Institution",
      "registration": "Registration",
      "name-required": "Name is required",
      "email-required": "Email is required",
      "email-valid": "Email must be valid",
      "institution-required": "Institution is required",
      "registration-required": "Registration is required",
      "next": "Next",
      "back": "Back",
      "coordinator-name": "Coordinator's Name",
      "coordinator-email": "Coordinator's Email",
      "coordinator-institution": "Coordinator's Institution",
      "siape-registration": "Siape Registration",
      "coordinator-name-required": "Coordinator Name is required",
      "coordinator-email-required": "Coordinator Email is required",
      "coordinator-institution-required": "Coordinator Institution is required",
      "siape-registration-required": "Siape Registration is required",
      "submit-request": "Submit Request",
      "review": "Review",
      "review-data": "Review the data entered before submitting the request:",
      "review-info": "Review Information",
      "success": "Success",
      "error": "Error",
      "request-submitted-successfully": "Your request has been submitted successfully!",
      "request-failed": "There was an error submitting your request. Please try again.",
      "ok": "OK",
      "close": "Close",
      "sucess-message": "will be sent to your e-mail",
      "sucess-message2": "confirmation to access CMR, once it will be approved by the coordinator.",
      "restricted-area-request": "The request for access to the restricted area of CMR must be made exclusively by the interested server.",
      "important": "Important!",
      "user-type-question": "What is your user type?",
      "funai-user": "Funai User",
      "external-user": "External User",
      "user-type-required": "User type is required",
      "personal-info": "Personal Information",
      "institutional-info": "Institutional Information",
      "organization": "Organization",
      "organization-required": "Organization is required",
      "position": "Position",
      "position-required": "Position is required",
      "justification": "Justification",
      "justification-required": "Justification is required",
      "institutional-letter": "Institutional Letter",
      "letter-required": "Institutional Letter is required"
    },
    "pt-br": {
      "restricted-access-request": "Solicitação de Acesso Restrito",
      "server": "Servidor",
      "coordinator": "Coordenador",
      "form": "Formulário",
      "name": "Nome do servidor",
      "email": "Email do servidor",
      "institution": "Lotação",
      "registration": "Matrícula Siape",
      "name-required": "Nome é obrigatório",
      "email-required": "Email é obrigatório",
      "email-valid": "Email deve ser válido",
      "institution-required": "Lotação é obrigatória",
      "registration-required": "Matrícula é obrigatória",
      "next": "Próximo",
      "back": "Voltar",
      "coordinator-name": "Nome do Coordenador responsável",
      "coordinator-email": "Email do Coordenador responsável",
      "coordinator-institution": "Lotação do Coordenador",
      "siape-registration": "Matrícula Siape",
      "coordinator-name-required": "Nome do Coordenador é obrigatório",
      "coordinator-email-required": "Email do Coordenador é obrigatório",
      "coordinator-institution-required": "Lotação do Coordenador é obrigatória",
      "siape-registration-required": "Matrícula Siape é obrigatória",
      "submit-request": "Enviar Solicitação",
      "review": "Revisar informações",
      "review-data": "Revise os dados inseridos antes de enviar a solicitação:",
      "review-info": "Revisar Informações",
      "success": "Sucesso",
      "error": "Erro",
      "request-submitted-successfully": "Sua solicitação foi enviada com sucesso!",
      "request-failed": "Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.",
      "ok": "OK",
      "close": "Fechar",
      "sucess-message": "será enviada ao seu email",
      "sucess-message2": "a confirmação de acesso ao CMR, uma vez que seja aprovada pelo gestor.",
      "restricted-area-request": "O envio de solicitação de acesso à área restrita do CMR deve ser realizado, exclusivamente, pelo servidor interessado.",
      "important": "Importante!",
      "user-type-question": "Qual o seu tipo de usuário?",
      "funai-user": "Usuário Funai",
      "external-user": "Usuário Externo",
      "user-type-required": "Tipo de usuário é obrigatório",
      "personal-info": "Informações Pessoais",
      "institutional-info": "Informações Institucionais",
      "organization": "Organização",
      "organization-required": "Organização é obrigatória",
      "position": "Cargo",
      "position-required": "Cargo é obrigatório",
      "justification": "Justificativa",
      "justification-required": "Justificativa é obrigatória",
      "institutional-letter": "Carta Institucional",
      "letter-required": "Carta Institucional é obrigatória"
    }
  }
</i18n>

<script>
import { mapGetters } from 'vuex';
import FunaiForm from '@/components/cadastro/FunaiUserForm.vue';
import ExternalForm from '@/components/cadastro/ExternalUserForm.vue';

export default {
  name: 'Cadastro',
  components: {
    FunaiForm,
    ExternalForm,
  },
  layout: 'login',
  data() {
    return {
      valid: false,
      showUserTypeSelection: true,
      userType: null,
      modalContent: 'welcome', // 'welcome' ou 'form'
      formData: {
        name: '',
        email: '',
        institution: '',
        user_siape_registration: '',
        coordinator_name: '',
        coordinator_email: '',
        coordinator_institution: '',
        coordinator_siape_registration: '',
        organization: '',
        position: '',
        justification: '',
        letter: null,
      },
      showModal: false,
      modalTitle: '',
      modalMessage: '',
      isSuccess: false,
      welcomeModal: false, // Alterado para false inicialmente
      logo_funai: process.env.DEFAULT_LOGO_IMAGE_FUNAI,
      logo_external: process.env.DEFAULT_LOGO_IMAGE_EXTERNAL,
    };
  },
  computed: {
    ...mapGetters('admin', ['institutionList']),
    institutionOptions() {
      return this.institutionList
        .filter((institution) => (
          institution.institution_type === 'Coordenação Regional'
          || institution.institution_type === 'FUNAI Sede'
        ))
        .map((institution) => ({
          text: institution.acronym ? `${institution.acronym} - ${institution.name}` : institution.name,
          value: institution.name,
          ...institution,
        }))
        .sort((a, b) => a.text.localeCompare(b.text));
    },
    coordinatorInstitutionOptions() {
      return this.institutionOptions; // Reutiliza a mesma lógica
    },
  },
  mounted() {
    this.$store.dispatch('admin/fetchInstitutionList');
  },
  methods: {
    openForm(type) {
      this.userType = type;
      this.modalContent = 'form';
      this.welcomeModal = true;
    },
    closeFormModal() {
      this.welcomeModal = false;
      this.userType = null;
      this.modalContent = 'welcome';
    },
    async handleFormSubmit(formData) {
      this.formData = { ...formData };
      const data = new FormData();
      data.append('name', this.formData.name);
      data.append('email', this.formData.email);

      if (this.userType === 'funai') {
        data.append('institution', this.formData.institution);
        data.append('user_siape_registration', this.formData.user_siape_registration);
        data.append('coordinator_name', this.formData.coordinator_name);
        data.append('coordinator_email', this.formData.coordinator_email);
        data.append('coordinator_institution', this.formData.coordinator_institution);
        data.append('coordinator_siape_registration', this.formData.coordinator_siape_registration);

        const userInstitution = this.institutionList.find(
          (inst) => inst.name === this.formData.institution,
        );
        if (userInstitution) {
          data.append('institution_id', userInstitution.id);
          data.append('institution_acronym', userInstitution.acronym || '');
        }

        const coordinatorInstitution = this.institutionList.find(
          (inst) => inst.name === this.formData.coordinator_institution,
        );
        if (coordinatorInstitution) {
          data.append('coordinator_institution_id', coordinatorInstitution.id);
          data.append('coordinator_institution_acronym', coordinatorInstitution.acronym || '');
        }
      } else {
        data.append('organization', this.formData.organization);
        data.append('position', this.formData.position);
        data.append('justification', this.formData.justification);
        if (this.formData.letter) {
          data.append('letter', this.formData.letter);
        }
      }

      if (this.$refs.form.validate()) {
        try {
          await this.$api.post('/user/access-requests/', data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          this.isSuccess = true;
          this.modalTitle = this.$t('success');
          this.modalMessage = this.$t('request-submitted-successfully');
        } catch (error) {
          this.isSuccess = false;
          this.modalTitle = this.$t('error');
          this.modalMessage = this.$t('request-failed');
        } finally {
          this.welcomeModal = false;
          this.showModal = true;
          this.userType = null;
        }
      }
    },
    redirectToPortal() {
      this.$router.push('/');
    },
    closeModal() {
      this.showModal = false;
      this.userType = null;
    },
  },
};
</script>

<style scoped>
/* Estilo base para todos os botões */
.selection-button {
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  padding: 20px;
  text-transform: none;
  letter-spacing: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white !important; /* Fundo branco */
  border: 2px solid #e0e0e0 !important; /* Borda cinza claro padrão */
}

/* Efeito hover - para ambos os estados */
.selection-button:hover {
  border-color: #D92B3F !important; /* Borda vermelha */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(217, 43, 63, 0.25) !important;
}
</style>
