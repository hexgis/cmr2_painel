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
          @click="openPrintDialog"
        >
          <v-icon>
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
                  :hint="`${$t('input-size-hint')}: ${select.type}`"
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
                  :hint="`${$t('input-size-hint')}: ${select.type}`"
                  :items="items"
                />
                <v-col class="mt-4 mb-2 text-right">
                  <v-btn
                    dark
                    color="primary"
                    :loading="loadingCAR"
                    @click="handleContinueButton"
                  >
                    {{ $t('input-button-second-step') }}
                  </v-btn>
                  <v-spacer />
                </v-col>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-dialog>
    <BaseAlert />
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
          "image-error": "Error generating image.",
          "no-car-data-message": "No CAR data available for the selected area. Please select a different location."
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
          "image-error": "Erro ao gerar imagem.",
          "no-car-data-message": "Não existem dados CAR disponíveis para a área selecionada. Por favor, selecione um local diferente."
      }
  }
</i18n>

<script>
import { mapState, mapMutations } from 'vuex';
import MapLandscape from './TemplateMapLandscape.vue';
import MapLandscapeCar from './TemplateCar.vue';
import BaseAlert from '@/components/base/BaseAlert.vue';

export default {
  name: 'MapPrinter',

  components: {
    MapLandscape,
    MapLandscapeCar,
    BaseAlert,
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
    dialogPrint: false,
    mapTitle: '',
    textMap: '',
    select: { type: 'A4' },
    items: [
      { type: 'A4' },
      { type: 'A3' },
    ],
    loadingCAR: false,
  }),

  computed: {
    isScreenSmall() {
      return window.innerWidth < 768;
    },
    ...mapState('map', ['tmsToPrint', 'showTemplateMapLandscapeCar']),
  },

  watch: {
    showTemplateMapLandscapeCar(newVal) {
      const carData = this.$store.state.map.carPrintData.carData;
      if (newVal && carData && carData.length > 0) {
        this.dialogPrint = false;
      }
    },
  },

  methods: {
    openPrintDialog() {
      this.dialogPrint = true;
    },

    async handleContinueButton() {
      this.loadingCAR = true;

      try {
        const result = await this.$store.dispatch('map/handleCarPrint', {
          map: this.map,
          mapTitle: this.mapTitle,
          leafSize: this.select,
          selectedBaseMap: this.selectedBaseMap,
        });

        if (result.success) {
          if (!result.hasCarData) {
            this.$store.commit('alert/addAlert', {
              message: this.$t('no-car-data-message'),
              timeout: 5000,
            }, { root: true });
            this.closeDialogPrinter();
            this.$store.commit('map/setShowTemplateMapLandscapeCar', false);
            this.$store.commit('map/clearCarPrintData');
          } else {
            this.dialogPrint = false;
          }
        }
      } catch (error) {
        console.error('Erro ao processar CAR print:', error);
        this.$store.commit('alert/addAlert', {
          message: this.$t('image-error'),
          timeout: 5000,
        }, { root: true });
        this.closeDialogPrinter();
      } finally {
        this.loadingCAR = false;
      }
    },

    handleBackFromCar() {
      this.$store.commit('map/setShowTemplateMapLandscapeCar', false);
      this.dialogPrint = true;
    },

    handleCloseFromCar() {
      this.$store.commit('map/setShowTemplateMapLandscapeCar', false);
      this.closeDialogPrinter();
    },

    closeDialogPrinter() {
      this.dialogPrint = false;
      this.showDialogLandscape = false;

      this.$store.commit('map/clearCarPrintData');
      this.$store.commit('map/setShowTemplateMapLandscapeCar', false);

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
