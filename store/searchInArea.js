import Vue from 'vue';

export const state = () => ({
  showLayer: false,
  searchLayers: null,
  layersGroups: null,
  resultGroups: null,
  resultLayers: null,
  loading: true,
  loadingRequest: false,
  hasDraw: false,
  cqlFilter: null,
  currentArea: {},
  requestTool: '',
});

export const getters = {
  displayResults(state) {
    if (state.resultGroups || state.loadingRequest) {
      return true;
    }
    return false;
  },
};

export const mutations = {
  setCurrentAreaValue(state, area) {
    state.currentArea = area;
  },
  setLayers(state, groups) {
    let currentGroup = '';
    groups.map((group) => {
      currentGroup = group;
      currentGroup.display = false;
      return currentGroup;
    });
    groups.forEach((group) => {
      const filterGroup = group;
      if (filterGroup.layers) {
        let currentLayer = '';
        filterGroup.layers.map((layer) => {
          currentLayer = layer;
          currentLayer.visible = true;
          currentLayer.display = false;
          currentLayer.opacity = 100;
          return currentLayer;
        });
        filterGroup.layers = filterGroup.layers.filter((layer) => layer.wms_layer_type !== 'Raster');
      }
    });
    state.layersGroups = groups.filter((group) => group.layers !== null);
  },

  setLoading(state, load) {
    state.loading = load;
  },

  setLoadingRequest(state, loading) {
    state.loadingRequest = loading;
  },

  setDraw(state, draw) {
    state.hasDraw = draw;
  },

  setShowLayer(state, layer) {
    state.showLayer = layer;
  },

  setSearch(state, layers) {
    if (state.searchLayers === layers) {
      state.searchLayers = null;
    }
    state.searchLayers = layers;
  },

  setResultGroups(state, groups) {
    state.resultGroups = groups;
  },

  setRequestTool(state, tool) {
    state.requestTool = tool;
  },

  setResultLayers(state, layers) {
    if (layers) {
      let currentLayer = '';
      layers.map((layer) => {
        currentLayer = layer;
        currentLayer.display = true;
        return currentLayer;
      });
    }
    state.resultLayers = layers;
  },

  setCqlFilter(state, cql) {
    state.cqlFilter = cql;
  },

  setVisibility(state, { groupId, layerId, visible }) {
    let currentLayer = '';
    function comparesLayerId(layer) {
      if (layer.id === layerId) {
        currentLayer = layer;
        currentLayer.visible = visible;
      }
      return currentLayer;
    }
    function comparesGroupId(group) {
      if (group.id === groupId) {
        group.layers.map(comparesLayerId);
      }
    }
    state.layersGroups.map(comparesGroupId);
    state.resultGroups.map(comparesGroupId);
  },

  setOpacity(state, { groupId, layerId, opacity }) {
    let currentLayer = '';
    function comparaLayerId(layer) {
      if (layer.id === layerId) {
        currentLayer = layer;
        currentLayer.opacity = opacity;
      }
      return currentLayer;
    }
    function comparaGroupId(group) {
      if (group.id === groupId) {
        group.layers.map(comparaLayerId);
      }
    }
    state.layersGroups.map(comparaGroupId);
  },

  updateLayers(state, { display, visible }) {
    let currentLayer = '';
    function displayVisible(layer) {
      currentLayer = layer;
      currentLayer.display = display;
      currentLayer.visible = visible;
      return currentLayer;
    }

    function layerGroup(group) {
      const { layers } = group;
      layers.map(displayVisible);
    }
    state.layersGroups.map(layerGroup);
  },
};

export const actions = {
  async getGeoserverLayers({ commit }) {
    try {
      const response = await this.$api.$get('layer/layers-groups');
      commit('setLayers', response);
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
};
