export const state = () => ({
  user: null,
  showDrawer: true,
  news: {
    dialog: false,
    allNews: [],
    readNews: [],
    loading: false,
    carouselIndex: 0,
    allReadChecked: false,
    showAllNews: false,
  },
  pendingRequestsCount: 0,
  newsOpened: false,
  showAllNews: false,
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

  setNews(state, news) {
    // Adiciona um id fictício se não houver
    state.news.allNews = news.map((item, index) => ({
      ...item,
      id: item.id || `news-${index}`,
    }));
  },

  setPendingRequestsCount(state, count) {
    state.pendingRequestsCount = count;
  },

  setNewsOpened(state, opened) {
    state.newsOpened = opened;
  },

  setShowAllNews(state, showAll) {
    state.showAllNews = showAll;
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

  setAllReadChecked(state, checked) {
    state.news.allReadChecked = checked;
  },

  setShowAllNews(state, showAll) {
    state.news.showAllNews = showAll;
  },

  addReadNews(state, newsId) {
    if (!state.news.readNews.includes(newsId)) {
      state.news.readNews = [...state.news.readNews, newsId];
    }
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
};

export const actions = {
  async getUserData({ commit, dispatch }) {
    try {
      const data = await this.$api.$get('user/logged/');
      commit('setUser', { user: data });
    } catch (error) {
      console.error('Erro ao receber dados do usuário:', error);
      dispatch('auth/logout', null, { root: true });
      throw error; // Rejeita a promise com o erro para quem chamou
    }
  },

  async fetchPendingRequestsCount({ commit, state }) {
    try {
      if (!state.user) {
        commit('setPendingRequestsCount', 0);
        return
      }
      const { data } = await this.$api.get(`/user/restricted-access/pending-count/`);
      commit('setPendingRequestsCount', data.count || 0);
    } catch (error) {
      commit('setPendingRequestsCount', 0);
    }
  },

  async checkUnreadNews({ commit, state }) {
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
    const userId = state.user?.id || 'defaultUser';
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

      const userId = state.user?.id || 'defaultUser';
      localStorage.setItem(`readNews_${userId}`, JSON.stringify(state.news.readNews));

      const unreadNews = state.news.allNews.filter(news =>
        !state.news.readNews.includes(news.id)
      );

      if (!state.news.showAllNews && unreadNews.length === 0) {
        commit('setNewsDialog', false);
      }
    }
  },

  markAllAsRead({ commit, state }) {
    commit('markAllAsRead');

    const userId = state.user?.id || 'defaultUser';
    localStorage.setItem(`readNews_${userId}`, JSON.stringify(state.news.readNews));

    if (!state.news.showAllNews) {
      commit('setNewsDialog', false);
    }

    setTimeout(() => {
      commit('setAllReadChecked', false);
    }, 500);
  },

  openNewsDialog({ commit, state }, showAllNews = false) {
    commit('setShowAllNews', showAllNews);
    commit('setNewsDialog', true);

    const displayedNews = showAllNews
      ? [...state.news.allNews].sort((a, b) => new Date(b.date) - new Date(a.date))
      : state.news.allNews.filter(news => !state.news.readNews.includes(news.id));

    if (displayedNews.length > 0) {
      commit('setCarouselIndex', 0);
    }
  },

  closeNewsDialog({ commit }) {
    commit('setNewsDialog', false);
  },
};

export const getters = {
  userData: (state) => state.user,


  sortedNews: (state) => {
    return [...state.news.allNews].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  unreadNews: (state, getters) => {
    return getters.sortedNews.filter((news) => !state.news.readNews.includes(news.id));
  },

  displayedNews: (state, getters) => {
    return state.news.showAllNews ? getters.sortedNews : getters.unreadNews;
  },

  showArrows: (state, getters) => getters.displayedNews.length > 1,

  prevDisabled: (state, getters) => state.news.carouselIndex === 0,

  nextDisabled: (state, getters) =>
    state.news.carouselIndex === getters.displayedNews.length - 1,

  hasUnreadNews: (state, getters) => getters.unreadNews.length > 0,

  isNewsRead: (state) => (newsId) => state.news.readNews.includes(newsId),
};
