<template>
  <v-list-group
    v-if="group && (isPlanet ? group.name.includes('Planet') : !group.name.includes('Planet'))"
    v-show="checkSearchLayer()"
    v-model="value"
  >
    <template #activator>
      <template v-if="activeLayerCount > 0">
        <v-badge
          color="#b2b1b1"
          offset-x="-270"
          offset-y="10"
        >
          <template #badge>
            {{ activeLayerCount }}
          </template>
        </v-badge>
      </template>
      <v-list-item-content>
        <v-list-item-title class="text-wrap">
          <span class="text-cursor">
            {{ group.name }}
          </span>
        </v-list-item-title>
      </v-list-item-content>

      <v-col
        v-if="group.name === 'Alta Resolução' && !isPlanet"
        cols="1"
      >
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-icon
              class="pb-4"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            {{ $t('mosaic-line-1') }}
            <br>
            {{ $t('mosaic-line-2') }}
            <br>
            {{ $t('mosaic-line-3') }}
            <br>
            {{ $t('mosaic-line-4') }}
            <br>
          </span>
        </v-tooltip>
      </v-col>
    </template>

    <template v-if="!searchLayer">
      <v-container class="py-0">
        <v-list expand>
          <LayersGroupItemRaster
            v-for="layer in orderedSupportLayers"
            :key="layer"
            :layer-id="layer"
          />
        </v-list>
      </v-container>
    </template>

    <template v-else>
      <v-container class="py-0">
        <v-list expand>
          <template v-for="layer in orderedSupportLayers">
            <LayersGroupItemRaster
              v-if="includesLayers(layer)"
              :key="layer"
              :layer-id="layer"
            />
          </template>
        </v-list>
      </v-container>
    </template>
    <v-divider />
  </v-list-group>
</template>
<i18n>
  {
      "en": {
        "mosaic-line-1": "The high-resolution image mosaic",
        "mosaic-line-2": "is composed of images from the Spot 6 and 7 satellites,",
        "mosaic-line-3": "with a spatial resolution of 1.5 meters,",
        "mosaic-line-4": "covering dates between the years 2018 and 2019."
      },
      "pt-br": {
        "mosaic-line-1": "O mosaico de imagens de alta resolução",
        "mosaic-line-2": "é formado por imagens dos satélites Spot 6 e 7,",
        "mosaic-line-3": "com uma resolução espacial de 1,5 metros,",
        "mosaic-line-4": "abrangendo datas entre os anos de 2018 e 2019."
      }
  }
</i18n>
<script>
import { mapState, mapMutations } from 'vuex';
import _ from 'lodash';
import LayersGroupItemRaster from '@/components/raster/LayersGroupItemRaster';

export default {
  name: 'LayersGroupRaster',

  components: { LayersGroupItemRaster },

  props: {
    group: {
      type: Object,
      default: null,
    },
    isPlanet: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    value: null,
  }),

  computed: {
    supportLayers() {
      return this.supportCategoryGroupsRaster[this.group.id].layers;
    },

    orderedSupportLayers() {
      return _.sortBy(this.supportLayers, 'order');
    },

    activeLayers() {
      return this.orderedSupportLayers.filter(
        (layer) => this.supportLayersCategoryRaster[layer].visible,
      );
    },

    activeLayerCount() {
      return this.activeLayers.length;
    },

    ...mapState('supportLayers', [
      'supportCategoryGroupsRaster',
      'searchLayer',
      'filteredLayersId',
      'supportLayersCategoryRaster',
    ]),
  },

  methods: {
    checkSearchLayer() {
      if (this.searchLayer) {
        this.value = true;
      }
      return true;
    },

    includesLayers(id) {
      return this.filteredLayersId.includes(id);
    },

    ...mapMutations('supportLayers', [
      'setexpandAllLayers',
      'setretractAllLayers',
    ]),
  },
};
</script>
