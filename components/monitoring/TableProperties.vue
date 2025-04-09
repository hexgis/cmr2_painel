<template>
  <v-dialog
    v-model="tableDialogMonitoring"
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
          @click="tableDialogMonitoring = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mt-4">
        <a class="d-flex justify-end">
          <v-btn
            small
            fab
            class="mx-2 my-2"
            color="secondary"
            :loading="false"
            @click="downloadTableMonitoring"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </a>

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
          <!-- :height="$vuetify.breakpoint.smAndDown ? '' : '65vh'" -->
          <template
            v-if="[item.prioridade]"
            #[`item.prioridade`]="{ item }"
          >
            <v-row>
              <v-col>
                <v-chip
                  class="mt-2"
                  :color="getColor(item.prioridade)"
                  :dark="
                    getColor(item.prioridade) !== 'yellow'
                  "
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

export default {
  name: 'TablePropertiesMonitoring',

  components: {},

  //   props: {
  //     table: {
  //       type: Boolean,
  //       require: true,
  //     },
  //   },

  data() {
    return {
      headers: [
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
    tableDialogMonitoring: {
      get() {
        return this.$store.state.tableDialog.showTableDialog;
      },

      set(value) {
        this.$store.commit('tableDialog/setshowTableDialog', value);
      },
    },

    tablePropertiesTotal() {
      return this.$store.state.monitoring.tableMonitoringTableOptions
        .totalItems || 5;
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
    ...mapState('tableDialog', ['showTableDialog']),
  },

  methods: {
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
