<template>
  <v-container class="overflow-auto container-height">
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
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#ffff00"
          >
            mdi-square
          </v-icon>
          {{ $t('land-use-categories.agriculture') }}
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#66ffff"
          >
            mdi-square
          </v-icon>
          {{ $t('land-use-categories.water-body') }}
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#cc9966"
          >
            mdi-square
          </v-icon>
          {{ $t('land-use-categories.village') }}
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#00cc00"
          >
            mdi-square
          </v-icon>
          {{ $t('land-use-categories.natural-vegetation') }}
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#ff3333"
          >
            mdi-square
          </v-icon>
          {{ $t('land-use-categories.clear-cut') }}
        </v-row>
        <v-spacer />
      </v-col>
    </div>
  </v-container>
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
              "water-body": "Water Body",
              "village": "Village",
              "natural-vegetation": "Natural Vegetation",
              "clear-cut": "Clear Cut"
            
          }
        },
        "pt-br": {
            "title": "Uso e Ocupação do Solo",
            "legend": "Legenda:",
            "land-use-categories": {
              "agriculture": "Agropecuária",
              "water-body": "Massa de Água",
              "village": "Vilarejo",
              "natural-vegetation": "Vegetação Natural",
              "clear-cut": "Corte Raso"
             
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

<style scoped>
.container-height {
    max-height: 90vh;
}
</style>
