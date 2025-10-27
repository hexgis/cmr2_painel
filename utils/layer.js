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

/**
 * Creates base options for any layer type
 * Includes common settings like opacity, z-index and error URL
 * @param {Object} layer - Layer object
 * @param {number|null} customZIndex - Custom z-index (optional)
 * @returns {Object} Base layer options
 */
export const createLayerOptions = (layer, customZIndex = null) => {
  const baseOptions = {
    attribution: '',
    opacity: layer.opacity || 1,
    errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    zIndex: customZIndex || getDefaultZIndex(layer),
  };

  return baseOptions;
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
    layers: layer.wms.geoserver_layer_name,
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
