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
        Legenda:
      </p>
      <v-col class="grey--text text--darken-2">
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#ffff00"
          >
            mdi-square
          </v-icon>
          Agropecuária
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#66ffff"
          >
            mdi-square
          </v-icon>
          Massa de Água
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#cc9966"
          >
            mdi-square
          </v-icon>
          Vilarejo
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#00cc00"
          >
            mdi-square
          </v-icon>
          Vegetação Natural
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#ff3333"
          >
            mdi-square
          </v-icon>
          Corte Raso
        </v-row>
        <v-spacer />
      </v-col>
    </div>

   
  </v-container>
</template>

<i18n>
    {
        "en": {
            "title": "Land Use And Ocupation",
            "analytics-label": "Analytics",
            "map-label": "Map",
            "table-name": "Land Use Table"
        },
        "pt-br": {
            "title": "Uso e Ocupação Do Solo",
            "analytics-label": "Analytics",
            "map-label": "Mapa",
            "table-name": "Tabela de Uso e Ocupação do Solo"
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
      headers: [
        { text: 'Código Funai', value: 'co_funai' },
        { text: 'Terra Indígena', value: 'no_ti' },
        { text: 'Coordenação Regional', value: 'ds_cr' },
        { text: 'Data Cadastro', value: 'dt_cadastro' },
        { text: 'Nu Área Km2', value: 'nu_area_km2' },
        { text: 'Área do Polígono (ha)', value: 'nu_area_ha' },
      ],
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
      'showFeaturesLandUse',
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
