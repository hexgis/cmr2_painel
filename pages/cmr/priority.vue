<template>
  <v-container
    class="overflow-auto container-height"
    color="surface"
  >
    <div class="tab-header">
      <v-row>
        <h4 class="subtitle-2 text-uppercase font-weight-regular">
          {{ $t('title') }}
        </h4>
        <v-tooltip>
          <template #activator="{ on }">
            <v-icon
              class="infoIconMargin"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            {{ $t('data-source') }}
          </span>
        </v-tooltip>
      </v-row>
      <v-switch
        v-if="features"
        v-model="showFeaturesPriority"
        class="mt-n1"
        hide-details
      />
    </div>

    <FunaiFilter @onSearch="search()" />

    <div
      v-if="showFeatures && !isLoadingFeatures"
      class="px-4"
    >
      <v-divider />
      <p class="font-weight-regular pt-2 grey--text text--darken-2">
        {{ $t('legend') }}:
      </p>
      <v-col class="grey--text text--darken-2">
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#9400D3"
          >
            mdi-square
          </v-icon>
          {{ $t('legend-very-high') }}
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#FF0000"
          >
            mdi-square
          </v-icon>
          {{ $t('legend-high') }}
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#FF8C00"
          >
            mdi-square
          </v-icon>
          {{ $t('legend-medium') }}
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#FFD700"
          >
            mdi-square
          </v-icon>
          {{ $t('legend-low') }}
        </v-row>
        <v-row class="mb-2">
          <v-icon
            class="mr-2"
            color="#008000"
          >
            mdi-square
          </v-icon>
          {{ $t('legend-very-low') }}
        </v-row>
        <v-spacer />
      </v-col>
    </div>

    <ShowDialog />
  </v-container>
</template>

<i18n>
    {
        "en": {
            "title": "Priority Polygons",
            "analytics-label": "Analytics",
            "data-source": "Data Source: Database - FUNAI",
            "legend-very-high": "Very High",
            "legend-high": "High",
            "legend-medium": "Medium",
            "legend-low": "Low",
            "legend-very-low": "Very Low",
            "map-label": "Map",
            "table-name": "Priority Table"
        },
        "pt-br": {
            "title": "Polígonos Prioritários",
            "analytics-label": "Analítico",
            "data-source": "Fonte de dados: Banco de dados - FUNAI",
            "legend-very-high": "Muito Alta",
            "legend-high": "Alta",
            "legend-medium": "Média",
            "legend-low": "Baixa",
            "legend-very-low": "Muito Baixa",
            "map-label": "Mapa",
            "table-name": "Tabela de Prioridade"
        }
    }
</i18n>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import FunaiFilter from '@/components/priority/PriorityFilter';
import ShowDialog from '@/components/show-dialog/ShowDialog';

export default {
  name: 'PriorityComponent',

  components: {
    FunaiFilter, ShowDialog,
  },

  data() {
    return {
      item: [],

      tab: null,
      selected: [],
      items: ['MapStage', 'AnalytcalStage'],
      text: 'Texto de teste.',
      timer: '',
      checkNewFilters: false,
      dialog: false,
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
    showFeaturesPriority: {
      get() {
        return this.$store.state.priority.showFeatures;
      },

      set(value) {
        this.$store.commit('priority/setShowFeatures', value);
      },
    },
    ...mapState('priority', [
      'showFeatures',
      'features',
      'table',
      'tableDialogPriority',
      'isLoadingFeatures',
    ]),
  },

  methods: {
    search() {
      if (this.tableDialogPriority) {
        this.checkNewFilters = true;
        this.getDataTable();
      }
      if (!this.tableDialogPriority) this.getFeatures();
    },

    ...mapActions('priority', [
      'getFeatures',
      'getDataTable',
    ]),
  },
};
</script>

<style scoped lang="scss">
.container-height {
    max-height: 90vh;
}

.selected {
    background-color: red
}

.infoIconMargin {
    margin-left: 4px;
  }

@media (max-width: 768px) {
  .infoIconMargin {
    margin-left: 2px;
  }
}
</style>
