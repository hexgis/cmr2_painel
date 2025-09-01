<template>
  <v-card style="max-width: 800px; margin: auto; top: 25%;">
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
            class="mt-2 pb-6"
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
                    <v-icon
                      size="80"
                      color="primary"
                    >
                      mdi-account-circle
                    </v-icon>
                  </div>
                  <div class="text-h6 button-label">
                    {{ $t('external-user') }}
                  </div>
                </v-row>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <v-dialog
        v-model="welcomeModal"
        max-width="800"
        persistent
      >
        <v-card>
          <v-card-title
            class="pb-2"
            :style="modalContent !== 'welcome' ? { background: '#D92B3F', color: 'white' } : {}"
          >
            {{ modalContent === 'funai' ? $t('funai-user') : $t('external-user') }}
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
            <FunaiForm
              v-if="modalContent === 'form' && userType === 'funai'"
              ref="funaiForm"
              :institution-options="institutionOptions"
              :coordinator-institution-options="coordinatorInstitutionOptions"
              @submit="handleFormSubmit"
              @success-confirmed="closeModalAndRedirect"
            />
            <ExternalForm
              v-if="modalContent === 'form' && userType === 'external'"
              ref="externalForm"
              :institution-options="institutionOptions"
              :coordinator-institution-options="coordinatorInstitutionOptions"
              @submit="handleFormSubmit"
              @success-confirmed="closeModalAndRedirect"
            />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-form>
  </v-card>
</template>

<i18n lang="json">
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
import FunaiForm from '../components/cadastro/FunaiUserForm.vue';
import ExternalForm from '../components/cadastro/ExternalUserForm.vue';

export default {
  name: 'CadastroStep',
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
      modalContent: 'welcome',
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
      welcomeModal: false,
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
      return this.institutionOptions;
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
      if (this.$refs.funaiForm) {
        this.$refs.funaiForm.showSuccessDialog = false;
        this.$refs.funaiForm.isSubmitting = false;
      }
      if (this.$refs.externalForm) {
        this.$refs.externalForm.showSuccessDialog = false;
        this.$refs.externalForm.isSubmitting = false;
      }
      this.welcomeModal = false;
      this.userType = null;
      this.modalContent = 'welcome';
    },
    async handleFormSubmit(formData) {
      this.formData = { ...formData };

      if (!this.formData.name || !this.formData.email) {
        console.error('Campos obrigatórios ausentes: name ou email');
        return;
      }
      let data;

      if (this.userType === 'funai') {
        if (!this.formData.institution
            || !this.formData.user_siape_registration
            || !this.formData.coordinator_name
            || !this.formData.coordinator_email
            || !this.formData.coordinator_institution
            || !this.formData.coordinator_siape_registration) {
          return;
        }

        data = new FormData();
        data.append('name', this.formData.name);
        data.append('email', this.formData.email);
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
      } else if (this.userType === 'external') {
        if (!this.formData.letter) {
          console.error('Carta institucional é obrigatória para usuário externo');
          return;
        }

        let institutionText = '';
        if (this.formData.institution) {
          if (typeof this.formData.institution === 'object') {
            institutionText = this.formData.institution.text || this.formData.institution.value || '';
          } else {
            institutionText = this.formData.institution;
          }
        }

        data = new FormData();
        data.append('name', this.formData.name);
        data.append('email', this.formData.email);
        data.append('organization', institutionText || this.formData.organization || '');
        data.append('position', this.formData.position || '');
        data.append('justification', this.formData.justification || '');
        data.append('letter', this.formData.letter);
        data.append('user_type', 'external');
      }
      const formDataEntries = [];
      data.forEach((value, key) => {
        formDataEntries.push({ key, value });
      });

      try {
        await this.$nextTick();
        if (this.userType === 'funai' && this.$refs.funaiForm) {
          this.$refs.funaiForm.showSuccessDialog = true;
        } else if (this.userType === 'external' && this.$refs.externalForm) {
          this.$refs.externalForm.showSuccessDialog = true;
        }
      } catch (error) {
        if (this.userType === 'funai' && this.$refs.funaiForm) {
          this.$refs.funaiForm.isSubmitting = false;
        } else if (this.userType === 'external' && this.$refs.externalForm) {
          this.$refs.externalForm.isSubmitting = false;
        }
        if (error.response) {
          console.error('Resposta da API:', error.response.data);
          console.error('Status:', error.response.status);
          console.error('Headers:', error.response.headers);
        }
      }
    },

    async closeModalAndRedirect() {
      this.welcomeModal = false;
      this.userType = null;
      this.modalContent = 'welcome';
      this.showUserTypeSelection = true;

      this.formData = {
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
      };

      await this.$nextTick();

      this.$forceUpdate();

      await this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.selection-button {
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  padding: 20px;
  text-transform: none;
  letter-spacing: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white !important;
  border: 2px solid #e0e0e0 !important;
}

.selection-button:hover {
  border-color: #D92B3F !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(217, 43, 63, 0.25) !important;
}
</style>
