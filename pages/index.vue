<template>
  <div class="hero">
    <HeroBanner
      :hero-title="$t('hero-title')"
      :hero-subtitle="$t('hero-subtitle')"
      background-image="/img/portal/banner-hero.png"
      logo="/img/logo-inteira-antiga-branca.svg"
    />
    <div class="body px-8 px-sm-0">
      <v-row class="body--wrapper">
        <v-col>
          <h2>{{ $t('section1-title') }}</h2>
          <p>
            {{ $t('section1-paragraph') }} <span style="color:#F58A1F; font-weight: bold;">{{ $t('highlighted-text') }}</span>
            {{ $t('section1-continuation') }} <br>
            {{ $t('section1-additional-info') }}
          </p>
          <a
            class="link-primary"
            :href="localePath('/projeto')"
          >{{ $t('learn-more') }}</a>
        </v-col>
        <a href="/">
          <v-img
            max-width="300"
            :src="hero_content01"
          />
        </a>
      </v-row>
      <v-row class="body--wrapper">
        <v-img
          max-width="300"
          :src="hero_content02"
        />
        <v-col>
          <h2>{{ $t('section2-title') }}</h2>
          <p>
            {{ $t('section2-paragraph') }}
          </p>
          <a
            class="link-primary"
            :href="localePath('/como-funciona')"
          >{{ $t('learn-more') }}</a>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<i18n>
{
  "en": {
    "hero-title": "The protection of indigenous territories is an important tool for preserving natural resources and promoting respect for Brazil's cultural diversity.",
    "hero-subtitle": "It is through the permanent possession and exclusive use of the lands they traditionally occupy that indigenous peoples develop their social organization, customs, languages, beliefs, and traditions. With the aim of guaranteeing these original rights, Funai conceived the Remote Monitoring Center (CMR), a project aimed at monitoring indigenous lands and preserving our history and natural resources.",
    "section1-title": "Remote Monitoring Center",
    "section1-paragraph": "Almost 13% of the national territory is made up of indigenous lands.",
    "highlighted-text": "The Remote Monitoring Center (CMR)",
    "section1-continuation": "was developed to enable daily monitoring of occurrences such as deforestation, degradation, land-use change, and occupation in these territories.",
    "section1-additional-info": "The information generated from images captured by the Landsat-8 satellite provides essential support not only for territorial protection planning but also for indigenist work as a whole.",
    "learn-more": "» learn more",
    "section2-title": "How Does It Work?",
    "section2-paragraph": "The Remote Monitoring Center is a platform established by Funai's General Coordination of Territorial Monitoring (CGMT, created by Decree No. 7,056 of December 28, 2009, and reaffirmed by Decree No. 7,778 of July 27, 2012). Its function is to integrate information that underpins the planning of indigenist actions. The database, which has been fed since 2015, provides data extracted from images produced cyclically, with a spatial resolution of 30 meters, where the smallest unit of the image represents 30 meters on the Earth's surface. The almost biweekly surface scan makes it possible to detect changes such as clear-cutting, degradation, deforestation in regeneration areas, and forest fires."
  },
  "pt-br": {
    "hero-title": "A proteção dos territórios indígenas é um importante instrumento de preservação dos recursos naturais e de promoção ao respeito à diversidade cultural do Brasil.",
    "hero-subtitle": "É a partir da posse permanente e uso exclusivo das terras que tradicionalmente ocupam que os povos indígenas desenvolvem sua organização social, costumes, línguas, crenças e tradições. Pensando na garantia desses direitos originários, a Funai idealizou o Centro de Monitoramento Remoto (CMR), um projeto que tem por objetivo monitorar as terras indígenas e preservar a nossa história e recursos naturais.",
    "section1-title": "Centro de Monitoramento Remoto",
    "section1-paragraph": "Quase 13% do território nacional é composto por terras indígenas.",
    "highlighted-text": "O Centro de Monitoramento Remoto (CMR)",
    "section1-continuation": "foi desenvolvido para possibilitar o acompanhamento diário de ocorrências como desmatamento, degradação, mudança de uso e de ocupação do solo nesses territórios.",
    "section1-additional-info": "As informações geradas a partir de imagens captadas pelo satélite Landsat-8 são subsídios indispensáveis não só ao planejamento de ações de proteção territorial, mas ao trabalho indigenista como um todo.",
    "learn-more": "» saiba mais",
    "section2-title": "Como Funciona?",
    "section2-paragraph": "O Centro de Monitoramento Remoto é uma plataforma instituída pela Coordenação Geral de Monitoramento Territorial da Funai (CGMT, criada pelo Decreto nº 7.056, de 28 de dezembro de 2009, e ratificada pelo Decreto nº 7.778, de 27 de julho de 2012). Sua função é integrar informações que fundamentem o planejamento de ações indigenistas. O banco que vem sendo alimentado desde o ano de 2015 disponibiliza dados extraídos de imagens produzidas ciclicamente, com resolução espacial de 30 metros, em que a menor unidade da imagem representa 30 metros na superfície da Terra. A varredura praticamente quinzenal da superfície torna possível a detecção de mudanças como corte raso, degradação, desmatamento em área de regeneração e fogo em floresta."
  }
}
</i18n>
<script>
import HeroBanner from '@/components/panel/HeroBanner';

export default {
  name: 'Portal',
  components: {
    HeroBanner,
  },
  layout: 'portal',
  data() {
    return {
      logo_cmr: '/img/logo-inteira-antiga-branca.svg',
      hero_content01: '/img/portal/mapaaldeias.jpg',
      hero_content02: '/img/portal/imglogoindigenous.jpg',
      showProjectSubmenu: false,
      showHowItWorksSubmenu: false,
      projectSubmenus: [
        { title: 'Conheça o Projeto', route: '/projeto' },
        { title: 'Terras Indígenas', route: '/terras-indigenas' },
      ],
      howItWorksSubmenus: [
        { title: 'Mais informações', route: '/como-funciona' },
        { title: 'Connheça o CMR', route: '/video' },
      ],
    };
  },
};
</script>

<style lang="sass" scoped>
a
  color: #FFCC00
  font-weight: bold
  text-decoration: none

  &:hover
    color: #d92b3f

.v-menu__content
  background-color: white
  color: black

.menu-with-submenu
  position: relative

  .submenu
    position: absolute
    top: 110%
    left: 0
    background-color: white
    width: 250px
    border: 1px solid #ccc
    border-radius: 8px
    padding: 0.5rem
    display: flex
    flex-direction: column
    border-top: 5px solid #F58A1F

    .submenu-item
      padding: 0.5rem 1rem
      color: #333
      text-decoration: none
      transition: all easy-in-out 0.5

      &:hover
        background-color: #F58A1F
        border-radius: 8px
        color: white

.hero
  &--banner
    height: 700px
    background-image: url('/img/portal/banner-hero.png')
    background-position: bottom

  &--nav-bar
    display: flex
    gap: 2rem

  &--content
    max-width: 450px
    margin: 2% 6%

    h1
      color: #FFCC00
      line-height: 1.2
      font-size: 22px
      font-weight: 600

    p
      color: white
      font-size: 14px
      line-height: 22px
      padding-top: 1rem

  &--wrapper
    width: 80%

    &-row
      width: 100%
      margin: 0 2%

  .body
    justify-content: center
    align-items: center
    width: 100%
    display: flex
    flex-direction: column

    &--wrapper
      align-items: center
      justify-content: center
      padding: 3rem 0
      gap: 2rem

      @media screen and (min-width: 600px)
        max-width: 55%

</style>
