<template>
  <v-row>
    <v-dialog
      v-model="localTable"
      transition="dialog-bottom-transition"
      persistent
      no-click-animation
      width="80vw"
      :fullscreen="$vuetify.breakpoint.smAndDown"
    >
      <v-card max-height="80vh">
        <v-toolbar
          dark
          color="secondary"
        >
          <h3>{{ tableName }}</h3>
          <v-spacer />
          <v-btn
            icon
            @click="fCloseTable(false)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-skeleton-loader
          v-if="loadingTable"
          type="table-row-divider@8"
          class="mx-6"
        />

        <v-card-text v-if="!loadingTable">
          <div class="d-flex justify-end ma-4">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  small
                  fab
                  color="secondary"
                  v-bind="attrs"
                  v-on="on"
                  @click="handleDownloadConfirmed"
                >
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('download-csv') }}</span>
            </v-tooltip>
          </div>

          <v-data-table
            :headers="headers"
            :items-per-page="5"
            :items="value"
            class="font-weight-regular table-height"
            multi-sort
            height="50vh"
            fixed-header
            mobile-breakpoint="0"
            :footer-props="{
              itemsPerPageText: $t('itemsPerPageText'),
              itemsPerPageAllText: $t('itemsPerPageAllText'),
              pageText: $t('pageText'),
              showFirstLastPage: true,
            }"
            :no-data-text="$t('noDataText')"
            :loading-text="$t('loadingText')"
          >
            <template
              v-if="[item.prioridade]"
              #[`item.prioridade`]="{ item }"
            >
              <v-row>
                <v-col>
                  <v-chip
                    class="mt-2"
                    :color="getColor(item.prioridade)"
                    :dark="getColor(item.prioridade) !== 'yellow'"
                  >
                    {{ item.prioridade }}
                  </v-chip>
                </v-col>
              </v-row>
            </template>
            <template
              v-if="[item.action]"
              #[`item.actions`]="{ item }"
            >
              <MapPrinterPriority
                class="mx-2 mb-2"
                :value="dialogPrint"
              />
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="confirmDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t('confirm-dialog-title') }}
        </v-card-title>
        <v-card-text class="mt-4">
          {{ $t('confirm-dialog-message1') }}
        </v-card-text>
        <v-card-text>
          {{ $t('confirm-dialog-message2') }}
          <span>
            <a href="mailto:cmr@funai.gov.br">cmr@funai.gov.br</a>.
          </span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="confirmDialog = false"
          >
            <v-icon>mdi-check</v-icon>
            {{ $t('acknowledge-label') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="downloadDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t('confirm-dialog-title') }}
        </v-card-title>
        <v-card-text class="mt-4">
          <p>{{ $t('description-label-3') }}</p>
        </v-card-text>
        <v-card-text>
          <p>
            {{ $t('description-label-4') }}
            <a href="mailto:cmr@funai.gov.br">cmr@funai.gov.br</a>.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="downloadDialog = false"
          >
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            :loading="isDownloading"
            @click="handleDownloadConfirmed"
          >
            <v-icon v-if="!isDownloading">
              mdi-download
            </v-icon>
            {{ $t('download-label') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<i18n>
{
  "en": {
    "confirm-dialog-title": "Attention",
    "confirm-dialog-message1": "Due to technical limitations, the generated table has a maximum limit of 10,000 features. The query performed generated a higher number of polygons, so it is possible that not all polygons will be available in the generated file.",
    "confirm-dialog-message2": "If you need to download the complete data, please contact the CMR team through the Contact Us on the platform or by email ",
    "acknowledge-label": "I understand",
    "itemsPerPageText": "Items per page:",
    "itemsPerPageAllText": "All",
    "pageText": "{0}-{1} of {2}",
    "noDataText": "No data available",
    "loadingText": "Loading items...",
    "download-csv": "Download CSV"
  },
  "pt-br": {
    "confirm-dialog-title": "Atenção",
    "confirm-dialog-message1": "Devido a limitações técnicas, a tabela gerada possui o limite máximo de 10.000 feições. A consulta efetuada gerou um número superior de polígonos, de forma que é possível nem todos os polígonos estarão disponíveis no arquivo gerado.",
    "confirm-dialog-message2": "Em caso de necessidade de download dos dados completos, entre em contato com a equipe da CMR por meio do Fale Conosco na plataforma ou pelo e-mail ",
    "acknowledge-label": "Entendi",
    "itemsPerPageText": "Itens por página:",
    "itemsPerPageAllText": "Todos",
    "pageText": "{0}-{1} de {2}",
    "noDataText": "Nenhum dado disponível",
    "loadingText": "Carregando itens...",
    "download-csv": "Baixar CSV"
  }
}
</i18n>

<script>
import { mapMutations } from 'vuex';
import MapPrinterPriority from '../priority/MapPrinterPriority.vue';

export default {
  name: 'TableDialog',

  components: { MapPrinterPriority },

  props: {
    table: {
      type: Boolean,
      required: true,
    },
    headers: {
      type: Array,
      required: true,
      default: () => [],
    },
    value: {
      type: Array,
      required: true,
      default: () => [],
    },
    loadingTable: {
      type: Boolean,
      required: true,
    },
    fCloseTable: {
      type: Function,
      required: true,
      default: () => () => {},
    },
    tableName: {
      type: String,
      required: true,
      default: '',
    },
    fDownloadCSV: {
      type: Function,
      required: true,
      default: () => () => {},
    },
  },

  data() {
    return {
      confirmDialog: false,
      downloadDialog: false,
      isDownloading: false,
      row: null,
      dialogPrint: false,
      selected: [],
      detail: [],
      featuresIndividual: null,
      geometry: true,
    };
  },

  computed: {
    localTable: {
      get() {
        return this.table;
      },
      set(value) {
        this.fCloseTable(value);
      },
    },
  },

  watch: {
    value(val) {
      if (val && val.length >= 10000) this.confirmDialog = true;
    },
  },

  methods: {
    ...mapMutations('priority', [
      'setDetail',
      'setfeaturesIndividual',
    ]),

    getColor(prioridade) {
      switch (prioridade) {
        case 'Muito Alta':
          return '#9400D3';
        case 'Alta':
          return 'red';
        case 'Media':
          return 'orange';
        case 'Baixa':
          return 'yellow';
        case 'Muito Baixa':
          return 'green';
        default:
          return 'gray';
      }
    },

    async handleDownloadClick() {
      if (this.value.length >= 10000) {
        this.downloadDialog = true;
      } else {
        await this.startDownload();
      }
    },

    async handleDownloadConfirmed() {
      this.downloadDialog = false;
      await this.startDownload();
    },

    async startDownload() {
      this.isDownloading = true;
      try {
        await this.fDownloadCSV();
      } catch (error) {
        console.error('Erro durante o download:', error);
      } finally {
        this.isDownloading = false;
      }
    },
  },
};
</script>

<style scoped>
.table-height {
  max-height: 100%;
  overflow-y: auto;
}
</style>
