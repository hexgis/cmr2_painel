<template>
  <span
    v-if="status"
    class="card--status"
    :style="{ background: statusBackground }"
  >{{ status }}</span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    status: {
      type: String,
    },
  },
  computed: {
    statusBackground() {
      const statusColors = {
        Concluído: '#12A844',
        Desenvolvido: '#1A535C',
        'Aguardando Gestor': '#D66A00',
        Deferido: '#FFCE03',
        'Em Andamento': '#F58A1F',
        'Em Desenvolvimento': '#F58A1F',
        Recusada: '#D92B3F',
        Recusado: '#D92B3F',
        Inviável: '#D92B3F',
        true: '#12A844',
        false: '#D92B3F',
      };
      return statusColors[this.status] || '#9A9997';
    },
  },
};
</script>
<style lang="sass" scoped>
.card
  &--status
    background: #F58A1F
    color: #FFFFFF
    font-weight: bold
    border-radius: 20px
    padding: 0.2rem 1rem
    float: right
</style>
