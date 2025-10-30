import centroid from '@turf/centroid';
// import { convertToCSV, saveData } from '@/utils/csv';

export default {
  state: () => ({
    showFeaturesLandUse: false,
    heatMapLandUse: false,
    urlWmsLandUse: '',
    // analyticsData: [],
    geoserverLayerLandUse: process.env.GEOSERVER_LAND_USE,
    geoserverLayerLandUseHeatmap: process.env.GEOSERVER_LAND_USE_HEATMAP,
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
      year: null,
      bbox: null,
      bboxWkt: null,
    },
    stats: {
      totalFeatures: 0,
      totalArea: 0,
      stages: [],
      tableLandUse: [],
      heatmapLandUse: [],
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
        co_funai: 71701,
        no_ti: 'Amba Porã',
      },
      {
        co_funai: 3501,
        no_ti: 'Araribá',
      },
      {
        co_funai: 6301,
        no_ti: 'Boa Vista Sertão do Promirim',
      },
      {
        co_funai: 6302,
        no_ti: 'Boa Vista Sertão do Promirim',
      },
      {
        co_funai: 71601,
        no_ti: 'Djaiko-Aty',
      },
      {
        co_funai: 14001,
        no_ti: 'Guarani Araponga',
      },
      {
        co_funai: 14201,
        no_ti: 'Guarani da Barragem',
      },
      {
        co_funai: 14401,
        no_ti: 'Guarani de Bracui',
      },
      {
        co_funai: 14501,
        no_ti: 'Guarani do Aguapeu',
      },
      {
        co_funai: 38101,
        no_ti: 'Guarani do Ribeirão Silveira',
      },
      {
        co_funai: 71401,
        no_ti: 'Guaviraty',
      },
      {
        co_funai: 15501,
        no_ti: 'Icatu',
      },
      {
        co_funai: 17601,
        no_ti: 'Itaóca',
      },
      {
        co_funai: 18802,
        no_ti: 'Jaraguá',
      },
      {
        co_funai: 18801,
        no_ti: 'Jaraguá',
      },
      {
        co_funai: 72001,
        no_ti: 'Ka´aguy Hovy',
      },
      {
        co_funai: 71501,
        no_ti: 'Ka´aguy Mirim',
      },
      {
        co_funai: 23601,
        no_ti: 'Krukutu',
      },
      {
        co_funai: 71901,
        no_ti: 'Pakurity',
      },
      {
        co_funai: 33301,
        no_ti: 'Parati-Mirim',
      },
      {
        co_funai: 71801,
        no_ti: 'Peguaoty',
      },
      {
        co_funai: 35001,
        no_ti: 'Peruíbe',
      },
      {
        co_funai: 35101,
        no_ti: 'Piaçaguera',
      },
      {
        co_funai: 71201,
        no_ti: 'Pindoty/Araçá-Mirim',
      },
      {
        co_funai: 38102,
        no_ti: 'Ribeirão Silveira',
      },
      {
        co_funai: 38701,
        no_ti: 'Rio Branco Itanhaém',
      },
      {
        co_funai: 42501,
        no_ti: 'Serra do Itatins',
      },
      {
        co_funai: 73720,
        no_ti: 'Takuari',
      },
      {
        co_funai: 71301,
        no_ti: 'Tapyi/Rio Branquinho',
      },
      {
        co_funai: 73755,
        no_ti: 'Tekoa Gwyra Pepo',
      },
      {
        co_funai: 66101,
        no_ti: 'Tekoha Jevy (Rio Pequeno)',
      },
      {
        co_funai: 23602,
        no_ti: 'Tenondé Porã',
      },
      {
        co_funai: 48801,
        no_ti: 'Vanuire',
      },
    ],
    yearItems: [{ text: '2015', value: 2015 }, { text: '2019', value: 2019 }],
    loadingSearchLandUse: false,
    loadingRegionalCoordinators: false,
    loadingIndigenousLands: false,
    loadingDownloadGeojson: false,
    loadingStatistic: false,
    loadingTable: false,
    loadingStats: false,
    loadingDownloadCSV: false,
    loadingHeatmap: false,
    loadingYearsItems: false,
    // loadingCycles: false,
  }),

  getters: {
    getShowFeaturesLandUse(state) { return state.showFeaturesLandUse; },
    getFilters(state) { return state.filters; },
    getRegionalCoordinators(state) { return state.regionalCoordinators; },
    getIndigenousLands(state) { return state.indigenousLands; },
    getYearItems(state) { return state.yearItems; },
    // getCycles(state) { return state.cycles; },
    getLayerLandUse(state) { return state.geoserverLayerLandUse; },
    getLayerLandUseHeatmap(state) { return state.geoserverLayerLandUseHeatmap; },
    getUrlWmsLandUse(state) { return state.urlWmsLandUse; },
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

    getParamsLandUseGeoserver: (state, getters) => (heatmap = false) => ({
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: heatmap ? getters.getLayerLandUseHeatmap : getters.getLayerLandUse,
      outputFormat: 'application/json',
      CQL_FILTER: getters.getGenerateCqlFilterLandUse,
      maxFeatures: !heatmap ? state.downloadGeoserverMaxFeatures : undefined,
    }),

    getGenerateCqlFilterLandUse: (state, getters) => {
      const cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
      const ti = getters.getFormattedIndigenousLands('co_funai').join(',');
      const { stages } = state.stats;
      const { year, bboxWkt } = state.filters;

      const filters = [];
      if (cr && cr.length) filters.push(`co_cr IN (${cr})`);

      if (ti && ti.length) filters.push(`co_funai IN (${ti})`);

      if (year) {
        filters.push(`(nu_ano = ${year.value})`);
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
    setShowFeaturesLandUse(state, value) { state.showFeaturesLandUse = value; },
    setLoadingRegionalCoordinators(state, loading) { state.loadingRegionalCoordinators = loading; },
    setIndigenousLands(state, indigenousLands) { state.indigenousLands = indigenousLands; },
    setLoadingIndigenousLands(state, loading) { state.loadingIndigenousLands = loading; },
    setUrlWmsLandUse(state, url) { state.urlWmsLandUse = url; },
    setLoadingSearchLandUse(state, loading) { state.loadingSearchLandUse = loading; },
    setLoadingStats(state, value) { state.loadingStats = value; },
    setLoadingDownloadGeojson(state, loading) { state.loadingDownloadGeojson = loading; },
    setLoadingDownloadCSV(state, loading) { state.loadingDownloadCSV = loading; },
    setOpacity(state, opacity) { state.opacity = opacity; },
    setLoadingTable(state, loading) { state.loadingTable = loading; },
    setLoadingStatistic(state, loading) { state.loadingStatistic = loading; },
    clearTableLandUse(state) { state.stats.tableLandUse = []; },
    // clearAnalyticsData(state) { state.analyticsData = []; },
    setHeatMapLandUse(state, value) { state.heatMapLandUse = value; },
    setLoadingHeatmap(state, loading) { state.loadingHeatmap = loading; },
    // setLoadingCycles(state, loading) { state.loadingCycles = loading; },
    // setCycles(state, cycles) { state.cycles = cycles; },
    // setRangeCycles(state, range) { state.stats.rangeCycles = range; },

    setCurrentBbox(state, { bbox, bboxWkt }) {
      state.filters.bbox = bbox;
      state.filters.bboxWkt = bboxWkt;
    },

    clearHeatmap(state) {
      state.heatMapLandUse = false;
      state.stats.heatmapLandUse = [];
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

    setLandUseStats(state, stats) {
      const colors = {
        AG: '#FFFF00',
        CR: '#ff8000',
        DG: '#FF00FF',
        MA: '#00FFFF',
        MI: '#E9DCC6',
        RV: '#708090',
        SV: '#FF8000',
        VN: '#228B22',
        VI: '#A0522D',
        NO: '#000000',
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

    setUpdateLandUseStats(state, { totalFeatures, totalArea }) {
      state.stats = {
        ...state.stats,
        totalFeatures,
        totalArea,
      };
    },

    toggleStatsStages(state, { key, value }) {
      state.stats.stages[key].visible = value;
    },

    setTableLandUse(state, tableLandUse) {
      const tableData = tableLandUse.map(({ properties }) => ({
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
      state.stats.tableLandUse = tableData;
    },

    // setAnalyticsData(state, analyticsData) {
    //   const formattedAnalytics = analyticsData.map((item) => {
    //     const newItem = { ...item };
    //     Object.keys(newItem).forEach((key) => {
    //       if (typeof newItem[key] === 'string' && newItem[key].endsWith('%')) {
    //         const percentValue = newItem[key].replace('%', '').replace(',', '.');
    //         const numberValue = parseFloat(percentValue);
    //         if (!Number.isNaN(numberValue)) {
    //           const roundedValue = Math.ceil(numberValue * 1000) / 1000;
    //           newItem[key] = `${roundedValue.toFixed(3).replace('.', ',')}%`;
    //         }
    //       }
    //     });
    //     return newItem;
    //   });
    //   state.analyticsData = formattedAnalytics;
    // },

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
      state.stats.heatmapLandUse = pointsHeatMap;
    },

  },

  actions: {
    async updateWmsLandUse({
      state, dispatch, commit, getters, rootState,
    }) {
      let urlGeoserver = rootState.map.geoserverUrl;
      urlGeoserver += `&CQL_FILTER=${encodeURIComponent(getters.getGenerateCqlFilterLandUse)}`;
      commit('setUrlWmsLandUse', urlGeoserver);
      if (state.heatMapLandUse) {
        commit('clearHeatmap');
        // commit('setHeatMapLandUse', true);
        await dispatch('generateHeatmapLandUse');
        commit('setHeatMapLandUse', true);
      }
    },

    async generateUrlWmsLandUse({
      state, commit, dispatch, rootGetters,
    }) {
      try {
        commit('setLoadingSearchLandUse', true);
        commit('setLandUseStats', { ...state.stats, stages: [] });
        commit('clearHeatmap');
        commit('setCurrentBbox', { bbox: rootGetters['map/bbox'], bboxWkt: rootGetters['map/bboxWkt'] });
        await dispatch('generateLandUseStats');
        await dispatch('zoomMapBboxRegionalCoordinates');
        dispatch('updateWmsLandUse');
        commit('setShowFeaturesLandUse', true);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('LandUse'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingSearchLandUse', false);
      }
    },

    async generateLandUseStats({ commit, state, getters }, isUpdate = false) {
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

        const stats = await this.$api.$get('land-use/map-stats/', { params });

        if (isUpdate) {
          commit('setUpdateLandUseStats', { totalFeatures: stats.total_features, totalArea: stats.total_area || 0 });
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
          commit('setLandUseStats', { ...stats, tiByStages });
        }
      } catch (error) {
        console.error(error);
      } finally {
        commit('setLoadingStats', false);
      }
    },

    async getLandUseSublayers({ commit, getters, rootState }) {
      const urlGeoserver = rootState.map.geoserverUrl;
      const params = {
        service: 'WMS',
        version: '1.1.0',
        request: 'GetLegendGraphic',
        layer: getters.getLayerLandUse,
        format: 'application/json',
      };
      const response = await this.$api.$get(urlGeoserver, { params });
      commit('setLandUseSublayers', response);
    },

    async downloadLandUseGeojson({
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
          params: getters.getParamsLandUseGeoserver(),
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response);
        Object.assign(document.createElement('a'), {
          href: url, download: `LandUse_${new Date().toISOString().split('T')[0]}.geojson`,
        }).click();
        URL.revokeObjectURL(url);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('download'),
            resource: this.$i18n.t('LandUse data'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingDownloadGeojson', false);
      }
    },

    async getDataTableLandUse({ commit, getters, rootState }) {
      try {
        commit('setLoadingTable', true);
        const params = {
          ...getters.getParamsLandUseGeoserver(),
          CQL_FILTER: getters.getGenerateCqlFilterLandUse,
        };
        const response = await this.$api.$get(rootState.map.geoserverUrl, { params });
        commit('setTableLandUse', response.features);
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('LandUse data'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingTable', false);
      }
    },

    // async getDataAnalyticsLandUse({
    //   commit, state, getters, rootGetters,
    // }, groupingKey) {
    //   try {
    //     commit('setLoadingStatistic', true);
    //     const params = {};
    //     if (state.filters.startDate && state.filters.endDate) {
    //       params.start_date = state.filters.startDate;
    //       params.end_date = state.filters.endDate;
    //       params.grouping = groupingKey;
    //     }
    //     if (state.filters.ti.length) {
    //       params.co_funai = getters.getFormattedIndigenousLands('co_funai').join(',');
    //     }
    //     if (state.filters.cr.length) {
    //       params.co_cr = getters.getFormattedRegionalCoordinates('co_cr').join(',');
    //     }
    //     if (state.filters.currentView) {
    //       params.in_bbox = rootGetters['map/bbox'];
    //     }
    //     const analyticsLandUse = await this.$api.$get('alerts/table/', { params });
    //     commit('setAnalyticsData', analyticsLandUse);
    //   } catch (error) {
    //     commit('alert/addAlert', {
    //       message: this.$i18n.t('default-error', {
    //         action: this.$i18n.t('retrieve'),
    //         resource: this.$i18n.t('LandUse data'),
    //       }),
    //       type: 'error',
    //     }, { root: true });
    //   } finally {
    //     commit('setLoadingStatistic', false);
    //   }
    // },

    // async downloadAnalyticCSV({ commit, state }, defaultFileName) {
    //   try {
    //     commit('setLoadingDownloadCSV', true);
    //     const csvData = convertToCSV(state.analyticsData);
    //     saveData(csvData, defaultFileName);
    //   } catch (error) {
    //     commit('alert/addAlert', {
    //       message: this.$i18n.t('default-error', {
    //         action: this.$i18n.t('retrieve'),
    //         resource: this.$i18n.t('LandUse data'),
    //       }),
    //       type: 'error',
    //     }, { root: true });
    //   } finally {
    //     commit('setLoadingDownloadCSV', false);
    //   }
    // },

    async generateHeatmapLandUse({ commit, getters, rootState }) {
      try {
        commit('setLoadingHeatmap', true);
        const params = {
          ...getters.getParamsLandUseGeoserver(true),
          // remove INTERSECTS for heatmap
          CQL_FILTER: getters.getGenerateCqlFilterLandUse.split(' AND ').filter((f) => !f.startsWith('INTERSECTS(')).join(' AND '),
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
              resource: this.$i18n.t('LandUse'),
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
    //     const cycles = await this.$api.$get('LandUse/consolidated/cycles/options/');
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
