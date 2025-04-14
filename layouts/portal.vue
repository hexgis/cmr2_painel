<template>
  <v-app id="portal">
    <v-main>
      <div>
        <div>
          <nuxt />
        </div>
        <CarouselDefault class="mt-16" />
        <v-row class="primary--row">
          <v-row class="primary--row-content align-center">
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
        <div class="info pa-6 d-flex justify-center">
          <!-- <div class="help-cards-container"> -->
          <v-row
            class="justify-center align-center"
            style="height: 150px; width: 80%"
          >
            <v-col
              cols="12"
              md="4"
            >
              <div class="d-flex justify-space-around flex-wrap">
                <v-img
                  contain
                  class="logo"
                  src="/img/portal/acesso-informacao.png"
                  style="cursor: pointer"
                  max-width="150px"
                  @click="handleImageClick('acesso-informacao')"
                />
                <v-img
                  contain
                  class="logo"
                  src="/img/logo-cmr.svg"
                  max-width="150px"
                />
                <v-img
                  contain
                  class="logo"
                  src="/img/portal/ne-logo.png"
                  max-width="150px"
                />
                <v-img
                  contain
                  class="logo"
                  src="/img/funai.svg"
                  style="cursor: pointer"
                  max-width="150px"
                  @click="handleImageClick('funai')"
                />
              </div>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-row class="justify-space-around">
                <v-col
                  v-if="!isLoggedIn"
                  cols="6"
                  md="3"
                >
                  <p class="mb-2">
                    {{ $t('access-help-title') }}
                  </p>
                  <a
                    :href="localePath(helpLinks.requestAcessUrl)"
                    target="_blank"
                  >
                    {{ $t('access-help-link') }}</a>
                </v-col>
                <v-col
                  cols="6"
                  md="3"
                >
                  <p class="mb-2">
                    {{ $t('project-help-title') }}
                  </p>
                  <a
                    :href="localePath(helpLinks.cmrTalkToUs)"
                    target="_blank"
                  >
                    {{ $t('project-help-link') }}</a>
                </v-col>
                <v-col
                  v-if="isLoggedIn"
                  cols="6"
                  md="3"
                >
                  <p class="mb-2">
                    {{ $t('manual-help-title') }}
                  </p>
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
import { mapGetters } from 'vuex';
import CarouselDefault from '../components/panel/CarouselDefault';

export default {
  name: 'App',
  components: {
    CarouselDefault,
  },
  data() {
    return {
      isSmallScreen: false,
      helpLinks: {
        cmrManualUrl:
          'https://cmr.funai.gov.br/api/media/Manual/Mapa Interativo/CMR_Manual_2021_V1.7.1.pdf',
        cmrProjectUrl: '/o-projeto/',
        cmrTalkToUs: '/contato/',
        requestAcessUrl: '/cadastro/',
      },
    };
  },

  head: () => ({
    title: 'CMR',
  }),

  computed: {
    ...mapGetters('auth', ['isLoggedIn']),
  },

  mounted() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize);
  },

  methods: {
    handleImageClick(type) {
      if (type === 'acesso-informacao') {
        window.open('https://www.gov.br/funai/pt-br/acesso-a-informacao', '_blank', 'noopener,noreferrer');
      } else if (type === 'funai') {
        window.open('https://www.gov.br/funai', '_blank', 'noopener,noreferrer');
      }
    },

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
    max-width: 80%
    @media (min-width: 960px)
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
