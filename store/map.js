export const state = () => ({
  // state map
  activeMenu: '',
  openDrawPopup: null,
  startDrawPopup: false,
  bounds: null,
  boundsZoomed: false,
  fileList: [],
  loading: false,
  localBounds: [],
  hasAddLayer: false,
  myLocation: null,
  startDraw: null,
  loadPopup: false,
  startDrawPopup: false,
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
  tmsToPrint: {
    visible: false,
  },
  hasAddLayer: false,
  indigenousLand: [],
  savedSelectedItems: [],
  selectedItems: [],
  // geoserver config
  geoserverUrl: '',
});

export const getters = {
  bbox: (state) => state.bounds.toBBoxString(),

  bboxWkt(state) {
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

  addFileToSpecificIndex(state, { file, fileIndex }) {
    state.fileList.splice(fileIndex, 0, file);
  },

  addFileToMap(state, file) {
    state.fileList.push(file);
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

  removeFileFromMap(state, fileIndex) {
    state.fileList.splice(fileIndex, 1);
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

  setHasLayer(state, hasLayer) {
    state.hasAddLayer = hasLayer;
  },

  setIndigenousLand(state, indigenousLand) {
    state.indigenousLand = indigenousLand;
  },

  setGeoserverConfig(state, { url }) {
    state.geoserverUrl = url;
  },
};

export const actions = {
  addSelectedItem(context, item) {
    context.commit('addItem', item);
  },

  async fetchSearchResults({ commit }, searchQuery) {
    try {
      const response = await this.$api.$get(`/funai/all-data-ti-by-name/?param=${searchQuery}`);
      commit('setIndigenousLand', response);
      return response;
    } catch (error) {
      throw error;
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
};
