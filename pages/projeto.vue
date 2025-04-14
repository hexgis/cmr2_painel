<template>
  <div>
    <HeroBanner
      :hero-title="$t('hero-title')"
      background-image="/img/portal/banner-projeto.jpg"
      :has-c-t-a="false"
    />
    <div class="content mx-auto px-8 px-lg-0">
      <v-row class="align-center">
        <v-col
          cols="12"
          md="8"
        >
          <h2>{{ $t('about-title') }}</h2>
          <p>{{ $t('about-paragraph-1') }} <span class="highlighted">{{ $t('highlighted-text') }}</span> {{ $t('about-paragraph-2') }}</p>
          <p>{{ $t('about-paragraph-3') }}</p>
          <p>{{ $t('about-paragraph-4') }}</p>
          <p>{{ $t('about-paragraph-5') }}</p>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-img src="/img/portal/mapa-interativo.jpg" />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<i18n>
{
  "en": {
    "hero-title": "The Project",
    "about-title": "About the Project",
    "about-paragraph-1": "Nearly 13% of the national territory is composed of indigenous lands.",
    "highlighted-text": "The Remote Monitoring Center (CMR)",
    "about-paragraph-2": "was developed to enable daily monitoring of occurrences such as deforestation, degradation, land use changes, and occupation in these territories. The information generated from images captured by the Landsat-8 satellite is indispensable not only for planning territorial protection actions but also for the overall indigenist work.",
    "about-paragraph-3": "The product aims to equip end-users with content that was previously restricted to highly specialized technical knowledge. By decentralizing knowledge about territorial circumstances that directly impact daily lives of communities, it enriches socio-environmental research, directing actions and reducing time and costs.",
    "about-paragraph-4": "In addition to offering a diverse database to the Brazilian population as a whole, the CMR is revolutionizing Funai's work through the acquisition and processing of highly precise and complex technical information.",
    "about-paragraph-5": "The CMR is part of the measures to strengthen the Territorial Protection of the Indigenous Lands of the Middle Xingu, through the Territorial and Environmental Protection Plan for the Indigenous Lands of the Middle Xingu (PPTMX), one of the conditions of the Belo Monte HPP. Therefore, it is a project funded by Norte Energia S.A."
  },
  "pt-br": {
    "hero-title": "O Projeto",
    "about-title": "Sobre o Projeto",
    "about-paragraph-1": "Quase 13% do território nacional é composto por terras indígenas.",
    "highlighted-text": "O Centro de Monitoramento Remoto (CMR)",
    "about-paragraph-2": "foi desenvolvido para possibilitar o acompanhamento diário de ocorrências como desmatamento, degradação, mudança de uso e de ocupação do solo nesses territórios. As informações geradas a partir de imagens captadas pelo satélite Landsat-8 são subsídios indispensáveis não só ao planejamento de ações de proteção territorial, mas ao trabalho indigenista como um todo.",
    "about-paragraph-3": "O produto tem como mote a instrumentalização do usuário final com conteúdos que outrora se restringiam a um domínio técnico especificamente qualificado. Por descentralizar o conhecimento sobre circunstâncias territoriais que impactam diretamente o cotidiano das comunidades, ele enriquece a pesquisa socioambiental, direcionando as ações e reduzindo seu tempo e custo.",
    "about-paragraph-4": "Além de oferecer um diversificado banco de dados à população brasileira como um todo, o CMR está revolucionando a atuação da Funai por meio da captação e processamento de informações técnicas de alta precisão e complexidade.",
    "about-paragraph-5": "O CMR insere-se no contexto das medidas para fortalecer a Proteção Territorial das Terras Indígenas do Médio Xingu, por meio do Plano de Proteção Territorial e Ambiental às Terras Indígenas do Médio Xingu (PPTMX), uma das condicionantes da UHE Belo Monte. Portanto, projeto financiado pela Norte Energia S.A."
  }
}
</i18n>

<script>
import HeroBanner from '@/components/panel/HeroBanner';

export default {
  name: 'Project',
  components: {
    HeroBanner,
  },
  layout: 'portal',
};
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
  align-items: center
  max-width: 1100px
  gap: 1rem

.highlighted
  font-weight: bold
  color: #FFCC00
</style>
