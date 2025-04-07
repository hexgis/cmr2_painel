<template>
  <v-app id="portal">
    <v-main>
      <div>
        <div>
          <nuxt />
        </div>
        <CarouselDefault class="mt-16" />
        <v-row class="primary--row">
          <v-row class="primary--row-content">
            <v-col>
              <p>{{ $t('doubts-suggestions') }}</p>
              <a href="mailto:cmr@funai.gov.br">cmr@funai.gov.br</a>
            </v-col>
            <v-col>
              <p>{{ $t('photos-by') }}</p>
              <p><strong>{{ $t('photo-credits') }}</strong></p>
            </v-col>
          </v-row>
        </v-row>
        <v-row class="info">
          <div class="help-cards-container">
            <v-row>
              <v-col
                cols="10"
                class="mt-5"
              >
                <v-card
                  class="info card"
                  flat
                  layout="row"
                  layout-wrap
                  layout-align="space-around"
                >
                  <div class="logo--wrapper">
                    <v-img
                      contain
                      class="logo"
                      src="/img/portal/acesso-informacao.png"
                    />
                    <v-img
                      contain
                      class="logo"
                      src="/img/logo-cmr.svg"
                    />
                    <v-img
                      contain
                      class="logo"
                      src="/img/portal/ne-logo.png"
                    />
                    <v-img
                      contain
                      class="logo"
                      src="/img/funai.svg"
                    />
                  </div>
                </v-card>
              </v-col>
              <v-col
                v-show="isSmallScreen"
                cols="6"
                class="mobile-help-column"
              >
                <v-row>
                  <v-col class="card-mobile">
                    {{ $t('we-are-help-title') }}
                    <a
                      :href="localePath(helpLinks.cmrProjectUrl)"
                      target="_blank"
                    >
                      {{ $t('we-are-help-link') }}</a>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="card-mobile">
                    {{ $t('access-help-title') }}
                    <a
                      :href="localePath(helpLinks.requestAcessUrl)"
                      target="_blank"
                    >
                      {{ $t('access-help-link') }} fasdf</a>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="card-mobile">
                    {{ $t('project-help-title') }}
                    <a
                      :href="localePath(helpLinks.cmrTalkToUs)"
                      target="_blank"
                    >
                      {{ $t('project-help-link') }}</a>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="card-mobile">
                    {{ $t('manual-help-title') }}
                    <a
                      :href="helpLinks.cmrManualUrl"
                      target="_blank"
                    >
                      {{ $t('manual-help-link') }}</a>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
          <v-col cols="2">
            <v-card
              v-show="!isSmallScreen"
              width="200"
              flat
              class="info card"
              layout="row"
              layout-wrap
              layout-align="space-between"
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
                    {{ $t('access-help-link') }}</a>
                </p>
              </v-card-subtitle>
            </v-card>
          </v-col>
          <v-col
            v-if="userLogged"
            cols="2"
          >
            <v-card
              v-show="!isSmallScreen"
              flat
              width="275"
              class="info card"
              layout="row"
              layout-wrap
              layout-align="space-between"
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
                    {{ $t('manual-help-link') }}</a>
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
    "doubts-suggestions": "Doubts and suggestions",
    "photos-by": "Photographs by:",
    "photo-credits": "Mário Vilela, Juvenal Pereira, Anderson Schneider and Funai.",
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
    "doubts-suggestions": "Dúvidas e sugestões",
    "photos-by": "Fotografias por:",
    "photo-credits": "Mário Vilela, Juvenal Pereira, Anderson Schneider e Funai.",
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
import CarouselDefault from '../components/panel/CarouselDefault';

export default {
  name: 'App',
  components: {
    CarouselDefault,
  },
  data() {
    return {
      userLogged: true,
      isSmallScreen: false,
      helpLinks: {
        cmrManualUrl:
          'https://cmr.funai.gov.br/api/media/Manual/Mapa Interativo/CMR_Manual_2021_V1.7.1.pdf',
        cmrProjectUrl: '/o-projeto/',
        cmrTalkToUs: '/contato/',
        requestAcessUrl: '/cadastro/'
      },
    };
  },

  head: () => ({
    title: 'CMR',
  }),

  mounted() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize);
  },

  methods: {
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth <= 768;
    },
  },
};
</script>

<style scoped lang="sass">
#portal
  height: 100vh
  overflow-y: auto
  overflow-x: hidden

.link-footer-dark a,
.link-footer a
  cursor: pointer
  color: #d92b3f
  text-decoration: underline

.logo--wrapper
  display: flex

.logo
  height: 80px
  width: 150px

.card-title
  font-size: 0.9vw
  font-weight: normal

.card-subtitle
  font-size: 0.8vw

.primary--row
  padding: 2rem 0
  color: white
  background: #D92B3F
  justify-content: center

  &-content
    max-width: 50%

    a
      color: #FFCC00
      font-weight: bold
      text-decoration: none

    p
      margin-bottom: 0

@media (max-width: 768px)
  .mobile-help-column
    margin-left: 0px
    margin-top: 20px
    z-index: 9999

  .help-cards-container
    margin-left: -50px
    margin-top: 4px

  .card-mobile
    font-size: 3.2vw
    padding-block: 3px

</style>
