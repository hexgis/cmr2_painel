<template>
  <div
    v-if="value"
    class="_modal-wrapper"
  >
    <div class="_modal-backdrop" />
    <div class="_modal-container container">
      <div class="_modal">
        <div>
          <v-toolbar
            dense
            class="no-print"
            color="primary"
          >
            <h3 class="white--text font-weight-medium ml-4">
              {{ $t('print-out') }}
            </h3>
            <v-spacer />
            <v-btn
              icon
              x-small
              color="white"
              class="close-btn mr-2"
              @click="close()"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
        </div>

        <main class="_modal-body">
          <slot />
        </main>

        <!-- Footer do modal -->
        <footer
          v-if="showFooter"
          class="_modal-footer no-print"
          color="primary"
        >
          <hr class="_modal-footer-divider">
          <slot name="footer">
            <v-card-actions class="pa-3">
              <v-btn
                :disabled="backButtonDisabled"
                @click="handleBackClick"
              >
                {{ backButtonText || $t('input-button-back-second-step') }}
              </v-btn>
              <v-spacer />
              <v-btn
                color="primary"
                :loading="printLoading"
                class="mr-2"
                @click="report()"
              >
                <v-icon left>
                  mdi-content-save
                </v-icon>
                {{ printButtonText || $t('input-button-pdf-image') }}
              </v-btn>
            </v-card-actions>
          </slot>
        </footer>
      </div>
    </div>
  </div>
</template>

<i18n>
{
  "en": {
    "print-out": "Print Out",
    "input-button-back-second-step": "Back",
    "input-button-pdf-image": "Generate PDF"

  },
  "pt-br": {
    "print-out": "Impressão",
    "input-button-back-second-step": "Voltar",
    "input-button-pdf-image": "Gerar PDF"
  }
}
</i18n>

<script>
export default {
  name: 'BaseModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    backButtonText: {
      type: String,
      default: '',
    },
    printButtonText: {
      type: String,
      default: '',
    },
    backButtonDisabled: {
      type: Boolean,
      default: false,
    },
    printLoading: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    handleBackClick() {
      this.$emit('printer-back');
    },

    close() {
      this.$emit('input', false);
      this.$emit('close');
    },
    report() {
      window.print();
      this.$emit('report');
    },
  },
};
</script>

<style scoped>

.print-dialog-header {
  background: var(--v-primary-base);
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 16px;
  display: flex;
  justify-content: flex-end;
}
/* Estilos mantidos como antes, com adição do footer */
._modal-wrapper {
  position: absolute;
  z-index: 6;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
}

._modal-backdrop {
  position: fixed;
  height: 100%;
  width: 100%;
  z-index: 1;
  background-color: rgba(0,0,0,0.5);
}

._modal-container {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

._modal {
  width: 90%;
  max-height: 95vh;
  background-color: #fff;
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
}

._modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.no-print {
  @media print {
    display: none !important;
  }
}

._modal-footer-divider {
  margin: 0;
  border: none;
  height: 1px;
  background: #e0e0e0;
}

@media print {
  ._modal-backdrop {
    display: none !important;
  }

  ._modal-wrapper {
    position: relative;
    height: auto;
    width: 100% !important;
    display: block;
  }

  ._modal-body {
    padding: 0;
    overflow: visible;
    height: auto;
  }

  ._modal-container {
    padding: 0;
    width: 100% !important;
  }

  ._modal {
    width: 100% !important;
    max-height: none !important;
    border-radius: 0;
    display: block;
  }

}
</style>
