import Vue from 'vue';

export const state = () => ({
  showFeaturesSupportLayers: false,
  supportLayersGroups: {},
  supportLayers: {},
  supportCategoryGroupsBase: {},
  loading: false,
  supportLayersCategoryBase: {},
  filters: {
    categoryBase: 1,
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
  tableData: { features: [] },
  tableHeaders: [],
  loadingTable: false,
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
};

export const mutations = {
  setretractAllLayers(state, value) {
    state.retractAllLayers = value;
  },

  setFilteredLayers(state, layers) {
    state.filteredLayersId = layers;
  },

  setshowFeaturesSupportLayers(state, showFeaturesSupportLayers) {
    state.showFeaturesSupportLayers = showFeaturesSupportLayers;
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
            wms: {
              ...layer.wms,
              geoserver_layer_name: layer.wms.geoserver_layer_name.includes(':')
                ? layer.wms.geoserver_layer_name
                : `CMR-FUNAI:${layer.wms.geoserver_layer_name}`,
            },
            layer_filters: layer.filters,
            visible: false,
            sublayers: false,
            opacity:
              (layer.wms && layer.wms.default_opacity)
              || (layer.vector && layer.vector.default_opacity)
              || 100,
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
    state.supportLayers[id].filters = state.supportLayers[id].filters.map(
      (item) => {
        const filterKey = item.type;
        if (filters.hasOwnProperty(filterKey)) {
          return {
            ...item,
            [filterKey]: filters[filterKey],
          };
        }
        return item;
      },
    );
  },

  setFilterOptions(state, data) {
    state.filterOptions = data;
  },

  toggleLayerVisibility(state, { id, visible }) {
    state.supportLayers[id].visible = visible;
  },

  setLayerOpacity(state, { id, opacity }) {
    state.supportLayers[id].opacity = opacity;
  },

  setLayerLoading(state, { id, loading }) {
    state.supportLayers[id].loading = loading;
  },

  setHeatLayerData(state, { id, data }) {
    state.supportLayers[id].data = data;
    state.supportLayers[id].visible = true;
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
        commit(
          'supportLayersUser/toggleLayerVisibility',
          { id: layer.id, visible: false },
          { root: true },
        );
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
          commit(
            'supportLayersUser/toggleLayerVisibility',
            { id: layer.id, visible: true },
            { root: true },
          );
          return;
        }
        commit('toggleLayerVisibility', { id: layer.id, visible: true });
      }, 100);
    }
    commit('setOrderedLayers', layers);
  },

  async openTableDialog({ state }, { layerId, fieldConfig }) {
    try {
      const layer = state.supportLayers[layerId];
      if (!layer || !layer.wms || !layer.wms.geoserver_layer_name) {
        throw new Error('Informações da camada inválidas.');
      }
      const layerName = layer.wms.geoserver_layer_name;
      const baseUrl = process.env.GEOSERVER_URL_WFS;
      const authkey = process.env.AUTHKEY;
      const params = new URLSearchParams({
        authkey,
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: layerName,
        outputFormat: 'application/json',
      });
      const map = window.mapMain;
      const bounds = map.getBounds();
      const bbox = [
        bounds.getSouth(),
        bounds.getWest(),
        bounds.getNorth(),
        bounds.getEast(),
      ].join();

      const url = `${baseUrl}?${params.toString()}&bbox=${bbox}`;
      const response = await this.$api.$get(url);
      const tableData = response;

      let tableHeaders = [];
      if (tableData.features && tableData.features.length > 0) {
        const properties = Object.keys(tableData.features[0].properties);
        tableHeaders = properties
          .filter((key) => !fieldConfig.excludedFields.includes(key))
          .map((key) => ({
            text:
              fieldConfig.fieldNames[key]
              || key.replace(/_/g, ' ').toUpperCase(),
            value: key,
            sortable: true,
          }));
      }

      return { data: tableData, headers: tableHeaders, loading: false };
    } catch (error) {
      console.error('Erro ao abrir tabela:', error);
      this.$store.commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('table-label'),
          }),
        },
        { root: true },
      );
      throw error;
    }
  },
};
