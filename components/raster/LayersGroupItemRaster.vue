<template>
  <v-list-group
    v-if="layer"
    v-model="isOpen"
    append-icon=""
    active-class="active"
    :disabled="
      !(
        layer.layer_type === 'wms' &&
        (layer.visible || layer.wms.has_detail)
      )
    "
  >
    <template #activator>
      <v-list-item-content>
        <v-list-item-title class="text-wrap">
          <span class="text-cursor">
            {{ layer.name }}
          </span>
        </v-list-item-title>
      </v-list-item-content>

      <v-list-item-action @click.stop="">
        <v-switch
          :input-value="layer.visible"
          :loading="layer.loading"
          @change="toggleLayer"
        />
      </v-list-item-action>
    </template>

    <v-container class="py-0">
      <SupportLayerFilters :layer="layer" />

      <v-row
        v-if="
          layer.layer_type === 'wms' &&
            layer.visible &&
            layer.wms.has_opacity
        "
        class="black--text text--lighten-2"
        align="center"
      >
        <v-col cols="4">
          Opacidade
        </v-col>
        <v-col cols="8">
          <v-slider
            :value="layer.opacity"
            class="mb-n4"
            thumb-label
            @input="updateLayerOpacity($event)"
          />
        </v-col>
      </v-row>

      <v-row
        v-if="layer.layer_type === 'wms' && layer.wms.has_detail"
        justify="center"
        class=""
      >
        <v-col>
          <v-img
            contain
            :src="layerPreview"
            :lazy-src="layerPreview"
            :max-width="layer.wms.detail_width"
            position="center center"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-divider
      v-if="
        layer.layer_type === 'wms' &&
          layer.visible &&
          layer.wms.has_opacity
      "
    />
  </v-list-group>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import tmsLegend from '@/assets/tmsLegend.png';
import SupportLayerFilters from '@/components/raster/SupportLayerFilters';

export default {
  name: 'LayersGroupItemRaster',

  components: { SupportLayerFilters },

  props: {
    layerId: {
      type: Number,
      required: true,
    },

    hidePreview: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    isOpen: false,
  }),

  computed: {
    ...mapState('raster', ['supportLayersCategoryRaster']),

    layer() {
      return this.supportLayersCategoryRaster[this.layerId] || null;
    },

    layerPreview() {
      if (this.layer.layer_type === 'tms') return tmsLegend;

      return (
        this.layer.wms.geoserver.preview_url
                + this.layer.wms.geoserver_layer_name
      );
    },

    disabledHeatmap() {
      return (
        this.layer.filters.length > 0
                && this.layer.layer_type === 'heatmap'
                && Object.keys(this.layer.filters).length === 0
                && !this.layer.loading
      );
    },
  },

  methods: {
    toggleLayer() {
      this.toggleLayerVisibilityRaster({
        id: this.layerId,
        visible: !this.layer.visible,
      });

      this.isOpen = this.layer.visible;
      this.setshowFeaturesSupportLayersRaster(false);
      setTimeout(() => {
        this.setshowFeaturesSupportLayersRaster(true);
      }, 1);
    },

    updateLayerOpacity(opacity) {
      this.setLayerOpacityRaster({
        id: this.layerId,
        opacity,
      });
    },

    ...mapMutations('raster', [
      'toggleLayerVisibilityRaster',
      'setshowFeaturesSupportLayersRaster',
      'setLayerOpacityRaster',
    ]),
  },
};
</script>

<style lang="sass">
.v-list-group--active
  border-bottom: solid 0px black !important
  border-top: solid 0px black !important
</style>
