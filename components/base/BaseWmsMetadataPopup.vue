<template>
  <l-layer-group
    ref="popup"
    :visible="!isDrawing"
  >
    <l-popup :options="popupOptions">
      <LoadingIconVue v-if="isLoadingData" />
      <v-card
        v-else
        class="fill-height"
      >
        <v-card-title class="pa-0">
          <v-row
            no-gutters
            class="fundo-primary pa-1"
          >
            <v-spacer />
            <v-btn
              icon
              x-small
              color="white"
              @click="$refs.popup.mapObject.closePopup()"
            >
              <v-icon small>
                mdi-close
              </v-icon>
            </v-btn>
          </v-row>
        </v-card-title>
        <v-tabs
          background-color="primary"
          dark
          show-arrows
          class="fill-height"
        >
          <template v-for="(layerData, layerName) in data">
            <v-tab :key="layerName">
              {{ layerName }}
            </v-tab>
            <v-tab-item
              :key="layerName"
              class="fill-height"
            >
              <v-card-text
                style="max-height: 312px; overflow-y: auto"
              >
                <template
                  v-for="(feature, i) in layerData.layers"
                >
                  <v-row
                    v-show="i != 0"
                    :key="i"
                    class="mx-0 grey lighten-2"
                  >
                    <v-col />
                  </v-row>
                  <template v-for="(value, field) in feature">
                    <template v-if="shouldDisplayField(field)">
                      <v-row
                        :key="field + i"
                        :align="field.align"
                        class="mx-0 list-separator"
                        dense
                      >
                        <v-col
                          cols="5"
                          class="text-right"
                        >
                          {{ formatFieldName(field) }}:
                        </v-col>
                        <v-col
                          cols="7"
                          class="text-subtitle-2"
                          style="overflow-wrap: anywhere;"
                        >
                          <a
                            v-if="isValidUrl(value)"
                            :href="value"
                            target="_blank"
                          >
                            {{ value }}
                          </a>
                          <span v-else>
                            {{ formatFieldValue( value, field ) }}
                          </span>
                        </v-col>
                      </v-row>
                    </template>
                  </template>
                  <v-card
                    v-if="feature.hasOwnProperty('dt_t_zero') || feature.hasOwnProperty('dt_t_um')"
                    :key="'extra-field-' + i"
                    class="pa-3"
                  >
                    <div
                      v-for="(part, index) in customTextParts"
                      :key="index"
                      class="custom-text"
                    >
                      <strong>{{ part.bold }}</strong> {{ part.text }}
                      <br v-if="index < customTextParts.length - 1">
                    </div>
                  </v-card>
                </template>
                <template v-if="layerData.loading">
                  <v-row
                    v-for="i in 3"
                    :key="i"
                    dense
                  >
                    <v-col
                      cols="5"
                      class="text-right"
                    >
                      <v-skeleton-loader
                        class="pt-1"
                        type="text"
                      />
                    </v-col>
                    <v-col cols="7">
                      <v-skeleton-loader
                        class="pt-1"
                        type="text"
                      />
                    </v-col>
                  </v-row>
                </template>
                <div v-else-if="!layerData.layers.length">
                  {{ $t('no-data') }}
                </div>
              </v-card-text>
            </v-tab-item>
          </template>
        </v-tabs>
      </v-card>
    </l-popup>
  </l-layer-group>
</template>
<i18n>
  {
      "en": {
          "no-data": "There's no data at this point for the selected layer.",
          "layer-api-error": "Unable to acquire support layer information."
      },
      "pt-br": {
          "no-data": "Não há dados nesse ponto para a camada selecionada.",
          "layer-api-error": "Não foi possível resgatar as informações das camadas de apoio."
      }
  }
  </i18n>
<script>
import { mapState } from 'vuex';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import LoadingIconVue from '../map/file-loader/LoadingIcon.vue';

export default {
  name: 'BaseWmsMetadataPopup',
  components: {
    LoadingIconVue,
  },

  props: {
    map: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    hasPopup: false,
    popup: null,
    data: null,
    loadingData: false,
    currentLatLng: '',
    customTextParts: [
      { bold: 'Data T0*: ', text: 'última imagem Landsat-8 em que a alteração da cobertura vegetal ainda não havia sido iniciada.' },
      { bold: 'Data T1*:', text: 'data da imagem do satélite em que é possível ver a primeira aparição da alteração da cobertura vegetal.' },
    ],
    fieldConfig: {
    // Campos que devem ser ignorados
      excludedFields: ['bbox', 'path', 'row', 'no_br'],
      // Substituições completas de nomes de campos
      fieldNames: {
        nu_buffer_distancia: 'Buffer Distância',
        co_funai: 'Código Funai',
        no_ti: 'Nome da Terra Indígena',

        // COORDENAÇÕES REGIONAIS
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

        // INSTRUMENTO DE GESTÃO
        no_ig: 'IG',
        nu_ano_elaboracao: 'Ano de Elaboração',

        // LOCALIDADES INDIGENAS
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

        // TERRAS INDIGENAS EM ESTUDO
        no_grupo_etnico: 'Grupo Étinico',
        ds_fase_ti: 'Fase TI',
        ds_reestudo_ti: 'Reestudo TI',
        ds_portaria_em_estudo: 'Portaria em Estudo',
        ds_matricula_regularizada: 'Matrícula Regularizada',
        dt_cadastro: 'Data de Cadastro',
        nu_area_ha: 'Área Ha',

        // TERRAS INDIGENAS
        ds_cr: 'CR',
        possui_ig: 'Possui Inst. de Gestão',

        // ANTROPISMO CONSOLIDADO - 2015
        nu_area_km2: 'Área Km²',
        no_classe: 'Nome da Classe',
        sg_classe: 'Sigla da Classe',

        // ÁREAS QUILOMBOLAS
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

        // UNIDADES DE CONSERVAÇÃO FEDERAL
        no_uc: 'Nome UC',
        sg_uc: 'Sigla UC',
        no_unidade: 'Nome da Unidade',
        co_cnuc: 'Código CNUC',
        ds_link_icmbio: 'Link ICMBIO',

        // GRADE LANDSAT
        path: 'Órbita',
        row: 'Ponto',
        path_row: 'Órbita Ponto',
        orb_ponto: 'Órbita Ponto',

        // ASSENTAMENTOS RURAIS
        cd_sipra: 'Código SIPRA',
        nu_beneficio: 'Benefício',
        dt_criacao: 'Data de Criação',
        nu_ano_criacao: 'Ano de Criação',
        ds_forma_obtencao: 'Forma de Obtenção',
        dt_obtencao: 'Data de Obtenção',
        no_sr: 'SR',
        nu_area_ref_incra: 'Área Ref. INCRA',

        // CAR
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

        // IMOVEIS CERTIFICADOS PRIVADO (SIGEF)
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

        // IMOVEIS CERTIFICADOS PRIVADO (SNCI)
        nu_certificado: 'Número do Certificado',
        dt_certificado: 'Data do Certificado',
        no_imovel: 'Imóvel',

        // TRECHOS RODOVIARIOS
        nu_br: 'BR',
        no_inicio_rodovia: 'Início da Rodovia',
        nu_km_extensao: 'Km Extensão',
        ds_concessao: 'Concessão',
        ds_superficie_federal: 'Superfície Federal',
        no_superficie_estadual_coincidente: 'Superfície Estadual Coincidente',
        ds_jurisdicao: 'Jurisdição',
        sg_superficie_federal: 'Sigla Superfície Federal',
        nm_tipo_trecho: 'Tipo do Trecho',
        sg_tipo_trecho: 'Sigla do Trecho',
        sg_legenda: 'Sigla Legenda',

        // ÁREAS MUNICIPAIS
        nu_uf_geocodigo: 'Número UF Geocódigo',
        nu_geocodigo: 'Número Geocódigo',
        nu_ano_referencia: 'Ano Referência',

        // FAIXA DE FRONTEIRA
        no_faixa_de_fronteira: 'Faixa de Fronteira',

        // SEDE DE MUNICÍPIOS
        geometriaa: 'Geometria',
        geocodigo: 'Geocódigo',

        // DADOS SIGMINE
        nu_numero: 'Número',
        no_ult_evento: 'Último Evento',
        no_subs: 'Substância',

        // COMITES DE BACIAS HIDROGRAFICAS ESTADUAIS
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

        // MONITORAMENTO DIÁRIO
        ti_nu_area_ha: 'Área Ha',
        no_estagio: 'Estágio',
        dt_imagem: 'Data da Imagem',
        nu_orbita: 'Órbita',
        dt_t_zero: 'Data T0',
        dt_t_um: 'Data T1',
      },
    },
  }),

  computed: {
    isLoadingData() {
      return this.loadingData;
    },
    isSmallScreen() {
      return window.innerWidth < 768;
    },
    popupOptions() {
      return {
        minWidth: this.isSmallScreen ? 300 : 420,
        maxHeight: this.isSmallScreen ? 280 : 360,
        className: 'card-popup',
        color: 'secondary',
        closeButton: false,
      };
    },

    ...mapState('map', ['isDrawing']),
  },

  watch: {
    map() {
      if (this.map) {
        this.map.on('click', this.getFeatureInfo, this);
      }
    },
  },

  methods: {
    shouldDisplayField(field) {
      return !this.fieldConfig.excludedFields.some(
        (excluded) => field.toLowerCase().includes(excluded),
      );
    },

    formatFieldName(field) {
      const lowerField = field.toLowerCase();

      if (this.fieldConfig.fieldNames[lowerField]) {
        return this.fieldConfig.fieldNames[lowerField];
      }

      return this.formatGenericFieldName(field);
    },

    formatGenericFieldName(field) {
      // Remove prefixos no formato "XX_"
      const cleanedField = /^[a-z]{2}_/i.test(field)
        ? field.substring(3)
        : field;
      // Formata snake_case para Title Case
      return cleanedField
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    },

    formatFieldValue(value, field = '') {
      if (value === null || value === undefined) {
        return 'N/A';
      }

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
        if (typeof value === 'string') {
          // eslint-disable-next-line no-param-reassign
          value = parseFloat(value);
        }
        const rounded = value.toFixed(2);
        const [intPart, decimalPart] = rounded.split('.');

        return decimalPart !== '00' || (fieldName.startsWith('nu_') && fieldName.includes('area'))
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`
          : parseInt(value, 10);
      }

      // 5. Valor padrão (string ou outros)
      return value || 'N/A';
    },

    isValidUrl(value) {
      let url;
      try {
        url = new URL(value);
      } catch (_) {
        return false;
      }
      return url.protocol === 'http:' || url.protocol === 'https:';
    },

    async getFeatureInfo(evt) {
      this.hasPopup = false;
      this.data = {};
      this.currentLatLng = evt.latlng;
      await this.map.eachLayer(async (layer) => {
        if (Object.prototype.hasOwnProperty.call(layer, 'wmsParams')) {
          this.hasPopup = true;
          const layerName = layer.wmsParams.name;
          this.data[layerName] = {
            layers: [],
            loading: true,
          };
          const url = this.getFeatureInfoUrl(evt.latlng, layer);
          this.loadingData = true;
          this.$axios.get(url).then(async ({ data }) => {
            if (data && data.features && data.features.length) {
            // eslint-disable-next-line no-restricted-syntax
              for (const feature of data.features) {
                if (layerName.toLowerCase().includes('instrumento') || layerName.toLowerCase().includes('gestão')) {
                  // eslint-disable-next-line no-await-in-loop
                  const res = await this.fetchInstrumentoGestao(
                    feature.properties.co_funai,
                  );
                  this.data[layerName].layers = res || [];
                  return;
                }
                this.data[layerName].layers.push(
                  feature.properties,
                );
              }
            }
          })
            .catch(() => {
              this.$store.commit('alert/addAlert', {
                message: this.$t('layer-api-error'),
              });
            })
            .finally(() => {
              this.loadingData = false;
              this.data[layerName].loading = false;
              this.$forceUpdate();
            });
        } else if (layer.feature) {
          if (
            layer.feature.geometry.type === 'MultiPolygon' || layer.feature.geometry.type === 'Polygon'
          ) {
            if (booleanPointInPolygon(
              [evt.latlng.lng, evt.latlng.lat],
              layer.feature,
            )) {
              const name = layer.feature.properties.no_ti;
              const layerName = name;
              this.hasPopup = true;
              this.data[layerName] = {
                layers: [layer.feature.properties],
                loading: false,
              };
            }
          }
        }
      });

      if (this.hasPopup) {
        this.$refs.popup.mapObject.openPopup(evt.latlng);
      }
    },

    getFeatureInfoUrl(latlng, layer) {
      const point = this.map.latLngToContainerPoint(
        latlng,
        this.map.getZoom(),
      );

      const size = this.map.getSize();
      const params = {
        request: 'GetFeatureInfo',
        service: 'WMS',
        srs: 'EPSG:4326',
        styles: layer.wmsParams.styles,
        transparent: layer.wmsParams.transparent,
        version: layer.wmsParams.version,
        format: layer.wmsParams.format,
        // eslint-disable-next-line no-underscore-dangle
        bbox: layer._map.getBounds().toBBoxString(),
        feature_count: 50,
        height: size.y,
        width: size.x,
        layers: layer.wmsParams.layers,
        query_layers: layer.wmsParams.layers,
        info_format: 'application/json',
      };

      params[params.version === '1.3.0' ? 'i' : 'x'] = Math.trunc(point.x);
      params[params.version === '1.3.0' ? 'j' : 'y'] = Math.trunc(point.y);

      return (
        // eslint-disable-next-line no-underscore-dangle
        layer._url + this.$L.Util.getParamString(params, layer._url, true)
      );
    },

    async fetchInstrumentoGestao(CoFunai) {
      this.loadingData = true;
      const url = `funai/management-instrument/?co_funai=${CoFunai}`;
      try {
        return await this.$api.$get(url);
      } catch (error) {
        console.error('Error fetching data:', error);
        return [];
      } finally {
        this.loadingData = false;
      }
    },
  },
};
</script>

<style>
.fundo-primary {
  background-color: var(--v-primary-base) !important;
}

.text-white {
  color: white !important;
}
</style>
