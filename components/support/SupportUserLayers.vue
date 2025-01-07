<template>
  <v-list-group
    v-model="isOpen"
    append-icon=""
  >
    <template #activator>
      <v-list-item-content>
        <v-list-item-title class="text-wrap">
          <span class="text-cursor">
            {{ layer.name }}
          </span>
        </v-list-item-title>
      </v-list-item-content>
      <v-list-item-action @click.stop="">
        <v-switch
          :input-value="layer.visible"
          :loading="layer.loading"
          @change="toggleLayer"
        />
      </v-list-item-action>
    </template>
    <v-container
      v-if="layer.visible "
      class="py-0"
    >
      <v-row
        v-if="!isPointType"
        class="black--text text--lighten-2"
        align="center"
      >
        <v-col cols="4">
          Opacidade
        </v-col>
        <v-col cols="8">
          <v-slider
            :value="layer.opacity"
            class="mb-n4"
            thumb-label
            @input="updateLayerOpacity($event)"
          />
        </v-col>
      </v-row>
      <v-row
        justify="space-around"
        align="center"
        no-gutters
      >
        <v-col>
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                text
                block
                large
                color="grey darken-3"
                class="pa-0"
                v-on="on"
                @click="boundary"
              >
                <v-icon> mdi-crosshairs-gps </v-icon>
              </v-btn>
            </template>
            <span> {{ $t('zoom-label') }} </span>
          </v-tooltip>
        </v-col>
        <v-col>
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                text
                block
                large
                color="grey darken-3"
                v-on="on"
                @click="rename = true"
              >
                <v-icon> mdi-pencil </v-icon>
              </v-btn>
            </template>
            <span> {{ $t('edit-label') }} </span>
          </v-tooltip>
        </v-col>
        <v-col>
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                text
                block
                large
                color="grey darken-3"
                v-on="on"
                @click="downloadLayer()"
              >
                <v-icon> mdi-download </v-icon>
              </v-btn>
            </template>
            <span> {{ $t('download-label') }} </span>
          </v-tooltip>
        </v-col>
        <v-col>
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                text
                block
                large
                color="grey darken-3"
                v-on="on"
                @click="remove = true"
              >
                <v-icon> mdi-close-thick </v-icon>
              </v-btn>
            </template>
            <span> {{ $t('remove-label') }} </span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog
      v-model="rename"
      max-width="800"
    >
      <v-card style="overflow: hidden;">
        <v-card-title>
          {{ $t('edit-label') }}
          <v-spacer />
          <v-btn
            icon
            class="mr-n5 mt-n5"
            @click="rename = false"
          >
            <v-icon class="mr-5 mt-5">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="py-6">
          <v-row>
            <v-col cols="12">
              <v-text-field

                v-model="name"
                :label="$t('field-label')"
                required
                hide-details
              />
              <p
                v-if="isPointType"
                class="mt-4"
              >
                {{ $t('info-text') }}
              </p>
            </v-col>
            <v-col class="mt-n8">
              <v-tooltip
                v-if="isPointType"
                bottom
              >
                <template #activator="{ on }">
                  <v-btn
                    text
                    block
                    large
                    color="grey darken-3"
                    v-on="on"
                    @click="pallete = !pallete"
                  >
                    <v-icon>
                      {{
                        pallete
                          ? 'mdi-chevron-up'
                          : 'mdi-palette-outline'
                      }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('palette-button') }}</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-expand-transition>
            <div v-show="pallete">
              <v-color-picker
                :value="layerStyle"
                hide-mode-switch
                mode="hexa"
                dot-size="15"
                @input="updateColor"
              />
            </div>
          </v-expand-transition>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="accent"
            @click="handleSave"
          >
            {{ $t('button-label') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="remove"
      width="300"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t('remove-title') }}
        </v-card-title>
        <v-card-text class="py-6">
          {{ $t('remove-text') }}
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color=""
            text
            @click="remove = false"
          >
            {{ $t('cancel-button') }}
          </v-btn>
          <v-btn
            color="accent"
            text
            @click="removeLayer"
          >
            {{ $t('confirm-button') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-list-group>
</template>

<i18n>
{
    "en": {
        "zoom-label": "Zoom to area",
        "edit-label": "Edit",
        "download-label": "Download layer",
        "remove-label": "Remove layer",
        "info-text": "Layer color",
        "field-label": "Layer name",
        "button-label": "Save",
        "api-error-update": "Error while updating layer, contact a system administrator in case it persists.",
        "api-error-delete": "Error while removing bookmark, contact a system administrator in case it persists.",
        "remove-title": "Remove layer?",
        "remove-text": "This action cannot be undone",
        "cancel-button": "Cancel",
        "confirm-button": "Remove",
        "palette-button": "Color palette",
        "save-button": "Save Color"
    },

    "pt-br": {
        "zoom-label": "Aproximar para área",
        "edit-label": "Editar",
        "download-label": "Baixar camada",
        "remove-label": "Excluir camada",
        "info-text": "Cor da camada",
        "field-label": "Nome da camada",
        "button-label": "Salvar",
        "api-error-update": "Não foi possível atualizar o camada, entre em contato com um administrador caso persista.",
        "api-error-delete": "Não foi possível remover a camada, entre em contato com um administrador caso persista",
         "remove-title": "Remover camada?",
        "remove-text": "Essa ação não pode ser desfeita",
        "cancel-button": "Cancelar",
        "confirm-button": "Remover",
        "palette-button": "Paleta de cores",
        "save-button": "Salvar Cor"
    }
}
</i18n>

<script>
import { mapMutations, mapActions, mapState } from 'vuex';

export default {
  name: 'SupportUserLayers',

  props: {
    layer: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    isOpen: false,
    rename: false,
    remove: false,
    name: '',
    pallete: false,
    layerStyle: '#FF0000FF',
    isPointType: false,
  }),

  created() {
    this.getLayersUser();
    this.hasAddLayer ? (
      this.toggleLayer()
    ) : '';
  },

  computed: {
    ...mapState('supportLayersUser', ['supportLayerUser']),
    ...mapState('map', ['hasAddLayer']),
  },

  methods: {
    async toggleLayer() {
      if (!this.supportLayerUser[this.layer.id].geometry) {
        await this.getLayersUserGeoJson({
          id: this.layer.id,
        });
      }
      const geometryTypes = this.supportLayerUser[
        this.layer.id
      ].geometry.features.map((feature) => feature.geometry.type);
      this.isPointType = geometryTypes.every((type) => type === 'Point');
      this.name = this.layer.name;
      this.toggleLayerVisibility({
        id: this.layer.id,
        visible: !this.layer.visible,
      });
      this.isOpen = this.layer.visible;
    },

    updateLayerOpacity(opacity) {
      this.setLayerOpacity({ id: this.layer.id, opacity });
    },

    async handleSave() {
      try {
        if (this.rename) {
          await this.updateLayer();
        }
        await this.saveColor();
      } catch (error) {
        console.error('Error in handleSave:', error);
      }
    },

    async updateColor(color) {
      this.layerStyle = color;
      this.SET_COLOR(color);
      this.updateMarkerColor(this.layer.id, color);
    },

    async saveColor() {
      try {
        await this.$api.patch(
          `user/upload-file/geo/${this.layer.id}/update-properties/`,
          {
            color: this.layerStyle,
            name: this.name,
          },
        );
        await this.getLayersUser();
      } catch (exc) {
        console.error('Error:', exc);
        this.$store.commit('alert/addAlert', {
          message: this.$t('api-error-update'),
        });
      }
    },

    updateMarkerColor(layerId, color) {
      const layer = this.$L.geoJSON(this.layer.geometry);
      layer.eachLayer((marker) => {
        if (marker.options.layerId === layerId) {
          marker.setStyle({ color });
        }
      });
    },

    boundary() {
      const bounds = this.$L.geoJSON(this.layer.geometry).getBounds();
      if (bounds.getNorthEast() && bounds.getSouthWest()) {
        this.zoomToBounds(bounds);
      }
    },

    async updateLayer() {
      this.rename = false;
      try {
        await this.getLayersUser();
      } catch (exc) {
        this.$store.commit('alert/addAlert', {
          message: this.$t('api-error-update'),
        });
      }
    },

    async removeLayer() {
      try {
        await this.$api.$delete(
          `user/upload-file/${this.layer.id}`,
        );
        await this.getLayersUser();
      } catch (exc) {
        this.$store.commit('alert/addAlert', {
          message: this.$t('api-error-delete'),
        });
      }
    },

    downloadLayer() {
      const jsonStr = JSON.stringify(this.layer.geometry);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.layer.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    ...mapMutations('supportLayersUser', [
      'toggleLayerVisibility',
      'setLayerOpacity',
      'setLayerColor',
      'setZoomTo',
      'SET_COLOR',
    ]),

    ...mapActions('supportLayersUser', [
      'getLayersUserGeoJson',
      'getLayersUser',
    ]),
    ...mapActions('map', ['zoomToBounds', 'saveDrawToDatabase']),
  },
};
</script>
