<template>
  <v-container class="pa-0">
    <div class="tab-header">
      <h4 class="subtitle-2 text-uppercase font-weight-regular">
        {{ $t('title') }}
      </h4>
    </div>
    <v-list>
      <v-list-group
        v-for="(layer, i) in layers"
        :key="i"
        active-class="active-class"
        color="rgba(17, 17, 17, 0.9)"
      >
        <template #activator>
          <v-list-item-title class="text-wrap">
            <span class="text-cursor">
              {{ layer.name }}
            </span>
          </v-list-item-title>
        </template>

        <AlgorithmLayerSubItem
          :layer="layer"
          :title="$t('process')"
          :index="i"
          type="button"
        />

        <v-list-group
          sub-group
          no-action
          active-class="active-class-subgroup"
          color="rgba(17, 17, 17, 0.9)"
        >
          <template #activator>
            <v-list-item-title class="text-wrap">
              <span class="text-cursor">
                {{ $t('processed') }}
              </span>
            </v-list-item-title>
          </template>
        </v-list-group>
      </v-list-group>
    </v-list>
  </v-container>
</template>

<i18n>
{
    "en": {
        "title": "Algorithms",
        "process": "Process Algorithm",
        "processed": "Processed"
    },
    "pt-br": {
        "title": "Algoritmos",
        "process": "Processar Algorítmo",
        "processed": "Processados"
    }
}
</i18n>

<script>
import { mapState, mapMutations } from 'vuex';
import AlgorithmLayerSubItem from '@/components/algorithms/AlgorithmLayerSubItem.vue';

export default {
  name: 'Algorithms',
  components: {
    AlgorithmLayerSubItem,
  },

  transition: 'scroll-y-transition',

  computed: {
    ...mapState('algorithms', ['layers']),
  },

  methods: {
    getPreview(layer) {
      return (
        'http://geoserver.xskylab.com:8080/geoserver/wms?REQUEST='
                + 'GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=40'
                + `&HEIGHT=40&LAYER=${
                  layer.layer}`
      );
    },

    toggleLayer(layer, index) {
      this.toggleLayerVisibility({
        id: index,
        visible: !layer.visible,
      });
    },

    ...mapMutations('algorithms', ['toggleLayerVisibility']),
  },
};
</script>

<style lang="sass">
.v-list-group--active
    // background-color: rgba(230,230,230)
    background-color: rgb(239, 241, 249)
    border-bottom: solid 1px rgba(0, 0, 0, 0.1)
    border-top: solid 1px rgba(0, 0, 0, 0.1)

.active-class
    // background-color: rgba(240,240,240)
    font-weight: bold
    border-top: solid 1px rgba(0, 0, 0, 0.1)
    color: rgba(17, 17, 17, 0.9) !important

.active-class-subgroup
    font-weight: bold
</style>
