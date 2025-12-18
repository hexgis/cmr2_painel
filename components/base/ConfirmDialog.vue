<template>
  <v-dialog
    v-model="dialog"
    :max-width="options.width || 500"
    persistent
  >
    <v-card>
      <v-card-title class="text-h6">
        {{ useTitle }}

        <v-spacer />

        <v-btn
          icon
          @click="cancel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="container-vcard">
        <template v-if="useType === 'simple'">
          <p>
            {{ descriptionFirst }}
          </p>
        </template>

        <template v-if="useType === 'detailed'">
          <p>
            {{ descriptionFirst }}
          </p>

          <p>
            {{ descriptionSecond }}
            <a href="mailto:cmr@funai.gov.br">cmr@funai.gov.br</a>.
          </p>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="red darken-1"
          text
          @click="cancel"
        >
          <v-icon v-if="useIconCancel">
            {{ useIconCancel }}
          </v-icon>
          {{ useCancel }}
        </v-btn>
        <v-btn
          color="green darken-1"
          text
          @click="confirm"
        >
          <v-icon v-if="useIconConfirm">
            {{ useIconConfirm }}
          </v-icon>
          {{ useConfirm }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<i18n>
{
  "en": {
    "title-label": "Attention",
    "confirm-label": "Understood",
    "cancel-label": "Cancel"
  },
  "pt-br": {
    "title-label": "Atenção",
    "confirm-label": "Ciente",
    "cancel-label": "Cancelar"
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

  computed: {
    useTitle() { return this.options.title || this.$t('title-label'); },
    useCancel() { return this.options.cancel || this.$t('cancel-label'); },
    useIconCancel() { return this.options.iconCancel || ''; },
    useIconConfirm() { return this.options.iconConfirm || ''; },
    useConfirm() { return this.options.confirm || this.$t('confirm-label'); },
    useType() { return this.options.typeDescription || 'simple'; },
    descriptionFirst() { return this.options.descriptionFirst || ''; },
    descriptionSecond() { return this.options.descriptionSecond || ''; },
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

<style scoped>
.container-vcard {
  text-align: justify;
  margin-top: 16px;
  max-height: 70vh;
  overflow-y: auto;
}
</style>
