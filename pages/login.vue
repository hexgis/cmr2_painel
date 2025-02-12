<template>
    <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4 lg3 xl3>
            <v-form @submit.prevent="login">
                <v-card
                    tile
                    class="elevation-6 login-card"
                    style="margin-top: 40%"
                >
                    <div v-if="this.$vuetify.theme.dark">
                        <v-toolbar flat dark color="black">
                            <v-progress-linear
                                v-show="isLoading"
                                class="my-0 progress"
                                :indeterminate="true"
                                height="3"
                                color="primary"
                            />
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
                            <v-progress-linear
                                v-show="isLoading"
                                class="my-0 progress"
                                :indeterminate="true"
                                height="3"
                                color="primary"
                            />
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
                    <div v-if="!showResetPasswordModal">
                        <v-card-text class="px-6 pt-6 pb-0">
                            <v-alert
                                v-show="showAuthenticationError"
                                type="error"
                                class="mb-3"
                            >
                                {{ $t('error') }}
                            </v-alert>

                            <div class="text-subtitle-1 text-center mb-2">
                                {{ $t('title') }}
                            </div>

                            <v-text-field
                                v-model="username"
                                outlined
                                prepend-inner-icon="mdi-account"
                                :label="$t('user-label')"
                                single-line
                            />
                            <v-text-field
                                v-model="password"
                                outlined
                                prepend-inner-icon="mdi-lock"
                                :label="$t('password-label')"
                                single-line
                                type="password"
                            />
                        </v-card-text>

                        <v-card-actions class="justify-center pa-6 flex-column">
                            <v-btn block outlined color="primary" type="submit">
                                {{ $t('login-button') }}
                            </v-btn>
                        </v-card-actions>
                        <div
                            class="d-flex align-md-center justify-md-center pb-4"
                            @click="openResetPasswordModal"
                        >
                            <span class="forgot-password-btn"
                                >{{ $t('forgot-password-btn') }}
                                <strong>{{
                                    $t('click-here-btn')
                                }}</strong></span
                            >
                        </div>
                    </div>
                    <div v-else class="pa-4">
                        <p class="pa-2">
                            {{ $t('reset-password-instructions') }}
                        </p>
                        <v-responsive class="mx-auto">
                            <v-text-field
                                v-model="email"
                                class="pa-4 w-100"
                                hide-details="auto"
                                :label="$t('email-label')"
                                :placeholder="$t('email-placeholder')"
                                type="email"
                                @keydown.enter.prevent="handleResetPassword"
                               ></v-text-field
                            >
                        </v-responsive>
                        <p class="pa-2" style="font-size: 12px">
                            {{ $t('email-note') }}
                        </p>
                        <v-row class="pb-4 mt-10">
                            <v-btn
                                class="ml-4"
                                color="primary"
                                @click="handleResetPassword"
                                >{{ $t('reset-access-button') }}</v-btn
                            >
                            <v-spacer />
                            <v-btn
                            class="mr-4"
                                text
                                @click="showResetPasswordModal = false"
                                >{{ $t('back-button') }}</v-btn
                            >
                        </v-row>
                    </div>
                </v-card>
                <v-dialog v-model="showStatusModal" max-width="550">
                    <v-card>
                        <v-card-title
                            :style="{
                                backgroundColor:
                                    statusTitle === $t('success')
                                        ? '#ffcc00'
                                        : '#D92B3F',
                            }"
                        >
                            {{ statusTitle }}
                        </v-card-title>
                        <v-card-text class="pt-4">{{
                            statusMessage
                        }}</v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                color="primary"
                                text
                                @click="showStatusModal = false"
                                >{{ $t('ok-button') }}</v-btn
                            >
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-form>
        </v-flex>
    </v-layout>
</template>

<i18n>
{
    "en": {
        "title": "Access credentials",
        "error": "Incorrect username or password",
        "user-label": "Username",
        "password-label": "Password",
        "login-button": "Login",
        "forgot-password-btn": "Forgot password?",
        "click-here-btn": "Click here.",
        "reset-password-instructions": "To receive instructions for generating a new password via email, please   enter your login information below.",
        "email-label": "Email",
        "email-placeholder": "email@funai.com.br",
        "email-note": "Attention: Funai employees should enter the full email with @funai.gov.br",
        "reset-access-button": "Recover Access",
        "back-button": "Back",
        "success": "Success",
        "ok-button": "OK",
        "email-not-found": "Email not found",
        "email-found": "A recovering email was sent to",
        "check-email": "Please, check your email.",
        "email-not-found-message": "Please check the email provided and try again.",
        "generic-error": "Error",
        "generic-error-message": "There was an issue sending the email. Please try again."
    },
    "pt-br": {
        "title": "Credenciais de acesso",
        "error": "Usuário ou senha incorretos",
        "user-label": "Usuário",
        "password-label": "Senha",
        "login-button": "Entrar",
        "forgot-password-btn": "Esqueceu sua senha?",
        "click-here-btn": "Clique aqui.",
        "reset-password-instructions": "Para recebimento das instruções para geração de uma nova senha por  email, digite seu login de acesso no campo abaixo.",
        "email-label": "Email",
        "email-placeholder": "email@funai.com.br",
        "email-note": "Atenção: Servidores da Funai devem inserir o email completo com @funai.gov.br",
        "reset-access-button": "Recuperar Acesso",
        "back-button": "Voltar",
        "success": "Sucesso",
        "ok-button": "OK",
        "email-found": "Um email de recuperação foi enviado para",
        "check-email": "Por favor, verifique seu email.",
        "email-not-found": "Email não encontrado",
        "email-not-found-message": "Verifique o email informado e tente novamente.",
        "generic-error": "Erro",
        "generic-error-message": "Houve um problema ao enviar o email. Tente novamente."
    }
}
</i18n>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'Login',
    layout: 'login',

    middleware: false,

    data: () => ({
        username: '',
        password: '',
        isLoading: false,
        showAuthenticationError: false,
        appName: process.env.APP_NAME,
        showResetPasswordModal: false,
        email: '',
        showStatusModal: false,
        statusTitle: '',
        statusMessage: '',
    }),

    computed: {
        theme() {
            return this.$vuetify.theme.dark ? 'dark' : 'light'
        },
    },

    methods: {
        login() {
            // Verifica se o modal de reset de senha está aberto
            if (this.showResetPasswordModal) {
                return // Não faz nada se o modal de reset de senha estiver aberto
            }

            this.isLoading = true
            this.showAuthenticationError = false

            this.authenticate({
                username: this.username,
                password: this.password,
            })
                .then((_) => {
                    this.isLoading = false
                    this.$router.go(this.localePath('/'))
                })
                .catch((_) => {
                    this.isLoading = false
                    this.showAuthenticationError = true
                })
        },
        async handleResetPassword() {
            try {
                await this.$api.$post('auth/password-reset/', {
                    email: this.email,
                })
                this.showStatusModal = true
                this.statusTitle = this.$t('success')
                this.statusMessage = `${this.$t('email-found')} ${
                    this.email
                }. ${this.$t('check-email')}`
            } catch (err) {
                this.showStatusModal = true
                if (err.response && err.response.status === 400) {
                    this.statusTitle = this.$t('email-not-found')
                    this.statusMessage = this.$t('email-not-found-message')
                } else {
                    this.statusTitle = this.$t('generic-error')
                    this.statusMessage = this.$t('generic-error-message')
                }
            }
        },

        openResetPasswordModal() {
            this.showResetPasswordModal = true
            this.username = '' // Limpa o campo de usuário
            this.password = '' // Limpa o campo de senha
        },

        ...mapActions('auth', ['authenticate']),
    },

    head: () => ({
        title: 'Login',
    }),
}
</script>

<style scoped>
.progress {
    position: fixed;
    z-index: 100;
    left: 0px;
    top: 0px;
}
.center {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 80%;
}

.forgot-password-btn {
    cursor: pointer;
    color: #757575;
}

.forgot-password-btn:hover {
    color: #d92b3f;
    text-decoration: underline;
}

@media (max-width: 768px) {
    .login-card {
        width: 60%;
        margin-top: 25% !important;
        margin-left: auto;
        margin-right: auto;
    }
    .logo-img {
        width: 150px !important;
    }
}
</style>
