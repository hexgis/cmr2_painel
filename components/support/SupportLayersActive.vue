<template>
  <v-list-group v-if="concatenatedLayers.length || concatenatedUserLayers.length">
    <template #activator >
      <v-list-item-content>
        <v-list-item-title class="text-wrap">
          <span class="text-cursor">
            {{ $t('title') }}
          </span>
        </v-list-item-title>
      </v-list-item-content>
    </template>
    <v-container class="py-0 my-0">
      <template v-if="Object.keys(supportLayerUser).length">
        <div v-if="concatenatedUserLayers.length" class="text-layer mt-2">
          {{ $t('user-active-layers') }}
        </div>
        <v-list expand>
          <draggable v-bind="dragOptions" v-model="concatenatedUserLayers" @change="onUserDragChange">
            <template v-for="layer in concatenatedUserLayers">
              <v-row :key="layer.id" v-if="layer.visible" style="flex-wrap: nowrap;" no-gutters align="center" class="image-container">
                <v-icon style="font-size: 1rem;">mdi-arrow-split-horizontal</v-icon>
                <img v-if="layer.wms" :src="layer.wms.geoserver.preview_url + layer.wms.geoserver_layer_name" class="layer-thumbnail" alt="UserLayer">
                <v-icon v-else style="font-size: 40px;" class="mr-2" :color="layer.properties?.color || layer.color">
                  mdi-square
                </v-icon>
                <span class="ml-1">
                  <p>{{ layer.name }}</p>
                </span>
              </v-row>
            </template>
          </draggable>
        </v-list>
      </template>
    </v-container>
    <v-container class="py-0 my-0">
      <template v-if="Object.keys(supportLayerUser).length">
        <div v-if="concatenatedLayers.length" class="text-layer">
          {{ $t('support-active-layers') }}
        </div>
        <v-list expand>
          <draggable v-bind="dragOptions" v-model="concatenatedLayers" @change="onDragChange">
          <template v-for="layer in concatenatedLayers">
              <v-row :key="layer.id" v-if="layer.visible" style="flex-wrap: nowrap;" no-gutters align="center" class="image-container">
                <v-icon style="font-size: 1rem;">mdi-arrow-split-horizontal</v-icon>
                <img v-if="layer.wms" :src="layer.wms.geoserver.preview_url + layer.wms.geoserver_layer_name" class="layer-thumbnail" alt="CorLayer">
                <v-icon v-else style="font-size: 40px;" class="mr-2" :color="layer.properties?.color || layer.color">
                  mdi-square
                </v-icon>
                <span class="ml-1">
                  <p>{{ layer.name }}</p>
                </span>
              </v-row>
            </template>
          </draggable>
        </v-list>
      </template>
    </v-container>

    <v-divider />
  </v-list-group>
</template>
<i18n>
  {
      "en": {
          "title": "Active Layers",
          "user-active-layers": "User active layers",
          "support-active-layers": "Support active layers"
      },
      "pt-br": {
          "title": "Camadas Ativas",
          "user-active-layers": "Camadas do Usuário ativas",
          "support-active-layers": "Camadas de Sobreposição ativas"
      }
  }
  </i18n>
<script>
import draggable from 'vuedraggable';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'SupportUser',

  components: { draggable },

  async fetch() {
    if (!Object.keys(this.supportLayerUser).length && this.user) {
      await this.$store.dispatch('supportLayersUser/getLayersUser');
    }
  },
  data() {
    return {
      concatenatedLayers: [],
      concatenatedUserLayers: [],
      reordenatedLayers: [],
      reordenatedUserLayers: []
    };
  },
  computed: {
    ...mapState('supportLayersUser', ['supportLayerUser']),
    ...mapState('supportLayers', ['supportLayers', 'orderedLayers']),
    ...mapState('monitoring', ['selectedStages', 'showFeaturesMonitoring']),
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      };
    }
  },
  watch: {
    hasAddLayer: {
      deep: true,
      handler(newLayer) {
        if (newLayer) {
          this.getInfo();
        }
      },
    },
    supportLayers: {
      handler: 'updateConcatenatedLayers',
      deep: true,
    },
    supportLayerUser: {
      handler: 'updateConcatenatedUserLayers',
      deep: true,
    },
    activeMonitoringLabel: {
      handler: 'updateConcatenatedLayers',
      deep: true,
    },
    reordenatedLayers: {
      handler(activeLayers){
        this.handleListSupportLayers(activeLayers)
      } ,
      deep: true,
    },
    reordenatedUserLayers: {
      handler(activeLayers){
        this.handleListSupportLayers(activeLayers)
      } ,
      deep: true,
    }
  },
  created() {
    this.getInfo();
    this.updateConcatenatedLayers();
    this.updateConcatenatedUserLayers();
  },
  methods: {
    async getInfo() {
      await this.$store.dispatch('supportLayersUser/getLayersUser');
      this.setHasLayer(false);
    },
    ...mapMutations('map', ['setHasLayer']),

    updateConcatenatedLayers() {
      const visibleSupportLayers = this.supportLayers ? Object.values(this.supportLayers).filter(layer => layer.visible) : [];
      const visibleActiveMonitoring = this.activeMonitoringLabel ? Object.values(this.activeMonitoringLabel).filter(layer => layer.visible) : [];

      this.$nextTick(() => {
      this.concatenatedLayers = [
        ...visibleSupportLayers,
        ...visibleActiveMonitoring
      ]})
    },

    updateConcatenatedUserLayers() {
      const visibleUserLayers = this.supportLayerUser ? Object.values(this.supportLayerUser).filter(layer => layer.visible) : [];
      this.$nextTick(() => {
        this.concatenatedUserLayers = [...visibleUserLayers];
      })
    },

    onDragChange() {
      this.reordenatedLayers = [...this.concatenatedLayers];
      this.reordenatedUserLayers = [...this.concatenatedUserLayers];
      this.handleRemoveSupportLayers(this.reordenatedLayers);
      this.handleAddSupportLayers(this.reordenatedLayers);
    },

    onUserDragChange() {
      this.reordenatedLayers = [...this.concatenatedLayers];
      this.reordenatedUserLayers = [...this.concatenatedUserLayers];
      this.handleRemoveSupportLayers(this.reordenatedUserLayers);
      this.handleAddSupportLayers(this.reordenatedUserLayers);
    },

    handleRemoveSupportLayers(orderedLayers) {
      this.$store.dispatch('supportLayers/removeSupportLayers', {
        concatenatedLayers: orderedLayers
      });
    },

    handleAddSupportLayers(orderedLayers) {
      this.$nextTick(() => {
        this.concatenatedLayers = [...this.reordenatedLayers]
        this.concatenatedUserLayers = [...this.reordenatedUserLayers]
      })
      this.$store.dispatch('supportLayers/addSupportLayers', {
        layers: orderedLayers
      });
    },

    handleListSupportLayers(activeLayers){
      if (activeLayers === this.concatenatedLayers){
        this.handleAddSupportLayers(this.reordenatedLayers)
        this.handleAddSupportLayers(this.reordenatedUserLayers)
      }
      this.$nextTick(() => {
        this.concatenatedLayers = [...this.reordenatedLayers]
        this.concatenatedUserLayers = [...this.reordenatedUserLayers]
      })
    }
  }
};
</script>

<style scoped lang="sass">
.text-layer
  font-size: 12px
  padding: 6px
  margin: 4px 6px 4px 0
  text-align: justify
  background: #d7dae766

.image-container
  cursor: move

.v-application p
  margin-bottom: 0

.ghost
  opacity: 0.3
  background: #d92b3f40

</style>
