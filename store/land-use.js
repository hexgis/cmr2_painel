export const state = () => ({
  features: null,
  showFeaturesLandUse: false,
  tableDialogLand: false,
  isLoadingTable: false,
  isLoadingCSV: false,
  isLoadingGeoJson: false,
  isLoadingFeatures: false,
  filterOptions: {
    regionalFilters: [],
    year: [],
    tiFilters: [],
  },
  filters: {
    csv: 'csv',
    json: 'json',
  },

  opacity: 100,
  heatMap: false,
  total: null,
  tableLandUse: [],
  tableCSVLandUse: [],
});

export const getters = {
  featuresLoaded(state) {
    return (
      state.features
            && state.features.features
            && state.features.features.length > 0
    );
  },
};

export const mutations = {
  setClearTis(state, tis){
    state.filterOptions.tiFilters = []
  },

  setFeatures(state, features) {
    state.features = features;
    state.isLoadingFeatures = false;
  },

  setShowFeaturesLandUse(state, showFeaturesLandUse) {
    state.showFeaturesLandUse = showFeaturesLandUse;
  },

  setLoadingTable(state, payload) {
    state.isLoadingTable = payload;
  },

  setLoadingGeoJson(state, payload) {
    state.isLoadingGeoJson = payload;
  },

  clearFeatures(state) {
    state.features = null;
  },

  setTotal(state, total) {
    state.total = total;
  },

  setVisualizationStage(state, visualizationStage) {
    state.visualizationStage = visualizationStage;
  },

  settableDialogLand(state, tableDialogLand) {
    state.tableDialogLand = tableDialogLand;
  },

  setLoadingFeatures(state, payload) {
    state.isLoadingFeatures = payload;
  },

  setFilterOptions(state, data) {
    state.filterOptions = data;
  },

  setOpacity(state, opacity) {
    state.opacity = opacity;
  },

  setDownloadTable(state, tableCSVLandUse) {
    state.tableCSVLandUse = tableCSVLandUse;
  },

  setHeatMap(state, heatMap) {
    state.heatMap = heatMap;
  },

  setLoadingCSV(state, payload) {
    state.isLoadingCSV = payload;
  },

  setTable(state, tableLandUse) {
    state.tableLandUse = tableLandUse;
  },

  setFilters(state, filters) {
    state.filters = {
      ...state.filters,
      ...filters,
    };
  },
};

export const actions = {
  async getFeatures({ state, commit, rootGetters }) {
    commit('setLoadingGeoJson', true);
    commit('setLoadingFeatures', true);
    commit('setLoadingTable', true);
    commit('clearFeatures');

    const params = {};

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    if (state.filters.ti && state.filters.ti.length) { params.co_funai = state.filters.ti.toString(); }

    if (state.filters.year && state.filters.year.length) { params.map_year = state.filters.year.toString(); }

    if (state.filters.cr && state.filters.cr.length) { params.co_cr = state.filters.cr.toString(); }

    try {
      const response = await this.$api.$get('land-use/', {
        params,
      });

      if (!response.features || !response.features.length) {
        commit('setShowFeaturesLandUse', false);
        commit(
          'alert/addAlert',
          { message: this.$i18n.t('no-result') },
          { root: true },
        );
      } else {
        commit('setFeatures', response);
        commit('setShowFeaturesLandUse', true);
        const total = await this.$api.$get('land-use/stats/', {
          params,
        });
        if (total) commit('setTotal', total);
      }
    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingFeatures', false);
      commit('setLoadingGeoJson', false);
      commit('setLoadingTable', false);
    }
  },

  async getFilterOptions({ commit }) {
    const regional_coordinators = await this.$api.$get('land-use/cr/');
    const data = {};

    if (regional_coordinators) {
      data.regionalFilters = regional_coordinators.sort(
        (a, b) => a.ds_cr > b.ds_cr,
      );
    }

    commit('setFilterOptions', data);
  },

  async getTiOptions({ commit, state }, cr) {
    let tis = await this.$api.$get('land-use/ti/');
    if (cr){
      const params = {
        co_cr: cr.toString(),
      };
      tis = await this.$api.$get('land-use/ti/', {
        params,
      });
    }
    if (tis) {
      commit('setClearTis')
      commit('setFilterOptions', {
        ...state.filterOptions,
        tiFilters: tis.sort((a, b) => a.no_ti > b.no_ti),
      });
    }
  },

  async getYearsOptions({ commit, state }, ti) {
    const params = {
      co_funai: ti.toString(),
    };

    const years = await this.$api.$get('land-use/years/', {
      params,
    });

    if (years) {
      commit('setFilterOptions', {
        ...state.filterOptions,
        year: years,
      });
    }
  },

  async getDataTableLandUse({ commit, state, rootGetters }) {
    commit('setLoadingGeoJson', true);
    commit('setLoadingFeatures', true);
    commit('setLoadingTable', true);

    const params = {};

    if (state.filters.ti && state.filters.ti.length) { params.co_funai = state.filters.ti.toString(); }

    if (state.filters.year && state.filters.year.length) { params.map_year = state.filters.year.toString(); }

    if (state.filters.cr && state.filters.cr.length) { params.co_cr = state.filters.cr.toString(); }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const tableLandUse = await this.$api.$get('land-use/table/', {
        params,
      });

      if (tableLandUse) commit('setTable', tableLandUse);

      const total = await this.$api.$get('land-use/stats/', {
        params,
      });
      if (total) commit('setTotal', total);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingGeoJson', false);
      commit('setLoadingFeatures', false);
      commit('setLoadingTable', false);
    }
  },

  async downloadTableLandUse({ commit, state, rootGetters }) {
    commit('setLoadingCSV', true);

    const params = {
      format: state.filters.csv,
    };

    if (state.filters.ti && state.filters.ti.length) { params.co_funai = state.filters.ti.toString(); }

    if (state.filters.year && state.filters.year.length) { params.map_year = state.filters.year.toString(); }

    if (state.filters.cr && state.filters.cr.length) { params.co_cr = state.filters.cr.toString(); }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    const tableCSVLandUse = await this.$api.get('land-use/table/', {
      params,
    });

    function saveData(data, fileName, type) {
      let elementBtn; let blob; let
        url;

      elementBtn = document.createElement('a');
      elementBtn.style = 'display: none';
      document.body.appendChild(elementBtn);

      if (type !== 'text/csv') {
        data = JSON.stringify(data);
      }

      blob = new Blob([data], { type });
      url = window.URL.createObjectURL(blob);

      elementBtn.href = url;
      elementBtn.download = fileName;
      elementBtn.click();
      window.URL.revokeObjectURL(url);
    }

    try {
      saveData(
        tableCSVLandUse.data,
        'land_use_and_ocupation.csv',
        'text/csv',
      );
    } finally {
      commit('setLoadingCSV', false);
    }
  },

  async downloadGeoJsonLandUse({ commit, state, rootGetters }) {
    commit('setLoadingGeoJson', true);

    const params = {
      format: state.filters.csv,
      format: state.filters.json,
    };

    if (state.filters.ti && state.filters.ti.length) { params.co_funai = state.filters.ti.toString(); }

    if (state.filters.year && state.filters.year.length) { params.year_map = state.filters.year.toString(); }

    if (state.filters.cr && state.filters.cr.length) { params.co_cr = state.filters.cr.toString(); }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    const GeoJson = await this.$api.get('land-use/', {
      params,
    });

    function saveData(data, fileName, type) {
      let elementBtn; let blob; let
        url;

      elementBtn = document.createElement('a');
      elementBtn.style = 'display: none';
      document.body.appendChild(elementBtn);

      if (type !== 'text/csv') {
        data = JSON.stringify(data);
      }

      blob = new Blob([data], { type });
      url = window.URL.createObjectURL(blob);

      elementBtn.href = url;
      elementBtn.download = fileName;
      elementBtn.click();
      window.URL.revokeObjectURL(url);
    }

    try {
      saveData(
        GeoJson.data,
        'land_use_and_ocupation.json',
        'application/json',
      );
    } finally {
      commit('setLoadingGeoJson', false);
    }
  },
};
