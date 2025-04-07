<template>
  <v-container class="pa-0">
    <div class="tab-header">
      <h4 class="subtitle-2 text-uppercase font-weight-regular">
        {{ $t('title') }}
      </h4>
      <v-row
        class="mr-1"
        justify="end"
      >
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              fab
              color="secondary"
              x-small
              depressed
              v-on="on"
              @click="clearComparing()"
            >
              <v-icon> mdi-close </v-icon>
            </v-btn>
          </template>
          <span> {{ $t('tooltip') }} </span>
        </v-tooltip>
      </v-row>
    </div>

    <template>
      <v-container>
        <v-row class="ma-0">
          <template v-for="(image, i) in comparingImages">
            <v-col
              :key="i"
              cols="6"
            >
              <template v-if="image != null">
                <v-img
                  contain
                  class="scene-preview"
                  :src="getSceneUrl(image)"
                  :lazy-src="'/img/placeholder.png'"
                  :alt="image.properties.image"
                />

                <div class="py-3 px-2">
                  <div class="d-flex mb-1">
                    <v-icon> mdi-calendar </v-icon>
                    <span class="ml-3">
                      {{ $date(image.properties.date) }}
                    </span>
                  </div>
                  <div class="d-flex mb-1">
                    <v-icon> mdi-web </v-icon>
                    <span class="ml-3">
                      {{ image.properties.locator }}
                    </span>
                  </div>
                  <div class="d-flex mb-1">
                    <v-icon> mdi-satellite-variant </v-icon>
                    <span class="ml-3">
                      {{ image.properties.satellite }}
                    </span>
                  </div>
                  <div class="d-flex">
                    <v-icon>
                      mdi-weather-partly-cloudy
                    </v-icon>
                    <span class="ml-3">
                      {{ image.properties.cloud_cover }}%
                    </span>
                  </div>

                  <div class="d-flex">
                    <v-icon>
                      mdi-weather-partly-cloudy
                    </v-icon>
                    <span class="ml-3">
                      {{ image.properties.type }}%
                    </span>
                  </div>
                </div>
              </template>

              <template v-else>
                <v-row justify="center">
                  <div class="scene-container">
                    <v-img
                      contain
                      class="scene-preview"
                      :src="emptyImage"
                      :lazy-src="emptyImage"
                      :alt="$t('empty-image')"
                    />
                  </div>
                </v-row>
                <v-row justify="center">
                  <span> {{ $t('empty-image') }} </span>
                </v-row>
              </template>
            </v-col>
          </template>
        </v-row>
      </v-container>
    </template>
  </v-container>
</template>

<i18n>
{
    "en": {
        "title": "Compare selected images",
        "tooltip": "Cancel compare",
        "empty-image": "Empty image"
    },
    "pt-br": {
        "title": "Comparar imagens selecionadas",
        "tooltip": "Cancelar comparação",
        "empty-image": "Imagem vazia"
    }
}
</i18n>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'CatalogComparator',

  transition: 'scroll-y-transition',

  data: () => ({
    comparingImages: [],
    emptyImage:
            'https://uploads-ssl.webflow.com/57e5747bd0ac813956df4e96/5aebae14c6d254621d81f826_placeholder.png',
  }),

  computed: {
    ...mapState('catalog', [
      'scenes',
      'scenesToCompare',
      'otherPageScenes',
    ]),
  },

  watch: {
    scenes() {
      this.refreshComparatorImages();
    },

    scenesToCompare: {
      handler() {
        this.refreshComparatorImages();
      },
      deep: true,
    },
  },

  mounted() {
    this.refreshComparatorImages();

    if (
      !this.scenesToCompare.leftIndex
            && !this.scenesToCompare.rightIndex
    ) {
      this.clearComparing();
    }
  },

  methods: {
    clearComparing() {
      this.clearScenesToCompare();
      this.setIsComparing(false);
      this.$router.replace(this.localePath('/catalog'));
    },

    getSceneUrl(scene) {
      return scene.properties.preview || '/img/placeholder.png';
    },

    refreshComparatorImages() {
      this.comparingImages = [];

      const { leftIndex } = this.scenesToCompare;
      const { rightIndex } = this.scenesToCompare;

      if (leftIndex !== null) {
        if (this.scenesToCompare.leftInOtherPage) {
          this.comparingImages.push(this.otherPageScenes[leftIndex]);
        } else {
          this.comparingImages.push(this.scenes[leftIndex]);
        }
      } else {
        this.comparingImages.push(null);
      }

      if (rightIndex !== null) {
        if (this.scenesToCompare.rightInOtherPage) {
          this.comparingImages.push(this.otherPageScenes[rightIndex]);
        } else {
          this.comparingImages.push(this.scenes[rightIndex]);
        }
      } else {
        this.comparingImages.push(null);
      }
    },

    ...mapMutations('catalog', [
      'setHoveredScene',
      'highlightScene',
      'clearSceneHighlight',
      'setIsComparing',
      'clearScenesToCompare',
    ]),
  },
};
</script>

<style lang="sass">
.scene-preview
    height: 130px

.scene-container
    width: 100%

.leaflet-sbs-divider, .leaflet-sbs-range
    z-index: 3 !important
</style>
