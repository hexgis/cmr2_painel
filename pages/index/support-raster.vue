<template>
  <v-container class="pa-0">
    <div class="tab-header justify-space-between">
      <v-row>
        <h4 class="subtitle-2 text-uppercase font-weight-regular">
          {{ $t('title') }}
        </h4>
        <v-tooltip>
          <template #activator="{ on }">
            <v-icon
              class="mr-2 ml-2"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            Fonte de dados: Geoserver - FUNAI
          </span>
        </v-tooltip>
      </v-row>
      <v-switch
        v-show="!loading"
        v-model="showFeatures"
        class="mt-n1 ml-5"
        hide-details
      />
    </div>
    <v-list
      v-if="!$fetchState.pending"
      expand
    >
      <template v-for="group in orderedSupportLayersGroups">
        <SupportLayersGroupRaster
          :key="group.id"
          :group="group"
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
    <v-container>
      <v-container>
        <v-footer
          absolute
          color="white"
          elevation="6"
          class="d-flex justify-center"
        >
          <v-img
            max-width="200"
            src="/img/logo-inteira-antiga.svg"
          />
        </v-footer>
      </v-container>
    </v-container>
  </v-container>
</template>

<i18n>
{
    "en": {

        "title": "High Resolution and Mosaics"
    },

    "pt-br": {
        "title": "Alta Resolução e Mosaicos"

    }
}
</i18n>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';

import SupportLayersGroupRaster from '@/components/support/SupportLayersGroupRaster';

export default {
  name: 'SupportRaster',

  components: { SupportLayersGroupRaster },

  transition: 'scroll-y-transition',

  async fetch() {
    if (!Object.keys(this.supportCategoryGroupsRaster).length) {
      await this.$store.dispatch('supportLayers/getCategoryGroupsRasters');
    }
  },

  computed: {
    orderedSupportLayersGroups() {
      return _.sortBy(this.supportCategoryGroupsRaster, 'order');
    },
    showFeatures: {
      get() {
        return this.$store.state.supportLayers.showFeaturesSupportLayersRaster;
      },
      set(value) {
        this.$store.commit(
          'supportLayers/setshowFeaturesSupportLayersRaster',
          value,
        );
      },
    },

    ...mapState('supportLayers', [
      'supportCategoryGroupsRaster',
      'loading',
      'showFeaturesSupportLayersRaster',
    ]),
  },
};
</script>

<style scoped></style>
