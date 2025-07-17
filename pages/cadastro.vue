<template>
  <v-card style="max-width: 1100px; margin: auto; top: 5%;">
    <v-card-title
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
      <v-stepper v-model="step">
        <v-stepper-header style="justify-content: center;">
          <v-stepper-step
            :complete="step > 1"
            step="1"
            @click="handleStepClick(1)"
          >
            {{ $t('server') }}
          </v-stepper-step>
          <v-stepper-step
            :complete="step > 2"
            step="2"
            @click="handleStepClick(2)"
          >
            {{ $t('coordinator') }}
          </v-stepper-step>
          <v-stepper-step
            :complete="step > 3"
            step="3"
            @click="handleStepClick(3)"
          >
            {{ $t('review') }}
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <!-- STEP 1 -->
          <v-stepper-content step="1">
            <v-container>
              <v-row>
                <p class="text-h6 pt-4">
                  {{ $t('server') }}
                </p>
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="formData.name"
                    :label="$t('name')"
                    :rules="[v => !!v || $t('name-required')]"
                    required
                    @input="validateStep1"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="formData.email"
                    :label="$t('email')"
                    :rules="[
                      v => !!v || $t('email-required'),
                      v => /.+@.+\..+/.test(v) || $t('email-valid')
                    ]"
                    required
                    @input="validateStep1"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-autocomplete
                    v-model="formData.institution"
                    :label="$t('institution')"
                    :items="institutionOptions"
                    item-text="text"
                    item-value="value"
                    :rules="[v => !!v || $t('institution-required')]"
                    required
                    clearable
                    @input="validateStep1"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="formData.user_siape_registration"
                    :label="$t('registration')"
                    type="number"
                    :rules="[v => !!v || $t('registration-required')]"
                    required
                    @input="validateStep1"
                  />
                </v-col>
              </v-row>
              <v-btn
                color="primary"
                class="mt-8"
                :disabled="!isStep1Valid"
                @click="nextStep"
              >
                {{ $t('next') }}
              </v-btn>
            </v-container>
          </v-stepper-content>

          <!-- STEP 2 -->
          <v-stepper-content step="2">
            <v-container>
              <v-row class="align-center">
                <p class="text-h6 pt-4">
                  {{ $t('coordinator') }}
                </p>
                <v-spacer />
                <v-btn
                  color="primary"
                  text
                  @click="prevStep"
                >
                  <v-icon>mdi-arrow-left</v-icon>{{ $t('back') }}
                </v-btn>
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="formData.coordinator_name"
                    :label="$t('coordinator-name')"
                    :rules="[v => !!v || $t('coordinator-name-required')]"
                    required
                    @input="validateStep2"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="formData.coordinator_email"
                    :label="$t('coordinator-email')"
                    :rules="[
                      v => !!v || $t('coordinator-email-required'),
                      v => /.+@.+\..+/.test(v) || $t('email-valid')
                    ]"
                    required
                    @input="validateStep2"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-autocomplete
                    v-model="formData.coordinator_institution"
                    :label="$t('coordinator-institution')"
                    :items="coordinatorInstitutionOptions"
                    item-text="text"
                    item-value="value"
                    :rules="[v => !!v || $t('coordinator-institution-required')]"
                    required
                    clearable
                    @input="validateStep2"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="formData.coordinator_siape_registration"
                    :label="$t('siape-registration')"
                    type="number"
                    :rules="[v => !!v || $t('siape-registration-required')]"
                    required
                    @input="validateStep2"
                  />
                </v-col>
              </v-row>
              <v-btn
                color="primary"
                class="mt-8"
                :disabled="!isStep2Valid"
                @click="nextStep"
              >
                {{ $t('next') }}
              </v-btn>
            </v-container>
          </v-stepper-content>

          <!-- STEP 3 -->
          <v-stepper-content step="3">
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
                  <p><strong>{{ $t('name') }}:</strong> {{ formData.name }}</p>
                  <p><strong>{{ $t('email') }}:</strong> {{ formData.email }}</p>
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <p>
                    <strong>{{ $t('institution') }}:</strong> {{ formData.institution }}
                  </p>
                  <p>
                    <strong>{{ $t('registration') }}:</strong>
                    {{ formData.user_siape_registration }}
                  </p>
                </v-col>
              </v-row>
              <v-divider />
              <p>{{ $t('coordinator') }}</p>
              <v-row>
                <v-col
                  cols="12"
                  md="6"
                >
                  <p>
                    <strong>{{ $t('coordinator-name') }}:</strong>
                    {{ formData.coordinator_name }}
                  </p>
                  <p>
                    <strong>{{ $t('coordinator-email') }}:</strong>
                    {{ formData.coordinator_email }}
                  </p>
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <p>
                    <strong>{{ $t('coordinator-institution') }}:</strong>
                    {{ formData.coordinator_institution }}
                  </p>
                  <p>
                    <strong>{{ $t('siape-registration') }}:</strong>
                    {{ formData.coordinator_siape_registration }}
                  </p>
                </v-col>
              </v-row>
              <v-btn
                color="primary"
                class="mt-4"
                @click="submitForm"
              >
                {{ $t('submit-request') }}
              </v-btn>
              <v-btn
                color="primary"
                text
                class="mt-4"
                @click="step = 1"
              >
                {{ $t('review-info') }}
              </v-btn>
            </v-container>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-form>

    <!-- DIALOGS -->
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

    <v-dialog
      v-model="welcomeModal"
      max-width="400"
    >
      <v-card style="background: #ffce03;">
        <v-card-title class="pb-0">
          {{ $t('important') }}
        </v-card-title>
        <p class="pa-6 pt-2 pb-0">
          {{ $t('restricted-area-request') }}
        </p>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="welcomeModal = false"
          >
            {{ $t('ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      "click-here": "Click here",
      "download-form": "to download the form to be completed for restricted access request to CMR.",
      "attach-form": "To attach the completed form, click the button below.",
      "attach-file": "Attach file",
      "attachment-required": "Attachment is required",
      "submit-request": "Submit Request",
      "review": "Review",
      "review-data": "Review the data entered before submitting the request:",
      "attached-file": "Attached File",
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
      "important": "Important!"
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
      "click-here": "Clique aqui",
      "download-form": "para baixar o formulário a ser preenchido para solicitação de acesso restrito ao CMR.",
      "attach-form": "Para anexar o formulário preenchido, clique no botão abaixo.",
      "attach-file": "Anexar arquivo",
      "attachment-required": "Anexo é obrigatório",
      "submit-request": "Enviar Solicitação",
      "review": "Revisar informações",
      "review-data": "Revise os dados inseridos antes de enviar a solicitação:",
      "attached-file": "Arquivo Anexado",
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
      "important": "Importante!"
    }
  }
</i18n>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Cadastro',
  layout: 'login',
  data() {
    return {
      valid: false,
      step: 1,
      pdfLink:
        'https://cmr.funai.gov.br/api/media/Documentos/formulario_solicitacao_area_restrita_cmr_23abr2018_v1.4.pdf',
      formData: {
        name: '',
        email: '',
        institution: '',
        user_siape_registration: '',
        coordinator_name: '',
        coordinator_email: '',
        coordinator_institution: '',
        coordinator_siape_registration: '',
        attachment: null,
      },
      isStep1Valid: false,
      isStep2Valid: false,
      isStep3Valid: false,
      showModal: false,
      modalTitle: '',
      modalMessage: '',
      isSuccess: false,
      welcomeModal: true,
    };
  },
  computed: {
    ...mapGetters('admin', ['institutionList']),

    // Computed property to filter institutions for institution field
    institutionOptions() {
      return this.institutionList
        .filter((institution) => institution.institution_type === 'Coordenação Regional')
        .map((institution) => ({
          text: institution.acronym ? `${institution.acronym} - ${institution.name}` : institution.name,
          value: institution.name,
          ...institution,
        }))
        .sort((a, b) => a.text.localeCompare(b.text));
    },

    // Computed property to filter institutions for coordinator institution field
    coordinatorInstitutionOptions() {
      return this.institutionList
        .filter((institution) => institution.institution_type === 'Coordenação Regional')
        .map((institution) => ({
          text: institution.acronym ? `${institution.acronym} - ${institution.name}` : institution.name,
          value: institution.name,
          ...institution,
        }))
        .sort((a, b) => a.text.localeCompare(b.text));
    },
  },
  watch: {
    formData: {
      handler() {
        this.validateStep1();
        this.validateStep2();
      },
      deep: true,
    },
  },
  mounted() {
    this.validateStep1();
    this.validateStep2();
    this.$store.dispatch('admin/fetchInstitutionList');
  },
  methods: {
    validateStep1() {
      this.isStep1Valid = this.formData.name
        && this.formData.email
        && this.formData.institution
        && this.formData.user_siape_registration;
    },
    validateStep2() {
      this.isStep2Valid = this.formData.coordinator_name
        && this.formData.coordinator_email
        && this.formData.coordinator_institution
        && this.formData.coordinator_siape_registration;
    },
    // validateStep3() {
    //   this.isStep3Valid = this.formData.attachment;
    // },
    nextStep() {
      if (this.step < 3) {
        this.step++;
      }
    },
    handleStepClick(stepNumber) {
      if (
        stepNumber < this.step
        || (stepNumber > this.step && this[`isStep${this.step}Valid`])
      ) {
        this.step = stepNumber;
      }
    },
    prevStep() {
      if (this.step > 1) {
        this.step--;
      }
    },
    async submitForm() {
      const data = new FormData();
      data.append('name', this.formData.name);
      data.append('email', this.formData.email);
      data.append('institution', this.formData.institution);
      data.append('user_siape_registration', this.formData.user_siape_registration);
      data.append('coordinator_name', this.formData.coordinator_name);
      data.append('coordinator_email', this.formData.coordinator_email);
      data.append('coordinator_institution', this.formData.coordinator_institution);
      data.append(
        'coordinator_siape_registration',
        this.formData.coordinator_siape_registration,
      );

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
          this.showModal = true;
        }
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
