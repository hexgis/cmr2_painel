<template>
  <v-layout
    align-center
    justify-center
  >
    <v-flex
      xs12
      sm8
      md4
      lg3
      xl3
    >
      <v-form @submit.prevent="resetPassword">
        <v-card
          tile
          class="elevation-6 login-card"
          style="margin-top: 40%"
        >
          <v-toolbar
            flat
            dark
            :color="$vuetify.theme.dark ? 'black' : 'white'"
          >
            <v-toolbar-title class="flex text-center pa-5">
              <v-container class="d-flex justify-center">
                <v-img
                  max-width="200"
                  class="logo-img"
                  contain
                  :src="$vuetify.theme.dark ? '/img/logo-inteira-antiga-branca.svg' : '/img/logo-inteira-antiga.svg'"
                />
              </v-container>
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text class="px-6 pt-8 pb-0">
            <div class="text-h6 text-center mb-2">
              {{ $t('title') }}
            </div>

            <span
              v-if="!isValidPassword"
              style="color: #d92b3f"
              class="text-subtitle-2"
            >
              {{ $t('password-validation-error') }}
            </span>

            <v-text-field
              v-model="password"
              :append-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              outlined
              prepend-inner-icon="mdi-lock"
              :label="$t('password-label')"
              :type="showPassword ? 'text' : 'password'"
              single-line
              @click:append="togglePasswordVisibility"
            />

            <span
              v-if="!passwordsMatch && password && confirmPassword"
              style="color: #D92B3F"
              class="text-subtitle-2"
            >
              {{ $t('not-matching-password') }}
            </span>

            <v-text-field
              v-model="confirmPassword"
              :append-icon="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              outlined
              prepend-inner-icon="mdi-lock"
              :label="$t('password-confirm-label')"
              :type="showConfirmPassword ? 'text' : 'password'"
              single-line
              @click:append="toggleConfirmPasswordVisibility"
            />
          </v-card-text>

          <v-card-actions class="justify-center pa-4 flex-column">
            <v-btn
              block
              color="primary"
              :disabled="!isValidPassword || !passwordsMatch"
              @click="resetPassword"
            >
              {{ $t('reset-password') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>

      <v-dialog
        v-model="showStatusModal"
        max-width="550"
      >
        <v-card>
          <v-card-title :style="{ backgroundColor: isSuccess ? '#ffcc00' : '#D92B3F' }">
            {{ statusTitle }}
          </v-card-title>
          <v-card-text class="pt-4">
            {{ statusMessage }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              text
              @click="goToLogin"
            >
              {{ $t('ok-button') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'Confirmar',
  layout: 'login',
  data() {
    return {
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      showStatusModal: false,
      statusTitle: '',
      statusMessage: '',
      isSuccess: false,
    };
  },
  head() {
    return {
      title: 'Redefinir Senha',
    };
  },
  computed: {
    confirmationCode() {
      return this.$route.query.code || '';
    },
    passwordsMatch() {
      return this.password === this.confirmPassword && this.password !== '';
    },
    isValidPassword() {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(this.password);
    },
  },
  methods: {
    goToLogin() {
      this.$router.push(this.localePath('/login'));
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    async resetPassword() {
      try {
        await this.$api.$post(`auth/confirmar/?code=${this.confirmationCode}`, {
          new_password: this.password,
          confirm_password: this.confirmPassword,
          code: this.confirmationCode,
        });

        this.isSuccess = true;
        this.statusTitle = this.$t('success');
        this.statusMessage = this.$t('password-changed');
        this.showStatusModal = true;
      } catch (err) {
        this.isSuccess = false;
        this.statusTitle = this.$t('error-label');
        this.statusMessage = this.$t('token-expired-message');
        this.showStatusModal = true;
      }
    },
  },
};
</script>

<i18n>
{
  "en": {
    "title": "Password reset",
    "error": "Incorrect username or password",
    "password-label": "New password",
    "password-confirm-label": "Confirm Password",
    "reset-password": "Reset Password",
    "success": "Success",
    "ok-button": "OK",
    "not-matching-password": "Please make sure that your passwords match.",
    "password-not-changed": "An error occurred while processing your request. Please try again.",
    "error-label": "Error",
    "token-expired-message": "It seems your validation token has expired. Please request a new token to continue.",
    "password-changed": "Your password has been changed! Sign in with your new password to access CMR.",
    "password-validation-error": "The password must be at least 8 characters long and include uppercase, lowercase, numbers and special characters."
  },
  "pt-br": {
    "title": "Redefinição de senha",
    "error": "Usuário ou senha incorretos",
    "password-label": "Nova senha",
    "password-confirm-label": "Confirmar senha",
    "reset-password": "Alterar senha",
    "success": "Sucesso",
    "ok-button": "OK",
    "not-matching-password": "Por favor, certifique-se que suas senhas são iguais.",
    "password-not-changed": "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
    "error-label": "Erro",
    "token-expired-message": "Parece que seu token de validação expirou. Por favor, solicite um novo token para continuar.",
    "password-changed": "Sua senha foi alterada! Faça login com sua nova senha para acessar o CMR.",
    "password-validation-error": "A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas e minúsculas, números e caracteres especiais."
  }
}
</i18n>
