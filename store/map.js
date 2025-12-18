export const state = () => ({
  activeMenu: '',
  openDrawPopup: null,
  bounds: null,
  boundsZoomed: false,
  fileList: [],
  loading: false,
  localBounds: [],
  hasAddLayer: false,
  myLocation: null,
  startDraw: null,
  loadPopup: false,
  startDrone: false,
  neighborhoods: false,
  shareLocation: {
    visible: false,
    lat: '',
    lng: '',
  },
  opacityMap: 1,
  buttonPopup: {},
  isDrawing: false,
  basemaps: [],
  currentBaseMap: {},
  tmsToPrint: {
    visible: false,
  },
  indigenousLand: [],
  savedSelectedItems: [],
  selectedItems: [],
  currentTiData: null,
  // geoserver config
  geoserverUrl: '',
  geoserverSearchTI: process.env.GEOSERVER_SEARCH_TI,
  carPrintData: {
    visible: false,
    mapTitle: '',
    leafSize: { type: 'A4' },
    carData: [],
    mapBounds: null,
    selectedBaseMapUrl: null,
  },
  showTemplateMapLandscapeCar: false,
});

export const getters = {
  bbox: (state) => (state.bounds ? state.bounds.toBBoxString() : null),

  bboxWkt(state) {
    if (!state.bounds) return null;

    const coords = [
      state.bounds.getSouthWest(),
      state.bounds.getNorthWest(),
      state.bounds.getNorthEast(),
      state.bounds.getSouthEast(),
    ];

    const wkt = coords.map((point) => `${point.lng} ${point.lat}`);

    return `POLYGON((${wkt.join(',')},${wkt[0]}))`;
  },

  bboxEs(state) {
    if (!state.bounds) return null;

    const northWest = state.bounds.getNorthWest();
    const southEast = state.bounds.getSouthEast();

    return [
      [northWest.lng, northWest.lat],
      [southEast.lng, southEast.lat],
    ];
  },
};

export const mutations = {
  clearSavedSelectedItems(state) {
    state.savedSelectedItems = [];
  },

  setShowTemplateMapLandscapeCar(state, show) {
    state.showTemplateMapLandscapeCar = show;
  },

  addItem(state, item) {
    if (!Array.isArray(state.savedSelectedItems)) {
      state.savedSelectedItems = [];
    }
    if (!state.savedSelectedItems.some((existingItem) => existingItem.id === item.id)) {
      state.savedSelectedItems.push(item);
    }
  },

  setSelectedItems(state, items) {
    state.selectedItems = items;
  },

  setCurrentTiData(state, tiData) {
    state.currentTiData = tiData;
  },

  setActiveMenu(state, payload) {
    state.activeMenu = payload !== state.activeMenu ? payload : '';
  },

  setActiveMenuMarker(state, payload) {
    state.activeMenu = payload !== state.activeMenu ? payload : '';
  },

  setBounds: (state, bounds) => (state.bounds = bounds),

  setLocalBounds: (state, localBounds) => (state.localBounds = localBounds),

  toggleBoundsZoomed: (state) => (state.boundsZoomed = !state.boundsZoomed),

  setMapLoading(state, loading) {
    state.loading = loading;
  },

  setLoadingFeatures(state, payload) {
    state.isLoadingFeatures = payload;
  },

  addFileToSpecificIndex(state, { file, fileIndex }) {
    state.fileList.splice(fileIndex, 0, file);
  },

  addFileToMap(state, file) {
    state.fileList.push(file);
  },

  removeFileFromMap(state, fileIndex) {
    state.fileList.splice(fileIndex, 1);
  },

  setHasLayer(state, hasLayer) {
    state.hasAddLayer = hasLayer;
  },

  setMyLocation(state, coordinates) {
    state.myLocation = coordinates;
  },

  setLoadPopup(state, value) {
    state.loadPopup = value;
  },

  setStartDraw(state, type) {
    if (state.startDraw == type) {
      state.startDraw = null;
    }
    state.startDraw = type;
  },
  setStartDrone(state, type) {
    if (state.startDrone == type) {
      state.startDrone = null;
    }
    state.startDrone = type;
  },

  setShareCoordinates(state, { visible, lat, lng }) {
    state.shareLocation.visible = visible;
    state.shareLocation.lat = lat;
    state.shareLocation.lng = lng;
  },

  setMapOpacity(state, opacity) {
    state.opacityMap = opacity.opacity / 100;
  },

  setStartDrawPopup(state) {
    state.startDrawPopup = !state.startDrawPopup;
  },

  setOpenDrawPopup(state, openDrawPopup) {
    state.openDrawPopup = openDrawPopup;
  },

  setButtonPopup(state, { type, layer }) {
    state.buttonPopup = { type, layer };
  },

  setIsDrawing(state, drawing) {
    state.isDrawing = drawing;
  },

  setNeighborhoods(state, payload) {
    state.neighborhoods = payload;
  },

  setBasemap(state, basemaps) {
    basemaps.forEach((basemap) => {
      basemap.options = {
        tag: basemap.tag,
        attribution: basemap.attribution,
        maxZoom: 21,
        maxNativeZoom: 19,
        zIndex: 1,
      };
    });
    state.basemaps = basemaps;
  },

  setTmsToPrint(state, {
    visible, tmsUrl, geoserverName, wmsUrl, bounds,
  }) {
    state.tmsToPrint.visible = visible;
    state.tmsToPrint.tmsUrl = tmsUrl;
    state.tmsToPrint.geoserverName = geoserverName;
    state.tmsToPrint.wmsUrl = wmsUrl;
    state.tmsToPrint.bounds = bounds;
  },

  setIndigenousLand(state, indigenousLand) {
    state.indigenousLand = indigenousLand;
  },

  setGeoserverConfig(state, { url }) {
    state.geoserverUrl = url;
  },

  setCurrentBaseMap(state, { url, options }) {
    state.currentBaseMap = { url, options };
  },

  setCarPrintData(state, carPrintData) {
    state.carPrintData = {
      visible: carPrintData.visible !== undefined ? carPrintData.visible : false,
      mapTitle: carPrintData.mapTitle || 'Relatório CAR',
      leafSize: carPrintData.leafSize || { type: 'A4' },
      carData: carPrintData.carData || [],
      mapBounds: carPrintData.mapBounds || null,
      selectedBaseMapUrl: carPrintData.selectedBaseMapUrl || null,
    };
  },

  clearCarPrintData(state) {
    state.carPrintData = {
      visible: false,
      mapTitle: '',
      leafSize: { type: 'A4' },
      carData: [],
      mapBounds: null,
      selectedBaseMapUrl: null,
    };
  },
};

export const actions = {
  addSelectedItem(context, item) {
    context.commit('addItem', item);
  },

  async fetchSearchResults({ commit, state, rootState }, searchQuery) {
    commit('setLoadingFeatures', true);
    try {
      const { geoserverUrl } = state;

      if (!geoserverUrl) {
        throw new Error('URL do GeoServer não configurada');
      }

      const params = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: state.geoserverSearchTI,
        outputFormat: 'application/json',
        CQL_FILTER: '',
      };

      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.trim();

        let isEstudoFilter = '';
        if (searchTerm.toLowerCase() === 'sim') {
          isEstudoFilter = 'is_estudo = true';
        } else if (searchTerm.toLowerCase() === 'não' || searchTerm.toLowerCase() === 'nao') {
          isEstudoFilter = 'is_estudo = false';
        }

        const filters = [
          `no_ti ILIKE '%${searchTerm}%'`,
          `ds_cr ILIKE '%${searchTerm}%'`,
          `no_municipio ILIKE '%${searchTerm}%'`,
        ];

        if (isEstudoFilter) {
          filters.push(isEstudoFilter);
        }

        params.CQL_FILTER = `(${filters.join(' OR ')})`;
      }

      const url = `${rootState.map.geoserverUrl}&${new URLSearchParams(params)}`;
      const response = await this.$api.$get(url);

      if (response && response.features) {
        const transformedData = response.features.map((feature, index) => ({
          id: feature.id || `feature-${index}`,
          layername: feature.properties.layername,
          namespace: feature.properties.namespace,
          ...feature.properties,
          geometry: feature.geometry,
        }));

        const sortedData = transformedData.sort((a, b) => a.no_ti.localeCompare(b.no_ti));

        commit('setSelectedItems', sortedData);
        return sortedData;
      }

      commit('setSelectedItems', []);
      return [];
    } catch (error) {
      console.error('Erro ao buscar terras indígenas:', error);

      commit('alert/addAlert', {
        message: this.$i18n.t('default-error', {
          action: this.$i18n.t('search'),
          resource: this.$i18n.t('indigenous-lands'),
        }),
        type: 'error',
      }, { root: true });

      commit('setSelectedItems', []);
      throw error;
    } finally {
      commit('setLoadingFeatures', false);
    }
  },

  zoomToBounds({ commit }, bounds) {
    commit('setBounds', bounds);
    commit('toggleBoundsZoomed');
  },

  changeStyle({ commit, state }, { fileIndex, color, opacity }) {
    const file = {
      ...state.fileList[fileIndex],
      color,
      opacity,
    };

    commit('removeFileFromMap', fileIndex);
    commit('addFileToSpecificIndex', { file, fileIndex });
  },

  async getBasemaps({ commit }) {
    commit('setMapLoading', true);
    try {
      const response = await this.$api.$get('layer/basemap/');
      commit('setBasemap', response);
    } catch (exception) {
      console.error(exception);
    } finally {
      commit('setMapLoading', false);
    }
  },

  async saveToDatabase({ state, commit }, { index }) {
    try {
      const {
        feature, name, color, opacity,
      } = state.fileList[index];

      const response = await this.$api.post('user/upload-file/', {
        name,
        geometry: feature,
        properties: {
          color,
          opacity,
        },
        visible: true,
      });

      if (response) {
        commit(
          'alert/addAlert',
          {
            message: this.$i18n.t('upload-success', {
              date: response.data.created_at,
              name: response.data.name,
              new_data: response.data.created,
              updated_data: response.data.updated,
            }),
          },
          { root: true },
        );
        commit('setHasLayer', true);
      }
    } catch (exception) {
      if (exception.response.status === 413) {
        commit(
          'alert/addAlert',
          {
            message: this.$i18n.t('file-too-large'),
          },
          { root: true },
        );
        return;
      }

      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('upload'),
            resource: this.$i18n.t('file'),
          }),
        },
        { root: true },
      );
    }
  },

  async saveDrawToDatabase({ commit }, { geometry, name }) {
    try {
      const response = await this.$api.post('user/upload-file/', {
        name,
        geometry,
      });

      if (response) {
        commit(
          'alert/addAlert',
          {
            message: this.$i18n.t('upload-success', {
              date: response.data.created_at,
              name: response.data.name,
              new_data: response.data.created,
              updated_data: response.data.updated,
            }),
          },
          { root: true },
        );
        commit('setHasLayer', true);
      }
    } catch (exception) {
      if (exception.response.status === 413) {
        commit(
          'alert/addAlert',
          {
            message: this.$i18n.t('file-too-large'),
          },
          { root: true },
        );
        return;
      }

      commit(
        'alert/addAlert',
        {
          message: this.$i18n.t('default-error', {
            action: this.$i18n.t('upload'),
            resource: this.$i18n.t('drawing'),
          }),
        },
        { root: true },
      );
    }
  },

  async getGeoserverConfig({ commit, rootState }) {
    try {
      const idGeoserver = rootState.userProfile.user
        ? process.env.GEOSERVER_PRIVATE
        : process.env.GEOSERVER_PUBLICO;
      const response = await this.$api.$get(`layer/geoserver/${idGeoserver}/`);
      commit('setGeoserverConfig', {
        url: `${response.wms_url.replace('wms', 'ows')}&`,
      });
    } catch (error) {
      console.error('Error fetching Geoserver configuration:', error);
    }
  },

  async handleCarPrint({ commit, state }, {
    map,
    mapTitle,
    leafSize,
    selectedBaseMap,
  }) {
    try {
      let carData = [];
      let hasCarData = false;

      if (map?.getBounds) {
        const bounds = map.getBounds();
        const bboxArray = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ];

        try {
          const geoserverBaseUrl = state.geoserverUrl;
          const layerName = 'CMR-FUNAI:lim_imovel_car_a';
          const cqlFilter = `INTERSECTS(geom, POLYGON((${bboxArray[0]} ${bboxArray[1]}, ${bboxArray[2]} ${bboxArray[1]}, ${bboxArray[2]} ${bboxArray[3]}, ${bboxArray[0]} ${bboxArray[3]}, ${bboxArray[0]} ${bboxArray[1]})))`;

          const params = {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: layerName,
            outputFormat: 'application/json',
            srsName: 'EPSG:4326',
            maxFeatures: 1000,
            CQL_FILTER: cqlFilter,
          };

          const url = `${geoserverBaseUrl}&${new URLSearchParams(params)}`;

          const response = await this.$api.$get(url);

          carData = (response.features || []).map((feature) => {
            const cleanFeature = {
              type: feature.type,
              geometry: feature.geometry,
              properties: { ...feature.properties },
              id: feature.id,
            };
            if (cleanFeature.properties) {
              Object.keys(cleanFeature.properties).forEach((key) => {
                if (cleanFeature.properties[key] && typeof cleanFeature.properties[key] === 'object') {
                  delete cleanFeature.properties[key];
                }
              });
            }

            return cleanFeature;
          });

          hasCarData = carData.length > 0;

          commit('setCarPrintData', {
            mapTitle: mapTitle || 'Relatório CAR',
            leafSize,
            mapBounds: {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            },
            selectedBaseMapUrl: selectedBaseMap?.url,
            visible: true,
            carData,
          });

          if (hasCarData) {
            commit('setShowTemplateMapLandscapeCar', true);
          }

          return { success: true, hasCarData };
        } catch (wfsError) {
          console.error('❌ Erro na consulta CAR:', wfsError);
          commit('setCarPrintData', {
            mapTitle: mapTitle || 'Relatório CAR',
            leafSize,
            mapBounds: {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            },
            selectedBaseMapUrl: selectedBaseMap?.url,
            visible: true,
            carData: [],
          });
          return { success: true, hasCarData: false };
        }
      } else {
        commit('setCarPrintData', {
          mapTitle: mapTitle || 'Relatório CAR',
          leafSize,
          visible: true,
          carData: [],
        });
        return { success: true, hasCarData: false };
      }
    } catch (error) {
      console.error('❌ Erro no processo CAR:', error);
      commit('setCarPrintData', {
        mapTitle: mapTitle || 'Relatório CAR',
        leafSize,
        visible: true,
        carData: [],
      });
      return { success: false, hasCarData: false, error };
    }
  },
};
