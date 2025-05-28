const { stringify } = require('wkt');

export const state = () => ({
  features: null,
  urlWmsLandUse: 'https://cmrhomolog.funai.gov.br/geoserver/ows?',
  geoserverLayerLandUse: 'CMR-PUBLICO:img_analise_consolidado_oneatlas_dissolvido_por_estagio_a',
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
});

export const getters = {
  featuresLoaded(state) {

    return (
      state.features &&
      state.features.features &&
      state.features.features.length > 0
    );
  },

  getShowFeaturesLandUse: (state) => {
    return state.showFeaturesLandUse;
  },

  getLegendItems: (state) => {
    if (!state.features || !state.landUseStyles) return [];


    const estagios = {};

    state.features.features.forEach(feature => {
      const estagio = feature.properties.no_estagio;
      if (estagio) {
        if (!estagios[estagio]) {
          estagios[estagio] = {
            label: estagio,
            color: state.landUseStyles[estagio] || this.getRandomColor(estagio),
            count: 0
          };
        }
        estagios[estagio].count++;
      }
    });
    return Object.values(estagios).sort((a, b) => a.label.localeCompare(b.label));
  },
};

export const mutations = {
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
    state.filters = {
      ...state.filters,
      ...filters,
    };
  },

  setUrlCurrentWmsLandUse(state, url) {
    state.currentUrlWmsLandUse = url;
  },

  setFeatures(state, features) {
    state.features = features;
    state.isLoadingFeatures = false;
  },

  setLoadingLandUse(state, loadingLandUse) {
    state.loadingLandUse = loadingLandUse;
  },

  clearFeatures(state) {
    state.features = null;
  },

  setLandUseStyles(state, styles) {
    state.landUseStyles = styles;
  },
};

export const actions = {
  async getLandUseStyleFromGeoserver({ commit, state }) {
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
            const fillColor = rule.symbolizers[0]?.Polygon?.fill || null;
            if (estagioMatch && estagioMatch[1] && fillColor) {
              styles[estagioMatch[1]] = fillColor;
            }
          }
        });
      }
      commit('setLandUseStyles', styles);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('legend'),
          }),
          type: 'error',
        },
        { root: true }
      );
    }
  },

  async generateUrlWmsLandUse({ state, commit }, newBbox = false) {
    const params = {
      layers: state.geoserverLayerLandUse,
      env: `fill-opacity:${state.opacity / 100}`,
      CQL_FILTER: '',
      opacity: state.opacity,
    };

    let url = state.urlWmsLandUse;

    // Apply intersects filter
    if (state.intersectsWmsLandUse) {
      params.CQL_FILTER += state.intersectsWmsLandUse;
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

    // Apply year filter
    if (state.filters.year) {
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `(nu_ano >= ${state.filters.year})`;
    }

    const paramsUrl = new URLSearchParams(params);
    const fullUrl = `${url}${paramsUrl}`;

    commit('setUrlCurrentWmsLandUse', fullUrl);
  },

  async fetchLandUseFeatures({ state, commit, dispatch }) {
    commit('setLoadingFeatures', true);
    commit('clearFeatures');
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

      let cqlFilters = [];

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

      if (state.filters.year) {
        cqlFilters.push(`(nu_ano = ${state.filters.year})`);
      }

      if (cqlFilters.length) {
        params.CQL_FILTER = cqlFilters.join(' AND ');
      }

      const url = `${state.urlWmsLandUse}${new URLSearchParams(params)}`;
      const response = await this.$api.$get(url);

      if (response?.features) {
        const geojson = {
          type: response.type,
          features: response.features,
        };

        commit('setFeatures', geojson);

        const wmsParams = {
          layers: state.geoserverLayerLandUse,
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          env: `fill-opacity:${state.opacity / 100}`,
          CQL_FILTER: params.CQL_FILTER,
        };

        const wmsUrl = `${state.urlWmsLandUse}${new URLSearchParams(wmsParams)}`;
        commit('setUrlCurrentWmsLandUse', wmsUrl);
      } else {
        throw new Error('Resposta do GeoServer sem features');
      }

    } catch (error) {
      console.error('Erro ao buscar features do LANDUSE:', error);
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('landUse'),
          }),
          type: 'error',
        },
        { root: true }
      );
      commit('setshowFeaturesLandUse', false);
    } finally {
      commit('setLoadingFeatures', false);
    }
  },

  async getFeatures({ state, commit, dispatch }) {
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
              resource: this.$i18n.t('landUse'),
            }),
          },
          { root: true },
        );
      }

      await dispatch('generateUrlWmsLandUse');
      await dispatch('fetchLandUseFeatures');

    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('landUse'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingFeatures', false);
      commit('setLoadingLandUse', false);
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

  async downloadGeoJsonLandUse({ commit, state }) {
    commit('setLoadingLandUse', true);
    let url = state.urlWmsLandUse;

    const params = {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: state.geoserverLayerLandUse,
      outputFormat: 'application/json',
      CQL_FILTER: '',
      maxFeatures: 10000,
    };

    // Apply intersects filter
    if (state.intersectsWmsLandUse) {
      params.CQL_FILTER += state.intersectsWmsLandUse;
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

    // Apply year filter
    if (state.filters.year) {
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `(nu_ano = ${state.filters.year})`;
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
      link.download = 'landUse_dados.geojson';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('download'),
            resource: this.$i18n.t('landUse'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingLandUse', false);
    }
  },
};
