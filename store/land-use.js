import Vue from 'vue';

const { stringify } = require('wkt');

export const state = () => ({
  features: null,
  urlWmsLandUse: '',
  geoserverLayerLandUse: process.env.GEOSERVER_LAND_USE,
  currentUrlWmsLandUse: '',
  showFeaturesLandUse: false,
  LandUseWmsOptions: {
    name: 'landUse',
    maxZoom: 21,
    maxNativeZoom: 19,
    queryable: true,
  },
  loadingLandUse: false,
  isLoadingFeatures: false,
  filterOptions: {
    regionalFilters: [],
    tiFilters: [],
  },
  filters: {
    year: new Date().getFullYear(),
    currentView: false,
  },
  opacity: 100,
  intersectsWmsLandUse: '',
  landUseStyles: {},
  tableLandUse: [],
  isLoadingTable: false,
  isLoadingCSV: false,
  legendVisibility: {},
  availableEstagios: [],
});

export const getters = {
  getLegendItems: (state) => {
    const legendMapping = {
      AG: { name: 'Agropecuária', acronym: 'AG' },
      CR: { name: 'Corte Raso', acronym: 'CR' },
      DG: { name: 'Degradação', acronym: 'DG' },
      MA: { name: 'Massa de Água', acronym: 'MA' },
      MI: { name: 'Mineração', acronym: 'MI' },
      NO: { name: 'Não Observado', acronym: '' },
      RV: { name: 'Rodovia', acronym: 'RV' },
      SV: { name: 'Silvicultura', acronym: 'SV' },
      VN: { name: 'Vegetação Natural', acronym: 'VN' },
      VI: { name: 'Vilarejo', acronym: 'VI' },
    };

    // Determinar estágios ativos com base em tableLandUse
    const activeEstagios = new Set();
    if (state.tableLandUse && state.tableLandUse.length) {
      state.tableLandUse.forEach((item) => {
        ['AG', 'CR', 'DG', 'MA', 'MI', 'NO', 'RV', 'SV', 'VN', 'VI'].forEach((estagio) => {
          if (parseFloat(item[`nu_area_${estagio.toLowerCase()}_ha`]) > 0) {
            activeEstagios.add(estagio);
          }
        });
      });
    }

    // Mapear terras indígenas por estágio com base em features
    const tiCountMap = new Map();
    if (state.features && state.features.features) {
      state.features.features.forEach(({ properties }) => {
        const estagio = properties.no_estagio;
        if (!estagio) return;
        if (!tiCountMap.has(estagio)) {
          tiCountMap.set(estagio, new Set());
        }
        tiCountMap.get(estagio).add(properties.co_funai);
      });
    }

    // Incluir todos os estágios disponíveis, com indicação de ativo
    return state.availableEstagios
      .map((estagio) => {
        const mapped = legendMapping[estagio] || { name: estagio, acronym: '' };
        const label = mapped.acronym ? `${mapped.name} (${mapped.acronym})` : mapped.name;
        return {
          label,
          color: state.landUseStyles[estagio] || '#000000',
          count: (tiCountMap.get(estagio) && tiCountMap.get(estagio).size) || 0,
          estagio,
          visible: state.legendVisibility[estagio] !== false,
          active: activeEstagios.has(estagio), // Indica se o estágio tem área > 0
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  },

  // Novo getter para o componente de impressão
  getActiveLegendItems: (state, getters) => getters.getLegendItems.filter((item) => item.active),
};

export const mutations = {
  setLoadingLandUse(state, payload) {
    state.loadingLandUse = payload;
  },

  resetLegendVisibility(state) {
    state.legendVisibility = {};
    state.availableEstagios.forEach((estagio) => {
      Vue.set(state.legendVisibility, estagio, true); // Reativa todos os estágios
    });
  },

  setIntersectsWmsLandUse(state, intersectsWmsLandUse) {
    state.intersectsWmsLandUse = intersectsWmsLandUse;
  },
  setshowFeaturesLandUse(state, showFeaturesLandUse) {
    state.showFeaturesLandUse = showFeaturesLandUse;
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
  setUrlCurrentWmsLandUse(state, url) {
    state.currentUrlWmsLandUse = url;
  },
  setFeatures(state, features) {
    state.features = features;
    state.isLoadingFeatures = false;
  },
  clearFeatures(state) {
    state.features = null;
  },
  setLandUseStyles(state, styles) {
    state.landUseStyles = styles;
    state.availableEstagios.forEach((estagio) => {
      if (!(estagio in state.legendVisibility)) {
        Vue.set(state.legendVisibility, estagio, true);
      }
    });
  },
  setTableLandUse(state, data) {
    state.tableLandUse = data;
  },
  setLoadingTable(state, payload) {
    state.isLoadingTable = payload;
  },
  setLoadingCSV(state, payload) {
    state.isLoadingCSV = payload;
  },
  setLegendVisibility(state, { estagio, visible }) {
    Vue.set(state.legendVisibility, estagio, visible);
  },
  setAvailableEstagios(state, estagios) {
    state.availableEstagios = estagios;
  },
  setUrlWmsLandUse(state, url) {
    state.urlWmsLandUse = url;
  },
};

export const actions = {
  async initializeGeoserverUrl({ commit, rootState, dispatch }) {
    try {
      if (!rootState.map.geoserverUrl) {
        await dispatch('map/getGeoserverConfig', null, { root: true });
      }
      commit('setUrlWmsLandUse', rootState.map.geoserverUrl);
    } catch (error) {
      console.error('Erro ao inicializar URL do geoserver:', error);
    }
  },
  async getDataTableLandUse({ commit, state, dispatch }) {
    if (!state.urlWmsLandUse) {
      await dispatch('initializeGeoserverUrl');
    }
    commit('setLoadingTable', true);
    try {
      const params = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: state.geoserverLayerLandUse,
        outputFormat: 'application/json',
        CQL_FILTER: '',
        maxFeatures: 10000,
      };

      const filters = [];

      // Adicionar filtro para estágios visíveis apenas se houver estágios visíveis
      const visibleEstagios = Object.keys(state.legendVisibility).filter(
        (estagio) => state.legendVisibility[estagio],
      );
      if (visibleEstagios.length > 0) {
        filters.push(`no_estagio IN ('${visibleEstagios.join("','")}')`);
      } else {
        // Não adiciona filtro de estágios, permitindo que todos sejam buscados
      }

      if (state.filters.currentView && state.intersectsWmsLandUse) filters.push(state.intersectsWmsLandUse);
      if (state.filters.ti && state.filters.ti.length) filters.push(`co_funai IN (${state.filters.ti.map((ti) => ti.co_funai).join(',')})`);
      if (state.filters.cr && state.filters.cr.length) filters.push(`co_cr IN (${state.filters.cr.map((cr) => cr.co_cr).join(',')})`);
      if (state.filters.year) filters.push(`nu_ano = ${state.filters.year}`);

      if (filters.length) params.CQL_FILTER = filters.join(' AND ');

      const url = `${state.urlWmsLandUse}${new URLSearchParams(params)}`;
      const response = await this.$api.$get(url);

      if (!response || !response.features) {
        commit('setTableLandUse', []);
        throw new Error('Nenhum dado encontrado');
      }

      const groupedData = response.features.reduce((acc, { properties }) => {
        const key = `${properties.co_funai}-${properties.nu_ano}`;
        const estagio = properties.no_estagio;
        const area = properties.nu_area_ha || 0;

        if (!acc[key]) {
          acc[key] = {
            co_funai: properties.co_funai || '',
            ds_cr: properties.ds_cr || '',
            no_ti: properties.no_ti || '',
            nu_ano: properties.nu_ano || state.filters.year,
            nu_area_ha: 0,
            ...['AG', 'CR', 'DG', 'MA', 'SV', 'VN', 'VI', 'RV', 'MI', 'NO'].reduce((o, e) => ({
              ...o,
              [`nu_area_${e.toLowerCase()}_ha`]: 0,
            }), {}),
          };
        }

        const group = acc[key];
        if (estagio && group[`nu_area_${estagio.toLowerCase()}_ha`] !== undefined) {
          group[`nu_area_${estagio.toLowerCase()}_ha`] += area;
        }
        group.nu_area_ha += area;

        return acc;
      }, {});

      commit('setTableLandUse', Object.values(groupedData));
    } catch (error) {
      console.error('Erro ao buscar dados da tabela:', error);
      commit('setTableLandUse', []);
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

  async getLandUseStyleFromGeoserver({ commit, state, dispatch }) {
    if (!state.urlWmsLandUse) {
      await dispatch('initializeGeoserverUrl');
    }
    try {
      const params = {
        service: 'WMS',
        version: '1.1.0',
        request: 'GetLegendGraphic',
        layer: state.geoserverLayerLandUse,
        format: 'application/json',
      };
      const url = `${state.urlWmsLandUse}${new URLSearchParams(params)}`;
      const response = await this.$api.$get(url);
      const styles = {};
      if (response.Legend && response.Legend[0] && response.Legend[0].rules) {
        response.Legend[0].rules.forEach((rule) => {
          if (rule.filter && rule.name) {
            const estagioMatch = rule.filter.match(/no_estagio\s*=\s*['"]?([^'"]+)['"]?/);
            const symbolizer = rule.symbolizers[0];
            const fillColor = (symbolizer && symbolizer.Polygon && symbolizer.Polygon.fill) || null;
            if (estagioMatch && estagioMatch[1] && fillColor) {
              styles[estagioMatch[1]] = fillColor;
            }
          }
        });
      }
      commit('setLandUseStyles', styles);
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

  async generateUrlWmsLandUse({ state, commit, dispatch }) {
    if (!state.urlWmsLandUse) {
      await dispatch('initializeGeoserverUrl');
    }
    const params = {
      layers: state.geoserverLayerLandUse,
      env: `fill-opacity:${state.opacity / 100}`,
      CQL_FILTER: '',
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
    };

    const filters = [];
    const visibleEstagios = Object.keys(state.legendVisibility).filter(
      (estagio) => state.legendVisibility[estagio],
    );

    // Só aplicar o filtro de estágios se houver pelo menos um estágio visível
    if (visibleEstagios.length > 0) {
      filters.push(`no_estagio IN ('${visibleEstagios.join("','")}')`);
    } else {
      // Não adiciona filtro de estágios, permitindo que todos sejam buscados
    }

    if (state.intersectsWmsLandUse) filters.push(state.intersectsWmsLandUse);
    if (state.filters.ti && state.filters.ti.length) filters.push(`co_funai IN (${state.filters.ti.map((ti) => ti.co_funai).join(',')})`);
    if (state.filters.cr && state.filters.cr.length) filters.push(`co_cr IN (${state.filters.cr.map((cr) => cr.co_cr).join(',')})`);
    if (state.filters.year) filters.push(`(nu_ano = ${state.filters.year})`);

    if (filters.length) params.CQL_FILTER = filters.join(' AND ');

    const fullUrl = `${state.urlWmsLandUse}${new URLSearchParams(params)}`;
    commit('setUrlCurrentWmsLandUse', fullUrl);
  },

  async fetchLandUseFeatures({ state, commit, dispatch }) {
    commit('setLoadingFeatures', true);
    try {
      await dispatch('getLandUseStyleFromGeoserver');

      const params = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: state.geoserverLayerLandUse,
        outputFormat: 'application/json',
        CQL_FILTER: '',
        maxFeatures: 10000,
      };

      const cqlFilters = [];
      const visibleEstagios = Object.keys(state.legendVisibility).filter(
        (estagio) => state.legendVisibility[estagio],
      );

      // Só aplicar o filtro de estágios se houver pelo menos um estágio visível
      if (visibleEstagios.length > 0) {
        cqlFilters.push(`no_estagio IN ('${visibleEstagios.join("','")}')`);
      } else {
        // Não adiciona filtro de estágios, permitindo que todos sejam buscados
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

      if (state.filters.ti && state.filters.ti.length) {
        const tiList = state.filters.ti.map((ti) => ti.co_funai).join(',');
        cqlFilters.push(`co_funai IN (${tiList})`);
      }

      if (state.filters.cr && state.filters.cr.length) {
        const crList = state.filters.cr.map((cr) => cr.co_cr).join(',');
        cqlFilters.push(`co_cr IN (${crList})`);
      }

      if (state.filters.year) {
        cqlFilters.push(`(nu_ano = ${state.filters.year})`);
      }

      if (cqlFilters.length) {
        params.CQL_FILTER = cqlFilters.join(' AND ');
      }

      const url = `${state.urlWmsLandUse}${new URLSearchParams(params)}`;
      const response = await this.$api.$get(url);

      if (response && response.features) {
        const geojson = {
          type: response.type,
          features: response.features,
        };
        commit('setFeatures', geojson);
      } else {
        throw new Error('Resposta do GeoServer sem features');
      }
    } catch (error) {
      console.error('Erro ao buscar features do LANDUSE:', error);
      commit('alert/addAlert', {
        message: this.$i18n.t('default-error', {
          action: this.$i18n.t('retrieve'),
          resource: this.$i18n.t('landUse'),
        }),
        type: 'error',
      }, { root: true });
      commit('setshowFeaturesLandUse', false);
    } finally {
      commit('setLoadingFeatures', false);
    }
  },

  async getFeatures({ state, commit, dispatch }) {
    if (!state.urlWmsLandUse) {
      await dispatch('initializeGeoserverUrl');
    }
    commit('setUrlCurrentWmsLandUse', '');
    commit('setLoadingLandUse', true);
    commit('clearFeatures');

    try {
      commit('setshowFeaturesLandUse', true);
      commit('setLoadingFeatures', true);

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
        commit('setIntersectsWmsLandUse', `INTERSECTS(geom,${wkt})`);
      } else {
        commit('setIntersectsWmsLandUse', '');
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
          if (
            (state.filters.cr && state.filters.cr.length)
              || (state.filters.ti && state.filters.ti.length)
          ) {
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
            resource: this.$i18n.t('landUse'),
          }),
        }, { root: true });
      }

      await dispatch('fetchInitialEstagios');
      await dispatch('getLandUseStyleFromGeoserver');
      await dispatch('generateUrlWmsLandUse');
      await dispatch('fetchLandUseFeatures');
    } catch (exception) {
      console.error('Erro em getFeatures:', exception);
      commit('alert/addAlert', {
        message: this.$i18n.t('default-error', {
          action: this.$i18n.t('retrieve'),
          resource: this.$i18n.t('landUse'),
        }),
        type: 'error',
      }, { root: true });
    } finally {
      commit('setLoadingFeatures', false);
      commit('setLoadingLandUse', false);
    }
  },

  async fetchInitialEstagios({ state, commit }) {
    try {
      const params = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: state.geoserverLayerLandUse,
        outputFormat: 'application/json',
        CQL_FILTER: '',
        maxFeatures: 10000,
      };

      const filters = [];
      if (state.filters.currentView && state.intersectsWmsLandUse) filters.push(state.intersectsWmsLandUse);
      if (state.filters.ti && state.filters.ti.length) filters.push(`co_funai IN (${state.filters.ti.map((ti) => ti.co_funai).join(',')})`);
      if (state.filters.cr && state.filters.cr.length) filters.push(`co_cr IN (${state.filters.cr.map((cr) => cr.co_cr).join(',')})`);
      if (state.filters.year) filters.push(`(nu_ano = ${state.filters.year})`);

      if (filters.length) params.CQL_FILTER = filters.join(' AND ');

      const url = `${state.urlWmsLandUse}${new URLSearchParams(params)}`;
      const response = await this.$api.$get(url);

      if (response && response.features) {
        const estagios = new Set(response.features.map((f) => f.properties.no_estagio).filter(Boolean));
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

  async getTiOptions({ commit, state }, cr) {
    try {
      const params = {
        co_cr: cr.toString(),
      };

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

  async downloadGeoJsonLandUse({ commit, state, dispatch }) {
    if (!state.urlWmsLandUse) {
      await dispatch('initializeGeoserverUrl');
    }
    commit('setLoadingLandUse', true);
    try {
      const params = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: state.geoserverLayerLandUse,
        outputFormat: 'application/json',
        maxFeatures: 10000,
      };

      const filters = [];

      // Adicionar filtro para estágios visíveis
      const visibleEstagios = Object.keys(state.legendVisibility).filter(
        (estagio) => state.legendVisibility[estagio],
      );
      if (visibleEstagios.length > 0) {
        filters.push(`no_estagio IN ('${visibleEstagios.join("','")}')`);
      } else {
        throw new Error('Nenhum estágio ativo selecionado');
      }

      if (state.intersectsWmsLandUse) filters.push(state.intersectsWmsLandUse);
      if (state.filters.ti && state.filters.ti.length) filters.push(`co_funai IN (${state.filters.ti.map((ti) => ti.co_funai).join(',')})`);
      if (state.filters.cr && state.filters.cr.length) filters.push(`co_cr IN (${state.filters.cr.map((cr) => cr.co_cr).join(',')})`);
      if (state.filters.year) filters.push(`nu_ano = ${state.filters.year}`);

      if (filters.length) params.CQL_FILTER = filters.join(' AND ');

      const url = `${state.urlWmsLandUse}${new URLSearchParams(params)}`;
      const response = await this.$api.$get(url);

      const blob = new Blob([JSON.stringify({
        type: response.type,
        features: response.features,
      })], { type: 'application/geo+json' });

      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'landUse_dados.geojson';
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
            resource: this.$i18n.t('landUse'),
          }),
        type: 'error',
      }, { root: true });
    } finally {
      commit('setLoadingLandUse', false);
    }
  },

  async downloadTableLandUse({ state, commit }) {
    commit('setLoadingCSV', true);
    try {
      if (!state.tableLandUse.length) throw new Error('Nenhum dado disponível na tabela');

      const headers = [
        'Código Funai', 'Coordenação Regional', 'Terra Indígena', 'Ano',
        'Agropecuaria (ha)', 'Corte raso (ha)', 'Degradação (ha)', 'Massa de água (ha)',
        'Silvicultura', 'Vegetação natural (ha)', 'Vilarejo (ha)', 'Rodovia (ha)',
        'Mineração (ha)', 'Não observado (ha)', 'Total (ha)',
      ];

      const csvContent = [
        headers.join(','),
        ...state.tableLandUse.map((row) => [
          row.co_funai,
          `"${row.ds_cr}"`,
          `"${row.no_ti}"`,
          row.nu_ano,
          ...['ag', 'cr', 'dg', 'ma', 'sv', 'vn', 'vi', 'rv', 'mi', 'no'].map((k) => row[`nu_area_${k}_ha`]),
          row.nu_area_ha,
        ].join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'landUse_table.csv';
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

  async toggleLegendVisibility({ commit, dispatch, state }, { estagio, visible }) {
    commit('setLegendVisibility', { estagio, visible });
    // Mantém as feições atuais até que as novas sejam carregadas
    await dispatch('generateUrlWmsLandUse');
    await dispatch('fetchLandUseFeatures');
  },
};
