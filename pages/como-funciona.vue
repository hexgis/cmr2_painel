<template>
  <div>
    <HeroBanner
      :hero-title="$t('hero-title')"
      background-image="/img/portal/banner-como-funciona.jpg"
      :hasCTA="false"
    />
    <div class="d-flex justify-sm-center">
      <v-row class="content">
        <v-col>
          <h2>{{ $t('cmr-title-1') }}</h2>
          <p>{{ $t('cmr-paragraph-1') }}</p>
          <p>{{ $t('cmr-paragraph-2') }}</p>
          <p>{{ $t('cmr-paragraph-3') }}</p>
        </v-col>
        <v-col style="max-width: 45%;">
          <v-img src="/img/portal/foto-satelite.png" />
          <h3>{{ $t('cmr-title-2') }}</h3>
          <p>{{ $t('cmr-paragraph-4') }}</p>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<i18n>
{
  "en": {
    "hero-title": "How it works",
    "cmr-title-1": "Securing our past",
    "cmr-paragraph-1": "The Remote Monitoring Center is a platform established by the General Coordination of Territorial Monitoring of Funai (CGMT, created by Decree No. 7,056, of December 28, 2009, and ratified by Decree No. 7,778, of July 27, 2012). Its function is to integrate information that supports the planning of indigenous actions. The database, which has been fed since 2015, provides data extracted from images produced cyclically with a spatial resolution of 30 meters, where the smallest unit of the image represents 30 meters on the Earth's surface. The nearly biweekly scanning of the surface allows for the detection of changes such as clear-cutting, degradation, deforestation in regeneration areas, and forest fires.",
    "cmr-paragraph-2": "The functionality 'Interactive Map' (publicly available) allows for quick and easy visualization of territories, providing the official names of indigenous lands, their physical boundaries, the biomes to which they belong, etc. Information about the surroundings of these lands (overlap and/or juxtaposition with conservation units, quilombola areas, rural settlements, certified properties, border strips, among others) allows for predicting and assessing administrative implications and related environmental impacts. The Map also includes data published by INPE – which, in addition to being the Federal Government's reference for detecting deforestation and environmental degradation, is of utmost relevance to Funai.",
    "cmr-paragraph-3": "In the interface restricted to authenticated users, the platform offers sessions with confidential data selectable by Indigenous Land or by decentralized Funai units. Such information – and, especially, the possibility of cross-referencing it – supports the production of technical documents and work plans.",
    "cmr-title-2": "Revolutionary and vital",
    "cmr-paragraph-4": "Another convenience offered by the CMR is access via smartphones and tablets, as its functionalities are developed with the same premises as app developers for these devices. Even during field operations, technicians can access the portal. This underpins and directs the work, as it ensures access to up-to-date data and precise indicators of the most critical areas."
  },
  "pt-br": {
    "hero-title": "Como funciona",
    "cmr-title-1": "Assegurando nosso passado",
    "cmr-paragraph-1": "O Centro de Monitoramento Remoto é uma plataforma instituída pela Coordenação Geral de Monitoramento Territorial da Funai (CGMT, criada pelo Decreto nº 7.056, de 28 de dezembro de 2009, e ratificada pelo Decreto nº 7.778, de 27 de julho de 2012). Sua função é integrar informações que fundamentem o planejamento de ações indigenistas. O banco que vem sendo alimentado desde o ano de 2015 disponibiliza dados extraídos de imagens produzidas ciclicamente, com resolução espacial de 30 metros, em que a menor unidade da imagem representa 30 metros na superfície da Terra. A varredura praticamente quinzenal da superfície torna possível a detecção de mudanças como corte raso, degradação, desmatamento em área de regeneração e fogo em floresta.",
    "cmr-paragraph-2": "A funcionalidade 'Mapa Interativo' (disponível publicamente) permite visualizar territórios de forma rápida e fácil, viabilizando os nomes oficiais das terras indígenas, seus limites físicos, os biomas aos quais se circunscrevem, etc. As informações sobre o entorno dessas terras (sobreposição e/ou justaposição a unidades de conservação, áreas quilombolas, assentamentos rurais, imóveis certificados, faixas de fronteira, dentre outros) possibilitam prever e dimensionar implicâncias administrativas e impactos ambientais correlatos. O Mapa conta ainda com os dados divulgados pelo Inpe – que, além de serem a referência do Governo Federal para detecção de desmatamento e degradação ambiental, são de extrema relevância para a Funai.",
    "cmr-paragraph-3": "Já na interface restrita ao usuário autenticado, a plataforma oferece sessões com dados confidenciais selecionáveis por Terra Indígena ou por unidade descentralizada da Funai. Tais informações – e, principalmente, a possibilidade de seu cruzamento – subsidiam a produção de documentos técnicos e de planos de trabalho.",
    "cmr-title-2": "Revolucionário e vital",
    "cmr-paragraph-4": "Outra facilidade oferecida pelo CMR é o acesso por meio de smartphones e tablets, uma vez que suas funcionalidades são produzidas com as mesmas premissas de desenvolvedores de aplicativos para esses dispositivos. Mesmo nas ações em campo, os técnicos podem ingressar no portal. Isso fundamenta e direciona o trabalho, pois garante acesso a dados atualizados e a indicadores precisos das áreas mais críticas."
  }
}
</i18n>
<script>
import HeroBanner from '@/components/panel/HeroBanner'

export default {
  name: 'HowItWorks',
  layout: 'portal',
  components: {
    HeroBanner
  },

}
</script>

<style lang="sass">
h2
  font-size: 24px
  padding-bottom: 2rem

h3
  font-size: 22px
  padding: 2rem 0
  color: #F58A1F

.content
  align-items: flex-start
  max-width: 1100px
  gap: 1rem
</style>
