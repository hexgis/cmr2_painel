const { stringify } = require('wkt');

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
  featuresLoaded: (state) => (layer) => (
    state.layers[layer].features
      && state.layers[layer].features.features
      && state.layers[layer].features.features.length > 0
  ),
  getShowFeatures: (state) => (layer) => state.layers[layer].showFeatures,
};

export const mutations = {
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
  async generateUrlWms({ state, commit, rootState }, layer) {
    if (!state.layers[layer].geoserverLayer) return;

    const params = {
      layers: state.layers[layer].geoserverLayer,
      env: `fill-opacity:${state.layers[layer].opacity / 100}`,
      CQL_FILTER: '',
      opacity: state.layers[layer].opacity,
    };

    let url = rootState.map.geoserverUrl;

    if (!url) return;

    // change wms for ows
    url = url.replace('wms', 'ows');

    // Apply intersects filter
    if (state.layers[layer].intersectsWms) {
      params.CQL_FILTER += state.layers[layer].intersectsWms;
    }

    // Apply TI filter
    const arrayTI = [];
    if (state.layers[layer].filters.ti && state.layers[layer].filters.ti.length) {
      Object.values(state.layers[layer].filters.ti).forEach((item) => {
        arrayTI.push(item.co_funai);
      });
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `co_funai IN (${arrayTI.toString()})`;
    }

    // Apply CR filter
    const arrayCR = [];
    if (state.layers[layer].filters.cr && state.layers[layer].filters.cr.length) {
      Object.values(state.layers[layer].filters.cr).forEach((item) => {
        arrayCR.push(item.co_cr);
      });
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `co_cr IN (${arrayCR.toString()})`;
    }

    if (state.layers[layer].filters.startDate && state.layers[layer].filters.endDate) {
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `(dt_foco_calor >= (${state.layers[layer].filters.startDate}) AND dt_foco_calor <= (${state.layers[layer].filters.endDate}))`;
    }

    const paramsUrl = new URLSearchParams(params);
    const fullUrl = `${url}${paramsUrl}`;

    commit('setUrlCurrentWms', { layer, url: fullUrl });
  },

  async getFeatures({ state, commit, dispatch }, layer) {
    commit('setUrlCurrentWms', { layer, url: '' });
    commit('setLoading', { layer, loading: true });
    commit('clearFeatures', layer);

    try {
      commit('setShowFeatures', { layer, showFeatures: true });
      commit('setLoadingFeatures', true);

      const map = window.mapMain;
      if (state.layers[layer].filters.currentView) {
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
        commit('setIntersectsWms', { layer, intersectsWms: '' });
      }

      const arrayTI = [];
      if (state.layers[layer].filters.ti && state.layers[layer].filters.ti.length) {
        Object.values(state.layers[layer].filters.ti).forEach((item) => {
          arrayTI.push(item.co_funai);
        });
      }

      const arrayCR = [];
      if (state.layers[layer].filters.cr && state.layers[layer].filters.cr.length) {
        Object.values(state.layers[layer].filters.cr).forEach((item) => {
          arrayCR.push(item.co_cr);
        });
      }

      try {
        if (!state.layers[layer].filters.currentView) {
          let bbox;
          if (
            (state.layers[layer].filters.cr && state.layers[layer].filters.cr.length)
            || (state.layers[layer].filters.ti && state.layers[layer].filters.ti.length)
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

      await dispatch('generateUrlWms', layer);
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
