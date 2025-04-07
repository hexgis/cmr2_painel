<template>
  <v-container class="pa-0 fill-height align-start">
    <BaseExpandableTitle
      v-model="showFilters"
      :features="showFeatures"
      :has-results="!!results.length"
      @toggleFeatures="toggleFeatures()"
    >
      <template #title>
        {{ $t('title') }}
      </template>
      <template #filter>
        <WebhooksFilter @onSearch="showFilters = false" />
      </template>
    </BaseExpandableTitle>

    <div class="result-container fill-height">
      <WebhooksResultList />
    </div>
  </v-container>
</template>

<i18n>
{
    "en": {
        "title": "Add Webhook"
    },
    "pt-br": {
        "title": "Adicionar Webhook"
    }
}
</i18n>

<script>
import { mapState } from 'vuex';

import BaseExpandableTitle from '@/components/base/BaseExpandableTitle';
import WebhooksFilter from '@/components/webhooks/WebhooksFilter';
import WebhooksResultList from '~/components/webhooks/WebhooksResultList.vue';

export default {
  name: 'Webhooks',

  components: {
    BaseExpandableTitle,
    WebhooksFilter,
    WebhooksResultList,
  },

  transition: 'scroll-y-transition',

  data: () => ({
    showFilters: true,
  }),

  computed: mapState('webhooks', ['results', 'showFeatures']),
  methods: {
    toggleFeatures() {
      this.$store.commit('webhooks/setShowFeatures', !this.showFeatures);
    },
  },
};
</script>

<style scoped lang="sass">
.result-container
    margin-top: 64px
    height: calc(100% - 64px)
    width: 100%
    overflow-y: auto
</style>
