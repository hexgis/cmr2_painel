<template>
  <div>
    <v-list-group
      v-if="layer"
      v-model="isOpen"
      append-icon=""
      active-class="active"
      :disabled="
        !(
          layer.layer_type === 'wms' &&
          (layer.visible || layer.wms.has_detail)
        )
      "
    >
      <template #activator>
        <v-list-item-avatar
          v-if="
            !hidePreview &&
              ((layer.layer_type == 'wms' && layer.wms.has_preview) ||
                layer.layer_type == 'tms')
          "
          tile
          size="40"
        >
          <v-img
            :src="layerPreview"
            :lazy-src="layerPreview"
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="text-wrap">
            <span class="text-cursor">
              {{ layer.name }}
            </span>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action
          v-if="layer.visible && layer.filters.length != 0"
          @click.stop=""
        >
          <v-icon
            :class="{ 'red--text': showFilter }"
            @click="toggleFilter"
          >
            {{ icon_filter }}
          </v-icon>
        </v-list-item-action>
        <v-list-item-action
          class="pl-2"
          @click.stop=""
        >
          <v-icon
            :class="{ 'red--text': showMetadata }"
            @click="toggleMetadata"
          >
            {{ icon }}
          </v-icon>
        </v-list-item-action>
        <v-list-item-action @click.stop="">
          <v-switch
            :input-value="layer.visible"
            :loading="layer.loading"
            @change="toggleLayer"
          />
        </v-list-item-action>
      </template>
      <v-container class="py-0 mt-2">
        <SupportLayerMetadata
          v-if="showMetadata"
          :layer-id="layerId"
        />
      </v-container>
      <v-container class="py-0">
        <SupportLayerFilters
          v-if="layer.filters && showFilters"
          :layer="layer"
        />
        <v-divider />
        <v-row
          v-if="layer.layer_type === 'wms'
            && layer.visible
            && (layer.wms.has_opacity || layer.wms.has_metadata)"
          class="black--text text--lighten-2"
          align="center"
        >
          <v-col
            v-if="layer.wms.has_metadata"
            cols="1"
            class="ml-n3 mr-4"
          >
            <v-btn
              :loading="isLoadingTable"
              icon
              fab
              small
              color="accent"
              @click="openTableDialogLocal"
            >
              <v-tooltip left>
                <template #activator="{ on }">
                  <v-icon v-on="on">
                    mdi-table
                  </v-icon>
                </template>
                <span>{{ $t('table-label') }}</span>
              </v-tooltip>
            </v-btn>
          </v-col>

          <template v-if="layer.wms.has_opacity">
            <v-col
              cols="3"
              class="grey--text text--darken-2"
            >
              Opacidade
            </v-col>
            <v-col
              cols="7"
              class="mt-2 pr-0"
            >
              <v-slider
                :value="layer.opacity"
                class="mb-n4 mr-0"
                thumb-label
                @input="updateLayerOpacity($event)"
              />
            </v-col>
          </template>
        </v-row>
        <v-row
          v-if="layer.layer_type === 'wms' && layer.wms.has_detail"
          justify="center"
          class=""
        >
          <v-col>
            <SubLayers
              v-if="layer.wms && layer.wms.has_sublayers"
              :layer="layer"
            />
            <v-img
              v-else
              contain
              :src="layerPreview"
              :lazy-src="layerPreview"
              :max-width="layer.wms.detail_width"
              position="center center"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-list-group>

    <TableDialog
      v-if="localShowTableDialog"
      :table="localShowTableDialog"
      :headers="localTableHeaders"
      :value="transformTableData"
      :loading-table="isLoadingTable"
      :loading-csv="isLoadingCSV"
      :f-close-table="closeTableDialogLocal"
      :table-name="layer.name"
    />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import moment from 'moment';
import tmsLegend from '@/assets/tmsLegend.png';
import ti from '@/assets/ti.png';

import SupportLayerFilters from '@/components/support/SupportLayerFilters';
import SupportLayerMetadata from '@/components/support/SupportLayerMetadata';
import SubLayers from './SubLayers.vue';
import TableDialog from '../table-dialog/TableDialog.vue';

export default {
  name: 'SupportLayersGroupItem',

  components: {
    SupportLayerFilters,
    SupportLayerMetadata,
    SubLayers,
    TableDialog,
  },

  props: {
    layerId: {
      type: Number,
      required: true,
    },

    hidePreview: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    isOpen: false,
    showMetadata: false,
    showFilter: false,
    showFilters: true,
    isLoadingTable: false,
    localShowTableDialog: false,
    localTableData: { features: [] },
    localTableHeaders: [],
    isLoadingCSV: false,
    // Configuração de campos para o popup e tabela
    fieldConfig: {
      excludedFields: [
        'bbox',
        'path',
        'row',
        'no_br',
        'id_key',
        'id_tb',
        'ranking',
        'id_cr',
        'id_ti',
      ],
      fieldNames: {
        nu_buffer_distancia: 'Distância do Buffer',
        co_funai: 'Código Funai',
        no_ti: 'Nome da Terra Indígena',
        co_cr: 'Código CR',
        no_cr: 'Nome CR',
        no_abreviado: 'Nome Abreviado',
        sg_cr: 'Sigla CR',
        st_situacao: 'Situação',
        ds_email: 'Email',
        no_regiao: 'Região',
        no_municipio: 'Município',
        no_uf: 'Estado',
        sg_uf: 'UF',
        ds_telefone: 'Telefone',
        ds_cadatro: 'Data de Cadastro',
        no_ig: 'Instrumento de Gestão',
        nu_ano_elaboracao: 'Ano de Elaboração',
        ds_obs: 'Observação',
        ds_ttl_publi: 'Título da Publicação',
        ds_disp_meio_local: 'Disponível em (Meio/Local)',
        co_funai_tb: 'Código Funai',
        id: 'ID',
        cd_munic: 'Código Município',
        nm_munic: 'Município',
        situacao: 'Situação',
        ocorrencia: 'Ocorrência',
        nm_ti: 'TI',
        c_cr_funai: 'Código CR Funai',
        n_cr_funai: 'Nome CR Funai',
        cd_li: 'Código LI',
        id_li: 'ID LI',
        nm_li: 'Nome da LI',
        no_grupo_etnico: 'Grupo Étnico',
        ds_fase_ti: 'Fase TI',
        ds_reestudo_ti: 'Reestudo TI',
        ds_portaria_em_estudo: 'Portaria em Estudo',
        ds_matricula_regularizada: 'Matrícula Regularizada',
        dt_cadastro: 'Data de Cadastro',
        nu_area_ha: 'Área Ha',
        ds_cr: 'CR',
        possui_ig: 'Possui Inst. de Gestão',
        nu_area_km2: 'Área Km²',
        no_classe: 'Nome da Classe',
        sg_classe: 'Sigla da Classe',
        co_sr: 'Código SR',
        dt_publica: 'Data de publicação',
        dt_public1: 'Data de publicação 1',
        nu_familia: 'Família',
        dt_titulo: 'Data do Título',
        no_responsavel: 'Responsável',
        st_titulad: 'Titulado',
        cd_quilomb: 'Código Quilombola',
        ds_descricao: 'Descrição',
        nr_escalao: 'Escala',
        tp_levanta: 'Tipo de Levantamento',
        no_uc: 'Nome UC',
        sg_uc: 'Sigla UC',
        no_unidade: 'Nome da Unidade',
        co_cnuc: 'Código CANU',
        ds_link_icmbio: 'Link ICMBIO',
        path: 'Órbita',
        row: 'Ponto',
        path_row: 'Órbita Ponto',
        orb_ponto: 'Órbita Ponto',
        cd_sipra: 'Código SIPRA',
        nu_beneficio: 'Benefício',
        dt_criacao: 'Data de Criação',
        nu_ano_criacao: 'Ano de Criação',
        ds_forma_obtencao: 'Forma de Obtenção',
        dt_obtencao: 'Data de Obtenção',
        no_sr: 'SR',
        nu_area_ref_incra: 'Área Ref. INCRA',
        co_terra_indigena: 'Código Terra Indígena',
        no_terra_indigena: 'Nome Terra Indígena',
        nu_superficie_perimetro_ha: 'Superfície Perimetro Ha',
        dt_atualizacao: 'Data de Atualização',
        co_imovel: 'Imóvel',
        no_municipio_car: 'Município CAR',
        nu_modulo: 'Módulo',
        tp_imovel: 'Tipo de Imóvel',
        ds_condicao_imovel: 'Condição do Imóvel',
        tp_situacao: 'Situação',
        no_rt: 'RT',
        co_art: 'Código ART',
        ds_situacao: 'Situação',
        dt_submissao: 'Data de Submissão',
        dt_aprovacao: 'Data de Aprovação',
        no_area: 'Área',
        ds_registro_m: 'Registro M',
        ds_registro_d: 'Registro D',
        cd_municipio: 'Código Município',
        cd_uf: 'Código UF',
        nu_certificado: 'Número do Certificado',
        dt_certificado: 'Data do Certificado',
        no_imovel: 'Imóvel',
        nu_br: 'BR',
        no_inicio_rodovia: 'Início da Rodovia',
        nu_km_extensao: 'Km Extensão',
        ds_concessao: 'Concessão',
        ds_superficie_federal: 'Superfície Federal',
        no_superficie_estadual_coincidente: 'Superfície Estadual Coincidente',
        ds_jurisdicao: 'Jurisdicação',
        sg_superficie_federal: 'Sigla Superfície Federal',
        nm_tipo_trecho: 'Tipo do Trecho',
        sg_tipo_trecho: 'Sigla do Trecho',
        sg_legenda: 'Sigla Legenda',
        nu_uf_geocodigo: 'Número UF Geocódigo',
        nu_geocodigo: 'Número Geocódigo',
        nu_ano_referencia: 'Ano Referência',
        no_faixa_de_fronteira: 'Faixa de Fronteira',
        geometriaa: 'Geometria',
        geocodigo: 'Geocódigo',
        nu_numero: 'Número',
        no_ult_evento: 'Último Evento',
        no_subs: 'Substância',
        no_cbe: 'Comitê Estadual',
        cd_cbe: 'Código CBE',
        no_rhi: 'Nome RHI',
        nu_cbe_ano_ref: 'Ano de referência',
        dt_cbe_ano_ref: 'Data CBE Ref.',
        nu_popuf: 'População Estado',
        nu_piburb: 'PIB Urbano',
        nu_pibuf: 'PIB Estado',
        nu_popurb2019: 'População Urbana (2019)',
        nu_poprur2019: 'População Rural (2019)',
        no_bioma: 'Bioma',
      },
    },
  }),

  computed: {
    ...mapState('supportLayers', ['supportLayers']),

    icon() {
      return this.showMetadata
        ? 'mdi-information-off-outline'
        : 'mdi-information';
    },

    icon_filter() {
      return this.showFilters
        ? 'mdi-filter-remove-outline'
        : 'mdi-filter-outline';
    },

    layer() {
      return this.supportLayers[this.layerId] || null;
    },

    layerPreview() {
      if (this.layer.layer_type === 'tms') return tmsLegend;

      if (this.layer.wms.geoserver_layer_name === 'lim_terra_indigena_a') {
        return ti;
      }

      return (
        this.layer.wms.geoserver.preview_url
        + this.layer.wms.geoserver_layer_name
      );
    },

    transformTableData() {
      const transformed = (this.localTableData.features || []).map((feature) => {
        const formattedProperties = {};
        Object.keys(feature.properties).forEach((key) => {
          formattedProperties[key] = this.formatFieldValue(feature.properties[key], key);
        });
        return {
          ...formattedProperties,
          properties: formattedProperties,
        };
      });
      return transformed;
    },
  },

  methods: {
    ...mapMutations('supportLayers', ['toggleLayerVisibility', 'setLayerOpacity']),
    ...mapActions('supportLayers', ['openTableDialog', 'downloadCSV']),

    formatFieldValue(value, field = '') {
      if (value === null || value === undefined) return 'N/A';

      const fieldName = field.toLowerCase();
      const isDateField = typeof value === 'string'
        && (fieldName.startsWith('dt_')
          || fieldName.startsWith('data_')
          || fieldName.startsWith('date'))
        && moment(value).isValid();
      const isBooleanField = typeof value === 'boolean';
      const isNumberField = typeof value === 'number';
      const isLatLongField = ['lat', 'lng', 'long', 'latitude', 'longitude'].some((key) => fieldName.includes(key));

      if (isDateField) return moment(value).format('DD/MM/YYYY');
      if (isBooleanField) return value ? 'Sim' : 'Não';
      if (isNumberField || fieldName.startsWith('nu_')) {
        if (isLatLongField) return value.toFixed(5);
        let parsedValue = value;
        if (typeof value === 'string') parsedValue = parseFloat(value);
        if (Number.isNaN(parsedValue)) return 'N/A';
        const rounded = parsedValue.toFixed(2);
        const [intPart, decimalPart] = rounded.split('.');
        return decimalPart !== '00' || (fieldName.startsWith('nu_') && fieldName.includes('area'))
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`
          : parseInt(value, 10).toString();
      }
      return value.toString() || 'N/A';
    },

    async openTableDialogLocal() {
      this.isLoadingTable = true;
      this.localShowTableDialog = false;
      try {
        const { data, headers } = await this.openTableDialog({
          layerId: this.layerId,
          fieldConfig: this.fieldConfig,
        });
        this.localTableData = data;
        this.localTableHeaders = headers;
        this.localShowTableDialog = true;
        this.isLoadingTable = false;
      } catch (error) {
        this.isLoadingTable = false;
        this.localShowTableDialog = false;
      }
    },

    closeTableDialogLocal() {
      this.localShowTableDialog = false;
      this.localTableData = { features: [] };
      this.localTableHeaders = [];
    },

    toggleMetadata() {
      this.showMetadata = !this.showMetadata;
      this.isOpen = this.layer.visible;
    },

    toggleFilter() {
      this.showFilters = !this.showFilters;
      this.isOpen = this.layer.visible;
    },

    toggleLayer() {
      this.toggleLayerVisibility({
        id: this.layerId,
        visible: !this.layer.visible,
      });

      this.isOpen = this.layer.visible;
    },

    updateLayerOpacity(opacity) {
      this.setLayerOpacity({
        id: this.layerId,
        opacity,
      });
    },
  },
};
</script>

<i18n>
{
  "en": {
    "table-label": "Table"
  },
  "pt-br": {
    "table-label": "Tabela"
  }
}
</i18n>
