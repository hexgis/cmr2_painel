<template>
  <div>
    <v-row v-if="isActiveLayer" no-gutters align="center" class="image-container">
      <svg v-if="isUserLayer && layerType(layers)" class="layer-thumbnail" id="Layer_1" style="enable-background:new 0 0 91 91;" version="1.1" viewBox="0 0 91 91" xml:space="preserve"
        xmlns="http://www.w3.org/2000/svg">
        <g>
          <path
            d="M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z
                    M37,41.4c0-5.2,4.3-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5c0,5.2-4.2,9.5-9.5,9.5C41.3,50.9,37,46.6,37,41.4z"
            :fill="layers.properties?.color || layers.color"
            :stroke="layers.properties?.color || layers.color" stroke-width="2"
          />
        </g>
      </svg>
      <v-icon
        v-else-if="!layers.wms"
        :color="layers.properties?.color || layers.color"
        size="x-small"
        class="layer-thumbnail">
        mdi-square
      </v-icon>
      <img
        v-else-if="vectorImage(layers)"
        :src="`data:image/png;base64,${vectorImage(layers)}`"
        class="layer-thumbnail"
        alt="CorLayer">
      <img v-else
        :src="layers.wms.geoserver.preview_url + layers.wms.geoserver_layer_name"
        :class="prodes ? 'prodes-thumbnail' : 'layer-thumbnail'"
        alt="Layer Image" />
      <v-col>
        <p class="ml-1">{{ layers.name }}</p>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    layers: {
      type: [Array, Object],
      required: true
    },
    monitoring: {
      type: Boolean
    },
    prodes: {
      type: Boolean
    },
    isUserLayer: {
      type: Boolean
    }
  },
 
  computed: {
    isActiveLayer() {
      if (this.monitoring) {
        return true
      }
      return this.layers.visible || this.layers.active;
      
    },
   
  },
  
  methods: {
    vectorImage(layers) {
      return layers.vector?.thumbnail_blob || layers.vector?.image;
    },
    layerType(layer){
      return layer.geometry.features[0].geometry.type === 'Point'
    },
  }
}
</script>

<style scoped lang="sass">
.layer-thumbnail
  width: 15px
  height: 15px

.prodes-thumbnail
  width: 30px
  height: auto
  margin-left: 5px

p
  font-size: xx-small
  margin: 0

.image-container
    width: 100%

.row
  margin: 0!important
</style>
