<template>
  <l-layer-group
    name="supportLayersRaster"
    :visible="showFeaturesSupportLayersRaster"
  >
    <template v-for="layer in supportLayersCategoryRaster">
      <SupportLayerItem
        :key="layer.id"
        :layer="layer"
      />
    </template>
  </l-layer-group>
</template>

<script>
import { mapState } from 'vuex';

import SupportLayerItem from './SupportLayerItem';

export default {
  name: 'LayersRaster',

  components: {
    SupportLayerItem,
  },

  computed: mapState('supportLayers', [
    'supportLayers',
    'showFeaturesSupportLayersRaster',
    'supportLayersCategoryRaster',
  ]),
};
</script>
