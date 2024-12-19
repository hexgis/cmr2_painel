<template>
  <v-row justify="space-around">
    <v-col cols="auto">
      <v-dialog
        v-model="showDialogDocument"
        persistent
        transition="dialog-bottom-transition"
        max-width="95vw"
      >
        <v-card style="width: 100vw">
          <v-toolbar

            dark
            color="secondary"
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
          <v-card-text>
            <v-container fluid>
              <v-row
                align="center"
                class="column"
                justify="space-around"
              >
                <v-col>
                  <v-autocomplete
                    v-model="filters.id_acao"
                    :label="$t('action-label')"
                    item-value="id_action"
                    :items="filterOptions.actions"
                    item-text="no_action"
                    hide-details
                    clearable
                    multiple
                    required
                    :loading="isLoadingDocumentActions"
                    :disabled="isLoadingDocumentActions"
                  />
                </v-col>
                <v-col>
                  <v-autocomplete
                    v-model="filters.cr"
                    :disabled="!filters.id_acao.length"
                    label="Coordenação Regional (Todas)"
                    :items="filterOptions.regionalFilters"
                    item-value="co_cr"
                    item-text="ds_cr"
                    hide-details
                    clearable
                    multiple
                    required
                  />
                </v-col>
                <v-col>
                  <v-autocomplete
                    v-model="filters.ti"
                    label="Terras Indigenas (Todas)"
                    :items="filterOptions.tiFilters"
                    :disabled="!filters.id_acao.length &&!filterOptions.tiFilters.length"
                    item-text="no_ti"
                    item-value="co_funai"
                    multiple
                    clearable
                    hide-details
                    required
                  />
                </v-col>
                <v-col class="mt-7">
                  <v-row>
                    <v-col>
                      <BaseDateField
                        v-model="filters.startDate"
                        :disabled="!filters.id_acao.length"
                        :label="$t('start-date-label')"
                        :required="true"
                        outlined
                      />
                    </v-col>
                    <v-col>
                      <BaseDateField
                        v-model="filters.endDate"
                        :disabled="!filters.id_acao.length"
                        :label="$t('end-date-label')"
                        :required="true"
                        :min-date="filters.startDate"
                        flex-row
                        outlined
                      />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col>
                  <v-btn
                    :disabled="!filters.id_acao.length"
                    block
                    color="accent"
                    :loading="isLoadingFeatures"
                    @click="search"
                  >
                    {{ $t('search-label') }}
                  </v-btn>
                </v-col>
                <!--
                  TODO:
                  O CÓDIGO ABAIXO SERÁ UTILIZADO E MODIFICADO FUTURAMENTE
                  PARA IMPLEMENTAR A FUNCIONALIDADE DE UPLOAD DE ARQUIVOS
                -->

                <!-- <DocumentUploadDialog /> -->
              </v-row>
            </v-container>
          </v-card-text>
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
                <v-col cols="2">
                  <v-text-field
                    v-model="filter"
                    append-icon="mdi-magnify"
                    :label="$t('filter-label')"
                    single-line
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-container>
            <v-container fluid>
              <v-skeleton-loader
                v-if="isLoadingFeatures"
                type="table-row-divider@10"
              />
              <v-data-table
                v-if="!isLoadingFeatures"
                :headers="headers"
                :items="values"
                :search="filter"
                fixed-header
                height="45vh"
              >
                <template #[`item.actions`]="{ item }">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-icon
                        v-bind="attrs"
                        dense
                        class="mr-2"
                        v-on="on"
                        @click="showDocument(item)"
                      >
                        mdi-download
                      </v-icon>
                    </template>
                    <span>{{ $t('download-label-tooltip') }}</span>
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
            "start-date-label": "Start Date",
            "end-date-label": "End Date",
            "dialogName": "DOCUMENT SEARCH",
            "result-label": "Results",
            "filter-label": "Filter",
            "action-label": "Actions",
            "download-label-tooltip": "Download",
            "view-label-tooltip": "Preview"

        },
        "pt-br": {
            "search-label": "Buscar",
            "start-date-label": "Data Início",
            "end-date-label": "Data Fim",
            "dialogName": "PESQUISA DE DOCUMENTOS",
            "result-label": "Resultados",
            "filter-label": "Filtrar",
            "action-label": "Ações",
            "download-label-tooltip": "Download",
            "view-label-tooltip": "Visualizar"
        }
    }
</i18n>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import BaseDateField from '@/components/base/BaseDateField';
import legend from '@/assets/legend.png';
import DocumentUploadDialog from '@/components/document-dialog/DocumentUploadDialog';

export default {
  name: 'DocumentDialog',

  components: { BaseDateField, DocumentUploadDialog },

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
      filtersData: {},
      isLoadingTotal: false,
      legendData: legend,
      filter: '',
      headers: [
        { text: 'Nome do Documento', value: 'no_document' },
        { text: 'Inserido Por', value: 'usercmr_id.first_name' },
        { text: 'Data Cadastro', value: 'dt_registration' },
        { text: 'Extensão', value: 'no_extension' },
        { text: 'Ação', value: 'action_id.no_action' },
        { text: 'Ações', value: 'actions' },
      ],
      values: [],
    };
  },

  computed: {
    ...mapState('document', [
      'features',
      'isLoadingFeatures',
      'filterOptions',
      'showFeatures',
      'showDialogDocument',
      'isLoadingDocumentActions',
      'actions',
    ]),
  },

  watch: {
    'filters.cr': function filterCr(value) {
      this.populateTiOptions(value);
    },
    features(val) {
      this.values = val;
    },
  },

  mounted() {
    this.getDocumentActions('DOCUMENTS_TI');
    this.getFilterOptions();
  },

  methods: {
    populateTiOptions(cr) {
      if (cr) this.$store.dispatch('document/getTiOptions', cr);
      else this.filters.ti = null;
    },

    closeDialog(value) {
      this.setShowDialogDocument(value);
    },

    showDocument(item) {
      if (item.url_doc) {
        window.open(item.url_doc, '_blank');
      }
    },

    search() {
      this.getFeatures({ ...this.filters });
    },

    ...mapMutations('document', [
      'setFilters',
      'setShowDialogDocument',
      'setLoadingTable',
    ]),
    ...mapActions('document', [
      'getFilterOptions',
      'getDocumentActions',
      'getFeatures',
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
