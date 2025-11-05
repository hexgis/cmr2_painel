<template>
  <v-card
    v-if="isCardVisible"
    class="fill-height"
    width="400px"
  >
    <v-icon
      class="close-btn"
      color="white"
      @click="closeCard"
    >
      mdi-close
    </v-icon>

    <v-tabs
      v-if="isCardVisible && currentTiData"
      v-model="tabIndex"
      background-color="primary"
      dark
      class="fill-height"
    >
      <v-tab>
        {{ currentTiData.no_ti || 'Terra Indígena' }}
      </v-tab>

      <v-tab-item class="fill-height">
        <v-card-text style="max-height: 230px; overflow-y: auto">
          <template v-if="currentTiData && typeof currentTiData === 'object'">
            <template
              v-for="(entry, i) in Object.entries(currentTiData).filter(
                ([key, value]) =>
                  key !== 'instrumentos_gestao'
                  && value !== null
                  && value !== ''
                  && !key.includes('geometry')
              )"
            >
              <v-row
                :key="'row-' + i"
                class="mx-0 lighten-2"
              >
                <v-col
                  cols="5"
                  class="text-right"
                >
                  {{ getFormattedName(entry[0]) }}:
                </v-col>

                <v-col
                  cols="7"
                  class="text-subtitle-2"
                  style="overflow-wrap: anywhere"
                >
                  {{ formatValue(entry[1], entry[0]) }}
                </v-col>
              </v-row>

              <v-divider
                v-if="i < Object.entries(currentTiData).filter(([key, value]) => 
                  key !== 'instrumentos_gestao'
                  && value !== null
                  && value !== ''
                  && !key.includes('geometry')).length - 1"
                :key="'divider-' + i"
                class="list-separator my-1"
              />
            </template>
          </template>
        </v-card-text>
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'BaseTiMetadata',

  data() {
    return {
      tabIndex: 0,
      isCardVisible: true,
      replacements: {
        co_cr: 'Código da Coordenação Regional',
        co_funai: 'Código Funai',
        ds_cr: 'Coordenação Regional',
        ds_decreto_homologada: 'Decreto homologado',
        ds_despacho_delimitada: 'Despacho delimitada',
        ds_doc_resumo_declarada: 'Doc resumo declarada',
        ds_doc_resumo_delimitada: 'Doc resumo delimitada',
        ds_doc_resumo_em_estudo: 'Doc resumo em estudo',
        ds_doc_resumo_homologada: 'Doc resumo homologada',
        ds_doc_resumo_regularizada: 'Doc resumo regularizada',
        ds_fase_ti: 'Fase TI',
        ds_matricula_regularizada: 'Matricula regularizada',
        ds_modalidade: 'Modalidade',
        ds_portaria_declarada: 'Portaria declarada',
        ds_portaria_em_estudo: 'Portaria em estudo',
        ds_reestudo_ti: 'Reestudo TI',
        dt_cadastro: 'Data de cadastro',
        dt_declarada: 'Data declarada',
        dt_delimitada: 'Data delimitada',
        dt_em_estudo: 'Data em estudo',
        dt_homologada: 'Data homologada',
        dt_regularizada: 'Data regularizada',
        id: 'Id',
        instrumentos_gestao: 'Instrumento de gestão',
        no_grupo_etnico: 'Grupo Étnico',
        no_municipio: 'Município',
        no_ti: 'Nome TI',
        nu_area_ha: 'Área (ha)',
        possui_ig: 'Possui Inst. De Gestão',
        sg_uf: 'Sigla',
        st_amazonia_legal: 'Amazônia Legal',
        st_faixa_fronteira: 'Faixa de fronteira',
        ds_fase_ti: 'Fase TI',
        ds_matricula_regularizada: 'Matricula regularizada',
        layername: 'Layer',
        namespace: 'Namespace',
        is_estudo: 'Em Estudo',
      },
    };
  },

  computed: {
    ...mapState('map', ['currentTiData']),
  },

  watch: {
    currentTiData: {
      handler(newVal) {
        if (newVal) {
          this.openCard();
          this.tabIndex = 0;
        }
      },
      immediate: true,
      deep: true,
    },
  },

  methods: {
    handleTabClick(item, index) {
      this.tabIndex = index;
      this.$emit('tab-selected', item);
    },

    getFormattedName(key) {
      return this.replacements[key] || key;
    },
    closeCard() {
      this.isCardVisible = false;
      this.$emit('close');
      this.$store.commit('map/setCurrentTiData', null);
    },
    openCard() {
      this.isCardVisible = true;
    },

    formatValue(value, field) {
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
        return value ? 'Sim' : 'Não';
      }

      if (isNumberField || fieldName.startsWith('nu_')) {
        if (isLatLongField) {
          return value.toFixed(5);
        }
        if (typeof value === 'string'){
          value = parseFloat(value)
        }
        const rounded = value.toFixed(2);
        const [intPart, decimalPart] = rounded.split('.');

        return decimalPart !== '00'
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`
          : String(parseInt(value, 10));
      }

      return value;
    },
  },
};
</script>

<style scoped>
.close-btn {
    z-index: 1000;
    cursor: pointer;
    position: absolute;
    top: 5px;
    right: 10px;
}
</style>
