const { stringify } = require('wkt');

export const state = () => ({
  features: null,
  urlWmsDeter: process.env.GEOSERVER_URL,
  geoserverLayerDeter: process.env.GEOSERVER_DETER,
  currentUrlWmsDeter: '',
  showFeaturesDeter: false,
  DeterWmsOptions: {
    name: 'deter',
    maxZoom: 21,
    maxNativeZoom: 19,
    queryable: true,
  },
  loadingDeter: false,
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
  intersectsWmsDeter: '',
});

export const getters = {
  featuresLoaded(state) {
    return (
      state.features &&
      state.features.features &&
      state.features.features.length > 0
    );
  },
  getShowFeaturesDeter: (state) => {
    return state.showFeaturesDeter;
  },
};

export const mutations = {
  setIntersectsWmsDeter(state, intersectsWmsDeter) {
    state.intersectsWmsDeter = intersectsWmsDeter;
  },

  setshowFeaturesDeter(state, showFeaturesDeter) {
    state.showFeaturesDeter = showFeaturesDeter;
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

  setUrlCurrentWmsDeter(state, url) {
    state.currentUrlWmsDeter = url;
  },

  setFeatures(state, features) {
    state.features = features;
    state.isLoadingFeatures = false;
  },

  setLoadingDeter(state, loadingDeter) {
    state.loadingDeter = loadingDeter;
  },

  clearFeatures(state) {
    state.features = null;
  },
};

export const actions = {
  async generateUrlWmsDeter({ state, commit }, newBbox = false) {
    const params = {
      layers: state.geoserverLayerDeter,
      env: `fill-opacity:${state.opacity / 100}`,
      CQL_FILTER: '',
      opacity: state.opacity,
    };

    let url = state.urlWmsDeter;

    // Apply intersects filter
    if (state.intersectsWmsDeter) {
      params.CQL_FILTER += state.intersectsWmsDeter;
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
      params.CQL_FILTER += `(view_date >= (${state.filters.startDate}) AND view_date <= (${state.filters.endDate}))`;
    }

    const paramsUrl = new URLSearchParams(params);
    const fullUrl = `${url}${paramsUrl}`;



    commit('setUrlCurrentWmsDeter', fullUrl);
  },

  async fetchDeterFeatures({ state, commit }) {
    commit('setLoadingFeatures', true);
    let url = state.urlWmsDeter;

    const params = {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: state.geoserverLayerDeter,
      outputFormat: 'application/json',
      CQL_FILTER: '',
      maxFeatures: 10000,
    };

    // Apply intersects filter
    if (state.intersectsWmsDeter) {
      params.CQL_FILTER += state.intersectsWmsDeter;
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
      params.CQL_FILTER += `(view_date >= ${state.filters.startDate} AND view_date <= ${state.filters.endDate})`;
    }

    try {
      const paramsUrl = new URLSearchParams(params);
      url = `${url}${paramsUrl}`;
      const response = await this.$api.$get(url);

      const geojson = {
        type: response.type,
        features: response.features,
      };

      commit('setFeatures', geojson);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('deter'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingFeatures', false);
    }
  },

  async getFeatures({ state, commit, dispatch }) {
    commit('setUrlCurrentWmsDeter', '');
    commit('setLoadingDeter', true);
    commit('clearFeatures');

    try {
      commit('setshowFeaturesDeter', true);
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

        commit('setIntersectsWmsDeter', `INTERSECTS(geom,${wkt})`);
      } else {
        commit('setIntersectsWmsDeter', '');
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
              resource: this.$i18n.t('deter'),
            }),
          },
          { root: true },
        );
      }

      await dispatch('generateUrlWmsDeter');
      await dispatch('fetchDeterFeatures'); // Fetch GeoJSON features

    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('deter'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingFeatures', false);
      commit('setLoadingDeter', false);
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

  async downloadGeoJsonDeter({ commit, state }) {
    commit('setLoadingDeter', true);
    let url = state.urlWmsDeter;

    const params = {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: state.geoserverLayerDeter,
      outputFormat: 'application/json',
      CQL_FILTER: '',
      maxFeatures: 10000,
    };

    // Apply intersects filter
    if (state.intersectsWmsDeter) {
      params.CQL_FILTER += state.intersectsWmsDeter;
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
      params.CQL_FILTER += `(view_date >= ${state.filters.startDate} AND view_date <= ${state.filters.endDate})`;
    }

    try {
      const paramsUrl = new URLSearchParams(params);
      url = `${url}${paramsUrl}`;
      const response = await this.$api.$get(url);

      const geojson = {
        type: response.type,
        features: response.features,
      };

      const blob = new Blob([JSON.stringify(geojson)], { type: 'application/geo+json' });
      const urlBlob = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = 'deter_dados.geojson';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('download'),
            resource: this.$i18n.t('deter'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingDeter', false);
    }
  },
};
