const { stringify } = require('wkt');

export const state = () => ({
  features: null,
  urlWmsDeter: '',
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
  tableDeter: [],
  isLoadingTable: false,
  intersectsWmsDeter: '',
});

export const getters = {
  featuresLoaded(state) {
    return (
      state.features
      && state.features.features
      && state.features.features.length > 0
    );
  },
  getShowFeaturesDeter: (state) => state.showFeaturesDeter,
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

  setTableDeter(state, data) {
    state.tableDeter = data;
  },

  setLoadingTable(state, payload) {
    state.isLoadingTable = payload;
  },
};

export const actions = {
  async getDataTableDeter({ commit, state, rootState }) {


  commit('setLoadingTable', true);
  try {
    const params = {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: state.geoserverLayerDeter,
      outputFormat: 'application/json',
      CQL_FILTER: '',
      maxFeatures: 10000,
    };

    const filters = [];

    if (state.filters.currentView && state.intersectsWmsDeter) {
      filters.push(state.intersectsWmsDeter);
    }
    if (state.filters.ti?.length) {
      filters.push(`co_funai IN (${state.filters.ti.map(ti => ti.co_funai).join(',')})`);
    }
    if (state.filters.cr?.length) {
      filters.push(`co_cr IN (${state.filters.cr.map(cr => cr.co_cr).join(',')})`);
    }
    if (state.filters.startYear && state.filters.endYear) {
      filters.push(`(nu_ano >= ${state.filters.startYear} AND nu_ano <= ${state.filters.endYear})`);
    }
    if (filters.length) params.CQL_FILTER = filters.join(' AND ');

    const url = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;

    const response = await this.$api.$get(url);
    console.log('Dados recebidos para tabela:', response);

    if (!response?.features) {
      commit('setTableDeter', []);
      throw new Error('Nenhum dado encontrado');
    }

    const tableData = response.features.map(({ properties }) => ({
      origin_id: properties.id || properties.origin_id || '',
      co_funai: properties.co_funai || '',
      co_cr: properties.co_cr || '',
      ds_cr: properties.ds_cr || '',
      no_ti: properties.no_ti || '',
      nu_ano: properties.nu_ano || '',
      nu_area_ha: parseFloat(properties.nu_area_ha) || 0,
      nu_area_km2: parseFloat(properties.nu_area_km2) || 0,
      no_classe: properties.no_classe || '',
      sg_uf: properties.sg_uf || '',
      dt_imagem: properties.dt_imagem || '',
      nu_orbita: properties.nu_orbita || '',
      nu_ponto: properties.nu_ponto || '',
    }));
    commit('setTableDeter', tableData);
  } catch (error) {
    console.error('Erro ao buscar dados da tabela:', error);
    commit('setTableDeter', []);
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

  async generateUrlWmsDeter({ state, commit, rootState }, newBbox = false) {
    const params = {
      layers: state.geoserverLayerDeter,
      env: `fill-opacity:${state.opacity / 100}`,
      CQL_FILTER: '',
      opacity: state.opacity,
    };

    let url = `${rootState.map.geoserverUrl}&`;

    url = url.replace('wms', 'ows');

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

  async fetchDeterFeatures({ state, commit, rootState }) {
    commit('setLoadingFeatures', true);
    let url = rootState.map.geoserverUrl;

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


   async downloadTableDeter() {
      try {
        // Usando a mutação do Vuex
        this.$store.commit('deter/setLoadingCSV', true);

        if (!this.tableDeter?.length) {
          throw new Error('Nenhum dado disponível para exportação');
        }

        const headers = [
          'ID', 'Código Funai', 'Terra Indígena',
          'Coordenação Regional', 'Ano', 'Área (ha)',
          'Latitude', 'Longitude'
        ];

        const csvContent = [
          headers.join(';'),
          ...this.tableDeter.map(item => [
            item.origin_id || '',
            item.co_funai || '',
            `"${(item.no_ti || '').replace(/"/g, '""')}"`,
            `"${(item.ds_cr || '').replace(/"/g, '""')}"`,
            item.nu_ano || '',
            this.formatFieldValue(item.nu_area_ha, 'nu_area_ha'),
            item.nu_latitude || '',
            item.nu_longitude || ''
          ].join(';'))
        ].join('\r\n');

        const blob = new Blob(["\uFEFF" + csvContent], {
          type: 'text/csv;charset=utf-8;'
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `dados_deter_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }, 100);

      } catch (error) {
        console.error('Erro na exportação:', error);
        this.$store.dispatch('snackbar/showSnackbar', {
          message: 'Falha ao gerar o arquivo CSV',
          color: 'error'
        }, { root: true });

      } finally {
        this.$store.commit('deter/setLoadingCSV', false);
      }
    },

  async downloadGeoJsonDeter({ commit, state, rootState }) {
    commit('setLoadingDeter', true);
    let url = rootState.map.geoserverUrl;

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
