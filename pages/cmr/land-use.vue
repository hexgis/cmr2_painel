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
    <LandUseFilter @onSearch="search()" />
    <div
      v-if="showFeaturesLandUse && !isLoadingFeatures"
      class="px-4"
    />
  </div>
</template>

<i18n>
{
  "en": {
      "title": "Land Use and Occupation",
      "analytics-label": "Analytics",
      "map-label": "Map",
      "table-name": "Land Use Table",
      "legend": "Legend:",
      "info": "Mapping of land use and occupation based on high spatial resolution images (1.5 m), available for Indigenous Lands in the medium Xingu and those located outside the Legal Amazon, for the years 2015 and 2019",
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
    }
  },

  "pt-br": {
      "title": "Uso e Ocupação do Solo",
      "legend": "Legenda:",
      "info": "Mapeamento de uso e ocupaçao do solo com base em imagens de alta resolução espacial (1,5 m), disponível para as Terras Indígenas do médio Xingu e as situadas fora da Amazônia Legal, para os anos de 2015 e 2019",
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
    }
  }
}
</i18n>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import LandUseFilter from '@/components/land-use/LandUseFilter';
import TableDialog from '@/components/table-dialog/TableDialog.vue';

export default {
  components: { LandUseFilter, TableDialog },

  data() {
    return {
      tab: null,
      items: ['MapStage', 'AnalytcalStage'],
      text: 'Texto de teste.',
      timer: '',
      checkNewFilters: false,
    };
  },

  computed: {
    hasFeatures() {
      return (
        !!this.features
                && !!this.features.features
                && this.features.features.length > 0
      );
    },

    showFeaturesLandUse: {
      get() {
        return this.$store.state['land-use'].showFeaturesLandUse;
      },

      set(value) {
        this.$store.commit('land-use/setShowFeaturesLandUse', value);
      },
    },

    ...mapState('land-use', [
      'features',
      'total',
      'tableLandUse',
      'visualizationStage',
      'tableDialogLand',
      'response',
      'params',
      'isLoadingTable',
      'isLoadingCSV',
      'isLoadingFeatures',
    ]),
    ...mapState('priority', ['visualizationStage']),
  },

  methods: {
    search() {
      if (this.tableDialogLand) {
        this.checkNewFilters = true;
        this.getDataTableLandUse();
      }
      if (!this.tableDialogLand) this.getFeatures();
    },

    searchDataTable() {
      this.getDataTable();
    },

    changeVisualizationStage(tab) {
      this.setVisualizationStage(tab);
    },

    showTableLand(value) {
      if (this.features) {
        this.settableDialogLand(value);
        this.setshowTableDialog(value);
        this.getDataTableLandUse();
      }
    },

    closeTable(value) {
      if (!this.checkNewFilters) {
        this.settableDialogLand(value);
        this.setshowTableDialog(value);
      } else {
        this.settableDialogLand(value);
        this.setshowTableDialog(value);
        this.getFeatures();
        this.checkNewFilters = false;
      }
    },

    ...mapActions('land-use', [
      'getFeatures',
      'getDataTableLandUse',
      'downloadTableLandUse',
    ]),

    ...mapMutations('tableDialog', ['setshowTableDialog']),

    ...mapMutations('priority', ['setVisualizationStage']),

    ...mapMutations('land-use', ['settableDialogLand']),
  },
};
</script>
