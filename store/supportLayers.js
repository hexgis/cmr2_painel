import Vue from 'vue';

export const state = () => ({
  showFeaturesSupportLayers: false,
  showFeaturesSupportLayersHazard: false,
  showFeaturesSupportLayersProdes: false,
  showFeaturesSupportLayersRaster: false,
  showFeaturesSupportLayersAntropismo: false,
  supportLayersGroups: {},
  supportLayers: {},
  supportCategoryGroupsFire: {},
  supportCategoryGroupsRaster: {},
  supportCategoryGroupsBase: {},
  supportCategoryGroupsProdes: {},
  supportCategoryGroupsAntropismo: {},
  loading: false,
  supportLayersCategoryFire: {},
  supportLayersCategoryBase: {},
  supportLayersCategoryRaster: {},
  supportLayersCategoryProdes: {},
  supportLayersCategoryAntropismo: {},
  filters: {
    categoryBase: 1,
    categoryRaster: 3,
    categoryFire: 2,
    categoryProdes: 4,
    categoryAntropismo: 5,
    co_cr: [],
    co_funai: [],
  },
  filterOptions: {
    regionalFilters: [],
    tiFilters: [],
  },
  filteredLayers: [],
  filteredLayersId: [],
  orderedLayers: [],
});

export const getters = {
  activeLayerIds(state) {
    const activeLayerIds = [];
    for (const layer of Object.values(state.supportLayers)) {
      if (layer.visible) {
        activeLayerIds.push(layer.id);
      }
    }
    return activeLayerIds;
  },

  activeLayerIds(state) {
    const activeLayerIds = [];
    for (const layer of Object.values(state.supportLayersCategoryRaster)) {
      if (layer.visible) {
        activeLayerIds.push(layer.id);
      }
    }
    return activeLayerIds;
  },

  activeLayerIds(state) {
    const activeLayerIds = [];
    for (const layer of Object.values(state.supportLayersCategoryFire)) {
      if (layer.visible) {
        activeLayerIds.push(layer.id);
      }
    }
    return activeLayerIds;
  },

  activeLayerIds(state) {
    const activeLayerIds = [];
    for (const layer of Object.values(state.supportLayersCategoryProdes)) {
      if (layer.visible) {
        activeLayerIds.push(layer.id);
      }
    }
    return activeLayerIds;
  },

  activeLayerIds(state) {
    const activeLayerIds = [];
    for (const layer of Object.values(
      state.supportLayersCategoryAntropismo,
    )) {
      if (layer.visible) {
        activeLayerIds.push(layer.id);
      }
    }
    return activeLayerIds;
  },
};

export const mutations = {

  toggleLayerActive(state, layerId) {
    for (const group of Object.values(state.supportCategoryGroupsRaster)) {
      const layer = group.layers.find(layer => layer.id === layerId)
      if (layer) {
        layer.active = !layer.active
        break
      }
    }
  },

  setFilteredLayers(state, layers) {
    state.filteredLayersId = layers;
  },

  setshowFeaturesSupportLayers(state, showFeaturesSupportLayers) {
    state.showFeaturesSupportLayers = showFeaturesSupportLayers;
  },

  setshowFeaturesSupportLayersHazard(state, showFeaturesSupportLayersHazard) {
    state.showFeaturesSupportLayersHazard = showFeaturesSupportLayersHazard;
  },

  setshowFeaturesSupportLayersProdes(state, showFeaturesSupportLayersProdes) {
    state.showFeaturesSupportLayersProdes = showFeaturesSupportLayersProdes;
  },

  setshowFeaturesSupportLayersRaster(state, showFeaturesSupportLayersRaster) {
    state.showFeaturesSupportLayersRaster = showFeaturesSupportLayersRaster;
  },

  setshowFeaturesSupportLayersAntropismo(state, showFeaturesSupportLayersAntropismo) {
    state.showFeaturesSupportLayersAntropismo = showFeaturesSupportLayersAntropismo;
  },

  setSupportLayersGroups(state, layersGroups) {
    state.supportLayersGroups = {};
    state.supportLayers = {};

    for (const group of layersGroups) {
      const { layers } = group;
      group.layers = [];

      for (const layer of layers) {
        layer.visible = false;

        if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
          layer.opacity = layer.wms.default_opacity;
        } else {
          layer.opacity = 100;
        }

        layer.loading = false;
        layer.filters = [];
        layer.data = [];

        group.layers.push(layer.id);
        Vue.set(state.supportLayers, layer.id, layer);
      }

      Vue.set(state.supportLayersGroups, group.id, group);
    }
  },

  setSupportCategoryGroupsFire(state, categoryGroups) {
    state.supportCategoryGroupsFire = {};
    state.supportLayersCategoryFire = {};

    for (const group of categoryGroups) {
      const { layers } = group;
      group.layers = [];

      for (const layer of layers) {
        layer.visible = false;

        if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
          layer.opacity = layer.wms.default_opacity;
        } else {
          layer.opacity = 100;
        }

        layer.loading = false;
        layer.filters = [];
        layer.data = [];

        group.layers.push(layer.id);
        Vue.set(state.supportLayersCategoryFire, layer.id, layer);
      }

      Vue.set(state.supportCategoryGroupsFire, group.id, group);
    }
  },

  setSupportCategoryGroupsProdes(state, categoryGroups) {
    state.supportCategoryGroupsProdes = {};
    state.supportLayersCategoryProdes = {};
    for (const group of categoryGroups) {
      const { layers } = group;
      group.layers = [];

      for (const layer of layers) {
        layer.visible = true;

        if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
          layer.opacity = layer.wms.default_opacity;
        } else {
          layer.opacity = 100;
        }

        layer.loading = false;
        layer.filters = [];
        layer.data = [];

        group.layers.push(layer.id);
        Vue.set(state.supportLayersCategoryProdes, layer.id, layer);
      }

      Vue.set(state.supportCategoryGroupsProdes, group.id, group);
    }
  },

  setSupportCategoryGroupsAntropismo(state, categoryGroups) {
    state.supportCategoryGroupsAntropismo = {};
    state.supportLayersCategoryAntropismo = {};

    for (const group of categoryGroups) {
      const { layers } = group;
      group.layers = [];

      for (const layer of layers) {
        layer.visible = false;

        if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
          layer.opacity = layer.wms.default_opacity;
        } else {
          layer.opacity = 100;
        }

        layer.loading = false;
        layer.filters = [];
        layer.data = [];

        group.layers.push(layer.id);

        Vue.set(state.supportLayersCategoryAntropismo, layer.id, layer);
      }

      Vue.set(state.supportCategoryGroupsAntropismo, group.id, group);
    }
  },

  setSupportCategoryGroupsRaster(state, categoryGroups) {
    state.supportCategoryGroupsRaster = {};
    state.supportLayersCategoryRaster = {};

    for (const group of categoryGroups) {
      const { layers } = group;
      group.layers = [];

      for (const layer of layers) {
        layer.visible = false;

        if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
          layer.opacity = layer.wms.default_opacity;
        } else {
          layer.opacity = 100;
        }

        layer.loading = false;
        layer.filters = [];
        layer.data = [];

        group.layers.push(layer.id);
        Vue.set(state.supportLayersCategoryRaster, layer.id, layer);
      }

      Vue.set(state.supportCategoryGroupsRaster, group.id, group);
    }
  },

  setSupportCategoryGroupsBase(state, categoryGroups) {
    state.supportCategoryGroupsBase = {};
    state.supportLayers = {};

    for (const group of categoryGroups) {
      const { layers } = group;
      group.layers = [];

      for (const layer of layers) {
        layer.visible = false;

        if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
          layer.opacity = layer.wms.default_opacity;
        } else {
          layer.opacity = 100;
        }

        layer.loading = false;
        layer.filters = [];
        layer.data = [];

        group.layers.push(layer.id);
        Vue.set(state.supportLayers, layer.id, layer);
      }

      Vue.set(state.supportCategoryGroupsBase, group.id, group);
    }
  },

  setLayerFilters(state, { id, filters }) {
    state.supportLayers[id].filters = {
      ...state.supportLayers[id].filters,
      ...filters,
    };
  },

  setLayerFiltersRaster(state, { id, filters }) {
    state.supportLayersCategoryRaster[id].filters = {
      ...state.supportLayersCategoryRaster[id].filters,
      ...filters,
    };
  },

  setFilterOptions(state, data) {
    state.filterOptions = data;
  },

  setLayerFiltersFire(state, { id, filters }) {
    state.supportLayersCategoryFire[id].filters = {
      ...state.supportLayersCategoryFire[id].filters,
      ...filters,
    };
  },
  setLayerFiltersAntropismo(state, { id, filters }) {
    state.supportLayersCategoryAntropismo[id].filters = {
      ...state.supportLayersCategoryAntropismo[id].filters,
      ...filters,
    };
  },

  setLayerFiltersProdes(state, { id, filters }) {
    state.supportLayersCategoryProdes[id].filters = {
      ...state.supportLayersCategoryProdes[id].filters,
      ...filters,
    };
  },

  toggleLayerVisibility(state, { id, visible }) {
    state.supportLayers[id].visible = visible;
  },

  toggleLayerVisibilityFire(state, { id, visible }) {
    state.supportLayersCategoryFire[id].visible = visible;
  },

  toggleLayerVisibilityProdes(state, { id, visible }) {
    state.supportLayersCategoryProdes[id].visible = visible;
  },

  toggleLayerVisibilityAntropismo(state, { id, visible }) {
    state.supportLayersCategoryAntropismo[id].visible = visible;
  },

  toggleLayerVisibilityRaster(state, { id, visible }) {
    state.supportLayersCategoryRaster[id].visible = visible;
  },

  setLayerOpacity(state, { id, opacity }) {
    state.supportLayers[id].opacity = opacity;
  },

  setLayerOpacityRaster(state, { id, opacity }) {
    state.supportLayersCategoryRaster[id].opacity = opacity;
  },

  setLayerOpacityFire(state, { id, opacity }) {
    state.supportLayersCategoryFire[id].opacity = opacity;
  },
  setLayerOpacityAntropismo(state, { id, opacity }) {
    state.supportLayersCategoryAntropismo[id].opacity = opacity;
  },

  setLayerOpacityProdes(state, { id, opacity }) {
    state.supportLayersCategoryProdes[id].opacity = opacity;
  },

  setLayerLoading(state, { id, loading }) {
    state.supportLayers[id].loading = loading;
  },

  setLayerLoadingFire(state, { id, loading }) {
    state.supportLayersCategoryFire[id].loading = loading;
  },

  setLayerLoadingProdes(state, { id, loading }) {
    state.supportLayersCategoryProdes[id].loading = loading;
  },

  setLayerLoadingAntropismo(state, { id, loading }) {
    state.supportLayersCategoryAntropismo[id].loading = loading;
  },

  setLayerLoadingRaster(state, { id, loading }) {
    state.supportLayersCategoryRaster[id].loading = loading;
  },

  setHeatLayerData(state, { id, data }) {
    state.supportLayers[id].data = data;
    state.supportLayers[id].visible = true;
  },

  setHeatLayerDataRaster(state, { id, data }) {
    state.supportLayersCategoryRaster[id].data = data;
    state.supportLayersCategoryRaster[id].visible = true;
  },

  setHeatLayerDataFire(state, { id, data }) {
    state.supportLayersCategoryFire[id].data = data;
    state.supportLayersCategoryFire[id].visible = true;
  },

  setHeatLayerDataProdes(state, { id, data }) {
    state.supportLayersCategoryProdes[id].data = data;
    state.supportLayersCategoryProdes[id].visible = true;
  },

  setLoading(state, loading) {
    state.loading = loading;
  },

  setSearchLayer(state, search) {
    state.searchLayer = search;
  },
  setOrderedLayers(state, layers) {
    state.orderedLayers = layers;
  }
};

export const actions = {
  async getLayersGroups({ commit }) {
    commit('setLoading', true);

    try {
      const response = await this.$api.$get('support/layers-groups/');

      commit('setSupportLayersGroups', response);
      commit('setshowFeaturesSupportLayers', true);
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.tc('layer', 2),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoading', false);
    }
  },
  async getTiOptions({ commit, state }, cr) {
    const params = {
      co_cr: cr.toString(),
    };

    const tis = await this.$api.$get('funai/ti/', { params });

    if (tis) {
      commit('setFilterOptions', {
        ...state.filterOptions,
        tiFilters: tis.sort((a, b) => a.no_ti > b.no_ti),
      });
    }
  },
  async getCategoryGroupsRasters({ commit }) {
    commit('setLoading', true);
    const params = {
      category: 3,
    };
    try {
      const response = await this.$api.$get('support/layers-groups/', {
        params,
      });

      commit('setSupportCategoryGroupsRaster', response);
      commit('setshowFeaturesSupportLayersRaster', true);
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.tc('layer', 2),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoading', false);
    }
  },
  async getCategoryGroupsFire({ commit }) {
    commit('setLoading', true);
    const params = {
      category: 2,
    };
    try {
      const response = await this.$api.$get('support/layers-groups/', {
        params,
      });

      commit('setSupportCategoryGroupsFire', response);
      commit('setshowFeaturesSupportLayersHazard', true);
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.tc('layer', 2),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoading', false);
    }
  },

  async getCategoryGroupsProdes({ commit }) {
    commit('setLoading', true);
    const params = {
      category: 4,
    };
    try {
      const response = await this.$api.$get('support/layers-groups/', {
        params,
      });

      commit('setSupportCategoryGroupsProdes', response);
      commit('setshowFeaturesSupportLayersProdes', true);
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.tc('layer', 2),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoading', false);
    }
  },

  async getCategoryGroupsAntropismo({ commit }) {
    commit('setLoading', true);
    const params = {
      category: 5,
    };
    try {
      const response = await this.$api.$get('support/layers-groups/', {
        params,
      });

      commit('setSupportCategoryGroupsAntropismo', response);
      commit('setshowFeaturesSupportLayersAntropismo', true);
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.tc('layer', 2),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoading', false);
    }
  },
  async getCategoryGroupsBase({ commit }) {
    commit('setLoading', true);
    const params = {
      category: 1,
    };
    try {
      const response = await this.$api.$get('support/layers-groups/', {
        params,
      });

      commit('setSupportCategoryGroupsBase', response);
      commit('setshowFeaturesSupportLayers', true);
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.tc('layer', 2),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoading', false);
    }
  },

  async getHeatMapLayer({ state, commit }, { id, filters }) {
    const heatLayer = state.supportLayers[id];
    const params = {
      ...filters,
      type: heatLayer.heatmap.heatmap_type.identifier,
    };

    commit('setLayerLoading', { id, loading: true });

    try {
      const data = await this.$api.$get('monitoring/heatmap/', {
        params,
      });

      commit('setHeatLayerData', { id, data });
      commit('setLayerLoading', { id, loading: false });
      commit('setshowFeaturesSupportLayers', true);
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.tc('layer', 1),
          }),
        },
        { root: true },
      );
    }
  },
  async getHeatMapLayerRaster({ state, commit }, { id, filters }) {
    const heatLayer = state.supportLayersCategoryRaster[id];
    const params = {
      ...filters,
      type: heatLayer.heatmap.heatmap_type.identifier,
    };

    commit('setLayerLoadingRaster', { id, loading: true });

    try {
      const data = await this.$api.$get('monitoring/heatmap/', {
        params,
      });

      commit('setHeatLayerDataRaster', { id, data });
      commit('setLayerLoadingRaster', { id, loading: false });
      commit('setshowFeaturesSupportLayersRaster', true);
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.tc('layer', 1),
          }),
        },
        { root: true },
      );
    }
  },
  async getHeatMapLayerFire({ state, commit }, { id, filters }) {
    const heatLayer = state.supportLayersCategoryFire[id];
    const params = {
      ...filters,
      type: heatLayer.heatmap.heatmap_type.identifier,
    };

    commit('setLayerLoadingFire', { id, loading: true });

    try {
      const data = await this.$api.$get('monitoring/heatmap/', {
        params,
      });

      commit('setHeatLayerDataFire', { id, data });
      commit('setLayerLoadingFire', { id, loading: false });
      commit('setshowFeaturesSupportLayersHazard', true);
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.tc('layer', 1),
          }),
        },
        { root: true },
      );
    }
  },
  async getFilterOptions({ commit }) {
    const regional_coordinators = await this.$api.$get('funai/cr/');

    const data = {};

    if (regional_coordinators) {
      data.regionalFilters = regional_coordinators.sort(
        (a, b) => a.ds_cr > b.ds_cr,
      );
    }

    commit('setFilterOptions', data);
  },

  removeSupportLayers({commit, rootCommit }, {concatenatedLayers}){
    concatenatedLayers.forEach(layer => {
      if (layer.date_created) {
        commit('supportLayersUser/toggleLayerVisibility', { id: layer.id, visible: false }, { root: true });
        return
      }
      commit('toggleLayerVisibility', {id: layer.id, visible: false})
    });
  },

  addSupportLayers({ commit, dispatch }, { layers }) {
    for (let index = layers.length - 1; index >= 0; index--) {
      const layer = layers[index];
      setTimeout(() => {
        if (layer.date_created) {
          commit('supportLayersUser/toggleLayerVisibility', { id: layer.id, visible: true }, { root: true });
          return;
        }
        commit('toggleLayerVisibility', { id: layer.id, visible: true });
      }, 100);
    }
    commit('setOrderedLayers', layers);
  }
};
