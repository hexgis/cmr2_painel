<template>
  <v-dialog
    v-model="showDialog"
    max-width="800px"
    overlay-opacity="0.8"
    @click:outside="onClickOutside"
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
        <!-- Alert melhorado -->
        <v-alert
          type="warning"
          outlined
          prominent
          class="mb-4 important-alert"
        >
          <div class="text-h6 font-weight-bold mb-2">
            <v-icon
              left
              color="warning"
            >
              mdi-alert-circle
            </v-icon>
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
                :disabled="loading"
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

    <!-- Modal de Confirmação para Recusa -->
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
      termoTitle: '',
      termoText: '',
      loading: true,
      accepting: false,
      rejecting: false,
      error: null,
      version: '1.0',
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
  },

  watch: {
    value(newVal) {
      if (newVal) {
        this.loadTermoText();
      }
    },
  },

  methods: {
    async loadTermoText() {
      try {
        this.loading = true;
        this.error = null;

        // Usa o store Vuex para carregar o texto
        const termoData = await this.$store.dispatch('termoSigilo/loadTermoText');

        this.termoTitle = termoData.title;
        this.termoText = termoData.text;
        this.version = termoData.version;
      } catch (error) {
        console.error('Erro ao carregar termo:', error);
        this.error = 'Erro ao carregar o termo. Tente novamente.';
      } finally {
        this.loading = false;
      }
    },

    async acceptTermo() {
      try {
        this.accepting = true;
        this.error = null;

        // Usa o store Vuex para aceitar o termo
        await this.$store.dispatch('termoSigilo/acceptTermo', {
          version: this.version,
        });

        this.showDialog = false;
        this.$emit('accepted');
      } catch (error) {
        console.error('Erro ao aceitar termo:', error);
        this.error = (error.response && error.response.data && error.response.data.message)
                    || 'Erro ao processar a aceitação.';
      } finally {
        this.accepting = false;
      }
    },

    async rejectTermo() {
      // Mostrar modal de confirmação
      this.showConfirmReject = true;
    },

    async confirmReject() {
      try {
        this.rejecting = true;
        this.error = null;
        this.showConfirmReject = false;

        // Usa o store Vuex para rejeitar o termo
        await this.$store.dispatch('termoSigilo/rejectTermo');

        // Close modal first
        this.showDialog = false;

        // Emit rejected event
        this.$emit('rejected');

        // Clear store state
        this.$store.dispatch('termoSigilo/reset');

        // Clear any stored data first
        if (process.client) {
          localStorage.removeItem('termo-aceito');
          localStorage.clear(); // Clear all localStorage
          sessionStorage.clear(); // Clear all sessionStorage
        }

        // Force logout
        try {
          await this.$auth.logout();
        } catch (logoutError) {
          console.warn('Erro no logout padrão:', logoutError);
        }

        // Force redirect to login page
        if (process.client) {
          // Use multiple methods to ensure redirect
          this.$router.push('/auth/login').catch(() => {
            window.location.replace('/auth/login');
          });

          // Fallback redirect after a short delay
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 1000);
        }
      } catch (error) {
        console.error('Erro ao recusar termo:', error);
        this.error = (error.response && error.response.data && error.response.data.message)
                    || 'Erro ao processar a recusa.';

        // Even if there's an error, force logout and redirect
        if (process.client) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/auth/login';
        }
      } finally {
        this.rejecting = false;
      }
    },

    cancelReject() {
      this.showConfirmReject = false;
    },

    onClickOutside() {
      // Permite fechar clicando fora, mas emite evento para reabrir quando necessário
      this.$emit('closed-outside');
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
  border-left: 4px solid #ff9800 !important;
  background-color: #fff8e1 !important;
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
