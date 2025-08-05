// store/modules/news.js
export default {
  namespaced: true,
  state: {
    allNews: [
      // Suas notícias
    ],
    readNews: [],
  },
  getters: {
    unreadNews: (state) => state.allNews.filter((news) => !state.readNews.includes(news.id)),
    sortedNews: (state) => [...state.allNews].sort((a, b) => b.id - a.id),
  },
  mutations: {
    markAsRead(state, newsId) {
      if (!state.readNews.includes(newsId)) {
        state.readNews.push(newsId);
      }
    },
    setReadNews(state, readNews) {
      state.readNews = readNews;
    },
  },
  actions: {
    async fetchNews({ commit }) {
      // Simule uma chamada à API ou use os dados locais
      const savedReadNews = localStorage.getItem(`readNews_${this.userId}`);
      if (savedReadNews) {
        commit('setReadNews', JSON.parse(savedReadNews));
      }
    },
    markAsRead({ commit }, newsId) {
      commit('markAsRead', newsId);
      localStorage.setItem(`readNews_${this.userId}`, JSON.stringify(state.readNews));
    },
  },
};
