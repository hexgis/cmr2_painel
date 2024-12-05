<template>
  <v-row justify="space-around">
    <v-col cols="auto">
      <v-dialog
        v-model="showDialogMapoteca"
        transition="dialog-bottom-transition"
        max-width="95vw"
        persistent
      >
        <v-card style="width: 100vw">
          <v-toolbar
            class="background__toolbar"
            dark
            color="primary"
          >
            <h3>{{ $t('dialogName') }}</h3>
            <v-spacer />
            <v-btn
              icon
              @click="closeDialog(false)"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-actions>
            <v-container fluid>
              <v-row
                align="center"
                class="column"
                justify="space-around"
              >
                <v-col class="cols">
                  <v-select
                    v-model="filters.id_acao"
                    :label="$t('institution-label')"
                    :items="filterOptions.actions"
                    item-value="id_action"
                    item-text="no_action"
                    hide-details
                    multiple
                    required
                  />
                </v-col>
                <v-col>
                  <v-select
                    v-model="filters.cr"
                    :label="$t('regional-coordination-label')"
                    :items="filterOptions.regionalFilters"
                    item-value="co_cr"
                    item-text="ds_cr"
                    hide-details
                    clearable
                    multiple
                    required
                  />
                </v-col>
                <v-col
                  v-if="filters.cr && filterOptions.tiFilters"
                >
                  <v-select
                    v-model="filters.ti"
                    :label="$t('indigenous-lands-label')"
                    :items="filterOptions.tiFilters"
                    item-text="no_ti"
                    item-value="co_funai"
                    multiple
                    clearable
                    hide-details
                    required
                  />
                </v-col>
                <v-col class="mt-2">
                  <v-btn
                    block
                    color="accent"
                    :loading="isLoadingFeatures"
                    @click="search"
                  >
                    {{ $t('search-label') }}
                  </v-btn>
                </v-col>
                <MapotecaDialogUpload class="mt-2" />
              </v-row>
            </v-container>
          </v-card-actions>
          <v-divider />
          <v-card-actions class="d-flex flex-column">
            <v-container
              fluid
              class="pa-0"
            >
              <v-row
                no-gutters
                class="mb-1"
              >
                <v-col>
                  <v-subheader>
                    {{ $t('result-label') }}
                  </v-subheader>
                </v-col>
                <v-spacer />
              </v-row>
            </v-container>
            <v-container
              class="pa-0"
              fluid
            >
              <v-skeleton-loader
                v-if="isLoadingFeatures"
                type="table-row-divider@12"
              />
              <v-data-table
                v-if="!isLoadingFeatures"
                :headers="headers"
                :items="values"
                fixed-header
                height="52vh"
                style="width: 100vw"
              >
                <template #item.actions="{ item }">
                  <v-tooltip bottom>
                    <template
                      #activator="{ on, attrs }"
                    >
                      <v-icon
                        v-bind="attrs"
                        dense
                        class="mr-2"
                        v-on="on"
                        @click="downloadDocument(item)"
                      >
                        mdi-download
                      </v-icon>
                    </template>
                    <span>{{
                      $t('download-label-tooltip')
                    }}</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template
                      #activator="{ on, attrs }"
                    >
                      <v-icon
                        v-bind="attrs"
                        dense
                        v-on="on"
                        @click="showDocument(item)"
                      >
                        mdi-eye
                      </v-icon>
                    </template>
                    <span>{{
                      $t('view-label-tooltip')
                    }}</span>
                  </v-tooltip>
                </template>
              </v-data-table>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<i18n>
    {
        "en": {
            "search-label": "Search",
            "opacity-label": "Opacity",
            "current-view-label": "Search in current area?",
            "start-date-label": "Start Date",
            "total-area-label": "Total area",
            "heat-map-label": "Heat map",
            "polygon-label": "Total polygon count",
            "end-date-label": "End Date",
            "dialogName": "MAP SEARCH",
            "result-label": "Results",
            "filter-label": "Filter",
            "institution-label": "Institution",
            "download-label-tooltip": "Download",
            "view-label-tooltip": "Preview",
            "regional-coordination-label": "Regional Coordination (All)",
            "indigenous-lands-label": "Indigenous Lands (All)"
        },
        "pt-br": {
            "search-label": "Buscar",
            "opacity-label": "Opacidade",
            "current-view-label": "Pesquisar nesta área?",
            "total-area-label": "Área total",
            "heat-map-label": "Mapa de calor",
            "polygon-label": "Total de polígonos",
            "start-date-label": "Data Início",
            "end-date-label": "Data Fim",
            "dialogName": "PESQUISA DE MAPAS",
            "result-label": "Resultados",
            "filter-label": "Filtrar",
            "institution-label": "Instituição",
            "download-label-tooltip": "Download",
            "view-label-tooltip": "Visualizar",
            "regional-coordination-label": "Coordenação Regional (Todas)",
            "indigenous-lands-label": "Terras Indígenas (Todas)"
        }
    }
</i18n>


<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import legend from '@/assets/legend.png';
import MapotecaDialogUpload from '@/components/mapoteca/MapotecaDialogUpload';

export default {
  name: 'MapotecaDialog',

  components: { MapotecaDialogUpload },

  data() {
    return {
      isGeoserver: process.env.MONITORING_GEOSERVER === 'true',
      filters: {
        startDate: this.$moment()
          .subtract(30, 'days')
          .format('YYYY-MM-DD'),
        endDate: this.$moment().format('YYYY-MM-DD'),
        cr: [],
        ti: [],
        id_acao: [],
      },
      isLoadingTotal: false,
      legendData: legend,
      headers: [
        { text: 'Terra Indígena', value: 'no_ti' },
        { text: 'Título', value: 'no_document' },
        { text: 'Inserido por', value: 'usercmr_id.first_name' },
        { text: 'Instituição', value: 'action_id.no_action' },
        { text: 'Descrição', value: 'no_description' },
        { text: 'Formato', value: 'map_dimension' },
        { text: 'Extensão do arquivo', value: 'no_ti' },
        { text: 'Data', value: 'dt_registration' },
        { text: 'Ação', value: 'actions' },
      ],
      values: [],
    };
  },
  watch: {
    'filters.cr': function (value) {
      this.populateTiOptions(value);
    },
    features(data) {
      this.values = data;
    },
  },
  computed: {
    ...mapState('mapoteca', [
      'features',
      'isLoadingFeatures',
      'isLoadingMapotecainstitution',
      'filterOptions',
      'showDialogMapoteca',
    ]),
  },

  mounted() {
    this.getMapotecaActions('MAPOTECA');
    this.getFilterOptions();
  },

  methods: {
    populateTiOptions(cr) {
      if (cr) this.$store.dispatch('mapoteca/getTiOptions', cr);
      else this.filters.ti = [];
    },

    closeDialog(value) {
      this.setShowDialogMapoteca(value);
    },

    downloadDocument(item) {
      const link = document.createElement('a');
      link.href = item.url_doc;
      link.download = item.no_document;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    showDocument(item) {
      if (item.url_doc) {
        window.open(item.url_doc, '_blank');
      }
    },

    search() {
      if (this.filters.id_acao.length) {
        this.getFeatures({ ...this.filters });
      }
    },

    ...mapMutations('mapoteca', [
      'setShowDialogMapoteca',
      'setLoadingTable',
    ]),
    ...mapActions('mapoteca', [
      'getFeatures',
      'getFilterOptions',
      'getMapotecaActions',
    ]),
  },
};
</script>

<style scoped lang="sass">
.background__toolbar
    background: linear-gradient(to bottom, rgb(30, 33, 50), rgb(28, 65, 113))

@media (max-width: 1000px)
    .column
        flex-direction: column
</style>
