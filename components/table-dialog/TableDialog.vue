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
      <v-card>
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
          <a class="d-flex justify-end">
            <v-btn
              small
              fab
              class="mx-2 my-2"
              color="secondary"
              :loading="isDownloading"
              @click="handleDownloadClick"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </a>
          <v-data-table
            :headers="headers"
            :items-per-page="5"
            :items="value"
            class="font-weight-regular"
            multi-sort
            fixed-header
            mobile-breakpoint="0"
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
    loadingCSV: {
      type: Boolean,
      required: false,
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

<i18n>
{
  "en": {
    "confirm-dialog-title": "Confirmation",
    "confirm-dialog-message1": "Due to technical limitations, the generated table has a maximum limit of 10,000 features. The executed query generated a higher number of polygons, so it is possible that not all polygons will be available in the generated file.",
    "confirm-dialog-message2": "If you need to download the complete data, please contact the CMR team via Contact Us on the platform or by email ",
    "description-label-3": "Due to technical limitations, the generated file has a maximum limit of 10,000 features. The query made generated a number of polygons greater than that, so it is possible that not all polygons will be available in the generated file.",
    "description-label-4": "If you need to download the complete data, please contact the CMR team via Contact Us on the platform or by email ",
    "confirm": "Confirm",
    "acknowledge-label": "Acknowledge",
    "download-label": "Download",
    "cancel": "Cancel"
  },
  "pt-br": {
    "confirm-dialog-title": "Atenção",
    "confirm-dialog-message1": "Devido a limitações técnicas, a tabela gerada possui o limite máximo de 10.000 feições. A consulta efetuada gerou um número superior de polígonos, de forma que é possível nem todos os polígonos estarão disponíveis no arquivo gerado.",
    "confirm-dialog-message2": "Em caso de necessidade de download dos dados completos, entre em contato com a equipe da CMR por meio do Fale Conosco na plataforma ou pelo e-mail ",
    "description-label-3": "Devido a limitações técnicas, os arquivo gerado possui o limite máximo de 10.000 feições. A consulta efetuada gerou um número superior de polígonos, de forma que é possível nem todos os polígonos estarão disponíveis no arquivo gerado.",
    "description-label-4": "Em caso de necessidade de download dos dados completos, entre em contato com a equipe da CMR por meio do Fale Conosco na plataforma ou pelo e-mail ",
    "confirm": "Confirmar",
    "acknowledge-label": "Ciente",
    "download-label": "Baixar",
    "cancel": "Cancelar"
  }
}
</i18n>
