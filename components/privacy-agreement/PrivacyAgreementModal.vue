<template>
  <v-dialog
    v-model="showDialog"
    max-width="800px"
    overlay-opacity="0.8"
    persistent
  >
    <v-card class="termo-modal d-flex flex-column">
      <!-- Header -->
      <v-card-title class="primary white--text text-center justify-center">
        <v-icon
          size="28"
          color="white"
          class="mr-6"
        >
          mdi-shield-lock
        </v-icon>
        {{ agreementTitle || 'Termo de Sigilo e Confidencialidade' }}
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6 flex-grow-1 d-flex flex-column termo-body">
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
        <div class="termo-content d-flex flex-column">
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
            class="termo-text-container flex-grow-1"
          >
            <div class="termo-text px-6">
              {{ agreementText }}
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
                @click="rejectAgreement"
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
                @click="acceptAgreement"
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
  name: 'PrivacyAgreementModal',

  components: { ConfirmModal },

  props: {
    value: { type: Boolean, default: false },
  },

  data() {
    return {
      agreementTitle: 'Termo de Sigilo e Confidencialidade',
      agreementText: '',
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

  async mounted() {
    await this.loadAgreementFromStore();
  },

  methods: {
    /**
     * Loads confidentiality agreement text from store
     */
    async loadAgreementFromStore() {
      try {
        this.loading = true;
        const termoData = await this.$store.dispatch('privacyAgreement/loadTermoText');
        this.agreementText = termoData.text;
        this.agreementTitle = termoData.title;
      } catch (error) {
        console.error('Error loading agreement text:', error);
        this.error = 'Error loading agreement text.';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Processes the acceptance of the confidentiality agreement
     */
    async acceptAgreement() {
      if (this.isProcessing) {
        console.warn('Operation already in progress, ignoring...');
        return;
      }

      try {
        this.accepting = true;
        this.error = null;

        await this.$store.dispatch('privacyAgreement/acceptTermo', { version: this.version });

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
    rejectAgreement() {
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

        await this.$store.dispatch('privacyAgreement/rejectTermo');

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
      this.$store.dispatch('privacyAgreement/reset');

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
.important-alert {
  border-left: 4px solid #d92b3f !important;
  background-color: #fafafa !important;
}

.termo-modal {
  max-height: 90vh;
}

.termo-body {
  min-height: 0;
}

.termo-content {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
  overflow: hidden;
}

.termo-text-container {
  flex-grow: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.termo-text {
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.8;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #333;
  text-align: justify;
}

.termo-text::-webkit-scrollbar {
  width: 8px;
}
.termo-text::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.termo-text::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.termo-text::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 600px) {
  .termo-modal {
    max-height: 85vh;
  }
}
</style>
