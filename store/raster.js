import Vue from 'vue';

export const state = () => ({
  showFeaturesSupportLayers: false,
  showFeaturesSupportLayersRaster: false,
  supportLayersGroups: {},
  supportLayers: {},
  supportCategoryGroupsRaster: {},
  supportCategoryGroupsBase: {},
  loading: false,
  supportLayersCategoryBase: {},
  supportLayersCategoryRaster: {},
  filters: {
    categoryBase: 1,
    categoryRaster: 3,
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
  // Compare layers functionality
  layersToCompare: {
    left: null,
    right: null,
  },
  openCompare: false,
});

export const getters = {
  activeLayerIds(state) {
    const activeLayerIds = [];
    Object.values(state.supportLayers).forEach((layer) => {
      if (layer.visible) {
        activeLayerIds.push(layer.id);
      }
    });
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
};

export const mutations = {
  setretractAllLayers(state, value) {
    state.retractAllLayers = value;
  },

  toggleLayerActive(state, layerId) {
    for (const group of Object.values(state.supportCategoryGroupsRaster)) {
      const foundLayer = group.layers.find((l) => l.id === layerId);
      if (foundLayer) {
        foundLayer.active = !foundLayer.active;
        break;
      }
    }
  },

  setFilteredLayers(state, layers) {
    state.filteredLayersId = layers;
  },

  setshowFeaturesSupportLayers(state, showFeaturesSupportLayers) {
    state.showFeaturesSupportLayers = showFeaturesSupportLayers;
  },

  setshowFeaturesSupportLayersRaster(state, showFeaturesSupportLayersRaster) {
    state.showFeaturesSupportLayersRaster = showFeaturesSupportLayersRaster;
  },

  setSupportLayersGroups(state, layersGroups) {
    Vue.set(state, 'supportLayersGroups', {});
    Vue.set(state, 'supportLayers', {});

    layersGroups.forEach((group) => {
      if (group.layers) {
        const currentGroup = { ...group };
        const layers = [...currentGroup.layers];
        currentGroup.layers = [];

        layers.forEach((layer) => {
          const currentLayer = {
            ...layer,
            layer_filters: layer.filters,
            visible: false,
            sublayers: false,
            opacity: (layer.wms && layer.wms.default_opacity)
              || (layer.vector && layer.vector.default_opacity) || 100,
            loading: false,
            data: [],
            cql: null,
          };

          currentGroup.layers.push(layer.id);
          Vue.set(state.supportLayers, layer.id, currentLayer);
        });

        Vue.set(state.supportLayersGroups, group.id, currentGroup);
      }
    });
  },

  setSupportCategoryGroupsRaster(state, categoryGroups) {
    state.supportCategoryGroupsRaster = {};
    state.supportLayersCategoryRaster = {};

    categoryGroups.forEach((group) => {
      const { layers } = group;
      group.layers = [];

      layers.forEach((layer) => {
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
      });

      Vue.set(state.supportCategoryGroupsRaster, group.id, group);
    });
  },

  setSupportCategoryGroupsBase(state, categoryGroups) {
    state.supportCategoryGroupsBase = {};
    state.supportLayers = {};

    categoryGroups.forEach((group) => {
      const { layers } = group;
      group.layers = [];

      layers.forEach((layer) => {
        layer.visible = false;

        if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
          layer.opacity = layer.wms.default_opacity;
        } else {
          layer.opacity = 100;
        }

        layer.loading = false;
        layer.data = [];

        group.layers.push({ layer: layer.id, name: layer.name });
        Vue.set(state.supportLayers, layer.id, layer);
      });

      Vue.set(state.supportCategoryGroupsBase, group.id, group);
    });
  },

  setLayerFilters(state, { id, filters }) {
    state.supportLayers[id].filters = state.supportLayers[id].filters.map((item) => {
      const filterKey = item.type;
      if (filters.hasOwnProperty(filterKey)) {
        return {
          ...item,
          [filterKey]: filters[filterKey],
        };
      }
      return item;
    });
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

  toggleLayerVisibility(state, { id, visible }) {
    state.supportLayers[id].visible = visible;
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

  setLayerLoading(state, { id, loading }) {
    state.supportLayers[id].loading = loading;
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

  setLoading(state, loading) {
    state.loading = loading;
  },

  setSearchLayer(state, search) {
    state.searchLayer = search;
  },

  setOrderedLayers(state, layers) {
    state.orderedLayers = layers;
  },

  setSublayers(state, { id, sublayers }) {
    state.supportLayers[id].sublayers = sublayers;
  },

  setCqlLayer(state, { id, category }) {
    let cql = '';
    const layer = state.supportLayers[id];
    const { sublayers } = layer;

    Object.keys(sublayers).forEach((key) => {
      if (sublayers[key].name === category) {
        Vue.set(sublayers[key], 'visible', !sublayers[key].visible);
      }
      if (sublayers[key].visible) {
        Vue.set(layer, 'visible', true);
        cql += `${sublayers[key].cql} OR `;
      }
    });

    Vue.set(layer, 'cql', cql ? cql.slice(0, -4) : '1=2');
  },

  // Compare layers mutations
  setLayerToCompare(state, layer) {
    if (state.layersToCompare.left === null) {
      state.layersToCompare.left = layer;
    } else if (state.layersToCompare.left && state.layersToCompare.left.id === layer.id) {
      state.layersToCompare.left = null;
    } else if (state.layersToCompare.right === null) {
      state.layersToCompare.right = layer;
    } else if (state.layersToCompare.right && state.layersToCompare.right.id === layer.id) {
      state.layersToCompare.right = null;
    } else {
      // Se ambos os slots estão ocupados e não é uma deseleção, substitui a camada left
      state.layersToCompare.left = layer;
    }

    // Só abre o diálogo quando duas camadas estão selecionadas
    if (state.layersToCompare.right && state.layersToCompare.left) {
      state.openCompare = true;
    } else {
      state.openCompare = false;
    }
  },

  clearLayersToCompare(state) {
    state.layersToCompare.left = null;
    state.layersToCompare.right = null;
    state.openCompare = false;
  },

  setOpenCompare(state, value) {
    state.openCompare = value;
  },
};

export const actions = {
  async getLayersGroups({ commit }) {
    commit('setLoading', true);

    try {
      const response = await this.$api.$get('layer/layers-groups/');

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
      const response = await this.$api.$get('layer/layers-groups/', {
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

  async getCategoryGroupsBase({ commit }) {
    commit('setLoading', true);
    const params = {
      category: 1,
    };
    try {
      const response = await this.$api.$get('layer/layers-groups/', {
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

  async getFilterOptions({ commit }) {
    const regionalCoordinators = await this.$api.$get('funai/cr/');

    const data = {};

    if (regionalCoordinators) {
      data.regionalFilters = regionalCoordinators.sort(
        (a, b) => a.ds_cr > b.ds_cr,
      );
    }

    commit('setFilterOptions', data);
  },

  removeSupportLayers({ commit }, { concatenatedLayers }) {
    concatenatedLayers.forEach((layer) => {
      if (layer.date_created) {
        commit('supportLayersUser/toggleLayerVisibility', { id: layer.id, visible: false }, { root: true });
        return;
      }
      commit('toggleLayerVisibility', { id: layer.id, visible: false });
    });
  },

  addSupportLayers({ commit }, { layers }) {
    for (let index = layers.length - 1; index >= 0; index -= 1) {
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
  },
};
