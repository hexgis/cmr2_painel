export default function (context, inject) {
  if (process.client) {
    const L = require('leaflet');
    const turf = require('@turf/turf');
    const circleToPolygon = require('circle-to-polygon');

    const createOutlineStyle = (overrides = {}) => ({
      fill: false,
      dashArray: '5,5',
      interactive: false,
      pointerEvents: 'none',
      ...overrides
    });

    const DEFAULT_OPTIONS = {
      defaultDistance: 2000,
      bufferStyle: {
        color: '#3388ff',
        weight: 0,
        fillOpacity: 0.1,
        interactive: true,
        pointerEvents: 'auto',
      },
      bufferOutlineStyle: createOutlineStyle({
        color: '#000',
        weight: 1,
      }),
      bufferOutlineHoverStyle: createOutlineStyle({
        color: '#ff0000',
        weight: 1,
      }),
      bufferOutlineInteractionStyle: createOutlineStyle({
        color: 'blue',
        weight: 20,
        opacity: 0,
        interactive: true,
        pointerEvents: 'visibleStroke',
      }),
      popupClassName: 'draw-popup card-popup',
      numberOfEdges: 64,
      onCreatePopupContent: null,
      onRemoveBuffer: null,
      minBufferDistance: 100,
      maxBufferDistance: 40000,
    };

    L.BufferControl = L.Control.extend({
      options: { ...DEFAULT_OPTIONS },

      initialize: function (options) {
        L.Util.setOptions(this, options);
        this._map = null;
        this._eventHandlers = new Map();
      },

      onAdd: function (map) {
        this._map = map;
        const container = L.DomUtil.create('div');
        L.DomEvent.disableClickPropagation(container);
        return container;
      },

      createBuffer: function (layer) {
        if (!layer || !this._map) {
          console.warn('BufferControl: Layer or map is not defined');
          return;
        }

        try {
          const geojson = this._getLayerGeoJSON(layer);
          if (!this._isValidGeoJSON(geojson)) {
            console.warn('BufferControl: Invalid GeoJSON geometry');
            return;
          }

          this._applyBufferToLayer(layer, geojson);
        } catch (error) {
          console.error('BufferControl: Error creating buffer', error);
        }
      },

      _getLayerGeoJSON: function (layer) {
        if (layer instanceof L.Circle) {
          const coordinates = [layer.getLatLng().lng, layer.getLatLng().lat];
          const radiusMeters = layer.getRadius();
          return {
            type: 'Feature',
            geometry: circleToPolygon(coordinates, radiusMeters, { numberOfEdges: this.options.numberOfEdges }),
            properties: {},
          };
        }
        return layer.toGeoJSON();
      },

      _isValidGeoJSON: function (geojson) {
        if (!geojson || !geojson.type || !geojson.geometry) return false;

        const validGeometryTypes = [
          'Point', 'MultiPoint', 'LineString', 'MultiLineString',
          'Polygon', 'MultiPolygon'
        ];

        return validGeometryTypes.includes(geojson.geometry.type) &&
               geojson.geometry.coordinates &&
               Array.isArray(geojson.geometry.coordinates);
      },

      _applyBufferToLayer: function (layer, geojson) {
        let bufferDistance = this._isValidBufferDistance(layer.bufferDistance)
          ? layer.bufferDistance
          : this.options.defaultDistance;

        this.removeBuffer(layer);

        const buffered = turf.buffer(geojson, bufferDistance / 1000, { units: 'kilometers' });

        const bufferLayer = L.geoJSON(buffered, { style: this.options.bufferStyle }).addTo(this._map);
        bufferLayer.bringToBack();
        layer.bufferLayer = bufferLayer;

        const bufferOutlineLayer = L.geoJSON(buffered, { style: this.options.bufferOutlineStyle }).addTo(this._map);
        bufferOutlineLayer.bringToBack();
        layer.bufferOutlineLayer = bufferOutlineLayer;

        const bufferOutlineInteractionLayer = L.geoJSON(buffered, { style: this.options.bufferOutlineInteractionStyle }).addTo(this._map);
        bufferOutlineInteractionLayer.bringToBack();
        layer.bufferOutlineInteractionLayer = bufferOutlineInteractionLayer;

        if (this.options.onCreatePopupContent) {
          const popupContent = this.options.onCreatePopupContent(layer, bufferOutlineLayer, bufferDistance);
          bufferLayer.bindPopup(popupContent, { className: this.options.popupClassName });
          bufferOutlineInteractionLayer.bindPopup(popupContent, { className: this.options.popupClassName });
        }

        this._createEventHandlers(layer, bufferOutlineLayer, bufferOutlineInteractionLayer, geojson);
        this._setupZoomAdjustment(bufferOutlineLayer, bufferOutlineInteractionLayer);

        layer.on('edit', () => this._updateBuffer(layer));

        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          layer.on('dragend', () => this._updateBuffer(layer));
        }
      },

      _createEventHandlers: function (layer, bufferOutlineLayer, bufferOutlineInteractionLayer, geojson) {
        const handlers = {
          mouseover: () => {
            this._map.getContainer().style.cursor = 'move';
            bufferOutlineLayer.setStyle(this.options.bufferOutlineHoverStyle);

            bufferOutlineLayer.bringToFront();
            layer.bringToFront();
          },
          mouseout: () => {
            if (!layer.isDraggingBuffer) {
              this._map.getContainer().style.cursor = 'grab';
              bufferOutlineLayer.setStyle(this.options.bufferOutlineStyle);
              bufferOutlineLayer.bringToBack();
              layer.bringToFront();
            }
          },
          mousedown: (e) => this._handleBufferDragStart(e, layer, bufferOutlineLayer, bufferOutlineInteractionLayer, geojson),
          click: (e) => {
            e.originalEvent.stopPropagation();
          },
        };

        Object.entries(handlers).forEach(([event, handler]) => {
          bufferOutlineInteractionLayer.on(event, handler);
        });

        this._eventHandlers.set(layer, handlers);
      },

      _removeEventHandlers: function (layer) {
        const handlers = this._eventHandlers.get(layer);
        if (handlers && layer.bufferOutlineInteractionLayer) {
          Object.entries(handlers).forEach(([event, handler]) => {
            layer.bufferOutlineInteractionLayer.off(event, handler);
          });
        }
        this._eventHandlers.delete(layer);
      },

      _handleBufferDragStart: function (e, layer, bufferOutlineLayer, bufferOutlineInteractionLayer, geojson) {
        layer.isDraggingBuffer = true;
        this._map.dragging.disable();
        this._map.getContainer().style.cursor = 'grabbing';
        bufferOutlineLayer.setStyle(this.options.bufferOutlineHoverStyle);
        bufferOutlineInteractionLayer.openPopup(e.latlng);

        const boundaryGeojson = this._getBoundaryGeoJSON(geojson);
        const dragHandler = (moveE) => this._handleBufferDrag(moveE, layer, bufferOutlineLayer, bufferOutlineInteractionLayer, geojson, boundaryGeojson);
        const stopHandler = () => this._handleBufferDragStop(layer, bufferOutlineLayer, bufferOutlineInteractionLayer);

        this._map.on('mousemove', dragHandler);
        this._map.on('mouseup', stopHandler);

        layer._dragHandler = dragHandler;
        layer._stopHandler = stopHandler;

        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
      },

      _handleBufferDrag: function (moveE, layer, bufferOutlineLayer, bufferOutlineInteractionLayer, geojson, boundaryGeojson) {
        const currentPoint = turf.point([moveE.latlng.lng, moveE.latlng.lat]);
        let newBufferDistance = layer.bufferDistance;

        if (geojson.geometry.type === 'Point') {
          newBufferDistance = turf.distance(
            currentPoint,
            turf.point(geojson.geometry.coordinates),
            { units: 'meters' }
          );
        } else {
          const nearest = turf.nearestPointOnLine(
            boundaryGeojson,
            currentPoint,
            { units: 'meters' }
          );
          newBufferDistance = nearest.properties.dist;
        }

        newBufferDistance = Math.max(
          this.options.minBufferDistance,
          Math.min(this.options.maxBufferDistance, newBufferDistance)
        );

        this._updateBufferGeometry(layer, bufferOutlineLayer, bufferOutlineInteractionLayer, geojson, newBufferDistance);

        if (bufferOutlineInteractionLayer.getPopup() && bufferOutlineInteractionLayer.getPopup().isOpen()) {
          bufferOutlineInteractionLayer.openPopup(moveE.latlng);
        }
      },

      _handleBufferDragStop: function (layer, bufferOutlineLayer, bufferOutlineInteractionLayer) {
        this._map.off('mousemove', layer._dragHandler);
        this._map.off('mouseup', layer._stopHandler);
        this._map.dragging.enable();
        this._map.getContainer().style.cursor = 'grab';
        bufferOutlineLayer.setStyle(this.options.bufferOutlineStyle);
        bufferOutlineInteractionLayer.closePopup();
        layer.isDraggingBuffer = false;

        delete layer._dragHandler;
        delete layer._stopHandler;
      },

      _getBoundaryGeoJSON: function (geojson) {
        const geomType = geojson.geometry.type;
        if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
          return turf[geomType.toLowerCase() + 'ToLine'](geojson);
        }
        return geojson;
      },

      _updateBufferGeometry: function (layer, bufferOutlineLayer, bufferOutlineInteractionLayer, geojson, bufferDistance) {
        layer.bufferDistance = bufferDistance;
        const newBuffered = turf.buffer(geojson, bufferDistance / 1000, { units: 'kilometers' });

        layer.bufferLayer.clearLayers().addData(newBuffered);
        bufferOutlineLayer.clearLayers().addData(newBuffered);
        bufferOutlineInteractionLayer.clearLayers().addData(newBuffered);

        if (this.options.onCreatePopupContent) {
          const popupContent = this.options.onCreatePopupContent(layer, bufferOutlineLayer, bufferDistance);
          bufferOutlineInteractionLayer.setPopupContent(popupContent);
          if (layer.bufferLayer) {
            layer.bufferLayer.setPopupContent(popupContent);
          }
        }
      },

      _setupZoomAdjustment: function (bufferOutlineLayer, bufferOutlineInteractionLayer) {
        const zoomHandler = () => {
          const zoom = this._map.getZoom();

          const interactionWeight = Math.max(20, 20 + (zoom - 10) * 1);

          bufferOutlineInteractionLayer.setStyle({
            ...this.options.bufferOutlineInteractionStyle,
            weight: interactionWeight,
          });
        };

        this._map.on('zoomend', zoomHandler);
        this._map.on('moveend', zoomHandler);
        zoomHandler();
      },

      _updateBuffer: function (layer) {
        const geojson = this._getLayerGeoJSON(layer);
        if (!this._isValidGeoJSON(geojson)) return;
        this._applyBufferToLayer(layer, geojson);
      },

      _isValidBufferDistance: function (distance) {
        return typeof distance === 'number' &&
               distance >= this.options.minBufferDistance &&
               distance <= this.options.maxBufferDistance;
      },

      removeBuffer: function (layer) {
        this._removeEventHandlers(layer);

        if (layer._dragHandler) this._map.off('mousemove', layer._dragHandler);
        if (layer._stopHandler) this._map.off('mouseup', layer._stopHandler);

        if (layer.bufferOutlineLayer) {
          const popup = layer.bufferOutlineLayer.getPopup();
          if (popup) {
            layer.bufferOutlineLayer.closePopup();
            const content = popup.getContent();
            if (content && content.__vue__) content.__vue__.$destroy();
            layer.bufferOutlineLayer.unbindPopup();
          }
          this._map.removeLayer(layer.bufferOutlineLayer);
        }

        if (layer.bufferOutlineInteractionLayer) {
          const popup = layer.bufferOutlineInteractionLayer.getPopup();
          if (popup) {
            layer.bufferOutlineInteractionLayer.closePopup();
            const content = popup.getContent();
            if (content && content.__vue__) content.__vue__.$destroy();
            layer.bufferOutlineInteractionLayer.unbindPopup();
          }
          this._map.removeLayer(layer.bufferOutlineInteractionLayer);
        }

        if (layer.bufferLayer) {
          const popup = layer.bufferLayer.getPopup();
          if (popup) {
            layer.bufferLayer.closePopup();
            const content = popup.getContent();
            if (content && content.__vue__) content.__vue__.$destroy();
            layer.bufferLayer.unbindPopup();
          }
          this._map.removeLayer(layer.bufferLayer);
        }

        layer.bufferLayer = null;
        layer.bufferOutlineLayer = null;
        layer.bufferOutlineInteractionLayer = null;
        layer.bufferDistance = null;
        layer.isDraggingBuffer = false;
        layer.off('edit');

        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          layer.off('dragend');
        }
        this._map.getContainer().style.cursor = 'grab';

        if (this.options.onRemoveBuffer) this.options.onRemoveBuffer(layer);
      },
    });

    L.bufferControl = function (options) {
      return new L.BufferControl(options);
    };

    inject('bufferControl', L.bufferControl);
  }
}
