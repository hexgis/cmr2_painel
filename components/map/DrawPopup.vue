<template>
  <div class="pa-2">
    <div v-if="content.position">
      <span class="font-weight-bold">
        {{ $t('position-popup-label') }}
      </span>
      :{{ content.position }}
    </div>
    <div v-if="content.distance">
      <span class="font-weight-bold">
        {{ $t('distance-popup-label') }}
      </span>
      :{{ ' ~ ' + content.distance + ' m' }}
    </div>
    <div v-if="content.area">
      <span class="font-weight-bold">
        {{ $t('area-popup-label') }}
      </span>
      :{{ ' ~ ' + content.area }}
    </div>
    <div v-if="content.radius">
      <span class="font-weight-bold">
        {{ $t('radius-popup-label') }}
      </span>
      :{{ ' ~ ' + content.radius + ' m' }}
    </div>
    <div
      v-if="!!(layer instanceof $L.Marker)"
      class="multicontrol"
    >
      <div class="d-block">
        <div class="d-flex">
          <v-spacer />
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                v-on="on"
                @click="buttonPopup('Delete', layer)"
              >
                <v-icon>{{ 'mdi-delete' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('delete-button') }}</span>
          </v-tooltip>
          <v-tooltip
            v-if="!layer.hasOwnProperty('buffered')"
            top
          >
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="buttonPopup('Edit', layer)"
                v-on="on"
              >
                <v-icon>{{ 'mdi-pencil-box' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('edit-button') }}</span>
          </v-tooltip>
        </div>
      </div>
    </div>
    <div
      v-else-if="!!(layer instanceof $L.CircleMarker && !(layer instanceof $L.Circle))"
      class="multicontrol"
    >
      <div class="d-block">
        <div class="d-flex">
          <v-spacer />
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                v-on="on"
                @click="buttonPopup('Delete', layer)"
              >
                <v-icon>{{ 'mdi-delete' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('delete-button') }}</span>
          </v-tooltip>
          <v-tooltip
            v-if="!layer.hasOwnProperty('buffered')"
            top
          >
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="buttonPopup('Edit', layer)"
                v-on="on"
              >
                <v-icon>{{ 'mdi-pencil-box' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('edit-button') }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="pallete = !pallete"
                v-on="on"
              >
                <v-icon>
                  {{
                    pallete ? 'mdi-chevron-up' : 'mdi-palette-outline'
                  }}
                </v-icon>
              </v-btn>
            </template>
            <span>{{ $t('palette-button') }}</span>
          </v-tooltip>
        </div>
        <v-expand-transition>
          <div v-show="pallete">
            <v-color-picker
              :value="layerStyle"
              hide-mode-switch
              mode="hexa"
              dot-size="15"
              @update:color="(color) => updateLayerOpacity(color)"
            />
          </div>
        </v-expand-transition>
      </div>
    </div>
    <div
      v-else-if="!(layer instanceof $L.Marker || layer instanceof $L.CircleMarker)"
      class="multicontrol"
    >
      <div class="d-block">
        <div class="d-flex">
          <v-spacer />
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="layerRelationship"
                v-on="on"
              >
                <v-icon>{{ 'mdi-crosshairs' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('search-area-label') }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                v-on="on"
                @click="buttonPopup('Delete', layer)"
              >
                <v-icon>{{ 'mdi-delete' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('delete-button') }}</span>
          </v-tooltip>
          <v-tooltip
            v-if="!layer.hasOwnProperty('buffered')"
            top
          >
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="buttonPopup('Edit', layer)"
                v-on="on"
              >
                <v-icon>{{ 'mdi-pencil-box' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('edit-button') }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="buttonPopup('Buffer', layer)"
                v-on="on"
              >
                <v-icon>{{ 'mdi-arrow-expand-all' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('buffer-button') }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="pallete = !pallete"
                v-on="on"
              >
                <v-icon>
                  {{
                    pallete ? 'mdi-chevron-up' : 'mdi-palette-outline'
                  }}
                </v-icon>
              </v-btn>
            </template>
            <span>{{ $t('palette-button') }}</span>
          </v-tooltip>
        </div>
        <v-expand-transition>
          <div v-show="pallete">
            <v-color-picker
              :value="layerStyle"
              hide-mode-switch
              mode="hexa"
              dot-size="15"
              @update:color="(color) => updateLayerOpacity(color)"
            />
          </div>
        </v-expand-transition>
      </div>
    </div>
    <div
      v-else-if="!!(layer instanceof $L.Circle)"
      class="multicontrol"
    >
      <div class="d-block">
        <div class="d-flex">
          <v-spacer />
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="layerRelationship"
                v-on="on"
              >
                <v-icon>{{ 'mdi-crosshairs' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('search-area-label') }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                v-on="on"
                @click="buttonPopup('Delete', layer)"
              >
                <v-icon>{{ 'mdi-delete' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('delete-button') }}</span>
          </v-tooltip>
          <v-tooltip
            v-if="!layer.hasOwnProperty('buffered')"
            top
          >
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="buttonPopup('Edit', layer)"
                v-on="on"
              >
                <v-icon>{{ 'mdi-pencil-box' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('edit-button') }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="buttonPopup('Buffer', layer)"
                v-on="on"
              >
                <v-icon>{{ 'mdi-arrow-expand-all' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('buffer-button') }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                @click="pallete = !pallete"
                v-on="on"
              >
                <v-icon>
                  {{
                    pallete ? 'mdi-chevron-up' : 'mdi-palette-outline'
                  }}
                </v-icon>
              </v-btn>
            </template>
            <span>
              {{ $t('palette-button') }}
            </span>
          </v-tooltip>
        </div>
        <v-expand-transition>
          <div v-show="pallete">
            <v-color-picker
              :value="layerStyle"
              hide-mode-switch
              mode="hexa"
              dot-size="15"
              @update:color="(color) => updateLayerOpacity(color)"
            />
          </div>
        </v-expand-transition>
      </div>
    </div>
  </div>
</template>

<i18n>
{
    "en": {
        "area-popup-label": "Area",
        "distance-popup-label": "Distance",
        "position-popup-label": "Lat/Lon",
        "radius-popup-label": "Radius",
        "delete-button":"Delete",
        "edit-button":"Edit",
        "buffer-button":"Buffer",
        "palette-button": "Color palette",
        "search-area-label": "Search in area"
    },
    "pt-br": {
        "area-popup-label": "Área",
        "distance-popup-label": "Distância",
        "position-popup-label": "Lat/Lon",
        "radius-popup-label": "Raio",
        "delete-button":"Apagar desenho",
        "edit-button":"Editar desenho",
        "buffer-button":"Buffer",
        "palette-button": "Paleta de cores",
        "search-area-label": "Pesquisar em área"
    }
}
</i18n>

<script>
/* eslint-disable no-underscore-dangle --
 * Underscore attributes defined by "Leafleat" plugin
 */

import { mapMutations } from 'vuex';

export default {

  props: {
    layer: {
      type: Object,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
    valueContent: {
      type: Object,
      default: null,
    },
    newValueContent: {
      type: Array,
      default: null,
    },
    relationship: {
      type: Function,
      default: null,
    },
  },

  data() {
    return {
      content: this.valueContent,
      pallete: false,
      layerStyle: '#3285DF63',
    };
  },

  watch: {
    newValueContent(value) {
      value.forEach((item) => {
        if (item.id === this.layer._leaflet_id) { this.content = item.content; }
      });
    },
  },

  methods: {
    updateLayerOpacity(color) {
      this.layer.setStyle({
        color: color.hex,
        fillOpacity: color.alpha,
      });
    },

    buttonPopup(type, layer) {
      this.setButtonPopup({
        type,
        layer: layer._leaflet_id,
      });
    },

    layerRelationship() {
      this.relationship(this.layer, this.type);
    },

    ...mapMutations('map', ['setButtonPopup']),
  },
};
</script>

<style lang="sass">
.multicontrol
    width: 270px
</style>
