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
                    @click="
                      () => (showDialogLandscape = true)
                    "
                  >
                    {{ $t('input-button-first-step') }}
                  </v-btn>
                  <MapLandscape
                    v-if="showDialogLandscape"
                    id="printableMap"
                    :show-dialog-landscape="
                      showDialogLandscape
                    "
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
        </v-tabs>
      </v-card>


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
              :maxlength="100"
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
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-dialog>
  </div>
</template>

<i18n>
  {
      "en": {
          "print-icon-label": "Print out",
          "print-dialog-label": "Print Out",
          "dialog-title-first-step": "Standard Model",
          "dialog-text-first-step":
          "Type below the title of the map to be printed or, if you prefer, leave it blank",
          "input-title-label": "Map Title",
          "input-size-hint": "Print Size",
          "input-button-first-step": "Continue",
          "input-button-back-second-step": "Back",
          "image-error": "Error generating image."
      },

      "pt-br": {
          "print-icon-label": "Imprimir",
          "print-dialog-label": "Impressão",
          "dialog-title-first-step": "Modelo Padrão",
          "dialog-text-first-step":
          "Digite abaixo o título do mapa a ser impresso ou, se preferir, deixe em branco",
          "input-title-label": "Título do Mapa",
          "input-size-hint": "Tamanho da Impressão",
          "input-button-first-step": "Continuar",
          "input-button-back-second-step": "Voltar",
          "image-error": "Erro ao gerar imagem."
      }
  }
</i18n>

<script>
import { mapState, mapMutations } from 'vuex'; // Import the mapState function from Vuex
import MapLandscape from './TemplateMapLandscape.vue';

export default {
  name: 'MapPrinter',

  components: {
    MapLandscape,
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
    showDialogPortrait: false,
    dialogPrint: false,
    mapTitle: '',
    textMap: '',
    select: { type: 'A4' },
    items: [
      { type: 'A4' },
      { type: 'A3' },
    ],
  }),

  computed: {
    isScreenSmall() {
      return window.innerWidth < 768;
    },
    ...mapState('map', ['tmsToPrint']), // Add the mapState function to the computed property
  },

  methods: {
    closeDialogPrinter() {
      this.dialogPrint = false;
      this.showDialogLandscape = false;
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
