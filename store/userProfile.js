export const state = () => ({
  user: null,
  showDrawer: true,
  news: {
    dialog: false,
    allNews: [],
    readNews: [],
    loading: false,
    carouselIndex: 0,
    showAllNews: false,
  },
  loadingUpdateTheme: false,
  newsOpened: false,
  searchQuery: '',
  selectedNewsIndex: 0,
});

export const mutations = {
  setUser(state, { user }) {
    state.user = user;
  },

  closeDrawer(state) {
    state.showDrawer = false;
  },

  openDrawer(state) {
    state.showDrawer = true;
  },

  setLoadingUpdateTheme(state, isLoading) {
    state.loadingUpdateTheme = isLoading;
  },

  setNews(state, news) {
    state.news.allNews = news.map((item, index) => ({
      ...item,
      id: item.id || `news-${index}`,
    }));
  },

  setNewsOpened(state, opened) {
    state.newsOpened = opened;
    const unreadNews = state.news.allNews.filter((news) => !state.news.readNews.includes(news.id));
    if (!unreadNews.length) {
      state.news.carouselIndex = 0;
    }
  },

  setShowAllNews(state, showAll) {
    state.news.showAllNews = showAll;
  },

  setReadNews(state, readNews) {
    state.news.readNews = readNews;
  },

  setNewsLoading(state, loading) {
    state.news.loading = loading;
  },

  setNewsDialog(state, dialog) {
    state.news.dialog = dialog;
  },

  setCarouselIndex(state, index) {
    state.news.carouselIndex = index;
  },

  markAsRead(state, newsId) {
    if (!state.news.readNews.includes(newsId)) {
      state.news.readNews = [...state.news.readNews, newsId];
    }
  },

  markAllAsRead(state) {
    const unreadIds = state.news.allNews
      .filter((news) => !state.news.readNews.includes(news.id))
      .map((news) => news.id);
    state.news.readNews = [...state.news.readNews, ...unreadIds];
  },

  setUserSettingsDarkMode(state, isDarkMode) {
    if (state.user && state.user.settings) {
      state.user.settings.dark_mode_active = isDarkMode;
    }
  },

  setSearchQuery(state, query) {
    state.searchQuery = query;
  },

  setSelectedNewsIndex(state, index) {
    state.selectedNewsIndex = index;
  },

  // Renomeado para evitar conflito com action
  clearSearchQuery(state) {
    state.searchQuery = '';
  },
};

export const actions = {
  async getUserData({ commit, dispatch }) {
    try {
      const data = await this.$api.$get('user/logged/');
      commit('setUser', { user: data });
    } catch (error) {
      console.error('Erro ao receber dados do usuário:', error);
      dispatch('auth/logout', null, { root: true });
      throw error;
    }
  },

  async checkUnreadNews({ commit, state }) {
    if (!state.user) return;
    const userId = state.user.id || 'defaultUser';
    const savedReadNews = localStorage.getItem(`readNews_${userId}`);
    const readNews = savedReadNews ? JSON.parse(savedReadNews) : [];

    try {
      const response = await this.$api.get('/api/news/');
      const allNews = response.data || [];
      const unreadNews = allNews.filter((news) => !readNews.includes(news.id));

      if (unreadNews.length > 0) {
        commit('setShowAllNews', false);
        commit('setNewsOpened', true);
      }
    } catch (error) {
      console.error('Erro ao verificar notícias não lidas:', error);
    }
  },

  async loadNews({ commit }) {
    commit('setNewsLoading', true);
    try {
      const response = await this.$axios.get('/api/news/');
      commit('setNews', response.data);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      commit('setNewsLoading', false);
    }
  },

  loadReadNews({ commit, state }) {
    const userId = state.user.id || 'defaultUser';
    const savedReadNews = localStorage.getItem(`readNews_${userId}`);
    try {
      const readNews = savedReadNews ? JSON.parse(savedReadNews) : [];
      commit('setReadNews', Array.isArray(readNews) ? readNews : []);
    } catch (e) {
      commit('setReadNews', []);
    }
  },

  updateReadStatus({ commit, state }, { newsId, isChecked }) {
    if (isChecked) {
      commit('markAsRead', newsId);

      const userId = state.user.id || 'defaultUser';
      localStorage.setItem(`readNews_${userId}`, JSON.stringify(state.news.readNews));

      const unreadNews = state.news.allNews.filter((n) => !state.news.readNews.includes(n.id));

      if (!state.news.showAllNews && unreadNews.length === 0) commit('setNewsDialog', false);
    }
  },

  async updateThemeSettings({ commit }, isDark) {
    try {
      commit('setLoadingUpdateTheme', true);
      await this.$api.patch('/user/update-settings/', { theme_mode: isDark });
      commit('setUserSettingsDarkMode', isDark);
      return true;
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('save'),
            resource: this.$i18n.tc('theme', 2),
          }),
        },
        { root: true },
      );
      return false;
    } finally {
      commit('setLoadingUpdateTheme', false);
    }
  },

  markAllAsRead({ commit, state }) {
    commit('markAllAsRead');

    const userId = state.user.id || 'defaultUser';
    localStorage.setItem(`readNews_${userId}`, JSON.stringify(state.news.readNews));

    if (!state.news.showAllNews) {
      commit('setNewsDialog', false);
    }
  },

  openNewsDialog({ commit, state, getters }) {
    commit('setShowAllNews', true);
    commit('setNewsDialog', true);

    const displayedNews = getters.sortedNews;

    if (displayedNews.length > 0) {
      const firstUnreadNews = displayedNews.find((n) => !state.news.readNews.includes(n.id)) || displayedNews[0];
      const index = displayedNews.findIndex((news) => news.id === firstUnreadNews.id);

      commit('setSelectedNewsIndex', index);
      commit('setCarouselIndex', index);
    }
  },

  closeNewsDialog({ commit }) {
    commit('setNewsDialog', false);
  },

  setSearchQuery({ commit }, query) {
    commit('setSearchQuery', query);
  },

  clearSearch({ commit }) {
    commit('clearSearchQuery');
  },

  setSelectedNewsIndex({ commit, getters }, newsId) {
    const index = getters.getNewsIndexById(newsId);
    commit('setSelectedNewsIndex', index);
  },

  handleNewsSelection({ commit }, index) {
    commit('setSelectedNewsIndex', index);
    commit('setCarouselIndex', index);
  },
};

export const getters = {
  userData: (state) => state.user,
  showArrows: (state, getters) => getters.displayedNews.length > 1,
  hasUnreadNews: (state, getters) => getters.unreadNews.length > 0,
  isNewsRead: (state) => (newsId) => state.news.readNews.includes(newsId),

  sortedNews: (state) => [...state.news.allNews].sort((a, b) => new Date(b.date) - new Date(a.date)),
  unreadNews: (state, getters) => getters.sortedNews.filter((news) => !state.news.readNews.includes(news.id)),
  displayedNews: (state, getters) => (state.news.showAllNews ? getters.sortedNews : getters.unreadNews),
  searchQuery: (state) => state.searchQuery,
  selectedNewsIndex: (state) => state.selectedNewsIndex,

  filteredNews: (state, getters) => {
    if (!state.searchQuery || state.searchQuery.trim() === '') {
      return getters.sortedNews;
    }

    const query = state.searchQuery.toLowerCase().trim();
    return getters.sortedNews.filter((newsItem) => {
      const titleMatch = newsItem.title.toLowerCase().includes(query);
      const contentMatch = newsItem.content.toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
  },

  unreadNewsCount: (state, getters) => {
    if (!getters.displayedNews) return 0;
    return getters.displayedNews.filter((newsItem) => !state.news.readNews.includes(newsItem.id)).length;
  },

  getNewsIndexById: (state, getters) => (newsId) => getters.sortedNews.findIndex((item) => item.id === newsId),

  selectedNews: (state, getters) => {
    if (getters.hasNews && state.selectedNewsIndex !== null && state.selectedNewsIndex >= 0) {
      return getters.sortedNews[state.selectedNewsIndex];
    }
    return null;
  },

  hasNews: (state, getters) => getters.displayedNews && getters.displayedNews.length > 0,
};
