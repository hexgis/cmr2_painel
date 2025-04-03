<template>
    <div class="filter">
        <v-checkbox
            v-model="filters.active"
            label="ATIVO"
            color="#5F5E5D"
            @change="emitFilters"
        ></v-checkbox>
        <v-checkbox
            v-model="filters.inactive"
            label="INATIVO"
            color="#5F5E5D"
            @change="emitFilters"
        ></v-checkbox>
        <v-divider vertical class="custom-divider"></v-divider>
        <v-checkbox
            v-model="filters.adm"
            label="ADM"
            color="#5F5E5D"
            @change="emitFilters"
        ></v-checkbox>
        <v-checkbox
            v-model="filters.common"
            label="COMUM"
            color="#5F5E5D"
            @change="emitFilters"
        ></v-checkbox>
        <!-- <v-card outlined class="custom-card">
          <v-card-title class="card-label">VISUALIZAR</v-card-title>
          <v-card-text class="mt-0 mb-0 pa-2">
              <v-btn>MODIFICADOS</v-btn>
              <v-btn>POR GRUPO</v-btn>
              <v-btn>POR INSTITUIÇÃO</v-btn>
          </v-card-text>
      </v-card> -->

        <!-- <v-btn
            outlined
            color="#D92B3F"
            @click="$emit('toggle-filters')"
            prepend-icon="mdi-magnify"
            class="search-btn"
        >
            <v-icon class="mr-2">mdi-magnify</v-icon>
            {{ showFilters ? $t('hideSearch') : $t('search') }}
        </v-btn> -->
    </div>
</template>

<i18n>
  {
      "en": {
          "search": "Search",
          "hideSearch": "Hide search"
      },
      "pt-br": {
          "search": "Pesquisar",
          "hideSearch": "Ocultar Pesquisa"
      }
  }
</i18n>

<script>
export default {
    name: 'StatusFilterUser',
    props: {
        showFilters: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            filters: {
                active: false,
                inactive: false,
                adm: false,
                common: false,
            },
        }
    },

    methods: {
        emitFilters() {
            this.$emit('filters-changed', this.filters)
        },
    },
}
</script>



<style lang="sass" scoped>
.filter
  display: flex
  align-items: center
  gap: 10px

.filter p
  margin: 0

.custom-card
  background: none
  position: relative

.card-label
  position: absolute
  top: -14px
  left: 16px
  background: #F8F8F8
  padding: 0 6px
  font-size: 14px
  color: #9C9C9C

.custom-divider
  max-height: 36px
  margin-top: 20px

.search-btn
  margin-left: auto
</style>