<template>
  <span class="d-flex align-start">
    <v-icon :style="{color: statusBackground }" size="35">mdi-alert-octagram</v-icon>
    <span class="ml-2">
      <p class="light--text ma-0">{{ $t('priority') }}</p>
      <p><strong>{{ priority }}</strong></p>
    </span>
  </span>
</template>
<i18n>
  {
      "en": {
          "priority": "Priority"
      },
      "pt-br": {
          "priority": "Prioridade"
      }
  }
</i18n>
<script>
export default {
  props: {
    priority: {
      type: String,
      default: 'Baixa'
    }
  },
  computed:{
    statusBackground() {
      switch (this.priority) {
        case 'Baixa':
          return '#12A844'
        case 'Média':
          return '#FFCE03'
        case 'Alta':
          return '#D92B3F'
        default:
          return '#9A9997'
      }
    },
  }
}
</script>

<style lang="sass">
.light--text
  color: #9A9997
  font-size: 12px
</style>
