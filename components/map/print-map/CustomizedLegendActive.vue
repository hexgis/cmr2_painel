<template>
  <v-col class="grey--text text--darken-2 pa-0 pb-0">
    <div>
      <v-row
        v-for="(item, index) in items"
        :key="index"
        class="align-center"
      >
        <v-icon
          v-if="item.icon"
          class="mr-2 print-icon"
          size="small"
          :color="item.color"
          :style="{
            border: item.border || 'none',
            color: item.color + '!important'
          }"
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
        />
        <p>
          {{ isYear(item.label) ? item.label : $t(resolveLabel(item.label)) }}
        </p>
      </v-row>
    </div>
    <v-spacer />
  </v-col>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      iconType: 'square',
      labelMap: {
        'Agropecuária (AG)': 'land-use-categories.agriculture',
        'Corte Raso (CR)': 'land-use-categories.clear-cut',
        'Degradação (DG)': 'land-use-categories.degradation',
        'Massa de Água (MA)': 'land-use-categories.water-body',
        'Mineração (MI)': 'land-use-categories.mining',
        'Não observado (NO)': 'land-use-categories.not-observed',
        'Rodovia (RD)': 'land-use-categories.highway',
        'Silvicultura (SI)': 'land-use-categories.forestry',
        'Silvicultura (SV)': 'land-use-categories.forestry',
        'Vegetação Natural (VN)': 'land-use-categories.natural-vegetation',
        'Vilarejo (VI)': 'land-use-categories.village',
        'Desmatamento em Regeneração (DR)': 'monitoring-categories.recovery-deforestation',
        'Fogo em Floresta (FF)': 'monitoring-categories.forest-fire',
        // Versões sem sufixo
        Agropecuária: 'land-use-categories.agriculture',
        'Corte Raso': 'land-use-categories.clear-cut',
        Degradação: 'land-use-categories.degradation',
        'Massa de Água': 'land-use-categories.water-body',
        Mineração: 'land-use-categories.mining',
        'Não Observado': 'land-use-categories.not-observed',
        Rodovia: 'land-use-categories.highway',
        Silvicultura: 'land-use-categories.forestry',
        'Vegetação Natural': 'land-use-categories.natural-vegetation',
        Vilarejo: 'land-use-categories.village',
        'Desmatamento em Regeneração': 'monitoring-categories.recovery-deforestation',
        'Fogo em Floresta': 'monitoring-categories.forest-fire',
      },
    };
  },

  methods: {
    isYear(label) {
      return /^\d{4}$/.test(label);
    },
    resolveLabel(label) {
      // Remove possíveis espaços extras
      const trimmedLabel = label.trim();

      // Verifica se a chave existe no mapeamento
      if (this.labelMap[trimmedLabel]) {
        return this.labelMap[trimmedLabel];
      }

      // Se não encontrar, loga um aviso e retorna o label original
      console.warn(`Label "${trimmedLabel}" not found in labelMap. Using original label as fallback.`);
      return trimmedLabel;
    },
  },
};
</script>

<style scoped lang="sass">
p
  font-size: xx-small
  margin: 0

.legend-color
  width: 8px
  height: 8px
  min-width: 8px
  display: inline-block

.square
  border-radius: 2px

.circle
  border-radius: 50%

.image-container
  width: 100%

.row
  margin: 0!important

/* Estilos específicos para impressão */
@media print
  .print-icon
    -webkit-print-color-adjust: exact !important
    print-color-adjust: exact !important
    color: inherit !important
    fill: inherit !important

  .v-icon
    -webkit-print-color-adjust: exact !important
    print-color-adjust: exact !important
    color: inherit !important
    fill: inherit !important

  *
    -webkit-print-color-adjust: exact !important
    print-color-adjust: exact !important
</style>

<i18n>
{
  "en": {
    "land-use-categories": {
      "agriculture": "Agriculture (AG)",
      "clear-cut": "Clear Cut (CR)",
      "degradation": "Degradation (DG)",
      "water-body": "Water Body (MA)",
      "mining": "Mining (MI)",
      "not-observed": "Not Observed (NO)",
      "highway": "Highway (RD)",
      "forestry": "Forestry (SI)",
      "natural-vegetation": "Natural Vegetation (VN)",
      "village": "Village (VI)"
    },
     "monitoring-categories": {
      "recovery-deforestation": "Regenerating Deforestation",
      "forest-fire": "Forest Fire",
      "degradation": "Degradation",
      "clear-cutting": "Clear-Cutting"
    }
  },
  "pt-br": {
    "land-use-categories": {
      "agriculture": "Agropecuária (AG)",
      "clear-cut": "Corte Raso (CR)",
      "degradation": "Degradação (DG)",
      "water-body": "Massa de Água (MA)",
      "mining": "Mineração (MI)",
      "not-observed": "Não observado (NO)",
      "highway": "Rodovia (RD)",
      "forestry": "Silvicultura (SI)",
      "natural-vegetation": "Vegetação Natural (VN)",
      "village": "Vilarejo (VI)"
    },
     "monitoring-categories": {
      "recovery-deforestation": "Desmatamento em Regeneração",
      "forest-fire": "Fogo em Floresta",
      "degradation": "Degradação",
      "clear-cutting": "Corte Raso"
    }
  }
}
</i18n>
