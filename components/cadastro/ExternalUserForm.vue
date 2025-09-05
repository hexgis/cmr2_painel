<template>
  <div>
    <v-container v-if="step === 0">
      <v-row>
        <v-col cols="12">
          <v-card
            outlined
            color="info"
          >
            <p class="text-h6">
              {{ $t('welcome') }}
            </p>
            <v-card-text>
              {{ $t('text') }}
              <br>
              <v-list-item
                class="ml-n4 mt-4"
                @click="goToForm()"
              >
                <v-icon> mdi-list-box </v-icon>
                <span class="ml-2">
                  {{ $t('download-form') }}
                </span>
              </v-list-item>
              <v-checkbox
                v-model="hasDownloadedForm"
                :label="$t('confirm-download')"
                :rules="[v => !!v || $t('confirm-download-required')]"
                required
              />
              <div class="d-flex justify-end">
                <v-btn
                  color="primary"
                  :disabled="!hasDownloadedForm"
                  class="mt-4"
                  @click="nextStep"
                >
                  {{ $t('continue') }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-card
      v-else
      class="no-border"
      style="border: none !important; box-shadow: none !important; outline: none !important;"
      width="800"
    >
      <v-stepper v-model="step">
        <v-stepper-header style="justify-content: center;">
          <v-stepper-step
            :complete="step > 1"
            step="1"
            @click="handleStepClick(1)"
          >
            {{ $t('user') }}
          </v-stepper-step>
          <v-stepper-step
            :complete="step > 2"
            step="2"
            @click="handleStepClick(2)"
          >
            {{ $t('institutional-info') }}
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
          <v-stepper-content step="1">
            <v-container class="step-content">
              <v-row>
                <p class="text-h6">
                  {{ $t('user') }}
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
                    outlined
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
                    outlined
                    @input="validateStep1"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-combobox
                    v-model="formData.institution"
                    :label="$t('institution')"
                    :items="institutionOptions"
                    clearable
                    outlined
                    :title="(
                      formData.institution && formData.institution.text
                    ) ? formData.institution.text : null"
                    :menu-props="{ maxHeight: '250px', maxWidth: '320px' }"
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
                    outlined
                    @input="validateStep1"
                  />
                </v-col>
              </v-row>
            </v-container>
            <v-row
              justify="end"
              class="px-4 py-4"
            >
              <v-btn
                color="primary"
                :disabled="!isStep1Valid"
                @click="nextStep"
              >
                {{ $t('next') }}
              </v-btn>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-container class="step-content">
              <v-row>
                <p class="text-h6">
                  {{ $t('institutional-info') }}
                </p>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="formData.attachment"
                    :label="$t('institutional-letter')"
                    :rules="[v => !!v || $t('letter-required')]"
                    accept=".pdf,.doc,.docx"
                    required
                  />
                </v-col>
              </v-row>
            </v-container>
            <v-row
              justify="space-between"
              class="px-4 py-4"
            >
              <v-btn
                color="primary"
                text
                @click="prevStep"
              >
                <v-icon>mdi-arrow-left</v-icon>{{ $t('back') }}
              </v-btn>
              <v-btn
                color="primary"
                :disabled="!isStep2Valid"
                @click="nextStep"
              >
                {{ $t('next') }}
              </v-btn>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="3">
            <v-container class="step-content">
              <v-row class="mb-2">
                <p style="font-size: 18px;">
                  {{ $t('review-data') }}
                </p>
              </v-row>
              <v-row class="mb-n8">
                <p>{{ $t('user') }}</p>
                <v-divider class="mt-3 ml-2" />
              </v-row>
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
                    <strong>{{ $t('institution') }}:</strong>
                    {{
                      formData.institution && formData.institution.text
                        ? formData.institution.text
                        : formData.institution
                    }}
                  </p><p>
                    <strong>{{ $t('registration') }}:</strong>
                    {{ formData.user_siape_registration }}
                  </p>
                </v-col>
              </v-row>
              <v-row
                justify="space-between"
                class="px-4 py-4"
              >
                <v-btn
                  color="primary"
                  text
                  @click="step = 1"
                >
                  {{ $t('review-info') }}
                </v-btn>
                <v-btn
                  color="primary"
                  @click="handleSubmit"
                >
                  {{ $t('submit-request') }}
                </v-btn>
              </v-row>
            </v-container>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "welcome": "Welcome",
    "download-form": "Download the form",
    "continue": "Continue",
    "user": "User",
    "name": "Name",
    "email": "Email",
    "institution": "Institution",
    "institution-required": "Institution is required",
    "registration": "Registration",
    "registration-required": "Registration is required",
    "name-required": "Name is required",
    "email-required": "Email is required",
    "email-valid": "Email must be valid",
    "next": "Next",
    "back": "Back",
    "institutional-info": "Institutional Information",
    "institutional-letter": "Institutional Letter",
    "letter-required": "Letter is required",
    "review": "Review",
    "review-data": "Review the data entered before submitting the request:",
     "coordinator": "Coordinator",
    "coordinator-name": "Coordinator Name",
    "coordinator-email": "Coordinator Email",
    "coordinator-institution": "Coordinator Institution",
    "siape-registration": "Registration",
    "submit-request": "Submit Request",
    "review-info": "Review Information",
    "confirm-download": "I confirm that I have downloaded or already have the required form",
    "confirm-download-required": "You must confirm that you have the form",
    "text": "External users must complete a specific form. You can download it from the link below, fill it out, and scan it. If you already have the completed and scanned document, you can continue with the registration process."
  },
  "pt-br": {
    "welcome": "Bem-vindo",
    "download-form": "Baixar o formulário",
    "continue": "Continuar",
    "user": "Usuário",
    "name": "Nome",
    "email": "Email",
    "institution": "Lotação",
    "institution-required": "Lotação é obrigatória",
    "registration": "Matrícula Siape",
    "registration-required": "Matrícula é obrigatória",
    "name-required": "Nome é obrigatório",
    "email-required": "Email é obrigatório",
    "email-valid": "Email deve ser válido",
    "next": "Próximo",
    "back": "Voltar",
    "institutional-info": "Informações Institucionais",
    "institutional-letter": "Carta Institucional",
    "letter-required": "Carta é obrigatória",
    "review": "Revisar",
    "review-data": "Revise os dados inseridos antes de enviar a solicitação:",
    "coordinator": "Coordenador",
    "coordinator-name": "Nome do Coordenador",
    "coordinator-email": "Email do Coordenador",
    "coordinator-institution": "Instituição do Coordenador",
    "siape-registration": "Matrícula SIAPE",
    "submit-request": "Enviar Solicitação",
    "review-info": "Revisar Informações",
    "confirm-download": "Confirmo que baixei ou já possuo o formulário necessário",
    "confirm-download-required": "Você deve confirmar que possui o formulário",
    "text": "Usuários externos devem preencher um formulário específico. Você pode baixá-lo no link abaixo, preenchê-lo e digitalizá-lo. Caso já possua o documento preenchido e digitalizado, poderá continuar o cadastro."
  }
}
</i18n>

<script>
export default {
  props: {
    institutionOptions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      step: 0,
      hasDownloadedForm: false,
      isSubmitting: false,
      formLink: 'https://example.com/external-user-form.pdf',
      formData: {
        name: '',
        email: '',
        institution: '',
        attachment: null,
      },
      isStep1Valid: false,
      isStep2Valid: false,
    };
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
  methods: {
    async goToForm() {
      window.location.href = `${process.env.API_URL}adm-panel/formulario/`;
    },

    validateStep1() {
      this.isStep1Valid = Boolean(
        this.formData.name
        && this.formData.email
        && /.+@.+\..+/.test(this.formData.email),
      );
    },

    validateStep2() {
      this.isStep2Valid = Boolean(this.formData.attachment);
    },

    nextStep() {
      if (this.step < 3) {
        this.step += 1;
      }
    },
    handleStepClick(stepNumber) {
      if (stepNumber < this.step) {
        this.step = stepNumber;
      }
    },
    prevStep() {
      if (this.step > 0) {
        this.step -= 1;
      }
    },
    submitForm() {
      this.$emit('submit', {
        ...this.formData,
        status: 'pending_cmr_validation',
      });
    },

    async handleSubmit() {
      if (this.isSubmitting) return;

      try {
        this.isSubmitting = true;

        const externalFormData = {
          name: this.formData.name,
          email: this.formData.email,
          institution: this.formData.institution,
          attachment: this.formData.attachment,
        };

        this.$emit('submit', externalFormData);
      } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.no-border :deep(.v-card__title),
.no-border :deep(.v-card__text),
.no-border :deep(.v-stepper),
.no-border :deep(.v-stepper__content) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.step-content {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.step-content .v-row {
  flex: 1;
}

.step-content .v-col {
  padding: 4px;
}
</style>
