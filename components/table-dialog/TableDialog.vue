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
        />
        <v-card-text v-if="!loadingTable">
          <a class="d-flex justify-end">
            <v-btn
              small
              fab
              class="mx-2 my-2"
              color="secondary"
              :loading="loadingCSV"
              @click="handleDownloadCSV"
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
  },

  data() {
    return {
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

    closeAnalyticalDialog(value) {
      this.dialog = value;
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
