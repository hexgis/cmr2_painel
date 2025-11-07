/**
 * Layer utilities for map components
 * This file contains helper functions for validation, creation and configuration of map layers
 */

/**
 * Layer types supported by the system
 */

export const LAYER_TYPES = {
  WMS: 'wms',
  TMS: 'tms',
  HEATMAP: 'heatmap',
};

/**
 * Returns the user-friendly layer type name for display
 * @param {Object} layer - Layer object
 * @returns {string} Formatted layer type name
 */
export const getLayerTypeName = (layer) => {
  if (!layer) return 'Desconhecido';

  switch (layer.layer_type) {
    case LAYER_TYPES.WMS:
      return 'WMS (Web Map Service)';
    case LAYER_TYPES.TMS:
      return 'TMS (Tile Map Service)';
    case LAYER_TYPES.HEATMAP:
      return 'Mapa de Calor';
    default:
      return layer.layer_type ? layer.layer_type.toUpperCase() : 'Desconhecido';
  }
};

/**
 * Checks if the layer is high resolution or mosaic type
 * These layers should generally be placed at the bottom (low z-index)
 * @param {Object} layer - Layer object
 * @returns {boolean} True if it's high resolution or mosaic
 */
export const isHighResOrMosaic = (layer) => {
  if (!layer || !layer.name) return false;

  const name = layer.name.toLowerCase();
  return name.includes('alta resolução')
         || name.includes('mosaicos')
         || name.includes('alta resolu')
         || name.includes('mosaic');
};

/**
 * Checks if the URL belongs to Planet Labs service
 * Planet Labs uses XYZ format different from standard TMS
 * @param {string} url - Tile service URL
 * @returns {boolean} True if it's from Planet Labs
 */
export const isPlanetLayer = (url) => {
  if (!url) return false;
  return url.includes('planet/') || url.includes('tileserver-pf.sccon.com.br');
};

/**
 * Validates if a WMS layer has all required properties
 * @param {Object} layer - WMS layer object
 * @returns {boolean} True if the layer is valid
 */
export const validateWmsLayer = (layer) => layer && layer.wms && layer.wms.geoserver
         && layer.wms.geoserver.geoserver_url
         && layer.wms.geoserver_layer_name;

/**
 * Validates if a TMS layer has all required properties
 * @param {Object} layer - TMS layer object
 * @returns {boolean} True if the layer is valid
 */
export const validateTmsLayer = (layer) => layer && layer.tms && layer.tms.url;

/**
 * Determines the default z-index for a layer based on its characteristics
 * High resolution and Planet Labs layers go to the bottom (z-index = 1)
 * Regular layers go above (z-index = 8)
 * @param {Object} layer - Layer object
 * @returns {number} Appropriate z-index value
 */
export const getDefaultZIndex = (layer) => {
  if (isHighResOrMosaic(layer)) {
    return 1;
  }

  if (layer.tms && isPlanetLayer(layer.tms.url)) {
    return 1;
  }

  if (layer.wms && layer.wms.geoserver && isPlanetLayer(layer.wms.geoserver.geoserver_url)) {
    return 1;
  }

  return 8;
};

export function generateCqlLayer(layer) {
  let wmsUrl = '';
  if (layer.layer_type === 'wms') {
    const { filters } = layer;
    if (filters.startData || filters.endData) {
      const [aliasStartDate, aliasEndDate] = layer.filters; // Destructuring filter alias

      if (filters.startData.length && filters.endData.length) {
        const valueStartData = filters.startData;
        const valueEndData = filters.endData;

        wmsUrl += `${aliasStartDate.filter_alias} >= (${valueStartData}) AND ${aliasEndDate.filter_alias} <= (${valueEndData})`;
        return wmsUrl;
      }
    }

    const coCrObj = filters.find((filter) => filter.co_cr);
    const coFunaiObj = filters.find((filter) => filter.co_funai);
    if (coCrObj || coFunaiObj) {
      const { co_cr: coCR } = coCrObj;
      const { co_funai: CoFunai } = coFunaiObj;
      const [firstInput, secondInput] = layer.filters;

      const valueCoCr = coCR.join(',');
      const valueCoFunai = CoFunai.join(',');

      if (coCR.length && CoFunai.length) {
        wmsUrl += `${firstInput.alias} IN (${
          firstInput.type === 'co_cr'
            ? valueCoCr
            : valueCoFunai
        }) AND ${secondInput.alias} IN (${
          secondInput.type === 'co_funai'
            ? valueCoFunai
            : valueCoCr
        })`;
        return wmsUrl;
      }

      if (coCR.length) {
        if (firstInput.type === 'co_cr') {
          wmsUrl += `${firstInput.alias} IN (${valueCoCr} )`;
        } else {
          wmsUrl += `${secondInput.alias} IN (${valueCoCr} )`;
        }
      }

      if (CoFunai.length) {
        // let list_funaiTi = filters.co_funai.join(',')
        if (firstInput.type === 'co_funai') {
          wmsUrl += `${firstInput.alias} IN (${valueCoFunai} )`;
        } else {
          wmsUrl += `${secondInput.alias} IN (${valueCoFunai} )`;
        }
      }
      return wmsUrl;
    }

    if (layer.cql) {
      wmsUrl += `${layer.cql}`;
    }
    return wmsUrl;
  }
  return '';
}

/**
 * Creates base options for any layer type
 * Includes common settings like opacity, z-index and error URL
 *
 * Note: Opacity is normalized from 0-100 range (used in the store)
 * to 0-1 range (required by Leaflet). This ensures consistency
 * between the main map and comparison panel.
 *
 * @param {Object} layer - Layer object
 * @param {number|null} customZIndex - Custom z-index (optional)
 * @returns {Object} Base layer options
 */
export const createLayerOptions = (layer, customZIndex = null) => {
  console.log('🚀 ~ createLayerOptions ~ layer:', layer);
  // Convert opacity from 0-100 range to 0-1 range (same as main map)
  // Example: layer.opacity = 50 becomes normalizedOpacity = 0.5

  const baseOptions = {
    attribution: '',
    env: `percentage:${(Math.max(0.01, Math.min(1, layer.opacity / 100))) || 1}`,
    errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    zIndex: customZIndex || getDefaultZIndex(layer),
  };
  if (generateCqlLayer(layer)) baseOptions.CQL_FILTER = generateCqlLayer(layer);

  return baseOptions;
};

/**
 * Creates a WMS URL with opacity parameter
 * @param {Object} layer - WMS layer object
 * @returns {string} WMS URL with opacity parameter
 */
export const createWmsUrl = (layer) => {
  const opacity = Math.max(0.01, Math.min(1, layer.opacity / 100));
  // Remove trailing slash to prevent double slashes in URL
  const baseUrl = layer.wms.geoserver.geoserver_url.replace(/\/$/, '');
  return `${baseUrl}/wms?env=percentage:${opacity}`;
};

/**
 * Creates specific options for WMS (Web Map Service) layers
 * Includes Geoserver settings and CQL filters when needed
 * @param {Object} layer - WMS layer object
 * @param {number|null} customZIndex - Custom z-index (optional)
 * @returns {Object} Complete WMS layer options
 */
export const createWmsOptions = (layer, customZIndex = null) => {
  const baseOptions = createLayerOptions(layer, customZIndex);

  const wmsOptions = {
    ...baseOptions,
    layers: `${layer.wms.geoserver_layer_namespace}:${layer.wms.geoserver_layer_name}`,
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
  };

  if (layer.cql && layer.cql !== '1=2' && layer.cql.trim() !== '') {
    wmsOptions.cql_filter = layer.cql;
  }

  return wmsOptions;
};

/**
 * Creates specific options for TMS (Tile Map Service) layers
 * Configures zoom limits and coordinate format (TMS vs XYZ)
 * @param {Object} layer - TMS layer object
 * @param {number|null} customZIndex - Custom z-index (optional)
 * @returns {Object} Complete TMS layer options
 */
export const createTmsOptions = (layer, customZIndex = null) => {
  const baseOptions = createLayerOptions(layer, customZIndex);

  const tmsOptions = {
    ...baseOptions,
    maxNativeZoom: 18,
    maxZoom: 22,
    minZoom: 0,
    crossOrigin: true,
  };

  tmsOptions.tms = !isPlanetLayer(layer.tms.url);

  return tmsOptions;
};

/**
 * Creates specific options for specialized store layers
 * (foco, monitoring, deter, prodes, urgent-alerts)
 * These layers have different structure than regular support/raster layers
 * @param {Object} layer - Specialized layer object
 * @param {Object} L - Leaflet instance
 * @param {number|null} customZIndex - Custom z-index (optional)
 * @returns {Object|null} Complete WMS layer or null if creation fails
 */
export const createSpecializedStoreLayer = (layer, L, customZIndex = null) => {
  try {
    if (!layer.url || !L) {
      return null;
    }

    const url = new URL(layer.url);
    const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
    const params = Object.fromEntries(url.searchParams);

    if (layer.layer_type === 'wms') {
      let layerName = params.layers || '';

      // Map source-specific layer properties to layer name
      if (layer.source === 'foco' && layer.geoserverLayer) {
        layerName = layer.geoserverLayer;
      } else if (layer.source === 'monitoring' && layer.geoserverLayerMonitoring) {
        layerName = layer.geoserverLayerMonitoring;
      } else if (layer.source === 'deter' && layer.geoserverLayerDeter) {
        layerName = layer.geoserverLayerDeter;
      } else if (layer.source === 'prodes' && layer.geoserverLayerProdes) {
        layerName = layer.geoserverLayerProdes;
      } else if (layer.source === 'urgent-alerts' && layer.geoserverLayerAlerts) {
        layerName = layer.geoserverLayerAlerts;
      } else if (!layerName && layer.id) {
        if (layer.id.includes(':')) {
          layerName = layer.id;
        }
      }

      if (!layerName) {
        return null;
      }

      const wmsOptions = {
        layers: layerName,
        format: params.format || 'image/png',
        transparent: params.transparent !== 'false',
        version: params.version || '1.1.0',
        opacity: (layer.opacity || 100) / 100,
        zIndex: customZIndex || layer.zIndex || 400,
        attribution: `${layer.name} - CMR2`,
        crs: L.CRS.EPSG3857,
      };

      // Add CQL_FILTER if present
      if (params.CQL_FILTER) {
        wmsOptions.cql_filter = params.CQL_FILTER;
      }

      // Add authkey if present
      if (params.authkey) {
        wmsOptions.authkey = params.authkey;
      }

      return L.tileLayer.wms(baseUrl, wmsOptions);
    }

    return null;
  } catch (error) {
    console.error('Error creating specialized store layer:', error);
    return null;
  }
};
