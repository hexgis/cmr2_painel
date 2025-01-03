<template>
    <v-app>
        <v-main>
            <div>
                <div class="background" style="height: 80vh">
                    <nuxt />
                </div>
                <v-row class="primary">
                    <v-col />
                </v-row>
                <v-row class="info">
                    <div class="help-cards-container">
                        <v-row>
                            <v-col cols="4">
                                <v-card
                                    class="ml-15 info card"
                                    flat
                                    width="300"
                                    layout="row"
                                    layout-wrap
                                    layout-align="space-between"
                                >
                                    <v-col class="pt-1">
                                        <v-img
                                            class="logo"
                                            src="/img/funai.svg"
                                        />
                                    </v-col>
                                </v-card>
                            </v-col>
                            <v-col
                                cols="6"
                                class="mobile-help-column"
                                v-show="isSmallScreen"
                            >
                                <v-row>
                                    <v-col class="card-mobile">
                                        {{ $t('we-are-help-title') }}
                                        <a
                                            :href="localePath(helpLinks.cmrProjectUrl)"
                                            target="_blank"
                                        >
                                            {{ $t('we-are-help-link') }}</a
                                        ></v-col
                                    >
                                </v-row>
                                <v-row>
                                    <v-col class="card-mobile">
                                        {{ $t('access-help-title') }}
                                        <a
                                            :href="localePath(helpLinks.requestAcessUrl)"
                                            target="_blank"
                                        >
                                            {{ $t('access-help-link') }}</a
                                        ></v-col
                                    >
                                </v-row>
                                <v-row>
                                    <v-col class="card-mobile">
                                        {{ $t('project-help-title') }}
                                        <a
                                            :href="localePath(helpLinks.cmrTalkToUs)"
                                            target="_blank"
                                        >
                                            {{ $t('project-help-link') }}</a
                                        ></v-col
                                    >
                                </v-row>
                                <v-row>
                                    <v-col class="card-mobile">
                                        {{ $t('manual-help-title') }}
                                        <a
                                            :href="helpLinks.cmrManualUrl"
                                            target="_blank"
                                        >
                                            {{ $t('manual-help-link') }}</a
                                        ></v-col
                                    >
                                </v-row>
                            </v-col>
                        </v-row>
                    </div>
                    <v-col cols="2">
                        <v-card
                            width="300"
                            class="info card"
                            flat
                            layout="row"
                            layout-wrap
                            layout-align="space-between"
                            v-show="!isSmallScreen"
                        >
                            <v-card-title class="card-title">
                                {{ $t('we-are-help-title') }}
                            </v-card-title>
                            <v-card-subtitle class="card-subtitle">
                                <p class="link-footer-dark text-h7">
                                    <a
                                        :href="localePath(helpLinks.cmrProjectUrl)"
                                        target="_blank"
                                        >{{ $t('we-are-help-link') }}</a
                                    >
                                </p>
                            </v-card-subtitle>
                        </v-card>
                    </v-col>
                    <v-col cols="2">
                        <v-card
                            width="300"
                            flat
                            class="info card"
                            layout="row"
                            layout-wrap
                            layout-align="space-between"
                            v-show="!isSmallScreen"
                        >
                            <v-card-title class="card-title">
                                {{ $t('access-help-title') }}
                            </v-card-title>
                            <v-card-subtitle class="card-subtitle">
                                <p class="link-footer-dark text-h7">
                                    <a
                                        :href="localePath(helpLinks.requestAcessUrl)"
                                        target="_blank"
                                    >
                                        {{ $t('access-help-link') }}</a
                                    >
                                </p>
                            </v-card-subtitle>
                        </v-card>
                    </v-col>
                    <v-col cols="2">
                        <v-card
                            width="300"
                            flat
                            class="info card"
                            layout="row"
                            layout-wrap
                            layout-align="space-between"
                            v-show="!isSmallScreen"
                        >
                            <v-card-title class="card-title">
                                {{ $t('project-help-title') }}
                            </v-card-title>
                            <v-card-subtitle class="card-subtitle">
                                <p class="link-footer-dark text-h7">
                                    <a
                                        :href="localePath(helpLinks.cmrTalkToUs)"
                                        target="_blank"
                                    >
                                        {{ $t('project-help-link') }}</a
                                    >
                                </p>
                            </v-card-subtitle>
                        </v-card>
                    </v-col>
                    <v-col v-if="userLogged" cols="2">
                        <v-card
                            flat
                            width="300"
                            class="info card"
                            layout="row"
                            layout-wrap
                            layout-align="space-between"
                            v-show="!isSmallScreen"
                        >
                            <v-card-title class="card-title">
                                {{ $t('manual-help-title') }}
                            </v-card-title>
                            <v-card-subtitle class="card-subtitle">
                                <p class="link-footer-dark text-h7">
                                    <a
                                        :href="helpLinks.cmrManualUrl"
                                        target="_blank"
                                    >
                                        {{ $t('manual-help-link') }}</a
                                    >
                                </p>
                            </v-card-subtitle>
                        </v-card>
                    </v-col>
                </v-row>
            </div>
        </v-main>
    </v-app>
</template>

<i18n>
{
  "en": {
    "manual-help-title": "View user manual",
    "manual-help-link": "User manual",
    "project-help-title": "Contact the project",
    "project-help-link": "Contact us",
    "access-help-title": "Request access",
    "access-help-link": "Access here",
    "access-help-text": "Submit the form to the CMR team for analysis",
    "we-are-help-title": "Who we are?",
    "we-are-help-link": "Discover our project"
  },
  "pt-br": {
    "manual-help-title": "Visualizar manual do Usuário",
    "manual-help-link": "Manual",
    "project-help-title": "Contate o Projeto",
    "project-help-link": "Fale conosco",
    "access-help-title": "Solicite acesso",
    "access-help-link": "Acesse aqui",
    "access-help-text": "Envie para a equipe do CMR o formulário para análise e liberação. ",
    "we-are-help-title": "Quem somos?",
    "we-are-help-link": "Conheça nosso projeto"
  }
}
</i18n>

<script>
export default {
    name: 'App',

    data() {
        return {
            userLogged: true,
            isSmallScreen: false,
            helpLinks: {
                cmrManualUrl:
                    'https://cmr.funai.gov.br/api/media/Manual/Mapa Interativo/CMR_Manual_2021_V1.7.1.pdf',
                cmrProjectUrl: '/projeto/',
                cmrTalkToUs: '/contato/',
                requestAcessUrl: '/cadastro/'
            },
        }
    },

    mounted() {
        this.checkScreenSize()
        window.addEventListener('resize', this.checkScreenSize)
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.checkScreenSize)
    },

    methods: {
        checkScreenSize() {
            this.isSmallScreen = window.innerWidth <= 768
        },
    },

    head: () => ({
        title: 'Skyviewer',
    }),
}
</script>

<style scoped lang="scss">
.background {
    background-image: url('/img/login.jpg');
    background-size: cover;
}

.link-footer-dark a,
.link-footer a {
    cursor: pointer;
    color: #d92b3f;
    text-decoration: underline;
}

.logo {
    width: 70px;
}

.card-title {
    font-size: 0.9vw;
    font-weight: normal;
}

.card-subtitle {
    font-size: 0.8vw;
}

@media (max-width: 768px) {
    .mobile-help-column {
        margin-left: 0px;
        margin-top: 20px;
        z-index: 9999;
    }

    .help-cards-container {
        margin-left: -50px;
        margin-top: 4px;
    }

    .card-mobile {
        font-size: 3.2vw;
        padding-block: 3px;
    }
}
</style>
