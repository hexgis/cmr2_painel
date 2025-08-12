/* eslint-disable no-param-reassign */
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
  activeLayerIds(rasterState) {
    const activeLayerIds = [];
    Object.values(rasterState.supportLayers).forEach((layer) => {
      if (layer.visible) {
        activeLayerIds.push(layer.id);
      }
    });
    return activeLayerIds;
  },

  activeRasterLayerIds(rasterState) {
    const activeLayerIds = [];
    Object.values(rasterState.supportLayersCategoryRaster).forEach((layer) => {
      if (layer.visible) {
        activeLayerIds.push(layer.id);
      }
    });
    return activeLayerIds;
  },
};

export const mutations = {
  setretractAllLayers(currentState, value) {
    currentState.retractAllLayers = value;
  },

  toggleLayerActive(currentState, layerId) {
    const groups = Object.values(currentState.supportCategoryGroupsRaster);
    groups.forEach((group) => {
      const foundLayer = group.layers.find((l) => l.id === layerId);
      if (foundLayer) {
        foundLayer.active = !foundLayer.active;
      }
    });
  },

  setFilteredLayers(currentState, layers) {
    currentState.filteredLayersId = layers;
  },

  setshowFeaturesSupportLayers(currentState, showFeaturesSupportLayers) {
    currentState.showFeaturesSupportLayers = showFeaturesSupportLayers;
  },

  setshowFeaturesSupportLayersRaster(currentState, showFeaturesSupportLayersRaster) {
    currentState.showFeaturesSupportLayersRaster = showFeaturesSupportLayersRaster;
  },

  setSupportLayersGroups(currentState, layersGroups) {
    Vue.set(currentState, 'supportLayersGroups', {});
    Vue.set(currentState, 'supportLayers', {});

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
          Vue.set(currentState.supportLayers, layer.id, currentLayer);
        });

        Vue.set(currentState.supportLayersGroups, group.id, currentGroup);
      }
    });
  },

  setSupportCategoryGroupsRaster(currentState, categoryGroups) {
    currentState.supportCategoryGroupsRaster = {};
    currentState.supportLayersCategoryRaster = {};

    categoryGroups.forEach((group) => {
      const { layers } = group;
      const modifiedGroup = { ...group };
      modifiedGroup.layers = [];

      layers.forEach((layer) => {
        const modifiedLayer = { ...layer };
        modifiedLayer.visible = false;

        if (modifiedLayer.layer_type === 'wms' && modifiedLayer.wms.default_opacity) {
          modifiedLayer.opacity = modifiedLayer.wms.default_opacity;
        } else {
          modifiedLayer.opacity = 100;
        }

        modifiedLayer.loading = false;
        modifiedLayer.filters = [];
        modifiedLayer.data = [];

        modifiedGroup.layers.push(modifiedLayer.id);
        Vue.set(currentState.supportLayersCategoryRaster, modifiedLayer.id, modifiedLayer);
      });

      Vue.set(currentState.supportCategoryGroupsRaster, modifiedGroup.id, modifiedGroup);
    });
  },

  setSupportCategoryGroupsBase(currentState, categoryGroups) {
    currentState.supportCategoryGroupsBase = {};
    currentState.supportLayers = {};

    categoryGroups.forEach((group) => {
      const { layers } = group;
      const modifiedGroup = { ...group };
      modifiedGroup.layers = [];

      layers.forEach((layer) => {
        const modifiedLayer = { ...layer };
        modifiedLayer.visible = false;

        if (modifiedLayer.layer_type === 'wms' && modifiedLayer.wms.default_opacity) {
          modifiedLayer.opacity = modifiedLayer.wms.default_opacity;
        } else {
          modifiedLayer.opacity = 100;
        }

        modifiedLayer.loading = false;
        modifiedLayer.data = [];

        modifiedGroup.layers.push({ layer: modifiedLayer.id, name: modifiedLayer.name });
        Vue.set(currentState.supportLayers, modifiedLayer.id, modifiedLayer);
      });

      Vue.set(currentState.supportCategoryGroupsBase, modifiedGroup.id, modifiedGroup);
    });
  },

  setLayerFilters(currentState, { id, filters }) {
    currentState.supportLayers[id].filters = currentState.supportLayers[id].filters.map((item) => {
      const filterKey = item.type;
      if (Object.prototype.hasOwnProperty.call(filters, filterKey)) {
        return {
          ...item,
          [filterKey]: filters[filterKey],
        };
      }
      return item;
    });
  },

  setLayerFiltersRaster(currentState, { id, filters }) {
    currentState.supportLayersCategoryRaster[id].filters = {
      ...currentState.supportLayersCategoryRaster[id].filters,
      ...filters,
    };
  },

  setFilterOptions(currentState, data) {
    currentState.filterOptions = data;
  },

  toggleLayerVisibility(currentState, { id, visible }) {
    currentState.supportLayers[id].visible = visible;
  },

  toggleLayerVisibilityRaster(currentState, { id, visible }) {
    currentState.supportLayersCategoryRaster[id].visible = visible;
  },

  setLayerOpacity(currentState, { id, opacity }) {
    currentState.supportLayers[id].opacity = opacity;
  },

  setLayerOpacityRaster(currentState, { id, opacity }) {
    currentState.supportLayersCategoryRaster[id].opacity = opacity;
  },

  setLayerLoading(currentState, { id, loading }) {
    currentState.supportLayers[id].loading = loading;
  },

  setLayerLoadingRaster(currentState, { id, loading }) {
    currentState.supportLayersCategoryRaster[id].loading = loading;
  },

  setHeatLayerData(currentState, { id, data }) {
    currentState.supportLayers[id].data = data;
    currentState.supportLayers[id].visible = true;
  },

  setHeatLayerDataRaster(currentState, { id, data }) {
    currentState.supportLayersCategoryRaster[id].data = data;
    currentState.supportLayersCategoryRaster[id].visible = true;
  },

  setLoading(currentState, loading) {
    currentState.loading = loading;
  },

  setSearchLayer(currentState, search) {
    currentState.searchLayer = search;
  },

  setOrderedLayers(currentState, layers) {
    currentState.orderedLayers = layers;
  },

  setSublayers(currentState, { id, sublayers }) {
    currentState.supportLayers[id].sublayers = sublayers;
  },

  setCqlLayer(currentState, { id, category }) {
    let cql = '';
    const layer = currentState.supportLayers[id];
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
  setLayerToCompare(currentState, layer) {
    if (currentState.layersToCompare.left === null) {
      currentState.layersToCompare.left = layer;
    } else if (
      currentState.layersToCompare.left
      && currentState.layersToCompare.left.id === layer.id
    ) {
      currentState.layersToCompare.left = null;
    } else if (currentState.layersToCompare.right === null) {
      currentState.layersToCompare.right = layer;
    } else if (
      currentState.layersToCompare.right
      && currentState.layersToCompare.right.id === layer.id
    ) {
      currentState.layersToCompare.right = null;
    } else {
      // If both slots are occupied and it's not a deselection, replace the left layer
      currentState.layersToCompare.left = layer;
    }

    // Only open the dialog when two layers are selected
    if (currentState.layersToCompare.right && currentState.layersToCompare.left) {
      currentState.openCompare = true;
    } else {
      currentState.openCompare = false;
    }
  },

  clearLayersToCompare(currentState) {
    currentState.layersToCompare.left = null;
    currentState.layersToCompare.right = null;
    currentState.openCompare = false;
  },

  setOpenCompare(currentState, value) {
    currentState.openCompare = value;
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
  async getTiOptions({ commit, state: currentState }, cr) {
    const params = {
      co_cr: cr.toString(),
    };

    const tis = await this.$api.$get('funai/ti/', { params });

    if (tis) {
      commit('setFilterOptions', {
        ...currentState.filterOptions,
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

  async getHeatMapLayer({ state: currentState, commit }, { id, filters }) {
    const heatLayer = currentState.supportLayers[id];
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
  async getHeatMapLayerRaster({ state: currentState, commit }, { id, filters }) {
    const heatLayer = currentState.supportLayersCategoryRaster[id];
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
