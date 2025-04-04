<template>
  <l-layer-group ref="popup" :visible="!isDrawing">
    <l-popup :options="popupOptions">
      <LoadingIconVue v-if="isLoadingData" />
      <v-card
        v-else
        class="fill-height"
      >
        <v-tabs
         
          background-color="primary"
          dark
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
                        {{ formatField(field) }}:
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
                          {{
                            formatValue(
                              value,
                              field
                            )
                          }}
                        </span>
                      </v-col>
                    </v-row>
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

          <!-- New tab for InstrumentoGestao -->
          <v-tab
            v-if="
              instrumentoGestao &&
                Object.keys(instrumentoGestao).length
                && isInstrumentoGestaoLayerActive
            "
          >
            {{ $t('instrument-management') }}
          </v-tab>
          <v-tab-item
            v-if="instrumentoGestao && instrumentoGestao.length
             && isInstrumentoGestaoLayerActive"
            class="fill-height"
          >
            <v-card-text style="max-height: 312px; overflow-y: auto">
              <div
                v-for="(item, index) in instrumentoGestao"
                :key="index"
              >
                <v-row class="mx-0 grey lighten-4 my-2">
                  <v-col
                    cols="12"
                    class="text-center font-weight-bold"
                  >
                    {{ $t('instrument-management') }} {{ index + 1 }}
                  </v-col>
                </v-row>
                <v-row
                  v-for="(value, key) in item"
                  :key="key + index"
                  class="mx-0 list-separator"
                  dense
                >
                  <v-col
                    cols="5"
                    class="text-right font-weight-bold"
                  >
                    {{ formatField(key) }}:
                  </v-col>
                  <v-col
                    cols="7"
                    class="text-subtitle-2"
                    style="overflow-wrap: anywhere"
                  >
                    <span v-if="isValidUrl(value)">
                      <a
                        :href="value"
                        target="_blank"
                      >{{ value }}</a>
                    </span>
                    <span v-else>
                      {{ formatValue(value, key) }}
                    </span>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-tab-item>
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
import {mapState} from 'vuex';
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
    instrumentoGestao: {}, // Changed to an empty object
    loadingData: false,
    isInstrumentoGestaoLayerActive: false,
  }),

  computed: {
    filteredData() {
      if (!this.data) return {}
        const filtered = {}
          for (const [layerName, layerData] of Object.entries(this.data)) {
          // Filtra para não mostrar a camada de instrumento de gestão que vem de data
            if (
              !layerName.toLowerCase().includes('instrumento') &&
              !layerName.toLowerCase().includes('gestão')
            ) {filtered[layerName] = layerData}
            }
            return filtered
        },

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
    formatField(field) {
      if (!field || typeof field !== 'string') {
        return ''; // or handle appropriately if field is not a string
      }

      const replacements = {
        dt_: ['Data ', 'dt_'],
        co_: ['Codigo ', 'co_'],
        cd_: ['Codigo ', 'cd_'],
        sg_: ['Sigla ', 'sg_'],
        ds_: ['Descrição ', 'ds_'],
        no_: ['Nome ', 'no_'],
        possui_: ['Possui Inst. de Gestão', 'possui_ig'],
        ranking: ['Ranking Desmate 2022', 'ranking'],
      };

      const prefix = field.match(/^\w+_/)
        ? field.match(/^\w+_/)
        : field.match(/^\w+/);
      const key = prefix ? prefix[0] : ''; // handle case where prefix is null or undefined
      const regex = /^[A-Za-z]{2}_\w+$/;

      if (key && key in replacements) {
        field = field.replace(
          replacements[key][1],
          replacements[key][0],
        );
      } else if (field.match(regex)) {
        field = field.substring(3);
      }

      field = field
        .replaceAll('_', ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return field;
    },

    formatValue(value, field) {
      if (
        typeof value === 'string'
                && (field.startsWith('dt_')
                    || field.startsWith('data_')
                    || field.startsWith('date'))
                && this.$moment(value).isValid()
      ) {
        value = this.$moment(value).format('DD/MM/YYYY');
      } else if (typeof value === 'boolean') {
        value = value ? 'Sim' : 'Não';
      }
      return value;
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

    getFeatureInfo(evt) {
      this.hasPopup = false;
      this.data = {};
      this.instrumentoGestao = {}; // Clear previous data
      this.isInstrumentoGestaoLayerActive = false
      // Primeiro verifica se a camada de instrumentos está ativa
      this.map.eachLayer((layer) => {
        if (Object.prototype.hasOwnProperty.call(layer, 'wmsParams')) {
          if (
            layer.wmsParams.name
              .toLowerCase()
              .includes('instrumento') ||
              layer.wmsParams.name.toLowerCase().includes('gestão')
            ) {
                this.isInstrumentoGestaoLayerActive = true
              }
            }
        })
        // Depois processa todas as camadas
      this.map.eachLayer((layer) => {
        if (Object.prototype.hasOwnProperty.call(layer, 'wmsParams')) {
          this.hasPopup = true;
          const layerName = layer.wmsParams.name;
          // Se for a camada de instrumentos, só busca os dados se estiver ativa
            if (
              (layerName.toLowerCase().includes('instrumento') ||
                layerName.toLowerCase().includes('gestão')) &&
                  !this.isInstrumentoGestaoLayerActive
                ) {
                    return
                  }

          this.data[layerName] = {
            layers: [],
            loading: true,
          };

          const url = this.getFeatureInfoUrl(evt.latlng, layer);
          this.loadingData = true;
          this.$axios
            .get(url)
            .then(({ data }) => {
              if (data && data.features && data.features.length) {
                for (const feature of data.features) {
                  this.data[layerName].layers.push(
                    feature.properties,
                  );
              // Busca instrumento de gestão se for a camada correta e tiver co_funai
              if (this.isInstrumentoGestaoLayerActive && feature.properties.co_funai) {
                this.fetchInstrumentoGestao(
                  feature.properties.co_funai
                 )
                }
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
        // ... manter o restante do código existente ...
      }
    })

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
        bbox: layer._map.getBounds().toBBoxString(),
        feature_count: 50,
        height: size.y,
        width: size.x,
        layers: layer.wmsParams.layers,
        query_layers: layer.wmsParams.layers,
        info_format: 'application/json',
      };

      params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
      params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

      return (
        layer._url
                + this.$L.Util.getParamString(params, layer._url, true)
      );
    },

    async fetchInstrumentoGestao(co_funai) {
      this.loadingData = true;
      const url = `funai/management-instrument/?co_funai=${co_funai}`;
      try {
        this.instrumentoGestao = await this.$api.$get(url);
      } catch (error) {
        console.error('Error fetching data:', error);
        this.instrumentoGestao = {};
      } finally {
        this.loadingData = false;
      }
    },
  },
};
</script>
