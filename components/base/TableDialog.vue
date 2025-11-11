<template>
  <v-row>
    <v-dialog
      v-model="localTable"
      transition="dialog-bottom-transition"
      persistent
      no-click-animation
      width="70vw"
      :fullscreen="$vuetify.breakpoint.smAndDown"
    >
      <v-card>
        <v-toolbar
          dark
          color="secondary"
          dense
        >
          <h3>{{ tableName }}</h3>
          <v-spacer />
          <v-btn
            icon
            small
            @click="fCloseTable(false)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <div class="d-flex justify-end ma-4">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  x-small
                  fab
                  color="secondary"
                  v-bind="attrs"
                  v-on="on"
                  @click="handleDownloadCSV"
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
            :items="table"
            class="font-weight-regular table-height"
            multi-sort
            height="50vh"
            :loading="loadingTable"
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
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<i18n>
{
  "en": {
    "itemsPerPageText": "Items per page:",
    "itemsPerPageAllText": "All",
    "pageText": "{0}-{1} of {2}",
    "noDataText": "No data available",
    "loadingText": "Loading items...",
    "download-csv": "Download CSV",
    "no-data-to-export": "No data available for export",
    "preparing-download": "Preparing download...",
    "csv-download-success": "CSV generated successfully!",
    "csv-download-error": "Error generating CSV. Please try again."
  },
  "pt-br": {
    "itemsPerPageText": "Itens por página:",
    "itemsPerPageAllText": "Todos",
    "pageText": "{0}-{1} de {2}",
    "noDataText": "Nenhum dado disponível",
    "loadingText": "Carregando itens...",
    "download-csv": "Baixar CSV",
    "no-data-to-export": "Nenhum dado disponível para exportação",
    "preparing-download": "Preparando download...",
    "csv-download-success": "CSV gerado com sucesso!",
    "csv-download-error": "Erro ao gerar CSV. Tente novamente."
  }
}
</i18n>

<script>
export default {
  name: 'TableDialog',

  props: {
    table: {
      type: Array,
      required: true,
      default: () => [],
    },
    headers: {
      type: Array,
      required: true,
      default: () => [],
    },
    value: {
      type: Boolean,
      required: true,
      default: false,
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
  },

  data() {
    return {
      dialogPrint: false,
    };
  },

  computed: {
    localTable: {
      get() {
        return this.value;
      },
      set(value) {
        this.fCloseTable(value);
      },
    },
  },

  methods: {
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

    /**
     * Downloads table data as CSV
     * @returns {Promise<void>}
     */
    async handleDownloadCSV() {
      try {
        const confirmed = await this.$confirm({
          typeDescription: 'detailed',
          descriptionFirst: this.$i18n.t('monitoring-description-label-1'),
          descriptionSecond: this.$i18n.t('monitoring-description-label-2'),
          confirm: this.$i18n.t('download'),
          iconConfirm: 'mdi-download',
          iconCancel: 'mdi-close',
        });

        if (!confirmed) return;

        if (!this.table || !this.table.length) {
          if (this.$toast) {
            this.$toast.warning(this.$t('no-data-to-export'));
          }
          return;
        }

        if (this.$toast) {
          this.$toast.info(this.$t('preparing-download'));
        }

        // Convert headers and data dynamically
        const csvHeaders = this.headers.map((h) => h.text || h.value || h);
        const csvData = this.table.map((row) => {
          const cleanRow = {};
          this.headers.forEach((header, i) => {
            const key = header.value || header;
            const value = row[key];
            cleanRow[csvHeaders[i]] = (value && typeof value === 'object')
              ? (value.name || value.text || value.label || String(value))
              : value;
          });
          return cleanRow;
        });

        const result = await this.$downloader.csv(
          csvData,
          csvHeaders,
          this.tableName || 'tabela',
          {
            includeTimestamp: true,
            dateFormat: 'br',
            delimiter: ',',
            encoding: 'utf-8',
          },
        );

        if (this.$toast) {
          this.$toast.success(`${this.$t('csv-download-success')} (${result.recordCount} registros)`);
        }
      } catch (error) {
        if (this.$toast) {
          this.$toast.error(this.$t('csv-download-error'));
        }
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
