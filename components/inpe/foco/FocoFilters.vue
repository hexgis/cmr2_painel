<template>
  <div>
    <v-col class="px-4">
      <template>
        <v-row>
          <v-col cols="9">
            <v-checkbox
              v-model="filters.currentView"
              :label="$t('current-view-label')"
              :error="error"
              hide-details
            />
          </v-col>
          <v-col cols="3">
            <div class="d-flex justify-end align-center mt-1">
              <v-switch
                v-if="currentUrlWms && (switchAquaMM || switchAquaMT)"
                v-model="showActiveFeatures"
                class="mt-3"
                hide-details
                :title="$t('title-switch-disable-features')"
              />
            </div>
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="filters.cr"
              :label="$t('regional-coordination-label')"
              :items="flattened"
              item-value="co_cr"
              item-text="ds_cr"
              hide-details
              clearable
              multiple
              :error="error"
              class="pa-0"
              outlined
            />
          </v-col>
          <v-col cols="12">
            <v-slide-y-transition>
              <v-combobox
                v-if="filters.cr && filterOptions.tiFilters"
                v-model="filters.ti"
                :label="$t('indigenous-lands-label')"
                :items="filterOptions.tiFilters"
                item-text="no_ti"
                item-value="co_funai"
                hide-details
                multiple
                clearable
                class="pa-0"
                outlined
              />
            </v-slide-y-transition>
          </v-col>
        </v-row>
        <v-row class="pt-3">
          <v-col class="py-0 full-width">
            <BaseDateField
              v-model="filters.startDate"
              :label="$t('start-date-label')"
              :required="true"
              outlined
              :min-date="'2015-01-01'"
            />
          </v-col>
          <v-col class="py-0 full-width">
            <BaseDateField
              v-model="filters.endDate"
              :label="$t('end-date-label')"
              :required="true"
              outlined
              :min-date="'2015-01-01'"
            />
          </v-col>
        </v-row>
        <v-row no-gutters align="center" class="mt-3">
          <v-col>
            <v-btn
              block
              small
              color="primary"
              outlined
              :loading="loading"
              @click="searchFoco"
            >
              {{ $t('search-label') }}
            </v-btn>
          </v-col>
        </v-row>

        <template v-if="searchPerformed">
          <v-divider class="mt-4" />

          <!-- AQUA M-M Section -->
          <v-row class="align-center mt-2">
            <v-icon color="yellow" class="ml-1">mdi-fire</v-icon>
            <span class="ml-1">AQUA (Sensor MODIS - Manhã)</span>
            <v-spacer />
            <v-switch
              v-model="switchAquaMM"
              class="ml-2"
              @change="toggleLayer('aquaMM')"
            />
          </v-row>
          <v-row v-if="switchAquaMM" align="center" class="mt-n6">
            <v-col cols="12" class="mt-n1 mb-n4">
              <v-btn
                icon
                small
                color="accent"
                :loading="isLoadingTable"
                @click="showTableDialog('aquaMM')"
              >
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-icon v-on="on">mdi-table</v-icon>
                  </template>
                  <span>{{ $t('table-label') }}</span>
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-divider />
            </v-col>
            <v-col cols="4" class="grey--text text--darken-2">
              {{ $t('opacity-label') }}
            </v-col>
            <v-col cols="8">
              <v-slider
                v-model="opacityAquaMM"
                hide-details
                thumb-label
                @input="handleOpacityChange('aquaMM', $event)"
              />
            </v-col>
          </v-row>

          <!-- AQUA M-T Section -->
          <v-row class="align-center mt-n2">
            <v-icon color="red" class="ml-1">mdi-fire</v-icon>
            <span class="ml-1">AQUA (Sensor MODIS - Tarde)</span>
            <v-spacer />
            <v-switch
              v-model="switchAquaMT"
              class="ml-2"
              @change="toggleLayer('aquaMT')"
            />
          </v-row>
          <v-row v-if="switchAquaMT" align="center" class="mt-n6">
            <v-col cols="12" class="mt-n1 mb-n4">
              <v-btn
                icon
                small
                color="accent"
                :loading="isLoadingTable"
                @click="showTableDialog('aquaMT')"
              >
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-icon v-on="on">mdi-table</v-icon>
                  </template>
                  <span>{{ $t('table-label') }}</span>
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-divider />
            </v-col>
            <v-col cols="4" class="grey--text text--darken-2">
              {{ $t('opacity-label') }}
            </v-col>
            <v-col cols="8">
              <v-slider
                v-model="opacityAquaMT"
                hide-details
                thumb-label
                @input="handleOpacityChange('aquaMT', $event)"
              />
            </v-col>
          </v-row>
        </template>

        <TableDialog
          :table="tableDialog"
          :headers="tableHeaders"
          :value="tableData"
          :loadingTable="isLoadingTable"
          :loadingCSV="isLoadingCSV"
          :tableName="tableName"
          :fCloseTable="closeTableDialog"
          :fDownloadCSV="downloadCSV"
        />
      </template>
    </v-col>
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions, mapGetters } from 'vuex';
import legend from '@/assets/legend.png';
import BaseDateField from '@/components/base/BaseDateField';
import TableDialog from '../../table-dialog/TableDialog.vue';

export default {
  name: 'FocoFilters',
  components: { BaseDateField, TableDialog },

  data() {
    const initialFilters = {
      startDate: this.$moment().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate: this.$moment().format('YYYY-MM-DD'),
      currentView: false,
      cr: [],
      ti: null,
    };

    return {
      filters: JSON.parse(JSON.stringify(initialFilters)),
      checkNewFilters: false,
      isLoadingTotal: false,
      legendData: legend,
      error: false,
      flattened: [],
      tableDialog: false,
      tableData: [],
      tableHeaders: [],
      tableName: '',
      isLoadingTable: false,
      isLoadingCSV: false,
      switchAquaMM: false,
      switchAquaMT: false,
      opacityAquaMM: 100,
      opacityAquaMT: 100,
      searchPerformed: false,
    };
  },

  computed: {
    ...mapState('foco', ['filterOptions', 'isLoadingFeatures', 'layers']),
    ...mapGetters('foco', ['featuresLoaded']),

    showActiveFeatures: {
      get() {
        if (this.switchAquaMM) return this.layers.aquaMM.showFeatures;
        if (this.switchAquaMT) return this.layers.aquaMT.showFeatures;
        return false;
      },
      set(value) {
        if (this.switchAquaMM) {
          this.setShowFeatures({ layer: 'aquaMM', showFeatures: value });
        }
        if (this.switchAquaMT) {
          this.setShowFeatures({ layer: 'aquaMT', showFeatures: value });
        }
      },
    },

    opacity: {
      get() {
        return this.layers.aquaMM.opacity;
      },
      set(value) {
        this.setOpacity({ layer: 'aquaMM', opacity: value });
        this.setOpacity({ layer: 'aquaMT', opacity: value });
      },
    },

    loading() {
      return this.layers.aquaMM.loading || this.layers.aquaMT.loading;
    },

    currentUrlWms() {
      return this.layers.aquaMM.currentUrlWms || this.layers.aquaMT.currentUrlWms;
    },

    availableFields() {
      return {
        aquaMM: ['id', 'dt_foco_calor', 'hr_foco_calor', 'latitude', 'longitude',
                'no_municipio', 'no_uf', 'no_satelite', 'sg_regiao', 'prioridade',
                'no_ti', 'co_funai'],
        aquaMT: ['id', 'dt_foco_calor', 'hr_foco_calor', 'latitude', 'longitude',
                'no_municipio', 'no_uf', 'no_satelite', 'sg_regiao', 'prioridade',
                'no_ti', 'co_funai']
      };
    },

    fieldConfig() {
      return {
        fieldNames: {
          id: 'ID',
          dt_foco_calor: 'Data',
          hr_foco_calor: 'Horário',
          latitude: 'Latitude',
          longitude: 'Longitude',
          no_municipio: 'Município',
          no_uf: 'Estado',
          no_satelite: 'Satélite',
          sg_regiao: 'Região',
          prioridade: 'Prioridade',
          no_ti: 'Terra Indígena',
          co_funai: 'Código Funai'
        }
      };
    }
  },

  watch: {
    'filters.cr': function (value) {
      const arrayCrPoulate = [];
      Object.values(value).forEach((item) => {
        arrayCrPoulate.push(item.co_cr);
      });
      this.populateTiOptions(arrayCrPoulate);
    },

    'filterOptions.regionalFilters': function () {
      this.populateCrOptions();
    },
  },

  mounted() {
    this.getFilterOptions();
  },

  methods: {
    handleOpacityChange(layer, value) {
      this.setOpacity({ layer, opacity: value });
    },

    populateCrOptions() {
      const groups = {};

      this.filterOptions.regionalFilters.forEach((x) => {
        groups[x.no_regiao] = groups[x.no_regiao] || {
          ds_cr: x.ds_cr,
          list: [],
        };

        groups[x.no_regiao].list.push(x);
      });

      Object.keys(groups).forEach((categoryId) => {
        const category = groups[categoryId];
        const categoryRegiao = categoryId;
        this.flattened.push({ header: categoryRegiao });
        this.flattened.push(...category.list);
      });

      return this.flattened;
    },

    populateTiOptions(cr) {
      if (cr) this.getTiOptions(cr);
    },

    async searchFoco() {
      const { currentView, cr, startDate, endDate } = this.filters;

      if ((currentView || cr.length) && startDate && endDate) {
        this.error = false;

        if (new Date(endDate) < new Date(startDate)) {
          this.error = true;
          this.$store.commit(
            'alert/addAlert',
            {
              message: this.$i18n.t('A data final deve ser maior ou igual à data inicial'),
            },
            { root: true },
          );
          return;
        }

        this.showActiveFeatures = false;

        this.setFilters({ layer: 'aquaMM', filters: this.filters });
        this.setFilters({ layer: 'aquaMT', filters: this.filters });
        await this.getFeatures('aquaMM');
        await this.getFeatures('aquaMT');

        this.searchPerformed = true;
        this.switchAquaMM = true;
        this.switchAquaMT = true;
        this.setShowFeatures({ layer: 'aquaMM', showFeatures: true });
        this.setShowFeatures({ layer: 'aquaMT', showFeatures: true });

        this.setOpacity({ layer: 'aquaMM', opacity: this.opacityAquaMM });
        this.setOpacity({ layer: 'aquaMT', opacity: this.opacityAquaMT });

        return;
      }
      this.error = true;
    },

    toggleLayer(layer) {
      if (layer === 'aquaMM') {
        if (this.switchAquaMM) {
          this.setShowFeatures({ layer, showFeatures: true });
        } else {
          this.setShowFeatures({ layer, showFeatures: false });
        }
      } else if (layer === 'aquaMT') {
        if (this.switchAquaMT) {
          this.setShowFeatures({ layer, showFeatures: true });
        } else {
          this.setShowFeatures({ layer, showFeatures: false });
        }
      }
    },

    async showTableDialog(layer) {
      this.isLoadingTable = true;
      this.tableDialog = true;
      this.tableName = layer === 'aquaMM' ? 'AQUA (Sensor MODIS - Manhã)' : 'AQUA (Sensor MODIS - Tarde)';

      try {
        console.log(`Iniciando carregamento da tabela para ${layer}`);

        // Verifica se os dados já estão carregados
        if (!this.featuresLoaded(layer)) {
          console.log(`Dados não carregados para ${layer}, buscando...`);
          await this.getFeatures(layer);
        }

        // Cria os cabeçalhos dinamicamente
        this.tableHeaders = this.availableFields[layer].map(field => ({
          text: this.fieldConfig.fieldNames[field] || this.formatGenericFieldName(field),
          value: field
        }));

        // Obtém os dados da store
        const features = this.$store.state.foco.layers[layer].features?.features || [];
        console.log(`Dados obtidos para ${layer}:`, features);

        if (features.length === 0) {
          console.warn(`Nenhum dado encontrado para ${layer}`);
          this.$store.commit('alert/addAlert', {
            message: 'Nenhum dado encontrado para exibir na tabela'
          }, { root: true });
          return;
        }

        // Formata os dados para a tabela
        this.tableData = features.map(feature => {
          const row = {};
          this.availableFields[layer].forEach(field => {
            row[field] = this.formatFieldValue(feature.properties[field], field);
          });
          return row;
        });

        console.log(`Dados formatados para tabela ${layer}:`, this.tableData);

      } catch (error) {
        console.error(`Erro ao carregar dados para ${layer}:`, error);
        this.$store.commit('alert/addAlert', {
          message: 'Erro ao carregar dados para a tabela'
        }, { root: true });
      } finally {
        this.isLoadingTable = false;
      }
    },

    formatFieldValue(value, field = '') {
      if (value === null || value === undefined) return 'N/A';

      const fieldName = field.toLowerCase();

      // Formatação de data
      if ((fieldName.startsWith('dt_') || fieldName.includes('data')) &&
          this.$moment(value).isValid()) {
        return this.$moment(value).format('DD/MM/YYYY');
      }

      // Formatação de hora
      if (fieldName.startsWith('hr_') || fieldName.includes('hora')) {
        if (this.$moment(value, 'HH:mm:ss', true).isValid()) {
          return this.$moment(value, 'HH:mm:ss').format('HH:mm');
        }
        return value; // Retorna o valor original se não puder ser formatado
      }

      // Formatação de números decimais para coordenadas
      if (['latitude', 'longitude'].includes(fieldName)) {
        return parseFloat(value).toFixed(6);
      }

      return value;
    },

    formatGenericFieldName(field) {
      return field
        .replace(/_/g, ' ')
        .replace(/(^|\s)\S/g, char => char.toUpperCase());
    },

    closeTableDialog() {
      this.tableDialog = false;
      this.tableData = [];
      this.tableHeaders = [];
      this.tableName = '';
    },

    async downloadCSV() {
      this.isLoadingCSV = true;
      try {
        // Implementar a lógica de download de CSV
        // Exemplo: Criar um arquivo CSV a partir de this.tableData
        const headers = this.tableHeaders.map((h) => h.text).join(',');
        const rows = this.tableData
          .map((row) =>
            Object.values(row)
              .map((value) => `"${value}"`)
              .join(',')
          )
          .join('\n');
        const csvContent = `${headers}\n${rows}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${this.tableName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        this.$store.commit(
          'alert/addAlert',
          {
            message: this.$i18n.t('default-error', {
              action: this.$i18n.t('download'),
              resource: this.$i18n.t('data'),
            }),
          },
          { root: true },
        );
      } finally {
        this.isLoadingCSV = false;
      }
    },

    ...mapMutations('foco', [
      'setFilters',
      'setShowFeatures',
      'setOpacity',
      'clearFeatures',
    ]),

    ...mapActions('foco', [
      'getFilterOptions',
      'getTiOptions',
      'getFeatures',
    ]),
  },
};
</script>

<style scoped lang="scss">
@media (max-width: 768px) {
  .full-width {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .text-label {
    font-size: 0.8rem;
    padding-right: 0px;
  }
}
</style>

<i18n>
{
  "en": {

    "search-label": "Search",
    "opacity-label": "Opacity",
    "current-view-label": "Search in current area?",
    "start-date-label": "Start Date",
    "end-date-label": "End Date",
    "total-area-label": "Total Area",
    "regional-coordination-label": "Regional Coordination (All)",
    "indigenous-lands-label": "Indigenous Lands",
    "title-switch-disable-features": "Disable Foco Layer",
    "table-label": "View Table",
    "id": "ID",
    "date": "Date",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "municipality": "Municipality",
    "state": "State",
    "priority": "Priority",
    "default-error": "Error: Unable to {action} {resource}",
    "retrieve": "retrieve",
    "download": "download",
    "data": "data",
    "foco": "foco",
    "regional coordinators": "regional coordinators",
    "indigenous territories": "indigenous territories",
    "A data final deve ser maior ou igual à data inicial": "End date must be greater than or equal to start date"
  },
  "pt-br": {


    "search-label": "Buscar",
    "opacity-label": "Opacidade",
    "current-view-label": "Pesquisar nesta área?",
    "start-date-label": "Data Início",
    "end-date-label": "Data Final",
    "total-area-label": "Área total",
    "regional-coordination-label": "Coordenação Regional (Todas)",
    "indigenous-lands-label": "Terras Indígenas",
    "title-switch-disable-features": "Desabilitar Camada de Foco",
    "table-label": "Ver Tabela",
    "id": "ID",
    "date": "Data",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "municipality": "Município",
    "state": "Estado",
    "priority": "Prioridade",
    "default-error": "Erro: Não foi possível {action} {resource}",
    "retrieve": "recuperar",
    "download": "baixar",
    "data": "dados",
    "foco": "foco",
    "regional coordinators": "coordenadores regionais",
    "indigenous territories": "territórios indígenas",
    "A data final deve ser maior ou igual à data inicial": "A data final deve ser maior ou igual à data inicial"
  }
}
</i18n>
