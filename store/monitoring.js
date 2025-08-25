export default {
  // Estado inicial do módulo
  state: () => ({
    showFeaturesMonitoring: false,
    urlWmsMonitoring: '',
    sublayers: [],
    geoserverLayerMonitoring: process.env.GEOSERVER_MONITORING,
    geoserverLayerMonitoringHeatmap: process.env.GEOSERVER_MONITORING_HEATMAP,
    filters: {
      currentView: false,
      cr: [],
      ti: [],
      startDate: '',
      endDate: '',
      bbox: null,
    },
    stats: {
      totalPolygons: 0,
      areaTotalHa: 0,
    },
    opacity: 100,
    regionalCoordinators: [],
    indigenousLands: [],
    loadingSearchMonitoring: false,
    loadingRegionalCoordinators: false,
    loadingIndigenousLands: false,
    loadingDownloadGeojson: false,
    loadingStatistic: false,
    loadingTable: false,
  }),

  getters: {
    getFilters(state) {
      return state.filters;
    },

    getRegionalCoordinators(state) {
      return state.regionalCoordinators;
    },

    getFormattedRegionalCoordinates: (state) => (key = 'co_cr') => {
      if (!Array.isArray(state.filters.cr)) return [];
      return state.filters.cr.map((r) => r[key]).filter((v) => v != null);
    },

    getIndigenousLands(state) {
      return state.indigenousLands;
    },

    getFormattedIndigenousLands: (state) => (key = 'co_funai') => {
      if (!Array.isArray(state.filters.ti)) return [];
      return state.filters.ti.map((r) => r[key]).filter((v) => v != null);
    },

    getLayerMonitoring(state) {
      return state.geoserverLayerMonitoring;
    },

    getLayerMonitoringHeatmap(state) {
      return state.geoserverLayerMonitoringHeatmap;
    },

    getUrlWmsMonitoring(state) {
      return state.urlWmsMonitoring;
    },

    getOpacity(state) {
      return state.opacity / 100;
    },

    getSublayers(state) {
      return state.sublayers;
    },

    // eslint-disable-next-line no-unused-vars
    getGenerateCqlFilterMonitoring: (state, getters, _, rootGetters) => {
      const cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
      const ti = getters.getFormattedIndigenousLands('co_funai').join(',');
      const { sublayers } = state;
      const { startDate, endDate } = state.filters;
      const wktIntersect = rootGetters['map/bboxWkt'];
      const intersects = state.filters.currentView ? `INTERSECTS(geom, ${wktIntersect})` : '';

      const filters = [];
      if (cr && cr.length) {
        filters.push(`co_cr IN (${cr})`);
      }

      if (ti && ti.length) {
        filters.push(`co_funai IN (${ti})`);
      }

      if (startDate && endDate) {
        filters.push(`dt_t_um BETWEEN '${state.filters.startDate}' AND '${state.filters.endDate}'`);
      }

      if (intersects) {
        filters.push(intersects);
      }

      if (sublayers && sublayers.length) {
        // no_estagio IN ('DR','CR')
        filters.push(`no_estagio IN (${sublayers.map((s) => `'${s.key}'`).join(',')})`);
      }

      console.log(filters.join(' AND '));

      return filters.join(' AND ');
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

    setUrlWmsMonitoring(state, url) {
      state.urlWmsMonitoring = url;
    },

    setLoadingSearchMonitoring(state, loading) {
      state.loadingSearchMonitoring = loading;
    },

    setOpacity(state, opacity) {
      state.opacity = opacity;
    },

    setMonitoringStats(state, stats) {
      state.stats = {
        ...state.stats,
        ...stats,
      };
    },

    setMonitoringSublayers(state, sublayers) {
      const formattedSublayers = sublayers.Legend
        .flatMap((r) => r.rules)
        .filter((rule) => rule.filter)
        .map((rule) => ({
          title: rule.title,
          key: rule.name,
          visible: true,
          color: rule.symbolizers[0].Polygon.fill,
        }))
        .sort((a, b) => a.title.localeCompare(b.title));
      console.log('🚀 ~ setMonitoringSublayers ~ formattedSublayers:', formattedSublayers);
      state.sublayers = formattedSublayers;
    },

    toggleSublayer(state, index, value) {
      state.sublayers[index].visible = value;
    },
  },

  actions: {
    updateWmsMonitoring({ commit, getters, rootState }) {
      let urlGeoserver = rootState.map.geoserverUrl;
      urlGeoserver += `&CQL_FILTER=${encodeURIComponent(getters.getGenerateCqlFilterMonitoring)}`;
      commit('setUrlWmsMonitoring', urlGeoserver);
    },

    async generateUrlWmsMonitoring({ commit, dispatch, rootGetters }) {
      try {
        commit('setLoadingSearchMonitoring', true);
        await dispatch('generateMonitoringStats');
        await dispatch('zoomMapBboxRegionalCoordinates');
        await dispatch('getMonitoringSublayers');
        commit('updateWmsMonitoring');
        commit('setShowFeaturesMonitoring', true);
        commit('setCurrentBbox', rootGetters['map/bboxWkt']);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingSearchMonitoring', false);
      }
    },

    async updateMonitoringStats({
      state, commit, getters, rootGetters,
    }) {
      try {
        commit('setLoadingMonitoringFilter', false);
        commit('setLoadingMonitoringStats', false);
        commit('resetLegendVisibility');

        const params = {
          start_date: state.filters.startDate,
          end_date: state.filters.endDate,
        };

        if (state.filters.currentView) {
          params.in_bbox = state.filters.bbox;
        } else {
          params.co_funai = getters.getFormattedIndigenousLands('co_funai').join(',');
          params.co_cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
        }

        const response = await this.$api.$get('monitoring/consolidated/map-stats/', { params });

        if (response) {
          commit('setTotalArea', response.total_area || 0);
          commit('setTotalFeatures', response.total_features || 0);
          await commit('setAvailableEstagios', response.stages || []);
          commit('initializeLegendVisibility');
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas de monitoramento:', error);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring statistics'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingMonitoringFilter', true);
        commit('setLoadingMonitoringStats', true);
      }
    },

    async getMonitoringSublayers({ commit, getters, rootState }) {
      const urlGeoserver = rootState.map.geoserverUrl;
      const params = {
        service: 'WMS',
        version: '1.1.0',
        request: 'GetLegendGraphic',
        layer: getters.getLayerMonitoring,
        format: 'application/json',
      };
      const response = await this.$api.$get(urlGeoserver, { params });
      commit('setMonitoringSublayers', response);
    },

    async generateMonitoringStats({ commit, state, rootGetters }) {
      const params = {
        start_date: state.filters.startDate,
        end_date: state.filters.endDate,
        cr: state.filters.cr,
        ti: state.filters.ti,
        bbox: rootGetters['map/bbox'],
      };
      const stats = await this.$api.$get('monitoring/consolidated/stats/', { params });
      commit('setMonitoringStats', stats);
    },

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
        if (state.filters.cr && state.filters.cr.length) {
          commit('setLoadingIndigenousLands', true);
          const params = { co_cr: state.filters.cr.map((cr) => cr.co_cr).join(',') };
          const indigenousLands = await this.$api.$get('funai/ti/', { params });
          commit('setIndigenousLands', indigenousLands);
        }
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

    async zoomMapBboxRegionalCoordinates({ getters }) {
      try {
        if (
          getters.getFormattedRegionalCoordinates('co_cr').length
          || getters.getFormattedIndigenousLands('co_funai').length
        ) {
          const body = {
            co_cr: getters.getFormattedRegionalCoordinates('co_cr'),
            co_funai: getters.getFormattedIndigenousLands('co_funai'),
          };
          const bbox = await this.$api.$post('monitoring/consolidated/bbox/', body);
          if (bbox) {
            // eslint-disable-next-line no-undef
            const bounds = L.latLngBounds([bbox[1], bbox[0]], [bbox[3], bbox[2]]);
            window.mapMain.fitBounds(bounds, { animated: true });
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
