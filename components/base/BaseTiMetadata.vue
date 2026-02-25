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
      v-if="currentTiData"
      v-model="tabIndex"
      background-color="primary"
      dark
    >
      <v-tab>
        {{ getTerraIndigenaName() }}
      </v-tab>

      <v-tab-item class="fill-height">
        <v-card-text style="max-height: 230px; overflow-y: auto">
          <template v-if="getOrderedEntries().length > 0">
            <template
              v-for="(entry, i) in getOrderedEntries()"
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
                v-if="i < getOrderedEntries().length - 1"
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
        co_cr: 'Código CR',
        co_funai: 'Código Funai',
        ds_cr: 'CR',
        ds_decreto_homologada: 'Decreto homologado',
        ds_despacho_delimitada: 'Despacho delimitada',
        ds_doc_resumo_declarada: 'Doc Resumo Declarada',
        ds_doc_resumo_delimitada: 'Doc Resumo Delimitada',
        ds_doc_resumo_em_estudo: 'Doc Resumo Em Estudo',
        ds_doc_resumo_homologada: 'Doc resumo homologada',
        ds_doc_resumo_regularizada: 'Doc resumo regularizada',
        ds_fase_ti: 'Fase TI',
        ds_matricula_regularizada: 'Matrícula regularizada',
        ds_modalidade: 'Modalidade',
        ds_portaria_declarada: 'Portaria declarada',
        ds_portaria_em_estudo: 'Portaria em estudo',
        ds_reestudo_ti: 'Reestudo TI',
        dt_cadastro: 'Data de cadastro',
        dt_declarada: 'Declarada',
        dt_delimitada: 'Delimitada',
        dt_em_estudo: 'Em estudo',
        dt_homologada: 'Homologada',
        dt_regularizada: 'Regularizada',
        id: 'Id',
        instrumentos_gestao: 'Instrumento de gestão',
        no_grupo_etnico: 'Grupo Étnico',
        no_municipio: 'Município',
        no_ti: 'Nome da Terra Indígena',
        nu_area_ha: 'Área (ha)',
        possui_ig: 'Possui Inst. De Gestão',
        sg_uf: 'UF',
        st_amazonia_legal: 'Amazônia Legal',
        st_faixa_fronteira: 'Faixa fronteira',
        is_estudo: 'Em Estudo',
        layername: 'Layer',
        namespace: 'Namespace',
      },
      formattedNameCache: new Map(),
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
          }
        this.clearCache();
      },
      immediate: true,
      deep: true,
    },
  },

  methods: {
    getDataObject() {
      return this.currentTiData?.properties || this.currentTiData;
    },

    getTerraIndigenaName() {
      const data = this.getDataObject();
      return data?.no_ti || 'Terra Indígena';
    },

    getOrderedEntries() {
      const data = this.getDataObject();
      
      if (!data || typeof data !== 'object') {
        return [];
      }

      const fieldOrder = [
        'co_funai',
        'no_ti',
        'no_grupo_etnico',
        'ds_fase_ti',
        'ds_modalidade',
        'ds_reestudo_ti',
        'ds_cr',
        'no_municipio',
        'sg_uf',
        'nu_area_ha',
        'dt_cadastro',
        'st_faixa_fronteira',
        'dt_em_estudo',
        'ds_portaria_em_estudo',
        'dt_delimitada',
        'ds_despacho_delimitada',
        'dt_declarada',
        'ds_portaria_declarada',
        'dt_homologada',
        'ds_decreto_homologada',
        'dt_regularizada',
        'ds_matricula_regularizada',
        'ds_doc_resumo_em_estudo',
        'ds_doc_resumo_delimitada',
        'ds_doc_resumo_declarada',
        'ds_doc_resumo_homologada',
        'ds_doc_resumo_regularizada',
        'co_cr',
        'possui_ig',
      ];

      const excludedFields = [
        'instrumentos_gestao',
        'ranking',  
        'type',
      ];

      const filteredEntries = Object.entries(data).filter(
        ([key]) => 
          !key.includes('geometry') && 
          !excludedFields.includes(key)
      );

      return filteredEntries.sort(([keyA], [keyB]) => {
        const indexA = fieldOrder.indexOf(keyA);
        const indexB = fieldOrder.indexOf(keyB);
        
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        if (indexA !== -1) return -1;
        
        if (indexB !== -1) return 1;
        
        return 0;
      });
    },

    handleTabClick(item, index) {
      this.tabIndex = index;
      this.$emit('tab-selected', item);
    },

    getFormattedName(key) {
      if (this.formattedNameCache.has(key)) {
        return this.formattedNameCache.get(key);
      }
      
      const formatted = this.replacements[key] || key;
      this.formattedNameCache.set(key, formatted);
      return formatted;
    },

    clearCache() {
      this.formattedNameCache.clear();
    },

    closeCard() {
      this.isCardVisible = false;
      this.$emit('close');
      this.$store.commit('map/setCurrentTiData', null);
      this.clearCache();
    },
    openCard() {
      this.isCardVisible = true;
    },

    formatValue(value, field) {
      const fieldName = field.toLowerCase();

      if (value === null || value === '' || value === undefined) {
        return 'N/A';
      }

      // Verificação otimizada para campos de data
      const isDateField = () => {
        if (typeof value !== 'string') return false;
        
        const isDateRelatedField = fieldName.startsWith('dt_') || 
                                 fieldName.startsWith('data_') || 
                                 fieldName.startsWith('date');
        
        if (!isDateRelatedField) return false;
        
        const dateStr = value.trim();
        if (!dateStr || dateStr.length < 8) return false;
        
        return this.$moment(dateStr).isValid();
      };

      // Verificação otimizada para campos numéricos
      const isNumberField = () => {
        if (fieldName.startsWith('nu_')) return true;
        if (typeof value === 'number') return true;
        
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed === '') return false;
          
          const num = parseFloat(trimmed);
          return !isNaN(num) && isFinite(num) && trimmed === num.toString();
        }
        
        return false;
      };

      const isBooleanField = typeof value === 'boolean';

      const isLatLongField = ['lat', 'lng', 'long', 'latitude', 'longitude'].some((key) => 
        fieldName.includes(key)
      );

      if (isDateField()) {
        return this.$moment(value).format('DD/MM/YYYY');
      }

      if (isBooleanField) {
        return value ? 'Sim' : 'Não';
      }

      if (isNumberField()) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        if (isLatLongField) {
          return numValue.toFixed(5);
        }
        
        const rounded = numValue.toFixed(2);
        const [intPart, decimalPart] = rounded.split('.');

        return decimalPart !== '00'
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`
          : String(parseInt(numValue, 10));
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

.list-separator {
    background-color: rgba(0, 0, 0, 0.12);
}
</style>
