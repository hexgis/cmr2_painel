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
    "message-success-update-analytic": "Analytic updated successfully",
    "message-error-update-analytic": "Error updating analytic",
    "name": "Name",
    "url": "URL",
    "image-file": "Image Preview",
    "tooltip": "Tooltip",
    "label-button-edit": "Update",
    "observation": "Observation",
    "error-message-getAnalytics": "Failed to get analytics list",
    "error-invalid-base64": "Invalid Base64 string",
    "back-button": "Back"
  },
  "pt-br": {
    "message-success-update-analytic": "Análise atualizada com sucesso",
    "message-error-update-analytic": "Erro ao atualizar análise",
    "name": "Nome",
    "url": "URL",
    "image-file": "Prévia da Imagem",
    "tooltip": "Tooltip",
    "label-button-edit": "Atualizar",
    "observation": "Observação",
    "error-message-getAnalytics": "Falha ao obter lista das análises",
    "error-invalid-base64": "A string Base64 é inválida",
    "back-button": "Voltar"
  }
}
</i18n>

<script>
export default {
  name: 'AdminAnalyticsEdit',
  layout: 'admin',
  data() {
    return {
      id: null,
      name: '',
      url: '',
      imageFile: null,
      tooltip: '',
      errors: {},
      isSubmitting: false,
      currentAnalytic: null,
    };
  },
  computed: {
    isLoading() {
      return this.$store.state.statistics.isLoading;
    },
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (this.id && !Number.isNaN(Number(this.id))) {
      await this.loadAnalytic();
    } else {
      this.$router.push(this.getLocalePath('/admin/analytics'));
    }
  },
  methods: {
    getLocalePath(path) {
      return this.$nuxt.$localePath ? this.$nuxt.$localePath(path) : path;
    },
    navigateBack() {
      this.$router.push(this.getLocalePath('/admin/analytics'));
    },
    async loadAnalytic() {
      if (!this.$store.state.statistics.data.length) {
        await this.$store.dispatch('statistics/getAnalytics', this.$t('error-message-getAnalytics'));
      }

      const analytic = this.$store.state.statistics.data.find((item) => item.id == this.id);

      if (analytic) {
        this.currentAnalytic = analytic;
        this.name = analytic.name;
        this.url = analytic.url;
        this.tooltip = analytic.tooltip;
      } else {
        this.$router.push(this.getLocalePath('/admin/analytics'));
      }
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

      await this.$store.dispatch('statistics/updateAnalytics', {
        id: this.id,
        analytic: formData,
        messageError: this.$t('message-error-update-analytic'),
      });

      this.isSubmitting = false;
      this.$router.push(this.getLocalePath('/admin/analytics'));
    },
  },
};
</script>
