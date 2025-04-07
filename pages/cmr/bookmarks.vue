<template>
  <v-container class="pa-0">
    <div class="tab-header justify-space-between">
      <h4 class="subtitle-2 text-uppercase font-weight-regular">
        {{ $t('title') }}
      </h4>
    </div>

    <BookmarkSaveAction />

    <v-list
      v-if="!loading"
      expand
    >
      <BookmarkListItem
        v-for="(bookmark, i) in bookmarks"
        :key="i"
        :bookmark="bookmark"
        :index="i"
        @fetch="$fetch"
      />
    </v-list>
    <div v-if="loading">
      <template v-for="i in 5">
        <v-skeleton-loader
          :key="i"
          type="text"
          class="mx-4 my-5"
        />
      </template>
    </div>
  </v-container>
</template>

<i18n>
{
    "en": {
        "title": "Bookmarks"
    },
    "pt-br": {
        "title": "Bookmarks"
    }
}
</i18n>

<script>
import { mapState, mapActions } from 'vuex';

import BookmarkSaveAction from '@/components/bookmarks/BookmarkSaveAction';
import BookmarkListItem from '@/components/bookmarks/BookmarkListItem';

export default {
  name: 'Bookmarks',

  components: {
    BookmarkSaveAction,
    BookmarkListItem,
  },

  transition: 'scroll-y-transition',

  async fetch() {
    if (!this.bookmarks.length) {
      this.getBookmarks();
    }

    if (!Object.keys(this.supportLayers).length) {
      await this.$store.dispatch('supportLayers/getLayersGroups');
    }
  },

  computed: {
    ...mapState('bookmarks', ['bookmarks', 'loading']),
    ...mapState('supportLayers', ['supportLayers']),
  },

  methods: mapActions('bookmarks', ['getBookmarks']),
};
</script>
