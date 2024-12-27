<template>
  <v-list>
    <v-list-item
      v-for="(item, index) in legendItems"
      :key="index"
    >
      <v-list-item-content>
        <v-list-item-title>
          <v-icon
            medium
            :style="{ color: item.color }"
          >mdi-square</v-icon>
          {{ item.label }}: {{ item.count }}%
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  props: {
    legendItems: {
      type: Array,
      required: true
    }
  }
};
</script>
<style lang="sass" scoped>
  .theme--light.v-list
    background: transparent

  .v-list-item__title
    margin-bottom: 0 !important

  .chartjs-render-monitor
    height: 400px
</style>

