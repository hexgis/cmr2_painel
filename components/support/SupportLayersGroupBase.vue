<template>
  <v-list-group
    v-if="group && filteredSupportLayers.length > 0"
    v-model="isGroupOpen"
  >
    <template #activator>
      <v-list-item-content>
        <v-list-item-title class="text-wrap">
          <span class="text-cursor">
            {{ group.name }}
          </span>
        </v-list-item-title>
      </v-list-item-content>
    </template>

    <v-container class="py-0">
      <v-list expand>
        <template v-for="layer in filteredSupportLayers">
          <SupportLayersGroupItem
            :key="layer.layer_id"
            :layer-id="layer.layer"
          />
        </template>
      </v-list>
    </v-container>
    <v-divider />
  </v-list-group>
</template>

<script>
import { mapState } from 'vuex';
import SupportLayersGroupItem from './SupportLayersGroupItem.vue';

export default {
  name: 'SupportLayersGroupBase',

  components: { SupportLayersGroupItem },

  props: {
    group: {
      type: Object,
      default: null,
    },

    selectedLayers: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    isGroupOpen: false,
  }),

  computed: {
    supportLayers() {
      const group = this.supportCategoryGroupsBase[this.group.id];
      if (group && group.layers) {
        return group.layers;
      }
      return [];
    },

    orderedSupportLayers() {
      if (!this.supportLayers) return [];
        return [...this.supportLayers].sort((a, b) => {
     
      if (/terras ind[íi]genas/i.test(a.name)) return -1;
      if (/terras ind[íi]genas/i.test(b.name)) return 1;
     
      const getBufferSize = (name) => {
      const match = name.match(/buffer de ti\s*\(?\s*(\d+)\s*(km)?\s*\)?/i);
        return match ? parseInt(match[1]) : 0;
      };
      const aSize = getBufferSize(a.name);
      const bSize = getBufferSize(b.name);
     
      if (aSize && bSize) return aSize - bSize;
      if (aSize) return -1;
      if (bSize) return 1;
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
      });
    },

    filteredSupportLayers() {
      if (this.selectedLayers.length === 0) return this.orderedSupportLayers;
      return this.orderedSupportLayers.filter((layer) => this.selectedLayers.includes(layer.layer));
    },

    ...mapState('supportLayers', ['supportCategoryGroupsBase']),
  },

  watch: {
    selectedLayers() {
      this.isGroupOpen = this.selectedLayers.length > 0;
    },
  },
};
</script>
