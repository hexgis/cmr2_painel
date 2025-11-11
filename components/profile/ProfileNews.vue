<template>
  <v-dialog
    v-model="newsDialog"
    :width="$vuetify.breakpoint.mdAndUp ? '110vh' : '90vw'"
    persistent
  >
    <v-card class="dialog-card">
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title class="text-h6 d-flex flex-column">
          {{ $t('news.title') }}
          <span class="text-caption mt-1">
            {{ dataFormatada }}
          </span>
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
        <v-row class="fill-height ma-0">
          <!-- Barra Lateral -->
          <v-col
            cols="12"
            md="4"
            class="pa-0 sidebar-col"
          >
            <v-sheet
              color="grey lighten-5"
              class="d-flex flex-column fill-height"
            >
              <!-- Campo de Pesquisa -->
              <v-card-text class="mb-n8">
                <v-text-field
                  v-model="searchQuery"
                  :label="$t('news.searchPlaceholder')"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  outlined
                  dense
                  @click:clear="clearSearch"
                >
                  <template v-slot:append v-if="searchQuery">
                    <v-chip
                      small
                      color="primary lighten-4"
                      text-color="primary darken-2"
                      class="mr-2"
                    >
                      {{ filteredNews.length }} {{ $t('news.results') }}
                    </v-chip>
                  </template>
                </v-text-field>
              </v-card-text>

              <!-- Header da lista com contador -->
              <v-sheet class="px-4 py-2 grey lighten-3 d-flex justify-space-between align-center">
                <span class="text-caption font-weight-medium">
                  {{ $t('news.newsList') }} ({{ displayedNews.length }})
                </span>
                <v-chip
                  v-if="hasUnreadNews"
                  small
                  color="red lighten-4"
                  text-color="red darken-2"
                >
                  <v-icon left small>mdi-email-alert</v-icon>
                  {{ unreadNewsCount }} {{ $t('news.unread') }}
                </v-chip>
              </v-sheet>

              <!-- Lista de Notícias -->
              <v-sheet class="flex-grow-1">
                <v-list
                  class="news-list"
                  dense
                >
                  <v-list-item
                    v-for="newsItem in filteredNews"
                    :key="newsItem.id"
                    :class="{
                      'primary lighten-4': selectedNewsIndex === getNewsIndexById(newsItem.id),
                      'grey lighten-3': isNewsRead(newsItem.id)
                    }"
                    class="mb-2 mx-2 rounded-lg"
                    @click="handleNewsItemClick(getNewsIndexById(newsItem.id))"
                  >
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-medium text-body-2">
                        {{ newsItem.title }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption">
                        {{ formatDate(newsItem.date) }}
                      </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action v-if="isNewsRead(newsItem.id)">
                      <v-chip
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
                    </v-list-item-action>

                    <!-- Indicador de não lida -->
                    <v-list-item-action v-else>
                      <v-badge
                        dot
                        color="red"
                        class="ml-2"
                      />
                    </v-list-item-action>
                  </v-list-item>

                  <!-- Mensagem quando não há resultados -->
                  <v-list-item v-if="searchQuery && filteredNews.length === 0">
                    <v-list-item-content class="text-center py-4">
                      <v-icon
                        size="48"
                        color="grey lighten-1"
                        class="mb-2"
                      >
                        mdi-magnify-remove
                      </v-icon>
                      <v-list-item-title class="text-body-1 grey--text">
                        {{ $t('news.noResults') }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption grey--text">
                        {{ $t('news.noResultsDescription') }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-sheet>

              <!-- Botão Marcar Todas como Lidas -->
              <v-card-actions
                v-if="hasUnreadNews && hasNews && unreadNewsCount > 1 && (!searchQuery || filteredNews.length > 0)"
                class="px-6 py-4 grey lighten-3 flex-shrink-0"
              >
                <v-btn
                  block
                  color="red"
                  outlined
                  @click="markAllAsRead"
                >
                  <v-icon left>mdi-check-all</v-icon>
                  {{ $t('news.markAllAsRead') }}
                  <v-chip
                    small
                    color="red lighten-4"
                    text-color="red darken-2"
                    class="ml-2"
                  >
                    {{ unreadNewsCount }}
                  </v-chip>
                </v-btn>
              </v-card-actions>
            </v-sheet>
          </v-col>

          <!-- Corpo da Mensagem -->
          <v-col
            cols="12"
            md="8"
            class="pa-0 content-col"
          >
            <v-sheet class="d-flex flex-column fill-height">
              <template v-if="hasNews && selectedNews">
                <v-sheet class="d-flex flex-column fill-height">
                  <!-- Conteúdo da Notícia com Scroll Apenas Aqui -->
                  <v-sheet class="content-scrollable flex-grow-1 pa-6">
                    <MarkdownRenderer
                      :key="markdownKey"
                      :content="selectedNews.content"
                    />
                  </v-sheet>

                  <!-- Footer com Botão Marcar como Lida -->
                  <v-card-actions
                    v-if="!isNewsRead(selectedNews.id)"
                    class="px-6 py-4 grey lighten-3 flex-shrink-0"
                  >
                    <v-spacer />
                    <v-btn
                      color="red"
                      depressed
                      outlined
                      @click="markCurrentAsRead"
                    >
                      <v-icon left>mdi-check</v-icon>
                      {{ $t('news.markAsRead') }}
                    </v-btn>
                  </v-card-actions>
                </v-sheet>
              </template>

              <!-- Mensagem quando não há notícias selecionadas -->
              <template v-else-if="hasNews && !selectedNews">
                <v-sheet class="d-flex flex-column align-center justify-center fill-height text-center pa-6">
                  <v-icon
                    size="64"
                    color="grey lighten-1"
                    class="mb-4"
                  >
                    mdi-newspaper
                  </v-icon>
                  <v-list-item-title class="text-h5 mb-2 grey--text text--darken-1">
                    {{ $t('news.selectNews') }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-1 grey--text">
                    {{ $t('news.selectNewsDescription') }}
                  </v-list-item-subtitle>
                </v-sheet>
              </template>

              <!-- Mensagem quando não há notícias -->
              <template v-else>
                <v-sheet class="d-flex flex-column align-center justify-center fill-height text-center pa-6">
                  <v-icon
                    size="64"
                    color="grey lighten-1"
                    class="mb-4"
                  >
                    mdi-newspaper-variant-multiple
                  </v-icon>
                  <v-list-item-title class="text-h5 mb-2 grey--text text--darken-1">
                    {{ $t('news.noNews') }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-1 grey--text">
                    {{ $t('news.noNewsDescription') }}
                  </v-list-item-subtitle>
                </v-sheet>
              </template>
            </v-sheet>
          </v-col>
        </v-row>
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
      "markAllAsRead": "Mark all as read",
      "read": "Read",
      "unread": "unread",
      "close": "Close",
      "noNews": "No news at the moment",
      "noNewsDescription": "Check back later for updates!",
      "selectNews": "Select a news item",
      "selectNewsDescription": "Choose a news item from the list to read its content",
      "searchPlaceholder": "Search news...",
      "results": "result(s)",
      "noResults": "No results found",
      "noResultsDescription": "Try different keywords",
      "newsList": "News list"
    }
  },
  "pt-br": {
    "news": {
      "title": "Novidades",
      "markAsRead": "Marcar como lida",
      "markAllAsRead": "Marcar todas",
      "read": "Notícia lida",
      "unread": "não lidas",
      "close": "Fechar",
      "noNews": "Nenhuma novidade no momento",
      "noNewsDescription": "Volte mais tarde para ver as atualizações!",
      "selectNews": "Selecione uma notícia",
      "selectNewsDescription": "Escolha uma notícia da lista para ler seu conteúdo",
      "searchPlaceholder": "Pesquisar notícias...",
      "results": "resultado(s)",
      "noResults": "Nenhum resultado encontrado",
      "noResultsDescription": "Tente palavras-chave diferentes",
      "newsList": "Lista de notícias"
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
  },

  data() {
    return {
      forceUpdateKey: 0,
    };
  },

  computed: {
    ...mapState('userProfile', ['news']),
    ...mapGetters('userProfile', [
      'displayedNews',
      'hasUnreadNews',
      'isNewsRead',
      'sortedNews',
      'filteredNews',
      'unreadNewsCount',
      'selectedNews',
      'getNewsIndexById',
      'hasNews',
      'selectedNewsIndex',
      'searchQuery'
    ]),

    dataFormatada() {
      return this.formatDate(new Date());
    },

    markdownKey() {
      return this.selectedNews ? `${this.selectedNews.id}-${this.forceUpdateKey}` : 'empty';
    },

    newsDialog: {
      get() {
        return this.news.dialog;
      },
      set(value) {
        this.setNewsDialog(value);
      },
    },

    searchQuery: {
      get() {
        return this.$store.state.userProfile.searchQuery;
      },
      set(value) {
        this.setSearchQuery(value);
      }
    },
  },

  watch: {
    value(newVal) {
      if (newVal) {
        this.openNewsDialog();
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
    this.loadReadNews();

    if (this.value) {
      this.openNewsDialog();
    }
  },

  methods: {
    ...mapActions('userProfile', [
      'loadNews',
      'loadReadNews',
      'updateReadStatus',
      'markAllAsRead',
      'openNewsDialog',
      'closeNewsDialog',
      'setSearchQuery',
      'clearSearch',
      'handleNewsSelection'
    ]),

    ...mapMutations('userProfile', ['setNewsDialog', 'setCarouselIndex']),

    closeDialog() {
      this.closeNewsDialog();
    },

    clearSearch() {
      this.$store.dispatch('userProfile/clearSearch');
      this.forceUpdateKey += 1;
    },

    handleNewsItemClick(index) {
      this.handleNewsSelection(index);
      this.forceUpdateKey += 1;
    },

    markCurrentAsRead() {
      if (this.selectedNews && this.selectedNews.id && !this.isNewsRead(this.selectedNews.id)) {
        this.updateReadStatus({
          newsId: this.selectedNews.id,
          isChecked: true
        });
      }
    },

    formatDate(date) {
      if (!date) return '';
      const dateObj = new Date(date);
      if (isNaN(dateObj)) return '';

      if (date === this.news?.date) {
        const options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        };
        return dateObj.toLocaleDateString('pt-BR', options);
      } else {
        const dia = dateObj.getDate();
        const mes = dateObj.toLocaleString('pt-BR', { month: 'long' });
        const ano = dateObj.getFullYear();
        return `${dia} de ${mes} de ${ano}`;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-card {
  .sidebar-col {
    border-right: 1px solid #e0e0e0;

    .news-list {
      max-height: calc(70vh - 160px);
      overflow-y: auto;
    }
  }

  .content-col {
    .v-sheet {
      min-height: 60vh;
    }

    .content-scrollable {
      max-height: calc(75vh - 100px);
      overflow-y: auto;
    }
  }
}

.news-list::-webkit-scrollbar-thumb,
.content-scrollable::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

</style>
