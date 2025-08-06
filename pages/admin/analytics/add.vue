<template>
  <v-container
    fluid
    class="d-flex align-center justify-center"
  >
    <v-col
      cols="6"
    >
      <div class="d-flex justify-start mb-4">
        <v-btn
          color="grey"
          text
          @click="navigateBack"
        >
          <v-icon left>
            mdi-arrow-left
          </v-icon>
          {{ $t('back-button') }}
        </v-btn>
      </div>

      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="name"
          class="mt-4"
          :error-messages="errors.name"
          :label="$t('name')"
          outlined
        />

        <v-text-field
          v-model="url"
          class="mt-4"
          :error-messages="errors.url"
          :label="$t('url')"
          outlined
        />

        <v-file-input
          v-model="imageFile"
          accept="image/*"
          class="mt-4"
          :error-messages="errors.image_file"
          :label="$t('image-file')"
          outlined
          prepend-icon=""
        />

        <v-text-field
          v-model="tooltip"
          class="mt-4"
          :error-messages="errors.tooltip"
          :label="$t('tooltip')"
          single-line
          outlined
        />

        <v-btn
          block
          class="mt-4"
          color="accent"
          :disabled="isSubmitting"
          :loading="isLoading"
          type="submit"
        >
          {{ $t('label-button-edit') }}
        </v-btn>
      </v-form>
    </v-col>
  </v-container>
</template>

<i18n>
{
  "en": {
    "message-error-register": "Error registering analytics, try again later.",
    "message-success-register": "Analytic registered successfully.",
    "name": "Name",
    "url": "URL",
    "image-file": "Image Preview",
    "tooltip": "Tooltip",
    "label-button-edit": "Add",
    "observation": "Observation",
    "error-message-getAnalytics": "Failed to get analytics list",
    "back-button": "Back"
  },
  "pt-br": {
    "message-error-register": "Erro ao registrar análises, tente novamente mais tarde.",
    "message-success-register": "Análise registrada com sucesso.",
    "name": "Nome",
    "url": "URL",
    "image-file": "Prévia da Imagem",
    "tooltip": "Tooltip",
    "label-button-edit": "Cadastrar",
    "observation": "Observação",
    "error-message-getAnalytics": "Falha ao obter lista das análises",
    "back-button": "Voltar"
  }
}
</i18n>

<script>
export default {
  name: 'AdminAnalyticsAdd',
  layout: 'admin',
  data() {
    return {
      name: '',
      url: '',
      imageFile: null,
      tooltip: '',
      errors: {},
      isSubmitting: false,
    };
  },
  computed: {
    isLoading() {
      return this.$store.state.statistics.isLoading;
    },
  },
  methods: {
    getLocalePath(path) {
      return this.$nuxt.$localePath ? this.$nuxt.$localePath(path) : path;
    },
    navigateBack() {
      this.$router.push(this.getLocalePath('/admin/analytics'));
    },
    validate() {
      const errors = {};
      if (!this.name) errors.name = [`${this.$t('name')} is required`];
      if (!this.url) errors.url = [`${this.$t('url')} is required`];
      else if (!/^https?:\/\/.+/.test(this.url)) errors.url = [`${this.$t('url')} is invalid`];
      if (!this.tooltip) errors.tooltip = [`${this.$t('tooltip')} is required`];
      return errors;
    },
    async onSubmit() {
      this.errors = this.validate();
      if (Object.keys(this.errors).length) return;

      this.isSubmitting = true;

      const formData = new FormData();
      formData.append('name', this.name);
      formData.append('url', this.url);
      formData.append('tooltip', this.tooltip);

      if (this.imageFile) {
        formData.append('image_preview', this.imageFile);
      }

      await this.$store.dispatch('statistics/createAnalytics', {
        analytic: formData,
        messageError: this.$t('message-error-register'),
      });

      this.isSubmitting = false;
      this.$router.push(this.getLocalePath('/admin/analytics'));
    },
  },
};
</script>
