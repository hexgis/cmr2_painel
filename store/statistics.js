export const state = () => ({
  isLoading: false,
  data: [],
});

export const mutations = {
  setLoading(localState, payload) {
    localState.isLoading = payload;
  },
  setData(localState, payload) {
    localState.data = payload;
  },
};

export const actions = {
  async getAnalytics({ commit }, messageError) {
    commit('setLoading', true);
    try {
      const data = await this.$api.$get('http://localhost:8080/adm-panel/analytics/');
      commit('setData', data);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: messageError,
          colorAlert: 'red',
          colorButtonClose: 'white',
          colorTimer: 'white',
        },
        { root: true },
      );
    } finally {
      commit('setLoading', false);
    }
  },
  async deleteAnalytics({ commit }, { id, messageError }) {
    commit('setLoading', true);
    try {
      await this.$api.$delete(`http://localhost:8080/adm-panel/analytics/${id}`);
      commit('setData', this.state.statistics.data.filter((item) => item.id !== id));
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: messageError,
          colorAlert: 'red',
          colorButtonClose: 'white',
          colorTimer: 'white',
        },
        { root: true },
      );
    } finally {
      commit('setLoading', false);
    }
  },
  async createAnalytics({ commit }, { analytic, messageError }) {
    commit('setLoading', true);
    try {
      const data = await this.$api.$post('http://localhost:8080/adm-panel/analytics/', analytic);
      commit('setData', [...this.state.statistics.data, data]);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: messageError,
          colorAlert: 'red',
          colorButtonClose: 'white',
          colorTimer: 'white',
        },
        { root: true },
      );
    } finally {
      commit('setLoading', false);
    }
  },
  async updateAnalytics({ commit, state }, { id, analytic, messageError }) {
    commit('setLoading', true);
    try {
      const data = await this.$api.$put(`http://localhost:8080/adm-panel/analytics/${id}`, analytic);
      const index = state.data.findIndex((item) => item.id === id);
      if (index !== -1) {
        const updatedData = [...state.data];
        updatedData[index] = data;
        commit('setData', updatedData);
      }
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: messageError,
          colorAlert: 'red',
          colorButtonClose: 'white',
          colorTimer: 'white',
        },
        { root: true },
      );
    } finally {
      commit('setLoading', false);
    }
  },
};
