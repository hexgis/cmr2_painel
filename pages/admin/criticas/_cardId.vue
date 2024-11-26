<template>
  <div class="ticket-details">
    <span class="d-flex justify-space-between align-center">
      <h1>{{ $t('criticismsSuggestions') }}</h1>
      <v-btn color="primary" text @click="$router.back()">
        <v-icon color="primary">mdi-keyboard-backspace</v-icon>
      </v-btn>
    </span>
    <TicketDetails :cardId="cardId" />
  </div>

</template>
<i18n>{
  "en": {
    "criticismsSuggestions": "Criticisms and Suggestions"
  },
  "pt-br": {
    "criticismsSuggestions": "Críticas e Sugestões"
  }
}</i18n>
<script>
import TicketDetails from '/components/admin/TicketDetails.vue'

export default {
  layout: 'admin',
  components:{
    TicketDetails
  },
  async asyncData({ params }) {
    const cardId = params.cardId;
    return { cardId };
  },
  data() {
    return {
      cardDetails: null,
    };
  },
  mounted() {
    this.cardDetails = this.$route.params.cardId;
  }
};

</script>

<style lang="sass" scoped>
.ticket-details
  height: 100vh
  overflow-y: auto
  width: 100%
  padding: 2rem
</style>
