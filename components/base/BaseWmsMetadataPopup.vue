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
            class="fundo-primary pa-2 d-flex align-center"
          >
            <v-spacer />
            <!-- Enhanced close button -->
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  icon
                  x-small
                  color="white"
                  v-on="on"
                  @click="$refs.popup.mapObject.closePopup()"
                >
                  <v-icon small>
                    mdi-close
                  </v-icon>
                </v-btn>
              </template>
              <span>{{ $t('close') }}</span>
            </v-tooltip>
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
              <!-- Export buttons section for this specific layer -->
              <div
                v-if="layerDownloadMap[layerName] && layerData.layers.length > 0"
                class="d-flex justify-end pa-2 bg-grey-lighten-4 border-bottom"
              >
                <span class="text-caption mr-2 align-self-center">{{ $t('export') }}:</span>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      fab
                      x-small
                      color="success"
                      elevation="1"
                      class="mr-1"
                      :loading="isDownloadingLayer(layerName, 'csv')"
                      :disabled="isDownloading"
                      v-bind="attrs"
                      v-on="on"
                      @click="downloadFeatureData(layerName, layerData, 'csv')"
                    >
                      <v-icon
                        small
                        color="white"
                      >
                        mdi-file-table-outline
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('export-csv') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      fab
                      x-small
                      color="primary"
                      elevation="1"
                      :loading="isDownloadingLayer(layerName, 'json')"
                      :disabled="isDownloading"
                      v-bind="attrs"
                      v-on="on"
                      @click="downloadFeatureData(layerName, layerData, 'json')"
                    >
                      <v-icon
                        small
                        color="white"
                      >
                        mdi-code-json
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('export-json') }}</span>
                </v-tooltip>
              </div>

              <v-card-text style="max-height: 312px; overflow-y: auto">
                <template v-for="(feature, i) in layerData.layers">
                  <v-row
                    v-show="i != 0"
                    :key="i"
                    class="mx-0 grey list-separator"
                  >
                    <v-col />
                  </v-row>
                  <!-- Exibir co_funai primeiro, se presente -->
                  <template v-if="shouldDisplayField('co_funai') && feature.co_funai">
                    <v-row
                      :key="`co_funai-${i}`"
                      class="mx-0 list-separator"
                      dense
                    >
                      <v-col
                        cols="5"
                        class="text-right"
                      >
                        {{ fieldConfig.fieldNames.co_funai || 'Código Funai' }}:
                      </v-col>
                      <v-col
                        cols="7"
                        class="text-left font-weight-bold"
                      >
                        {{ feature.co_funai }}
                      </v-col>
                    </v-row>
                  </template>
                  <!-- Exibir origin_id, se aplicável -->
                  <template v-if="shouldDisplayField('origin_id') && feature.origin_id">
                    <v-row
                      :key="`origin_id-${i}`"
                      class="mx-0 list-separator"
                      dense
                    >
                      <v-col
                        cols="5"
                        class="text-right"
                      >
                        {{ fieldConfig.fieldNames.origin_id || 'origin_id' }}:
                      </v-col>
                      <v-col
                        cols="7"
                        class="text-left font-weight-bold"
                      >
                        {{ feature.origin_id }}
                      </v-col>
                    </v-row>
                  </template>
                  <!-- Iterar sobre os outros campos, exceto co_funai e origin_id -->
                  <template v-for="(value, field) in feature">
                    <template
                      v-if="
                        shouldDisplayField(field)
                          && field !== 'co_funai'
                          && field !== 'origin_id'
                      "
                    >
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
                            {{ formatFieldValue(value, field) }}
                          </span>
                        </v-col>
                      </v-row>
                    </template>
                  </template>
                  <v-card
                    v-if="feature.hasOwnProperty('dt_t_zero') || feature.hasOwnProperty('dt_t_um')"
                    :key="'extra-field-' + i"
                    class="pa-3 mt-3 explanation-card"
                  >
                    <div
                      v-for="(part, index) in customTextParts"
                      :key="index"
                    >
                      <strong>{{ part.bold }}</strong>
                      {{ part.text }}
                      <br v-if="index < customTextParts.length - 1">
                    </div>
                  </v-card>
                </template>
                <template v-if="layerData.loading">
                  <div class="text-center py-4">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                      size="32"
                    />
                    <p class="text-caption mt-2 mb-0">
                      {{ $t('loading-data') }}
                    </p>
                  </div>
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
          "layer-api-error": "Unable to acquire support layer information.",
          "export": "Export",
          "export-csv": "Export CSV",
          "export-json": "Export JSON",
          "close": "Close",
          "loading-data": "Loading data...",
          "download-success": "Download completed successfully",
          "download-error": "Download failed",
          "no-export-data": "No data available for export"
      },
      "pt-br": {
          "no-data": "Não há dados nesse ponto para a camada selecionada.",
          "layer-api-error": "Não foi possível resgatar as informações das camadas de apoio.",
          "export": "Exportar",
          "export-csv": "Exportar CSV",
          "export-json": "Exportar JSON",
          "close": "Fechar",
          "loading-data": "Carregando dados...",
          "download-success": "Download concluído com sucesso",
          "download-error": "Falha no download",
          "no-export-data": "Nenhum dado disponível para exportação"
      }
  }
</i18n>

<script>
import { mapState } from 'vuex';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { stringify } from 'wkt';
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
    data: {},
    loadingData: false,
    currentLatLng: '',
    isDownloading: false,
    currentDownloadFormat: null,
    currentDownloadLayer: null, // Track which layer is being downloaded
    layerDownloadMap: {},
    customTextParts: [
      {
        bold: 'Data T0*: ',
        text: 'última imagem Landsat-8 em que a alteração da cobertura vegetal ainda não havia sido iniciada.',
      },
      {
        bold: 'Data T1*:',
        text: 'data da imagem do satélite em que é possível ver a primeira aparição da alteração da cobertura vegetal.',
      },
    ],
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
        'geometry_wkt',
      ],
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
        no_ig: 'Instrumento de Gestão',
        nu_ano_elaboracao: 'Ano de Elaboração',
        ds_obs: 'Observação',
        ds_ttl_publi: 'Título da Publicação',
        ds_disp_meio_local: 'Disponível em (Meio/Local)',
        co_funai_tb: 'Código Funai',
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
        no_grupo_etnico: 'Grupo Étnico',
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
        co_cnuc: 'Código CANU',
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
        no_superficie_estadual_coincidente:
                    'Superfície Estadual Coincidente',
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
        origin_id: 'ID',
        id_key: 'Chave ID',
        // DETER
        tb_download_deter_a_b_id: 'Download Deter AB',
        ds_mes: 'Mês',
        view_date: 'Data de detecção',
        // FOCO CALOR
        sg_regiao: 'Região',
        no_satelite: 'Satélite',
        hr_foco_calor: 'Horário',
        // USO E OCUPAÇÃO DO SOLO
        no_satelites: 'Satélites',
        nu_resolucoes: 'Resoluções',
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

    layersWithData() {
      if (!this.data) return [];

      const result = Object.entries(this.data).filter(([, layerData]) => layerData.layers
        && layerData.layers.length > 0);
      return result;
    },

    layersWithDownload() {
      if (!this.data) return [];

      return Object.entries(this.data).filter(
        ([layerName]) => this.layerDownloadMap[layerName] === true,
      );
    },

    layersWithDataAndDownload() {
      return this.layersWithData.filter(
        ([layerName]) => this.layerDownloadMap[layerName] === true,
      );
    },

    hasExportableData() {
      if (!this.data || !this.layerDownloadMap) {
        return false;
      }

      const hasDownload = this.hasDownloadEnabled();

      return hasDownload;
    },

    ...mapState('map', ['isDrawing']),
  },

  watch: {
    map() {
      if (this.map) {
        this.map.on('click', this.getFeatureInfo, this);
      }
    },

    data: {
      handler(newData) {
        if (newData) {
          this.$nextTick(() => {
            this.$forceUpdate();
          });
        }
      },
      deep: true,
    },
  },

  methods: {
    isDownloadingLayer(layerName, format) {
      return this.isDownloading
        && this.currentDownloadFormat === format
        && this.currentDownloadLayer === layerName;
    },

    hasDownloadEnabled() {
      if (!this.data || !this.layerDownloadMap) {
        return false;
      }

      const result = Object.keys(this.data).some(
        (layerName) => this.layerDownloadMap[layerName] === true,
      );

      return result;
    },

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

      // Verifica se é um campo de hora (hr_ ou contém 'hora' ou 'hr')
      const isTimeField = fieldName.startsWith('hr_')
                || fieldName.includes('hora')
                || fieldName.includes('time');

      // Verifica se é um campo de data (dt_ ou data_ ou date)
      const isDateField = fieldName.startsWith('dt_')
                || fieldName.startsWith('data_')
                || fieldName.startsWith('date');

      // Se for um campo de hora e o valor for uma string ISO
      if (
        isTimeField
                && typeof value === 'string'
                && this.$moment(value).isValid()
      ) {
        return this.$moment.parseZone(value).format('hh:mm A'); // Formato 06:45 PM
      }

      // Se for um campo de data e o valor for uma string ISO
      if (
        isDateField
                && typeof value === 'string'
                && this.$moment(value).isValid()
      ) {
        return this.$moment(value).format('DD/MM/YYYY'); // Formato 11/09/2022
      }

      // Restante do código original permanece igual
      const isBooleanField = typeof value === 'boolean';
      const isNumberField = typeof value === 'number';
      const isLatLongField = [
        'lat',
        'lng',
        'long',
        'latitude',
        'longitude',
      ].some((key) => fieldName.includes(key));

      if (isBooleanField) {
        return value ? 'Sim' : 'Não';
      }

      if (isNumberField || fieldName.startsWith('nu_')) {
        if (isLatLongField) {
          return value.toFixed(5);
        }
        let numericValue = value;
        if (typeof value === 'string') {
          numericValue = parseFloat(value);
        }
        const rounded = numericValue.toFixed(2);
        const [intPart, decimalPart] = rounded.split('.');

        return decimalPart !== '00'
                    || (fieldName.startsWith('nu_') && fieldName.includes('area'))
          ? `${intPart.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            '.',
          )},${decimalPart}`
          : parseInt(value, 10);
      }

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
      this.layerDownloadMap = {}; // Limpar mapa de download
      this.currentLatLng = evt.latlng;

      await this.map.eachLayer(async (layer) => {
        if (Object.prototype.hasOwnProperty.call(layer, 'wmsParams')) {
          this.hasPopup = true;
          const layerName = layer.wmsParams.name;

          let hasDownload = false;

          // Try from main layer
          if (layer.options && layer.options.hasDownload) {
            hasDownload = layer.options.hasDownload;
          } else if (layer.wmsParams && layer.wmsParams.hasDownload) {
            // Try from wmsParams
            hasDownload = layer.wmsParams.hasDownload;
          } else if (layer.hasDownload !== undefined) {
            // Try from custom properties
            hasDownload = layer.hasDownload;
          }

          this.layerDownloadMap[layerName] = hasDownload;

          this.data[layerName] = {
            layers: [],
            loading: true,
          };
          const url = this.getFeatureInfoUrl(evt.latlng, layer);

          this.loadingData = true;
          this.$axios
            .get(url)
            .then(async ({ data }) => {
              if (data && data.features && data.features.length) {
                // eslint-disable-next-line no-restricted-syntax
                for (const feature of data.features) {
                  const enrichedProperties = { ...feature.properties };

                  if (feature.geometry) {
                    try {
                      enrichedProperties.geometry_wkt = stringify(feature.geometry);
                    } catch (error) {
                      enrichedProperties.geometry_wkt = null;
                    }
                  }
                  this.data[layerName].layers.push(enrichedProperties);
                }
              }
            })
            .catch((error) => {
              console.log('❌ Erro no GetFeatureInfo:', error);
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
            layer.feature.geometry.type === 'MultiPolygon'
                        || layer.feature.geometry.type === 'Polygon'
          ) {
            if (
              booleanPointInPolygon(
                [evt.latlng.lng, evt.latlng.lat],
                layer.feature,
              )
            ) {
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
        layer._url
                // eslint-disable-next-line no-underscore-dangle
                + this.$L.Util.getParamString(params, layer._url, true)
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

    async downloadFeatureData(layerName, layerData, format = 'csv') {
      if (this.isDownloading) return;

      this.isDownloading = true;
      this.currentDownloadFormat = format;
      this.currentDownloadLayer = layerName;
      try {
        const features = layerData && layerData.layers;

        if (!features || features.length === 0) {
          this.$store.commit('alert/addAlert', {
            message: this.$t('no-export-data'),
            type: 'warning',
          });
          return;
        }

        const sanitizedLayerName = layerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = new Date().toISOString().split('T')[0];

        let downloadData;
        let filename;
        let mimeType;

        if (format === 'csv') {
          downloadData = this.generateCSV(features);
          filename = `${sanitizedLayerName}_${timestamp}.csv`;
          mimeType = 'text/csv;charset=utf-8;';
        } else {
          downloadData = this.generateJSON(features, layerName);
          filename = `${sanitizedLayerName}_${timestamp}.json`;
          mimeType = 'application/json;charset=utf-8;';
        }

        if (!downloadData) {
          throw new Error('Failed to generate download data');
        }

        await this.downloadFile(downloadData, filename, mimeType);

        this.$store.commit('alert/addAlert', {
          message: this.$t('download-success'),
          type: 'success',
        });
      } catch (error) {
        console.error('Erro no download:', error);
        this.$store.commit('alert/addAlert', {
          message: this.$t('download-error'),
          type: 'error',
        });
      } finally {
        this.isDownloading = false;
        this.currentDownloadFormat = null;
        this.currentDownloadLayer = null; // Clear the layer being downloaded
      }
    },

    downloadFile(data, filename, mimeType) {
      return new Promise((resolve, reject) => {
        try {
          let blob;

          if (filename.endsWith('.csv')) {
            const BOM = '\uFEFF';
            const csvData = BOM + data;
            blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
          } else {
            blob = new Blob([data], { type: mimeType });
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => URL.revokeObjectURL(url), 100);

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },

    generateCSV(features) {
      if (!features || features.length === 0) return '';

      try {
        const allKeys = new Set();
        features.forEach((feature) => {
          if (feature && typeof feature === 'object') {
            Object.keys(feature).forEach((key) => allKeys.add(key));
          }
        });

        if (allKeys.size === 0) return '';

        const headers = Array.from(allKeys);

        const csvHeaders = headers.map((header) => this.escapeCSVValue(header)).join(',');

        const csvRows = features.map((feature) => headers.map((header) => {
          const value = feature[header];
          return this.escapeCSVValue(value);
        }).join(',')).join('\n');

        const csvContent = `${csvHeaders}\n${csvRows}`;

        return csvContent;
      } catch (error) {
        return '';
      }
    },

    escapeCSVValue(value) {
      if (value === null || value === undefined) return '';

      const stringValue = String(value);

      let escapedValue = stringValue.replace(/"/g, '""');

      if (escapedValue.includes(',') || escapedValue.includes('\n')
          || escapedValue.includes('\r') || stringValue.includes('"')) {
        escapedValue = `"${escapedValue}"`;
      }

      return escapedValue;
    },

    generateJSON(features, layerName) {
      const exportData = {
        layer: layerName,
        exportDate: new Date().toISOString(),
        coordinates: this.currentLatLng ? {
          lat: this.currentLatLng.lat,
          lng: this.currentLatLng.lng,
        } : null,
        totalFeatures: features.length,
        features: features.map((feature) => {
          const result = {
            properties: { ...feature },
          };

          if (feature.geometry_wkt) {
            result.geometry_wkt = feature.geometry_wkt;
            delete result.properties.geometry_wkt;
          }

          return result;
        }),
      };

      return JSON.stringify(exportData, null, 2);
    },
  },
};
</script>

<style scoped lang="sass">
.fundo-primary
  background-color: var(--v-primary-base) !important

.text-white
  color: white !important

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

.close-btn
  transition: all 0.3s ease
  &:hover
    background-color: rgba(255, 255, 255, 0.2) !important
    transform: scale(1.05)

.fundo-primary
  .v-btn--fab.v-size--x-small
    transition: all 0.2s ease
    &:hover
      transform: scale(1.1)
      box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important

    &.v-btn--loading
      transform: none

    &.v-btn--disabled
      opacity: 0.5
      transform: none !important

.v-progress-circular
  display: inline-block

.card-popup
  border-radius: 8px !important

  .v-card
    border-radius: 8px !important

  .v-tabs
    border-radius: 0 0 8px 8px !important

.text-subtitle-2
  word-break: break-word
  hyphens: auto

.list-separator
  &:hover
    background-color: rgba(0, 0, 0, 0.02)

@media (max-width: 600px)
  .fundo-primary
    padding: 8px !important

    .text-caption
      display: none

    .v-btn--fab.v-size--x-small
      width: 28px !important
      height: 28px !important
</style>
