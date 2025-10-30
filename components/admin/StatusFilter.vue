<template>
  <div class="filter-container">
    <p class="text-uppercase">
      {{ $t('filterBy') }}
    </p>

    <v-row class="align-center">
      <v-col
        cols="12"
        md="9"
        class="d-flex flex-wrap"
      >
        <v-btn
          v-for="status in requestStatus"
          :key="status"
          outlined
          color="#5F5E5D"
          :class="['mr-2 mb-2', {'selected-status': isSelected(status)}]"
          @click="toggleStatus(status)"
        >
          {{ status }}{{
            status !== 'Em Andamento' &&
              status !== 'Em Desenvolvimento' &&
              status !== 'Aguardando Gestor' &&
              status !== 'Indeferido' ? 's' : ''
          }}
        </v-btn>
      </v-col>

      <v-col
        cols="12"
        md="3"
        class="text-md-right"
      >
        <v-btn
          outlined
          color="#D92B3F"
          class="mb-2 search-btn"
          @click="$emit('toggle-filters')"
        >
          <v-icon left>
            mdi-magnify
          </v-icon>
          {{ showFilters ? $t('hideSearch') : $t('search') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'StatusFilter',

  props: {
    requestStatus: {
      type: Array,
      required: true,
    },
    selectedStatus: {
      type: [String, Array],
      default: null,
    },
    showFilters: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    toggleStatus(status) {
      this.$emit('status-changed', status);
    },

    isSelected(status) {
      return Array.isArray(this.selectedStatus)
        ? this.selectedStatus.includes(status)
        : status === this.selectedStatus;
    },
  },
};
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

<style scoped>
.filter-container {
  position: relative;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.selected-status {
  background-color: #9A9997 !important;
  color: #FFFFFF !important;
}

.search-btn {
  min-width: 120px;
}

/* Small screens */
@media (max-width: 960px) {
  .filter-container {
    padding: 12px;
  }
}
</style>
