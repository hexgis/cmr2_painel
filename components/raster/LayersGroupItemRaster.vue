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

      <v-list-item-action
        v-if="layer.visible"
        @click.stop=""
      >
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              small
              :color="isSelected ? 'red' : 'grey'"
              :disabled="disabled"
              v-on="on"
              @click="compareLayer"
            >
              <v-icon>mdi-compare</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('compare-label') }}</span>
        </v-tooltip>
      </v-list-item-action>

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

<i18n>
{
  "en": {
    "compare-label": "Compare layer",
    "first-layer-selected": "First layer selected for comparison. Select another layer to compare.",
    "second-layer-selected": "Second layer selected! Click 'Compare' again to cancel selection.",
    "layer-deselected": "Layer removed from comparison.",
    "comparison-ready": "Two layers selected! The comparison dialog will open shortly."
  },
  "pt-br": {
    "compare-label": "Comparar camada",
    "first-layer-selected": "Primeira camada selecionada. Selecione outra para comparar.",
    "second-layer-selected": "Segunda camada selecionada! Clique novamente para cancelar.",
    "layer-deselected": "Camada removida da comparação.",
    "comparison-ready": "Duas camadas selecionadas! O diálogo será aberto em breve."
  }
}
</i18n>

<script>
import { mapState, mapMutations } from 'vuex';
import tmsLegend from '../../assets/tmsLegend.png';
import SupportLayerFilters from './SupportLayerFilters.vue';

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
    ...mapState('raster', ['supportLayersCategoryRaster', 'layersToCompare']),

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

    isSelected() {
      const isLeft = this.layersToCompare.left && this.layersToCompare.left.id === this.layerId;
      const isRight = this.layersToCompare.right && this.layersToCompare.right.id === this.layerId;
      return isLeft || isRight;
    },

    disabled() {
      const hasLeft = this.layersToCompare.left !== null;
      const hasRight = this.layersToCompare.right !== null;
      const bothSelected = hasLeft && hasRight;
      const isCurrentSelected = this.isSelected;

      // Só desabilita se ambas as posições estão ocupadas E esta camada não está selecionada
      return bothSelected && !isCurrentSelected;
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

    compareLayer() {
      const wasSelected = this.isSelected;

      // Execute the mutation first
      this.setLayerToCompare(this.layer);

      // Wait for next tick to get updated state
      this.$nextTick(() => {
        const hasLeft = this.layersToCompare.left !== null;
        const hasRight = this.layersToCompare.right !== null;
        const bothSelected = hasLeft && hasRight;

        let message = '';
        let color = 'info';

        if (wasSelected) {
          // Layer was deselected
          message = this.$t('layer-deselected');
          color = 'warning';
        } else if (bothSelected) {
          // Two layers are now selected
          message = this.$t('comparison-ready');
          color = 'success';
          // Open the comparison modal
          this.$store.commit('raster/setOpenCompare', true);
        } else if (hasLeft || hasRight) {
          // First layer selected
          message = this.$t('first-layer-selected');
          color = 'info';
        }

        if (message) {
          this.showNotification(message, color);
        }
      });
    },

    showNotification(message, color = 'info') {
      // Emit event to parent to show notification
      this.$emit('show-notification', { message, color });

      // Also try to show via global snackbar if available
      if (this.$store.commit) {
        try {
          this.$store.commit('alert/addAlert', {
            message,
            type: color,
            timeout: 4000,
          });
        } catch (error) {
          // Fallback to console if alert store doesn't exist
          console.log(`[${color.toUpperCase()}] ${message}`);
        }
      }
    },

    ...mapMutations('raster', [
      'toggleLayerVisibilityRaster',
      'setshowFeaturesSupportLayersRaster',
      'setLayerOpacityRaster',
      'setLayerToCompare',
    ]),
  },
};
</script>

<style lang="sass">
.v-list-group--active
  border-bottom: solid 0px black !important
  border-top: solid 0px black !important
</style>
