<template>
  <v-card>
    <v-tabs background-color="primary">
      <v-tab>{{ $t('polygons') }}</v-tab>
    </v-tabs>
    <v-card-text
      v-if="feature"
      style="max-height: 312px;
      overflow-y: auto"
    >
      <template v-for="(value, field) in feature">
        <v-row
          v-if="value && fieldMappings[field]"
          :key="field"
          class="mx-0 list-separator"
          dense
        >
          <v-col
            cols="5"
            class="text-subtitle-2"
          >
            {{ fieldMappings[field] }}
            <span v-if="field === 'date_t0'">*</span>
            <span v-if="field === 'date_t1'">**</span>:
          </v-col>
          <v-col
            class="text-subtitle-2 text-truncate"
            :title="formatFieldValue(value, field)"
          >
            {{ formatFieldValue(value, field) }}
          </v-col>
        </v-row>
      </template>

      <v-card
        v-if="hasDateFields"
        class="pa-3 mt-3 explanation-card"
      >
        <div
          v-for="(part, index) in customTextParts"
          :key="index"
        >
          <strong>{{ part.bold }}</strong> {{ part.text }}
        </div>
      </v-card>

      <v-row
        v-if="hasT0Field"
        justify="center"
        dense
        class="mt-3"
      >
        <v-btn
          color="accent"
          block
          @click="searchList(feature)"
        >
          {{ $t('search-images') }}
        </v-btn>
      </v-row>
    </v-card-text>

    <v-card-text v-else>
      <v-row
        v-for="i in 4"
        :key="i"
        dense
      >
        <v-col
          cols="5"
          class="text-left"
        >
          <v-skeleton-loader
            type="text"
            class="pt-1"
          />
        </v-col>
        <v-col cols="7">
          <v-skeleton-loader
            type="text"
            class="pt-1"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<i18n>
{
    "en": {
        "search-images": "Search Images",
        "polygons": "Polygon"
    },
    "pt-br": {
        "search-images": "Visualizar Imagens",
        "polygons": "Polígono"
    }
}
</i18n>

<script>
import { mapMutations, mapActions, mapState } from 'vuex';

export default {
  name: 'BaseMetadataPopup',

  props: {
    feature: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      fieldMappings: {
        co_funai: 'Código FUNAI',
        no_ti: 'Nome da Terra Indígena',
        ds_cr: 'Coordenação Regional',
        sg_uf: 'UF',
        dt_imagens: 'Data das Imagens',
        no_estagio: 'Estágio',
        no_satelites: 'Satélite',
        nu_area_ha: 'Área (ha)',
        nu_referencia: 'Número de Referência',
        nu_longitude: 'Longitude',
        nu_latitude: 'Latitude',
        no_municipio: 'Município',
        no_imagem: 'Nome da Imagem',
        dt_t_zero: 'Data T0',
        dt_t_um: 'Data T1',
        locator: 'Localizador',
        id: 'Id',
      },
      customTextParts: [
        { bold: 'Data T0*: ', text: 'última imagem Landsat-8 em que a alteração da cobertura vegetal ainda não havia sido iniciada.' },
        { bold: 'Data T1*:', text: 'data da imagem do satélite em que é possível ver a primeira aparição da alteração da cobertura vegetal.' },
      ],
    };
  },

  computed: {
    ...mapState('monitoring', ['filters']),
    hasT0Field() {
      return this.feature && Object.prototype.hasOwnProperty.call(this.feature, 'date_t0');
    },
    hasDateFields() {
      return (this.feature && (
        Object.prototype.hasOwnProperty.call(this.feature, 'dt_t_zero') || Object.prototype.hasOwnProperty.call(this.feature, 'dt_t_um')
      )
      );
    },
  },

  methods: {
    formatProp(prop) {
      return prop
        .replace('_', ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    formatFieldValue(value, field = '') {
      if (value == null) return 'N/A';
      const fieldName = field.toLowerCase();
      const numericValue = typeof value === 'string' ? parseFloat(value) : value;
      const isDateField = (
        typeof value === 'string' && /^(dt_|data_|date)/.test(fieldName) && this.$moment(value).isValid()
      );
      const isBooleanField = typeof value === 'boolean';
      const isNumberField = typeof numericValue === 'number' && !Number.isNaN(numericValue);
      const isLatLongField = /(lat|lng|long|latitude|longitude)/.test(fieldName);

      if (isDateField) return this.$moment(value).format('DD/MM/YYYY');
      if (isBooleanField) return value ? 'Sim' : 'Não';
      if (isNumberField || fieldName.startsWith('nu_')) {
        if (isLatLongField) return numericValue.toFixed(5);
        const rounded = numericValue.toFixed(2);
        const [intPart, decimalPart] = rounded.split('.');
        const shouldFormatDecimal = decimalPart !== '00' || (fieldName.startsWith('nu_') && fieldName.includes('area'));
        return shouldFormatDecimal
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`
          : parseInt(numericValue, 10);
      }

      return value || 'N/A';
    },

    async searchList(feature) {
      try {
        await this.getImagesOnDates({
          t0: feature.date_t0,
          t1: feature.date_t1,
          satIds: [],
          locator: feature.locator,
          currentView: this.filters.currentView,
        });
        this.clearScenesToCompare();
        this.setIsComparing(false);
        await this.$router.push(this.localePath('/catalog'));
      } catch (error) {
        console.error('Error searching images:', error);
      }
    },
    ...mapActions('catalog', ['getImagesOnDates']),
    ...mapMutations('catalog', ['clearScenesToCompare', 'setIsComparing']),
  },
};
</script>

<style scoped lang="sass">
.list-separator
  border-bottom: 1px solid rgba(0, 0, 0, 0.12)
  &:last-child
    border-bottom: none

.explanation-card
  background-color: rgba(255, 220, 0, 0.1)
  border-left: 4px solid #FFC107

.text-truncate
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.v-card-text
  .v-row:not(:last-child)
    margin-bottom: 4px
</style>
