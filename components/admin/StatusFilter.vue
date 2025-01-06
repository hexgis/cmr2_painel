<template>
  <div class="filter">
    <p class="text-uppercase">{{ $t('filterBy')}}</p>
    <v-btn
      v-for="status in requestStatus"
      :key="status"
      outlined
      color="#5F5E5D"
      @click="toggleStatus(status)"
      :style="getStatusButtonStyle(status)"
    >
      {{ status }}{{status !== 'Em Andamento'? 's' : ''}}
    </v-btn>
    <v-btn outlined color="#D92B3F" @click="$emit('toggle-filters')" prepend-icon="mdi-magnify">
      <v-icon class="mr-2">mdi-magnify</v-icon>
      {{ showFilters ? $t('hideSearch') : $t('search') }}
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'StatusFilter',
  props: {
    requestStatus: {
      type: Array,
      required: true
    },
    selectedStatus: {
      type: String,
      default: null
    },
    showFilters: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleStatus(status) {
      this.$emit('status-changed', status);
    },
    getStatusButtonStyle(status) {
      return {
        backgroundColor: status === this.selectedStatus ? '#9A9997' : '',
        color: status === this.selectedStatus ? '#FFFFFF' : '',
      };
    }
  }
}
</script>
<i18n>
  {
      "en": {
          "filterBy": "Filter by:",
          "search": "Search",
          "hideSearch": "Hide search"
      },
      "pt-br": {
          "filterBy": "Filtrar por:",
          "search": "Pesquisar",
          "hideSearch": "Ocultar Pesquisa"
      }
  }
</i18n>
<style lang="sass" scoped>
.filter
  position: relative

  & > button:last-child
    position: absolute
    right: 1rem

  & > button + button
    margin-left: 1rem


</style>
