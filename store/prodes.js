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
  tableProdes: [],
  isLoadingTable: false,
  loadingCSV: false

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
    if (!state.prodesStyles || typeof state.prodesStyles !== 'object') return [];
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
  setLoadingCSV(state, isLoading) {
    state.loadingCSV = isLoading;
  },

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

  setTableProdes(state, data) {
    state.tableProdes = data;
  },

  setLoadingTable(state, payload) {
    state.isLoadingTable = payload;
  },
};

export const actions = {
  async getDataTableProdes({ commit, state, rootState }) {

  commit('setLoadingTable', true);
  try {
    const params = {
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: state.geoserverLayerProdes,
      outputFormat: 'application/json',
      CQL_FILTER: '',
      maxFeatures: 10000,
    };

    const filters = [];

    if (state.filters.currentView && state.intersectsWmsProdes) {
      filters.push(state.intersectsWmsProdes);
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

    if (!response?.features) {
      commit('setTableProdes', []);
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
    commit('setTableProdes', tableData);
  } catch (error) {
    commit('setTableProdes', []);
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
        commit('setLoadingCSV', false);
      }
    },


   async downloadTableProdes() {
      try {
        // Usando a mutação do Vuex
        this.$store.commit('prodes/setLoadingCSV', true);

        if (!this.tableProdes?.length) {
          throw new Error('Nenhum dado disponível para exportação');
        }

        const headers = [
          'ID', 'Código Funai', 'Terra Indígena',
          'Coordenação Regional', 'Ano', 'Área (ha)',
          'Latitude', 'Longitude'
        ];

        const csvContent = [
          headers.join(';'),
          ...this.tableProdes.map(item => [
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
        link.download = `dados_prodes_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }, 100);

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
        this.$store.commit('prodes/setLoadingCSV', false);
      }
    },



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
