<template>
  <v-form
    v-if="layer.layer_filters.length"
    v-model="valid"
  >
    <v-row
      dense
      class="my-4"
    >
      <template v-for="layer_filter in layer.layer_filters">
        <template>
          <v-col
            v-if="layer_filter.filter_type === 'start_date'"
            :key="layer_filter.filter_type"
            cols="6"
          >
            <BaseDateField
              :key="layer_filter.filter_alias"
              v-model="filters.startData"
              outlined
              dense
              :label="$t('end-date-label')"
              required
            />
          </v-col>
          <v-col
            v-if="layer_filter.filter_type === 'end_date'"
            :key="layer_filter.filter_type"
            cols="6"
          >
            <BaseDateField
              :key="layer_filter.filter_alias"
              v-model="filters.endData"
              outlined
              dense
              :label="$t('end-date-label')"
              required
            />
          </v-col>
        </template>
      </template>
      <template>
        <v-col
          v-if="verifyFilterType('co_cr')"
          :key="layer.layer_filters.filter_type"
          cols="12"
          class="mb-5"
        >
          <v-select
            v-model="filters.co_cr"
            :label="$t('regional-coordination-label')"
            :items="filterOptions.regionalFilters"
            item-value="co_cr"
            item-text="ds_cr"
            hide-details
            clearable
            multiple
            required
          />
        </v-col>

        <v-col
          v-if="verifyFilterType('co_funai')"
          :key="layer.layer_filters.filter_type"
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
      </template>

      <v-col cols="12">
        <v-btn
          block
          color="primary"
          small
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
        "regional-coordination-label": "Regional Coordination (All)",
        "indigenous-lands-label": "Indigenous Lands (All)"
    },
    "pt-br": {
        "start-date-label": "Data inicial",
        "end-date-label": "Data final",
        "cpf-label": "CPF/CNPJ",
        "filter-button": "Filtrar",
        "regional-coordination-label": "Coordenação Regional (Todas)",
        "indigenous-lands-label": "Terras Indígenas (Todas)"
    }
}
</i18n>

<script>
import { mapMutations, mapActions, mapState } from 'vuex';

import BaseDateField from '@/components/base/BaseDateField';

export default {
  name: 'SupportLayerFiltersAntropismo',

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
  },

  created() {
    let hasStartDate = false;
    let hasEndDate = false;

    if (this.layer.layer_filters) {
      this.layer.layer_filters.forEach((layerFilter) => {
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
    populateTiOptions(cr) {
      if (cr) this.$store.dispatch('supportLayers/getTiOptions', cr);
      else this.filters.ti = null;
    },
    verifyFilterType(type) {
      const keys = Object.keys(this.layer.layer_filters);
      for (const key in keys) {
        if (this.layer.layer_filters[key].filter_type.includes(type)) {
          return true;
        }
      }
    },

    filterLayer() {
      const filterInfo = {
        id: this.layer.id,
        filters: this.filters,
      };
      if (this.layer.layer_type === 'heatmap') {
        this.loading = true;
        this.setLayerFiltersAntropismo(filterInfo);
        this.getHeatMapLayer(filterInfo).finally(() => {
          this.loading = false;
        });
      } else if (this.layer.layer_type === 'wms') {
        this.setLayerFiltersAntropismo(filterInfo);

        this.toggleLayerVisibilityAntropismo({
          id: this.layer.id,
          visible: true,
        });
      }
    },

    ...mapMutations('supportLayers', [
      'setLayerFiltersAntropismo',
      'toggleLayerVisibilityAntropismo',
    ]),

    ...mapActions('supportLayers', ['getHeatMapLayer', 'getFilterOptions']),
  },
};
</script>
