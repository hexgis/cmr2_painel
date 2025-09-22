<template>
  <div
    class="loading-container"
    :style="{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      padding: '20px',
      textAlign: 'center'
    }"
  >
    <v-progress-circular
      indeterminate
      :color="color"
      :size="size"
    />
    <p
      v-if="message"
      class="mt-3 mb-0"
    >
      {{ message }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'LoadingState',

  props: {
    message: {
      type: String,
      default: 'Carregando...',
    },
    color: {
      type: String,
      default: 'primary',
    },
    size: {
      type: [String, Number],
      default: 40,
    },
  },
};
</script>

<style scoped>
.loading-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
