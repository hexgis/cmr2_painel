<template>
  <v-dialog
    v-model="dialog"
    :max-width="options.width || 400"
    persistent
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ $t('attention-label') }}

        <v-spacer />

        <v-btn
          icon
          @click="cancel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="mt-4">
        <p>{{ $t('description-label-1') }}</p>

        <p>
          {{ $t('description-label-2') }}
          <a href="mailto:cmr@funai.gov.br">cmr@funai.gov.br</a>.
        </p>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="red darken-1"
          text
          @click="cancel"
        >
          <v-icon>mdi-close</v-icon>
          {{ $t('cancel-label') }}
        </v-btn>
        <v-btn
          color="green darken-1"
          text
          @click="confirm"
        >
          <v-icon>mdi-download</v-icon>
          {{ $t('download-label') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<i18n>
{
  "en": {
    "attention-label": "Attention",
    "download-label": "Download",
    "cancel-label": "Cancel",
    "description-label-1": "Due to technical limitations, the generated file has a maximum limit of 10,000 features. The query made generated a number of polygons greater than that, so it is possible that not all polygons will be available in the generated file.",
    "description-label-2": "If you need to download the complete data, please contact the CMR team via Contact Us on the platform or by email "
  },
  "pt-br": {
    "attention-label": "Atenção",
    "download-label": "Baixar",
    "cancel-label": "Cancelar",
    "description-label-1": "Devido a limitações técnicas, os arquivo gerado possui o limite máximo de 10.000 feições. A consulta efetuada gerou um número superior de polígonos, de forma que é possível nem todos os polígonos estarão disponíveis no arquivo gerado.",
    "description-label-2": "Em caso de necessidade de download dos dados completos, entre em contato com a equipe da CMR por meio do Fale Conosco na plataforma ou pelo e-mail "
  }
}
</i18n>

<script>
export default {
  name: 'ConfirmDownloadDialog',

  data() {
    return {
      dialog: false,
      options: {},
      currentResolve: null,
      queue: [],
    };
  },

  watch: {
    dialog(value) {
      if (!value && this.currentResolve) {
        this.currentResolve(false);
        this.processNext();
      }
    },
  },

  methods: {
    open(options = {}) {
      return new Promise((resolve) => {
        const request = {
          options, resolve,
        };
        if (this.dialog) {
          this.queue.push(request);
        } else {
          this.displayRequest(request);
        }
      });
    },

    displayRequest(request) {
      this.options = request.options || {};
      this.currentResolve = request.resolve;
      this.dialog = true;
    },

    confirm() {
      if (this.currentResolve) {
        this.currentResolve(true);
      }
      this.dialog = false;
      this.processNext();
    },

    cancel() {
      if (this.currentResolve) {
        this.currentResolve(false);
      }
      this.dialog = false;
      this.processNext();
    },

    processNext() {
      this.currentResolve = null;
      if (this.queue.length) {
        const nextRequest = this.queue.shift();
        this.$nextTick(() => this.displayRequest(nextRequest));
      } else {
        this.options = {};
      }
    },
  },
};
</script>
