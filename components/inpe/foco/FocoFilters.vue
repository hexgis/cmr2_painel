<template>
  <v-col>
    <v-row>
      <v-col cols="9" class="pt-0 mt-0">
        <v-checkbox
          v-model="filters.currentView"
          :label="$t('current-view-label')"
          :error="error"
          hide-details
        />
      </v-col>
      <v-col cols="3" class="pt-0 mt-0">
        <v-tooltip top>
          <template #activator="{ props }">
            <div class="d-flex justify-end align-center mt-1" v-bind="props">
              <v-switch
                v-if="currentUrlWms && (switchAquaMM || switchAquaMT)"
                v-model="showActiveFeatures"
                class="mt-3"
                hide-details
              />
            </div>
          </template>
          <span>
            {{ showActiveFeatures ? $t('title-switch-disable-features') : $t('title-switch-enable-features') }}
          </span>
        </v-tooltip>
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
      <v-col cols="6" class="py-0">
        <BaseDateField
          v-model="filters.startDate"
          :label="$t('start-date-label')"
          :required="true"
          outlined
          :min-date="'2015-01-01'"
        />
      </v-col>
      <v-col cols="6" class="py-0">
        <BaseDateField
          v-model="filters.endDate"
          :label="$t('end-date-label')"
          :required="true"
          outlined
          :min-date="'2015-01-01'"
        />
      </v-col>    
      <v-col cols="12" class="mt-n6">
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

    <!-- Loading Skeleton - CORREÇÃO: Removido o v-if desnecessário -->
    <div v-if="isLoadingFeatures" class="mt-1">
      <v-row no-gutters justify="center">
        <v-col cols="6">
          <v-skeleton-loader type="table-cell@4" />
        </v-col>
        <v-col cols="6">
          <div class="d-flex justify-end">
            <v-skeleton-loader type="table-cell@4" />
          </div>
        </v-col>
      </v-row>
      <v-divider class="mt-1" />
      <div>
        <v-skeleton-loader type="table-cell" />
        <v-row v-for="n in 4" :key="n" no-gutters align="center" class="mb-4">
          <v-col cols="1">
            <v-skeleton-loader width="20" height="20" tile type="avatar" />
          </v-col>
          <v-col cols="10">
            <v-skeleton-loader type="text" />
          </v-col>
        </v-row>
      </div>
    </div>

    <template v-else>
      <template v-if="searchPerformed">
        <v-divider class="mt-4" />

        <!-- AQUA M-M Section -->
        <v-row class="align-center mt-2">
          <v-icon
            color="yellow"
            class="ml-1"
          >
            mdi-fire
          </v-icon>
          <span class="ml-1">AQUA (Sensor MODIS - Manhã)</span>
          <v-spacer />
          <v-switch
            v-model="switchAquaMM"
            class="ml-2"
            @change="toggleLayer('aquaMM')"
            aria-label="Toggle AQUA MODIS Morning layer"
          />
        </v-row>
        <v-row
          v-if="switchAquaMM"
          align="center"
          class="mt-n6"
        >
          <v-col
            cols="12"
            class="mt-n1 mb-n4"
          >
            <v-btn
              icon
              small
              color="accent"
              :loading="isLoadingTable"
              @click="showTableDialog('aquaMM')"
              aria-label="View AQUA MODIS Morning table"
            >
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-icon v-on="on">
                    mdi-table
                  </v-icon>
                </template>
                <span>{{ $t('table-label') }}</span>
              </v-tooltip>
            </v-btn>
          </v-col>
          <v-col
            cols="4"
            class="grey--text text--darken-2"
          >
            {{ $t('opacity-label') }}
          </v-col>
          <v-col cols="8">
            <v-slider
              v-model="opacityAquaMM"
              hide-details
              thumb-label
              @input="handleOpacityChange('aquaMM', $event)"
              aria-label="Adjust AQUA MODIS Morning layer opacity"
            />
          </v-col>
        </v-row>

        <!-- AQUA M-T Section -->
        <v-row class="align-center mt-n2">
          <v-icon
            color="red"
            class="ml-1"
          >
            mdi-fire
          </v-icon>
          <span class="ml-1">AQUA (Sensor MODIS - Tarde)</span>
          <v-spacer />
          <v-switch
            v-model="switchAquaMT"
            class="ml-2"
            @change="toggleLayer('aquaMT')"
            aria-label="Toggle AQUA MODIS Afternoon layer"
          />
        </v-row>
        <v-row
          v-if="switchAquaMT"
          align="center"
          class="mt-n6"
        >
          <v-col
            cols="12"
            class="mt-n1 mb-n4"
          >
            <v-btn
              icon
              small
              color="accent"
              :loading="isLoadingTable"
              @click="showTableDialog('aquaMT')"
              aria-label="View AQUA MODIS Afternoon table"
            >
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-icon v-on="on">
                    mdi-table
                  </v-icon>
                </template>
                <span>{{ $t('table-label') }}</span>
              </v-tooltip>
            </v-btn>
          </v-col>
          <v-col
            cols="4"
            class="grey--text text--darken-2"
          >
            {{ $t('opacity-label') }}
          </v-col>
          <v-col cols="8">
            <v-slider
              v-model="opacityAquaMT"
              hide-details
              thumb-label
              @input="handleOpacityChange('aquaMT', $event)"
              aria-label="Adjust AQUA MODIS Afternoon layer opacity"
            />
          </v-col>
        </v-row>
      </template>
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
  </v-col>
</template>
<script>
import { mapMutations, mapState, mapActions, mapGetters } from 'vuex';
import BaseDateField from '@/components/base/BaseDateField';
import TableDialog from '../../table-dialog/TableDialog.vue';

export default {
  name: 'FocoFilters',
  components: { BaseDateField, TableDialog },

  data() {
    return {
      filters: {
        startDate: this.$moment().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: this.$moment().format('YYYY-MM-DD'),
        currentView: false,
        cr: [],
        ti: null,
      },
      checkNewFilters: false,
      isLoadingTotal: false,
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

    loading() {
      return this.layers.aquaMM.loading || this.layers.aquaMT.loading;
    },
    
    currentUrlWms() {
      return this.layers.aquaMM.currentUrlWms || this.layers.aquaMT.currentUrlWms;
    },    
  },

  watch: {
    'filters.currentView'(newVal) {
    if (newVal) {
      // Se checkbox for marcado, limpa as CRs selecionadas
      this.filters.cr = [];
    }
  },

  'filters.cr': {
    handler(newVal) {
      if (newVal && newVal.length > 0) {
        // Se CRs forem selecionadas, desmarca o checkbox
        this.filters.currentView = false;
      }
      const crCodes = newVal.map(item => item.co_cr);
      this.populateTiOptions(crCodes);
    },
    deep: true,
  },

   
    'filterOptions.regionalFilters': {
      handler() {
        this.populateCrOptions();
      },
      deep: true,
    },
  },

  mounted() {
    this.getFilterOptions();
  },

  methods: {
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
      'getTableData',
    ]),

    handleOpacityChange(layer, value) {
      this.setOpacity({ layer, opacity: value });
    },

   
    populateCrOptions() {
      this.flattened = [];
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
        this.flattened.push({ header: categoryId });
        this.flattened.push(...category.list);
      });
    },

    
    populateTiOptions(cr) {
      if (cr?.length) {
        this.getTiOptions(cr);
      }
    },

    
    async searchFoco() {
      const { currentView, cr, startDate, endDate } = this.filters;

      if (!(currentView || cr.length) || !startDate || !endDate) {
        this.error = true;
        return;
      }

      if (new Date(endDate) < new Date(startDate)) {
        this.error = true;
        this.$store.commit('alert/addAlert', {
          message: this.$i18n.t('A data final deve ser maior ou igual à data inicial'),
        }, { root: true });
        return;
      }

      this.error = false;
      this.showActiveFeatures = false;

      try {
        this.setFilters({ layer: 'aquaMM', filters: this.filters });
        this.setFilters({ layer: 'aquaMT', filters: this.filters });
        await Promise.all([
          this.getFeatures('aquaMM'),
          this.getFeatures('aquaMT'),
        ]);

        if(this.layers.aquaMM?.features?.features.length > 0 || this.layers.aquaMT?.features?.features.length > 0){
            this.searchPerformed = true;
        } else{
            this.searchPerformed = false;
        }
 
        this.switchAquaMM = true;
        this.switchAquaMT = true;
        this.setShowFeatures({ layer: 'aquaMM', showFeatures: true });
        this.setShowFeatures({ layer: 'aquaMT', showFeatures: true });
        this.setOpacity({ layer: 'aquaMM', opacity: this.opacityAquaMM });
        this.setOpacity({ layer: 'aquaMT', opacity: this.opacityAquaMT });
      } catch (error) {
        this.error = true;
        this.$store.commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('data'),
          }),
        }, { root: true });
      }
    },

  
    toggleLayer(layer) {
      const show = layer === 'aquaMM' ? this.switchAquaMM : this.switchAquaMT;
      this.setShowFeatures({ layer, showFeatures: show });
    },

    
    async showTableDialog(layer) {
      this.isLoadingTable = true;
      this.tableDialog = true;
      this.tableName = layer === 'aquaMM' ? 'AQUA (Sensor MODIS - Manhã)' : 'AQUA (Sensor MODIS - Tarde)';

      try {
        await this.$store.dispatch('foco/getTableData', layer);
        const { tableData } = this.$store.state.foco.layers[layer];

        if (tableData?.length) {
          this.tableData = tableData.map(row => ({
            ...row,
            ...Object.keys(row).reduce((acc, key) => ({
              ...acc,
              [key]: this.formatFieldValue(row[key], key),
            }), {}),
          }));
          this.tableHeaders = Object.keys(tableData[0]).map(key => ({
            text: this.formatHeaderText(key),
            value: key,
          }));
        } else {
          this.tableData = [];
          this.tableHeaders = [];
        }
      } catch (error) {
        console.error('Error loading table:', error);
        this.$store.commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('data'),
          }),
        }, { root: true });
        this.tableData = [];
        this.tableHeaders = [];
      } finally {
        this.isLoadingTable = false;
      }
    },

   
    formatHeaderText(key) {
      const headerMap = {
        co_funai: 'Código Funai',
        id: 'ID',
        no_satelite: 'Satélite',
        no_bioma: 'Bioma',
        no_municipio: 'Município',
        sg_uf: 'UF',
        sg_regiao: 'Região',
        nu_percentual: 'Percentual',
        nu_risco: 'Risco',
        nu_dias_sem_chuva: 'Dias sem Chuva',
        dt_foco_calor: 'Data do Foco',
        hr_foco_calor: 'Horário',
        dt_cadastro: 'Data de Cadastro',
        no_ti: 'Terra Indígena',
        co_cr: 'Código CR',
        ds_cr: 'Coordenação Regional',     
      };
      return headerMap[key] || this.formatGenericFieldName(key);
    },

    
    formatFieldValue(value, field = '') {
      if (value === null || value === undefined) return 'N/A';
      const fieldName = field.toLowerCase();

      if (['dt_cadastro', 'dt_foco_calor'].includes(fieldName)) {
        const momentDate = this.$moment(value, ['YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ssZ'], true);
        return momentDate.isValid() ? momentDate.format('DD/MM/YYYY') : value;
      }

      if (fieldName === 'hr_foco_calor') {
        const momentTime = this.$moment(value, 'YYYY-MM-DDTHH:mm:ssZ', true);
        return momentTime.isValid() ? momentTime.format('HH:mm') : value;
      }

      if (['latitude', 'longitude'].includes(fieldName)) {
        return parseFloat(value).toFixed(6);
      }

      if (fieldName.includes('percentual')) {
        const numValue = parseFloat(value);
        return !isNaN(numValue) ? `${numValue.toFixed(2)}%` : value;
      }

      if (fieldName.startsWith('nu_')) {
        const numValue = parseFloat(value);
        return !isNaN(numValue) ? numValue.toLocaleString('pt-BR') : value;
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
        const headers = this.tableHeaders.map(h => h.text).join(',');
        const rows = this.tableData
          .map(row => Object.values(row)
            .map(value => `"${value}"`)
            .join(','))
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
        this.$store.commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('download'),
            resource: this.$i18n.t('data'),
          }),
        }, { root: true });
      } finally {
        this.isLoadingCSV = false;
      }
    },
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
    "title-switch-enable-features": "Enable Foco Layer",
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
    "title-switch-enable-features": "Habilitar Camada de Foco",
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
    "download": "Baixar",
    "data": "dados",
    "foco": "foco",
    "regional coordinators": "coordenadores regionais",
    "indigenous territories": "territórios indígenas",
    "A data final deve ser maior ou igual à data inicial": "A data final deve ser maior ou igual à data inicial"
  }
}
</i18n>