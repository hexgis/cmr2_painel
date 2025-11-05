import centroid from '@turf/centroid';
// import { convertToCSV, saveData } from '@/utils/csv';

export default {
  state: () => ({
    showFeaturesUrgentAlert: false,
    heatMapUrgentAlert: false,
    urlWmsUrgentAlert: '',
    analyticsData: [],
    geoserverLayerUrgentAlert: process.env.GEOSERVER_URGENT_ALERT,
    geoserverLayerUrgentAlertHeatmap: process.env.GEOSERVER_URGENT_ALERT_HEATMAP,
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
      tableUrgentAlert: [],
      heatmapUrgentAlert: [],
      tiByStages: [],
      // rangeCycles: null,
    },
    opacity: 100,
    // cycles: [],
    regionalCoordinators: [
      {
        co_cr: 30202001845,
        ds_cr: 'Alto Purus',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001857,
        ds_cr: 'Alto Solimoes',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001899,
        ds_cr: 'Amapá E Norte Do Pará',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001962,
        ds_cr: 'Araguaia Tocantins',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001983,
        ds_cr: 'Baixo São Francisco',
        no_regiao: 'Nordeste',
      },
      {
        co_cr: 30202001906,
        ds_cr: 'Baixo Tocantins',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001934,
        ds_cr: 'Cacoal',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202002004,
        ds_cr: 'Campo Grande',
        no_regiao: 'Centro-Oeste',
      },
      {
        co_cr: 30202001913,
        ds_cr: 'Centro-Leste Do Pará',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202002025,
        ds_cr: 'Cuiaba',
        no_regiao: 'Centro-Oeste',
      },
      {
        co_cr: 30202002011,
        ds_cr: 'Dourados',
        no_regiao: 'Centro-Oeste',
      },
      {
        co_cr: 30202001941,
        ds_cr: 'Guajara Mirim',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202002408,
        ds_cr: 'Guarapuava',
        no_regiao: 'Sul',
      },
      {
        co_cr: 30202002088,
        ds_cr: 'Interior Sul',
        no_regiao: 'Sul',
      },
      {
        co_cr: 30202001948,
        ds_cr: 'Ji Parana',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202002287,
        ds_cr: 'Joao Pessoa',
        no_regiao: 'Nordeste',
      },
      {
        co_cr: 30202001852,
        ds_cr: 'Juruá',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001920,
        ds_cr: 'Kayapó Sul Do Pará',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202002074,
        ds_cr: 'Litoral Sudeste',
        no_regiao: 'Sudeste',
      },
      {
        co_cr: 30202002095,
        ds_cr: 'Litoral Sul',
        no_regiao: 'Sul',
      },
      {
        co_cr: 30202001864,
        ds_cr: 'Madeira',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001871,
        ds_cr: 'Manaus',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001997,
        ds_cr: 'Maranhão',
        no_regiao: 'Nordeste',
      },
      {
        co_cr: 30202001878,
        ds_cr: 'Médio Purus',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202002067,
        ds_cr: 'Minas Gerais E Espirito Santo',
        no_regiao: 'Sudeste',
      },
      {
        co_cr: 30202001969,
        ds_cr: 'Nordeste I',
        no_regiao: 'Nordeste',
      },
      {
        co_cr: 30202001976,
        ds_cr: 'Nordeste Ii',
        no_regiao: 'Nordeste',
      },
      {
        co_cr: 30202002032,
        ds_cr: 'Noroeste Do Mato Grosso',
        no_regiao: 'Centro-Oeste',
      },
      {
        co_cr: 30202002039,
        ds_cr: 'Norte Do Mato Grosso',
        no_regiao: 'Centro-Oeste',
      },
      {
        co_cr: 30202002081,
        ds_cr: 'Passo Fundo',
        no_regiao: 'Sul',
      },
      {
        co_cr: 30202002018,
        ds_cr: 'Ponta Pora',
        no_regiao: 'Centro-Oeste',
      },
      {
        co_cr: 30202002046,
        ds_cr: 'Ribeirao Cascalheira',
        no_regiao: 'Centro-Oeste',
      },
      {
        co_cr: 30202001885,
        ds_cr: 'Rio Negro',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001955,
        ds_cr: 'Roraima',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001990,
        ds_cr: 'Sul Da Bahia',
        no_regiao: 'Nordeste',
      },
      {
        co_cr: 30202001927,
        ds_cr: 'Tapajos',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202001892,
        ds_cr: 'Vale Do Javari',
        no_regiao: 'Norte',
      },
      {
        co_cr: 30202002053,
        ds_cr: 'Xavante',
        no_regiao: 'Centro-Oeste',
      },
      {
        co_cr: 30202002060,
        ds_cr: 'Xingu',
        no_regiao: 'Centro-Oeste',
      },
    ],
    indigenousLands: [
      {
        co_funai: 3002,
        no_ti: 'Apyterewa',
      },
      {
        co_funai: 3201,
        no_ti: 'Arara',
      },
      {
        co_funai: 60001,
        no_ti: 'Arara da Volta Grande do Xingu',
      },
      {
        co_funai: 3801,
        no_ti: 'Araweté Igarapé Ipixuna',
      },
      {
        co_funai: 7601,
        no_ti: 'Cachoeira Seca',
      },
      {
        co_funai: 72601,
        no_ti: 'Ituna/Itatá (restrição de uso)',
      },
      {
        co_funai: 62001,
        no_ti: 'Juruna do Km 17',
      },
      {
        co_funai: 21501,
        no_ti: 'Kararaô',
      },
      {
        co_funai: 23201,
        no_ti: 'Koatinemo',
      },
      {
        co_funai: 38902,
        no_ti: 'Kuruáya',
      },
      {
        co_funai: 32602,
        no_ti: 'Paquiçamba',
      },
      {
        co_funai: 32601,
        no_ti: 'Paquiçamba',
      },
      {
        co_funai: 46201,
        no_ti: 'Trincheira Bacaja',
      },
      {
        co_funai: 50601,
        no_ti: 'Xipaya',
      },
      {
        co_funai: 51001,
        no_ti: 'Zoe',
      },
    ],
    loadingSearchUrgentAlert: false,
    loadingRegionalCoordinators: false,
    loadingIndigenousLands: false,
    loadingDownloadGeojson: false,
    loadingStatistic: false,
    loadingTable: false,
    loadingStats: false,
    loadingDownloadCSV: false,
    loadingHeatmap: false,
    // loadingCycles: false,
  }),

  getters: {
    getShowFeaturesUrgentAlert(state) { return state.showFeaturesUrgentAlert; },
    getFilters(state) { return state.filters; },
    getRegionalCoordinators(state) { return state.regionalCoordinators; },
    getIndigenousLands(state) { return state.indigenousLands; },
    // getCycles(state) { return state.cycles; },
    getLayerUrgentAlert(state) { return state.geoserverLayerUrgentAlert; },
    getLayerUrgentAlertHeatmap(state) { return state.geoserverLayerUrgentAlertHeatmap; },
    getUrlWmsUrgentAlert(state) { return state.urlWmsUrgentAlert; },
    getOpacity(state) { return state.opacity / 100; },
    getStats: (state) => state.stats,
    getStagesVisible: (state) => state.stats.stages.filter((stage) => stage.visible),

    getFormattedRegionalCoordinates: (state) => (key = 'co_cr') => {
      if (!Array.isArray(state.filters.cr)) return [];
      return state.filters.cr.map((r) => r[key]).filter((v) => v != null);
    },

    getFormattedIndigenousLands: (state) => (key = 'co_funai') => {
      if (!Array.isArray(state.filters.ti)) return [];
      return state.filters.ti.map((r) => r[key]).filter((v) => v != null);
    },

    getParamsUrgentAlertGeoserver: (state, getters) => (heatmap = false) => ({
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: heatmap ? getters.getLayerUrgentAlertHeatmap : getters.getLayerUrgentAlert,
      outputFormat: 'application/json',
      CQL_FILTER: getters.getGenerateCqlFilterUrgentAlert,
      maxFeatures: !heatmap ? state.downloadGeoserverMaxFeatures : undefined,
    }),

    getGenerateCqlFilterUrgentAlert: (state, getters) => {
      const cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
      const ti = getters.getFormattedIndigenousLands('co_funai').join(',');
      const { stages } = state.stats;
      const { startDate, endDate, bboxWkt } = state.filters;

      const filters = [];
      if (cr && cr.length) filters.push(`co_cr IN (${cr})`);

      if (ti && ti.length) filters.push(`co_funai IN (${ti})`);

      if (startDate && endDate) {
        filters.push(`dt_t_um BETWEEN '${state.filters.startDate}' AND '${state.filters.endDate}'`);
      }

      const intersects = state.filters.currentView ? `INTERSECTS(geom, ${bboxWkt})` : '';
      if (intersects) filters.push(intersects);

      if (stages && stages.length) {
        const stagesVisible = stages.filter((stage) => stage.visible);
        if (stagesVisible.length) {
          // no_estagio IN ('DR','CR')
          filters.push(`no_estagio IN (${stagesVisible.map((stage) => `'${stage.name}'`).join(',')})`);
        } else {
          filters.push('no_estagio IN (\'\')');
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
    setShowFeaturesUrgentAlert(state, value) { state.showFeaturesUrgentAlert = value; },
    setLoadingRegionalCoordinators(state, loading) { state.loadingRegionalCoordinators = loading; },
    setIndigenousLands(state, indigenousLands) { state.indigenousLands = indigenousLands; },
    setLoadingIndigenousLands(state, loading) { state.loadingIndigenousLands = loading; },
    setUrlWmsUrgentAlert(state, url) { state.urlWmsUrgentAlert = url; },
    setLoadingSearchUrgentAlert(state, loading) { state.loadingSearchUrgentAlert = loading; },
    setLoadingStats(state, value) { state.loadingStats = value; },
    setLoadingDownloadGeojson(state, loading) { state.loadingDownloadGeojson = loading; },
    setLoadingDownloadCSV(state, loading) { state.loadingDownloadCSV = loading; },
    setOpacity(state, opacity) { state.opacity = opacity; },
    setLoadingTable(state, loading) { state.loadingTable = loading; },
    setLoadingStatistic(state, loading) { state.loadingStatistic = loading; },
    clearTableUrgentAlert(state) { state.stats.tableUrgentAlert = []; },
    clearAnalyticsData(state) { state.analyticsData = []; },
    setHeatMapUrgentAlert(state, value) { state.heatMapUrgentAlert = value; },
    setLoadingHeatmap(state, loading) { state.loadingHeatmap = loading; },
    // setLoadingCycles(state, loading) { state.loadingCycles = loading; },
    // setCycles(state, cycles) { state.cycles = cycles; },
    // setRangeCycles(state, range) { state.stats.rangeCycles = range; },

    setCurrentBbox(state, { bbox, bboxWkt }) {
      state.filters.bbox = bbox;
      state.filters.bboxWkt = bboxWkt;
    },

    clearHeatmap(state) {
      state.heatMapUrgentAlert = false;
      state.stats.heatmapUrgentAlert = [];
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

    setUrgentAlertStats(state, stats) {
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

    setUpdateUrgentAlertStats(state, { totalFeatures, totalArea }) {
      state.stats = {
        ...state.stats,
        totalFeatures,
        totalArea,
      };
    },

    toggleStatsStages(state, { key, value }) {
      state.stats.stages[key].visible = value;
    },

    setTableUrgentAlert(state, tableUrgentAlert) {
      const tableData = tableUrgentAlert.map(({ properties }) => ({
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
      state.stats.tableUrgentAlert = tableData;
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
      state.stats.heatmapUrgentAlert = pointsHeatMap;
    },

  },

  actions: {
    async updateWmsUrgentAlert({
      state, dispatch, commit, getters, rootState,
    }) {
      let urlGeoserver = rootState.map.geoserverUrl;
      urlGeoserver += `&CQL_FILTER=${encodeURIComponent(getters.getGenerateCqlFilterUrgentAlert)}`;
      commit('setUrlWmsUrgentAlert', urlGeoserver);
      if (state.heatMapUrgentAlert) {
        commit('clearHeatmap');
        // commit('setHeatMapUrgentAlert', true);
        await dispatch('generateHeatmapUrgentAlert');
        commit('setHeatMapUrgentAlert', true);
      }
    },

    async generateUrlWmsUrgentAlert({
      state, commit, dispatch, rootGetters,
    }) {
      try {
        commit('setLoadingSearchUrgentAlert', true);
        commit('setUrgentAlertStats', { ...state.stats, stages: [] });
        commit('clearHeatmap');
        commit('setCurrentBbox', { bbox: rootGetters['map/bbox'], bboxWkt: rootGetters['map/bboxWkt'] });
        await dispatch('generateUrgentAlertStats');
        await dispatch('zoomMapBboxRegionalCoordinates');
        dispatch('updateWmsUrgentAlert');
        commit('setShowFeaturesUrgentAlert', true);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('UrgentAlert'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingSearchUrgentAlert', false);
      }
    },

    async generateUrgentAlertStats({ commit, state, getters }, isUpdate = false) {
      try {
        commit('setLoadingStats', true);
        const params = {};

        if (isUpdate && state.stats.stages && state.stats.stages.length) {
          params.stage = getters.getStagesVisible.map((stage) => stage.name).join(',') || 'NONE';
        }

        if (state.filters.currentView) {
          params.in_bbox = state.filters.bbox;
        } else {
          params.co_cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
          params.co_funai = getters.getFormattedIndigenousLands('co_funai').join(',');
        }

        if (state.filters.startDate && state.filters.endDate) {
          params.start_date = state.filters.startDate;
          params.end_date = state.filters.endDate;
        }

        const stats = await this.$api.$get('alerts/map-stats/', { params });

        if (isUpdate) {
          commit('setUpdateUrgentAlertStats', { totalFeatures: stats.total_features, totalArea: stats.total_area || 0 });
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
          commit('setUrgentAlertStats', { ...stats, tiByStages });
        }
      } catch (error) {
        console.error(error);
      } finally {
        commit('setLoadingStats', false);
      }
    },

    async getUrgentAlertSublayers({ commit, getters, rootState }) {
      const urlGeoserver = rootState.map.geoserverUrl;
      const params = {
        service: 'WMS',
        version: '1.1.0',
        request: 'GetLegendGraphic',
        layer: getters.getLayerUrgentAlert,
        format: 'application/json',
      };
      const response = await this.$api.$get(urlGeoserver, { params });
      commit('setUrgentAlertSublayers', response);
    },

    async downloadUrgentAlertGeojson({
      state, commit, getters, rootState,
    }) {
      try {
        commit('setLoadingDownloadGeojson', true);
        if (state.stats.totalFeatures === 0 || !getters.getStagesVisible.length) {
          commit('alert/addAlert', {
            message: this.$i18n.t('monitoring-no-stages-visible'),
            type: 'info',
          }, { root: true });
          return;
        }

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
          params: getters.getParamsUrgentAlertGeoserver(),
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response);
        Object.assign(document.createElement('a'), {
          href: url, download: `UrgentAlert_${new Date().toISOString().split('T')[0]}.geojson`,
        }).click();
        URL.revokeObjectURL(url);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('download'),
            resource: this.$i18n.t('UrgentAlert data'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingDownloadGeojson', false);
      }
    },

    async getDataTableUrgentAlert({ commit, getters, rootState }) {
      try {
        commit('setLoadingTable', true);
        const params = {
          ...getters.getParamsUrgentAlertGeoserver(),
          CQL_FILTER: getters.getGenerateCqlFilterUrgentAlert,
        };
        const response = await this.$api.$get(rootState.map.geoserverUrl, { params });
        commit('setTableUrgentAlert', response.features);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('UrgentAlert data'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingTable', false);
      }
    },

    async getDataAnalyticsUrgentAlert({
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
        const analyticsUrgentAlert = await this.$api.$get('alerts/table-stats/', { params });
        commit('setAnalyticsData', analyticsUrgentAlert);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('UrgentAlert data'),
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
        const csvData = this.$downloader.convertToCSV(state.analyticsData);
        this.$downloader.downloadCSV(csvData, defaultFileName);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('UrgentAlert data'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingDownloadCSV', false);
      }
    },

    async generateHeatmapUrgentAlert({ commit, getters, rootState }) {
      try {
        commit('setLoadingHeatmap', true);
        const params = {
          ...getters.getParamsUrgentAlertGeoserver(true),
          // remove INTERSECTS for heatmap
          CQL_FILTER: getters.getGenerateCqlFilterUrgentAlert.split(' AND ').filter((f) => !f.startsWith('INTERSECTS(')).join(' AND '),
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
              resource: this.$i18n.t('UrgentAlert'),
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

    // async getCyclesOptions({ commit }) {
    //   try {
    //     commit('setLoadingCycles', true);
    //     const cycles = await this.$api.$get('UrgentAlert/consolidated/cycles/options/');
    //     commit('setCycles', cycles);
    //   } catch (error) {
    //     commit(
    //       'alert/addAlert',
    //       {
    //         message: this.$i18n.t('default-error', {
    //           action: this.$i18n.t('retrieve'),
    //           resource: this.$i18n.t('cycle'),
    //         }),
    //         type: 'error',
    //       },
    //       { root: true },
    //     );
    //   } finally {
    //     commit('setLoadingCycles', false);
    //   }
    // },

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
          const bbox = await this.$api.$post('alerts/consolidated/bbox/', body);
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
