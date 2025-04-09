<template>
  <v-col class="grey--text text--darken-2 pa-0 pb-0">
    <div>
      <v-row class="align-center" v-for="(item, index) in items" :key="index">
        <v-icon class="mr-2" size="x-small" :color="item.color">mdi-square</v-icon>
        <p>{{ $t(item.label) }} </p>      
      </v-row>
    </div>
    <v-spacer />
  </v-col>
</template>

<i18n>
{
  "en": {
      "clear-cut": "Clear Cut",
      "degradation": "Degradation",
      "forest-fire": "Forest Fire",
      "regeneration-deforestation": "Regeneration Deforestation",
      "burnt-scar": "Burnt Scar",
      "land-use-categories": {
        "agriculture": "Agriculture",
          "clear-cut": "Clear Cut",
          "degradation": "Degradation",
          "water-body": "Water Body",
          "mining": "Mining",
          "not-observed": "Not observed",
          "highway": "Highway",
          "forestry": "Forestry",
          "natural-vegetation": "Natural Vegetation",
          "village": "Village"
      },
      "deforestation-veg": "Vegetation Deforestation",
      "disorderly-cs": "Disorderly Cs",
      "deforestation-cr": "Deforestation Cr",
      "geometric-cs": "Geometric Cs",
      "mining": "Mining"
  },

  "pt-br": {
      "clear-cut": "Corte Raso",
      "degradation": "Degradação",
      "forest-fire": "Fogo em Floresta",
      "regeneration-deforestation": "Desmatamento em Regeneração",
      "burnt-scar": "Cicatriz de Queimada",
      "land-use-categories": {
        "agriculture": "Agropecuária",
          "clear-cut": "Corte Raso",
          "degradation": "Degradação",
          "water-body": "Massa de Água",
          "mining": "Mineração",
          "not-observed": "Não observado",
          "highway": "Rodovia",
          "forestry": "Silvicultura",
          "natural-vegetation": "Vegetação Natural",
          "village": "Vilarejo"
      },
      "deforestation-veg": "Desmatamento Veg",
      "disorderly-cs": "Cs Desordenado",
      "deforestation-cr": "Desmatamento Cr",
      "geometric-cs": "Cs Geométrico",
      "mining": "Mineração"
  }
}
</i18n>

<script>
export default {
  props: {
    items: {
      type: Array,
    },
  },
  
}
</script>

<style scoped lang="sass">
p
  font-size: xx-small
  margin: 0

.image-container
    width: 100%

.row
  margin: 0!important
</style>
