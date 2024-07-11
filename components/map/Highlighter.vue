<template>
  <div class="d-flex mt-2">
    <v-tooltip right>
      <template #activator="{ on }">
        <v-btn
          fab
          ripple
          height="36"
          width="36"
          class="button-drawer"
          @click="selectDraw()"
          v-on="on"
        >
          <transition name="slide-x drawer-button">
            <v-icon v-if="!show">
              mdi-map-marker
            </v-icon>
            <v-icon
              v-else
              class="back-icon"
            >
              mdi-arrow-left
            </v-icon>
          </transition>
        </v-btn>
      </template>
      <span> {{ $t('upload-hint') }} </span>
    </v-tooltip>

    <div class="drawer-block">
      <transition name="slide-x-drawer">
        <div
          v-if="show"
          class="upload-options-drawer file-button"
        >
          <span> {{ $t('upload-hint') }} </span>
          <v-file-input
            type="btn"
            hide-input
            prepend-icon="mdi-map-marker"
            full-width
          />
        </div>
      </transition>
      <transition name="slide-x-drawer">
        <div v-if="show">
          <v-card
            class="ml-6 mt-1"
            min-width="350"
            variant="outlined"
          >
            <v-card-actions class="pa-0">
              <v-container class="pt-0">
                <v-select
                  v-model="coordType"
                  :items="options"
                  class="pt-0"
                />
                <div v-if="coordType === $t('decimal-label')">
                  <v-row>
                    <v-col
                      cols="6"
                      class="py-0"
                    >
                      <v-tooltip top>
                        <template
                          #activator="{ on, attrs }"
                        >
                          <v-text-field
                            v-model="lat"
                            placeholder="-8.62065"
                            class="decimal-field"
                            :class="latError"
                            suffix="°"
                            solo
                            flat
                            v-bind="attrs"
                            v-on="on"
                          />
                        </template>
                        <span>Latitude</span>
                      </v-tooltip>
                    </v-col>
                    <v-col
                      cols="6"
                      class="py-0"
                    >
                      <v-tooltip top>
                        <template
                          #activator="{ on, attrs }"
                        >
                          <v-text-field
                            v-model="lng"
                            class="decimal-field"
                            :class="lngError"
                            placeholder="-53.32244"
                            suffix="°"
                            solo
                            flat
                            v-bind="attrs"
                            v-on="on"
                          />
                        </template>
                        <span>Longitude</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </div>
                <div v-if="coordType === $t('dms-label')">
                  <v-row>
                    <v-col
                      cols="3"
                      class="pt-0"
                    >
                      <v-text-field
                        v-model="degN"
                        :placeholder="
                          $t('degree-label')
                        "
                        class="dms-field"
                        :class="degNError"
                        suffix="°"
                        solo
                        hide-details
                        flat
                      />
                    </v-col>
                    <v-col
                      cols="3"
                      class="pt-0"
                    >
                      <v-text-field
                        v-model="minN"
                        :placeholder="
                          $t('minute-label')
                        "
                        class="dms-field"
                        :class="minNError"
                        suffix="'"
                        solo
                        hide-details
                        flat
                      />
                    </v-col>
                    <v-col
                      cols="3"
                      class="pt-0"
                    >
                      <v-text-field
                        v-model="secN"
                        :placeholder="
                          $t('second-label')
                        "
                        class="dms-field"
                        :class="secNError"
                        suffix="&quot;"
                        solo
                        hide-details
                        flat
                      />
                    </v-col>
                    <v-col
                      cols="3"
                      class="pt-0 mt-2"
                    >
                      <v-btn
                        v-if="!north"
                        density="comfortable"
                        small
                        @click="toggleActivate()"
                      >
                        <b>S</b>
                      </v-btn>
                      <v-btn
                        v-if="north"
                        density="comfortable"
                        small
                        @click="toggleActivate()"
                      >
                        <b>N</b>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col
                      cols="3"
                      class="pt-0"
                    >
                      <v-text-field
                        v-model="degW"
                        :placeholder="
                          $t('degree-label')
                        "
                        class="dms-field"
                        :class="degWError"
                        suffix="°"
                        solo
                        hide-details
                        flat
                      />
                    </v-col>
                    <v-col
                      cols="3"
                      class="pt-0"
                    >
                      <v-text-field
                        v-model="minW"
                        :placeholder="
                          $t('minute-label')
                        "
                        class="dms-field"
                        :class="minWError"
                        suffix="'"
                        solo
                        hide-details
                        flat
                      />
                    </v-col>
                    <v-col
                      cols="3"
                      class="pt-0"
                    >
                      <v-text-field
                        v-model="secW"
                        :placeholder="
                          $t('second-label')
                        "
                        class="dms-field"
                        :class="secWError"
                        suffix="&quot;"
                        solo
                        hide-details
                        flat
                      />
                    </v-col>
                    <v-col cols="3">
                      <v-btn
                        v-if="!east"
                        density="comfortable"
                        small
                        @click="toggleActivateEast()"
                      >
                        <b>W</b>
                      </v-btn>
                      <v-btn
                        v-if="east"
                        density="comfortable"
                        small
                        @click="toggleActivateEast()"
                      >
                        <b>E</b>
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
                <v-divider />
                <v-row>
                  <v-col cols="1">
                    <v-btn
                      fab
                      ripple
                      height="36"
                      width="36"
                      class="mt-2"
                      @click="addMarker"
                    >
                      <v-icon color="error">
                        mdi-map-marker
                      </v-icon>
                    </v-btn>
                  </v-col>
                  <v-col
                    cols="2"
                    class="ml-2"
                  >
                    <v-card-actions v-if="showEdit">
                      <v-btn
                        v-for="btn in buttonsEdit"
                        :key="btn.icon"
                        icon
                        class="btn-tools"
                        x-small
                        @click="
                          handleButtonEditClick(
                            btn.type
                          )
                        "
                      >
                        <v-tooltip top>
                          <template
                            #activator="{ on }"
                          >
                            <v-icon v-on="on">
                              {{
                                btn.icon
                              }}
                            </v-icon>
                          </template>
                          {{
                            getTooltipText(btn.icon)
                          }}
                        </v-tooltip>
                      </v-btn>
                    </v-card-actions>
                  </v-col>
                  <v-col cols="8">
                    <v-card-actions
                      v-if="isButtonEditClicked"
                    >
                      <div class="ml-4 mt-1">
                        <v-btn
                          v-if="
                            isEditButtonActive ||
                              isDeleteButtonActive
                          "
                          color="success"
                          class="btn-action"
                          x-small
                          @click.stop="save()"
                        >
                          <span>Salvar</span>
                        </v-btn>
                        <v-btn
                          v-if="isDeleteButtonActive"
                          class="btn-action"
                          color="accent"
                          x-small
                          @click.stop="
                            clearAllDrawings
                          "
                        >
                          <span>Remover todos</span>
                        </v-btn>
                      </div>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-actions>
          </v-card>
        </div>
      </transition>
    </div>
    <div
      id="map"
      style="height: 500px; width: 100%"
    />

    <BaseDialog
      v-if="saveDialog"
      :label="$t('save-label')"
      :type="'Save'"
      @close="saveDialog = false"
      @action="generateJson"
    />
  </div>
</template>

<i18n>
{
  "en": {
    "upload-hint": "Highlighter",
    "tooltips.mdi-pencil-box": "Edit",
    "tooltips.mdi-delete-outline": "Delete layers",
    "tooltips.mdi-database-plus-outline": "Save",
    "download-label": "Download",
    "save-label": "Save",
    "dms-label": "D.M.S.",
    "decimal-label": "Decimal",
    "degree-label": "Deg",
    "minute-label": "Min",
    "second-label": "Sec",
    "dms-north": "N",
    "dms-west": "W",
    "dms-south": "S",
    "dms-est": "E"
  },
  "pt-br": {
    "upload-hint": "Marcador",
    "tooltips.mdi-pencil-box": "Editar",
    "tooltips.mdi-delete-outline": "Delete layers",
    "tooltips.mdi-database-plus-outline": "Salvar",
    "download-label": "Baixar",
    "save-label": "Salvar",
    "dms-label": "G.M.S.",
    "decimal-label": "Decimal",
    "degree-label": "Grau",
    "minute-label": "Min",
    "second-label": "Seg",
    "dms-north": "N",
    "dms-west": "O",
    "dms-south": "S",
    "dms-est": "E"
  }
}
</i18n>

<script>
import { mapMutations, mapActions } from 'vuex';
import BaseDialog from '@/components/map/drawing-tool/BaseDialog';
import getGeometryArea from '~/plugins/getGeometryArea';

const { stringify } = require('wkt');
const circleToPolygon = require('circle-to-polygon');

export default {
  name: 'Highlighter',

  components: {
    BaseDialog,
  },

  props: {
    map: {
      type: Object,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    coordType: 'Decimal',
    options: ['Decimal', 'D.M.S.'],
    buttonsEdit: [
      { icon: 'mdi-pencil-box', type: 'Edit' },
      { icon: 'mdi-delete-outline', type: 'Delete' },
      { icon: 'mdi-database-plus-outline', type: 'Save' },
    ],

    activeButton: null,

    isButtonEditClicked: false,
    newValueContent: [],
    isDeleteButtonActive: false,
    isEditButtonActive: false,

    saveDialog: false,

    lat: '',
    lng: '',
    latError: '',
    lngError: '',
    degN: '',
    minN: '',
    secN: '',
    degW: '',
    minW: '',
    secW: '',
    north: true,
    east: true,
    degNError: '',
    minNError: '',
    secNError: '',
    degWError: '',
    minWError: '',
    secWError: '',
    drawnItems: L.featureGroup(),
    center: null,
    showEdit: false,
  }),

  watch: {
    show() {
      if (!this.show) {
        this.clearActiveButton();
        this.isButtonEditClicked = false;
      }
    },
  },

  methods: {
    selectDraw() {
      this.show = !this.show;
    },

    addMarker() {
      let latitude; let
        longitude;
      let hasError = false;

      const validateDMSInput = () => {
        const fields = ['degN', 'minN', 'secN', 'degW', 'minW', 'secW'];
        fields.forEach((field) => {
          if (!this[field] || isNaN(this[field])) {
            this[`${field}Error`] = true;
            hasError = true;
          }
        });
      };

      const validateDecimalInput = () => {
        if (!this.lat || isNaN(this.lat)) {
          this.latError = true;
          hasError = true;
        }
        if (!this.lng || isNaN(this.lng)) {
          this.lngError = true;
          hasError = true;
        }
      };

      const calculateDecimal = (deg, min, sec) => (
        parseFloat(deg) + parseFloat(min / 60) + parseFloat(sec / 3600)
      );

      const calculateNegativeDecimal = (deg, min, sec) => -(
        parseFloat(deg)
                + parseFloat(min / 60)
                + parseFloat(sec / 3600)
      );

      const calculateLatitudeLongitude = () => {
        if (this.coordType === this.$i18n.t('dms-label')) {
          validateDMSInput();
          if (!hasError) {
            latitude = this.north
              ? calculateDecimal(
                this.degN,
                this.minN,
                this.secN,
              )
              : calculateNegativeDecimal(
                this.degN,
                this.minN,
                this.secN,
              );
            longitude = this.east
              ? calculateDecimal(
                this.degW,
                this.minW,
                this.secW,
              )
              : calculateNegativeDecimal(
                this.degW,
                this.minW,
                this.secW,
              );
          }
        } else if (this.coordType === this.$i18n.t('decimal-label')) {
          validateDecimalInput();
          if (!hasError) {
            latitude = parseFloat(this.lat);
            longitude = parseFloat(this.lng);
          }
        } else {
          hasError = true;
        }
      };

      calculateLatitudeLongitude();

      if (hasError) return;

      this.showEdit = true;
      this.map.flyTo([latitude, longitude], 12);

      const novoMarcador = L.marker([latitude, longitude]);
      novoMarcador.addTo(this.map);
      this.drawnItems.addLayer(novoMarcador);

      novoMarcador.on('click', () => {
        this.drawnItems.removeLayer(novoMarcador);
        this.map.removeLayer(novoMarcador);
      });

      this.center = novoMarcador;

      this.handleButtonEditClick();
      this.show = true;
    },

    handleButtonEditClick(type) {
      this.isButtonEditClicked = true;
      this.activeButton = null;
      if (this.drawInstance) {
        this.drawInstance.disable();
      }
      if (type === 'Delete') {
        this.isDeleteButtonActive = true;
      } else {
        this.isDeleteButtonActive = false;
      }

      if (type === 'Edit') {
        this.isEditButtonActive = true;
      } else {
        this.isEditButtonActive = false;
      }

      if (type === 'Edit' || type === 'Delete') {
        this.drawInstance = new this.$L.EditToolbar[type](this.map, {
          featureGroup: this.drawnItems,
        });
        this.originalDrawnItems = this.drawnItems.toGeoJSON();
        this.drawInstance.enable();
      }

      if (type === 'Save') {
        this.isButtonEditClicked = false;
        this.saveDialog = true;
      }
    },

    clearAllDrawings() {
      if (this.drawnItems) {
        this.drawnItems.eachLayer((layer) => {
          this.map.removeLayer(layer);
        });
        this.drawnItems.clearLayers();
        this.isButtonEditClicked = false;
        if (this.drawInstance) {
          this.drawInstance.disable();
        }
      }
    },

    generateJson(obj) {
      const circles = [];
      Object.values(this.drawnItems._layers).forEach((layer) => {
        if (layer._mRadius) {
          const coordinates = [layer._latlng.lng, layer._latlng.lat];
          const circle = markerToPolygon(
            coordinates,
            layer._mRadius,
            512,
          );
          circles.push(circle);
        }
      });

      const geometry = this.drawnItems.toGeoJSON();
      circles.forEach((circle) => {
        const circleGeojson = {
          type: 'Feature',
          geometry: {
            coordinates: circle.coordinates,
            type: circle.type,
          },
          properties: {},
        };
        geometry.features.push(circleGeojson);
      });

      const actions = {
        Save: () => this.saveIntoDb(geometry, obj.name),
      };

      const action = actions[obj.type];
      if (action) {
        action();
      }
    },

    save() {
      this.setIsDrawing(false);
      Object.values(this.drawnItems._layers).forEach((layer) => {
        this.contentPopupDraw = getGeometryArea(layer);
        this.newValueContent.push({
          content: this.contentPopupDraw,
          id: layer._leaflet_id,
        });
        this.$nextTick(() => {
          this.newValueContent = [];
        });
      });
      this.isButtonEditClicked = false;
      this.drawInstance.disable();
    },

    saveIntoDb(geometry, name) {
      this.saveDrawToDatabase({ geometry, name });
      this.saveDialog = false;
    },

    toggleActivate() {
      this.north = !this.north;
    },
    toggleActivateEast() {
      this.east = !this.east;
    },

    selectDraw() {
      this.$emit('toggleTool', 'Highlighter');
    },

    getTooltipText(icon) {
      const language = this.$i18n.locale;
      return this.$t(`tooltips.${icon}`, null, language);
    },

    clearActiveButton() {
      this.activeButton = null;
      if (this.drawInstance) {
        this.drawInstance.disable();
      }
    },

    ...mapActions('map', ['saveDrawToDatabase']),
    ...mapMutations('map', ['setIsDrawing']),
  },
};
</script>

<style lang="sass" scoped>
.back-icon
    transform: rotate(0deg)

.drawer-block
    margin-left: -18px
    overflow: hidden
    position: absolute
    left: 35px
    min-width: 300px
    .upload-options-drawer
        position: relative
        z-index: 2
        display: flex
        align-items: center
        justify-content: space-between
        background-color: white
        border-radius: 4px 40px 40px 4px
        background-color: white
        transition: ease all 0.6s
        padding-left: 35px

.btn-tools
    padding: 0px !important
    margin: 0px !important
    color: inherit !important
    margin-top: 10px !important

.slide-x-drawer-enter-active, .slide-x-drawer-leave-active
    transition: all 0.4s ease-out !important

.slide-x-drawer-enter, .slide-x-drawer-leave-to
    transform: translateX(-100%)

.slide-x-drawer-leave-active
    transition-delay: 0.3s !important

.decimal-field
    width: 105px

.col-6
    flex: 0 0 50%
    max-width: 50%
    height: 60px

.btn-action
    margin-top: 6px
</style>
