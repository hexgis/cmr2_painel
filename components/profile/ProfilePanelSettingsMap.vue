<template>
  <v-form
    class="fill-height"
    @submit.prevent="changeSettings"
  >
    <v-card>
      <v-progress-linear
        v-show="isLoading"
        class="my-0 login-progress"
        :indeterminate="true"
        height="3"
        color="accent"
      />

      <v-card-text class="pa-6">
        <v-alert
          v-show="showError"
          type="error"
          class="mb-3"
        >
          {{ error }}
        </v-alert>

        <v-row wrap>
          <v-col
            cols="12"
            class="py-0"
          >
            <v-checkbox
              v-model="settings.drawer_open_on_init"
              :label="$t('drawer-label')"
            />
          </v-col>
          <v-col
            cols="12"
            class="py-0"
          >
            <v-checkbox
              v-model="settings.interest_area_zoom_on_init"
              :label="$t('start-zoom-label')"
            />
          </v-col>
          <v-col
            cols="12"
            class="py-0"
          >
            <v-checkbox
              v-model="settings.map_zoom_buttons_visible"
              :label="$t('zoom-buttons-label')"
            />
          </v-col>
          <v-col
            cols="12"
            class="py-0"
          >
            <v-checkbox
              v-model="settings.map_search_button_visible"
              :label="$t('search-button-label')"
            />
          </v-col>

          <v-col
            cols="12"
            class="py-0"
          >
            <v-checkbox
              v-model="settings.map_scale_visible"
              :label="$t('map-scale-label')"
            />
          </v-col>
          <v-col
            cols="12"
            class="py-0"
          >
            <v-checkbox
              v-model="settings.minimap_visible"
              :label="$t('mini-map-label')"
            />
          </v-col>
          <v-col
            cols="12"
            class="py-0"
          >
            <v-checkbox
              v-model="settings.map_pointer_coordinates_visible"
              :label="$t('coordinates-label')"
            />
          </v-col>
          <v-col
            cols="12"
            class="py-0 initial-extent-class"
          >
            <v-checkbox
              v-model="activateMapSelect"
              :label="$t('select-initial-extent')"
            />
            <div v-if="activateMapSelect">
              <v-btn @click="$emit('toggle-map')">
                <v-icon> mdi-map-check</v-icon>
                {{ $t('initial-extent-label') }}
              </v-btn>
              <div
                class="initial-extent-block"
                :style="{
                  '--width': !!boundingBox ? '290px' : '0px',
                }"
              >
                <div class="initial-extent-input">
                  <v-btn
                    icon
                    @click="removeInitialExtent()"
                  >
                    <v-icon>
                      mdi-close-circle-outline
                    </v-icon>
                  </v-btn>
                  <v-input hide-details>
                    {{
                      !!boundingBox
                        ? boundingBox.coordinates
                        : ''
                    }}
                  </v-input>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn
          color="accent"
          type="submit"
        >
          {{ $t('save-button') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<i18n>
{
    "en": {
        "drawer-label": "Sidebar menu open when starting",
        "start-zoom-label": "Zoom in to interest area when starting",
        "zoom-buttons-label": "Zoom buttons visible",
        "search-button-label": "Search button visible",
        "map-scale-label": "Map scale visible",
        "mini-map-label": "Mini map visible",
        "coordinates-label": "Mouse coordinates visible",
        "select-initial-extent": "Define extended area",
        "initial-extent-label": "Select area",
        "save-button": "Save",
        "success-message": "Settings changed successfully!",
        "error-message": "Could not change settings"
    },
    "pt-br": {
        "drawer-label": "Menu lateral aberto ao iniciar",
        "start-zoom-label": "Aproximar para área de interesse ao iniciar",
        "zoom-buttons-label": "Botões de zoom visíveis",
        "search-button-label": "Botão de pesquisa visível",
        "map-scale-label": "Escala do mapa visível",
        "mini-map-label": "Mini-mapa visível",
        "coordinates-label": "Coordenadas do mouse visíveis",
        "select-initial-extent": "Definir área extendida",
        "initial-extent-label": "Selecionar área",
        "save-button": "Salvar",
        "success-message": "Configurações alteradas com sucesso!",
        "error-message": "Não foi possível alterar configurações"
    }
}
</i18n>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';

export default {
  name: 'ProfilePanelSettingsMap',
  props: {
    newBoundingBox: {
      type: Object,
      default: () => null,
    },
  },

  data: () => ({
    settings: {
      drawer_open_on_init: true,
      interest_area_zoom_on_init: true,
      map_zoom_buttons_visible: true,
      map_search_button_visible: true,
      map_scale_visible: true,
      minimap_visible: true,
      map_pointer_coordinates_visible: true,
    },

    isLoading: false,
    showError: false,
    activateMapSelect: false,
    error: this.$t('error-message'),
  }),

  computed: {
    ...mapState('userProfile', ['user']),
    boundingBox() {
      return this.newBoundingBox || this.settings.initial_extent || null;
    },
  },

  mounted() {
    this.settings = { ...this.settings, ...this.user.settings };
    this.activateMapSelect = !!this.boundingBox;
  },

  methods: {
    removeInitialExtent() {
      this.newBoundingBox = null;
      this.settings.initial_extent = null;
    },
    changeSettings() {
      this.showError = false;
      this.isLoading = true;
      this.updateSettings({
        ...this.settings,
        initial_extent: this.activateMapSelect
          ? this.boundingBox
          : null,
      })
        .then(() => {
          this.isLoading = false;
          this.addAlert({
            message: this.$t('success-message'),
          });
        })
        .catch(() => {
          this.isLoading = false;
          this.showError = true;
        });
    },

    ...mapActions('userProfile', ['updateSettings']),
    ...mapMutations('alert', ['addAlert']),
  },
};
</script>

<style scoped lang="sass">
.initial-extent-class
    display: flex
    flex-direction: column
    align-items: flex-start

    >div
        display: flex

.initial-extent-block
    overflow: hidden
    transition: all ease 0.2s
    width: var(--width)

.initial-extent-input
    display: flex
    align-items: center
    padding-left: 30px

    .v-input
        max-width: 200px
        min-height: 32px
        padding: 5px 0px 5px 10px
        overflow: hidden
        text-overflow: ellipsis
        word-wrap: break-word
        white-space: nowrap
        vertical-align: middle
        box-shadow: 1px 1px 4px inset black
        border-radius: 8px
        color: gray
</style>
