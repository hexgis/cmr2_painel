<template>
  <div>
    <HeroBanner
      :hero-title="$t('hero-title')"
      background-image="/img/portal/banner-terras.jpg"
      :hasCTA="false"
    />
    <div class="d-flex justify-sm-center">
      <v-row class="content">
        <v-col>
          <h2>{{ $t('indigenous-land-title') }}</h2>
          <p>{{ $t('indigenous-land-paragraph-1') }}</p>
          <p>{{ $t('indigenous-land-paragraph-2') }}</p>
        </v-col>
        <v-col>
          <p>
            {{ $t('indigenous-land-paragraph-3') }}
            <span class="highlighted">{{ $t('indigenous-land-highlight-1') }}</span>
            {{ $t('indigenous-land-paragraph-4') }}
            <span class="highlighted">{{ $t('indigenous-land-highlight-2') }}</span>.
            {{ $t('indigenous-land-paragraph-4b') }}
          </p>
          <p>
            <span class="highlighted">{{ $t('indigenous-land-highlight-3') }}</span>
            {{ $t('indigenous-land-paragraph-5') }}
          </p>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<i18n>
{
  "en": {
    "hero-title": "Protection of Indigenous Lands",
    "indigenous-land-title": "UNDERSTAND THE TOPIC OF INDIGENOUS LAND PROTECTION",
    "indigenous-land-paragraph-1": "The lands traditionally occupied by indigenous peoples are those inhabited permanently, used for their productive activities, essential for preserving the environmental resources necessary for their well-being, and necessary for their physical and cultural reproduction, according to their customs and traditions. The right to these lands is considered an original right; therefore, it is not created by a constitutive act but recognized (declared) based on technical and legal requirements under the 1988 Federal Constitution.",
    "indigenous-land-paragraph-2": "As property of the Union, indigenous land is inalienable and non-transferable, and the rights over it are irrevocable. The Brazilian State must, therefore, take the necessary measures to ensure the effective protection of the property and possession rights of these lands by indigenous peoples.",
    "indigenous-land-paragraph-3": "The protection of indigenous lands is a joint effort carried out by the indigenist agency and indigenous people.",
    "indigenous-land-highlight-1": "Control actions",
    "indigenous-land-paragraph-4": " are those provided for in Brazilian legislation and exclusively assigned to the ",
    "indigenous-land-paragraph-4b": "They address situations where territorial and environmental conditions are altered or interfere with traditional use, creating conflicts and risks for the communities living there. Illicit activities in indigenous lands include deforestation, forest fires, mining, degradation, among others.",
    "indigenous-land-highlight-2": "State",
    "indigenous-land-highlight-3": "Preventive actions",
    "indigenous-land-paragraph-5": " are those that, combined with traditional indigenous knowledge, enhance the protection that indigenous people themselves carry out for their territory. They address situations where there are pressures and threats in the surroundings and on indigenous lands. In these actions, Funai works by integrating traditional knowledge into territorial protection actions."
  },
  "pt-br": {
    "hero-title": "Proteção das Terras Indígenas",
    "indigenous-land-title": "ENTENDA A TEMÁTICA DA PROTEÇÃO DAS TERRAS INDÍGENAS",
    "indigenous-land-paragraph-1": "As terras tradicionalmente ocupadas pelos povos indígenas são aquelas por eles habitadas em caráter permanente, as utilizadas para suas atividades produtivas, as imprescindíveis à preservação dos recursos ambientais necessários a seu bem-estar e as necessárias à sua reprodução física e cultural, segundo seus usos, costumes e tradições. O direito a essas terras configura-se como um direito originário; portanto, não são criadas por ato constitutivo, mas reconhecidas (declaradas) a partir de requisitos técnicos e legais, nos termos da Constituição Federal de 1988.",
    "indigenous-land-paragraph-2": "Por se tratar de um bem da União, a terra indígena é inalienável e indisponível, e os direitos sobre ela são irrevogáveis. O Estado Brasileiro deve, então, adotar as medidas necessárias para garantir a proteção efetiva dos direitos de propriedade e posse dessas terras pelos povos indígenas.",
    "indigenous-land-paragraph-3": "A proteção das terras indígenas é uma tarefa realizada em conjunto pelo órgão indigenista e pelos indígenas. As ",
    "indigenous-land-highlight-1": "ações de controle",
    "indigenous-land-paragraph-4": " são aquelas previstas na legislação brasileira e atribuídas exclusivamente ao ",
    "indigenous-land-paragraph-4b": "Atendem a situações em que as condições territoriais e ambientais são alteradas ou interferem no uso tradicional, gerando conflitos e riscos às comunidades ali residentes. Caracterizam-se como ilícitos em terras indígenas ocorrências como desmatamento, fogo em floresta, mineração, degradação, dentre outros.",
    "indigenous-land-highlight-2": "Estado",
    "indigenous-land-highlight-3": "Ações de prevenção",
    "indigenous-land-paragraph-5": " são aquelas que, aliadas aos conhecimentos tradicionais indígenas, potencializam a proteção que os próprios indígenas fazem do seu território. Elas atendem a situações em que haja pressões e ameaças ao entorno e nas terras indígenas. Nessas ações, a Funai atua agregando os conhecimentos tradicionais às ações de proteção territorial."
  }
}
</i18n>

<script>
import HeroBanner from '@/components/panel/HeroBanner'

export default {
  name: 'IndigenousLand',
  layout: 'portal',
  components: {
    HeroBanner
  }
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

.highlighted
  font-weight: bold
  color: #FFCC00
</style>
