<template>
  <v-dialog
    v-model="dialog"
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
                  {{ news.title }}
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
                  {{ formatDate(news.date) }}
                </p>

                <div class="scrollable-content">
                  <MarkdownRenderer :content="news.content" />
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
import MarkdownRenderer from './MarkdownRenderer.vue';

export default {
  name: 'ProfileNews',

  components: {
    MarkdownRenderer
  },

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: [String, Number],
      default: 'defaultUser',
    },
    showAllNews: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      dialog: this.value,
      allNews: [],
      readNews: [],
      carouselIndex: 0,
      loading: false,
      error: null,
      allReadChecked: false,
    };
  },

  computed: {
    sortedNews() {
      return [...this.allNews].sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    unreadNews() {
      return this.sortedNews.filter((news) => !this.isNewsRead(news.id));
    },
    displayedNews() {
      return this.showAllNews ? this.sortedNews : this.unreadNews;
    },
    showArrows() {
      return this.displayedNews.length > 1;
    },
    prevDisabled() {
      return this.carouselIndex === 0;
    },
    nextDisabled() {
      return this.carouselIndex === this.displayedNews.length - 1;
    },
    hasUnreadNews() {
      return this.unreadNews.length > 0;
    },
  },

  watch: {
    value(newVal) {
      this.dialog = newVal;
      if (newVal) {
        this.carouselIndex = this.displayedNews.length - 1;
      }
    },
    dialog(newVal) {
      this.$emit('input', newVal);
      if (!newVal) {
        this.$emit('onDialogClose');
      }
    },
    unreadNews(newVal) {
      if (!this.showAllNews && newVal.length > 0 && !this.dialog) {
        this.dialog = true;
        this.carouselIndex = newVal.length - 1;
      }
    },
  },

  async mounted() {
    await this.loadNews();
    this.loadReadNews();
    this.checkFirstAccess();
    this.checkUnreadNews();
  },

  methods: {
    isNewsRead(newsId) {
      return this.readNews.includes(newsId);
    },

    async loadNews() {
      this.loading = true;
      this.error = null;
      try {
        const response = await this.$axios.get('/api/news/');
        this.allNews = response.data;
      } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        this.error = 'Falha ao carregar notícias';
        this.allNews = [];
      } finally {
        this.loading = false;
      }
    },

    loadReadNews() {
      const savedReadNews = localStorage.getItem(`readNews_${this.userId}`);
      try {
        this.readNews = savedReadNews ? JSON.parse(savedReadNews) : [];
        if (!Array.isArray(this.readNews)) {
          this.readNews = [];
        }
      } catch (e) {
        this.readNews = [];
      }
    },

    checkFirstAccess() {
      if (localStorage.getItem(`firstAccess_${this.userId}`) === null) {
        localStorage.setItem(`firstAccess_${this.userId}`, 'false');
      }
    },

    checkUnreadNews() {
      const unread = this.unreadNews;
      if (!this.showAllNews && unread.length > 0 && !this.dialog) {
        this.dialog = true;
        this.carouselIndex = unread.length - 1;
      }
    },

    updateReadStatus(newsId, isChecked) {
      if (isChecked) {
        if (!this.isNewsRead(newsId)) {
          this.readNews = [...this.readNews, newsId];
          localStorage.setItem(`readNews_${this.userId}`, JSON.stringify(this.readNews));

          this.$forceUpdate();

          if (!this.showAllNews) {
            this.$nextTick(() => {
              if (this.unreadNews.length === 0) {
                this.closeDialog();
              } else if (this.carouselIndex > 0) {
                this.carouselIndex++;
              }
            });
          } else if (this.carouselIndex > 0) {
            this.carouselIndex++;
          }
        }
      }
    },

    markAllAsRead(checked) {
      if (checked) {
        const unreadIds = this.unreadNews.map((news) => news.id);
        this.readNews = [...this.readNews, ...unreadIds];
        localStorage.setItem(`readNews_${this.userId}`, JSON.stringify(this.readNews));
        this.$forceUpdate();

        if (!this.showAllNews) {
          this.closeDialog();
        }
      }
      // Resetar o checkbox após um pequeno delay para melhor feedback visual
      setTimeout(() => {
        this.allReadChecked = false;
      }, 500);
    },

    closeDialog() {
      this.dialog = false;
    },

    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    }
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

.news-content {
  h1, h2, h3 {
    margin: 0 12px 12px 0;
    font-weight: bold;
    line-height: 30px;
  }
  p { margin-bottom: 16px; }
  ul {
    list-style-type: disc;
    margin: 0 0 16px 20px;
    li { margin-bottom: 8px; }
  }
  img {
    max-width: 100%;
    border-radius: 8px;
    margin-top: 10px;
  }
  strong { font-weight: bold; }
}

.mark-all-checkbox {
  .v-input--selection-controls__input, .v-icon {
    color: white !important;
  }
}

// Estilos para o conteúdo markdown
.markdown-content {
  line-height: 1.6;
  color: #333;

  h1, h2, h3, h4, h5, h6 {
    margin: 1em 0 0.5em 0;
    font-weight: bold;
    color: #1976d2;
  }

  h1 { font-size: 1.8em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.3em; }

  p {
    margin: 0.5em 0;
    line-height: 1.6;
  }

  ul, ol {
    margin: 0.5em 0;
    padding-left: 2em;
  }

  li {
    margin: 0.25em 0;
  }

  table.markdown-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 0.9em;

    th, td {
      padding: 0.5em;
      border: 1px solid #ddd;
      text-align: left;
    }

    th {
      background-color: #f5f5f5;
      font-weight: bold;
      color: #333;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  }

  img.markdown-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1em 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  a {
    color: #1976d2;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
      color: #1565c0;
    }
  }

  strong {
    font-weight: bold;
    color: #000;
  }

  em {
    font-style: italic;
  }

  blockquote {
    border-left: 4px solid #1976d2;
    padding-left: 1em;
    margin: 1em 0;
    background-color: #f9f9f9;
    padding: 1em;
    border-radius: 0 4px 4px 0;
  }

  code {
    background-color: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }

  pre {
    background-color: #f5f5f5;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1em 0;

    code {
      background: none;
      padding: 0;
    }
  }
}
</style>
