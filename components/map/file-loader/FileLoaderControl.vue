<template>
  <div class="d-flex mt-3">
    <v-tooltip
      right
      :disabled="showOptions"
    >
      <template #activator="{ on }">
        <v-btn
          fab
          ripple
          height="36"
          width="36"
          class="button-drawer"
          @click="removeAllFeatures()"
          v-on="on"
        >
          <transition name="slide-x-file-drawer-button">
            <v-icon v-if="!showOptions">
              mdi-folder-upload
            </v-icon>
            <v-icon
              v-if="showOptions"
              :class="showOptions ? 'back-icon' : ''"
            >
              mdi-arrow-up
            </v-icon>
          </transition>
        </v-btn>
      </template>
      <span> {{ $t('file-drawer') }} </span>
    </v-tooltip>

    <div class="drawer-block">
      <transition name="slide-x-file-drawer">
        <div
          v-if="showOptions"
          class="upload-options-drawer file-button"
        >
          <span> {{ $t('upload-hint') }}</span>

          <v-file-input
            type="file"
            hide-details
            hide-input
            ripple="false"
            prepend-icon="mdi-folder-upload"
            full-width
            @change="loadFile"
          />
        </div>
      </transition>
      <transition name="slide-y-file-drawer">
        <div
          v-if="showOptions"
          class="file-list"
        >
          <div
            v-for="(file, i) of fileList"
            :key="i"
            class="file-list-box"
          >
            <div class="file-block">
              <div class="file-button-area">
                <ConfirmButton
                  icon="mdi-delete-outline"
                  :icon-tooltip="$t('remove-feature-tooltip')"
                  @remove="remove(i)"
                />

                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      icon
                      class="go-to-icon"
                      v-bind="attrs"
                      v-on="on"
                      @click="flyToBound(file.feature)"
                    >
                      <v-icon size="50">
                        {{ 'mdi-navigation-outline' }}
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('go-to-tooltip') }}</span>
                </v-tooltip>
                <ConfirmButton
                  icon="mdi-database-plus-outline"
                  :icon-tooltip="$t('database-tooltip')"
                  @confirm="saveIntoDb(i)"
                />
              </div>

              <span
                class="file-name-span"
                :title="file.name.length > 25 ? file.name : ''"
              >
                {{ file.name }}
              </span>

              <div
                class="right-icon-class"
                @click="openFileOptions(i)"
              >
                <div
                  v-if="showFileOptions !== i"
                  class="file-legend"
                  :style="{
                    '--background-color': `${file.color}30`,
                    '--color': file.color,
                    '--radius': hasGeometryOnFeature(
                      file.feature,
                      [
                        'Polygon',
                        'MultiPolygon',
                        'LineString',
                        'MultiLineString',
                      ]
                    )
                      ? '2px'
                      : '20px',
                  }"
                />
                <v-icon v-else>
                  {{ 'mdi-close' }}
                </v-icon>
              </div>
            </div>

            <v-row style="overflow: hidden; margin: 0">
              <transition name="slide-y-file-option-drawer">
                <div
                  v-if="showFileOptions === i"
                  class="file-option"
                >
                  <div
                    class="slide-up-class"
                    @click="openFileOptions(i)"
                  >
                    <v-icon>
                      {{ 'mdi-chevron-up' }}
                    </v-icon>
                  </div>
                  <v-color-picker
                    dot-size="15"
                    :value="file.color"
                    hide-inputs
                    @update:color="
                      (color) => setFileColor(i, color)
                    "
                  />

                  <v-row
                    class="black--text text--lighten-2"
                    align="center"
                  >
                    <v-col cols="4">
                      Opacidade
                    </v-col>
                    <v-col cols="8">
                      <v-slider
                        thumb-label
                        hide-details
                        :value="file.opacity * 100"
                        @change="
                          (opacity) =>
                            setFileOpacity(
                              i,
                              opacity / 100
                            )
                        "
                      />
                    </v-col>
                  </v-row>
                </div>
              </transition>
            </v-row>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<i18n>
{
    "en": {
        "go-to-tooltip": "Go to features",
        "remove-feature-tooltip": "Remove feature",
        "database-tooltip": "Save into Database",
        "file-drawer": "Load a file",
        "upload-hint": "SHP (ZIP), KML, KMZ, GPX, Json/GeoJson",
        "file-error-shapefile": "Problem reading Shapefile file.",
        "file-error-kmz": "Problem reading Kmz file.",
        "file-error-parsing-gpx": "Found problems while parsing GPX file. Please, validate your file.",
        "file-error-parsing-kmlz": "Found problems while parsing KMZ/KML file. Please, validate your file",
        "file-error-general": "File type not acceptable on system.",
        "file-error-sizing": "File exceeds size maximum accepted by the system. Insert a file up to 1000kB.",
        "file-error-internal": "Internal Error: "
    },
    "pt-br": {
        "go-to-tooltip": "Ir para feições",
        "remove-feature-tooltip": "Remover feição",
        "database-tooltip": "Salvar no Banco de Dados",
        "file-drawer": "Carregue um arquivo",
        "upload-hint": "SHP (ZIP), KML, KMZ, GPX, Json/GeoJson",
        "file-error-shapefile": "Problema ao ler o arquivo Shapefile",
        "file-error-kmz": "Problema ao ler o arquivo KMZ.",
        "file-error-parsing-gpx": "Problemas encontrados durante a análise do arquivo GPX. Por favor, valide o arquivo.",
        "file-error-parsing-kmlz": "Problemas encontrados durante a análise do arquivo KMZ/KML. Por favor, valide o arquivo",
        "file-error-general": "Arquivo não aceito pelo sistema.",
        "file-error-sizing": "O arquivo excede o tamanho máximo aceito pelo sistema. Insira um arquivo de até 1000kB.",
        "file-error-internal": "Erro interno: "
    }
}
</i18n>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import shp from 'shpjs';
import omnivore from 'leaflet-omnivore';
import JSZip from 'jszip';
import ConfirmButton from '@/components/confirmButton/ConfirmButton.vue';

export default {

  components: {
    ConfirmButton,
  },

  props: {
    map: {
      type: Object,
      default: null,
    },
    files: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      showOptions: false,
      showFileOptions: {
        type: Number,
        default: null,
      },
    };
  },

  computed: {
    fileLayer() {
      return this.$L.geoJSON(this.file);
    },
    ...mapState('map', ['fileList']),
  },

  methods: {
    setFileColor(fileIndex, color) {
      this.changeStyle({
        fileIndex,
        color: color.hex,
        opacity: this.fileList[fileIndex].opacity,
      });
    },

    setFileOpacity(fileIndex, opacity) {
      this.changeStyle({
        fileIndex,
        opacity: opacity.toFixed(2),
        color: this.fileList[fileIndex].color,
      });
    },

    openFileOptions(file) {
      if (file === this.showFileOptions) this.showFileOptions = null;
      else this.showFileOptions = file;
      this.saveIntoDb(file.length)
    },

    flyToBound(feature) {
      const bounds = this.$L.geoJSON(feature).getBounds();
      if (bounds.getNorthEast() && bounds.getSouthWest()) { this.map.flyToBounds(bounds); }
    },

    hasGeometryOnFeature(feature, geometries) {
      return (
        feature.features.some((f) => geometries.includes(f.geometry.type)) || false
      );
    },

    remove(index) {
      this.files.splice(index, 1);
      this.removeFileFromMap(index);
    },

    saveIntoDb(index) {
      console.log("save into saveIntoDb method", index )
      this.files.splice(index, 1);
      this.saveToDatabase({ index });
    },

    removeAllFeatures() {
      this.showOptions = !this.showOptions;
    },

    addToMap(data, name) {
      const isPoint = this.hasGeometryOnFeature(data, [
        'Point',
        'MultiPoint',
      ]);
      const file = {
        name,
        feature: data,
        color: this.getRandomColor(),
        opacity: isPoint ? 0.8 : 0,
      };
      this.files.push(file);
      this.addFileToMap(file);
      this.saveIntoDb(this.files.length - 1)
    },

    rgbToHex(color) {
      const hexColor = color.toString(16);
      return hexColor.length < 2 ? `0${hexColor}` : hexColor;
    },

    getRandomColor() {
      const COLORDIFF = 40;
      const value = [
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
      ];
      const red = value[0] > COLORDIFF ? value[0] - COLORDIFF : 0;
      const green = value[1] > COLORDIFF ? value[1] - COLORDIFF : 0;
      const blue = value[2] > COLORDIFF ? value[2] - COLORDIFF : 0;
      return (
        `#${
          this.rgbToHex(parseInt(red))
        }${this.rgbToHex(parseInt(green))
        }${this.rgbToHex(parseInt(blue))}`
      );
    },

    fileError(error, message) {
      this.$emit('loads');
      this.$store.commit('alert/addAlert', {
        message: `${message}. ${
          error
            ? `${this.$i18n.t('file-error-internal')} ${
              error.message
            }`
            : ''
        }`,
      });
    },

    loadGeojsonFile(evt, name) {
      const json = JSON.parse(evt.result);
      this.addToMap(json, name);
    },

    loadShpFile(evt, name) {
      shp(evt.result)
        .then((data) => {
          this.addToMap(this.$L.geoJSON(data).toGeoJSON(), name);
        })
        .catch((error) => this.fileError(error, this.$i18n.t('file-error-shapefile')));
    },

    loadKmlFile(evt, name) {
      const geoJson = omnivore.kml.parse(evt.result).toGeoJSON();
      if (geoJson.features && geoJson.features.length) { this.addToMap(geoJson, name); } else this.fileError(null, this.$i18n.t('file-error-parsing-kmlz'));
    },

    loadGpxFile(evt, name) {
      const geoJson = omnivore.gpx.parse(evt.result).toGeoJSON();
      if (geoJson.features && geoJson.features.length) { this.addToMap(geoJson, name); } else this.fileError(null, this.$i18n.t('file-error-parsing-gpx'));
    },

    loadKmzFile(evt, name) {
      const zip = new JSZip();
      zip.loadAsync(evt.result)
        .then((e) => {
          const firstFile = Object.keys(e.files)[0];
          return e.file(firstFile).async('string');
        })
        .then((data) => {
          const geoJson = omnivore.kml.parse(data).toGeoJSON();
          if (geoJson.features && geoJson.features.length) { this.addToMap(geoJson, name); } else {
            this.fileError(
              null,
              this.$i18n.t('file-error-parsing-kmlz'),
            );
          }
        })
        .catch((error) => this.fileError(error, this.$i18n.t('file-error-kmz')));
    },

    loadFileMethod(type) {
      switch (type) {
        case 'application/zip':
        case 'application/x-zip-compressed':
          return this.loadShpFile;
        case 'application/vnd.google-earth.kmz':
        case 'kmz':
          return this.loadKmzFile;
        case 'application/gpx+xml':
        case 'gpx':
          return this.loadGpxFile;
        case 'application/vnd.google-earth.kml+xml':
        case 'kml':
          return this.loadKmlFile;
        case 'application/geo+json':
        case 'application/json':
        case 'geojson':
          return this.loadGeojsonFile;
        default:
          return null;
      }
    },

    readFile(file, fileReader, type) {
      switch (type) {
        case 'application/zip':
        case 'application/x-zip-compressed':
        case 'application/vnd.google-earth.kmz':
        case 'kmz':
          return fileReader.readAsArrayBuffer(file);
        case 'application/gpx+xml':
        case 'application/vnd.google-earth.kml+xml':
        case 'application/geo+json':
        case 'application/json':
        case 'geojson':
        case 'kml':
        case 'gpx':
          return fileReader.readAsText(file);
        default:
          return this.fileError(
            null,
            this.$i18n.t('file-error-general'),
          );
      }
    },

    loadFile(f) {
      if (f.size > 1000000){
        this.fileError(null, this.$i18n.t('file-error-sizing'))
        return
      }
      let type = null;
      this.$emit('loading');
      const reader = new FileReader();
      if (!f.type) {
        type = f.name.substr(f.name.indexOf('.')).replace('.', '');
      } else {
        type = f.type;
      }
      reader.onload = (e) => {
        this.$emit('load', e.target.result)};
      const loadMethod = this.loadFileMethod(type);
      reader.addEventListener('load', (evt) => loadMethod(evt.target, f.name));
      this.readFile(f, reader, type);
    },
    ...mapMutations('map', ['addFileToMap', 'removeFileFromMap']),
    ...mapActions('map', ['changeStyle', 'saveToDatabase']),
  },
};
</script>

<style lang="sass">
.file-option-class
    position: relative
    top: 36px
.slide-up-class
    display: flex
    justify-content: center
    padding-bottom: 5px
    cursor: pointer
.file-name-span
    width: 169px
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
.file-button-area
    display: flex
    flex-direction: row
    padding-right: 10px
.go-to-icon
    > span
        margin-top: -3px
        > .v-icon
            transform: rotate(45deg)
            opacity: 0.4
.go-to-icon:hover
    opacity: 1
.file-legend
    width: 100%
    height: 100%
    border-radius: var(--radius)
    background-color: var(--background-color)
    border: 2px solid var(--color)
.right-icon-class
    width: 16px
    height: 16px
    margin-left: 20px
    display: flex
    cursor: pointer
.back-icon
    transform: rotate(-90deg)
.drawer-block
    margin-left: -18px
    overflow: hidden
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
        span
            font-size: 15px
            margin-right: 10px
            opacity: 0.27
            user-select: none
        div
            margin: 0px !important
            padding: 0px !important
        .v-input
            display: flex
            align-items: center
            justify-content: center
            border: 1px solid rgba(0, 0, 0, 0.2)
            background-color: rgb(215, 215, 215)
            border-radius: 40px
            height: 36px
            width: 36px
            max-width: 36px
        .v-icon
            color: #111
            padding: 5px
    .file-list
        display: flex
        flex-direction: column
        position: relative
        z-index: 1
        margin: 5px 10px 0 50px
        padding-bottom: 5px
        transition: ease all 0.6s
        .file-list-box
            display: flex
            flex-direction: column
            overflow: hidden
            .file-block
                display: flex
                justify-content: space-between
                position: relative
                z-index: 1
                align-items: center
                background-color: white
                border-radius: 40px
                border: 1px solid rgba(0, 0, 0, 0.1)
                padding: 1px 20px 1px 0
                margin: 2px 0
                transition: 0.2s all ease
                min-height: 42px
                span
                    font-weight: bold
                    font-size: 14px
                    user-select: none
            .file-option
                background-color: white
                margin: 2px 5px 5px 40px
                padding: 5px
                border-radius: 10px
                max-width: 260px
.slide-x-file-drawer-enter-active, .slide-x-file-drawer-leave-active
    transition: all 0.4s ease-out !important
.slide-x-file-drawer-enter, .slide-x-file-drawer-leave-to
    transform: translateX(-100%)
.slide-y-file-drawer-enter-active, .slide-y-file-drawer-leave-active
    transition: all 0.4s ease-out !important
.slide-y-file-drawer-enter, .slide-y-file-drawer-leave-to
    transform: translateY(-200%)
.slide-x-file-drawer-leave-active
    transition-delay: 0.3s !important
.slide-y-file-drawer-enter-active
    transition-delay: 0.2s !important
.slide-y-file-option-drawer-enter, .slide-y-file-option-drawer-leave-to
    transform: translateY(-100%)
.slide-y-file-option-drawer-enter-active, .slide-y-file-option-drawer-leave-active
    transition: all 0.2s ease !important
</style>
