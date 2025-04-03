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
import _ from 'lodash';

import SupportLayersGroupItem from '@/components/support/SupportLayersGroupItem';

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

  watch: {
    selectedLayers() {
      this.isGroupOpen = this.selectedLayers.length > 0
    },
  },

  computed: {
    supportLayers() {
      const group = this.supportCategoryGroupsBase[this.group.id]
        if (group && group.layers) {
          return group.layers
        }
        return []
    },

    orderedSupportLayers() {
      if (!this.supportLayers) return [];
      return [...this.supportLayers].sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
      );
    },

    filteredSupportLayers() {
      if (this.selectedLayers.length === 0) {
        return this.orderedSupportLayers
      }
      return this.orderedSupportLayers.filter((layer) =>
        this.selectedLayers.includes(layer.layer)
      )
    },

    ...mapState('supportLayers', ['supportCategoryGroupsBase']),
  },
};
</script>
