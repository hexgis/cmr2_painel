<template>
  <div>
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
              @click="$emit('submit', formData)"
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
  </div>
</template>

<i18n>
  {
    "en": {
      "server": "Server",
      "coordinator": "Coordinator",
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
      "review-info": "Review Information"
    },
    "pt-br": {
      "server": "Servidor",
      "coordinator": "Coordenador",
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
      "review-info": "Revisar Informações"
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
    coordinatorInstitutionOptions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      step: 1,
      formData: {
        name: '',
        email: '',
        institution: '',
        user_siape_registration: '',
        coordinator_name: '',
        coordinator_email: '',
        coordinator_institution: '',
        coordinator_siape_registration: '',
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
    nextStep() {
      if (this.step < 3) {
        this.step += 1;
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
        this.step -= 1;
      }
    },
  },
};
</script>
