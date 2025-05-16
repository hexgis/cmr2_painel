const { stringify } = require('wkt');

export const state = () => ({
  features: null,
  urlWmsFoco: 'https://cmrhomolog.funai.gov.br/geoserver/ows?',
  geoserverLayerFoco: 'CMR-FUNAI:vw_satelite_aqua_m_m_loc_focos_de_calor_p1',
  currentUrlWmsFoco: '',
  showFeaturesFoco: false,
   FocoWmsOptions: {
    name: 'foco',
    maxZoom: 21,
    maxNativeZoom: 19,
    queryable: true,
  },
  loadingFoco: false,
  isLoadingFeatures: false,
  filterOptions: {
    regionalFilters: [],
    tiFilters: [],
  },
  filters: {
    startDate: null,
    endDate: null,
    currentView: false, 
    priority: null,
    cr: [],
    ti: null,
    
  },
  opacity: 100,
  intersectsWmsFoco: '',
});

export const getters = {
  featuresLoaded(state) {
    return (
      state.features &&
      state.features.features &&
      state.features.features.length > 0
    );
  },
  getShowFeaturesFoco: (state) => {
    return state.showFeaturesFoco;
  },
};

export const mutations = {
  setIntersectsWmsFoco(state, intersectsWmsFoco) {
    state.intersectsWmsFoco = intersectsWmsFoco;
  },

  setshowFeaturesFoco(state, showFeaturesFoco) {
    state.showFeaturesFoco = showFeaturesFoco;
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
    state.filters = {
      ...state.filters,
      ...filters,
    };
  },

  setUrlCurrentWmsFoco(state, url) {
    state.currentUrlWmsFoco = url;
  },

  setFeatures(state, features) {
    state.features = features;
    state.isLoadingFeatures = false;
  },

  setLoadingFoco(state, loadingFoco) {
    state.loadingFoco = loadingFoco;
  },

  clearFeatures(state) {
    state.features = null;
  },
};

export const actions = {
  async generateUrlWmsFoco({ state, commit }, newBbox = false) {
    const params = {
      layers: state.geoserverLayerFoco,
      env: `fill-opacity:${state.opacity / 100}`,
      CQL_FILTER: '',
      opacity: state.opacity,
    };

    let url = state.urlWmsFoco;

    // Apply intersects filter
    if (state.intersectsWmsFoco) {
      params.CQL_FILTER += state.intersectsWmsFoco;
    }

    // Apply TI filter
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

    // Apply CR filter
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
      params.CQL_FILTER += `(dt_foco_calor >= (${state.filters.startDate}) AND dt_foco_calor <= (${state.filters.endDate}))`;
    }

    const paramsUrl = new URLSearchParams(params);
    const fullUrl = `${url}${paramsUrl}`;
    console.log(fullUrl);
    

    commit('setUrlCurrentWmsFoco', fullUrl);
  },

  async getFeatures({ state, commit, dispatch }) {
    commit('setUrlCurrentWmsFoco', '');
    commit('setLoadingFoco', true);
    commit('clearFeatures');

    try {
      commit('setshowFeaturesFoco', true);
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

        commit('setIntersectsWmsFoco', `INTERSECTS(geom,${wkt})`);
      } else {
        commit('setIntersectsWmsFoco', '');
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
            (state.filters.cr && state.filters.cr.length) ||
            (state.filters.ti && state.filters.ti.length)
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
      } catch (_) {
        commit(
          'alert/addAlert',
          {
            message: this.$i18n.t('default-error', {
              action: this.$i18n.t('retrieve'),
              resource: this.$i18n.t('foco'),
            }),
          },
          { root: true },
        );
      }

      await dispatch('generateUrlWmsFoco');
      

    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('foco'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingFeatures', false);
      commit('setLoadingFoco', false);
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
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('regional coordinators'),
          }),
        },
        { root: true },
      );
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
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('indigenous territories'),
          }),
        },
        { root: true },
      );
    }
  },

  
};