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
      const data = await this.$api.$get('adm-panel/analytics/');
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
  async deleteAnalytics({ commit, state }, { id, messageError }) {
    commit('setLoading', true);
    try {
      await this.$api.$delete(`adm-panel/analytics/${id}`);
      commit('setData', state.data.filter((item) => item.id !== id));
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
  async createAnalytics({ commit, state }, { analytic, messageError }) {
    commit('setLoading', true);
    try {
      const data = await this.$api.$post('adm-panel/analytics/', analytic);
      commit('setData', [...state.data, data]);
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
      const data = await this.$api.$put(`adm-panel/analytics/${id}`, analytic);
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
