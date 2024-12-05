<template>
    <div class="d-flex">
      <v-tooltip
        right
        :disabled="isSearching"
      >
        <template #activator="{ on }">
          <v-btn
            fab
            ripple
            height="36"
            width="36"
            class="search-button"
            :loading="isLoading"
            v-on="on"
            @click.stop="isSearching = !isSearching"
          >
            <v-icon> mdi-magnify </v-icon>
          </v-btn>
        </template>
        <span> {{ $t('search-label') }} </span>
      </v-tooltip>
      <div class="search-input-container">
        <transition name="slide-x">
          <v-autocomplete
            v-if="isSearching"
            v-model="resultBounds"
            :label="$t('search-label')"
            :loading="isLoading"
            :items="searchResults"
            :search-input.sync="searchQuery"
            background-color="white"
            class="search-input"
            flat
            auto-select-first
            height="40px"
            hide-no-data
            hide-details
            item-text="label"
            item-value="bounds"
            solo
            @click.stop="searchQuery = ''"
          />
        </transition>
      </div>
    </div>
  </template>
  
  <i18n>
  {
      "en": {
          "search-label": "Search for a place or address"
      },
      "pt-br": {
          "search-label": "Pesquisar por endereço ou localidade"
      }
  }
  </i18n>
  
  <script>
  import { mapState, mapGetters } from 'vuex';
  
  let geosearch;
  if (typeof window !== 'undefined') {
    geosearch = require('leaflet-geosearch');
  }
  
  export default {
    name: 'MapSearch',
  
    props: {
      map: {
        type: Object,
        default: null,
      },
    },
  
    data: () => ({
      searchProvider: null,
      searchQuery: null,
      searchResults: [],
      showResults: false,
      isLoading: false,
      isSearching: false,
      resultBounds: null,
      searchTimeout: null,
    }),
  
    watch: {
      searchQuery() {
        if (!this.searchQuery || !(this.searchQuery.length > 4)) {
          this.searchResults = [];
          this.isLoading = false;
          return;
        }
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => this.searchOnProvider(), 1000);
      },
      resultBounds() {
        if (this.resultBounds) {
          const bounds = [
            [this.resultBounds[0][0], this.resultBounds[0][1]],
            [this.resultBounds[1][0], this.resultBounds[1][1]],
          ];
          this.map.flyToBounds(bounds);
        }
      },
    },
  
    created() {
      this.searchProvider = new geosearch.OpenStreetMapProvider({
        params: {
          viewbox: null,
        },
      });
    },
  
    computed: {
      ...mapState('map', ['bounds']),
      ...mapGetters('map', ['bbox']),
    },
  
    methods: {
      searchOnProvider() {
        this.searchProvider.options.params.viewbox = this.bbox;
        this.searchProvider
          .search({ query: this.searchQuery })
          .then((response) => (this.searchResults = response))
          .finally(() => (this.isLoading = false));
  
        this.isLoading = true;
        this.showResults = true;
      },
    },
  };
  </script>
  
  <style lang="sass">
  .search-button
      z-index: 5
  
  .search-input-container
      overflow: hidden
      margin-left: -20px !important
      height: 36px
      font-size: 20px
  
      .v-input__control
          min-height: 36px !important
  
  .search-input
  
      .v-input__slot
          padding-left: 30px !important
          border-radius: 0 40px 40px 0
          height: 36px !important
  
  .search-list
      margin-left: 30px
  
  .slide-x-enter-active, .slide-x-leave-active
      transition: all 0.6s ease
  
  .slide-x-enter, .slide-x-leave-to
      transform: translateX(-100%)
  </style>
  