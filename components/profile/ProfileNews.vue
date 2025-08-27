<template>
  <v-dialog
    v-model="newsDialog"
    width="800"
    persistent
    content-class="fixed-size-dialog"
  >
    <v-card class="dialog-card">
      <v-toolbar
        color="primary"
        dark
        dense
      >
        <v-toolbar-title>
          {{ $t('news.title') }}
        </v-toolbar-title>
        <v-spacer />
        <v-checkbox
          v-if="hasUnreadNews"
          v-model="allReadChecked"
          :label="$t('news.markAllAsRead')"
          color="green"
          hide-details
          class="mr-2 mt-1 mark-all-checkbox"
          @change="markAllAsRead"
        >
          <template #label>
            <span style="color: white">{{ $t('news.markAllAsRead') }}</span>
          </template>
        </v-checkbox>
        <v-btn
          icon
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-0">
        <v-carousel
          v-model="carouselIndex"
          reverse
          height="60vh"
          :show-arrows="false"
          hide-delimiters
          delimiter-icon="mdi-circle"
        >
          <v-carousel-item
            v-for="news in displayedNews"
            :key="news.id"
          >
            <div class="news-content-wrapper">
              <div class="news-content">
                <h2>
                  {{ news.page.title }}
                  <v-chip
                    v-if="isNewsRead(news.id)"
                    small
                    color="green lighten-4"
                    text-color="green darken-2"
                    class="ml-2"
                  >
                    <v-icon
                      left
                      small
                    >
                      mdi-check
                    </v-icon>
                    {{ $t('news.read') }}
                  </v-chip>
                </h2>
                <div class="d-flex justify-end px-14">
                  <v-switch
                    v-if="!isNewsRead(news.id)"
                    :label="$t('news.markAsRead')"
                    color="green"
                    hide-details
                    class="mt-n10"
                    @change="updateReadStatus(news.id, $event)"
                  />
                </div>
                <p>
                  {{ formatDate(news.page.description) }}
                </p>

                <div class="scrollable-content">
                  <!-- Passar a propriedade components para o MarkdownRenderer -->
                  <MarkdownRenderer :components="news.page.components" />
                </div>
              </div>
            </div>
          </v-carousel-item>
        </v-carousel>
      </v-card-text>
      <v-card-actions class="navigation-actions">
        <v-btn
          color="#d92b3f"
          text
          :disabled="nextDisabled"
          @click="carouselIndex++"
        >
          <v-icon left>
            mdi-chevron-left
          </v-icon>
          {{ $t('news.next') }}
        </v-btn>

        <v-spacer />

        <v-btn
          color="#d92b3f"
          text
          :disabled="prevDisabled"
          @click="carouselIndex--"
        >
          {{ $t('news.previous') }}
          <v-icon right>
            mdi-chevron-right
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<i18n>
{
  "en": {
    "news": {
      "title": "News",
      "markAsRead": "Mark as Read",
      "markAllAsRead": "Mark all as read",
      "read": "Read",
      "close": "Close",
      "previous": "Previous",
      "next": "Next"
    }
  },
  "pt-br": {
    "news": {
      "title": "Novidades",
      "markAsRead": "Marcar como lida",
      "markAllAsRead": "Marcar todas como lidas",
      "read": "Notícia lida",
      "close": "Fechar",
      "previous": "Próxima novidade",
      "next": "Novidade anterior"
    }
  }
}
</i18n>

<script>
import {
  mapState, mapGetters, mapActions, mapMutations,
} from 'vuex';
import MarkdownRenderer from './MarkdownRenderer.vue';

export default {
  name: 'ProfileNews',

  components: {
    MarkdownRenderer,
  },

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    showAllNews: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapState('userProfile', ['news']),
    ...mapGetters('userProfile', [
      'displayedNews',
      'hasUnreadNews',
      'prevDisabled',
      'nextDisabled',
      'isNewsRead',
    ]),

    newsDialog: {
      get() {
        return this.news.dialog;
      },
      set(value) {
        this.setNewsDialog(value);
      },
    },

    carouselIndex: {
      get() {
        return this.news.carouselIndex;
      },
      set(value) {
        this.setCarouselIndex(value);
      },
    },

    allReadChecked: {
      get() {
        return this.news.allReadChecked;
      },
      set(value) {
        this.setAllReadChecked(value);
      },
    },
  },

  watch: {
    value(newVal) {
      if (newVal) {
        this.openNewsDialog(this.showAllNews);
      } else {
        this.closeNewsDialog();
      }
    },

    newsDialog(newVal) {
      this.$emit('input', newVal);
      if (!newVal) {
        this.$emit('onDialogClose');
      }
    },
  },

  async mounted() {
    await this.loadNews();
    console.log('📢 Notícias carregadas (store):', this.news.allNews);
    this.loadReadNews();
    this.checkFirstAccess();

    if (this.value) {
      this.openNewsDialog(this.showAllNews);
    }
  },

  methods: {
    ...mapActions('userProfile', [
      'loadNews',
      'loadReadNews',
      'checkFirstAccess',
      'updateReadStatus',
      'markAllAsRead',
      'openNewsDialog',
      'closeNewsDialog',
    ]),

    ...mapMutations('userProfile', ['setNewsDialog', 'setCarouselIndex', 'setAllReadChecked']),

    closeDialog() {
      this.closeNewsDialog();
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date)) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('pt-BR', options);
    },
  },
};
</script>

<style lang="scss">
.fixed-size-dialog {
  max-width: 800px;
  width: 800px;
}

.dialog-card {
  display: flex;
  flex-direction: column;
  max-height: 90vh;

  .news-content-wrapper, .news-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .news-content {
    flex: 1;
    padding: 12px 8px 0 35px;

    .scrollable-content {
      overflow-y: auto;
      max-height: 60vh;
      padding: 5px 0 100px;

      &::-webkit-scrollbar {
        width: 6px;
        &-track { background: #f1f1f1; border-radius: 3px; }
        &-thumb {
          background: #888;
          border-radius: 3px;
          &:hover { background: #555; }
        }
      }
    }
  }
}

.v-toolbar {
  .v-btn {
    margin-right: 4px;
    &:last-child { margin-right: 0; }
    &--active::before { opacity: 0; }
  }
}

.v-carousel__controls .v-btn--icon {
  background: rgba(0, 0, 0, 0.3);
  color: white !important;
  &:hover { background: rgba(0, 0, 0, 0.5); }
  &[disabled] { opacity: 0.3; pointer-events: none; }
}

</style>
