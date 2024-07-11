<template>
  <div>
    <style>
      @media print { @page { size: landscape; margin: 0 } }
    </style>
    <v-dialog
      v-model="showDialog"
      width="auto"
      persistent
    >
      <v-card-title
        class="no-print theme--dark secondary white--text d-flex justify-space-between"
      >
        <span>{{ $t('print-out') }}</span>
        <v-btn
          icon
          @click="$emit('close')"
        >
          <v-icon class="white--text">
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-container style="background-color: white; max-width: 100%">
        <v-row
          id="map-for-print"
          no-gutters
          style="width: 1230px; height: 780px"
        >
          <v-col
            cols="8"
            class="pr-0 mt-2"
          >
            <MapForPrint
              :leaf-size="leafSize"
              :main-map="mainMap"
              :selected-base-map="selectedBaseMap"
              class="teste"
              @updateBounds="updateBounds"
              @getCenter="getCenter"
            />
          </v-col>
          <v-col
            cols="4"
            class="pl-1 mt-2"
          >
            <div class="border_container">
              <div class="d-flex justify-center align-center ma-4">
                <div style="width: 25%">
                  <v-img
                    contain
                    :src="logo_funai"
                    class="logo"
                  />
                </div>
                <div style="width: 25%">
                  <v-img
                    contain
                    :src="logo_cmr"
                    class="logo"
                  />
                </div>
              </div>
              <div class="font-title">
                <p>
                  {{ mapTitle }}
                </p>
                <p>
                  {{ print_title }}
                </p>
              </div>
              <div
                class="d-flex justify-center hight_container_mini_map"
              >
                <MiniMap
                  v-if="currentBouldMap"
                  :current-bould-map="currentBouldMap"
                  :map-center="mapCenter"
                />
              </div>
              <div>
                <p class="d-block ma-1">
                  {{ $t('legend') }}
                </p>
                <div
                  class="ma-1 flex-wrap"
                  style="width: 100%"
                >
                  <div v-if="showFeaturesSupportLayers">
                    <div
                      v-for="layer in supportLayers"
                      :key="layer.id"
                    >
                      <v-row
                        v-if="layer.visible"
                        no-gutters
                        align="center"
                        class="image-container"
                      >
                        <img
                          v-if="layer.wms"
                          :src="
                            layer.wms.geoserver
                              .preview_url +
                              layer.wms
                                .geoserver_layer_name
                          "
                          class="layer-thumbnail"
                          alt="CorLayer"
                        >
                        <img
                          v-else-if="vectorImage(layer)"
                          :src="`data:image/png;base64,${vectorImage(
                            layer
                          )}`"
                          class="layer-thumbnail"
                          alt="CorLayer"
                        >
                        <v-col>
                          <p class="ml-1">
                            {{ layer.name }}
                          </p>
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                </div>
                <v-divider />
                <div class="ma-1">
                  <p>
                    {{ print_info }} {{ $t('text-address0') }}
                  </p>
                  <p>
                    {{ print_info }} {{ $t('text-address')
                    }}{{ todayDate() }}
                  </p>
                </div>
                <v-divider />
                <div class="ma-1">
                  <p>
                    {{ $t('author-label') }}
                  </p>
                  <p>
                    {{ $t('text-info') }}
                  </p>
                  <p>
                    {{ $t('text-format') }}{{ leafSize.type }}.
                  </p>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
        <div class="no-print">
          <div class="d-flex flex-row mr-6 mt-2">
            <v-btn
              class="ml-4 mb-2"
              @click="$emit('back')"
            >
              {{ $t('input-button-back-second-step') }}
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              @click="print"
            >
              <v-icon dark>
                mdi-file-export-outline
              </v-icon>
              {{ $t('input-button-pdf-image') }}
            </v-btn>
          </div>
        </div>
      </v-container>
    </v-dialog>
  </div>
</template>

<i18n>
  {
      "en": {
          "print-out": "Print Out",
          "legend": "Legend:",
          "text-address0": " | Print date: ",
          "text-address": " | Print date: ",
          "text-info": "The information may be distorted depending on the cartographic bases used.",
          "text-format": "Format-adapted map template ",
          "input-button-back-second-step": "Back",
          "input-button-pdf-image": "Generate PDF",
          "author-label": "Author: "
      },
      "pt-br": {
          "print-out": "Impressão",
          "legend": "Legenda:",
          "text-address0": " | CENTRO DE MONITORAMENTO REMOTO - https://cmr.funai.gov.br ",
          "text-address": " | Data da impressão: ",
          "text-info": "As informações podem apresentar distorções em função das bases cartográficas utilizadas.",
          "text-format": "Modelo de mapa adaptado para formato ",
          "input-button-back-second-step": "Voltar",
          "input-button-pdf-image": "Gerar PDF",
          "author-label": "Autor: "
      }
  }
</i18n>

<script>
import { mapState } from 'vuex';
import MapForPrint from './MapForPrint.vue';
import MiniMap from '@/components/map/print-map/MiniMap.vue';

if (typeof window !== 'undefined') {
  require('leaflet-bing-layer');
}

export default {
  components: {
    MapForPrint,
    MiniMap,
  },

  props: {
    showDialogLandscape: {
      type: Boolean,
      default: false,
    },
    mapTitle: {
      type: String,
      default: '',
    },
    leafSize: {
      type: Object,
      default: null,
    },
    mainMap: {
      type: Object,
      default: null,
    },
    selectedBaseMap: {
      type: Object,
      default: null,
    },
    model: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    map: null,
    miniMap: null,
    currentBouldMap: null,
    mapCenter: null,
    logo_funai: process.env.DEFAULT_LOGO_IMAGE_FUNAI,
    logo_cmr: process.env.DEFAULT_LOGO_IMAGE_CMR,
    print_title: process.env.PRINT_TITLE,
    print_info: process.env.PRINT_INFO,
  }),

  computed: {
    showDialog() {
      return this.showDialogLandscape;
    },

    ...mapState('map', ['bounds']),
    ...mapState('supportLayers', [
      'showFeaturesSupportLayers',
      'supportLayers',
    ]),
  },

  methods: {
    vectorImage(layer) {
      return layer.vector.thumbnail_blob || layer.vector.image;
    },

    todayDate() {
      const date = new Date();
      const dd = date.getDate();
      const mm = date.getMonth() + 1;
      const yyyy = date.getFullYear();
      return `${dd < 10 ? `0${dd}` : dd}/${
        mm < 10 ? `0${mm}` : mm
      }/${yyyy}`;
    },

    updateBounds(bounds) {
      this.currentBouldMap = bounds;
    },

    getCenter(center) {
      this.mapCenter = center;
    },

    adjustMapSizeForPrint(tamanho) {
      const mapDimensions = this.getMapDimensions(tamanho);
      document.getElementById('map-for-print').style.width = `${mapDimensions.width}px`;
      document.getElementById('map-for-print').style.height = `${mapDimensions.height}px`;
    },

    getMapDimensions(tamanho) {
      switch (tamanho) {
        case 'A4':
          return { width: 1100, height: 750 }; // in mm or appropriate units
        case 'A3':
          return { width: 1450, height: 860 };
          // Add more cases as needed
        default:
          return { width: 210, height: 297 }; // Default to A4
      }
    },

    print() {
      this.adjustMapSizeForPrint(this.leafSize.type);
      const style = document.createElement('style');
      style.setAttribute('media', 'print');
      window.print();
    },
  },
};
</script>

<style scoped>
.teste {
  width: 100%;

}

.vue2leaflet-map teste leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom{
  height: 30vh !important;
}

@page {
    size: landscape;
    margin: 0;
}

@media print {
    .logo {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
  }

    .container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100% !important;
        overflow: hidden !important;
        box-shadow: none;
    }
    .no-print {
        display: none;
    }
}

p {
    font-size: xx-small;
    margin: 0;
}

.font-title p {
    font-size: medium;
    margin: 0px;
    padding: 0px;
    text-align: center;
    line-break: anywhere;
    max-width: 750px;
}

.font-title {
    line-break: anywhere;
    width: 100%;
}

.print-mini-map-text {
    color: dimgray !important;
    font-size: xx-small;
    white-space: nowrap;
}

.border_container_legend {
    border: 0.5px gray;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px #bbb !important;
    height: 100%;
}

.border_container {
    border-right: 0.5px solid gray;
    border-top: 0.5px solid gray;
    border-bottom: 0.5px solid gray;
    height: 100%;
}

.hight_container_mini_map {
    height: 150px;
    max-height: 150px;
    width: 100%;
}

.font-page p {
    font-size: large;
}

.image-container {
    width: 100%; /* Garante que o container tenha largura suficiente */
}
</style>
