<template>
  <v-form
    v-if="layer.filters.length"
    v-model="valid"
  >
    <v-row
      dense
      class="my-4"
    >
      <template v-if="hasDoubleDate">
        <v-col cols="6">
          <BaseDateField
            v-model="filters.start_date"
            :label="$t('start-date-label')"
            required
            outlined
            dense
          />
        </v-col>
        <v-col cols="6">
          <BaseDateField
            v-model="filters.end_date"
            :label="$t('end-date-label')"
            required
            :min-date="filters.start_date"
            outlined
            dense
          />
        </v-col>
      </template>

      <template v-for="layer_filter in layer.filters">
        <template
          v-if="
            !hasDoubleDate &&
              (layer_filter.filter_type === 'start_date' ||
                layer_filter.filter_type === 'end_date')
          "
        >
          <v-col :key="layer_filter.filter_type">
            <BaseDateField
              v-model="filters[layer_filter.filter_type]"
              :label="$t('start-date-label')"
              required
              outlined
              dense
            />
          </v-col>
        </template>
      </template>

      <v-col
        v-if="verifyFilterType('co_cr')"
        :key="layer.filters.filter_type"
        cols="12"
        class="mb-5"
      >
        <v-select
          v-model="filters.co_cr"
          :label="$t('regional-coordination-label')"
          :items="flattened"
          item-value="co_cr"
          item-text="ds_cr"
          multiple
          hide-details
          clearable
          required
        />
      </v-col>

      <v-col
        v-if="verifyFilterType('co_funai')"
        :key="layer.filters.filter_type"
        class="mb-5"
        cols="12"
      >
        <v-slide-y-transition>
          <v-select
            v-model="filters.co_funai"
            :label="$t('indigenous-lands-label')"
            :items="filterOptions.tiFilters"
            item-text="no_ti"
            item-value="co_funai"
            multiple
            clearable
            hide-details
            required
          />
        </v-slide-y-transition>
      </v-col>

      <v-col cols="12">
        <v-btn
          block
          small
          color="primary"
          outlined
          :disabled="!valid"
          :loading="loading"
          @click.prevent="filterLayer()"
        >
          {{ $t('filter-button') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<i18n>
{
    "en": {
        "start-date-label": "Start date",
        "end-date-label": "End date",
        "cpf-label": "CPF/CNPJ",
        "filter-button": "Filter",
        "indigenous-lands-label": "Indigenous Lands (All)",
        "regional-coordination-label": "Regional Coordination (All)"
    },
    "pt-br": {
        "start-date-label": "Data inicial",
        "end-date-label": "Data final",
        "cpf-label": "CPF/CNPJ",
        "filter-button": "Filtrar",
        "indigenous-lands-label": "Terras Indígenas (Todas)",
        "regional-coordination-label": "Coordenação Regional (Todas)"
    }
}
</i18n>

<script>
import { mapMutations, mapActions, mapState } from 'vuex';

import BaseDateField from '@/components/base/BaseDateField';

export default {
  name: 'SupportLayerFilters',

  components: {
    BaseDateField,
  },

  props: {
    layer: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    valid: false,
    flattened: [],
    filters: {
      co_cr: [],
      co_funai: [],
    },
    loading: false,
    hasDoubleDate: false,
  }),

  watch: {
    'filters.co_cr': function (value) {
      this.populateTiOptions(value);
    },

    'filterOptions.regionalFilters': function () {
      this.populateCrOptions();
    },
  },

  created() {
    let hasStartDate = false;
    let hasEndDate = false;

    if (this.layer.filters) {
      this.layer.filters.forEach((layerFilter) => {
        let defaultValue = null;
        if (this.layer.active_on_init) {
          defaultValue = this.layer.filters[layerFilter.filter_type]
            ? this.layer.filters[layerFilter.filter_type]
            : layerFilter.default;

          this.$set(
            this.filters,
            layerFilter.filter_type,
            defaultValue,
          );
        }
        if (layerFilter.filter_type === 'start_date') {
          hasStartDate = true;
        } else if (layerFilter.filter_type === 'end_date') {
          hasEndDate = true;
        }
      });

      this.hasDoubleDate = hasStartDate && hasEndDate;
    }
  },

  mounted() {
    this.getFilterOptions();
  },

  computed: {
    ...mapState('supportLayers', ['filterOptions']),
  },

  methods: {

    populateCrOptions() {
      // Reseta o array flattened para evitar duplicações em múltiplas chamadas
      this.flattened = [];

      // Objeto para armazenar itens agrupados por região
      const groups = {};
      // Objeto para rastrear códigos co_cr já processados (deduplicação)
      const seen = {};

      // Obtém o array de filtros regionais ou array vazio se indefinido
      const items = this.filterOptions.regionalFilters || [];

      // 1) Deduplica por co_cr e agrupa por no_regiao
      items.forEach((x) => {
        // Pula itens inválidos ou nulos
        if (!x || x.co_cr == null) return;

        // Verifica se este co_cr já foi processado
        if (!seen[x.co_cr]) {
          // Marca este co_cr como visto
          seen[x.co_cr] = true;

          // Obtém o nome da região ou usa 'Sem Região' como padrão
          const regiao = x.no_regiao || 'Sem Região';
          // Inicializa o array da região se não existir
          if (!groups[regiao]) groups[regiao] = [];
          // Adiciona o item ao grupo da sua região
          groups[regiao].push(x);
        }
      });

      // 2) Constrói o array flattened: header + itens (apenas se houver itens)
      Object.keys(groups).forEach((regiao) => {
        // Obtém a lista de itens desta região
        const list = groups[regiao];
        // Pula grupos vazios para evitar headers órfãos
        if (!list || !list.length) return;

        // Adiciona o header da região
        this.flattened.push({ header: regiao });
        // Adiciona todos os itens desta região
        list.forEach((item) => {
          this.flattened.push(item);
        });
      });

      // Retorna o array flattened
      return this.flattened;
    },

    populateTiOptions(cr) {
      if (cr) this.$store.dispatch('supportLayers/getTiOptions', cr);
      else this.filters.ti = null;
    },

    verifyFilterType(type) {
      const { filters } = this.layer;
      if (filters) {
        return filters.filter((filter) => filter.type === type).length;
      }
      return false;
    },

    filterLayer() {
      const filterInfo = {
        id: this.layer.id,
        filters: this.filters,
      };
      if (this.layer.layer_type === 'heatmap') {
        this.loading = true;
        this.setLayerFilters(filterInfo);
        this.getHeatMapLayer(filterInfo).finally(() => {
          this.loading = false;
        });
      } else if (this.layer.layer_type === 'wms') {
        this.setLayerFilters(filterInfo);

        this.toggleLayerVisibility({
          id: this.layer.id,
          visible: true,
        });
      }
    },

    ...mapMutations('supportLayers', [
      'setLayerFilters',
      'toggleLayerVisibility',
    ]),

    ...mapActions('supportLayers', ['getHeatMapLayer', 'getFilterOptions']),
  },
};
</script>
