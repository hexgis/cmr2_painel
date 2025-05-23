<template>
  <v-col class="grey--text text--darken-2 pa-0 pb-0">
    <div>
      <v-row class="align-center" v-for="(item, index) in items" :key="index">
        <v-icon 
          v-if="item.icon"
          class="mr-2" 
          size="small"
          :color="item.color"
          :style="{ border: item.border || 'none' }"
        >
          {{ item.icon }}
        </v-icon>
        <div 
          v-else
          class="legend-color mr-2"
          :class="iconType"
          :style="{
            'background-color': item.color,
            'border': item.border || 'none'
          }"
        ></div>
        <p>{{ isYear(item.label) ? item.label : $t(item.label) }}</p>     
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
      "mining": "Mining",
      "Aqua Modis Manhã": "Aqua Modis Morning",
      "Aqua Modis Tarde": "Aqua Modis Afternoon",
      "Alerta" : "Alert"
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
      "mining": "Mineração",
      "Aqua Modis Manhã": "Aqua Modis Manhã",
      "Aqua Modis Tarde": "Aqua Modis Tarde",
      "Alerta": "Alerta"
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

  data() {
    return {
      iconType: 'square',
    };
  },

  methods: {
    isYear(label) {
      return /^\d{4}$/.test(label); 
    },
  },
}
</script>

<style scoped lang="sass">
p
  font-size: xx-small
  margin: 0

.legend-color 
  width: 12px
  height: 12px
  min-width: 12px
  display: inline-block

.square 
  border-radius: 2px


.circle 
  border-radius: 50%

.image-container
  width: 100%

.row
  margin: 0!important
</style>
