<template>
  <v-col>
    <v-row>
      <!-- Pesquisar nesta área -->
      <v-col cols="9" class="pt-0 mt-0">
        <v-checkbox
          v-model="filters.currentView"
          :label="$t('current-view-label')"
          :error="error"
          hide-details
        />
      </v-col>

      <!-- Switch de camada -->
      <v-col cols="3" class="pt-0 mt-0">
        <v-tooltip top>
          <template #activator="{ props }">
            <div class="d-flex justify-end align-center mt-1" v-bind="props">
              <v-switch
                v-if="currentUrlWmsDeter"
                v-model="featuresDeter"
                class="mt-3"
                hide-details
              />
            </div>
          </template>
          <span>
            {{ showFeaturesDeter ? $t('title-switch-disable-features') : $t('title-switch-enable-features') }}
          </span>
        </v-tooltip>
      </v-col>

      <!-- Coordenação Regional -->
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

      <!-- Terras Indígenas -->
      <v-col cols="12">
        <v-slide-y-transition>
          <v-combobox
            v-if="filters.cr.length > 0 && filterOptions.tiFilters"
            v-model="filters.ti"
            :label="$t('indigenous-lands-label')"
            :items="filterOptions.tiFilters"
            item-text="no_ti"
            item-value="co_funai"
            hide-details
            multiple
            clearable
            class="pa-0 mt-n3"
            outlined
          />
        </v-slide-y-transition>
      </v-col>

      <!-- Anos -->
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

      <!-- Botão Buscar -->
      <v-col cols="12" class="mt-n6">
        <v-btn
          block
          small
          color="primary"
          outlined
          :loading="loadingDeter"
          @click="searchDeter"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading Skeleton -->
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

    <!-- Resultados -->
    <v-row v-else-if="showFeaturesDeter && features && features.features && features.features.length > 0" no-gutters align="center" class="mt-3">
      <!-- Botão Tabela -->
      <v-col cols="12" class="mt-n1 mb-1">
        <v-btn icon small color="accent" :loading="isLoadingTable" @click="showTableDialog(true)">
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

      <!-- Totais -->
      <v-col cols="12" class="grey--text text--darken-2 d-flex justify-space-between mt-2 mb-4">
        <span>{{ $t('total-poligono-label') }}:</span>
        {{ features.features.length }}
      </v-col>
      <v-col cols="12" class="grey--text text--darken-2 d-flex justify-space-between">
        <span>{{ $t('total-area-label') }}:</span>
        {{ totalArea }} ha
      </v-col>
      <v-col cols="12" class="mt-2">
        <v-divider />
      </v-col>

      <!-- Opacidade -->
      <v-row class="mt-0">
        <v-col cols="4" class="grey--text text--darken-2">
          {{ $t('opacity-label') }}
        </v-col>
        <v-col cols="8">
          <v-slider v-model="opacity" hide-details thumb-label />
        </v-col>
      </v-row>
      <v-col cols="12">
        <v-divider />
      </v-col>
    </v-row>

    <!-- Diálogo de Tabela -->
    <TableDialog
      :table="tableDialogDeter"
      :headers="dynamicHeaders"
      :value="formattedTableDeter"
      :loading-table="isLoadingTable"
      :loading-c-s-v="isLoadingCSV"
      :table-name="$t('table-name')"
      :f-download-c-s-v="downloadTableDeter"
      :f-close-table="closeTable"
    />
  </v-col>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import BaseDateField from '@/components/base/BaseDateField';
import TableDialog from '../../table-dialog/TableDialog.vue';

export default {
  name: 'DeterFilters',

  components: { BaseDateField, TableDialog },

  data() {
    return {
      tableDialogDeter: false,
      filters: {
        startDate: this.$moment().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: this.$moment().format('YYYY-MM-DD'),
        currentView: false,
        priority: null,
        cr: [],
        ti: null,
      },
      checkNewFilters: false,
      isLoadingTotal: false,
      error: false,
      flattened: [],
      dialog: false,
      isLoadingTable: false,
      isLoadingCSV: false,
      baseHeaders: [
        { text: 'ID', value: 'origin_id' },
        { text: 'Classe', value: 'classname' },
        { text: 'Data', value: 'view_date' },
        { text: 'Área (ha)', value: 'area_ha' }
      ]
    };
  },

  computed: {
    dynamicHeaders() {
      if (!this.features?.features?.length) return this.baseHeaders;

      const sampleProperties = this.features.features[0].properties;
      const additionalHeaders = [];

      for (const key in sampleProperties) {
        if (!['id', 'classname', 'view_date', 'areatotalkm'].includes(key)) {
          const headerText = this.formatHeaderText(key);
          additionalHeaders.push({
            text: headerText,
            value: key
          });
        }
      }

      return [...this.baseHeaders, ...additionalHeaders];
    },

    totalArea() {
      if (!this.features?.features?.length) return 0;
      const total = this.features.features.reduce(
        (sum, feature) => sum + (feature.properties?.areatotalkm ? parseFloat(feature.properties.areatotalkm) * 100 : 0),
        0
      );
      return this.formatFieldValue(total, 'area_ha');
    },

    formattedTableDeter() {
      if (!this.features?.features?.length) return [];

      return this.features.features.map((feature) => {
        const props = feature.properties;
        const formattedItem = {
          origin_id: props.id || 'N/A',
          classname: props.classname || 'N/A',
          view_date: props.view_date ? this.$moment(props.view_date).format('DD/MM/YYYY') : 'N/A',
          area_ha: props.areatotalkm ? this.formatFieldValue(parseFloat(props.areatotalkm) * 100, 'area_ha') : 'N/A'
        };

        for (const key in props) {
          if (!['id', 'classname', 'view_date', 'areatotalkm'].includes(key)) {
            formattedItem[key] = this.formatFieldValue(props[key], key);
          }
        }

        return formattedItem;
      });
    },

    opacity: {
      get() {
        return this.$store.state.deter.opacity;
      },
      set(value) {
        this.$store.commit('deter/setOpacity', value);
      },
    },

    featuresDeter: {
      get() {
        return this.$store.state.deter.showFeaturesDeter;
      },
      set(value) {
        this.$store.commit('deter/setshowFeaturesDeter', value);
      },
    },

    ...mapState('deter', [
      'currentUrlWmsDeter',
      'isLoadingFeatures',
      'loadingDeter',
      'filterOptions',
      'features',
      'showFeaturesDeter',
      'tableDeter',
    ]),
  },

  watch: {
  'filters.currentView'(val) {
    if (val) {
      this.filters.cr = []; // Limpa as CRs quando o checkbox é marcado
    }
  },

  'filters.cr': {
    handler(val) {
      if (val?.length) {
        this.filters.currentView = false; // Desmarca o checkbox quando uma CR é selecionada
        const arrayCr = val.map((item) => item.co_cr);
        this.populateTiOptions(arrayCr);
      } else {
        // Limpa as TIs se não houver CRs selecionadas
        this.filters.ti = null;
      }
    },
    deep: true
  },

  'filterOptions.regionalFilters'() {
    this.populateCrOptions();
  },
},

  methods: {
    formatHeaderText(key) {
      const headerMap = {
        'municipality': 'Município',
        'uf': 'UF',
        'satellite': 'Satélite',
        'path_row': 'Órbita/Ponto',
        'co_funai': 'Código Funai',
        'no_ti': 'Terra Indígena',
        'co_cr': 'Código CR',
        'ds_cr': 'Coordenação Regional',
        'nu_ano': 'Ano',
        'nu_orbita': 'Órbita',
        'nu_ponto': 'Ponto',
        'dt_imagem': 'Data Imagem',
        'nu_area_km2': 'Área (km²)',
        'areamunkm': 'Área Mun (km)',
        'areauckm': 'Área UC (km)',
        'geocod': 'GeoCódigo',
        'uc': 'UC',
        'publish_month': 'Mês Publicação',
        'no_regiao': 'Região',
        'no_estagio': 'Estágio',
        'no_estado': 'Estado',
        'nu_latitude': 'Latitude',
        'nu_longitude': 'Longitude'
      };

      return headerMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

   formatFieldValue(value, field = '') {
  if (value === null || value === undefined) return 'N/A';
  const fieldName = field.toLowerCase();

  // Formatação específica para publish_month (MM/AAAA)
  if (fieldName === 'publish_month' && this.$moment(value).isValid()) {
    return this.$moment(value).format('MM/YYYY');
  }

  // Formatação para áreas com 3 casas decimais
  if (fieldName.includes('areamunkm') || fieldName.includes('areauckm')) {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return 'N/A';
    return parsed.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Formatação para outras datas (DD/MM/AAAA)
  const isDate =
    typeof value === 'string' &&
    (fieldName.startsWith('dt_') ||
     fieldName.startsWith('data_') ||
     fieldName.startsWith('date')) &&
    this.$moment(value).isValid();
  if (isDate) return this.$moment(value).format('DD/MM/YYYY');

  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number' || fieldName.startsWith('nu_')) {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return 'N/A';
    const rounded = parsed.toFixed(2);
    const [intPart, decPart] = rounded.split('.');
    return decPart !== '00'
      ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decPart}`
      : parseInt(value, 10).toString();
  }
  return value.toString();
},

    populateCrOptions() {
      const groups = {};
      this.flattened = [];
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
      if (cr) this.$store.dispatch('deter/getTiOptions', cr);
      else this.filters.ti = null;
    },

    searchDeter() {
      const { filters } = this;
      const { currentView, cr, startDate, endDate } = filters;

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

        this.setFilters(filters);
        this.getFeatures();
        return;
      }
      this.error = true;
    },

    showTableDialog(value) {
      this.tableDialogDeter = value;
      if (value) {
        this.isLoadingTable = true;
        setTimeout(() => {
          this.isLoadingTable = false;
        }, 500);
      }
    },

    closeTable(value) {
      this.tableDialogDeter = value;
    },

    async downloadTableDeter() {
      this.isLoadingCSV = true;
      try {
        if (!this.features?.features?.length) {
          throw new Error('Nenhum dado disponível para exportar');
        }

        const headers = this.dynamicHeaders.map(h => h.text);

        const rows = this.features.features.map(feature => {
          const p = feature.properties;
          const row = [
            p.id || '',
            p.classname || '',
            p.view_date ? this.$moment(p.view_date).format('DD/MM/YYYY') : '',
            p.areatotalkm ? (parseFloat(p.areatotalkm) * 100).toString() : ''
          ];

          this.dynamicHeaders.slice(4).forEach(header => {
            const value = p[header.value];
            row.push(typeof value === 'string' ? `"${value}"` : (value || ''));
          });

          return row.join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `deter_export_${this.$moment().format('YYYYMMDD_HHmmss')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Erro ao gerar CSV:', error);
        this.$store.commit('alert/addAlert', {
          message: 'Erro ao gerar arquivo CSV: ' + error.message
        }, { root: true });
      } finally {
        this.isLoadingCSV = false;
      }
    },

    ...mapMutations('deter', ['setFilters']),
    ...mapActions('deter', [
      'getFilterOptions',
      'getFeatures',
      'getDataTableDeter',
    ]),
  },


  mounted() {
    this.getFilterOptions();

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
    "table-name": "Deter Table",
    "table-label": "Table",
    "search-label": "Search",
    "opacity-label": "Opacity",
    "current-view-label": "Search in current area?",
    "start-date-label": "Start Date",
    "end-date-label": "End Date",
    "total-area-label": "Total Area",
    "regional-coordination-label": "Regional Coordination (All)",
    "indigenous-lands-label": "Indigenous Lands",
    "title-switch-disable-features": "Disable Deter Layer",
    "total-poligono-label": "Total Polygons",
    "title-switch-enable-features": "Enable Monitoring Layer"
  },
  "pt-br": {
    "table-name": "Tabela de Deter",
    "table-label": "Tabela",
    "search-label": "Buscar",
    "opacity-label": "Opacidade",
    "current-view-label": "Pesquisar nesta área?",
    "start-date-label": "Data Início",
    "end-date-label": "Data Final",
    "total-area-label": "Área total",
    "regional-coordination-label": "Coordenação Regional (Todas)",
    "indigenous-lands-label": "Terras Indígenas",
    "title-switch-disable-features": "Desabilitar Camada de Deter",
    "total-poligono-label": "Total de polígonos",
    "title-switch-enable-features": "Habilitar Camada de Monitoramento"
  }
}
</i18n>
