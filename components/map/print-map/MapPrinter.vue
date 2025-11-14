<template>
  <div class="button-print-map d-flex mt-2">
    <v-tooltip
      v-if="!isScreenSmall"
      right
    >
      <template #activator="{ on }">
        <v-btn
          fab
          ripple
          height="36"
          width="36"
          v-on="on"
        >
          <v-icon @click="dialogPrint = true">
            mdi-printer
          </v-icon>
        </v-btn>
      </template>
      <span> {{ $t('print-icon-label') }} </span>
    </v-tooltip>
    <v-dialog
      v-model="dialogPrint"
      persistent
      transition="dialog-transition"
      width="auto"
    >
      <v-toolbar
        dark
        color="secondary"
      >
        <h3>{{ $t('print-dialog-label') }}</h3>
        <v-spacer />
        <v-btn
          icon
          @click="closeDialogPrinter()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card>
        <v-tabs vertical>
          <div v-show="!isScreenSmall">
            <v-tab>
              {{ $t('dialog-title-first-step') }}
            </v-tab>
            <v-tab>
              {{ $t('dialog-title-second-step') }}
            </v-tab>
          </div>
          <v-tab-item>
            <v-card>
              <v-card-text>
                <v-card-text class="mb-2 pa-0 font-weight-bold">
                  {{ $t('dialog-text-first-step') }}
                </v-card-text>
                <v-text-field
                  v-model="mapTitle"
                  :label="$t('input-title-label')"
                  class="mt-4 pa-0"
                  :maxlength="65"
                />
                <v-select
                  v-model="select"
                  item-text="type"
                  item-value="type"
                  persistent-hint
                  return-object
                  single-line
                  required
                  :hint="`${$t('input-size-hint')}: ${
                    select.type
                  }`"
                  :items="items"
                />
                <v-col class="mt-4 mb-2 text-right">
                  <v-btn
                    dark
                    color="primary"
                    @click="showDialogLandscape = true"
                  >
                    {{ $t('input-button-first-step') }}
                  </v-btn>
                  <MapLandscape
                    v-if="showDialogLandscape"
                    id="printableMap"
                    :show-dialog-landscape="showDialogLandscape"
                    :map-title="mapTitle"
                    :leaf-size="select"
                    :main-map="map"
                    :selected-base-map="selectedBaseMap"
                    @back="showDialogLandscape = false"
                    @close="closeDialogPrinter()"
                  />
                  <v-spacer />
                </v-col>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card>
              <v-card-text>
                <v-card-text class="mb-2 pa-0 font-weight-bold">
                  {{ $t('dialog-text-second-step') }}
                </v-card-text>
                <v-text-field
                  v-model="mapTitle"
                  :label="$t('input-title-label')"
                  class="mt-4 pa-0"
                  :maxlength="65"
                />
                <v-select
                  v-model="select"
                  item-text="type"
                  item-value="type"
                  persistent-hint
                  return-object
                  single-line
                  required
                  :hint="`${$t('input-size-hint')}: ${
                    select.type
                  }`"
                  :items="items"
                />
                <v-col class="mt-4 mb-2 text-right">
                  <v-btn
                    dark
                    color="primary"
                    @click="handleContinueButton"
                  >
                    {{ $t('input-button-second-step') }} Buscar o bbox
                  </v-btn>
                  <MapLandscapeCar
                    v-if="showDialogLandscapeCar"
                    id="printableMapCar"
                    :show-dialog-landscape="showDialogLandscapeCar"
                    :map-title="mapTitle"
                    :leaf-size="select"
                    :main-map="map"
                    :selected-base-map="selectedBaseMap"
                    :car-data="carData"
                    @back="showDialogLandscapeCar = false"
                    @close="closeDialogPrinter()"
                  />
                  <v-spacer />
                </v-col>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-dialog>
  </div>
</template>

<i18n>
  {
      "en": {
          "print-icon-label": "Print out",
          "print-dialog-label": "Print Out",
          "dialog-title-first-step": "Standard Model",
          "dialog-title-second-step": "CAR Model",
          "dialog-text-first-step": "Type below the title of the map to be printed or, if you prefer, leave it blank",
          "dialog-text-second-step": "Type below the title of the CAR map to be printed or, if you prefer, leave it blank",
          "input-title-label": "Map Title",
          "input-size-hint": "Print Size",
          "input-button-first-step": "Continue",
          "input-button-second-step": "Continue",
          "input-button-back-second-step": "Back",
          "image-error": "Error generating image."
      },
      "pt-br": {
          "print-icon-label": "Imprimir",
          "print-dialog-label": "Impressão",
          "dialog-title-first-step": "Modelo Padrão",
          "dialog-title-second-step": "Modelo CAR",
          "dialog-text-first-step": "Digite abaixo o título do mapa a ser impresso ou, se preferir, deixe em branco",
          "dialog-text-second-step": "Digite abaixo o título do mapa CAR a ser impresso ou, se preferir, deixe em branco",
          "input-title-label": "Título do Mapa",
          "input-size-hint": "Tamanho da Impressão",
          "input-button-first-step": "Continuar",
          "input-button-second-step": "Continuar",
          "input-button-back-second-step": "Voltar",
          "image-error": "Erro ao gerar imagem."
      }
  }
</i18n>

<script>
import { mapState, mapMutations } from 'vuex';
import MapLandscape from './TemplateMapLandscape.vue';
import MapLandscapeCar from './TemplateMapLandscapeCar.vue';

export default {
  name: 'MapPrinter',

  components: {
    MapLandscape,
    MapLandscapeCar,
  },
  props: {
    map: {
      type: Object,
      default: null,
    },

    selectedBaseMap: {
      type: Object,
      default: null,
    },

    showTms: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    showDialogLandscape: false,
    showDialogLandscapeCar: false,
    showDialogPortrait: false,
    dialogPrint: false,
    mapTitle: '',
    textMap: '',
    select: { type: 'A4' },
    items: [
      { type: 'A4' },
      { type: 'A3' },
    ],
    carData: [],
  }),

  computed: {
    isScreenSmall() {
      return window.innerWidth < 768;
    },
    ...mapState('map', ['tmsToPrint']),
  },

  methods: {
    async queryWFSWithBbox(bboxArray) {
      try {
        console.log('🎯 Buscando CAR para mapa de impressão...');

        const geoserverBaseUrl = this.$store.state.map.geoserverUrl;
        const layerName = 'CMR-FUNAI:lim_imovel_car_a';
        const cqlFilter = `INTERSECTS(geom, POLYGON((${bboxArray[0]} ${bboxArray[1]}, ${bboxArray[2]} ${bboxArray[1]}, ${bboxArray[2]} ${bboxArray[3]}, ${bboxArray[0]} ${bboxArray[3]}, ${bboxArray[0]} ${bboxArray[1]})))`;

        const params = {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetFeature',
          typeName: layerName,
          outputFormat: 'application/json',
          srsName: 'EPSG:4326',
          maxFeatures: 1000,
          CQL_FILTER: cqlFilter,
        };

        const url = `${geoserverBaseUrl}&${new URLSearchParams(params)}`;
        console.log('🔗 URL final:', url);

        const response = await this.$api.$get(url);
        console.log('✅✅✅ DADOS CAR ENCONTRADOS!', response);

        if (response.features && response.features.length > 0) {
          console.log(`🎯 Total de imóveis CAR: ${response.features.length}`);

          // SALVAR OS DADOS CAR PARA PASSAR PARA O MAPA DE IMPRESSÃO
          this.carData = response.features;

          // Log das propriedades
          response.features.forEach((feature, index) => {
            console.log(`\n--- CAR ${index + 1} ---`);
            console.log('Número:', index + 1);
            console.log('Propriedades:', feature.properties);
          });

          // Abrir o MapLandscapeCar APÓS buscar os dados
          this.showDialogLandscapeCar = true;

          return response;
        }
        console.log('ℹ️ Nenhum imóvel CAR encontrado neste bbox');
        this.carData = [];
        this.showDialogLandscapeCar = true;
      } catch (error) {
        console.error('❌ Erro na consulta CAR:', error);
        this.carData = [];
        this.showDialogLandscapeCar = true;
      }
    },

    handleContinueButton() {
      if (this.map && typeof this.map.getBounds === 'function') {
        const bounds = this.map.getBounds();
        const bboxArray = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ];

        console.log('BBOX do mapa:', bboxArray);

        // Fazer consulta WFS com CQL_FILTER
        this.queryWFSWithBbox(bboxArray);
      } else {
        console.log('Mapa não disponível ou método getBounds não encontrado');
        this.carData = [];
        this.showDialogLandscapeCar = true;
      }
    },

    closeDialogPrinter() {
      this.dialogPrint = false;
      this.showDialogLandscape = false;
      this.showDialogLandscapeCar = false;
      this.carData = [];
      this.setTmsToPrint({
        visible: false,
        url: '',
        bounds: null,
      });
    },
    ...mapMutations('map', ['setTmsToPrint']),
  },
};
</script>
