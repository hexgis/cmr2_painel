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
      v-if="isCardVisible"
      v-model="tabIndex"
      background-color="primary"
      dark
      class="fill-height"
    >
      <v-tab
        v-for="(item, index) in filteredItems"
        :key="index"
        @click="handleTabClick(item, index)"
      >
        {{ item.no_ti }}
      </v-tab>

      <v-tab-item
        v-for="(item, index) in filteredItems"
        :key="'tab-item-' + index"
        class="fill-height"
      >
        <v-card-text style="max-height: 230px; overflow-y: auto">
          <template v-if="item && typeof item === 'object'">
            <template
              v-for="(entry, i) in Object.entries(item).filter(
                ([key, value]) => key !== 'instrumentos_gestao'
              )"
            >
              <v-row
                :key="'row-' + index + '-' + i"
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
                  {{ formatValue(entry[1]) }}
                </v-col>
              </v-row>

              <v-divider
                v-if="i < Object.entries(item).length - 1"
                :key="'divider-' + index + '-' + i"
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
        ds_doc_resumo_declarada: ' Doc resumo declarada',
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
      },
    };
  },

  computed: {
    ...mapState('map', ['savedSelectedItems']),
    filteredItems() {
      return this.savedSelectedItems || [];
    },
  },

  watch: {
    savedSelectedItems: {
      handler(newVal) {
        if (newVal.length > 0) {
          this.openCard();
          this.tabIndex = newVal.length - 1;
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
      for (const prefix in this.replacements) {
        if (key.startsWith(prefix)) {
          return this.replacements[prefix];
        }
      }
      return key;
    },
    closeCard() {
      this.isCardVisible = false;
      this.$emit('close');
      this.$store.commit('map/clearSavedSelectedItems');
    },
    openCard() {
      this.isCardVisible = true;
    },

    formatValue(value) {
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
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
