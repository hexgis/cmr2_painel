<template>
  <div class="ticket-details">
    <span class="d-flex justify-space-between align-center">
      <h1>{{ $t('criticismsSuggestions') }}</h1>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            color="primary"
            text
            v-bind="attrs"
            v-on="on"
            @click="$router.push('/cmr')"
          >
            <v-icon color="primary">mdi-home</v-icon>
          </v-btn>
        </template>
        <span>Ir para o CMR</span>
      </v-tooltip>
    </span>
    <TicketDetails :card-id="cardId" />
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
import TicketDetails from '/components/admin/TicketDetails.vue';

export default {
  components: {
    TicketDetails,
  },
  layout: 'admin',
  async asyncData({ params }) {
    const { cardId } = params;
    return { cardId };
  },
  data() {
    return {
      cardDetails: null,
    };
  },
  mounted() {
    this.cardDetails = this.$route.params.cardId;
  },
};

</script>

<style lang="sass" scoped>
.ticket-details
  height: 100vh
  overflow-y: auto
  width: 100%
  padding: 2rem
</style>
