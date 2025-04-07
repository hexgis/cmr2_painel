<template>
  <v-container class="pa-0 fill-height align-start">
    <BaseExpandableTitle
      v-model="showFilters"
      :features="showFeatures"
      :has-results="showScenes"
      @toggleFeatures="toggleFeatures()"
    >
      <template #title>
        {{ showScenes ? $t('alt-title') : $t('title') }}
      </template>
      <template #filter>
        <CatalogFilter />
      </template>
    </BaseExpandableTitle>

    <div
      ref="resultList"
      class="result-container fill-height"
    >
      <v-fade-transition hide-on-leave>
        <CatalogSceneList v-show="showScenes && !isLoadingScenes" />
      </v-fade-transition>

      <v-fade-transition hide-on-leave>
        <div v-show="isLoadingScenes">
          <template v-for="i in 4">
            <v-sheet
              :key="i"
              class="pa-3"
            >
              <v-row align="center">
                <v-col cols="6">
                  <v-skeleton-loader
                    type="image"
                    max-height="140"
                  />
                </v-col>
                <v-col cols="6">
                  <v-skeleton-loader type="paragraph" />
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  v-for="j in 4"
                  :key="j"
                  cols="3"
                >
                  <v-skeleton-loader type="button" />
                </v-col>
              </v-row>
            </v-sheet>
            <v-divider :key="i + '_d'" />
          </template>
        </div>
      </v-fade-transition>
    </div>
  </v-container>
</template>

<i18n>
{
    "en": {
        "title": "Search in my image database",
        "alt-title": "Catalog"
    },
    "pt-br": {
        "title": "Pesquisar em meu acervo de imagens",
        "alt-title": "Catálogo"
    }
}
</i18n>

<script>
import { mapState, mapGetters } from 'vuex';

import BaseExpandableTitle from '@/components/base/BaseExpandableTitle';
import CatalogFilter from '@/components/catalog/CatalogFilter';
import CatalogSceneList from '@/components/catalog/CatalogSceneList';

export default {
  name: 'Catalog',

  components: {
    BaseExpandableTitle,
    CatalogFilter,
    CatalogSceneList,
  },

  transition: 'scroll-y-transition',
  computed: {
    ...mapState('catalog', [
      'isLoadingScenes',
      'showFeatures',
      'showFilters',
    ]),
    ...mapGetters('catalog', ['showScenes']),
  },
  methods: {
    toggleFeatures() {
      this.$store.commit('catalog/setShowFeatures', !this.showFeatures);
    },
  },
};
</script>

<style scoped lang="sass">
.result-container
    margin-top: 64px
    height: calc(100% - 64px)
    width: 100%
    overflow-y: auto
</style>
