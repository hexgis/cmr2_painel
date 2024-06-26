<template>
    <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4 lg3 xl3>
            <v-form @submit.prevent="login">
                <v-card tile class="elevation-6 login-card" style="margin-top: 50%">
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
                                        class="logo-img "
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
                </v-card>
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
        "login-button": "Login"
    },
    "pt-br": {
        "title": "Credenciais de acesso",
        "error": "Usuário ou senha incorretos",
        "user-label": "Usuário",
        "password-label": "Senha",
        "login-button": "Entrar"
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
    }),

    computed: {
        theme() {
            return this.$vuetify.theme.dark ? 'dark' : 'light'
        },
    },

    methods: {
        login() {
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


@media (max-width: 768px) {
.login-card {
    width: 60%;
    margin-top: 25% !important;
    margin-left: auto;
    margin-right: auto;
}
.logo-img  {
    width: 150px !important;
}
}
</style>
