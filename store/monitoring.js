import Vue from 'vue';
import { stringify } from 'wkt';

// Módulo Vuex para gerenciamento de monitoramento
export default {
  // Estado inicial do módulo
  state: () => ({
    features: null,
    urlWmsMonitoring: '',
    geoserverLayerMonitoring: process.env.GEOSERVER_MONITORING,
    geoserverLayerMonitoringHeatmap: process.env.GEOSERVER_MONITORING_HEATMAP,
    resultsHeatmap: [],
    resultsHeatmapOptions: {
      minOpacity: 0.5,
      maxZoom: 18,
      radius: 20,
      blur: 15,
      zIndex: 4,
    },
    loadingHeatmap: false,
    currentUrlWmsMonitoring: '',
    showFeaturesMonitoring: false,
    MonitoringWmsOptions: {
      name: 'monitoring',
      maxZoom: 21,
      maxNativeZoom: 19,
      queryable: true,
    },

    loadingMonitoring: false,
    analyticsMonitoringDialog: false,
    isLoadingFeatures: false,
    filterOptions: {
      regionalFilters: [],
      tiFilters: [],
    },
    filters: {
      startDate: null,
      endDate: null,
      currentView: false,
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
    analyticsMonitoring: [],
    intersectsWmsMonitoring: '',
    monitoringStyles: {},
    tableMonitoring: [],
    isLoadingTable: false,
    isLoadingCSV: false,
    isLoadingCSVMonitoring: false,
    isLoadingStatistic: false,
    isLoadingGeoJson: false,
    analyticsMonitoringcsv: [],
    legendVisibility: {},
    availableEstagios: [],
  }),

  // Getters para acessar e processar dados do estado
  getters: {
    getLegendItems: (state) => {
      const legendMapping = {
        CR: { name: 'Corte Raso', acronym: 'CR' },
        DG: { name: 'Degradação', acronym: 'DG' },
        DR: { name: 'Desmatamento em Regeneração', acronym: 'DR' },
        FF: { name: 'Fogo em Floresta', acronym: 'FF' },
      };

      const activeEstagios = new Set();
      if (state.tableMonitoring?.length) {
        state.tableMonitoring.forEach(item => {
          ['CR', 'DG', 'DR', 'FF'].forEach(estagio => {
            if (parseFloat(item[`nu_area_${estagio.toLowerCase()}_ha`]) > 0) {
              activeEstagios.add(estagio);
            }
          });
        });
      }

      const tiCountMap = new Map();
      if (state.features?.features) {
        state.features.features.forEach(({ properties }) => {
          const estagio = properties.no_estagio;
          if (!estagio) return;
          if (!tiCountMap.has(estagio)) {
            tiCountMap.set(estagio, new Set());
          }
          tiCountMap.get(estagio).add(properties.co_funai);
        });
      }
      return state.availableEstagios
        .map((estagio) => {
          const mapped = legendMapping[estagio] || { name: estagio, acronym: '' };
          const label = mapped.acronym ? `${mapped.name} (${mapped.acronym})` : mapped.name;
          return {
            label,
            color: state.monitoringStyles[estagio] || '#000000',
            count: tiCountMap.get(estagio)?.size || 0,
            estagio,
            visible: state.legendVisibility[estagio] !== false,
            active: activeEstagios.has(estagio),
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    getActiveLegendItems: (state, getters) => {
      return getters.getLegendItems.filter(item => item.active);
    },
  },

  // Mutações para alterar o estado
  mutations: {
    setLoadingHeatmap(state, loadingHeatmap) {
      state.loadingHeatmap = loadingHeatmap;
    },
    setLoadingMonitoring(state, payload) {
      state.loadingMonitoring = payload;
    },

    setIntersectsWmsMonitoring(state, intersectsWmsMonitoring) {
      state.intersectsWmsMonitoring = intersectsWmsMonitoring;
    },
    setshowFeaturesMonitoring(state, showFeaturesMonitoring) {
      state.showFeaturesMonitoring = showFeaturesMonitoring;
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
    setFilterOptions(state, data) {
      state.filterOptions = data;
    },
    setOpacity(state, opacity) {
      state.opacity = opacity;
    },
    setFilters(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },
    setUrlCurrentWmsMonitoring(state, url) {
      state.currentUrlWmsMonitoring = url;
    },
    setFeatures(state, features) {
      state.features = features;
      state.isLoadingFeatures = false;
    },
    clearFeatures(state) {
      state.features = null;
    },
    setMonitoringStyles(state, styles) {
      state.monitoringStyles = styles;
      state.availableEstagios.forEach((estagio) => {
        if (!(estagio in state.legendVisibility)) {
          Vue.set(state.legendVisibility, estagio, true);
        }
      });
    },
    setTableMonitoring(state, data) {
      state.tableMonitoring = data;
    },
    setHeatMap(state, heatMap) {
      state.heatMap = heatMap;
    },
    setLoadingTable(state, payload) {
      state.isLoadingTable = payload;
    },
    setLoadingCSV(state, payload) {
      state.isLoadingCSV = payload;
      state.isLoadingCSVMonitoring = payload;
    },
    setLegendVisibility(state, { estagio, visible }) {
      Vue.set(state.legendVisibility, estagio, visible);
    },
    setAvailableEstagios(state, estagios) {
      state.availableEstagios = estagios;
    },
    setResultsHeatmap(state, resultsHeatMap) {
      const pointsHeatMap = [];
      if (resultsHeatMap) {
        resultsHeatMap.features.forEach((feature) => {
          if (
            feature.geometry &&
            (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') &&
            feature.geometry.coordinates?.length
          ) {
            if (feature.geometry.type === 'Point') {
              pointsHeatMap.push([
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
                1,
              ]);
            }
            if (feature.geometry.type === 'MultiPoint') {
              feature.geometry.coordinates.forEach(coord => {
                pointsHeatMap.push([coord[1], coord[0], 1]);
              });
            }
          }
          if (
            feature.geometry &&
            (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') &&
            feature.geometry.coordinates?.length
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
      state.resultsHeatmap = pointsHeatMap;
    },
  },

  // Ações para operações assíncronas e lógicas complexas
  actions: {
    // Busca dados para a tabela de monitoramento
    async getDataTableMonitoring({ commit, state, rootState }) {
      commit('setLoadingTable', true);
      try {
        const params = {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetFeature',
          typeName: state.geoserverLayerMonitoring,
          outputFormat: 'application/json',
          CQL_FILTER: '',
          maxFeatures: 10000,
        };

        const filters = [];
        const visibleEstagios = Object.keys(state.legendVisibility).filter(
          estagio => state.legendVisibility[estagio]
        );
        if (visibleEstagios.length > 0) {
          filters.push(`no_estagio IN ('${visibleEstagios.join("','")}')`);
        }
        if (state.filters.currentView && state.intersectsWmsMonitoring) {
          filters.push(state.intersectsWmsMonitoring);
        }
        if (state.filters.ti?.length) {
          filters.push(`co_funai IN (${state.filters.ti.map(ti => ti.co_funai).join(',')})`);
        }
        if (state.filters.cr?.length) {
          filters.push(`co_cr IN (${state.filters.cr.map(cr => cr.co_cr).join(',')})`);
        }
        if (state.filters.startDate && state.filters.endDate) {
          filters.push(`dt_t_um BETWEEN '${state.filters.startDate}' AND '${state.filters.endDate}'`);
        }
        if (filters.length) params.CQL_FILTER = filters.join(' AND ');

        const url = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;
        
        const response = await this.$api.$get(url);

        if (!response?.features) {
          commit('setTableMonitoring', []);
          throw new Error('Nenhum dado encontrado');
        }

        const tableData = response.features.map(({ properties }) => ({
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
        commit('setTableMonitoring', tableData);
      } catch (error) {
        console.error('Erro ao buscar dados da tabela:', error);
        commit('setTableMonitoring', []);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('table'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingTable', false);
      }
    },

    // Busca estilos do GeoServer para a legenda
    async getMonitoringStyleFromGeoserver({ commit, state, rootState }) {
      try {
        const params = {
          service: 'WMS',
          version: '1.1.0',
          request: 'GetLegendGraphic',
          layer: state.geoserverLayerMonitoring,
          format: 'application/json',
        };
        const url = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;
        const response = await this.$api.$get(url);
        const styles = {};
        if (response.Legend?.[0]?.rules) {
          response.Legend[0].rules.forEach((rule) => {
            if (rule.filter && rule.name) {
              const estagioMatch = rule.filter.match(/no_estagio\s*=\s*['"]?([^'"]+)['"]?/);
              const fillColor = rule.symbolizers[0]?.Polygon?.fill || null;
              if (estagioMatch && estagioMatch[1] && fillColor) {
                styles[estagioMatch[1]] = fillColor;
              }
            }
          });
        }
        commit('setMonitoringStyles', styles);
      } catch (error) {
        console.error('Erro ao buscar estilos do GeoServer:', error);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('legend'),
          }),
          type: 'error',
        }, { root: true });
      }
    },

    // Gera URL para o WMS de monitoramento
    async generateUrlWmsMonitoring({ state, commit, rootState }) {
      const visibleEstagios = Object.keys(state.legendVisibility).filter(
        estagio => state.legendVisibility[estagio]
      );

      // Se todos os estágios estão desabilitados, configurar uma URL que não retorna dados
      if (visibleEstagios.length === 0) {
        commit('setUrlCurrentWmsMonitoring', '');
        return;
      }

      const params = {
        layers: state.geoserverLayerMonitoring,

        env: `fill-opacity:${state.opacity / 100}`,
        CQL_FILTER: '',
        format: 'image/png',
        transparent: true,
        version: '1.1.1'
      };

      const filters = [];
      if (visibleEstagios.length) {
        filters.push(`no_estagio IN ('${visibleEstagios.join("','")}')`);
      }

      // Mantém os outros filtros existentes
      if (state.intersectsWmsMonitoring) filters.push(state.intersectsWmsMonitoring);
      if (state.filters.ti?.length) filters.push(`co_funai IN (${state.filters.ti.map(ti => ti.co_funai).join(',')})`);
      if (state.filters.cr?.length) filters.push(`co_cr IN (${state.filters.cr.map(cr => cr.co_cr).join(',')})`);
      if (state.filters.startDate && state.filters.endDate) {
        filters.push(`dt_t_um BETWEEN '${state.filters.startDate}' AND '${state.filters.endDate}'`);
      }

      if (filters.length) params.CQL_FILTER = filters.join(' AND ');

      const fullUrl = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;
      commit('setUrlCurrentWmsMonitoring', fullUrl);
    },

    // Atualiza features no estado
    async updateFeatures({ state, commit }) {
      let updatedFeatures = { features: state.stageItemActive, ...state.features };
      commit('setFeatures', updatedFeatures);
      commit('setshowFeaturesMonitoring', true);
    },

    // Busca features de monitoramento
    async fetchMonitoringFeatures({ state, commit, dispatch, rootState }) {
      commit('setLoadingFeatures', true);
      try {
        await dispatch('getMonitoringStyleFromGeoserver');

        const params = {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetFeature',
          typeName: state.geoserverLayerMonitoring,
          outputFormat: 'application/json',
          CQL_FILTER: '',
          maxFeatures: 10000,
        };

        let cqlFilters = [];
        const visibleEstagios = Object.keys(state.legendVisibility).filter(
          (estagio) => state.legendVisibility[estagio]
        );

        if (visibleEstagios.length > 0) {
          cqlFilters.push(`no_estagio IN ('${visibleEstagios.join("','")}')`);
        }
        if (state.filters.currentView) {
          const map = window.mapMain;
          const bounds = map.getBounds();
          const bboxPolygon = L.polygon([
            bounds.getSouthWest(),
            [bounds.getSouthWest().lat, bounds.getNorthEast().lng],
            bounds.getNorthEast(),
            [bounds.getNorthEast().lat, bounds.getSouthWest().lng],
          ]);
          const wkt = stringify(bboxPolygon.toGeoJSON().geometry);
          cqlFilters.push(`INTERSECTS(geom,${wkt})`);
        }
        if (state.filters.ti?.length) {
          const tiList = state.filters.ti.map(ti => ti.co_funai).join(',');
          cqlFilters.push(`co_funai IN (${tiList})`);
        }
        if (state.filters.cr?.length) {
          const crList = state.filters.cr.map(cr => cr.co_cr).join(',');
          cqlFilters.push(`co_cr IN (${crList})`);
        }
        if (state.filters.startDate && state.filters.endDate) {
          cqlFilters.push(`dt_t_um BETWEEN '${state.filters.startDate}' AND '${state.filters.endDate}'`);
        }

        if (cqlFilters.length) {
          params.CQL_FILTER = cqlFilters.join(' AND ');
        }

        const url = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;
        const response = await this.$api.$get(url);

        if (response?.features) {
          const geojson = {
            type: response.type,
            features: response.features,
          };
          commit('setFeatures', geojson);
        } else {
          throw new Error('Resposta do GeoServer sem features');
        }
      } catch (error) {
        console.error('Erro ao buscar features do MONITORING:', error);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
          type: 'error',
        }, { root: true });
        commit('setshowFeaturesMonitoring', false);
      } finally {
        commit('setLoadingFeatures', false);
      }
    },

    // Busca todas as features e configura o mapa
    async getFeatures({ state, commit, dispatch }) {
      commit('setUrlCurrentWmsMonitoring', '');
      commit('setLoadingMonitoring', true);
      commit('clearFeatures');

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
        if (state.filters.ti?.length) {
          Object.values(state.filters.ti).forEach((item) => {
            arrayTI.push(item.co_funai);
          });
        }

        const arrayCR = [];
        if (state.filters.cr?.length) {
          Object.values(state.filters.cr).forEach((item) => {
            arrayCR.push(item.co_cr);
          });
        }

        try {
          if (!state.filters.currentView) {
            let bbox;
            if (arrayCR.length || arrayTI.length) {
              bbox = await this.$api.$post('monitoring/consolidated/bbox/', {
                co_cr: [...arrayCR],
                co_funai: [...arrayTI],
              });
              if (bbox) {
                const bounds = L.latLngBounds([bbox[1], bbox[0]], [bbox[3], bbox[2]]);
                map.fitBounds(bounds);
              }
            }
          }
        } catch (error) {
          console.error('Erro ao buscar bbox:', error);
          commit('alert/addAlert', {
            message: this.$i18n.t('default-error', {
              action: this.$i18n.t('retrieve'),
              resource: this.$i18n.t('monitoring'),
            }),
            type: 'error',
          }, { root: true });
        }

        await dispatch('fetchInitialEstagios');
        await dispatch('getMonitoringStyleFromGeoserver');
        await dispatch('generateUrlWmsMonitoring');
        await dispatch('fetchMonitoringFeatures');
      } catch (exception) {
        console.error('Erro em getFeatures:', exception);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingFeatures', false);
        commit('setLoadingStatistic', false);
        commit('setLoadingMonitoring', false);
      }
    },

    // Busca estágios iniciais disponíveis
    async fetchInitialEstagios({ state, commit, rootState }) {
      try {
        const params = {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetFeature',
          typeName: state.geoserverLayerMonitoring,
          outputFormat: 'application/json',
          CQL_FILTER: '',
          maxFeatures: 10000,
        };

        const filters = [];
        if (state.filters.currentView && state.intersectsWmsMonitoring) {
          filters.push(state.intersectsWmsMonitoring);
        }
        if (state.filters.ti?.length) {
          filters.push(`co_funai IN (${state.filters.ti.map(ti => ti.co_funai).join(',')})`);
        }
        if (state.filters.cr?.length) {
          filters.push(`co_cr IN (${state.filters.cr.map(cr => cr.co_cr).join(',')})`);
        }
        if (state.filters.startDate && state.filters.endDate) {
          filters.push(`dt_t_um BETWEEN '${state.filters.startDate}' AND '${state.filters.endDate}'`);
        }

        if (filters.length) params.CQL_FILTER = filters.join(' AND ');

        const url = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;
        const response = await this.$api.$get(url);

        if (response?.features) {
          const estagios = new Set(response.features.map(f => f.properties.no_estagio).filter(Boolean));
          commit('setAvailableEstagios', Array.from(estagios));
          commit('setFeatures', { type: 'FeatureCollection', features: response.features });
        } else {
          commit('setAvailableEstagios', []);
          commit('clearFeatures');
        }
      } catch (error) {
        console.error('Erro ao buscar estágios iniciais:', error);
        commit('setAvailableEstagios', []);
        commit('clearFeatures');
      }
    },

    // Busca opções de filtro (coordenadores regionais)
    async getFilterOptions({ commit }) {
      try {
        const regional_coordinators = await this.$api.$get('funai/cr/');
        const data = {};
        if (regional_coordinators) {
          data.regionalFilters = regional_coordinators.sort((a, b) => a.ds_cr.localeCompare(b.ds_cr));
        }
        commit('setFilterOptions', data);
      } catch (error) {
        console.error('Erro ao buscar opções de filtro:', error);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('regional coordinators'),
          }),
          type: 'error',
        }, { root: true });
      }
    },

    // Busca opções de terras indígenas
    async getTiOptions({ commit, state }, cr) {
      try {
        const params = { co_cr: cr.toString() };
        const tis = await this.$api.$get('funai/ti/', { params });
        if (tis) {
          commit('setFilterOptions', {
            ...state.filterOptions,
            tiFilters: tis.sort((a, b) => a.no_ti.localeCompare(b.no_ti)),
          });
        }
      } catch (error) {
        console.error('Erro ao buscar opções de TI:', error);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('indigenous territories'),
          }),
          type: 'error',
        }, { root: true });
      }
    },

    // Baixa GeoJSON de monitoramento
    async downloadGeoJsonMonitoring({ commit, state, rootState }) {
      commit('setLoadingMonitoring', true);
      try {
        const params = {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetFeature',
          typeName: state.geoserverLayerMonitoring,
          outputFormat: 'application/json',
          maxFeatures: 10000,
        };

        const filters = [];
        const visibleEstagios = Object.keys(state.legendVisibility).filter(
          estagio => state.legendVisibility[estagio]
        );
        if (visibleEstagios.length > 0) {
          filters.push(`no_estagio IN ('${visibleEstagios.join("','")}')`);
        } else {
          throw new Error('Nenhum estágio ativo selecionado');
        }
        if (state.intersectsWmsMonitoring) filters.push(state.intersectsWmsMonitoring);
        if (state.filters.ti?.length) filters.push(`co_funai IN (${state.filters.ti.map(ti => ti.co_funai).join(',')})`);
        if (state.filters.cr?.length) filters.push(`co_cr IN (${state.filters.cr.map(cr => cr.co_cr).join(',')})`);
        if (state.filters.startDate && state.filters.endDate) {
          filters.push(`dt_t_um BETWEEN '${state.filters.startDate}' AND '${state.filters.endDate}'`);
        }

        if (filters.length) params.CQL_FILTER = filters.join(' AND ');

        const url = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;
        const response = await this.$api.$get(url);

        const blob = new Blob([JSON.stringify({
          type: response.type,
          features: response.features,
        })], { type: 'application/geo+json' });

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'monitoring_dados.geojson';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (error) {
        console.error('Erro ao baixar GeoJSON:', error);
        commit('alert/addAlert', {
          message: error.message === 'Nenhum estágio ativo selecionado'
            ? this.$i18n.t('no-active-stages-selected')
            : this.$i18n.t('default-error', {
                action: this.$i18n.t('download'),
                resource: this.$i18n.t('monitoring'),
              }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingMonitoring', false);
      }
    },

    // Baixa tabela de monitoramento em CSV
    async downloadTableMonitoring({ state, commit }) {
      commit('setLoadingCSV', true);
      try {
        if (!state.tableMonitoring.length) throw new Error('Nenhum dado disponível na tabela');

        const headers = [
          'ID','Código Funai', 'Terra Indígena', 'Coordenação Regional', 'Classe',
          'Data da Imagem', 'Área do Polígono (ha)', 'Latitude', 'Longitude',
        ];

        const csvContent = [
          headers.join(','),
          ...state.tableMonitoring.map(row => [
            row.origin_id,
            row.co_funai,
            `"${row.no_ti}"`,
            `"${row.ds_cr}"`,
            row.no_estagio,
            row.dt_imagem,
            row.nu_area_ha,
            row.nu_latitude,
            row.nu_longitude
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'monitoring_table.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Erro ao baixar tabela CSV:', error);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('download'),
            resource: this.$i18n.t('table'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingCSV', false);
      }
    },

    // Alterna visibilidade da legenda
    async toggleLegendVisibility({ commit, dispatch, state }, { estagio, visible }) {
      try {
        commit('setLegendVisibility', { estagio, visible });

        // Atualiza apenas a URL do WMS sem refazer toda a pesquisa
        await dispatch('generateUrlWmsMonitoring');

        // Se heatmap estiver ativo, atualiza apenas ele
        if (state.heatMap) {
          await dispatch('generateHeatmapMonitoring', true);
        }

      } catch (error) {
        console.error('Erro ao alternar visibilidade:', error);
        throw error;
      }
    },

    // Função genérica para buscar dados analíticos
    async getDataAnalyticsMonitoring({ commit, state, rootGetters }, groupingKey) {
      commit('setLoadingStatistic', true);
      const params = {
        start_date: state.filters.startDate,
        end_date: state.filters.endDate,
        grouping: state.filters[groupingKey],
      };

      if (state.filters.ti?.length) {
        params.co_funai = state.filters.ti.map(item => item.co_funai).join(',');
      }

      if (state.filters.cr?.length) {
        params.co_cr = state.filters.cr.map(item => item.co_cr).join(',');
      }

      if (state.filters.currentView) {
        params.in_bbox = rootGetters['map/bbox'];
      }

      try {
        const analyticsMonitoring = await this.$api.$get(
          'monitoring/consolidated/table-stats/',
          { params }
        );

        if (analyticsMonitoring) {
          commit('setAnalytics', analyticsMonitoring);
        }
      } catch (error) {
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
          type: 'error',
        }, { root: true });
      } finally {
        commit('setLoadingStatistic', false);
      }
    },

    // Baixa dados analíticos em CSV
    async downloadCSV({ commit, state, rootGetters }, { grouping, defaultFileName }) {
      commit('setLoadingCSV', true);
      function convertToCSV(data) {
        if (!data || !data.length) return '';
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(';')];
        data.forEach(row => {
          const values = headers.map(header => `"${('' + row[header]).replace(/"/g, '\\"')}"`);
          csvRows.push(values.join(';'));
        });
        return csvRows.join('\n');
      }

      function saveData(data, filename) {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }

      try {
        const params = {
          start_date: state.filters.startDate,
          end_date: state.filters.endDate,
          grouping
        };
        const analyticsMonitoringcsv = await this.$api.$get(
          'monitoring/consolidated/table-stats/',
          { params },
        );

        if (!analyticsMonitoringcsv?.length) {
          throw new Error('Nenhum dado disponível para exportação');
        }

        const csvString = convertToCSV(analyticsMonitoringcsv);
        saveData(csvString, defaultFileName);
      } catch (error) {
        console.error('Erro ao gerar CSV:', error);
      } finally {
        commit('setLoadingCSV', false);
      }
    },

    // Baixa tabela analítica em CSV
    async downloadTableMonitoringAnalytics({ dispatch, state }, type) {
      const typeToConfig = {
        byDay: ['grouping_by_day', 'poligono_monitoramento_estatisticas_por_dia.csv'],
        byMonthYear: ['grouping_by_monthyear', 'poligono_monitoramento_estatisticas_por_mês_e_ano.csv'],
        byYear: ['grouping_by_year', 'poligono_monitoramento_estatisticas_por_ano.csv'],
        byFunai: ['grouping_by_co_funai', 'poligono_monitoramento_estatisticas_por_co_funai_e_dia.csv'],
        byFunaiMonthYear: ['grouping_by_co_funai_and_monthyear', 'poligono_monitoramento_estatisticas_por_co_funai_mês_e_ano.csv'],
        byFunaiYear: ['grouping_by_co_funai_year', 'poligono_monitoramento_estatisticas_por_co_funai_e_ano.csv'],
      };

      const [groupingKey, defaultFileName] = typeToConfig[type] || [];

      if (!groupingKey || !defaultFileName) {
        throw new Error(`Tipo de download inválido: ${type}`);
      }

      await dispatch('downloadCSV', {
        grouping: state.filters[groupingKey],
        defaultFileName,
      });
    },

    // Verifica total de features para download de GeoJSON
    async checkHitsDownloadGeojsonMonitoring({ commit, state, rootState }) {
      let url = rootState.map.geoserverUrl;
      const params = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: state.geoserverLayerMonitoring,
        outputFormat: 'application/json',
        resultType: 'hits',
        CQL_FILTER: '',
      };

      const filters = [];
      if (state.filters.ti?.length) {
        const arrayTI = state.filters.ti.map(item => item.co_funai);
        filters.push(`co_funai IN (${arrayTI.toString()})`);
      }
      if (state.filters.cr?.length) {
        const arrayCR = state.filters.cr.map(item => item.co_cr);
        filters.push(`co_cr IN (${arrayCR.toString()})`);
      }
      if (state.filters.startDate && state.filters.endDate) {
        filters.push(`(dt_t_um >= (${state.filters.startDate}) AND dt_t_um <= (${state.filters.endDate}))`);
      }

      const filtersSubLayersTrue = Object.keys(state.legendVisibility).filter(key => state.legendVisibility[key] === true);
      if (filtersSubLayersTrue?.length) {
        const sublayers = filtersSubLayersTrue.map(value => `no_estagio = '${value}'`).join(' OR ');
        filters.push(`(${sublayers})`);
      }

      if (filters.length) params.CQL_FILTER = filters.join(' AND ');

      const paramsUrl = new URLSearchParams(params);
      url = `${url}${paramsUrl}`;

      try {
        const response = await this.$api.$get(url);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response, 'text/xml');
        const featureCollection = xmlDoc.querySelector('wfs\\:FeatureCollection, FeatureCollection');
        return featureCollection?.getAttribute('numberOfFeatures') || false;
      } catch (error) {
        console.error('Erro ao verificar total de features:', error);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('monitoring'),
          }),
          type: 'error',
        }, { root: true });
        return false;
      }
    },

    // Gera mapa de calor (heatmap)
    async generateHeatmapMonitoring({ commit, state, rootState }, value) {
      try {
        if (value) {
          commit('setLoadingHeatmap', true);
          let url = rootState.map.geoserverUrl;
          const params = {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: state.geoserverLayerMonitoringHeatmap,
            outputFormat: 'application/json',
            CQL_FILTER: '',
          };

          const filters = [];
          if (state.intersectsWmsMonitoring) {
            filters.push(state.intersectsWmsMonitoring);
          }
          if (state.filters.ti?.length) {
            const arrayTI = state.filters.ti.map(item => item.co_funai);
            filters.push(`co_funai IN (${arrayTI.toString()})`);
          }
          if (state.filters.cr?.length) {
            const arrayCR = state.filters.cr.map(item => item.co_cr);
            filters.push(`co_cr IN (${arrayCR.toString()})`);
          }
          if (state.filters.startDate && state.filters.endDate) {
            filters.push(`(dt_t_um >= (${state.filters.startDate}) AND dt_t_um <= (${state.filters.endDate}))`);
          }

          const filtersSubLayersTrue = Object.keys(state.legendVisibility).filter(key => state.legendVisibility[key] === true);
          if (filtersSubLayersTrue?.length) {
            const sublayers = filtersSubLayersTrue.map(value => `no_estagio = '${value}'`).join(' OR ');
            filters.push(`(${sublayers})`);
          }

          if (filters.length) params.CQL_FILTER = filters.join(' AND ');

          const paramsUrl = new URLSearchParams(params);
          url = `${url}${paramsUrl}`;

          const response = await this.$api.$get(url);
          if (!response?.features) {
            throw new Error('Nenhum dado de heatmap retornado');
          }
          commit('setResultsHeatmap', response);
        }
      } catch (error) {
        console.error('Erro ao gerar mapa de calor:', error);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('heatmap'),
          }),
          type: 'error',
        }, { root: true });
        commit('setResultsHeatmap', null);
      } finally {
        commit('setHeatMap', value);
        commit('setLoadingHeatmap', false);
      }
    },
  },
};
