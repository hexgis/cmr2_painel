<template>
  <div>
    <div class="tab-header justify-space-between">
      <div class="d-flex align-center">
        <h4 class="subtitle-2 text-uppercase font-weight-regular">
          {{ $t('title') }}
        </h4>
        <v-tooltip
          bottom
          max-width="400"
          color="grey darken-4"
        >
          <template #activator="{ on }">
            <v-icon
              class="mr-2 ml-2"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span> {{ $t('info') }} </span>
        </v-tooltip>
      </div>
    </div>

    <LandUseFilters />
  </div>
</template>

<i18n>
{
  "en": {
    "title": "Land Use and Occupation",
    "info": "Mapping of land use and occupation based on high spatial resolution images (1.5 m), available for Indigenous Lands in the medium Xingu and those located outside the Legal Amazon, for the years 2015 and 2019"
  },
  "pt-br": {
    "title": "Uso e Ocupação do Solo",
    "info": "Mapeamento de uso e ocupaçao do solo com base em imagens de alta resolução espacial (1,5 m), disponível para as Terras Indígenas do médio Xingu e as situadas fora da Amazônia Legal, para os anos de 2015 e 2019"
  }
}
</i18n>

<script>
import LandUseFilters from '../../components/land-use/LandUseFilter.vue';

export default {
  name: 'LandUseAlertsPage',

  components: {
    LandUseFilters,
  },

  transition: 'scroll-y-transition',

  // data() {
  //   return {
  //     dialog: false,
  //   };
  // },

  mounted() {
    this.$store.dispatch('land-use/getFilterOptions');
    // this.$store.dispatch('land-use/getCyclesOptions');
  },
};
</script>

<style scoped>
.tab-item {
    flex: 1; /* Distribui o espaço igualmente */
    text-align: center;
    white-space: nowrap; /* Evita que o texto quebre */
    min-width: 100px; /* Define um tamanho mínimo */
    max-width: 150px; /* Limita o tamanho */
}
</style>
