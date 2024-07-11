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
      v-if="layer.visible"
      class="py-0"
    >
      <v-row
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
      <v-card>
        <v-card-title>
          {{ $t('edit-label') }}
          <v-spacer />
          <v-btn
            icon
            class="mr-n5 mt-n5"
            @click="rename = false"
          >
            <v-icon> mdi-close </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="py-6">
          <p>{{ $t('info-text') }}</p>
          <v-row>
            <v-col>
              <v-text-field
                v-model="name"
                :label="$t('field-label')"
                outlined
                required
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="accent"
            :disabled="!name"
            @click="updateLayer"
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
        "edit-label": "Rename layer",
        "download-label": "Download layer",
        "remove-label": "Remove layer",
        "info-text": "Enter layer name",
        "field-label": "Name",
        "button-label": "Save",
        "api-error-update": "Error while updating layer, contact a system administrator in case it persists.",
        "api-error-delete": "Error while removing bookmark, contact a system administrator in case it persists.",
        "remove-title": "Remove layer?",
        "remove-text": "This action cannot be undone",
        "cancel-button": "Cancel",
        "confirm-button": "Remove"
    },

    "pt-br": {
        "zoom-label": "Aproximar para área",
        "edit-label": "Renomear camada",
        "download-label": "Baixar camada",
        "remove-label": "Excluir camada",
        "info-text": "Digite o nome da camada",
        "field-label": "Nome",
        "button-label": "Salvar",
        "api-error-update": "Não foi possível atualizar o camada, entre em contato com um administrador caso persista.",
        "api-error-delete": "Não foi possível remover a camada, entre em contato com um administrador caso persista",
         "remove-title": "Remover camada?",
        "remove-text": "Essa ação não pode ser desfeita",
        "cancel-button": "Cancelar",
        "confirm-button": "Remover"
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
  }),

  created(){
    this.getLayersUser()
    this.hasAddLayer ? (
      this.toggleLayer()
   ) : ''
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
      this.toggleLayerVisibility({
        id: this.layer.id,
        visible: !this.layer.visible,
      });
      this.isOpen = this.layer.visible;
    },

    updateLayerOpacity(opacity) {
      this.setLayerOpacity({
        id: this.layer.id,
        opacity,
      });
    },

    boundary() {
      const bounds = this.$L.geoJSON(this.layer.geometry).getBounds();
      if (bounds.getNorthEast() && bounds.getSouthWest()) { this.zoomToBounds(bounds); }
    },

    async updateLayer() {
      this.rename = false;
      try {
        await this.$api.$patch(
          `user/upload-file/${this.layer.id}/update/`,
          {
            name: this.name,
          },
        );
        this.getLayersUser();
      } catch (exc) {
        this.$store.commit('alert/addAlert', {
          message: this.$t('api-error-update'),
        });
      }
    },

    async removeLayer() {
      try {
        await this.$api.$put(
          `user/upload-file/${this.layer.id}/delete/`,
        );
        this.getLayersUser();
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
      'setZoomTo',
    ]),

    ...mapActions('supportLayersUser', [
      'getLayersUserGeoJson',
      'getLayersUser',
    ]),
    ...mapActions('map', ['zoomToBounds']),
  },

};
</script>
