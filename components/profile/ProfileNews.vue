<template>
  <v-dialog
    v-model="dialog"
    max-width="800"
    persistent
    scrollable
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>
          {{ $t('news.title') }}
          <v-spacer />
        </v-toolbar-title>
      </v-toolbar>

      <v-carousel
        v-model="carouselIndex"
        height="500"
        :show-arrows="false"
        hide-delimiter-background
        delimiter-icon="mdi-circle"
      >
        <v-carousel-item
          v-for="news in displayedNews"
          :key="news.id"
        >
          <v-card-text class="news-content">
            <h2 class="text-h6">
              {{ news.title }}
            </h2>
            <p class="text-subtitle-1">
              {{ formatDate(news.date) }}
            </p>
            <div
              class="text-body-1 mt-2"
              v-html="renderMarkdown(news.content)"
            />
            <v-btn
              v-if="!isReadByCurrentUser(news.id)"
              color="green"
              text
              class="mt-4"
              @click="markAsRead(news.id)"
            >
              <v-icon left>
                mdi-check
              </v-icon>
              {{ $t('news.markAsRead') }}
            </v-btn>
          </v-card-text>
        </v-carousel-item>
      </v-carousel>

      <v-card-actions class="navigation-controls">
        <v-btn
          color="primary"
          text
          :disabled="carouselIndex === 0"
          @click="goToPrevious"
        >
          {{ $t('news.previous') }}
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          text
          :disabled="carouselIndex === displayedNews.length - 1"
          @click="goToNext"
        >
          {{ $t('news.next') }}
        </v-btn>
      </v-card-actions>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          text
          @click="closeDialog"
        >
          {{ $t('news.close') }}
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
      "close": "Close",
      "previous": "Previous",
      "next": "Next"
    }
  },
  "pt-br": {
    "news": {
      "title": "Novidades",
      "markAsRead": "Marcar como Lida",
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
      allNews: [
        {
          id: 1,
          title: 'Bem-vindo ao novo sistema!',
          content: `
# Bem-vindo à versão 2.0!

Estamos felizes em anunciar a nova versão da nossa plataforma!  
**Principais melhorias:**

- 😊 Interface completamente redesenhada
- :sparkles: Performance 3x mais rápida
- Novos relatórios analíticos

![Imagem de boas-vindas](/images/welcome-update.jpg)
          `,
          date: new Date().toISOString().split('T')[0],
          read: false,
        },
        {
          id: 2,
          title: 'Manutenção programada',
          content: `
## Manutenção Programada

Informamos que faremos uma manutenção no sistema na próxima sexta-feira.

**Detalhes:**
- **Horário:** 00:00 às 04:00
- **Impacto:** O sistema ficará indisponível durante este período.

Agradecemos a compreensão!
          `,
          date: '2023-11-10',
          read: false,
        },
        {
          id: 3,
          title: 'Manutenção programada',
          content: `
## Manutenção Programada

Informamos que faremos uma manutenção no sistema na próxima sexta-feira.

**Detalhes:**
- **Horário:** 00:00 às 04:00
- **Impacto:** O sistema ficará indisponível durante este período.

Agradecemos a compreensão!
          `,
          date: '2023-11-10',
          read: false,
        },
      ],
      readNews: [],
      carouselIndex: 0,
    };
  },

  computed: {
    sortedNews() {
      return [...this.allNews].sort((a, b) => b.id - a.id);
    },
    unreadNews() {
      return this.sortedNews.filter((news) => !this.isReadByCurrentUser(news.id));
    },
    displayedNews() {
      return this.showAllNews ? this.sortedNews : this.unreadNews;
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
    unreadNews: {
      immediate: true,
      handler(newVal) {
        if (!this.showAllNews && newVal.length > 0 && !this.dialog) {
          this.dialog = true;
          this.carouselIndex = newVal.length - 1;
        }
      },
    },
  },

  mounted() {
    this.loadReadNews();
    this.checkFirstAccess();
  },

  methods: {
    loadReadNews() {
      const savedReadNews = localStorage.getItem(`readNews_${this.userId}`);
      if (savedReadNews) {
        this.readNews = JSON.parse(savedReadNews);
      }
    },

    checkFirstAccess() {
      if (localStorage.getItem(`firstAccess_${this.userId}`) === null) {
        localStorage.setItem(`firstAccess_${this.userId}`, 'false');
      }
    },

    isReadByCurrentUser(newsId) {
      return this.readNews.includes(newsId);
    },

    markAsRead(id) {
      if (!this.isReadByCurrentUser(id)) {
        this.readNews.push(id);
        localStorage.setItem(`readNews_${this.userId}`, JSON.stringify(this.readNews));
        if (this.unreadNews.length === 0 && !this.showAllNews) {
          this.closeDialog();
        }
        this.$forceUpdate();
      }
    },

    closeDialog() {
      this.dialog = false;
    },

    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    },

    goToPrevious() {
      if (this.carouselIndex > 0) {
        this.carouselIndex--;
      }
    },

    goToNext() {
      if (this.carouselIndex < this.displayedNews.length - 1) {
        this.carouselIndex++;
      }
    },

    renderMarkdown(content) {
      return marked.parse(content);
    },
  },
};
</script>

<style lang="scss">
.news-content {
  padding: 16px;
  text-align: left;

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
  .v-btn {
    text-transform: none;
  }
}

.navigation-controls {
  justify-content: space-between;
  padding: 0 16px 16px;

  .v-btn {
    min-width: 120px;
    text-transform: none;
  }
}
</style>
