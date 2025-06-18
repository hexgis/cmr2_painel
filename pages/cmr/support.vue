<template>
  <v-container class="pa-0">
    <div class="tab-header justify-space-between">
      <div class="d-flex align-center">
        <h4 class="subtitle-2 text-uppercase font-weight-regular">
          {{ $t('title') }}
        </h4>
      </div>
      <v-switch
        v-show="!loading"
        v-model="showFeatures"
        class="mt-n1 ml-5"
        hide-details
      />
    </div>

    <v-col
      cols="12"
      class="pb-0 mb-n8"
    >
      <v-autocomplete
        v-model="selectedLayers"
        :label="$t('search-label')"
        multiple
        clearable
        :items="sortedLayersList"
        :item-text="'name'"
        :item-value="'id'"
        outlined
        :search-input.sync="searchInput"
        @input="searchInput = null"
        @click:clear="clearInput"
      />
    </v-col>

    <v-list
      v-if="!$fetchState.pending"
      expand
    >
      <SupportLayersActive />
      <SupportUser v-if="user" />
      <template v-for="group in orderedSupportLayersGroups">
        <SupportLayersGroupBase
          :key="'group_' + group.id"
          :group="group"
          :selected-layers="selectedLayers"
        />
      </template>
    </v-list>
    <div v-if="$fetchState.pending">
      <template v-for="i in 6">
        <v-skeleton-loader
          :key="i"
          type="text"
          class="mx-4 my-5"
        />
      </template>
    </div>
  </v-container>
</template>

<i18n>
{
  "en": {
    "title": "Layers",
    "search-label": "Search layer",
    "data-source": "Data source: Geoserver - FUNAI"
  },
  "pt-br": {
    "title": "Camadas",
    "search-label": "Buscar camada",
    "data-source": "Fonte de dados: Geoserver - FUNAI"
  }
}
</i18n>

<script>
import { mapState, mapMutations } from 'vuex';
import _ from 'lodash';

import SupportLayersGroupBase from '@/components/support/SupportLayersGroupBase';

import SupportLayersActive from '@/components/support/SupportLayersActive';
import SupportUser from '@/components/support/SupportUser';

export default {
  name: 'Support',

  components: {
    SupportLayersGroupBase,

    SupportUser,
    SupportLayersActive,
  },

  transition: 'scroll-y-transition',

  data: () => ({
    selectedLayers: [],
    searchInput: null,
  }),

  async fetch() {
    if (!Object.keys(this.supportCategoryGroupsBase).length) {
      await this.$store.dispatch('supportLayers/getCategoryGroupsBase');
    }
    if (!Object.keys(this.supportCategoryGroupsAntropismo).length) {
      await this.$store.dispatch(
        'supportLayers/getCategoryGroupsAntropismo',
      );
    }
  },

  computed: {
    layersList() {
      return Object.values(this.supportCategoryGroupsBase).flatMap(
        (group) => group.layers.map((layer) => ({
          name: layer.name,
          id: layer.layer,
        })),
      );
    },

    sortedLayersList() {
      return this.layersList.slice().sort((a, b) => a.name.localeCompare(b.name));
    },

    orderedSupportLayersGroups() {
      if (!this.supportCategoryGroupsBase) return [];
      const groups = Object.values(this.supportCategoryGroupsBase);
      return groups.sort((a, b) => {
        if (a.name.includes('Temas Indígenas')) return -1;
        if (b.name.includes('Temas Indígenas')) return 1;
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
      });
    },

    orderedSupportLayersGroupsAntropismo() {
      return _.sortBy(this.supportCategoryGroupsAntropismo, 'order');
    },

    showFeaturesAntropismo: {
      get() {
        return this.$store.state.supportLayers
          .showFeaturesSupportLayersAntropismo;
      },
      set(value) {
        this.$store.commit(
          'supportLayers/setshowFeaturesSupportLayersAntropismo',
          value,
        );
      },
    },

    showFeatures: {
      get() {
        return this.$store.state.supportLayers.showFeaturesSupportLayers;
      },
      set(value) {
        this.$store.commit(
          'supportLayers/setshowFeaturesSupportLayers',
          value,
        );
      },
    },

    ...mapState('supportLayers', [
      'supportCategoryGroupsBase',
      'showFeaturesSupportLayersAntropismo',
      'supportCategoryGroupsAntropismo',
      'loading',
      'showFeaturesSupportLayers',
    ]),
    ...mapState('supportLayersUser', ['supportLayerUser']),
    ...mapState('userProfile', ['user']),
  },

  methods: {
    disableAllLayers() {
      this.disableAllLayersVisible();
    },

    expandAllGroups() {
      this.setexpandAllLayers(true);
    },

    retractAllGroups() {
      this.setretractAllLayers(true);
    },

    clearInput() {
      this.retractAllGroups();
    },
    ...mapMutations('supportLayers', [
      'changeDisplayLayer',
      'setSearchLayer',
      'setFilteredLayers',
      'disableAllLayersVisible',
      'setexpandAllLayers',
      'setretractAllLayers',
    ]),
  },
};
</script>

<style scoped>
.options_buttons {
    margin-left: 50% !important;
}
.layers-tab {
  height: calc(100vh - 124px);
  overflow-y: auto !important;
}
.support-tab {
  overflow-y: hidden !important;
}
</style>
