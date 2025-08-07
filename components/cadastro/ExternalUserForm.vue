<template>
  <div>
    <v-stepper v-model="step">
      <v-stepper-header style="justify-content: center;">
        <v-stepper-step
          :complete="step > 1"
          step="1"
          @click="handleStepClick(1)"
        >
          {{ $t('personal-info') }}
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
        <!-- STEP 1 -->
        <v-stepper-content step="1">
          <v-container>
            <v-row>
              <p class="text-h6 pt-4">
                {{ $t('personal-info') }}
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
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="formData.organization"
                  :label="$t('organization')"
                  :rules="[v => !!v || $t('organization-required')]"
                  required
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="formData.position"
                  :label="$t('position')"
                  :rules="[v => !!v || $t('position-required')]"
                  required
                />
              </v-col>
            </v-row>
            <v-btn
              color="primary"
              class="mt-8"
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
                {{ $t('institutional-info') }}
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
              <v-col cols="12">
                <v-textarea
                  v-model="formData.justification"
                  :label="$t('justification')"
                  :rules="[v => !!v || $t('justification-required')]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="formData.letter"
                  :label="$t('institutional-letter')"
                  :rules="[v => !!v || $t('letter-required')]"
                  accept=".pdf,.doc,.docx"
                  required
                />
              </v-col>
            </v-row>
            <v-btn
              color="primary"
              class="mt-8"
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
            <p>{{ $t('personal-info') }}</p>
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
                <p><strong>{{ $t('organization') }}:</strong> {{ formData.organization }}</p>
                <p><strong>{{ $t('position') }}:</strong> {{ formData.position }}</p>
              </v-col>
            </v-row>
            <v-divider />
            <p>{{ $t('institutional-info') }}</p>
            <v-row>
              <v-col cols="12">
                <p><strong>{{ $t('justification') }}:</strong> {{ formData.justification }}</p>
                <p><strong>{{ $t('institutional-letter') }}:</strong> {{ formData.letter ? formData.letter.name : '' }}</p>
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

<script>
export default {
  data() {
    return {
      step: 1,
      formData: {
        name: '',
        email: '',
        organization: '',
        position: '',
        justification: '',
        letter: null,
      },
    };
  },
  methods: {
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
      if (this.step > 1) {
        this.step -= 1;
      }
    },
  },
};
</script>
