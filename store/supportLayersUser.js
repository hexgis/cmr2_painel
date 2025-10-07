import Vue from 'vue';

export const state = () => ({
  supportLayerUser: {},
  popupInfo: {},
  selectedColor: '#FF0000',
  loadingUpdateLayerUser: false,
});

export const getters = {
  selectedColor: (state) => state.selectedColor,
};

export const mutations = {
  SET_COLOR(state, color) {
    state.selectedColor = color;
  },

  reorderLayers(state, payload) {
    state.supportLayers = payload.supportLayers;
    state.supportLayerUser = payload.supportLayerUser;
    state.activeMonitoringLabel = payload.activeMonitoringLabel;
  },

  setSupportLayersUser(state, LayersUser) {
    state.supportLayerUser = {};
    for (const layer of LayersUser) {
      layer.visible = false;
      layer.opacity = 100;
      layer.loading = false;
      layer.geometry = null;
      Vue.set(state.supportLayerUser, layer.id, layer);
    }
  },

  setLayerLoading(state, { id, loading }) {
    state.supportLayerUser[id].loading = loading;
  },

  setLayersUserGeojson(state, { layer, response }) {
    state.supportLayerUser[layer.id].geometry = response;
    state.supportLayerUser[layer.id].opacity = 100 * Number(
      response.features[0].properties.properties.opacity,
    );
  },

  setLayersDetail(state, { info, response }) {
    state.popupInfo[info.id] = response;
  },

  toggleLayerVisibility(state, { id, visible }) {
    state.supportLayerUser[id].visible = visible;
  },

  setLayerOpacity(state, { id, opacity }) {
    state.supportLayerUser[id].opacity = opacity;
  },

  setLayerColor(state, { id, color }) {
    if (state.supportLayerUser[id]) {
      Vue.set(state.supportLayerUser[id], 'color', color);
    }
  },

  setLayerName(state, { id, name }) {
    if (state.supportLayerUser[id]) {
      Vue.set(state.supportLayerUser[id], 'name', name);
    }
  },

  setLoadingUpdateLayerUser(state, loading) {
    state.loadingUpdateLayerUser = loading;
  },
};

export const actions = {

  async updateLayerColor({ commit }, color) {
    commit('SET_COLOR', color);
  },

  setColor({ commit }, color) {
    commit('SET_COLOR', color);
  },

  setLayerColor({ commit }, { id, color }) {
    commit('setLayerColor', { id, color });
  },

  async getLayersUser({ commit }) {
    const response = await this.$api.$get('user/upload-file/list/');
    if (response) {
      commit('setSupportLayersUser', response);
    }
  },

  async getLayersUserGeoJson({ commit }, layer) {
    const { id } = layer;
    commit('setLayerLoading', { id, loading: true });

    const response = await this.$api.$get(`user/upload-file/geo/${layer.id}/`);
    if (response) {
      commit('setLayersUserGeojson', { layer, response });
      commit('setLayerLoading', { id, loading: false });
    }
  },

  async getLayersDetail({ commit }, info) {
    const response = await this.$api.$get(`user/upload-file/geo/detail/${info.id}/`);
    if (response) {
      commit('setLayersDetail', { info, response });
    }
  },

  async updateUserLayerProperties({ dispatch, commit }, {
    id, color, name, message,
  }) {
    try {
      commit('setLoadingUpdateLayerUser', true);
      const url = `user/upload-file/geo/${id}/update-properties/`;
      await this.$api.patch(url, { color, name });
      commit('setLayerColor', { id, color });
      commit('setLayerName', { id, name });
      await dispatch('getLayersUser');
    } catch (error) {
      commit(
        'alert/addAlert',
        { message },
        { root: true },
      );
    } finally {
      commit('setLoadingUpdateLayerUser', false);
    }
  },
};
