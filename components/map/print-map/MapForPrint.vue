<template>
    <client-only>
        <l-map
            id="printMap"
            ref="printMap"
            :bounds="tmsToPrint.bounds || bounds"
            @ready="onMapReady"
        >
            <div id="map-container">
                <l-tile-layer
                    v-if="!selectedBaseMap"
                    :url="'//{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png'"
                />
                <l-tile-layer
                    v-if="
                        selectedBaseMap &&
                        selectedBaseMap.options.label != 'Bing'
                    "
                    :url="selectedBaseMap._url"
                    :attribution="selectedBaseMap.options.attribution"
                    :options="optionsMap"
                />
            </div>

            <l-control-scale v-if="valueScale" position="bottomleft" />
            <l-control v-if="valueNorthArrow" position="bottomleft">
                <img
                    src="@/assets/north-arrow.png"
                    alt="northarrow"
                    class="north-arrow"
                />
            </l-control>

            <!-- <PriorityLayers :map="map" />
            <MonitoringLayers :map="map" />
            <SupportLayers />
            <SupportUserLayersMap />
            <SupportLayersHazard />
            <SupportLayersProdes />
            <SupportLayersRaster />
            <AlertLayers :map="map" />
            <DeterLayers :map="map" />-->
            <LandUseLayers
                v-if="
                    showFeaturesLandUse &&
                    features.features &&
                    features.features.length
                "
                :map="map"
            />
        </l-map>
    </client-only>
</template>

<i18n>
{
  "en": {
    "map-error": "Error generating the map."
  },
  "pt-br": {
    "map-error": "Erro ao gerar o mapa."
  }
}
</i18n>

<script>
/* eslint-disable no-underscore-dangle --
 * Underscore attributes defined by "Leafleat" plugin
 */

import { mapActions, mapState } from 'vuex'

import MiniMapForPrint from '@/components/map/MiniMapForPrint.vue'
import PriorityLayers from '@/components/priority/PriorityLayers'
import MonitoringLayers from '@/components/monitoring/MonitoringLayers'
import SupportLayers from '@/components/support/SupportLayers'
import SupportLayersHazard from '@/components/support/SupportLayersHazard'
import SupportLayersProdes from '@/components/support/SupportLayersProdes'
import SupportLayersRaster from '@/components/support/SupportLayersRaster'
import AlertLayers from '@/components/monitoring/AlertLayers'
import DeterLayers from '@/components/deter/DeterLayers'
import LandUseLayers from '@/components/land-use/LandUseLayers'
import SupportUserLayersMap from '@/components/support/SupportUserLayersMap'

if (typeof window !== 'undefined') {
    require('leaflet-bing-layer')
}

const cloneLayer = require('leaflet-clonelayer')

const intervalZooms = require('../../../utils/zoomIntervalsGraticule')

export default {
    components: {
        MiniMapForPrint,
        PriorityLayers,
        MonitoringLayers,
        SupportLayers,
        AlertLayers,
        DeterLayers,
        SupportLayersProdes,
        SupportLayersRaster,
        SupportLayersHazard,
        LandUseLayers,
        SupportUserLayersMap,
    },

    props: {
        leafSize: {
            type: Object,
            default: null,
        },
        mainMap: {
            type: Object,
            default: null,
        },
        selectedBaseMap: {
            type: Object,
            default: null,
        },
        legend: {
            type: Boolean,
            default: false,
        },
    },

    data: () => ({
        currentBounds: null,
        map: null,
        miniMap: null,
        zoom: 1,
        valueScale: null,
        valueNorthArrow: null,
        bingKey:
            'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L',

        optionsMap: {
            name: 'printMap',
            zoomControl: false,
            maxZoom: 21,
            max_native_zoom: 18,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: false,
        },
    }),

    computed: {
        wmsOptions() {
            const options = {
                name: 'Change Detection',
                maxZoom: 21,
                maxNativeZoom: 19,
                queryable: false,
            }

            return options
        },
        ...mapState('map', ['bounds', 'tmsToPrint']),
        ...mapState('supportLayers', ['supportLayers']),
        ...mapState('land-use', ['showFeaturesLandUse', 'features']),
    },

    mounted() {
        this.$nextTick(() => {
            this.createMap()
        })
    },

    methods: {
        vectorImage(layer) {
            return layer.vector.thumbnail_blob || layer.vector.image
        },

        todayDate() {
            const date = new Date()
            const dd = date.getDate()
            const mm = date.getMonth() + 1
            const yyyy = date.getFullYear()
            return `${dd < 10 ? `0${dd}` : dd}/${
                mm < 10 ? `0${mm}` : mm
            }/${yyyy}`
        },

        onMapReady() {
            // TMS (base layer custom)
            this.map.createPane('tms-support-layers-map')
            this.map.getPane('tms-support-layers-map').style.zIndex = 401

            // Support WMS
            this.map.createPane('support-layers-map')
            this.map.getPane('support-layers-map').style.zIndex = 420

            // Monitoring WMS
            this.map.createPane('monitoring-layers-map')
            this.map.getPane('monitoring-layers-map').style.zIndex = 450

            this.$nextTick(() => {
                setTimeout(() => {
                    this.cloneLayersFromMainMap()
                }, 200)
            })
        },

        cloneLayersFromMainMap() {
            if (this.mainMap) {
                this.mainMap.eachLayer((layer) => {
                    if (layer && layer._events) {
                        try {
                            const clonedLayer = cloneLayer(layer)
                            if (clonedLayer) {
                                this.map.addLayer(clonedLayer)
                            } else {
                                console.warn('Falha ao clonar camada:', layer)
                            }
                        } catch (cloneError) {
                            console.error('Erro ao clonar camada:', cloneError)
                        }
                    }
                })
            }
        },

        async createMap() {
            try {
                require('@/plugins/L.SimpleGraticule')
                require('@/plugins/L.Control.MapBounds')

                if (!this.$refs.printMap) {
                    throw new Error('Referência ao mapa não encontrada.')
                }

                this.map = this.$refs.printMap.mapObject

                window.L = this.$L // define leaflet global

                if (!this.map) {
                    throw new Error('Mapa não foi corretamente inicializado.')
                }

                this.currentBouldMap = await this.map.getBounds()
                this.$nextTick(() => {
                    this.$emit('updateBounds', this.currentBouldMap)
                })
                this.map.invalidateSize()
                this.map.on('move', this.onMainMapMoving)
                this.map.on('moveend', this.onMainMapMoved)

                await this.$L.control
                    .mapBounds({
                        type: 'center',
                        position: 'bottomleft',
                        template: 'Centroide do mapa: {y} , {x} ',
                    })
                    .addTo(this.map)
                const options = {
                    interval: 20,
                    showOriginLabel: true,
                    redraw: 'move',
                    zoomIntervals: intervalZooms?.default[this.leafSize.type],
                }
                await this.$L.simpleGraticule(options).addTo(this.map)

                if (
                    this.selectedBaseMap &&
                    this.selectedBaseMap.options.label === 'Bing'
                ) {
                    const bingLayer = this.createBingLayer()
                    if (bingLayer) {
                        this.map.addLayer(bingLayer)
                    }
                }
                this.valueScale = true
                this.valueNorthArrow = true
            } catch (error) {
                this.$store.commit('alert/addAlert', {
                    message: 'Erro ao adicionar camada ao mapa',
                })
            }
        },

        onMainMapMoved() {
            const center = this.map.getCenter()
            this.$emit('getCenter', center)
        },

        onMainMapMoving() {
            const bounds = this.map.getBounds()
            this.$emit('updateBounds', bounds)
        },

        createBingLayer() {
            // Bing layer has need to be generated before being inserted
            // on tileLayers array, and is generated by the Plugin
            // leaflet-bing-layer
            const bingLayer = this.$L.tileLayer.bing(this.bingKey, {
                imagerySet: 'AerialWithLabelsOnDemand',
                maxZoom: 21,
                maxNativeZoom: 16,
            })
            bingLayer.options.attribution = 'Map data &copy; Bing contributors'
            bingLayer.options.iconURL = '/img/bing.png'
            bingLayer.options.label = 'Bing'
            bingLayer.options.tag = 'Bing'

            return bingLayer
        },
    },
}
</script>
<style lang="sass">
.leaflet-control-attribution leaflet-control
    background: rgba(255, 255, 255, 0.25) !important

.leaflet-control-attribution.leaflet-control:nth-child(1)::after
    content: '| Mapa não oficial'
    color: red
    font-weight: bold
    padding: 5px
</style>
