export default {
  // Estado inicial do módulo
  state: () => ({
    showFeaturesMonitoring: false,
    urlWmsMonitoring: '',
    geoserverLayerMonitoring: process.env.GEOSERVER_MONITORING,
    geoserverLayerMonitoringHeatmap: process.env.GEOSERVER_MONITORING_HEATMAP,
    filters: {
      currentView: false,
      cr: [],
      ti: [],
      startDate: '',
      endDate: '',
    },
    regionalCoordinators: [],
    indigenousLands: [],
    loadingRegionalCoordinators: false,
    loadingIndigenousLands: false,
  }),

  getters: {
    getFilters(state) {
      return state.filters;
    },

    getRegionalCoordinators(state) {
      return state.regionalCoordinators;
    },

    getIndigenousLands(state) {
      return state.indigenousLands;
    },
  },

  mutations: {
    setShowFeaturesMonitoring(state, value) {
      state.showFeaturesMonitoring = value;
    },

    setFilters(state, filters) {
      state.filters = {
        ...state.filters,
        ...filters,
      };
    },

    setRegionalCoordinators(state, regionalCoordinators) {
      state.regionalCoordinators = regionalCoordinators;
    },

    setLoadingRegionalCoordinators(state, loading) {
      state.loadingRegionalCoordinators = loading;
    },

    setIndigenousLands(state, indigenousLands) {
      state.indigenousLands = indigenousLands;
    },

    setLoadingIndigenousLands(state, loading) {
      state.loadingIndigenousLands = loading;
    },
  },

  actions: {
    async getFilterOptions({ commit }) {
      try {
        commit('setLoadingRegionalCoordinators', true);
        const regionalCoordinators = await this.$api.$get('funai/cr/');
        commit('setRegionalCoordinators', regionalCoordinators);
      } catch (error) {
        commit(
          'alert/addAlert',
          {
            message: this.$i18n.t('default-error', {
              action: this.$i18n.t('retrieve'),
              resource: this.$i18n.t('regional coordinators'),
            }),
            type: 'error',
          },
          { root: true },
        );
      } finally {
        commit('setLoadingRegionalCoordinators', false);
      }
    },

    async getTiOptions({ commit, state }) {
      try {
        commit('setLoadingIndigenousLands', true);
        const params = { co_cr: state.filters.cr.map((cr) => cr.co_cr).join(',') };
        const indigenousLands = await this.$api.$get('funai/ti/', { params });
        commit('setIndigenousLands', indigenousLands);
      } catch (error) {
        commit(
          'alert/addAlert',
          {
            message: this.$i18n.t('default-error', {
              action: this.$i18n.t('retrieve'),
              resource: this.$i18n.t('indigenous territories'),
            }),
            type: 'error',
          },
          { root: true },
        );
      } finally {
        commit('setLoadingIndigenousLands', false);
      }
    },
  },
};
