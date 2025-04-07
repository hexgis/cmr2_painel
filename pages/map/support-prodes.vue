<template>
  <v-container class="pa-0">
    <div class="tab-header ">
      <v-row>
        <h4 class="subtitle-2 text-uppercase font-weight-regular">
          {{ $t('title') }}
        </h4>
        <v-tooltip>
          <template #activator="{ on }">
            <v-icon
              class="ml-2"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            {{ $t('prodes-description-line1') }}
            <br>
            {{ $t('prodes-description-line2') }}
            <br>
            {{ $t('prodes-description-line3') }}
            <br>
            {{ $t('prodes-description-line4') }}
            <br>
            {{ $t('prodes-description-line5') }}
          </span>
        </v-tooltip>
      </v-row>
    </div>
    <v-list
      v-if="!$fetchState.pending"
      expand
    >
      <template v-for="group in orderedSupportLayersGroups">
        <SupportLayersGroupProdes
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

  </v-container>
</template>

<i18n>
{
    "en": {
        "title": "Layer Prodes (INPE)",
        "prodes-description-line1": "PRODES is a project that uses",
        "prodes-description-line2": "the Landsat, CBERS, and IRS-2 satellites,",
        "prodes-description-line3": "and detects areas larger than 6.25 ha.",
        "prodes-description-line4": "The detections covered by PRODES",
        "prodes-description-line5": "start from the year 2005."
    },
    "pt-br": {
        "title": "Camada Prodes (INPE)",
        "prodes-description-line1": "PRODES é um projeto que utiliza os",
        "prodes-description-line2": "satélites Landsat, CBERS e IRS-2,",
        "prodes-description-line3": "e detecta áreas maiores que 6,25 ha.",
        "prodes-description-line4": "As detecções contempladas pelo PRODES",
        "prodes-description-line5": "são a partir do ano de 2005."
    }
}
</i18n>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';

import SupportLayersGroupProdes from '@/components/support/SupportLayersGroupProdes';

export default {
  name: 'SupportProdes',

  components: { SupportLayersGroupProdes },

  transition: 'scroll-y-transition',

  async fetch() {
    if (!Object.keys(this.supportCategoryGroupsProdes).length) {
      await this.$store.dispatch('supportLayers/getCategoryGroupsProdes');
    }
  },

  computed: {
    orderedSupportLayersGroups() {
      return _.sortBy(this.supportCategoryGroupsProdes, 'order');
    },
    showFeatures: {
      get() {
        return this.$store.state.supportLayers.showFeaturesSupportLayersProdes;
      },
      set(value) {
        this.$store.commit(
          'supportLayers/setshowFeaturesSupportLayersProdes',
          value,
        );
      },
    },

    ...mapState('supportLayers', [
      'supportCategoryGroupsProdes',
      'loading',
      'showFeaturesSupportLayersProdes',
    ]),
  },
};
</script>

<style scoped></style>
