<template>
  <div class="legend-container">
    <div
      v-for="(item, index) in legendItems"
      :key="index"
      class="legend-item"
    >
      <v-icon
        small
        :style="{ color: item.color }"
      >
        mdi-square
      </v-icon>
      <span class="legend-text">{{ item.label }}: {{ item.count }}%</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    legendItems: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="sass" scoped>
.legend-container
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 16px
  padding: 8px 0

.legend-item
  display: flex
  align-items: center
  font-size: 0.875rem

.legend-text
  margin-left: 4px
  white-space: nowrap
</style>
