<template>
  <v-dialog
    v-model="showDialog"
    max-width="800px"
    overlay-opacity="0.8"
    persistent
  >
    <v-card class="termo-modal">
      <!-- Header -->
      <v-card-title class="primary white--text text-center pa-4 justify-center">
        <div class="w-100 d-flex flex-column align-center justify-center">
          <v-icon
            size="28"
            color="white"
            class="mb-2"
          >
            mdi-shield-lock
          </v-icon>
          <div class="text-h5 font-weight-bold text-center w-100">
            {{ termoTitle || 'Termo de Sigilo e Confidencialidade' }}
          </div>
        </div>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6">
        <!-- Alert -->
        <v-alert
          type="error"
          outlined
          prominent
          class="mb-4 important-alert"
        >
          <div class="text-h6 font-weight-bold mb-2">
            Atenção
          </div>
          <div class="text-body-1">
            Para continuar utilizando o <strong>sistema CMR</strong>,
            você deve aceitar os termos de sigilo e confidencialidade descritos abaixo.
          </div>
        </v-alert>

        <!-- Termo Text -->
        <div class="termo-content">
          <div
            v-if="loading"
            class="text-center py-8"
          >
            <v-progress-circular
              indeterminate
              color="primary"
              size="50"
            />
            <div class="mt-3 text-body-1">
              Carregando termo...
            </div>
          </div>

          <div
            v-else
            class="termo-text-container"
          >
            <div class="termo-text">
              {{ termoText }}
            </div>
          </div>
        </div>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          dense
          class="mt-4"
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-row class="ma-0">
          <v-col
            cols="12"
            class="pa-0"
          >
            <div class="d-flex justify-space-between align-center">
              <v-btn
                large
                outlined
                color="error"
                :loading="rejecting"
                :disabled="isProcessing"
                @click="rejectTermo"
              >
                <v-icon left>
                  mdi-close
                </v-icon>
                Recusar
              </v-btn>

              <v-btn
                large
                color="success"
                :loading="accepting"
                :disabled="isProcessing"
                @click="acceptTermo"
              >
                <v-icon left>
                  mdi-check
                </v-icon>
                Li e concordo com os termos de uso
              </v-btn>
            </div>

            <div class="text-caption text-center mt-4 grey--text">
              Ao aceitar, você concorda em cumprir todos os termos descritos acima.
            </div>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>

    <!-- Confirmation Modal for Rejection -->
    <ConfirmModal
      v-model="showConfirmReject"
      title="Confirmar Recusa"
      message="Tem certeza que deseja recusar o termo de sigilo? Você será desconectado do sistema."
      confirm-text="Confirmar"
      cancel-text="Retornar"
      confirm-color="error"
      icon="mdi-alert-circle"
      :loading="rejecting"
      @confirm="confirmReject"
      @cancel="cancelReject"
    />
  </v-dialog>
</template>

<script>
import ConfirmModal from '@/components/base/ConfirmModal.vue';

export default {
  name: 'TermoSigiloModal',

  components: {
    ConfirmModal,
  },

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      termoTitle: 'Termo de Sigilo e Confidencialidade',
      termoText: this.getTermoText(),
      loading: false,
      accepting: false,
      rejecting: false,
      error: null,
      version: '2.0',
      showConfirmReject: false,
    };
  },

  computed: {
    showDialog: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    isProcessing() {
      return this.accepting || this.rejecting;
    },
  },

  methods: {
    /**
     * Returns the hardcoded confidentiality agreement text
     */
    getTermoText() {
      return `Para utilizar o serviço do Centro de Monitoramento Remoto da Fundação Nacional do Índio o servidor deve ler e concordar com o Termo de Serviço:

1. Cada servidor designado poderá criar apenas uma conta, de uso pessoal e intransferível. É expressamente proibida a utilização por mais de uma pessoa, empréstimo, divulgação, cessão ou qualquer forma de transferência de conta, NOME DE USUÁRIO e SENHA DE ACESSO.

2. O SERVIDOR se compromete a notificar o CMR imediatamente, mediante envio de correio eletrônico ao endereço "cmr@funai.gov.br", sempre que tiver ciência de qualquer uso não autorizado de seu NOME DE USUÁRIO, e-mail e/ou SENHA DE ACESSO.

3. O SERVIDOR assume o compromisso de manter confidencialidade e sigilo sobre todas as informações técnicas, científicas, metodológicas, processos e observações apresentadas e discutidas no âmbito do Centro de Monitoramento Remoto da Fundação Nacional do Índio.

4. As informações e dados disponibilizados no sistema são de propriedade da FUNAI e são fornecidos exclusivamente para fins de trabalho oficial.

5. É vedado o uso das informações para fins comerciais, pessoais ou qualquer outro propósito que não seja relacionado às atividades oficiais da FUNAI.

6. O descumprimento deste termo pode resultar em medidas disciplinares e/ou legais conforme a legislação vigente.

7. O acesso às informações está condicionado ao cumprimento integral dos termos aqui estabelecidos e à legislação vigente sobre proteção de dados e informações públicas.

8. Este termo entra em vigor na data de sua aceitação e permanece válido enquanto o usuário mantiver acesso ao sistema.`;
    },

    /**
     * Processes the acceptance of the confidentiality agreement
     */
    async acceptTermo() {
      if (this.isProcessing) {
        console.warn('Operation already in progress, ignoring...');
        return;
      }

      try {
        this.accepting = true;
        this.error = null;

        await this.$store.dispatch('termoSigilo/acceptTermo', {
          version: this.version,
        });

        this.showDialog = false;
        this.$emit('accepted');
      } catch (error) {
        console.error('Error accepting agreement:', error);
        this.error = this.formatErrorMessage(error);
      } finally {
        this.accepting = false;
      }
    },

    /**
     * Initiates the agreement rejection process
     */
    rejectTermo() {
      if (this.isProcessing) {
        console.warn('Operation already in progress, ignoring...');
        return;
      }
      this.showConfirmReject = true;
    },

    /**
     * Confirms the agreement rejection and performs logout
     */
    async confirmReject() {
      if (this.isProcessing) {
        console.warn('Operation already in progress, ignoring...');
        return;
      }

      try {
        this.rejecting = true;
        this.error = null;
        this.showConfirmReject = false;

        console.log('Rejecting confidentiality agreement...');

        await this.$store.dispatch('termoSigilo/rejectTermo');

        console.log('Agreement rejected successfully, starting logout...');

        this.showDialog = false;
        this.$emit('rejected');

        await this.performLogout();
      } catch (error) {
        console.error('Error rejecting agreement:', error);
        this.error = 'Error processing rejection.';

        await this.performLogout();
      } finally {
        this.rejecting = false;
      }
    },

    /**
     * Cancels the rejection confirmation
     */
    cancelReject() {
      this.showConfirmReject = false;
    },

    /**
     * Formats error messages consistently
     */
    formatErrorMessage(error) {
      if (error.response && error.response.status === 401) {
        return 'Session expired. Please log in again.';
      }

      if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
      }

      if (error.message) {
        return error.message;
      }

      return 'Unexpected error. Please try again.';
    },

    /**
     * Executes the complete logout process
     */
    async performLogout() {
      this.$store.dispatch('termoSigilo/reset');

      if (process.client) {
        this.clearLocalStorage();
      }

      await this.executeAuthLogout();

      this.redirectToHome();
    },

    /**
     * Clears all localStorage and sessionStorage data
     */
    clearLocalStorage() {
      try {
        localStorage.removeItem('termo-aceito');
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('Error clearing storage:', storageError);
      }
    },

    /**
     * Executes logout via authentication system
     */
    async executeAuthLogout() {
      try {
        if (this.$auth && this.$auth.logout) {
          await this.$auth.logout();
        }
      } catch (logoutError) {
        console.warn('Logout error:', logoutError);
      }
    },

    /**
     * Redirects to home page with fallbacks
     */
    redirectToHome() {
      if (!process.client) return;

      this.$router.push('/').catch((routerError) => {
        console.warn('Router error:', routerError);

        window.location.replace('/');
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    },
  },
};
</script>

<style scoped>
.termo-modal {
  border-radius: 12px !important;
}

.termo-modal .v-card__title {
  justify-content: center !important;
  text-align: center !important;
}

.termo-modal .v-card__title > div {
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
}

.important-alert {
  border-left: 4px solid #d92b3f !important;
  background-color: #fafafa !important;
}

.termo-content {
  max-height: 400px;
  overflow-y: auto;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.termo-text-container {
  padding: 20px;
}

.termo-text {
  white-space: pre-wrap;
  line-height: 1.8;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #333;
  text-align: justify;
}

/* Custom scrollbar */
.termo-content::-webkit-scrollbar {
  width: 8px;
}

.termo-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.termo-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.termo-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
