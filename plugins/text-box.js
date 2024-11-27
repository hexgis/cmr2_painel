L.CustomLayer = L.Layer.extend({
  markers: [],
  options: {
    map: null,
    blurCallback: null,
  },

  initialize: function (options) {
    L.setOptions(this, options);
    L.DomEvent.on(options.map, 'click', this._handleClick, this);
    options.map.getContainer().style.cursor = 'text';
  },

  onAdd: function () { },

  _createMarkerElement: function (latlng) {
    var markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.style.left = latlng.lng + 'px';
    markerElement.style.top = latlng.lat + 'px';
    markerElement.style.position = 'absolute';
    markerElement.style.zIndex = '1000';
    markerElement.style.cursor = 'text';

    var textAreaElement = document.createElement('input');
    textAreaElement.type = 'text';
    textAreaElement.className = 'editable-textbox';
    textAreaElement.style.padding = '10px';
    textAreaElement.style.height = 'auto';
    textAreaElement.style.width = '300px';
    textAreaElement.style.overflow = 'hidden';
    textAreaElement.style.resize = 'none';
    textAreaElement.style.background = '#fff';
    textAreaElement.style.cursor = 'move';
    textAreaElement.addEventListener('keydown', function (event) {
      var scrollWidth = this.scrollWidth;
      if (event.key === 'Backspace' || event.key === 'Delete') {
        if (scrollWidth > 300) {
          this.style.width = scrollWidth - 1 + 'px';
        }
      } else this.style.width = scrollWidth + 1 + 'px';
    });

    var textSpanElement = document.createElement('span');
    textSpanElement.className = 'text-box-span';
    textSpanElement.style.display = 'none';
    textSpanElement.style.backgroundColor = '#fff';
    textSpanElement.style.color = '#000';
    textSpanElement.style.padding = '5px';
    textSpanElement.style.whiteSpace = 'nowrap';

    markerElement.appendChild(textAreaElement);
    markerElement.appendChild(textSpanElement);

    this.markers.push(markerElement)
    return markerElement;
  },

  onRemove: function (map) {
    // Remove event listeners or perform other necessary tasks
    L.DomEvent.off(map, 'click', this._handleClick, this);
    map.getContainer().style.cursor = '';
    this.markers.forEach(markerElement => {
      const markerIndex = this.markers.indexOf(markerElement);
      if (markerIndex !== -1) {
        this.markers.splice(markerIndex, 1);
      }
      markerElement.remove();
    });
    this.markers = [];
  },

  _handleClick: function (event) {
    var latlng = event.latlng;
    var markerElement = this._createMarkerElement(latlng);
    var textboxElement = markerElement.querySelector('.editable-textbox');
    var span = markerElement.querySelector('.text-box-span');
    var self = this;

    textboxElement.addEventListener('input', function () {
      var span = markerElement.querySelector('.text-box-span');
      span.textContent = this.value;
      span.style.fontSize = getComputedStyle(this).fontSize;
      span.style.color = getComputedStyle(this).color;
    });

    textboxElement.addEventListener('focus', function () {
      buttonContainer.style.display = 'block';
    });

    textboxElement.addEventListener('blur', function (event) {
      if (!this.value) {
        self._removeMarker(marker);
      }
      if (event.relatedTarget !== increaseFontButton
        && event.relatedTarget !== decreaseFontButton
        && event.relatedTarget !== colorLabel) {
        markerElement.querySelector('.editable-textbox').style.display = 'none';
        markerElement.querySelector('.text-box-span').style.display = 'inline-block';
        buttonContainer.style.display = 'none';
        span.style.fontSize = getComputedStyle(this).fontSize;
        span.style.color = getComputedStyle(this).color;
        self.options.map.getContainer().style.cursor = '';

        if (typeof self.options.blurCallback === 'function') {
          self.options.blurCallback();
        }
      } else {
        textboxElement.focus();
      }
    });

    span.addEventListener('click', function () {
      markerElement.querySelector('.editable-textbox').style.display = 'inline-block';
      markerElement.querySelector('.text-box-span').style.display = 'none';
      buttonContainer.style.display = 'block';
      textboxElement.focus();
    });

    var increaseFontButton = document.createElement('button');
    var increaseIcon = document.createElement('i');
    increaseFontButton.type = 'button';
    increaseFontButton.className = 'font-size-button';
    increaseFontButton.style.fontSize = '20px';
    increaseFontButton.style.marginRight = '10px';
    increaseFontButton.style.marginLeft = '10px';
    increaseIcon.className = 'mdi mdi-format-font-size-increase';
    increaseFontButton.appendChild(increaseIcon);

    increaseFontButton.addEventListener('mousedown', function (event) {
      event.stopPropagation();
      var currentFontSize = parseInt(textboxElement.style.fontSize) || 10;
      var fontSizeIncrement = 2;
      currentFontSize += fontSizeIncrement;
      textboxElement.style.fontSize = currentFontSize + 'px';
      updateTextboxHeight();
    });

    var decreaseFontButton = document.createElement('button');
    var decreaseIcon = document.createElement('i');
    decreaseFontButton.type = 'button';
    decreaseFontButton.className = 'font-size-button';
    decreaseFontButton.style.fontSize = '20px';
    decreaseFontButton.style.marginRight = '10px';
    decreaseIcon.className = 'mdi mdi-format-font-size-decrease';
    decreaseFontButton.appendChild(decreaseIcon);

    decreaseFontButton.addEventListener('mousedown', function (event) {
      event.stopPropagation();
      var currentFontSize = parseInt(textboxElement.style.fontSize) || 16;
      var fontSizeIncrement = 2;
      if (currentFontSize > fontSizeIncrement) {
        currentFontSize -= fontSizeIncrement;
        textboxElement.style.fontSize = currentFontSize + 'px';
        updateTextboxHeight();
      }
    });

    var colorLabel = document.createElement('button');
    var colorInput = document.createElement('input');
    var colorIcon = document.createElement('i');
    colorLabel.style.position = 'relative';
    colorLabel.style.marginRight = '10px';
    colorIcon.style.position = 'absolute';
    colorIcon.style.top = '59%';
    colorIcon.style.left = '0px';
    colorIcon.style.transform = 'translateY(-50%)';
    colorIcon.style.pointerEvents = 'none';
    colorIcon.style.fontSize = '20px';
    colorIcon.style.marginRight = '10px';
    colorIcon.className = 'mdi mdi-palette-outline';
    colorInput.type = 'color';
    colorInput.className = 'color-input';
    colorInput.value = '#000';
    colorInput.style.visibility = 'hidden';
    colorInput.style.width = '20px';
    colorInput.style.padding = '0';
    colorLabel.appendChild(colorIcon);
    colorLabel.appendChild(colorInput);

    colorLabel.addEventListener('mousedown', function (event) {
      event.stopPropagation();
      colorInput.click();
    });

    colorInput.addEventListener('input', function () {
      if (this && this.value) textboxElement.style.color = this.value;
    });

    var deleteButton = document.createElement('button');
    var deleteIcon = document.createElement('i');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.style.fontSize = '20px';
    deleteButton.style.marginRight = '10px';
    deleteIcon.className = 'mdi mdi-delete-outline';
    deleteButton.appendChild(deleteIcon);

    deleteButton.addEventListener('mousedown', function (event) {
      event.preventDefault();
      self._removeMarker(marker);
    });

    var buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.style.display = 'none';
    buttonContainer.style.color = '#a9a9a9';
    buttonContainer.appendChild(increaseFontButton);
    buttonContainer.appendChild(decreaseFontButton);
    buttonContainer.appendChild(colorLabel);
    buttonContainer.appendChild(deleteButton);

    markerElement.appendChild(buttonContainer);

    buttonContainer.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    document.addEventListener('click', function (event) {
      if (!markerElement.contains(event.target)) {
        buttonContainer.style.display = 'none';
      }
    });

    var marker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'marker-icon',
        html: markerElement,
      }),
      draggable: true
    });
    marker.className = 'marker-text-box'
    L.DomEvent.disableClickPropagation(marker);
    var draggableElement = new L.Draggable(marker);
    draggableElement.enable();

    if (this.options.map) {
      marker.on('click', function (event) {
        L.DomEvent.stopPropagation(event);
      });
      marker.addTo(this.options.map);
      L.DomEvent.off(this.options.map, 'click', this._handleClick, this);
    }

    setTimeout(function () {
      textboxElement.focus();
    }, 10);

    function updateTextboxHeight() {
      textboxElement.style.height = 'auto';
      textboxElement.style.height = textboxElement.scrollHeight + 'px';
    }
  },

  _removeMarker: function (marker) {
    if (marker && marker.removeFrom) {
      marker.removeFrom(marker._map);
    }
  },
});