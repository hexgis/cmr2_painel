<template>
  <div
    v-if="value"
    class="_modal-wrapper"
  >
    <div class="_modal-backdrop" />
    <div class="_modal-container container">
      <div class="_modal">
        <div class="_modal-header d-flex justify-space-between align-start">
          <v-toolbar
            dense
            class="print-dialog-header no-print"
            color="primary"
          >
            <v-btn
              icon
              x-small
              color="white"
              class="close-btn mb-4"
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
        >
          <slot name="footer">
            <v-card-actions class="pa-3">
              <v-spacer />
              <v-btn
                class="mr-2"
                :disabled="backButtonDisabled"
                @click="handleBackClick"
              >
                {{ backButtonText || $t('input-button-back-second-step') }}
              </v-btn>
              <v-btn
                color="primary"
                :loading="printLoading"
                @click="report()"
              >
                <v-icon left>
                  mdi-printer
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

    "input-button-back-second-step": "Back",
    "input-button-pdf-image": "Generate PDF"

  },
  "pt-br": {
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
    emitBackAsPrinterBack: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleBackClick() {
      if (this.emitBackAsPrinterBack) {
        // Emite um evento específico para voltar ao printer
        this.$emit('printer-back');
      } else {
        // Comportamento padrão
        this.$emit('back');
      }
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
}

._modal {
  height: 100%;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
}

._modal-header {
  background-color: rgb(245, 245, 245);
  border-radius: 10px 10px 0 0;
  flex-shrink: 0;
}

._modal-header button {
  max-height: 40px;
}

._modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

._modal-footer {
  flex-shrink: 0;
  background-color: rgb(245, 245, 245);
  border-radius: 0 0 10px 10px;
  border-top: 1px solid #e0e0e0;
}

.close-button {
  font-size: 16px;
  border-radius: 10px 0 10px 0;
  background-color: whitesmoke;
}

.close-button i {
  font-size: 22px;
}

.report-button {
  border-radius: 0 8px 0 0;
  background-color: #2c3649;
}

.report-button i {
  color: white;
}

.no-print {
  @media print {
    display: none !important;
  }
}

@media print {
  ._modal-wrapper {
    position: relative;
    height: auto;
    display: block;
  }

  ._modal-body {
    display: block;
    height: auto;
    overflow-y: visible;
    padding: 0;
  }

  ._modal-container {
    max-width: none !important;
    padding: 0;
  }

  ._modal {
    border-radius: 0px;
    display: block;
  }

  ._modal-header,
  ._modal-footer {
    display: none !important;
  }
}
</style>
