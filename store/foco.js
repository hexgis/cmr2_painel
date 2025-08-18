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
      opacity: 100,
      intersectsWms: '',
    },
  },
  urlWmsBase: '',
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
  featuresLoaded: (state) => (layer) => {
    console.log(`[GETTER] Verificando features carregadas para ${layer}`, state.layers[layer].features);
    return (
      state.layers[layer].features &&
      state.layers[layer].features.features &&
      state.layers[layer].features.features.length > 0
    );
  },
  getShowFeatures: (state) => (layer) => {
    console.log(`[GETTER] Obter showFeatures para ${layer}:`, state.layers[layer].showFeatures);
    return state.layers[layer].showFeatures;
  },
};

export const mutations = {
  setIntersectsWms(state, { layer, intersectsWms }) {
    console.log(`[MUTATION] Definindo intersectsWms para ${layer}:`, intersectsWms);
    state.layers[layer].intersectsWms = intersectsWms;
  },

  setShowFeatures(state, { layer, showFeatures }) {
    console.log(`[MUTATION] Definindo showFeatures para ${layer}:`, showFeatures);
    state.layers[layer].showFeatures = showFeatures;
  },

  setLoadingFeatures(state, payload) {
    console.log('[MUTATION] Definindo isLoadingFeatures:', payload);
    state.isLoadingFeatures = payload;
  },

  setFilterOptions(state, data) {
    console.log('[MUTATION] Definindo filterOptions:', data);
    state.filterOptions = data;
  },

  setOpacity(state, { layer, opacity }) {
    console.log(`[MUTATION] Definindo opacity para ${layer}:`, opacity);
    state.layers[layer].opacity = opacity;
  },

  setFilters(state, { layer, filters }) {
    console.log(`[MUTATION] Definindo filters para ${layer}:`, filters);
    state.layers[layer].filters = {
      ...state.layers[layer].filters,
      ...filters,
    };
  },

  setUrlCurrentWms(state, { layer, url }) {
    console.log(`[MUTATION] Definindo currentUrlWms para ${layer}:`, url);
    state.layers[layer].currentUrlWms = url;
  },

  setFeatures(state, { layer, features }) {
    console.log(`[MUTATION] Armazenando features para ${layer}:`, {
      count: features?.features?.length || 0,
      sample: features?.features?.[0]?.properties || null
    });
    state.layers[layer].features = features;
    state.isLoadingFeatures = false;
  },

  setLoading(state, { layer, loading }) {
    console.log(`[MUTATION] Definindo loading para ${layer}:`, loading);
    state.layers[layer].loading = loading;
  },

  clearFeatures(state, layer) {
    console.log(`[MUTATION] Limpando features para ${layer}`);
    state.layers[layer].features = null;
  },
};

export const actions = {
  async generateUrlWms({ state, commit, rootState }, layer) {
    console.groupCollapsed(`[ACTION] generateUrlWms para ${layer}`);

    if (!state.layers[layer].geoserverLayer) {
      console.log('Geoserver layer não definido, abortando');
      console.groupEnd();
      return;
    }

    const params = {
      layers: state.layers[layer].geoserverLayer,
      env: `fill-opacity:${state.layers[layer].opacity / 100}`,
      CQL_FILTER: '',
      opacity: state.layers[layer].opacity,
    };

    console.log('Parâmetros base:', params);

    let url = rootState.map.geoserverUrl;
    if (!url) {
      console.log('URL do geoserver não disponível');
      console.groupEnd();
      return;
    }

    url = url.replace('wms', 'ows');
    console.log('URL base modificada:', url);

    // Apply intersects filter
    if (state.layers[layer].intersectsWms) {
      params.CQL_FILTER += state.layers[layer].intersectsWms;
      console.log('Adicionado filtro intersects:', state.layers[layer].intersectsWms);
    }

    // Apply TI filter
    const arrayTI = [];
    if (state.layers[layer].filters.ti && state.layers[layer].filters.ti.length) {
      Object.values(state.layers[layer].filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      if (params.CQL_FILTER.length) params.CQL_FILTER += ' AND ';
      params.CQL_FILTER += `co_funai IN (${arrayTI.toString()})`;
      console.log('Adicionado filtro TI:', arrayTI);
    }

    // Apply CR filter
    const arrayCR = [];
    if (state.layers[layer].filters.cr && state.layers[layer].filters.cr.length) {
      Object.values(state.layers[layer].filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      if (params.CQL_FILTER.length) params.CQL_FILTER += ' AND ';
      params.CQL_FILTER += `co_cr IN (${arrayCR.toString()})`;
      console.log('Adicionado filtro CR:', arrayCR);
    }

    // Date filter
    if (state.layers[layer].filters.startDate && state.layers[layer].filters.endDate) {
      if (params.CQL_FILTER.length) params.CQL_FILTER += ' AND ';
      params.CQL_FILTER += `(dt_foco_calor >= (${state.layers[layer].filters.startDate}) AND dt_foco_calor <= (${state.layers[layer].filters.endDate}))`;
      console.log('Adicionado filtro de datas:', {
        start: state.layers[layer].filters.startDate,
        end: state.layers[layer].filters.endDate
      });
    }

    const paramsUrl = new URLSearchParams(params);
    const fullUrl = `${url}${paramsUrl}`;

    console.log('URL final gerada:', fullUrl);
    commit('setUrlCurrentWms', { layer, url: fullUrl });

    console.groupEnd();
  },

  async getFeatures({ state, commit, dispatch }, layer) {
    console.groupCollapsed(`[ACTION] getFeatures para ${layer}`);

    commit('setUrlCurrentWms', { layer, url: '' });
    commit('setLoading', { layer, loading: true });
    commit('clearFeatures', layer);

    try {
      console.log('Iniciando busca de features...');
      commit('setShowFeatures', { layer, showFeatures: true });
      commit('setLoadingFeatures', true);

      const map = window.mapMain;
      if (state.layers[layer].filters.currentView) {
        console.log('Filtrando pela view atual do mapa');
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const nw = L.latLng(ne.lat, sw.lng);
        const se = L.latLng(sw.lat, ne.lng);
        const bboxPolygon = L.polygon([sw, se, ne, nw, sw]);
        const geojson = bboxPolygon.toGeoJSON();
        const wkt = stringify(geojson.geometry);

        commit('setIntersectsWms', { layer, intersectsWms: `INTERSECTS(geom,${wkt})` });
      } else {
        console.log('Buscando em toda a extensão');
        commit('setIntersectsWms', { layer, intersectsWms: '' });
      }



      // Process TI filters
      const arrayTI = [];
      if (state.layers[layer].filters.ti && state.layers[layer].filters.ti.length) {
        Object.values(state.layers[layer].filters.ti).forEach((item) => {
          arrayTI.push(item.co_funai);
        });
        console.log('IDs de TI para filtro:', arrayTI);
      }

      // Process CR filters
      const arrayCR = [];
      if (state.layers[layer].filters.cr && state.layers[layer].filters.cr.length) {
        Object.values(state.layers[layer].filters.cr).forEach((item) => {
          arrayCR.push(item.co_cr);
        });
        console.log('IDs de CR para filtro:', arrayCR);
      }

      try {
        if (!state.layers[layer].filters.currentView) {
          let bbox;
          if (arrayCR.length || arrayTI.length) {
            console.log('Obtendo bbox para CRs/TIs selecionadas');
            bbox = await this.$api.$post('monitoring/consolidated/bbox/', {
              co_cr: [...arrayCR],
              co_funai: [...arrayTI],
            });
            console.log('Bbox recebida:', bbox);

            if (bbox) {
              const bounds = L.latLngBounds([bbox[1], bbox[0]], [bbox[3], bbox[2]]);
              map.fitBounds(bounds);
              console.log('Mapa ajustado para a bbox');
            }
          }
        }
      } catch (error) {
        console.error('Erro ao obter bbox:', error);
        commit('alert/addAlert', {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('foco'),
          }),
        }, { root: true });
      }

      console.log('Gerando URL WMS...');
      await dispatch('generateUrlWms', layer);
      console.log('Busca concluída com sucesso');

    } catch (exception) {
      console.error('Erro na busca de features:', exception);
      commit('alert/addAlert', {
        message: this.$i18n.t('default-error', {
          action: this.$i18n.t('retrieve'),
          resource: this.$i18n.t('foco'),
        }),
      }, { root: true });
    } finally {
      commit('setLoadingFeatures', false);
      commit('setLoading', { layer, loading: false });
      console.groupEnd();
    }
  },

  async getFilterOptions({ commit }) {
    console.groupCollapsed('[ACTION] getFilterOptions');

    try {
      console.log('Buscando coordenadores regionais...');
      const regional_coordinators = await this.$api.$get('funai/cr/');
      const data = {};

      if (regional_coordinators) {
        console.log('Coordenadores recebidos:', regional_coordinators.length);
        data.regionalFilters = regional_coordinators.sort((a, b) => a.ds_cr > b.ds_cr);
      }

      commit('setFilterOptions', data);
      console.log('FilterOptions definidos:', data);
    } catch (error) {
      console.error('Erro ao buscar filter options:', error);
      commit('alert/addAlert', {
        message: this.$i18n.t('default-error', {
          action: this.$i18n.t('retrieve'),
          resource: this.$i18n.t('regional coordinators'),
        }),
      }, { root: true });
    } finally {
      console.groupEnd();
    }
  },

  async getTiOptions({ commit, state }, cr) {
    console.groupCollapsed('[ACTION] getTiOptions');
    console.log('CRs recebidos:', cr);

    try {
      const params = {
        co_cr: cr.toString(),
      };

      console.log('Buscando TIs com params:', params);
      const tis = await this.$api.$get('funai/ti/', { params });

      if (tis) {
        console.log('TIs recebidas:', tis.length);
        commit('setFilterOptions', {
          ...state.filterOptions,
          tiFilters: tis.sort((a, b) => a.no_ti > b.no_ti),
        });
      }
    } catch (error) {
      console.error('Erro ao buscar TIs:', error);
      commit('alert/addAlert', {
        message: this.$i18n.t('default-error', {
          action: this.$i18n.t('retrieve'),
          resource: this.$i18n.t('indigenous territories'),
        }),
      }, { root: true });
    } finally {
      console.groupEnd();
    }
  },
};
