import { version } from 'jszip';
import { convertToCSV, saveData } from '@/utils/csv';
import centroid from '@turf/centroid';

const { stringify } = require('wkt');

export const state = () => ({
  features: null,
  urlWmsMonitoring: 'https://cmrhomolog.funai.gov.br/geoserver/ows?',
  geoserverLayerMonitoring: 'CMR-PUBLICO:img_monitoramento_terra_indigena_cr_a',
  urlWmsMonitoringHeatmap: 'https://cmrhomolog.funai.gov.br/geoserver/ows?',
  geoserverLayerMonitoringHeatmap: 'CMR-PUBLICO:vwm_heatmap_ti_cr_p',
  resultsHeatmap: [],
  resultsHeatmapOptions: {
    minOpacity: 0.5,
    maxZoom: 18,
    radius: 20,
    blur: 15,
    zIndex: 4,
  },
  loadingHeatmap: false,
  monitoringSubLayers: {
    CR: true,
    DG: true,
    DR: true,
    FF: true,
  },
  intersectsWmsMonitoring: '',
  MonitoringWmsOptions: {
    name: 'monitoring',
    maxZoom: 21,
    maxNativeZoom: 19,
    queryable: true,
  },
  MonitoringWmsOptionsHeatmap: {
    name: 'monitoringHeatmap',
    maxZoom: 21,
    maxNativeZoom: 19,
    queryable: true,
  },
  tableMonitoringTableOptions: {
    itemsPerPage: 5,
    page: 1,
    totalItems: 0,
  },
  showTableDialogMonitoring: false,
  loadingSearchTableMonitoring: false,
  currentUrlWmsMonitoring: '',
  wmsMonitoringOpacity: 100,
  showFeaturesMonitoring: false,
  loadingMonitoring: false,
  visualizationStage: 'stage1',
  analyticsMonitoringDialog: false,
  isLoadingCSVMonitoring: false,
  isLoadingStatistic: false,
  isLoadingGeoJson: false,
  isLoadingFeatures: false,
  isLoadingTableMonitoring: false,
  isLoadingDownloadTableMonitoring: false,
  filterOptions: {
    regionalFilters: [],
    tiFilters: [],
  },
  filters: {
    startDate: null,
    endDate: null,
    grouping_by_year: 'monitoring_by_year',
    grouping_by_funai: 'monitoring_by_co_funai',
    grouping_by_co_funai_year: 'monitoring_by_co_funai_and_year',
    grouping_by_day: 'monitoring_by_day',
    grouping_by_co_funai_and_monthyear: 'monitoring_by_co_funai_and_monthyear',
    grouping_by_monthyear: 'monitoring_by_monthyear',
    csv: 'csv',
    json: 'json',
  },

  opacity: 100,
  heatMap: false,
  total: null,
  analyticsMonitoring: [],
  tableMonitoring: [],
  tableCSVMonitoring: [],
  analyticsMonitoringcsv: [],
  selectedStages: ['CR', 'DG', 'DR', 'FF'],
  stageItemActive: [],
});

export const getters = {
  getShowFeaturesMonitoring: (state) => {
    return state.showFeaturesMonitoring;
  },

  featuresLoaded(state) {
    return (
      state.features
      && state.features.features
      && state.features.features.length > 0
    );
  },
};

export const mutations = {
  setShowTableDialogMonitoring(state, showTableDialogMonitoring) {
    state.showTableDialogMonitoring = showTableDialogMonitoring;
  },

  setIsLoadingDownloadTableMonitoring(state, isLoadingDownloadTableMonitoring) {
    state.isLoadingDownloadTableMonitoring = isLoadingDownloadTableMonitoring;
  },

  setLoadingSearchTableMonitoring(state, loadingSearchTableMonitoring) {
    state.loadingSearchTableMonitoring = loadingSearchTableMonitoring;
  },

  setTableMonitoringTableOptions(state, tableMonitoringTableOptions) {
    state.tableMonitoringTableOptions = tableMonitoringTableOptions;
  },

  setTablePropertiesPage(state, page) {
    state.tableMonitoringTableOptions.page = page;
  },

  setTablePropertiesItemsPerPage(state, itemsPerPage) {
    state.tableMonitoringTableOptions.itemsPerPage = itemsPerPage;
  },

  setSelectedStages(state, value) {
    state.selectedStages.push(value);
  },

  setLoadingHeatmap(state, loadingHeatmap) {
    state.loadingHeatmap = loadingHeatmap;
  },

  removeSelectedStages(state, value) {
    const index = state.selectedStages.indexOf(value);
    if (index !== -1) {
      state.selectedStages.splice(index, 1);
    }
  },

  setFeatures(state, features) {
    state.features = features;
    state.isLoadingFeatures = false;
  },

  setStageItemActive(state, value) {
    state.stageItemActive = value
  },

  setshowFeaturesMonitoring(state, showFeaturesMonitoring) {
    state.showFeaturesMonitoring = showFeaturesMonitoring;
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

  setLoadingStatistic(state, payload) {
    state.isLoadingStatistic = payload;
  },

  setAnalytics(state, analyticsMonitoring) {
    const formattedAnalytics = analyticsMonitoring.map(item => {
      const newItem = { ...item };
      for (const key in newItem) {
        if (typeof newItem[key] === 'string' && newItem[key].endsWith('%')) {
          const percentValue = newItem[key].replace('%', '').replace(',', '.');
          const numberValue = parseFloat(percentValue);
          if (!isNaN(numberValue)) {
            const roundedValue = Math.ceil(numberValue * 1000) / 1000;
            newItem[key] = roundedValue.toFixed(3).replace('.', ',') + '%';
          }
        }
      }
      return newItem;
    });
    state.analyticsMonitoring = formattedAnalytics;
  },

  setanalyticsMonitoringDialog(state, analyticsMonitoringDialog) {
    state.analyticsMonitoringDialog = analyticsMonitoringDialog;
  },

  setLoadingFeatures(state, payload) {
    state.isLoadingFeatures = payload;
  },

  setLoadingTableMonitoring(state, payload) {
    state.isLoadingTableMonitoring = payload;
  },

  setFilterOptions(state, data) {
    state.filterOptions = data;
  },

  setOpacity(state, opacity) {
    state.opacity = opacity;
  },

  setDownloadTable(state, tableCSVMonitoring) {
    state.tableCSVMonitoring = tableCSVMonitoring;
  },

  setHeatMap(state, heatMap) {
    state.heatMap = heatMap;
  },

  setLoadingCSV(state, payload) {
    state.isLoadingCSVMonitoring = payload;
  },

  setTable(state, tableMonitoring) {
    state.tableMonitoring = tableMonitoring;
  },

  setFilters(state, filters) {
    state.filters = {
      ...state.filters,
      ...filters,
    };
  },

  setUrlCurrentWmsMonitoring(state, url) {
    state.currentUrlWmsMonitoring = url;
  },

  setLoadingMonitoring(state, loadingMonitoring) {
    state.loadingMonitoring = loadingMonitoring;
  },

  setMonitoringSubLayers(state, { type, value }) {
    state.monitoringSubLayers[type] = value;
  },

  setIntersectsWmsMonitoring(state, intersectsWmsMonitoring) {
    state.intersectsWmsMonitoring = intersectsWmsMonitoring;
  },

  setResultsHeatmap(state, resultsHeatMap) {
    // Create an array to store heatmap points
    const pointsHeatMap = [];

    // Check if a response is provided
    if (resultsHeatMap) {
      // Iterate through the features in the response
      resultsHeatMap.features.forEach((feature) => {
        // Check if the feature has a valid geometry and coordinates
        if (
          feature.geometry && (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint')
          && feature.geometry.coordinates && feature.geometry.coordinates.length
        ) {
          // Handle Point or MultiPoint geometries
          if (feature.geometry.type === 'Point') {
            pointsHeatMap.push(
              [
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
                1,
              ],
            );
          }
          if (feature.geometry.type === 'MultiPoint') {
            // Iterate through the coordinates in MultiPoint geometry
            feature.geometry.coordinates.forEach(((coord) => {
              pointsHeatMap.push(
                [
                  coord[1],
                  coord[0],
                  1,
                ],
              );
            }));
          }
        }

        // Check if the feature has a valid geometry and coordinates
        if (
          feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')
          && feature.geometry.coordinates && feature.geometry.coordinates.length
        ) {
          // Calculate the centroid of Polygon or MultiPolygon geometries
          const polygonPoints = centroid(feature);
          pointsHeatMap.push(
            [
              polygonPoints.geometry.coordinates[1],
              polygonPoints.geometry.coordinates[0],
              1,
            ],
          );
        }
      });

      // Set the state's result layer to the array of heatmap points
      state.resultsHeatmap = pointsHeatMap;
    } else {
      // If no response is provided, set the result layer to an empty array
      state.resultsHeatmap = [];
    }
  },
};

export const actions = {
  async updateFeatures({ state, commit }) {
    let updatedFeatures = { features: state.stageItemActive, ...state.features }
    commit('setFeatures', updatedFeatures);
    commit('setshowFeaturesMonitoring', true);
  },

  async generateUrlWmsMonitoring({ state, commit }, newBbox = false) {
    const map = window.mapMain;

    const params = {
      env: `fill-opacity:${state.opacity / 100}`,
      CQL_FILTER: '',
      opacity: state.opacity,
    };

    let url = state.urlWmsMonitoring;

    // gera os parametros
    if (state.intersectsWmsMonitoring) {
      params.CQL_FILTER += state.intersectsWmsMonitoring;
    }


    const arrayTI = [];
    if (state.filters.ti && state.filters.ti.length) {
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `co_funai IN (${arrayTI.toString()})`;
    }

    const arrayCR = [];
    if (state.filters.cr && state.filters.cr.length) {
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `co_cr IN (${arrayCR.toString()})`;
    }

    if (state.filters.startDate && state.filters.endDate) {
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `(dt_t_um >= (${state.filters.startDate}) AND dt_t_um <= (${state.filters.endDate}))`;
    }

    const filtersSubLayersTrue = Object.keys(state.monitoringSubLayers).filter(key => state.monitoringSubLayers[key] === true);
    if (filtersSubLayersTrue && filtersSubLayersTrue.length) {
      params.CQL_FILTER += ' AND';
      let sublayers = '';
      filtersSubLayersTrue.forEach((value, key) => {
        if (!state.monitoringSubLayers[value]) {
          return;
        }
        if (key === 0) {
          sublayers += ` no_estagio = '${value}'`;
        }
        if (key > 0) {
          sublayers += ` OR no_estagio = '${value}'`;
        }
      });
      params.CQL_FILTER += `(${sublayers})`;
    }

    const paramsUrl = new URLSearchParams(params);

    commit('setUrlCurrentWmsMonitoring', `${url}${paramsUrl}`);
  },

  async getFeatures({ state, commit, dispatch }) {
    // commit('setLoadingGeoJson', true);
    // commit('setLoadingStatistic', true);
    // commit('setLoadingFeatures', true);
    // commit('setLoadingTableMonitoring', true);
    // commit('clearFeatures');
    commit('setUrlCurrentWmsMonitoring', '');

    try {
      commit('setLoadingMonitoring', true);
      commit('setshowFeaturesMonitoring', true);
      commit('setLoadingFeatures', true);
      commit('setHeatMap', false);



      const map = window.mapMain;
      if (state.filters.currentView) {
        const bounds = map.getBounds();

        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const nw = L.latLng(ne.lat, sw.lng);
        const se = L.latLng(sw.lat, ne.lng);

        const bboxPolygon = L.polygon([sw, se, ne, nw, sw]);

        const geojson = bboxPolygon.toGeoJSON();

        const wkt = stringify(geojson.geometry);

        commit('setIntersectsWmsMonitoring', `INTERSECTS(geom,${wkt})`);
      } else {
        commit('setIntersectsWmsMonitoring', '');
      }

      const arrayTI = [];
      if (state.filters.ti && state.filters.ti.length) {
        Object.values(state.filters.ti).forEach((item) => {
          arrayTI.push(item.co_funai);
        });
      }

      const arrayCR = [];
      if (state.filters.cr && state.filters.cr.length) {
        Object.values(state.filters.cr).forEach((item) => {
          arrayCR.push(item.co_cr);
        });
      }

      try {
        if (!state.filters.currentView) {
          let bbox;
          if ((state.filters.cr && state.filters.cr.length) || (state.filters.ti && state.filters.ti.length)) {
            bbox = await this.$api.$post('monitoring/consolidated/bbox/', {
              "co_cr": [...arrayCR],
              "co_funai": [...arrayTI],
            });
            if (bbox) {
              const bounds = L.latLngBounds(
                [bbox[1], bbox[0]],
                [bbox[3], bbox[2]],
              );
              map.fitBounds(bounds);
            }
          }
        }
      } catch (_) {
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
      }

      await dispatch('generateUrlWmsMonitoring');

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
      commit('setLoadingStatistic', false);
      commit('setLoadingFeatures', false);
      commit('setLoadingTableMonitoring', false);
      commit('setLoadingMonitoring', false);
    }
  },

  async getPropertiesTableMonitoring({ state, commit, dispatch }) {
    commit('setLoadingSearchTableMonitoring', true);

    const params = {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: state.geoserverLayerMonitoring,
      outputFormat: 'application/json',
      CQL_FILTER: '',
      maxFeatures: state.tableMonitoringTableOptions.itemsPerPage,
      startIndex: (state.tableMonitoringTableOptions.page - 1) * state.tableMonitoringTableOptions.itemsPerPage,
    };

    try {
      let url;
      url = state.urlWmsMonitoring;

      // gera os parametros
      if (state.intersectsWmsMonitoring) {
        params.CQL_FILTER += state.intersectsWmsMonitoring;
      }


      const arrayTI = [];
      if (state.filters.ti && state.filters.ti.length) {
        Object.values(state.filters.ti).forEach((item) => {
          arrayTI.push(item.co_funai);
        });
        if (params.CQL_FILTER.length) {
          params.CQL_FILTER += ' AND ';
        }
        params.CQL_FILTER += `co_funai IN (${arrayTI.toString()})`;
      }

      const arrayCR = [];
      if (state.filters.cr && state.filters.cr.length) {
        Object.values(state.filters.cr).forEach((item) => {
          arrayCR.push(item.co_cr);
        });
        if (params.CQL_FILTER.length) {
          params.CQL_FILTER += ' AND ';
        }
        params.CQL_FILTER += `co_cr IN (${arrayCR.toString()})`;
      }

      if (state.filters.startDate && state.filters.endDate) {
        if (params.CQL_FILTER.length) {
          params.CQL_FILTER += ' AND ';
        }
        params.CQL_FILTER += `(dt_t_um >= (${state.filters.startDate}) AND dt_t_um <= (${state.filters.endDate}))`;
      }

      const filtersSubLayersTrue = Object.keys(state.monitoringSubLayers).filter(key => state.monitoringSubLayers[key] === true);
      if (filtersSubLayersTrue && filtersSubLayersTrue.length) {
        params.CQL_FILTER += ' AND';
        let sublayers = '';
        filtersSubLayersTrue.forEach((value, key) => {
          if (!state.monitoringSubLayers[value]) {
            return;
          }
          if (key === 0) {
            sublayers += ` no_estagio = '${value}'`;
          }
          if (key > 0) {
            sublayers += ` OR no_estagio = '${value}'`;
          }
        });
        params.CQL_FILTER += `(${sublayers})`;
      }

      const paramsUrl = new URLSearchParams(params);
      url = `${url}${paramsUrl}`;

      const response = await this.$api.$get(url, { params });

      const res = response.features.map((feature) => feature.properties);
      const total = response.totalFeatures;
      commit('setTableMonitoringTableOptions', {
        ...state.tableMonitoringTableOptions,
        totalItems: total,
      });

      commit('setTable', res);
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
      commit('setLoadingSearchTableMonitoring', false);
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

  async getDataTableMonitoring({ commit, state, rootGetters }) {
    commit('setLoadingTableMonitoring', true);

    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.priority && state.filters.priority.length) { params.priority = state.filters.priority.toString(); }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const tableMonitoring = await this.$api.$get(
        'monitoring/consolidated/table/',
        {
          params,
        },
      );

      if (tableMonitoring) commit('setTable', tableMonitoring);
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
      commit('setLoadingTableMonitoring', false);
    }
  },

  async getDataAnalyticsMonitoringByYear({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_year,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
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
      commit('setLoadingStatistic', false);
    }
  },

  async getDataAnalyticsMonitoringByMonthYear({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_monthyear,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
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
      commit('setLoadingStatistic', false);
    }
  },

  async getDataAnalyticsMonitoringByFunai({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_funai,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
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
      commit('setLoadingStatistic', false);
    }
  },

  async getDataAnalyticsMonitoringByFunaiMonthYear({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_co_funai_and_monthyear,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
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
      commit('setLoadingStatistic', false);
    }
  },

  async getDataAnalyticsMonitoringByFunaiYear({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);

    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_co_funai_year
      ,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
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
      commit('setLoadingStatistic', false);
    }
  },

  async getDataAnalyticsMonitoringByDay({ commit, state, rootGetters }) {
    commit('setLoadingStatistic', true);
    const params = {
      start_date: state.filters.startDate,
      end_date: state.filters.endDate,
      grouping: state.filters.grouping_by_day,
    };

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

    try {
      const analyticsMonitoring = await this.$api.$get(
        'monitoring/consolidated/table-stats/',
        {
          params,
        },
      );

      if (analyticsMonitoring) commit('setAnalytics', analyticsMonitoring);
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
      commit('setLoadingStatistic', false);
    }
  },

  async downloadCSV({ commit, state, rootGetters }, { grouping, defaultFileName }) {
    commit('setLoadingCSV', true);
    const params = { start_date: state.filters.startDate, end_date: state.filters.endDate, grouping };

    if (state.filters.cr && state.filters.cr.length) {
      const arrayCR = [];
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      params.co_cr = arrayCR.toString();
    }

    if (state.filters.ti && state.filters.ti.length) {
      const arrayTI = [];
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      params.co_funai = arrayTI.toString();
    }

    if (state.filters.currentView) params.in_bbox = rootGetters['map/bbox'];

  try {
      const analyticsMonitoringcsv = await this.$api.$get(
        'monitoring/consolidated/table-stats/', { params },
      );

      // Verifica se há dados
      if (!analyticsMonitoringcsv || !analyticsMonitoringcsv.length) {
        throw new Error('Nenhum dado disponível para exportação');
      }

      // Converte e faz download
      const csvString = convertToCSV(analyticsMonitoringcsv);
      saveData(csvString, defaultFileName);

  } catch (error) {
      console.error('Erro ao gerar CSV:', error);
  } finally {
      commit('setLoadingCSV', false);
  }
},

  // DATA
  async downloadTableMonitoringAnalyticsByDay({ dispatch, state }) {
    await dispatch('downloadCSV', {
      grouping: state.filters.grouping_by_day,
      defaultFileName: 'poligono_monitoramento_estatisticas_por_dia.csv'
    });
  },

  async downloadTableMonitoringAnalyticsByMonthYear({ dispatch, state }) {
    await dispatch('downloadCSV', {
      grouping: state.filters.grouping_by_monthyear,
      defaultFileName: 'poligono_monitoramento_estatisticas_por_mês_e_ano.csv'
    });
  },

  async downloadTableMonitoringAnalyticsByYear({ dispatch, state }) {
    await dispatch('downloadCSV', {
      grouping: state.filters.grouping_by_year,
      defaultFileName: 'poligono_monitoramento_estatisticas_por_ano.csv'
    });
  },

  // FUNAI
  async downloadTableMonitoringAnalyticsByFunai({ dispatch, state }) {
    await dispatch('downloadCSV', {
      grouping: state.filters.grouping_by_co_funai,
      defaultFileName: 'poligono_monitoramento_estatisticas_por_co_funai_e_dia.csv'
    });
  },

  async downloadTableMonitoringAnalyticsByFunaiMonthYear({ dispatch, state }) {
    await dispatch('downloadCSV', {
      grouping: state.filters.grouping_by_co_funai_and_monthyear,
      defaultFileName: 'poligono_monitoramento_estatisticas_por_co_funai_mês_e_ano.csv'
    });
  },

  async downloadTableMonitoringAnalyticsByFunaiYear({ dispatch, state }) {
    await dispatch('downloadCSV', {
      grouping: state.filters.grouping_by_co_funai_year,
      defaultFileName: 'poligono_monitoramento_estatisticas_por_co_funai_e_ano.csv'
    });
  },

  selectedStages() {
    let features = this.features;
    features.forEach((item) => {
      if (item.properties.no_estagio) {
        switch (value) {
          case 'CR':
            this.featureNoEstagio.cr.push(item);
            commit('setSelectedStages', item);
            break;
          case 'DG':
            this.featureNoEstagio.dg.push(item);
            commit('setSelectedStages', item);
            break;
          case 'FF':
            this.featureNoEstagio.ff.push(item);
            commit('setSelectedStages', item);
            break;
          case 'DR':
            this.featureNoEstagio.dr.push(item);
            commit('setSelectedStages', item);
            break;
        }
      }
    })
  },

  async downloadTableMonitoring({ commit, state }) {
    try {
      commit('setIsLoadingDownloadTableMonitoring', true);
      const params = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: state.geoserverLayerMonitoring,
        outputFormat: 'application/json',
        CQL_FILTER: '',
        maxFeatures: 10000,
      };

      let url;
      url = state.urlWmsMonitoring;

      // gera os parametros
      if (state.intersectsWmsMonitoring) {
        params.CQL_FILTER += state.intersectsWmsMonitoring;
      }


      const arrayTI = [];
      if (state.filters.ti && state.filters.ti.length) {
        Object.values(state.filters.ti).forEach((item) => {
          arrayTI.push(item.co_funai);
        });
        if (params.CQL_FILTER.length) {
          params.CQL_FILTER += ' AND ';
        }
        params.CQL_FILTER += `co_funai IN (${arrayTI.toString()})`;
      }

      const arrayCR = [];
      if (state.filters.cr && state.filters.cr.length) {
        Object.values(state.filters.cr).forEach((item) => {
          arrayCR.push(item.co_cr);
        });
        if (params.CQL_FILTER.length) {
          params.CQL_FILTER += ' AND ';
        }
        params.CQL_FILTER += `co_cr IN (${arrayCR.toString()})`;
      }

      if (state.filters.startDate && state.filters.endDate) {
        if (params.CQL_FILTER.length) {
          params.CQL_FILTER += ' AND ';
        }
        params.CQL_FILTER += `(dt_t_um >= (${state.filters.startDate}) AND dt_t_um <= (${state.filters.endDate}))`;
      }

      const filtersSubLayersTrue = Object.keys(state.monitoringSubLayers).filter(key => state.monitoringSubLayers[key] === true);
      if (filtersSubLayersTrue && filtersSubLayersTrue.length) {
        params.CQL_FILTER += ' AND';
        let sublayers = '';
        filtersSubLayersTrue.forEach((value, key) => {
          if (!state.monitoringSubLayers[value]) {
            return;
          }
          if (key === 0) {
            sublayers += ` no_estagio = '${value}'`;
          }
          if (key > 0) {
            sublayers += ` OR no_estagio = '${value}'`;
          }
        });
        params.CQL_FILTER += `(${sublayers})`;
      }

      const paramsUrl = new URLSearchParams(params);
      url = `${url}${paramsUrl}`;

      const response = await this.$api.$get(url, { params });
      const items = response.features.map((feature) => feature.properties);

      if (!items.length) return;

      const header = Object.keys(items[0]);
      const csvRows = [];

      csvRows.push(header.join(','));

      for (const row of items) {
        const values = header.map(key => {
          const val = row[key];
          if (Array.isArray(val)) return `"${val.join(';')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'monitoring.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      commit('setIsLoadingDownloadTableMonitoring', false);
    }
  },

  async checkHitsDownloadGeojsonMonitoring({ commit, state }) {
    let url = state.urlWmsMonitoring;

    const params = {
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: state.geoserverLayerMonitoring,
      outputFormat: 'application/json',
      resultType: 'hits',
      CQL_FILTER: '',
    }

    const arrayTI = [];
    if (state.filters.ti && state.filters.ti.length) {
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `co_funai IN (${arrayTI.toString()})`;
    }

    const arrayCR = [];
    if (state.filters.cr && state.filters.cr.length) {
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `co_cr IN (${arrayCR.toString()})`;
    }

    if (state.filters.startDate && state.filters.endDate) {
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `(dt_t_um >= (${state.filters.startDate}) AND dt_t_um <= (${state.filters.endDate}))`;
    }

    const filtersSubLayersTrue = Object.keys(state.monitoringSubLayers).filter(key => state.monitoringSubLayers[key] === true);
    if (filtersSubLayersTrue && filtersSubLayersTrue.length) {
      params.CQL_FILTER += ' AND';
      let sublayers = '';
      filtersSubLayersTrue.forEach((value, key) => {
        if (!state.monitoringSubLayers[value]) {
          return;
        }
        if (key === 0) {
          sublayers += ` no_estagio = '${value}'`;
        }
        if (key > 0) {
          sublayers += ` OR no_estagio = '${value}'`;
        }
      });
      params.CQL_FILTER += `(${sublayers})`;
    }

    const paramsUrl = new URLSearchParams(params);
    url = `${url}${paramsUrl}`;

    try {
      const response = await this.$api.$get(url);

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response, "text/xml");

      const featureCollection = xmlDoc.querySelector("wfs\\:FeatureCollection, FeatureCollection");
      const totalFeatures = featureCollection?.getAttribute("numberOfFeatures");

      return totalFeatures;
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
      return false;
    }
  },

  async downloadGeoJsonMonitoring({ commit, state }) {
    commit('setLoadingGeoJson', true);
    let url = state.urlWmsMonitoring;

    const params = {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: state.geoserverLayerMonitoring,
      CQL_FILTER: '',
      outputFormat: 'application/json',
      maxFeatures: 10000,
    }

    const arrayTI = [];
    if (state.filters.ti && state.filters.ti.length) {
      Object.values(state.filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `co_funai IN (${arrayTI.toString()})`;
    }

    const arrayCR = [];
    if (state.filters.cr && state.filters.cr.length) {
      Object.values(state.filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `co_cr IN (${arrayCR.toString()})`;
    }

    if (state.filters.startDate && state.filters.endDate) {
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `(dt_t_um >= (${state.filters.startDate}) AND dt_t_um <= (${state.filters.endDate}))`;
    }

    const filtersSubLayersTrue = Object.keys(state.monitoringSubLayers).filter(key => state.monitoringSubLayers[key] === true);
    if (filtersSubLayersTrue && filtersSubLayersTrue.length) {
      params.CQL_FILTER += ' AND';
      let sublayers = '';
      filtersSubLayersTrue.forEach((value, key) => {
        if (!state.monitoringSubLayers[value]) {
          return;
        }
        if (key === 0) {
          sublayers += ` no_estagio = '${value}'`;
        }
        if (key > 0) {
          sublayers += ` OR no_estagio = '${value}'`;
        }
      });
      params.CQL_FILTER += `(${sublayers})`;
    }

    try {
      const paramsUrl = new URLSearchParams(params);
      url = `${url}${paramsUrl}`;
      const response = await this.$api.$get(url);

      const geojson = {
        type: response.type,
        features: response.features,
      }

      const blob = new Blob([JSON.stringify(geojson)], { type: "application/geo+json" });
      const urlBlob = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = "dados.geojson";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    }
  },

  async generateHeatmapMonitoring({ commit, state }, value) {
    try {
      if (value) {
        commit('setLoadingHeatmap', true);
        let url = state.urlWmsMonitoringHeatmap;

        const params = {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetFeature',
          typeName: state.geoserverLayerMonitoringHeatmap,
          // propertyName: 'geom',
          outputFormat: 'application/json',
          CQL_FILTER: '',
        }

        if (state.intersectsWmsMonitoring) {
          params.CQL_FILTER += state.intersectsWmsMonitoring;
        }

        const arrayTI = [];
        if (state.filters.ti && state.filters.ti.length) {
          Object.values(state.filters.ti).forEach((item) => {
            arrayTI.push(item.co_funai);
          });
          if (params.CQL_FILTER.length) {
            params.CQL_FILTER += ' AND ';
          }
          params.CQL_FILTER += `co_funai IN (${arrayTI.toString()})`;
        }

        const arrayCR = [];
        if (state.filters.cr && state.filters.cr.length) {
          Object.values(state.filters.cr).forEach((item) => {
            arrayCR.push(item.co_cr);
          });
          if (params.CQL_FILTER.length) {
            params.CQL_FILTER += ' AND ';
          }
          params.CQL_FILTER += `co_cr IN (${arrayCR.toString()})`;
        }

        if (state.filters.startDate && state.filters.endDate) {
          if (params.CQL_FILTER.length) {
            params.CQL_FILTER += ' AND ';
          }
          params.CQL_FILTER += `(dt_t_um >= (${state.filters.startDate}) AND dt_t_um <= (${state.filters.endDate}))`;
        }

        const filtersSubLayersTrue = Object.keys(state.monitoringSubLayers).filter(key => state.monitoringSubLayers[key] === true);
        if (filtersSubLayersTrue && filtersSubLayersTrue.length) {
          params.CQL_FILTER += ' AND';
          let sublayers = '';
          filtersSubLayersTrue.forEach((value, key) => {
            if (!state.monitoringSubLayers[value]) {
              return;
            }
            if (key === 0) {
              sublayers += ` no_estagio = '${value}'`;
            }
            if (key > 0) {
              sublayers += ` OR no_estagio = '${value}'`;
            }
          });
          params.CQL_FILTER += `(${sublayers})`;
        }

        const paramsUrl = new URLSearchParams(params);
        url = `${url}${paramsUrl}`;

        const response = await this.$api.$get(url);

        commit('setResultsHeatmap', response);
      }
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
      commit('setHeatMap', value);
      commit('setLoadingHeatmap', false);
    }
  },
};


