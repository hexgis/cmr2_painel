<template>
  <div
    style="width: 100%;"
    class="d-flex align-center justify-center flex-column px-8 mt-8"
  >
    <div
      class="d-flex justify-start"
      style="width: 500px;"
    >
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

    <form
      style="width: 500px"
      @submit.prevent="onSubmit"
    >
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
    </form>
  </div>
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
    localePath() {
      return this.$nuxt.$localePath || ((path) => path);
    },
  },
  async mounted() {
    this.id = this.$route.params.id;
    if (this.id && !isNaN(this.id)) {
      await this.loadAnalytic();
    } else {
      this.$router.push(this.localePath('/admin/analytics'));
    }
  },
  methods: {
    navigateBack() {
      this.$router.push(this.localePath('/admin/analytics'));
    },
    async loadAnalytic() {
      // First get all analytics if not loaded
      if (!this.$store.state.statistics.data.length) {
        await this.$store.dispatch('statistics/getAnalytics', this.$t('error-message-getAnalytics'));
      }

      // Find the analytic by ID
      const analytic = this.$store.state.statistics.data.find((item) => item.id == this.id);

      if (analytic) {
        this.currentAnalytic = analytic;
        this.name = analytic.name;
        this.url = analytic.url;
        this.tooltip = analytic.tooltip;
        // Note: For editing, we don't pre-populate the file input
        // User can upload a new image or keep the existing one
      } else {
        this.$router.push(this.localePath('/admin/analytics'));
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

      let imageBase64 = '';
      if (this.imageFile) {
        // New image uploaded
        imageBase64 = await this.toBase64(this.imageFile);
        imageBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      } else if (this.currentAnalytic && this.currentAnalytic.image) {
        // Keep existing image
        imageBase64 = this.currentAnalytic.image;
      }

      const analytic = {
        name: this.name,
        url: this.url,
        tooltip: this.tooltip,
        image: imageBase64,
      };

      await this.$store.dispatch('statistics/updateAnalytics', {
        id: this.id,
        analytic,
        messageError: this.$t('message-error-update-analytic'),
      });

      this.isSubmitting = false;
      this.$router.push(this.localePath('/admin/analytics'));
    },
    toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    },
  },
};
</script>
