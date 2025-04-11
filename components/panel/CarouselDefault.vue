<template>
  <v-carousel
    height="400"
    show-arrows="hover"
    hide-delimiter-background
  >
    <!-- cycle -->
    <v-carousel-item
      v-for="(slide, i) in slides"
      :key="i"
      :src="`/img/portal/sliderb_0${i + 1}.jpg`"
    >
      <div class="carousel d-flex fill-height justify-flex-start align-center relative">
        <v-col class="absolute">
          <h2 class="carousel-text-h2">
            {{ slide.title }}
          </h2>
          <p class="carousel-text-p">
            {{ slide.subtitle }}
          </p>
        </v-col>
        <!-- <v-img

          alt=""
        /> -->
      </div>
    </v-carousel-item>
  </v-carousel>
</template>
<i18n>
  {
  "en": {
    "banner01-title": "The rights of indigenous peoples and the Constitution",
    "banner02-title": "The rights of indigenous peoples and the Constitution",
    "banner03-title": "The rights of indigenous peoples and the Constitution",
    "banner04-title": "The rights of indigenous peoples and the Constitution",
    "banner05-title": "The rights of indigenous peoples and the Constitution",
    "banner06-title": "The rights of indigenous peoples and the Constitution",
    "banner07-title": "The rights of indigenous peoples and the Constitution",
    "banner01-subtitle": "Indigenous peoples are recognized for their social organization, customs, languages, beliefs, and traditions, as well as their original rights over the lands they traditionally occupy, and it is the responsibility of the Union to demarcate them, protect them, and ensure the respect of all their property (art. 231 of the 1988 Constitution).",
    "banner02-subtitle": "Lands traditionally occupied by indigenous peoples are those they permanently inhabit, use for productive activities, are essential for the preservation of the environmental resources necessary for their well-being, and are necessary for their physical and cultural reproduction, according to their customs, traditions, and usage (art. 231 § 1º, CF/88).",
    "banner03-subtitle": "The lands traditionally occupied by indigenous peoples are intended for their permanent possession, and they have the exclusive right to the benefits of the soil, rivers, and lakes found there (art. 231 § 2º, CF/88).",
    "banner04-subtitle": "The utilization of water resources, including energy potentials, research, and mineral extraction on indigenous lands can only be carried out with authorization from the National Congress, after consulting the affected communities, and ensuring their participation in the benefits of the extraction as provided by law (art. 231 § 3º, CF/88).",
    "banner05-subtitle": "Lands traditionally occupied by indigenous peoples are inalienable and unavailable, and rights over them are indefeasible (art. 231 § 4º, CF/88).",
    "banner06-subtitle": "The removal of indigenous groups from their lands is prohibited, except with the approval of the National Congress in cases of catastrophe or epidemic that endangers their population, or in the interest of national sovereignty, after deliberation by the National Congress, ensuring in all cases the immediate return as soon as the risk ceases (art. 231 § 5º, CF/88).",
    "banner07-subtitle": "Acts aimed at occupying, owning, or possessing lands traditionally occupied by indigenous peoples, or exploiting the natural resources of the soil, rivers, and lakes found there, are null and void and produce no legal effects, except in cases of relevant public interest of the Union as determined by supplementary law, with nullification and extinction generating no right to compensation or actions against the Union, except as provided by law regarding improvements resulting from good faith occupation (art. 231 § 6º, CF/88)."
  },
  "pt-br": {
    "banner01-title": "O direitos dos povos indígenas e a Constituição",
    "banner02-title": "O direitos dos povos indígenas e a Constituição",
    "banner03-title": "O direitos dos povos indígenas e a Constituição",
    "banner04-title": "O direitos dos povos indígenas e a Constituição",
    "banner05-title": "O direitos dos povos indígenas e a Constituição",
    "banner06-title": "O direitos dos povos indígenas e a Constituição",
    "banner07-title": "O direitos dos povos indígenas e a Constituição",
    "banner01-subtitle": "São reconhecidos aos índios sua organização social, costumes, línguas, crenças e tradições, e os direitos originários sobre as terras quetradicionalmente ocupam, competindo à União demarcá-las, proteger e fazer respeitar todos os seus bens (art.231 da CF/88).",
    "banner02-subtitle": "São terras tradicionalmente ocupadas pelos índios as por eles habitadas em caráter permanente, as utilizadas para suas atividades produtivas, as imprescindíveis à preservação dos recursos ambientais necessários a seu bem-estar e as necessárias a sua reprodução física e cultural, segundo seus usos, costumes e tradições (art. 231 § 1º, CF/88).",
    "banner03-subtitle": "As terras tradicionalmente ocupadas pelos índios destinam-se a sua posse permanente, cabendo-lhes o usufruto exclusivo das riquezas do solo, dos rios e dos lagos nelas existentes (art. 231 § 2º, CF/88).",
    "banner04-subtitle": "O aproveitamento dos recursos hídricos, incluídos os potenciais energéticos, a pesquisa e a lavra das riquezas minerais em terras indígenas só podem ser efetivados com autorização do Congresso Nacional, ouvidas as comunidades afetadas, ficando-lhes assegurada participação nos resultados da lavra, na forma da lei (art. 231 § 3º, CF/88).",
    "banner05-subtitle": "As terras tradicionalmente ocupadas pelos índios são inalienáveis e indisponíveis, e os direitos sobre elas, imprescritíveis (art. 231 § 4º, CF/88).",
    "banner06-subtitle": "É vedada a remoção dos grupos indígenas de suas terras, salvo ad referendum do Congresso Nacional, em caso de catástrofe ou epidemia que ponha em risco sua população, ou no interesse da soberania do País, após deliberação do Congresso Nacional, garantido, em qualquer hipótese, o retorno imediato logo que cesse o risco (art. 231 § 5º, CF/88).",
    "banner07-subtitle": "São nulos e extintos, não produzindo efeitos jurídicos, os atos que tenham por objeto a ocupação, o domínio e a posse das terras tradicionalmente ocupadas pelos índios, ou a exploração das riquezas naturais do solo, dos rios e dos lagos nelas existentes, ressalvado relevante interesse público da União, segundo o que dispuser lei complementar, não gerando a nulidade e a extinção direito a indenização ou a ações contra a União, salvo, na forma da lei, quanto às benfeitorias derivadas da ocupação de boa-fé (art. 231 § 6º, CF/88)."
  }
}
</i18n>
<script>
export default {
  name: 'CarouselDefault',
  data() {
    return {
      img_01: '/img/portal/sliderb_01.jpg',
      img_02: '/img/portal/sliderb_02.jpg',
      img_03: '/img/portal/sliderb_03.jpg',
      img_04: '/img/portal/sliderb_04.jpg',
      img_05: '/img/portal/sliderb_05.jpg',
      img_06: '/img/portal/sliderb_06.jpg',
      img_07: '/img/portal/sliderb_07.jpg',
    };
  },
  computed: {
    slides() {
      return [
        {
          id: '1',
          title: this.$t('banner01-title'),
          subtitle: this.$t('banner01-subtitle'),
        },
        {
          id: '2',
          title: this.$t('banner02-title'),
          subtitle: this.$t('banner02-subtitle'),
        },
        {
          id: '3',
          title: this.$t('banner03-title'),
          subtitle: this.$t('banner03-subtitle'),
        },
        {
          id: '4',
          title: this.$t('banner04-title'),
          subtitle: this.$t('banner04-subtitle'),
        },
        {
          id: '5',
          title: this.$t('banner05-title'),
          subtitle: this.$t('banner05-subtitle'),
        },
        {
          id: '6',
          title: this.$t('banner06-title'),
          subtitle: this.$t('banner06-subtitle'),
        },
        {
          id: '7',
          title: this.$t('banner07-title'),
          subtitle: this.$t('banner07-subtitle'),
        },
      ];
    },
  },
};

</script>

<style lang="sass">
.absolute
  position: absolute
  top: 0
  z-index: 2
  margin: 2% 16%

  @media screen and (min-width: 600px)
    max-width: 475px

  @media screen and (max-width: 600px)
    width: 80%

.relative
  position: relative
.carousel
  &-text
    &-h2
      color: #FFCC00
      font-weight: bold
      font-size: 22px
      max-width: 285px

    &-p
      color: white
      font-size: 16px
</style>
