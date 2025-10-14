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
    "download-csv": "Download CSV"
  },
  "pt-br": {
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

    escapeCSVValue(value) {
      if (value === null || value === undefined) return '';
      const stringValue = value.toString();
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    },

    handleDownloadCSV() {
      const headers = this.headers.map((header) => this.escapeCSVValue(header.text));
      const headerRow = headers.join(',');

      const dataRows = this.value.map((item) => this.headers.map((header) => this.escapeCSVValue(item[header.value])).join(','));

      const csvContent = [headerRow, ...dataRows].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${this.tableName || 'tabela'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
