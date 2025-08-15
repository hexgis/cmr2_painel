const { stringify } = require('wkt');

export const state = () => ({
  features: null,
  urlWmsProdes: '',
  geoserverLayerProdes: process.env.GEOSERVER_PRODES,
  currentUrlWmsProdes: '',
  showFeaturesProdes: false,
  ProdesWmsOptions: {
    name: 'prodes',
    maxZoom: 21,
    maxNativeZoom: 19,
    queryable: true,
  },
  loadingProdes: false,
  isLoadingFeatures: false,
  filterOptions: {
    regionalFilters: [],
    tiFilters: [],
  },
  filters: {
    startYear: 2025,
    endYear: 2025,
    currentView: false,
  },
  opacity: 100,
  intersectsWmsProdes: '',
  prodesStyles: {},
});

export const getters = {
  featuresLoaded(state) {
    return (
      state.features &&
      state.features.features &&
      state.features.features.length > 0
    );
  },
  getShowFeaturesProdes: (state) => {
    return state.showFeaturesProdes;
  },
  getLegendItems: (state) => {
    if (!state.features || !state.prodesStyles) return [];

    // Obter anos únicos dos features que existem no prodesStyles
    const years = Array.from(
      new Set(
        state.features.features
          .map(f => f.properties.nu_ano)
          .filter(year => state.prodesStyles.hasOwnProperty(year))
      )
    ).sort((a, b) => b - a); // Ordena do maior para o menor

    return years.map(year => ({
      label: String(year),
      color: state.prodesStyles[year],
    }));
  },
};

export const mutations = {
  setIntersectsWmsProdes(state, intersectsWmsProdes) {
    state.intersectsWmsProdes = intersectsWmsProdes;
  },

  setshowFeaturesProdes(state, showFeaturesProdes) {
    state.showFeaturesProdes = showFeaturesProdes;
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

  setUrlCurrentWmsProdes(state, url) {
    state.currentUrlWmsProdes = url;
  },

  setFeatures(state, features) {
    state.features = features;
    state.isLoadingFeatures = false;
  },

  setLoadingProdes(state, loadingProdes) {
    state.loadingProdes = loadingProdes;
  },

  clearFeatures(state) {
    state.features = null;
  },

  setProdesStyles(state, styles) {
    state.prodesStyles = styles;
  },
};

export const actions = {
  async getProdesStyleFromGeoserver({ commit, state, rootState }) {
    try {
      const params = {
        service: 'WMS',
        version: '1.1.0',
        request: 'GetLegendGraphic',
        layer: state.geoserverLayerProdes,
        format: 'application/json',
      };
      const url = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;
      const response = await this.$api.$get(url);
      const styles = {};
      if (response.Legend && response.Legend[0] && response.Legend[0].rules) {
        response.Legend[0].rules.forEach((rule) => {
          if (rule.filter && rule.name) {
            const yearMatch = rule.filter.match(/nu_ano\s*=\s*['"]?(\d{4})['"]?/);
            const fillColor = rule.symbolizers[0]?.Polygon?.fill || null;
            if (yearMatch && yearMatch[1] && fillColor) {
              styles[yearMatch[1]] = fillColor;
            }
          }
        });
      }
      commit('setProdesStyles', styles);
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

  async generateUrlWmsProdes({ state, commit, rootState }, newBbox = false) {
    const params = {
      layers: state.geoserverLayerProdes,
      env: `fill-opacity:${state.opacity / 100}`,
      CQL_FILTER: '',
      opacity: state.opacity,
    };

    let url = rootState.map.geoserverUrl;

    // Apply intersects filter
    if (state.intersectsWmsProdes) {
      params.CQL_FILTER += state.intersectsWmsProdes;
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
    if (state.filters.startYear && state.filters.endYear) {
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `(nu_ano >= ${state.filters.startYear} AND nu_ano <= ${state.filters.endYear})`;
    }

    const paramsUrl = new URLSearchParams(params);
    const fullUrl = `${url}${paramsUrl}`;

    commit('setUrlCurrentWmsProdes', fullUrl);
  },

  async fetchProdesFeatures({ state, commit, dispatch, rootState }) {
    commit('setLoadingFeatures', true);
    commit('clearFeatures');
    try {
      // 1. Primeiro obtemos os estilos do GeoServer
      await dispatch('getProdesStyleFromGeoserver');

      // 2. Configuração dos parâmetros WFS
      const params = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: state.geoserverLayerProdes,
        outputFormat: 'application/json',
        CQL_FILTER: '',
        maxFeatures: 10000,
      };

      // 3. Aplica filtros
      let cqlFilters = [];

      // Filtro de interseção (view atual)
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

      // Filtro de TIs
      if (state.filters.ti?.length) {
        const tiList = state.filters.ti.map(ti => ti.co_funai).join(',');
        cqlFilters.push(`co_funai IN (${tiList})`);
      }

      // Filtro de CRs
      if (state.filters.cr?.length) {
        const crList = state.filters.cr.map(cr => cr.co_cr).join(',');
        cqlFilters.push(`co_cr IN (${crList})`);
      }

      // Filtro de anos
      if (state.filters.startYear && state.filters.endYear) {
        cqlFilters.push(`(nu_ano >= ${state.filters.startYear} AND nu_ano <= ${state.filters.endYear})`);
      }

      // Combina todos os filtros
      if (cqlFilters.length) {
        params.CQL_FILTER = cqlFilters.join(' AND ');
      }

      // 4. Ajuste de viewport se não for a view atual
      if (!state.filters.currentView) {
        try {
          const bboxResponse = await this.$api.$post('monitoring/consolidated/bbox/', {
            co_cr: state.filters.cr?.map(cr => cr.co_cr) || [],
            co_funai: state.filters.ti?.map(ti => ti.co_funai) || [],
          });

          if (bboxResponse) {
            const map = window.mapMain;
            const bounds = L.latLngBounds(
              [bboxResponse[1], bboxResponse[0]],
              [bboxResponse[3], bboxResponse[2]]
            );
            map.fitBounds(bounds, { maxZoom: 12 });
          }
        } catch (bboxError) {
          console.error('Erro ao ajustar viewport:', bboxError);
        }
      }

      // 5. Faz a requisição WFS
      const url = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;
      const response = await this.$api.$get(url);

      // 6. Processa a resposta
      if (response?.features) {
        const geojson = {
          type: response.type,
          features: response.features,
        };

        commit('setFeatures', geojson);

        // 7. Gera URL WMS para visualização
        const wmsParams = {
          layers: state.geoserverLayerProdes,
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          env: `fill-opacity:${state.opacity / 100}`,
          CQL_FILTER: params.CQL_FILTER,
        };

        const wmsUrl = `${rootState.map.geoserverUrl}&${new URLSearchParams(wmsParams)}`;
        commit('setUrlCurrentWmsProdes', wmsUrl);
      } else {
        throw new Error('Resposta do GeoServer sem features');
      }

    } catch (error) {
      console.error('Erro ao buscar features do PRODES:', error);
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('prodes'),
          }),
          type: 'error',
        },
        { root: true }
      );
      commit('setshowFeaturesProdes', false);
    } finally {
      commit('setLoadingFeatures', false);
    }
  },

  async getFeatures({ state, commit, dispatch }) {
    commit('setUrlCurrentWmsProdes', '');
    commit('setLoadingProdes', true);
    commit('clearFeatures');

    try {
      commit('setshowFeaturesProdes', true);
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

        commit('setIntersectsWmsProdes', `INTERSECTS(geom,${wkt})`);
      } else {
        commit('setIntersectsWmsProdes', '');
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
              resource: this.$i18n.t('prodes'),
            }),
          },
          { root: true },
        );
      }

      await dispatch('generateUrlWmsProdes');
      await dispatch('fetchProdesFeatures');

    } catch (exception) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('retrieve'),
            resource: this.$i18n.t('prodes'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingFeatures', false);
      commit('setLoadingProdes', false);
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

  async downloadGeoJsonProdes({ commit, state, rootState }) {
    commit('setLoadingProdes', true);
    let url = rootState.map.geoserverUrl;

    const params = {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: state.geoserverLayerProdes,
      outputFormat: 'application/json',
      CQL_FILTER: '',
      maxFeatures: 10000,
    };

    // Apply intersects filter
    if (state.intersectsWmsProdes) {
      params.CQL_FILTER += state.intersectsWmsProdes;
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
    if (state.filters.startYear && state.filters.endYear) {
      if (params.CQL_FILTER.length) {
        params.CQL_FILTER += ' AND ';
      }
      params.CQL_FILTER += `(nu_ano >= ${state.filters.startYear} AND nu_ano <= ${state.filters.endYear})`;
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
      link.download = 'prodes_dados.geojson';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('download'),
            resource: this.$i18n.t('prodes'),
          }),
        },
        { root: true },
      );
    } finally {
      commit('setLoadingProdes', false);
    }
  },
};
