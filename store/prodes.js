const { stringify } = require('wkt');

export const state = () => ({
  features: null,
  urlWmsMonitoring: 'https://cmrhomolog.funai.gov.br/geoserver/ows?',
  geoserverLayerMonitoring: 'CMR-PUBLICO:vw_prodes_com_terra_indigena_a',
  intersectsWmsMonitoring: '',
  MonitoringWmsOptions: {
    name: 'monitoring',
    maxZoom: 21,
    maxNativeZoom: 19,
    queryable: true,
  },
  currentUrlWmsMonitoring: '',
  wmsMonitoringOpacity: 100,
  showFeaturesMonitoring: false,
  loadingMonitoring: false,
  isLoadingGeoJson: false,
  isLoadingFeatures: false,
  filterOptions: {
    regionalFilters: [],
    tiFilters: [],
  },
  filters: {
    startYear: 2025,
    endYear: 2025,
   
  },
  opacity: 100,
  
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
};

export const actions = {
  async updateFeatures({ state, commit }) {
    let updatedFeatures = { features: state.stageItemActive, ...state.features }
    commit('setFeatures', updatedFeatures);
    commit('setshowFeaturesMonitoring', true);
  },

  async generateUrlWmsMonitoring({ state, commit }, newBbox = false) {
    const params = {
      layers: state.geoserverLayerMonitoring,
      env: `fill-opacity:${state.opacity / 100}`,
      CQL_FILTER: '',
      opacity: state.opacity,
    };

    let url = state.urlWmsMonitoring;


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

    if (state.filters.startYear && state.filters.endYear) {
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `(nu_ano >= (${state.filters.startYear}) AND nu_ano <= (${state.filters.endYear}))`;
    }

    const paramsUrl = new URLSearchParams(params);
    const fullUrl = `${url}${paramsUrl}`;

    commit('setUrlCurrentWmsMonitoring', `${url}${paramsUrl}`);

  },

  async getFeatures({ state, commit, dispatch }) {
    commit('setUrlCurrentWmsMonitoring', '');

    try {
      commit('setLoadingMonitoring', true);
      commit('setshowFeaturesMonitoring', true);
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
      commit('setLoadingMonitoring', false);
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
};


