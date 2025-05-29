<template>
  <v-dialog
    v-model="showTableDialogMonitoring"
    width="80vw"
    persistent
    no-click-animation
    :fullscreen="$vuetify.breakpoint.smAndDown"
  >
    <v-card>
      <v-toolbar
        dark
        color="secondary"
      >
        <h3>{{ $t('table-label') }}</h3>
        <v-spacer />
        <v-btn
          icon
          @click="setShowTableDialogMonitoring(false)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mt-4">
        <v-row no-gutters>
          <v-spacer />
          <DialogConfirmDownload table />
        </v-row>

        <v-data-table
          :headers="headers"
          :items-per-page="tablePropertiesItemsPerPage"
          :page="tablePropertiesPage"
          :items="tableMonitoring"
          :loading="loadingSearchTableMonitoring"
          :disable-filtering="loadingSearchTableMonitoring"
          :disable-pagination="loadingSearchTableMonitoring"
          :disable-sort="loadingSearchTableMonitoring"
          :server-items-length="tablePropertiesTotal"
          :footer-props="{
            itemsPerPageOptions: [5, 10, 50, tablePropertiesTotal],
          }"
          class="font-weight-regular"
          multi-sort
          fixed-header
          mobile-breakpoint="0"
          @update:options="onOptionsUpdate"
        >
          <!-- Template dinâmico para todas as colunas -->
          <template
            v-for="header in headers"
            #[`item.${header.value}`]="{ item }"
          >
            <!-- Caso especial para prioridade -->
            <template v-if="header.value === 'prioridade'">
              <v-chip
                :key="`chip-${item.origin_id}-${header.value}`"
                class="mt-2"
                :color="getColor(item[header.value])"
                :dark="getColor(item[header.value]) !== 'yellow'"
              >
                {{ item[header.value] }}
              </v-chip>
            </template>

            <!-- Caso especial para ações -->
            <template v-else-if="header.value === 'actions'">
              <MapPrinterPriority
                :key="`map-printer-${item.origin_id}-${header.value}`"
                class="mx-2 mb-2"
                :value="dialogPrint"
              />
            </template>

            <!-- Formatação padrão para outras colunas -->
            <template v-else>
              {{ formatFieldValue(item[header.value], header.value) }}
            </template>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<i18n>
{
  "en": {
    "table-label": "Table"
  },
  "pt-br": {
    "table-label": "Tabela"
  }
}
</i18n>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import DialogConfirmDownload from './DialogConfirmDownload.vue';

export default {
  name: 'TablePropertiesMonitoring',

  components: { DialogConfirmDownload },

  //   props: {
  //     table: {
  //       type: Boolean,
  //       require: true,
  //     },
  //   },

  data() {
    return {
      headers: [
        { text: 'ID', value: 'origin_id' },
        { text: 'Código Funai', value: 'co_funai' },
        { text: 'Terra Indígena', value: 'no_ti' },
        { text: 'Coordenação Regional', value: 'ds_cr' },
        { text: 'Classe', value: 'no_estagio' },
        { text: 'Data da Imagem', value: 'dt_imagem' },
        { text: 'Área do Polígono (ha)', value: 'nu_area_ha' },
        { text: 'Latitude', value: 'nu_latitude' },
        { text: 'Longitude', value: 'nu_longitude' },
      ],
    };
  },

  computed: {
    tablePropertiesTotal() {
      return (
        this.$store.state.monitoring.tableMonitoringTableOptions
          .totalItems || 5
      );
    },

    tablePropertiesPage: {
      get() {
        return this.$store.state.monitoring.tableMonitoringTableOptions
          .page;
      },

      set(value) {
        this.$store.commit('monitoring/setTablePropertiesPage', value);
      },
    },

    tablePropertiesItemsPerPage: {
      get() {
        return this.$store.state.monitoring.tableMonitoringTableOptions
          .itemsPerPage;
      },

      set(value) {
        this.$store.commit(
          'monitoring/setTablePropertiesItemsPerPage',
          value,
        );
      },
    },

    ...mapState('monitoring', [
      'showTableDialogMonitoring',
      'loadingSearchTableMonitoring',
      'tableMonitoring',
      'tableMonitoringTableOptions',
    ]),
  },

  methods: {
    formatFieldValue(value, field = '') {
      if (value === null || value === undefined) {
        return 'N/A';
      }

      const fieldName = field.toLowerCase();

      const isDateField = (
        typeof value === 'string'
        && (fieldName.startsWith('dt_') || fieldName.startsWith('data_') || fieldName.startsWith('date'))
        && this.$moment(value).isValid()
      );

      const isBooleanField = typeof value === 'boolean';

      const isNumberField = typeof value === 'number';

      const isLatLongField = ['lat', 'lng', 'long', 'latitude', 'longitude'].some((key) => fieldName.includes(key));

      if (isDateField) {
        return this.$moment(value).format('DD/MM/YYYY');
      }

      if (isBooleanField) {
        return value ? 'Adm' : 'Não';
      }

      if (isNumberField || fieldName.startsWith('nu_')) {
        if (isLatLongField) {
          return value.toFixed(5);
        }
        if (typeof value === 'string') {
          // eslint-disable-next-line no-param-reassign
          value = parseFloat(value);
        }
        const rounded = value.toFixed(2);
        const [intPart, decimalPart] = rounded.split('.');

        return decimalPart !== '00' || (fieldName.startsWith('nu_') && fieldName.includes('area'))
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`
          : parseInt(value, 10);
      }

      // 5. Valor padrão (string ou outros)
      return value || 'N/A';
    },

    getColor(prioridade) {
      switch (prioridade) {
        case 'Muito Alta':
          return '#9400D3';
          break;
        case 'Alta':
          return 'red';
          break;
        case 'Media':
          return 'orange';
          break;
        case 'Baixa':
          return 'yellow';
          break;
        case 'Muito Baixa':
          return 'green';
          break;
        default:
          break;
      }
    },

    onOptionsUpdate(newOptions) {
      const currentOptions = this.tableMonitoringTableOptions;

      const hasChanged = newOptions.itemsPerPage !== currentOptions.itemsPerPage
                || newOptions.page !== currentOptions.page;

      if (!hasChanged) return;

      this.setTableMonitoringTableOptions({
        itemsPerPage: newOptions.itemsPerPage,
        page: newOptions.page,
      });

      this.$store.dispatch('monitoring/getPropertiesTableMonitoring');
    },

    ...mapMutations('monitoring', [
      'setShowTableDialogMonitoring',
      'getPropertiesTableMonitoring',
      'setTableMonitoringTableOptions',
    ]),
    ...mapActions('monitoring', ['downloadTableMonitoring']),
  },

  mounted() {
    this.$store.dispatch('monitoring/getPropertiesTableMonitoring');
  },
};
</script>
