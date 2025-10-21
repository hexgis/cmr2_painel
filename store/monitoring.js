import centroid from '@turf/centroid';
import { convertToCSV, saveData } from '@/utils/csv';

export default {
  state: () => ({
    showFeaturesMonitoring: false,
    heatMapMonitoring: false,
    urlWmsMonitoring: '',
    analyticsData: [],
    geoserverLayerMonitoring: process.env.GEOSERVER_MONITORING,
    geoserverLayerMonitoringHeatmap: process.env.GEOSERVER_MONITORING_HEATMAP,
    downloadGeoserverMaxFeatures: process.env.DOWNLOAD_GEOSERVER_MAX_FEATURES,
    filters: {
      currentView: false,
      currentTab: 'data',
      cr: [],
      ti: [],
      startCycle: null,
      endCycle: null,
      startDate: '',
      endDate: '',
      bbox: null,
      bboxWkt: null,
    },
    stats: {
      totalFeatures: 0,
      totalArea: 0,
      stages: [],
      tableMonitoring: [],
      heatmapMonitoring: [],
      tiByStages: [],
      rangeCycles: null,
    },
    opacity: 100,
    cycles: [],
    loadingSearchMonitoring: false,
    loadingRegionalCoordinators: false,
    loadingIndigenousLands: false,
    loadingDownloadGeojson: false,
    loadingStatistic: false,
    loadingTable: false,
    loadingStats: false,
    loadingDownloadCSV: false,
    loadingHeatmap: false,
    loadingCycles: false,
  }),

  getters: {
    getShowFeaturesMonitoring(state) { return state.showFeaturesMonitoring; },
    getFilters(state) { return state.filters; },
    getRegionalCoordinators(state) { return state.regionalCoordinators; },
    getIndigenousLands(state) { return state.indigenousLands; },
    getCycles(state) { return state.cycles; },
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

    getParamsMonitoringGeoserver: (state, getters) => (heatmap = false) => ({
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: heatmap ? getters.getLayerMonitoringHeatmap : getters.getLayerMonitoring,
      outputFormat: 'application/json',
      CQL_FILTER: getters.getGenerateCqlFilterMonitoring,
      maxFeatures: state.downloadGeoserverMaxFeatures,
    }),

    getGenerateCqlFilterMonitoring: (state, getters) => {
      const cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
      const ti = getters.getFormattedIndigenousLands('co_funai').join(',');
      const { stages } = state.stats;
      const {
        startDate, endDate, bboxWkt, startCycle, endCycle, currentTab,
      } = state.filters;
      const intersects = state.filters.currentView ? `INTERSECTS(geom, ${bboxWkt})` : '';

      const filters = [];
      if (cr && cr.length) {
        filters.push(`co_cr IN (${cr})`);
      }

      if (ti && ti.length) {
        filters.push(`co_funai IN (${ti})`);
      }

      if (currentTab === 'cycle' && startCycle && endCycle) {
        filters.push(`dt_t_um BETWEEN '${state.stats.rangeCycles.start_date}' AND '${state.stats.rangeCycles.end_date}'`);
      } else if (startDate && endDate) {
        filters.push(`dt_t_um BETWEEN '${state.filters.startDate}' AND '${state.filters.endDate}'`);
      }

      if (intersects) {
        filters.push(intersects);
      }

      if (stages && stages.length) {
        const stagesVisible = stages.filter((stage) => stage.visible);
        if (stagesVisible.length) {
          // no_estagio IN ('DR','CR')
          filters.push(`no_estagio IN (${stagesVisible.map((stage) => `'${stage.name}'`).join(',')})`);
        }
      }

      console.log(filters.join(' AND '));

      return filters.join(' AND ');
    },

    getActiveLegendItems: (state) => state.stats.stages
      .filter((stage) => stage.visible)
      .map((stage) => ({ ...stage, label: stage.name })),

    checkStageActive: (state) => (stage) => state.stats.stages.find(
      (s) => s.name === stage.no_estagio && s.visible,
    ),

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
    setLoadingDownloadCSV(state, loading) { state.loadingDownloadCSV = loading; },
    setOpacity(state, opacity) { state.opacity = opacity; },
    setLoadingTable(state, loading) { state.loadingTable = loading; },
    setLoadingStatistic(state, loading) { state.loadingStatistic = loading; },
    clearTableMonitoring(state) { state.stats.tableMonitoring = []; },
    clearAnalyticsData(state) { state.analyticsData = []; },
    setHeatMapMonitoring(state, value) { state.heatMapMonitoring = value; },
    setLoadingHeatmap(state, loading) { state.loadingHeatmap = loading; },
    setLoadingCycles(state, loading) { state.loadingCycles = loading; },
    setCycles(state, cycles) { state.cycles = cycles; },
    setRangeCycles(state, range) { state.stats.rangeCycles = range; },

    setCurrentBbox(state, { bbox, bboxWkt }) {
      state.filters.bbox = bbox;
      state.filters.bboxWkt = bboxWkt;
    },

    clearHeatmap(state) {
      state.heatMapMonitoring = false;
      state.stats.heatmapMonitoring = [];
    },

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
        ...state.stats,
        totalFeatures: stats.total_features,
        totalArea: stats.total_area,
        stages,
        tiByStages: stats.tiByStages,
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

    setAnalyticsData(state, analyticsData) {
      const formattedAnalytics = analyticsData.map((item) => {
        const newItem = { ...item };
        Object.keys(newItem).forEach((key) => {
          if (typeof newItem[key] === 'string' && newItem[key].endsWith('%')) {
            const percentValue = newItem[key].replace('%', '').replace(',', '.');
            const numberValue = parseFloat(percentValue);
            if (!Number.isNaN(numberValue)) {
              const roundedValue = Math.ceil(numberValue * 1000) / 1000;
              newItem[key] = `${roundedValue.toFixed(3).replace('.', ',')}%`;
            }
          }
        });
        return newItem;
      });
      state.analyticsData = formattedAnalytics;
    },

    setResultsHeatmap(state, resultsHeatMap) {
      const pointsHeatMap = [];
      if (resultsHeatMap) {
        resultsHeatMap.features.forEach((feature) => {
          if (
            feature.geometry
            && (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint')
            && feature.geometry.coordinates.length
          ) {
            if (feature.geometry.type === 'Point') {
              pointsHeatMap.push([
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
                1,
              ]);
            }
            if (feature.geometry.type === 'MultiPoint') {
              feature.geometry.coordinates.forEach((coord) => {
                pointsHeatMap.push([coord[1], coord[0], 1]);
              });
            }
          }
          if (
            feature.geometry
            && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')
            && feature.geometry.coordinates.length
          ) {
            const polygonPoints = centroid(feature);
            pointsHeatMap.push([
              polygonPoints.geometry.coordinates[1],
              polygonPoints.geometry.coordinates[0],
              1,
            ]);
          }
        });
      }
      state.stats.heatmapMonitoring = pointsHeatMap;
    },

  },

  actions: {
    async updateWmsMonitoring({
      state, dispatch, commit, getters, rootState,
    }) {
      let urlGeoserver = rootState.map.geoserverUrl;
      urlGeoserver += `&CQL_FILTER=${encodeURIComponent(getters.getGenerateCqlFilterMonitoring)}`;
      commit('setUrlWmsMonitoring', urlGeoserver);
      if (state.heatMapMonitoring) {
        commit('clearHeatmap');
        // commit('setHeatMapMonitoring', true);
        await dispatch('generateHeatmapMonitoring');
        commit('setHeatMapMonitoring', true);
      }
    },

    async generateUrlWmsMonitoring({
      state, commit, dispatch, rootGetters,
    }) {
      try {
        commit('setLoadingSearchMonitoring', true);
        commit('setMonitoringStats', { ...state.stats, stages: [] });
        commit('clearHeatmap');
        commit('setCurrentBbox', { bbox: rootGetters['map/bbox'], bboxWkt: rootGetters['map/bboxWkt'] });
        await dispatch('generateMonitoringStats');
        await dispatch('zoomMapBboxRegionalCoordinates');
        dispatch('updateWmsMonitoring');
        commit('setShowFeaturesMonitoring', true);
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

    async generateMonitoringStats({ commit, state, getters }, isUpdate = false) {
      try {
        commit('setLoadingStats', true);
        const params = {};

        if (isUpdate && state.stats.stages && state.stats.stages.length) {
          params.stage = state.stats.stages.filter((stage) => stage.visible).map((stage) => stage.name).join(',') || 'NONE';
        }

        if (state.filters.currentView) {
          params.in_bbox = state.filters.bbox;
        } else {
          params.co_cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
          params.co_funai = getters.getFormattedIndigenousLands('co_funai').join(',');
        }

        if (state.filters.currentTab === 'cycle' && state.filters.startCycle && state.filters.endCycle) {
          const dateRange = await this.$api.$get('monitoring/consolidated/cycles/date-range/', {
            params: {
              cycles: `${state.filters.startCycle.no_ciclo},${state.filters.endCycle.no_ciclo}`,
            },
          });
          params.start_date = dateRange.start_date;
          params.end_date = dateRange.end_date;
          commit('setRangeCycles', dateRange);
        } else {
          params.start_date = state.filters.startDate;
          params.end_date = state.filters.endDate;
        }

        const stats = await this.$api.$get('monitoring/consolidated/map-stats/', { params });

        if (isUpdate) {
          commit('setUpdateMonitoringStats', { totalFeatures: stats.total_features, totalArea: stats.total_area || 0 });
        } else {
          const tiByStages = Object.values(
            stats.ti_by_stages.reduce((acc, item) => {
              if (!acc[item.no_ti]) {
                acc[item.no_ti] = {
                  no_ti: item.no_ti,
                  stages: [],
                  total_area: 0,
                };
              }
              acc[item.no_ti].stages.push({
                no_estagio: item.no_estagio,
                area_ha: item.nu_area_ha,
              });
              acc[item.no_ti].total_area += item.nu_area_ha;
              return acc;
            }, {}),
          );
          commit('setMonitoringStats', { ...stats, tiByStages });
        }
      } catch (error) {
        console.error(error);
      } finally {
        commit('setLoadingStats', false);
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
          const confirmed = await this.$confirm({
            typeDescription: 'detailed',
            descriptionFirst: this.$i18n.t('monitoring-description-label-1'),
            descriptionSecond: this.$i18n.t('monitoring-description-label-2'),
            confirm: this.$i18n.t('download'),
            iconConfirm: 'mdi-download',
            iconCancel: 'mdi-close',
          });
          if (!confirmed) return;
        }
        const response = await this.$api.$get(rootState.map.geoserverUrl, {
          params: getters.getParamsMonitoringGeoserver(),
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
          ...getters.getParamsMonitoringGeoserver(),
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

    async getDataAnalyticsMonitoring({
      commit, state, getters, rootGetters,
    }, groupingKey) {
      try {
        commit('setLoadingStatistic', true);
        const params = {};
        if (state.filters.startDate && state.filters.endDate) {
          params.start_date = state.filters.startDate;
          params.end_date = state.filters.endDate;
          params.grouping = groupingKey;
        }
        if (state.filters.ti.length) {
          params.co_funai = getters.getFormattedIndigenousLands('co_funai').join(',');
        }
        if (state.filters.cr.length) {
          params.co_cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
        }
        if (state.filters.currentView) {
          params.in_bbox = rootGetters['map/bbox'];
        }
        const analyticsMonitoring = await this.$api.$get('monitoring/consolidated/table-stats/', { params });
        commit('setAnalyticsData', analyticsMonitoring);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring data'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingStatistic', false);
      }
    },

    async downloadAnalyticCSV({ commit, state }, defaultFileName) {
      try {
        commit('setLoadingDownloadCSV', true);
        const csvData = convertToCSV(state.analyticsData);
        saveData(csvData, defaultFileName);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring data'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingDownloadCSV', false);
      }
    },

    async generateHeatmapMonitoring({ commit, getters, rootState }) {
      try {
        commit('setLoadingHeatmap', true);
        const params = {
          ...getters.getParamsMonitoringGeoserver(true),
          CQL_FILTER: getters.getGenerateCqlFilterMonitoring,
        };
        const response = await this.$api.$get(rootState.map.geoserverUrl, { params });
        commit('setResultsHeatmap', response);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('heatmap data'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingHeatmap', false);
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
              resource: this.$i18n.t('monitoring'),
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

    async getCyclesOptions({ commit }) {
      try {
        commit('setLoadingCycles', true);
        const cycles = await this.$api.$get('monitoring/consolidated/cycles/options/');
        commit('setCycles', cycles);
      } catch (error) {
        commit(
          'alert/addAlert',
          {
            message: this.$i18n.t('default-error', {
              action: this.$i18n.t('retrieve'),
              resource: this.$i18n.t('cycle'),
            }),
            type: 'error',
          },
          { root: true },
        );
      } finally {
        commit('setLoadingCycles', false);
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
