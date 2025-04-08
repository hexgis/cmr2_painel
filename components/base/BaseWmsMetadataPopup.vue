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
                    <template v-if="formatField(field) !== false">
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
                            {{ formatValue(value,field) }}
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
    formatField(value) {
      if(value.toLowerCase().includes('bbox')){
        return false;
      }
      let fieldValue = value;
      if (!fieldValue || typeof fieldValue !== 'string') {
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

      const prefix = fieldValue.match(/^\w+_/)
        ? fieldValue.match(/^\w+_/)
        : fieldValue.match(/^\w+/);
      const key = prefix ? prefix[0] : ''; // handle case where prefix is null or undefined
      const regex = /^[A-Za-z]{2}_\w+$/;

      if (key && key in replacements) {
        fieldValue = fieldValue.replace(
          replacements[key][1],
          replacements[key][0],
        );
      } else if (fieldValue.match(regex)) {
        fieldValue = fieldValue.substring(3);
      }

      fieldValue = fieldValue
        .replaceAll('_', ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return fieldValue;
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

      if (isNumberField) {
        if (isLatLongField) {
          return value.toFixed(5);
        }

        const rounded = value.toFixed(2);
        const [intPart, decimalPart] = rounded.split('.');

        return decimalPart !== '00'
          ? `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`
          : String(parseInt(value, 10));
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

    async getFeatureInfo(evt) {
      this.hasPopup = false;
      this.data = {};
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
