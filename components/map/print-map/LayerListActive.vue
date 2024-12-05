<template>
  <div>
    <LayerItem
      v-for="layer in layers"
      :key="layer.id"
      :layers="layer"
      :monitoring=monitoring
      :prodes="prodes"
      :isUserLayer="isUserLayer"
    />
  </div>
</template>

<script>
import LayerItem from './LayerItemActive.vue';

export default {
  components: {
    LayerItem
  },
  props: {
    layers: {
      type: [Array, Object],
      required: true
    },
    monitoring:{
      type: Boolean
    },
    prodes:{
      type: Boolean
    },
    isUserLayer:{
      type: Boolean
    }
  },
}
</script>
<style scoped lang="sass">
p
  font-size: xx-small
  margin: 0

.image-container
    width: 100%

.row
  margin: 0!important
</style>
