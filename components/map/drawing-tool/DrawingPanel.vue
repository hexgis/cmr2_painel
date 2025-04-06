<template>
  <div class="d-flex mt-2">
    <v-tooltip right>
      <template #activator="{ on }">
        <v-btn
          fab
          ripple
          height="36"
          width="36"
          class="button-drawer"
          @click="selectDraw()"
          v-on="on"
        >
          <transition name="slide-x drawer-button">
            <v-icon v-if="!show">
              mdi-pencil
            </v-icon>
            <v-icon
              v-else
              class="back-icon"
            >
              mdi-arrow-up
            </v-icon>
          </transition>
        </v-btn>
      </template>
      <span> {{ $t('upload-hint') }}</span>
    </v-tooltip>

    <div class="drawer-block">
      <transition name="slide-x-drawer">
        <div
          v-if="show"
          class="upload-options-drawer file-button"
        >
          <span> {{ $t('upload-hint') }}</span>
          <v-file-input
            hide-input
            prepend-icon="mdi-pencil"
            full-width
          />
        </div>
      </transition>
      <transition name="slide-x-drawer">
        <div v-if="show">
          <v-card
            class="ml-6 mt-1 pa-0"
            max-width="260"
            variant="outlined"
          >
            <v-card-actions class="pa-1 ma-0">
              <v-btn
                v-for="btn in buttons"
                :key="btn.icon"
                icon
                class="btn-tools"
                small
                :class="{ 'active-button': btn.icon === activeButton }"
                @click="createDrawControl(btn.type, btn.icon)"
              >
                <v-tooltip top>
                  <template #activator="{ on }">
                    <v-icon v-on="on">
                      {{ btn.icon }}
                    </v-icon>
                  </template>
                  {{ getTooltipText(btn.icon) }}
                </v-tooltip>
              </v-btn>
              <v-btn
                v-if="activeButton"
                fab
                ripple
                height="30"
                width="30"
                color="accent"
                small
                class="ml-1"
                @click.stop="clearActiveButton"
              >
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <span
                      v-bind="attrs"
                      v-on="on"
                    >x</span>
                  </template>
                  <span>{{ $t('cancel-tool') }}</span>
                </v-tooltip>
              </v-btn>
            </v-card-actions>
            <v-divider />
            <v-card-actions
              v-if="drawingFinished && (drawnItems && Object.keys(drawnItems._layers).length)"
            >
              <v-btn
                v-for="btn in buttonsEdit"
                :key="btn.icon"
                icon
                class="btn-tools"
                x-small
                @click="handleButtonEditClick(btn.type)"
              >
                <v-tooltip top>
                  <template #activator="{ on }">
                    <v-icon v-on="on">
                      {{ btn.icon }}
                    </v-icon>
                  </template>
                  {{ getTooltipText(btn.icon) }}
                </v-tooltip>
              </v-btn>
            </v-card-actions>
            <v-divider />
            <v-card-actions v-if="drawingFinished && isButtonEditClicked">
              <div class="row no-gutters align-center justify-space-between ml-1">
                <div class="col-4">
                  <v-btn
                    color="accent"
                    class="btn-action"
                    @click.stop="cancel()"
                  >
                    {{ $t('cancel-tool') }}
                  </v-btn>
                </div>
                <div class="col-4">
                  <v-btn
                    color="success"
                    class="btn-action"
                    @click.stop="save()"
                  >
                    <span>{{ $t('save-label') }}</span>
                  </v-btn>
                </div>
                <div class="col-4">
                  <v-btn
                    v-if="isDeleteButtonActive"
                    class="btn-action"
                    color="accent"
                    @click.stop="clearAllDrawings"
                  >
                    <span>{{ $t('clear-all-label') }}</span>
                  </v-btn>
                </div>
              </div>
            </v-card-actions>
          </v-card>
        </div>
      </transition>
    </div>
    <div v-if="drawnItems">
      <div
        v-for="layer in drawnItems._layers"
        :key="layer._leaflet_id"
        class="d-none"
      >
        <DrawPopup
          :ref="'componentPopupContent' + layer._leaflet_id"
          :layer="layer"
          :value-content="contentPopupDraw"
          :relationship="searchLayersRelationship"
          :loading-relationship="loadingRelationship"
        />
      </div>
    </div>
    <BaseDialog
      v-if="downloadDialog"
      :label="$t('download-label')"
      :type="'Download'"
      @close="downloadDialog = false"
      @action="generateJson"
    />
    <BaseDialog
      v-if="saveDialog"
      :label="$t('save-label')"
      :type="'Save'"
      @close="saveDialog = false"
      @action="generateJson"
    />
  </div>
</template>

<i18n>
{
  "en": {
    "upload-hint": "Tool Box",
    "display-draw": "Click to draw",
    "edit-label": "Edit layers",
    "tooltips.mdi-window-minimize": "Draw a polyline",
    "tooltips.mdi-hexagon": "Draw a polygon",
    "tooltips.mdi-checkbox-blank": "Draw a rectangle",
    "tooltips.mdi-checkbox-blank-circle": "Draw a circle",
    "tooltips.mdi-map-marker": "Draw a marker",
    "tooltips.mdi-panorama-fisheye": "Draw a circle marker",
    "tooltips.mdi-format-text": "Text box",
    "tooltips.mdi-pencil-box": "Edit layers",
    "tooltips.mdi-delete-outline": "Delete layers",
    "tooltips.mdi-database-plus-outline": "Save",
    "tooltips.mdi-download": "Download",
    "download-label": "Download",
    "save-label": "Save",
    "cancel-tool": "Cancel",
    "clear-all-label": "Clear all",
    "layers-active-label": "No active layer."
  },
  "pt-br": {
    "upload-hint": "Caixa de ferramentas",
    "display-draw": "Desenhar",
    "edit-label": "Editar desenho",
    "tooltips.mdi-window-minimize": "Desenhar uma linha",
    "tooltips.mdi-hexagon": "Desenhar um polígono",
    "tooltips.mdi-checkbox-blank": "Desenhar um retângulo",
    "tooltips.mdi-checkbox-blank-circle": "Desenhar um círculo",
    "tooltips.mdi-map-marker": "Desenhar um ponto",
    "tooltips.mdi-panorama-fisheye": "Desenhar um ponto circular",
    "tooltips.mdi-format-text": "Caixa de texto",
    "tooltips.mdi-pencil-box": "Editar desenho",
    "tooltips.mdi-delete-outline": "Apagar desenho",
    "tooltips.mdi-database-plus-outline": "Salvar",
    "tooltips.mdi-download": "Download",
    "download-label": "Baixar",
    "save-label": "Salvar",
    "cancel-tool": "Cancelar",
    "clear-all-label": "Limpar",
    "layers-active-label": "Nenhuma camada ativa."
  }
}
</i18n>

<script>
/* eslint-disable no-underscore-dangle --
 * Underscore attributes defined by "Leafleat" plugin
 */
import { mapState, mapMutations, mapActions } from 'vuex';
import DrawPopup from '../DrawPopup.vue';
import BaseDialog from './BaseDialog.vue';
import getGeometryArea from '~/plugins/getGeometryArea';

const { stringify } = require('wkt');
const circleToPolygon = require('circle-to-polygon');

export default {
  name: 'DrawingPanel',

  components: {
    DrawPopup,
    BaseDialog,
  },

  props: {
    map: {
      type: Object,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    buttons: [
      { icon: 'mdi-window-minimize', type: 'Polyline' },
      { icon: 'mdi-hexagon', type: 'Polygon' },
      { icon: 'mdi-checkbox-blank', type: 'Rectangle' },
      { icon: 'mdi-checkbox-blank-circle', type: 'Circle' },
      { icon: 'mdi-map-marker', type: 'Marker' },
      { icon: 'mdi-panorama-fisheye', type: 'CircleMarker' },
      { icon: 'mdi-format-text', type: 'TextBox' },
    ],
    buttonsEdit: [
      { icon: 'mdi-pencil-box', type: 'Edit' },
      { icon: 'mdi-delete-outline', type: 'Delete' },
      { icon: 'mdi-database-plus-outline', type: 'Save' },
      { icon: 'mdi-download', type: 'Download' },
    ],
    createdControl: false,
    activeButton: null,
    drawingFinished: false,
    isButtonEditClicked: false,
    newValueContent: [],
    isDeleteButtonActive: false,
    loadingRelationship: false,
    downloadDialog: false,
    saveDialog: false,
    drawnItems: null,
    textBoxId: [],
  }),

  computed: {
    ...mapState('map', ['buttonPopup', 'activeMenu']),
    ...mapState('supportLayers', ['supportLayers']),
    ...mapState('searchInArea', ['layersGroups']),
  },

  watch: {
    buttonPopup() {
      this.activePopup(this.buttonPopup.type, this.buttonPopup.layer);
    },

    show() {
      if (!this.show) {
        this.clearActiveButton();
        this.isButtonEditClicked = false;
      }
    },
  },

  methods: {
    /**
     * This method is called when the user clicks on the "Drawing Panel"
     * button in the toolbar. It toggles the visibility of the drawing panel and the drawing tools.
     */
    selectDraw() {
      this.$emit('toggleTool', 'DrawingPanel');
    },

    /**
     * This method returns the icon for the current drawing tool.
     */
    getIcon() {
      return this.initialIcon;
    },

    /**
     * This method returns the tooltip text for the current drawing tool.
     * @param {string} icon - The icon name.
     * @returns {string} The tooltip text.
     */
    getTooltipText(icon) {
      const language = this.$i18n.locale;
      return this.$t(`tooltips.${icon}`, null, language);
    },

    /**
     * This method clears the active drawing tool button.
    */
    clearActiveButton() {
      this.activeButton = null;
      if (this.drawInstance) {
        this.drawInstance.disable();
      }
    },

    /**
     * Opens a text box for drawing.
    */
    openTextBox() {
      this.$nextTick(() => {
        const customLayer = new this.$L.CustomLayer({
          map: this.map,
          blurCallback: this.clearActiveButton,
        });
        customLayer.addTo(this.map);
        this.textBoxId.push(customLayer._leaflet_id);
      });
    },

    /**
     * This method creates a new drawing control for the specified type of drawing tool.
     * @param {string} type - The type of drawing tool.
     * @param {string} icon - The icon associated with the tool.
     */
    createDrawControl(type, icon) {
      // Set the active button with the specified icon.
      this.activeButton = icon;
      // Check if the type is not 'TextBox'.
      if (type !== 'TextBox') {
        // Disable the current drawing instance if it exists.
        if (this.drawInstance) {
          this.drawInstance.disable();
        }
        // Enable drawing functionality.
        this.setIsDrawing(true);

        // If the control has not been created yet, set up events and the drawn items layer.
        if (!this.createdControl) {
          this.map.on('draw:created', this.finishDraw);
          this.map.on('draw:bufferstop', this.finishBuffer);
          this.drawnItems = new this.$L.FeatureGroup();
          this.map.addLayer(this.drawnItems);
          this.createdControl = true;
        }
        // Create a new drawing instance based on the specified type and enable it.
        this.drawInstance = new this.$L.Draw[type](this.map);
        this.drawInstance.enable();
      } else this.openTextBox(); // If the type is 'TextBox', open the text box.
    },

    /**
     * Handles the click event for the "Edit", "Delete", "Buffer",
     * "Download", and "Save" buttons in the drawing panel.
     * @param {string} type - The type of button clicked.
     */
    handleButtonEditClick(type) {
      // Set a flag to indicate that a button in the drawing panel was clicked.
      this.isButtonEditClicked = true;
      // Clear the active button reference.
      this.activeButton = null;
      // Disable the drawing functionality if it exists.
      if (this.drawInstance) {
        this.drawInstance.disable();
      }
      // Check the type of button clicked and set specific behavior accordingly.
      if (type === 'Delete') {
        // Enable the delete button.
        this.isDeleteButtonActive = true;
      } else {
        // Disable the delete button.
        this.isDeleteButtonActive = false;
      }
      if (type === 'Edit' || type === 'Delete' || type === 'Buffer') {
        // Create a new drawing instance based on the button type.
        this.drawInstance = new this.$L.EditToolbar[type](this.map, {
          featureGroup: this.drawnItems,
        });
        // Store the original drawn items for potential future use.
        this.originalDrawnItems = this.drawnItems.toGeoJSON();
        // Enable the drawing functionality.
        this.drawInstance.enable();
      }
      if (type === 'Download') {
        // Deactivate button edit mode and open the download dialog.
        this.isButtonEditClicked = false;
        this.downloadDialog = true;
      }
      if (type === 'Save') {
        // Deactivate button edit mode and open the save dialog.
        this.isButtonEditClicked = false;
        this.saveDialog = true;
      }
    },

    /**
     * Cancels the current drawing operation.
     */
    cancel() {
      // Check if the drawing instance exists.
      if (this.drawInstance) {
        // Revert any drawn layers back to their previous state.
        this.drawInstance.revertLayers();
        // Clear the active button reference.
        this.activeButton = null;
      }
      // Set the variable controlling the edit button to false.
      this.isButtonEditClicked = false;
      // Disable the drawing functionality.
      this.drawInstance.disable();
    },

    /**
     * Saves the current drawing to the database.
     */
    save() {
      // Disable the drawing functionality.
      this.setIsDrawing(false);
      // Iterate through all the drawn layers.
      Object.values(this.drawnItems._layers).forEach(
        (layer) => {
          // Get the geometry area of the layer.
          this.contentPopupDraw = getGeometryArea(layer);
          // Add the area of the current drawing to the list of new content values.
          this.newValueContent.push({
            content: this.contentPopupDraw,
            id: layer._leaflet_id,
          });
          // Clear the list of new content values after the loop completes.
          this.$nextTick(() => {
            this.newValueContent = [];
          });
        },
      );
      // Set the variable controlling the edit button to false.
      this.isButtonEditClicked = false;
      // Disable the drawing functionality.
      this.drawInstance.disable();
    },

    /**
     * Clears all of the drawings from the map.
     */
    clearAllDrawings() {
      if (this.drawnItems) {
        this.drawnItems.clearLayers();
        this.isButtonEditClicked = false;
        this.drawInstance.disable();
        // Remove layers associated with IDs stored in textBoxId
        this.textBoxId.forEach((id) => {
          const layerToRemove = this.map._layers[id];
          if (layerToRemove) {
            this.map.removeLayer(layerToRemove);
          }
        });
        // Clear the textBoxId array
        this.textBoxId = [];
      }
    },

    /**
     * Downloads the current drawing as a JSON file.
     *
     * @param {object} geometry - The geometry of the drawing.
     * @param {string} name - The name of the file.
     */
    downloadDraw(geometry, name) {
      // Convert the geometry object to a JSON string.
      const jsonStr = JSON.stringify(geometry);
      // Create a Blob containing the JSON data with the specified MIME type.
      const blob = new Blob([jsonStr], { type: 'application/json' });
      // Create a URL for the Blob object.
      const url = URL.createObjectURL(blob);
      // Create an anchor element for downloading the file.
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      // Append the link to the document body, trigger the click event, and remove the link.
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Revoke the Object URL to release resources.
      URL.revokeObjectURL(url);
      // Close the download dialog if applicable.
      this.downloadDialog = false;
    },

    /**
     * Saves the current drawing to the database.
     * @param {object} geometry - The geometry of the drawing.
     * @param {string} name - The name associated with the drawing.
     */
    saveIntoDb(geometry, name) {
      this.saveDrawToDatabase({ geometry, name });
      this.saveDialog = false;
    },

    /**
     * Generates a JSON representation of the current drawing.
     *
     * @param {object} obj - An object representing the drawing.
     */
    generateJson(obj) {
      // Create an array to store circle geometries.
      const circles = [];
      // Iterate through the layers in drawnItems.
      Object.values(this.drawnItems._layers).forEach((layer) => {
        // Check if the layer has a radius (is a circle).
        if (layer._mRadius) {
          // Extract coordinates and create a polygon representing the circle.
          const coordinates = [layer._latlng.lng, layer._latlng.lat];
          const circle = circleToPolygon(coordinates, layer._mRadius, 512);
          circles.push(circle);
        }
      });
      // Convert drawnItems to GeoJSON format.
      const geometry = this.drawnItems.toGeoJSON();
      // Iterate through the circle geometries and add them to the GeoJSON.
      circles.forEach((circle) => {
        const circleGeojson = {
          type: 'Feature',
          geometry: { coordinates: circle.coordinates, type: circle.type },
          properties: {},
        };
        geometry.features.push(circleGeojson);
      });
      // Define available actions for the drawing.
      const actions = {
        Download: () => this.downloadDraw(geometry, obj.name),
        Save: () => this.saveIntoDb(geometry, obj.name),
      };
      // Get the specified action based on obj.type and execute it.
      const action = actions[obj.type];
      if (action) {
        action();
      }
    },

    /**
     * This method is called when the user finishes drawing a new feature.
     * It adds the feature to the map and closes the drawing popup.
     *
     * @param {Event} event - The event object.
     */
    finishDraw(event) {
      // Get the drawn layer (feature) from the event.
      const { layer } = event;
      // Get the area of the geometry and assign it to contentPopupDraw.
      this.contentPopupDraw = getGeometryArea(layer);
      // Add the drawn layer to the map.
      this.drawnItems.addLayer(layer);
      // Set the 'drawingFinished' flag to true.
      this.drawingFinished = true;
      // Reset the active button to null.
      this.activeButton = null;
      // Use $nextTick to wait for Vue to update and bind a popup to the layer.
      this.$nextTick(() => {
        // Get the content from a Vue component reference.
        const content = this.$refs[`componentPopupContent${layer._leaflet_id}`][0].$el;
        // Bind a popup to the layer with a specific className.
        layer.bindPopup(content, {
          className: 'draw-popup card-popup',
        });
      });
      this.setIsDrawing(false);
    },

    /**
     * This method activates the popup for the specified layer.
     *
     * @param {string} type - The type of action (e.g., 'Delete', 'Edit', 'Buffer').
     * @param {number} layerId - The ID of the layer to activate the popup for.
     */
    activePopup(type, layerId) {
      // If the action is 'Delete', remove the specified layer from the map.
      if (type === 'Delete') {
        this.map.removeLayer(this.drawnItems._layers[layerId]);
        delete this.drawnItems._layers[layerId];
        this.hasDraw = Object.keys(this.drawnItems._layers).length > 0;
      }
      // If the action is 'Edit' or 'Buffer'.
      if (type === 'Edit' || type === 'Buffer') {
        // Disable the current drawing instance, if it exists.
        if (this.drawInstance) {
          this.drawInstance.disable();
        }
        // Set the 'isButtonEditClicked' flag to true.
        this.isButtonEditClicked = true;
        // Get all layers in drawnItems and filter the selected layer by its ID.
        const allLayers = Object.values(this.drawnItems._layers);
        const selectedLayer = allLayers.filter(
          (layer) => layer._leaflet_id === layerId,
        );
        // Close the popup of the selected layer.
        selectedLayer[0].closePopup();
        // Create a FeatureGroup containing the selected layer.
        const editingLayer = new this.$L.FeatureGroup();
        editingLayer._layers = selectedLayer;
        editingLayer._map = this.drawnItems._map;
        editingLayer._mapToAdd = this.drawnItems._mapToAdd;
        // Create a new drawing instance based on the specified action ('Edit' or 'Buffer').
        this.drawInstance = new this.$L.EditToolbar[type](this.map, {
          featureGroup: editingLayer,
        });
        // Enable the new drawing instance.
        this.drawInstance.enable();
      }
    },

    /**
     * Finish the current buffer operation and add the buffered features to the map.
     */
    finishBuffer() {
      // Create an array to store layer IDs.
      const layerId = [];
      // Iterate through the layers in drawnItems.
      Object.values(this.drawnItems._layers).forEach((layer) => {
        // Store the leaflet ID of the layer.
        layerId.push(layer._leaflet_id);
        // Bring the polyline layer to the front if it's a Polyline.
        if (layer instanceof this.$L.Polyline) {
          layer.bringToFront();
        }
      });
      // Iterate through all layers on the map.
      this.map.eachLayer((layer) => {
        // Check if the layer is not buffered.
        if (layer.buffered === false) {
          // Check if the layer's ID is not in the layerId array.
          if (!layerId.includes(layer._leaflet_id)) {
            // Get the area of the geometry and assign it to contentPopupDraw.
            this.contentPopupDraw = getGeometryArea(layer);
            // Add the layer to drawnItems.
            this.drawnItems.addLayer(layer);
            // Use $nextTick to wait for Vue to update and bind a popup to the layer.
            this.$nextTick(() => {
              // Get the content from a Vue component reference.
              const content = this.$refs[
                `componentPopupContent${layer._leaflet_id}`
              ][0].$el;
              // Bind a popup to the layer with a specific className.
              layer.bindPopup(content, {
                className: 'draw-popup card-popup',
              });
            });
          }
        }
      });
    },

    /**
     * Searches related layers based on an input geometry.
     *
     * @param {Layer} layer - The input layer for the search.
     * @param {string} type - The geometry type, can be 'Circle' or another value.
     * @returns {Promise<void>} A promise that resolves when the search is completed.
     */
    async searchLayersRelationship(layer) {
      // Set a variable to indicate that the search is in progress.
      this.loadingRelationship = true;
      try {
        // Set the request tool to 'Draw'.
        this.setRequestTool('Draw');
        // Filter and map active layers to get their names and IDs.
        const layersActives = Object.values(this.supportLayers).filter((item) => item.visible)
          .map((item) => `${item.name}_${item.id}`);
        // Check if there are selected active layers.
        if (layersActives.length) {
          // Set the drawing action to 'relationship'.
          this.setStartDraw('relationship');
          // If there is no information about layer groups, asynchronously fetch them.
          if (!this.layersGroups) { await this.getGeoserverLayers(); }
          // Navigate to the drawing search page.
          this.$router.push(this.localePath('/spatial-analysis'));
          this.setCurrentStage('SearchInArea');
          let wkt;
          const polygon = layer.toGeoJSON();
          // Convert the geometry to WKT format, depending on the input type ('Circle' or other).
          if (layer instanceof this.$L.Circle) {
            const coordinates = [polygon.geometry.coordinates[0], polygon.geometry.coordinates[1]];
            const raio = layer._mRadius;
            const circle = circleToPolygon(coordinates, raio, 32);
            wkt = stringify(circle);
          } else {
            wkt = stringify(polygon.geometry);
          }
          // Create a spatial query (CQL) based on the geometry.
          const cqlFilter = `INTERSECTS(geom,${wkt})`;
          // Set the drawing action to true.
          this.setDraw(true);
          // Set the CQL filter.
          this.setCqlFilter(cqlFilter);
          // Set result groups to false.
          this.setResultGroups(false);
          // Start the search on the specified layers.
          this.setSearch(layersActives);
        } else {
          // If there are no active layers, display an alert message.
          this.$store.commit('alert/addAlert', {
            message: this.$t('layers-active-label'),
          });
        }
      } catch (error) {
        // Log errors to the console, if any.
        console.error('An error occurred:', error);
      } finally {
        // Set the loading variable to false, indicating that the search is completed.
        this.loadingRelationship = false;
      }
    },
    ...mapMutations('map', ['setIsDrawing', 'setStartDraw']),
    ...mapMutations('searchInArea', [
      'setSearch',
      'setResultGroups',
      'setCqlFilter',
      'setDraw',
      'setRequestTool',
      'setCurrentStage',
    ]),
    ...mapActions('searchInArea', ['getGeoserverLayers']),
    ...mapActions('map', ['saveDrawToDatabase']),
  },
};
</script>

<style lang="sass" scoped>
.btn-action
  font-size: 11px !important
  width: 72px !important
  height: 25px !important

.drawer-block
  margin-left: -18px
  overflow: hidden
  position: absolute
  left: 35px
  min-width: 300px
  .upload-options-drawer
    position: relative
    z-index: 2
    display: flex
    align-items: center
    justify-content: space-between
    background-color: white
    border-radius: 4px 40px 40px 4px
    background-color: white
    transition: ease all 0.6s
    padding-left: 35px

.file-button-area
  display: flex
  flex-direction: row
  padding-right: 10px

.btn-tools
  padding: 0px !important
  margin: 0px !important
  color: inherit !important

.active-button
  background-color:#2a3163 !important
  color: white !important

.slide-x-drawer-enter-active, .slide-x-drawer-leave-active
  transition: all 0.4s ease-out !important

.slide-x-drawer-enter, .slide-x-drawer-leave-to
  transform: translateX(-100%)

.slide-x-drawer-leave-active
  transition-delay: 0.3s !important

.draw-popup
  .leaflet-popup-content
    padding: 15px
  .leaflet-popup-close-button
    padding: 2px !important
</style>
