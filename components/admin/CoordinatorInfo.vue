<template>
  <div v-if="coordinator">
    <p class="light--text">{{ $t('coordinator') }}</p>
    <p class="font-weight-bold">{{ coordinator.coordinator_name }}</p>
    <p>{{ coordinator.coordinator_email }}</p>
  </div>
</template>
<i18n>
  {
      "en": {
          "coordinator": "Coordinador"
      },
      "pt-br": {
          "coordinator": "Coordenador"
      }
  }
</i18n>
<script>
export default {
  name: 'CoordinatorInfo',
  props: {
    coordinator: {
      type: Object,
      default: null,
    },
  },
};
</script>
<style lang="sass" scoped>
p
  margin: 0

.light--text
  color: #9A9997
  font-size: 12px

</style>
