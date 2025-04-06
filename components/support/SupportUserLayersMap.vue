<template>
  <l-layer-group :visible="showFeaturesSupportLayers">
    <template v-for="layer in supportLayerUser">
      <SupportUserLayersItem
        :key="layer.id"
        :layer="layer"
      />
    </template>
  </l-layer-group>
</template>

<script>
import { mapState } from 'vuex';

import SupportUserLayersItem from '@/components/support/SupportUserLayersItem';

export default {
  name: 'SupportUserLayersMap',

  components: {
    SupportUserLayersItem,
  },

  computed: {
    ...mapState('supportLayersUser', ['supportLayerUser']),
    ...mapState('supportLayers', ['supportLayers', 'showFeatures', 'showFeaturesSupportLayers']),
    ...mapState('map', ['hasAddLayer']),
  },
};
</script>
