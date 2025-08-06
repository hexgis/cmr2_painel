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
          height="500"
          :show-arrows="displayedNews.length > 1"
          hide-delimiter-background
          delimiter-icon="mdi-circle"
          :class="{ 'single-item': displayedNews.length <= 1 }"
        >
          <v-carousel-item
            v-for="news in displayedNews"
            :key="news.id"
          >
            <div class="news-content-wrapper">
              <div class="news-content">
                <h2 class="text-h6 px-14 pt-4">
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
                <p class="text-subtitle-1 px-14 mt-n4">
                  {{ formatDate(news.date) }}
                </p>

                <div class="d-flex justify-end px-14">
                  <v-switch
                    v-if="!isNewsRead(news.id)"
                    :label="$t('news.markAsRead')"
                    color="green"
                    hide-details
                    class="mt-n6 mb-0"
                    @change="updateReadStatus(news.id, $event)"
                  />
                </div>

                <div
                  class="text-body-1 mt-4 px-4 px-14 pt-2 scrollable-content"
                  v-html="renderMarkdown(news.content)"
                />
              </div>
            </div>
          </v-carousel-item>
        </v-carousel>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<i18n>
{
  "en": {
    "news": {
      "title": "News",
      "markAsRead": "Mark as Read",
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
      "read": "Notícia lida",
      "close": "Fechar",
      "previous": "Próxima novidade",
      "next": "Novidade anterior"
    }
  }
}
</i18n>

<script>
import { marked } from 'marked';

export default {
  name: 'ProfileNews',

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
                this.carouselIndex--;
              }
            });
          }
        }
      }
    },

    closeDialog() {
      this.dialog = false;
    },

    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    },

    renderMarkdown(content) {
    // Configura o marked para sanitizar o HTML e permitir imagens/tabelas
      marked.setOptions({
        breaks: true,
        gfm: true, // Habilita GitHub Flavored Markdown (para tabelas)
        sanitize: false, // Permite HTML (necessário para algumas funcionalidades)
      });

      // Processa o conteúdo markdown
      let html = marked(content || '');

      // Adiciona classes CSS às tabelas para estilização
      html = html.replace(/<table>/g, '<table class="markdown-table">');

      return html;
    },
  },
};
</script>

<style lang="scss">
.fixed-size-dialog {
  max-width: 800px !important;
  width: 800px !important;
}

.dialog-card {
  display: flex;
  flex-direction: column;
  max-height: 90vh;

  .news-content-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .news-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .scrollable-content {
      overflow-y: auto;
      max-height: 350px;
      padding-right: 8px;

      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
      }
      &::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    }
  }
}

/* Estilos para as setas do carrossel */
.v-carousel__controls {
  .v-btn--icon {
    background: rgba(0, 0, 0, 0.3);
    color: white !important;

    &:hover {
      background: rgba(0, 0, 0, 0.5);
    }

    &[disabled] {
      opacity: 0.3;
      pointer-events: none;
    }
  }
}

/* Esconde controles quando só tem um item */
.v-carousel.single-item .v-carousel__controls {
  display: none;
}

/* Estilo das setas ativas */
.v-carousel__controls .v-btn--icon:not(.v-btn--disabled) {
  color: var(--v-primary-base) !important;
  background: rgba(255, 255, 255, 0.8);

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
}

.navigation-controls {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding: 12px 16px;

  .v-btn {
    min-width: 120px;
  }
}

.news-content {
  h1, h2, h3 {
    margin-bottom: 12px;
    font-weight: bold;
  }
  p {
    margin-bottom: 16px;
  }
  ul {
    list-style-type: disc;
    margin-left: 20px;
    margin-bottom: 16px;
  }
  li {
    margin-bottom: 8px;
  }
  img {
    max-width: 100%;
    border-radius: 8px;
    margin-top: 10px;
  }
  strong {
    font-weight: bold;
  }
}
</style>
