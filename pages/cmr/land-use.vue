<template>
  <div>
    <div class="tab-header flex justify-space-between">
      <h4 class="subtitle-2 text-uppercase font-weight-regular">
        {{ $t('title') }}
      </h4>
      <v-switch
        v-if="features"
        v-model="showFeaturesLandUse"
        class="mt-n1 ml-5"
        hide-details
      />
    </div>
    <LandUseFilter @onSearch="search()" />
    <div
      v-if="showFeaturesLandUse && !isLoadingFeatures"
      class="px-4"
    >
      <v-divider class="mt-1" />
      <p class="font-weight-regular pt-2 grey--text text--darken-2">
        {{ $t('legend') }}
      </p>
      <v-col class="grey--text text--darken-2">
        <v-row
          v-for="(category, index) in landUseCategories"
          :key="index"
          class="mb-2"
        >
          <v-icon
            class="mr-2"
            :color="category.color"
          >
            mdi-square
          </v-icon>
          {{ $t(`land-use-categories.${category.key}`) }}
        </v-row>
      </v-col>
    </div>
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
      landUseCategories: [
        { key: 'agriculture', color: '#ffff00' },
        { key: 'clear-cut', color: '#ff0000' },
        { key: 'degradation', color: '#ff00ff' },
        { key: 'water-body', color: '#00ffff' },
        { key: 'mining', color: '#e9dcc6' },
        { key: 'not-observed', color: '#000000' },
        { key: 'highway', color: '#708090' },
        { key: 'forestry', color: '#FF8000' },
        { key: 'natural-vegetation', color: '#228b22' },
        { key: 'village', color: '#A0522d' },
      ],
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
