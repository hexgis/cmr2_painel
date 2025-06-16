<template>
  <v-col class="pa-0">
    <v-row>
      <!-- Checkbox de Visualização Atual -->
      <v-col
        cols="9"
        class="pt-0 mt-0"
      >
        <v-checkbox
          v-model="localFilters.currentView"
          :label="$t('current-view-label')"
          :error="error"
          hide-details
          @change="emitFilters"
        />
      </v-col>
      <!-- Switch de Camada -->
      <v-col
        cols="3"
        class="pt-0 mt-0"
      >
        <v-tooltip bottom>
          <template #activator="{ on }">
            <div
              class="d-flex justify-end align-center mt-1"
              v-on="on"
            >
              <v-switch
                :value="featuresLayer"
                class="mt-3"
                hide-details
                @change="emitFeaturesLayer"
              />
            </div>
          </template>
          <span>
            {{
              featuresLayer
                ? $t('title-switch-disable-features')
                : $t('title-switch-enable-features')
            }}
          </span>
        </v-tooltip>
      </v-col>
      <!-- Combobox de Coordenação Regional -->
      <v-col cols="12">
        <v-combobox
          v-model="localFilters.cr"
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
          @change="emitFilters"
        />
      </v-col>
      <!-- Combobox de Terras Indígenas -->
      <v-col cols="12">
        <v-slide-y-transition>
          <v-combobox
            v-if="localFilters.cr && filterOptions.tiFilters"
            v-model="localFilters.ti"
            :label="$t('indigenous-lands-label')"
            :items="filterOptions.tiFilters"
            item-text="no_ti"
            item-value="co_funai"
            hide-details
            multiple
            clearable
            class="pa-0 mt-n3"
            outlined
            @change="emitFilters"
          />
        </v-slide-y-transition>
      </v-col>
      <!-- Filtros de Data ou Ano -->
      <template v-if="filterType === 'date'">
        <v-col
          cols="6"
          class="py-0"
        >
          <BaseDateField
            v-model="localFilters.startDate"
            :label="$t('start-date-label')"
            :required="true"
            outlined
            :min-date="'2015-01-01'"
            :error="error"
            @input="emitFilters"
          />
        </v-col>
        <v-col
          cols="6"
          class="py-0"
        >
          <BaseDateField
            v-model="localFilters.endDate"
            :label="$t('end-date-label')"
            :required="true"
            outlined
            :error="error"
            :min-date="'2015-01-01'"
            @input="emitFilters"
          />
        </v-col>
      </template>
      <template v-else-if="filterType === 'year'">
        <v-col class="py-0 full-width">
          <v-select
            v-model="localFilters.year"
            :label="$t('year-label')"
            :items="yearOptions"
            :required="true"
            outlined
            :menu-props="{ top: false, offsetY: true }"
            @change="emitFilters"
          />
        </v-col>
      </template>
      <template v-else-if="filterType === 'year-range'">
        <v-col
          cols="6"
          class="py-0"
        >
          <v-select
            v-model="localFilters.startYear"
            :label="$t('start-year-label')"
            :items="yearOptions"
            :required="true"
            outlined
            :menu-props="{ top: false, offsetY: true }"
            @change="emitFilters"
          />
        </v-col>
        <v-col
          cols="6"
          class="py-0"
        >
          <v-select
            v-model="localFilters.endYear"
            :label="$t('end-year-label')"
            :items="yearOptions"
            :required="true"
            outlined
            :menu-props="{ top: false, offsetY: true }"
            @change="emitFilters"
          />
        </v-col>
      </template>
      <!-- Botão de Busca -->
      <v-col cols="12">
        <v-btn
          block
          small
          color="primary"
          outlined
          :loading="loading"
          class="pa-0 mt-n8"
          @click="$emit('search')"
        >
          {{ $t('search-label') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import BaseDateField from './BaseDateField.vue';

export default {
  name: 'BaseFilters',
  components: {
    BaseDateField,
  },
  props: {
    filterType: {
      type: String,
      required: true,
      validator: (value) => ['date', 'year', 'year-range'].includes(value),
    },
    filters: {
      type: Object,
      required: true,
    },
    error: {
      type: Boolean,
      default: false,
    },
    flattened: {
      type: Array,
      default: () => [],
    },
    filterOptions: {
      type: Object,
      required: true,
    },
    currentUrlWms: {
      type: String,
      default: null,
    },
    featuresLayer: {
      type: Boolean,
      required: true,

    },
    loading: {
      type: Boolean,
      default: false,
    },
    yearOptions: {
      type: Array,
      default: () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = 2015; year <= currentYear; year += 1) {
          years.push(year);
        }
        return years;
      },
    },
  },
  data() {
    return {
      localFilters: { ...this.filters }, // Cópia local para evitar mutação direta
    };
  },
  watch: {
    filters: {
      handler(newFilters) {
        this.localFilters = { ...newFilters }; // Sincroniza com prop
      },
      deep: true,
    },
    'localFilters.startYear': function startYearWatcher(newVal) {
      if (this.filterType === 'year-range' && newVal > this.localFilters.endYear) {
        this.localFilters.endYear = newVal;
        this.emitFilters();
      }
    },
  },
  methods: {
    emitFilters() {
      this.$emit('update:filters', { ...this.localFilters });
    },
    emitFeaturesLayer(value) {
      this.$emit('update:featuresLayer', value);
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
}
</style>

<i18n>
{
  "en": {
    "search-label": "Search",
    "current-view-label": "Search in current area?",
    "start-date-label": "Start Date",
    "end-date-label": "End Date",
    "year-label": "Year",
    "start-year-label": "Start Year",
    "end-year-label": "End Year",
    "regional-coordination-label": "Regional Coordination (All)",
    "indigenous-lands-label": "Indigenous Lands",
    "title-switch-disable-features": "Disable Layer",
    "title-switch-enable-features": "Enable Layer"
  },
  "pt-br": {
    "search-label": "Buscar",
    "current-view-label": "Pesquisar nesta área?",
    "start-date-label": "Data Inicial",
    "end-date-label": "Data Final",
    "year-label": "Ano",
    "start-year-label": "Ano Início",
    "end-year-label": "Ano Final",
    "regional-coordination-label": "Coordenação Regional (Todas)",
    "indigenous-lands-label": "Terras Indígenas",
    "title-switch-disable-features": "Desabilitar Camada",
    "title-switch-enable-features": "Habilitar Camada"
  }
}
</i18n>
