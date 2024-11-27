<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4 lg3 xl3>
      <v-form @submit.prevent="login">
        <v-card tile class="elevation-6 login-card" style="margin-top: 40%">
          <div v-if="this.$vuetify.theme.dark">
            <v-toolbar flat dark color="black">
              <v-toolbar-title class="flex text-center pa-5">
                <v-container class="d-flex justify-center">
                  <v-img
                    max-width="200"
                    class="logo-img"
                    contain
                    src="/img/logo-inteira-antiga-branca.svg"
                  />
                </v-container>
              </v-toolbar-title>
            </v-toolbar>
          </div>
          <div v-if="!this.$vuetify.theme.dark">
            <v-toolbar flat dark color="white">
              <v-toolbar-title class="flex text-center pa-5">
                <v-container class="d-flex justify-center">
                  <v-img
                    max-width="200"
                    class="logo-img"
                    contain
                    src="/img/logo-inteira-antiga.svg"
                  />
                </v-container>
              </v-toolbar-title>
            </v-toolbar>
          </div>
          <div>
            <v-card-text class="px-6 pt-8 pb-0">
            <div class="text-h6 text-center mb-2">
              {{ $t('title') }} <br />
            </div>
            <span style="color: #d92b3f" class="text-subtitle-2" v-if="!isValidPassword">
              {{ $t('password-validation-error') }}
            </span>
            <v-text-field
              :append-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append="togglePasswordVisibility"
              v-model="password"
              outlined
              prepend-inner-icon="mdi-lock"
              :label="$t('password-label')"
              :type="showPassword ? 'text' : 'password'"
              single-line
            />
            <span style="color: #D92B3F" class="text-subtitle-2" v-if="!passwordsMatch && password && confirmPassword">{{ $t('not-matching-password')}}</span>
            <v-text-field
              :append-icon="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append="toggleConfirmPasswordVisibility"
              v-model="confirmPassword"
              outlined
              prepend-inner-icon="mdi-lock"
              :label="$t('password-confirm-label')"
              :type="showConfirmPassword ? 'text' : 'password'"
              single-line
            />
            <div style="color: #757575" class="text-subtitle-1 text-center mb-2">
              {{ confirmationCode }}
            </div>
          </v-card-text>
          </div>
          <v-card-actions class="justify-center pa-4 flex-column">
          <v-btn block color="primary" :disabled="!isValidPassword || !passwordsMatch" @click="resetPassword">
              {{ $t('reset-password') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
      <v-dialog v-model="showStatusModal" max-width="550">
         <v-card>
             <v-card-title :style="{ backgroundColor: statusTitle === $t('success') ? '#ffcc00' :  '#D92B3F' }">
                 {{ statusTitle }}
             </v-card-title>
             <v-card-text class="pt-4">{{ statusMessage }}</v-card-text>
             <v-card-actions>
                 <v-spacer></v-spacer>
                 <v-btn color="primary" text :to="localePath('/login')">{{ $t('ok-button') }}</v-btn>
             </v-card-actions>
         </v-card>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>

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
    "password-not-changed": "An error ocurred while processing your request. Please try again.",
    "error-label" : "Error",
    "token-expired-message": "It seems your validation token has expired. Please request a new token to continue.",
    "password-changed": "Your password has been changed! Sign in with your new password to access CMR.",
    "password-validation-error": "A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas e minúsculas, números e caracteres especiais."
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
    "error-label" : "Erro",
    "token-expired-message" : "Parece que seu token de validação expirou. Por favor, solicite um novo token para continuar.",
    "password-changed" : "Sua senha foi alterada! Faça login com sua nova senha para acessar o CMR.",
    "password-validation-error": "A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas e minúsculas, números e caracteres especiais."
  }
}
</i18n>

<script>
import axios from 'axios';
export default {
  name: 'Confirmar',
  layout: 'login',
  head() {
    return {
      title: 'Redefinir Senha',
    };
  },
  data() {
    return {
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      showStatusModal: false,
      statusTitle: '',
      statusMessage: ''
    };
  },
  computed: {
    confirmationCode() {
      return this.$store.state.auth.confirmationCode;
    },
    passwordsMatch() {
      return this.password === this.confirmPassword && this.password !== '';
    },
    isValidPassword() {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        return passwordRegex.test(this.password)
    },
  },
  methods: {
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
          code: this.confirmationCode
        });

        this.statusTitle = this.$t('success');
        this.statusMessage = this.$t('password-changed');
        this.showStatusModal = true;

      } catch (err) {
          this.statusTitle = this.$t('error-label');
          this.statusMessage = this.$t('token-expired-message');
          this.showStatusModal = true;
      }
    }
  },
  beforeDestroy() {
    this.password = '';
    this.confirmPassword = '';
  }
};
</script>