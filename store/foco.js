import { stringify } from 'wkt';

export const state = () => ({
  layers: {
    aquaMM: {
      features: null,
      geoserverLayer: process.env.GEOSERVER_FOCO_MM,
      currentUrlWms: '',
      showFeatures: false,
      loading: false,
      filters: {
        startDate: null,
        endDate: null,
        currentView: false,
        cr: [],
        ti: null,
      },
      tableData: [],
      opacity: 100,
      intersectsWms: '',
    },
    aquaMT: {
      features: null,
      geoserverLayer: process.env.GEOSERVER_FOCO_MT,
      currentUrlWms: '',
      showFeatures: false,
      loading: false,
      filters: {
        startDate: null,
        endDate: null,
        currentView: false,
        cr: [],
        ti: null,
      },
      tableData: [],
      opacity: 100,
      intersectsWms: '',
    },
  },
  urlWmsBase: '',
  hasData: false,
  wmsOptions: {
    maxZoom: 21,
    maxNativeZoom: 19,
    queryable: true,
  },
  isLoadingFeatures: false,
  filterOptions: {
    regionalFilters: [],
    tiFilters: [],
  },
});

export const getters = {
  featuresLoaded: (state) => (layer) => (
    state.layers[layer].features
      && state.layers[layer].features.features
      && state.layers[layer].features.features.length > 0
  ),
  getShowFeatures: (state) => (layer) => state.layers[layer].showFeatures,
};

export const mutations = {
  setTableData(state, { layer, tableData }) {
    state.layers[layer].tableData = tableData;
  },
  setLoadingTable(state, payload) {
    state.isLoadingTable = payload;
  },
  setIntersectsWms(state, { layer, intersectsWms }) {
    state.layers[layer].intersectsWms = intersectsWms;
  },
  setShowFeatures(state, { layer, showFeatures }) {
    state.layers[layer].showFeatures = showFeatures;
  },
  setLoadingFeatures(state, payload) {
    state.isLoadingFeatures = payload;
  },
  setFilterOptions(state, data) {
    state.filterOptions = data;
  },
  setOpacity(state, { layer, opacity }) {
    state.layers[layer].opacity = opacity;
  },
  setFilters(state, { layer, filters }) {
    state.layers[layer].filters = {
      ...state.layers[layer].filters,
      ...filters,
    };
  },
  setUrlCurrentWms(state, { layer, url }) {
    state.layers[layer].currentUrlWms = url;
  },
  setFeatures(state, { layer, features }) {
    state.layers[layer].features = features;
    state.isLoadingFeatures = false;
  },
  setLoading(state, { layer, loading }) {
    state.layers[layer].loading = loading;
  },
  clearFeatures(state, layer) {
    state.layers[layer].features = null;
  },
};

export const actions = {
  async getTableData({ commit, state, rootState }, layer) {
    commit('setLoadingTable', true);
    try {
      const params = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: state.layers[layer].geoserverLayer,
        outputFormat: 'application/json',
        CQL_FILTER: state.layers[layer].intersectsWms || '',
        maxFeatures: 10000,
        propertyName: '*',
      };

      const arrayTI = [];
      if (state.layers[layer].filters.ti && state.layers[layer].filters.ti.length) {
        Object.values(state.layers[layer].filters.ti).forEach((item) => {
          arrayTI.push(item.co_funai);
        });
        if (params.CQL_FILTER.length) params.CQL_FILTER += ' AND ';
        params.CQL_FILTER += `co_funai IN (${arrayTI.toString()})`;
      }

      const arrayCR = [];
      if (state.layers[layer].filters.cr && state.layers[layer].filters.cr.length) {
        Object.values(state.layers[layer].filters.cr).forEach((item) => {
          arrayCR.push(item.co_cr);
        });
        if (params.CQL_FILTER.length) params.CQL_FILTER += ' AND ';
        params.CQL_FILTER += `co_cr IN (${arrayCR.toString()})`;
      }

      if (state.layers[layer].filters.startDate && state.layers[layer].filters.endDate) {
        if (params.CQL_FILTER.length) params.CQL_FILTER += ' AND ';
        params.CQL_FILTER += `(dt_foco_calor >= '${state.layers[layer].filters.startDate}' AND dt_foco_calor <= '${state.layers[layer].filters.endDate}')`;
      }

      const url = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;
      const response = await this.$api.$get(url);
      const tableData = response.features.map(({ properties }) => ({
        co_funai: properties.co_funai || '',
        id: properties.id || '',
        no_satelite: properties.no_satelite || '',
        no_bioma: properties.no_bioma || '',
        no_municipio: properties.no_municipio || '',
        sg_uf: properties.sg_uf || '',
        sg_regiao: properties.sg_regiao || '',
        nu_percentual: properties.nu_percentual || '',
        nu_risco: properties.nu_risco || 'N/A',
        nu_dias_sem_chuva: properties.nu_dias_sem_chuva || 'N/A',
        dt_foco_calor: properties.dt_foco_calor || '',
        hr_foco_calor: properties.hr_foco_calor || '',
        dt_cadastro: properties.dt_cadastro || '',
        no_ti: properties.no_ti || '',
        co_cr: properties.co_cr || '',
        ds_cr: properties.ds_cr || '',
      }));
      commit('setTableData', { layer, tableData });
    } catch (error) {
      console.error(`[getTableData] Erro ao buscar dados da tabela para ${layer}:`, error);
      commit('setTableData', { layer, tableData: [] });
      this.hasData = true;
    } finally {
      commit('setLoadingTable', false);
    }
  },

  async generateUrlWms({ state, commit, rootState }, layer) {
    if (!state.layers[layer].geoserverLayer) {
      console.error(`[generateUrlWms] Geoserver layer não definido para ${layer}`);
      return;
    }
    const params = {
      layers: state.layers[layer].geoserverLayer,
      env: `fill-opacity:${state.layers[layer].opacity / 100}`,
      CQL_FILTER: '',
      opacity: state.layers[layer].opacity,
    };
    let url = rootState.map.geoserverUrl;
    if (!url) {
      console.error('[generateUrlWms] URL do geoserver não definida');
      return;
    }
    url = url.replace('wms', 'wfs');
    if (state.layers[layer].intersectsWms) {
      params.CQL_FILTER += state.layers[layer].intersectsWms;
    }
    const arrayTI = [];
    if (state.layers[layer].filters.ti && state.layers[layer].filters.ti.length) {
      Object.values(state.layers[layer].filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      if (params.CQL_FILTER.length) params.CQL_FILTER += ' AND ';
      params.CQL_FILTER += `co_funai IN (${arrayTI.toString()})`;
    }
    const arrayCR = [];
    if (state.layers[layer].filters.cr && state.layers[layer].filters.cr.length) {
      Object.values(state.layers[layer].filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      if (params.CQL_FILTER.length) params.CQL_FILTER += ' AND ';
      params.CQL_FILTER += `co_cr IN (${arrayCR.toString()})`;
    }
    if (state.layers[layer].filters.startDate && state.layers[layer].filters.endDate) {
      if (params.CQL_FILTER.length) params.CQL_FILTER += ' AND ';
      params.CQL_FILTER += `(dt_foco_calor >= '${state.layers[layer].filters.startDate}' AND dt_foco_calor <= '${state.layers[layer].filters.endDate}')`;
    }
    const paramsUrl = new URLSearchParams(params);
    const fullUrl = `${url}?${paramsUrl}`;
    commit('setUrlCurrentWms', { layer, url: fullUrl });
  },

  async getFeatures({
    state, commit, dispatch, rootState,
  }, layer) {
    commit('setLoading', { layer, loading: true });
    commit('setLoadingFeatures', true);
    commit('clearFeatures', layer);

    try {
      const map = window.mapMain;
      let cqlFilter = '';
      if (state.layers[layer].filters.currentView) {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const nw = L.latLng(ne.lat, sw.lng);
        const se = L.latLng(sw.lat, ne.lng);
        const bboxPolygon = L.polygon([sw, se, ne, nw, sw]);
        const geojson = bboxPolygon.toGeoJSON();
        const wkt = stringify(geojson.geometry);
        cqlFilter = `INTERSECTS(geom,${wkt})`;
        commit('setIntersectsWms', { layer, intersectsWms: cqlFilter });
      } else {
        commit('setIntersectsWms', { layer, intersectsWms: '' });
      }

      const arrayTI = [];
      if (state.layers[layer].filters.ti && state.layers[layer].filters.ti.length) {
        Object.values(state.layers[layer].filters.ti).forEach((item) => {
          arrayTI.push(item.co_funai);
        });
        if (cqlFilter) cqlFilter += ' AND ';
        cqlFilter += `co_funai IN (${arrayTI.toString()})`;
      }

      const arrayCR = [];
      if (state.layers[layer].filters.cr && state.layers[layer].filters.cr.length) {
        Object.values(state.layers[layer].filters.cr).forEach((item) => {
          arrayCR.push(item.co_cr);
        });
        if (cqlFilter) cqlFilter += ' AND ';
        cqlFilter += `co_cr IN (${arrayCR.toString()})`;
      }

      if (state.layers[layer].filters.startDate && state.layers[layer].filters.endDate) {
        if (cqlFilter) cqlFilter += ' AND ';
        cqlFilter += `(dt_foco_calor >= '${state.layers[layer].filters.startDate}' AND dt_foco_calor <= '${state.layers[layer].filters.endDate}')`;
      }

      try {
        if (!state.layers[layer].filters.currentView && (arrayCR.length || arrayTI.length)) {
          const bbox = await this.$api.$post('monitoring/consolidated/bbox/', {
            co_cr: [...arrayCR],
            co_funai: [...arrayTI],
          });
          if (bbox) {
            const bounds = L.latLngBounds([bbox[1], bbox[0]], [bbox[3], bbox[2]]);
            map.fitBounds(bounds);
          }
        }
      } catch (error) {
        console.error('[getFeatures] Erro ao obter bbox:', error);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('foco'),
          }),
          type: 'error',
          timeout: 5000,
        }, { root: true });
      }

      const wfsParams = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: state.layers[layer].geoserverLayer,
        outputFormat: 'application/json',
        CQL_FILTER: cqlFilter || undefined,
      };

      let url = rootState.map.geoserverUrl;
      if (!url) {
        console.error('[generateUrlWms] URL do geoserver não definida');
        return;
      }
      url = url.replace('ows', 'wfs');
      const wfsUrl = `${url}?${new URLSearchParams(wfsParams)}`;
      const response = await this.$api.$get(wfsUrl);
      commit('setFeatures', { layer, features: response });

      await dispatch('generateUrlWms', layer);
    } catch (exception) {
      console.error(`[getFeatures] Erro na busca de features para ${layer}:`, exception);
      commit('alert/addAlert', {
        message: this.$i18n.t('default-error', {
          action: this.$i18n.t('retrieve'),
          resource: this.$i18n.t('foco'),
        }),
        type: 'error',
        timeout: 5000,
      }, { root: true });
      await dispatch('generateUrlWms', layer);
    } finally {
      commit('setLoadingFeatures', false);
      commit('setLoading', { layer, loading: false });
    }
  },

  async getFilterOptions({ commit }) {
    try {
      const regional_coordinators = await this.$api.$get('funai/cr/');
      const data = {};
      if (regional_coordinators) {
        data.regionalFilters = regional_coordinators.sort((a, b) => a.ds_cr > b.ds_cr);
      }
      commit('setFilterOptions', data);
    } catch (error) {
      console.error('[getFilterOptions] Erro ao buscar filter options:', error);
      commit('alert/addAlert', {
        message: this.$i18n.t('default-error', {
          action: this.$i18n.t('retrieve'),
          resource: this.$i18n.t('regional coordinators'),
        }),
        type: 'error',
        timeout: 5000,
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
          tiFilters: tis.sort((a, b) => a.no_ti > b.no_ti),
        });
      }
    } catch (error) {
      console.error('[getTiOptions] Erro ao buscar TIs:', error);
      commit('alert/addAlert', {
        message: this.$i18n.t('default-error', {
          action: this.$i18n.t('retrieve'),
          resource: this.$i18n.t('indigenous territories'),
        }),
        type: 'error',
        timeout: 5000,
      }, { root: true });
    }
  },
};
