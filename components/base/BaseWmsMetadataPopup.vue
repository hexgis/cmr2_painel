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
          <v-row no-gutters class="fundo-primary pa-1">
              <!-- <span class="text-caption pl-2 text-white font-weight-bold">
                Lat/Lng ({{ currentLatLng.lat + ', ' + currentLatLng.lng }})
              </span> -->
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
              <v-card-text style="max-height: 312px; overflow-y: auto">
                <template v-for="(feature, i) in layerData.layers">
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
                          style="overflow-wrap: anywhere"
                        >
                          <a
                            v-if="isValidUrl(value)"
                            :href="value"
                            target="_blank"
                          >
                            {{ value }}
                          </a>
                          <span v-else>
                            {{ formatFieldValue(value,field) }}
                          </span>
                        </v-col>
                      </v-row>
                    </template>
                  </template>
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
          "layer-api-error": "Unable to acquire support layer information.",
          "instrument-management": "Management Instrument"
      },
      "pt-br": {
          "no-data": "Não há dados nesse ponto para a camada selecionada.",
          "layer-api-error": "Não foi possível resgatar as informações das camadas de apoio.",
          "instrument-management": "Instrumento de Gestão"
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
    fieldConfig: {
      // Campos que devem ser ignorados
      excludedFields: ['bbox'],
      // Substituições completas de nomes de campos
      fieldNames: {
        nu_buffer_distancia: 'Buffer Distância',

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

        // LOCALIDADES INDIGENAS
        id:'ID',
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






        co_funai: 'Código Funai',
        no_ti: 'Nome da Terra Indígena',
        // Adicione mais mapeamentos conforme necessário
      },
      // Substituições por prefixos
      fieldPrefixes: {
        // dt_: 'Data ',
        // co_: 'Código ',
        // cd_: 'Código ',
        // sg_: 'Sigla ',
        // ds_: 'Descrição ',
        // no_: 'Nome ',
        possui_: 'Possui Inst. de Gestão',
      },
      // Formatação especial para valores de campos específicos
      valueFormatters: {
        // Exemplo: formatar números com unidades específicas
        nu_area_ha: (value) => `${Number(value).toLocaleString('pt-BR')} ha`,
      }
    }
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
      return !this.fieldConfig.excludedFields.some(excluded => 
        field.toLowerCase().includes(excluded)
      );
    },


    formatFieldName(field) {
      const lowerField = field.toLowerCase();
      
      // 1. Verifica se há um nome específico para este campo
      if (this.fieldConfig.fieldNames[lowerField]) {
        return this.fieldConfig.fieldNames[lowerField];
      }
      
      // 2. Verifica se há um prefixo correspondente
      for (const [prefix, replacement] of Object.entries(this.fieldConfig.fieldPrefixes)) {
        if (lowerField.startsWith(prefix)) {
          return replacement + this.formatGenericFieldName(field.slice(prefix.length));
        }
      }
      
      // 3. Formatação genérica
      return this.formatGenericFieldName(field);
    },
    
    formatGenericFieldName(field) {
      // Remove prefixos no formato "XX_"
      const cleanedField = /^[a-z]{2}_/i.test(field) ? field.substring(3) : field;
      // Formata snake_case para Title Case
      return cleanedField
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
    },

    formatFieldValue(value, field = '') {
      const lowerField = field.toLowerCase();
      
      // 1. Verifica se há um formatador específico para este campo
      if (this.fieldConfig.valueFormatters[lowerField]) {
        return this.fieldConfig.valueFormatters[lowerField](value);
      }
      
      // 2. Verifica se é uma data válida
      if (typeof value === 'string' && 
          (lowerField.startsWith('dt_') || lowerField.includes('date'))) {
        if (this.$moment(value).isValid()) {
          return this.$moment(value).format('DD/MM/YYYY');
        }
      }
      
      // 3. Verifica se é booleano
      if (typeof value === 'boolean') {
        return value ? 'Sim' : 'Não';
      }
      
      // 4. Verifica se é número
      if (typeof value === 'number') {
        // Campos de coordenadas → 5 casas decimais
        if (['lat', 'lng', 'long', 'latitude', 'longitude'].some(k => 
            lowerField.includes(k))) {
          return value.toFixed(5);
        }
        
        // Formatação numérica padrão
        const formatted = value.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return formatted.endsWith(',00') 
          ? formatted.replace(',00', '') 
          : formatted;
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
          this.$axios
            .get(url)
            .then(async ({ data }) => {
              if (data && data.features && data.features.length) {
                // eslint-disable-next-line no-restricted-syntax
                for (const feature of data.features) {
                  // TODO: Remover essa logica de Camada Instrumento de Gestão
                  if (layerName.toLowerCase().includes('instrumento') || layerName.toLowerCase().includes('gestão')) {
                    // eslint-disable-next-line no-await-in-loop
                    const res = await this.fetchInstrumentoGestao(feature.properties.co_funai);
                    this.data[layerName].layers = res || [];
                    return;
                  }
                  this.data[layerName].layers.push(feature.properties);
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
          if (layer.feature.geometry.type === 'MultiPolygon' || layer.feature.geometry.type === 'Polygon') {
            // Verifique se o ponto está dentro de um MultiPolygon.
            if (booleanPointInPolygon([evt.latlng.lng, evt.latlng.lat], layer.feature)) {
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

      // eslint-disable-next-line no-underscore-dangle
      return (layer._url + this.$L.Util.getParamString(params, layer._url, true));
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
