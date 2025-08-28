export default {
  state: () => ({
    showFeaturesMonitoring: false,
    urlWmsMonitoring: '',
    geoserverLayerMonitoring: process.env.GEOSERVER_MONITORING,
    geoserverLayerMonitoringHeatmap: process.env.GEOSERVER_MONITORING_HEATMAP,
    downloadGeoserverMaxFeatures: process.env.DOWNLOAD_GEOSERVER_MAX_FEATURES,
    filters: {
      currentView: false,
      cr: [],
      ti: [],
      startDate: '',
      endDate: '',
      bbox: null,
    },
    stats: {
      totalFeatures: 0,
      totalArea: 0,
      stages: [],
      tableMonitoring: [],
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
    loadingStats: false,
  }),

  getters: {
    getShowFeaturesMonitoring(state) { return state.showFeaturesMonitoring; },
    getFilters(state) { return state.filters; },
    getRegionalCoordinators(state) { return state.regionalCoordinators; },
    getIndigenousLands(state) { return state.indigenousLands; },
    getLayerMonitoring(state) { return state.geoserverLayerMonitoring; },
    getLayerMonitoringHeatmap(state) { return state.geoserverLayerMonitoringHeatmap; },
    getUrlWmsMonitoring(state) { return state.urlWmsMonitoring; },
    getOpacity(state) { return state.opacity / 100; },
    getStats: (state) => state.stats,

    getFormattedRegionalCoordinates: (state) => (key = 'co_cr') => {
      if (!Array.isArray(state.filters.cr)) return [];
      return state.filters.cr.map((r) => r[key]).filter((v) => v != null);
    },

    getFormattedIndigenousLands: (state) => (key = 'co_funai') => {
      if (!Array.isArray(state.filters.ti)) return [];
      return state.filters.ti.map((r) => r[key]).filter((v) => v != null);
    },

    getParamsMonitoringGeoserver: (state, getters) => ({
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: getters.getLayerMonitoring,
      outputFormat: 'application/json',
      CQL_FILTER: getters.getGenerateCqlFilterMonitoring,
      maxFeatures: state.downloadGeoserverMaxFeatures,
    }),

    // eslint-disable-next-line no-unused-vars
    getGenerateCqlFilterMonitoring: (state, getters, _, rootGetters) => {
      const cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
      const ti = getters.getFormattedIndigenousLands('co_funai').join(',');
      const { stages } = state.stats;
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

      if (stages && stages.length) {
        // no_estagio IN ('DR','CR')
        filters.push(`no_estagio IN (${stages.filter((stage) => stage.visible).map((stage) => `'${stage.name}'`).join(',')})`);
      }

      console.log(filters.join(' AND '));

      return filters.join(' AND ');
    },

  },

  mutations: {
    setShowFeaturesMonitoring(state, value) { state.showFeaturesMonitoring = value; },
    setLoadingRegionalCoordinators(state, loading) { state.loadingRegionalCoordinators = loading; },
    setIndigenousLands(state, indigenousLands) { state.indigenousLands = indigenousLands; },
    setLoadingIndigenousLands(state, loading) { state.loadingIndigenousLands = loading; },
    setUrlWmsMonitoring(state, url) { state.urlWmsMonitoring = url; },
    setLoadingSearchMonitoring(state, loading) { state.loadingSearchMonitoring = loading; },
    setLoadingStats(state, value) { state.loadingStats = value; },
    setLoadingDownloadGeojson(state, loading) { state.loadingDownloadGeojson = loading; },
    setOpacity(state, opacity) { state.opacity = opacity; },
    setCurrentBbox(state, bbox) { state.filters.bbox = bbox; },
    setLoadingTable(state, loading) { state.loadingTable = loading; },
    clearTableMonitoring(state) { state.stats.tableMonitoring = []; },

    setRegionalCoordinators(state, regionalCoordinators) {
      state.regionalCoordinators = regionalCoordinators;
    },

    setFilters(state, filters) {
      state.filters = {
        ...state.filters,
        ...filters,
      };
    },

    setMonitoringStats(state, stats) {
      const colors = {
        CR: '#d92b3f',
        DG: '#ff8000',
        DR: '#909',
        FF: '#b35900',
      };
      const stages = stats.stages.map((stage) => ({
        name: stage,
        visible: true,
        color: colors[stage],
      }));
      state.stats = {
        totalFeatures: stats.total_features,
        totalArea: stats.total_area,
        stages,
      };
    },

    setUpdateMonitoringStats(state, { totalFeatures, totalArea }) {
      state.stats = {
        ...state.stats,
        totalFeatures,
        totalArea,
      };
    },

    toggleStatsStages(state, { key, value }) {
      state.stats.stages[key].visible = value;
    },

    setTableMonitoring(state, tableMonitoring) {
      const tableData = tableMonitoring.map(({ properties }) => ({
        origin_id: properties.origin_id || '',
        co_funai: properties.co_funai || '',
        ds_cr: properties.ds_cr || '',
        no_ti: properties.no_ti || '',
        no_estagio: properties.no_estagio || '',
        dt_imagem: properties.dt_imagem || '',
        nu_area_ha: parseFloat(properties.nu_area_ha) || 0,
        nu_area_cr_ha: properties.no_estagio === 'CR' ? parseFloat(properties.nu_area_ha) || 0 : 0,
        nu_area_dg_ha: properties.no_estagio === 'DG' ? parseFloat(properties.nu_area_ha) || 0 : 0,
        nu_area_dr_ha: properties.no_estagio === 'DR' ? parseFloat(properties.nu_area_ha) || 0 : 0,
        nu_area_ff_ha: properties.no_estagio === 'FF' ? parseFloat(properties.nu_area_ha) || 0 : 0,
        nu_latitude: parseFloat(properties.nu_latitude) || 0,
        nu_longitude: parseFloat(properties.nu_longitude) || 0,
      }));
      state.stats.tableMonitoring = tableData;
    },

  },

  actions: {
    updateWmsMonitoring({ commit, getters, rootState }) {
      let urlGeoserver = rootState.map.geoserverUrl;
      urlGeoserver += `&CQL_FILTER=${encodeURIComponent(getters.getGenerateCqlFilterMonitoring)}`;
      commit('setUrlWmsMonitoring', urlGeoserver);
    },

    async generateUrlWmsMonitoring({
      state, commit, dispatch, rootGetters,
    }) {
      try {
        commit('setLoadingSearchMonitoring', true);
        commit('setMonitoringStats', { ...state.stats, stages: [] });
        await dispatch('generateMonitoringStats');
        await dispatch('zoomMapBboxRegionalCoordinates');
        dispatch('updateWmsMonitoring');
        commit('setShowFeaturesMonitoring', true);
        commit('setCurrentBbox', rootGetters['map/bbox']);
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

    async downloadMonitoringGeojson({
      state, commit, getters, rootState,
    }) {
      try {
        commit('setLoadingDownloadGeojson', true);
        if (state.stats.totalFeatures > state.downloadGeoserverMaxFeatures) {
          const confirmed = await this.$confirm();
          if (!confirmed) return;
        }
        const response = await this.$api.$get(rootState.map.geoserverUrl, {
          params: getters.getParamsMonitoringGeoserver,
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response);
        Object.assign(document.createElement('a'), {
          href: url, download: `monitoring_${new Date().toISOString().split('T')[0]}.geojson`,
        }).click();
        URL.revokeObjectURL(url);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('download'),
            resource: this.$i18n.t('monitoring data'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingDownloadGeojson', false);
      }
    },

    async getDataTableMonitoring({ commit, getters, rootState }) {
      try {
        commit('setLoadingTable', true);
        const params = {
          ...getters.getParamsMonitoringGeoserver,
          CQL_FILTER: getters.getGenerateCqlFilterMonitoring,
        };
        const response = await this.$api.$get(rootState.map.geoserverUrl, { params });
        commit('setTableMonitoring', response.features);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring data'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingTable', false);
      }
    },

    async generateMonitoringStats({ commit, state, getters }, isUpdate = false) {
      try {
        commit('setLoadingStats', true);
        const params = {
          start_date: state.filters.startDate,
          end_date: state.filters.endDate,
        };
        if (isUpdate && state.stats.stages && state.stats.stages.length) {
          params.stage = state.stats.stages.filter((stage) => stage.visible).map((stage) => stage.name).join(',') || 'NONE';
        }
        if (state.filters.currentView) {
          params.in_bbox = state.filters.bbox;
        } else {
          params.co_cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
          params.co_funai = getters.getFormattedIndigenousLands('co_funai').join(',');
        }

        const stats = await this.$api.$get('monitoring/consolidated/map-stats/', { params });
        if (isUpdate) {
          commit('setUpdateMonitoringStats', { totalFeatures: stats.total_features, totalArea: stats.total_area || 0 });
        } else {
          commit('setMonitoringStats', stats);
        }
      } catch (error) {
        console.error(error);
      } finally {
        commit('setLoadingStats', false);
      }
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
