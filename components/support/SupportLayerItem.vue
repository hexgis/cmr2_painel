<template>
    <l-lwms-tile-layer
        v-if="layer.layer_type == 'wms'"
        ref="wmsLayer"
        :base-url="wmsBaseUrl"
        :layers="geoserverLayer"
        format="image/png"
        :transparent="true"
        :z-index="3"
        :visible="layer.visible"
        :options="wmsOptions"
        :pane="
            layer.wms.wms_layer_type === 'Raster'
                ? 'tms-support-layers-map'
                : 'support-layers-map'
        "
    />

    <l-tile-layer
        v-else-if="layer.layer_type == 'tms'"
        :url="layer.tms?.url_tms"
        :visible="layer.visible"
        :z-index="3"
        :options="{
            maxNativeZoom: layer.tms?.max_native_zoom
                ? layer.tms.max_native_zoom
                : 15,
        }"
        :pane="'tms-support-layers-map'"
    />

    <l-layer-group
        v-else-if="layer.layer_type == 'heatmap'"
        ref="heatmap"
        :visible="layer.visible"
    />
</template>

<script>
import { filter } from 'jszip'
import { mapMutations, mapActions } from 'vuex'

if (typeof window !== 'undefined') {
    require('leaflet.heat')
}

export default {
    name: 'SupportLayerItem',

    props: {
        layer: {
            type: Object,
            required: true,
        },
    },

    computed: {
        defaultFilters() {
            const filters = {}

            this.layer.filters.forEach((layerFilter) => {
                const label = layerFilter.filter_type
                const value = layerFilter.default
                filters[label] = value
            })

            return filters
        },

        geoserverLayer() {
            if (
                this.layer.wms &&
                this.layer.wms.geoserver_layer_namespace &&
                this.layer.wms.geoserver_layer_name
            ) {
                return `${this.layer.wms.geoserver_layer_namespace}:${this.layer.wms.geoserver_layer_name}`
            }
            return ''
        },

        wmsOptions() {
            let options = {}
            if (this.layer.layer_type === 'wms') {
                options = {
                    name: this.layer.name,
                    maxZoom: 21,
                    maxNativeZoom: 19,
                    queryable: this.layer.wms.queryable,
                }

                if (this.layer.wms && this.layer.wms.geoserver_layer_options) {
                    options = {
                        ...options,
                        ...this.layer.wms.geoserver_layer_options,
                    }
                }
            }

            return options
        },

        wmsBaseUrl() {
            let wmsUrl = ''
            if (this.layer.layer_type === 'wms') {
                const opacity = Math.max(
                    0.01,
                    Math.min(1, this.layer.opacity / 100)
                )
                wmsUrl = `${this.layer.wms.geoserver.wms_url}&env=percentage:${opacity}`

                const { filters } = this.layer
                if (filters.startData || filters.endData) {
                    const [aliasStartDate, aliasEndDate] = this.layer.filters // Destructuring filter alias

                    if (filters.startData.length && filters.endData.length) {
                        const valueStartData = filters.startData
                        const valueEndData = filters.endData

                        wmsUrl += `&CQL_FILTER=${aliasStartDate.filter_alias} >= (${valueStartData}) AND ${aliasEndDate.filter_alias} <= (${valueEndData})`

                        this.$nextTick(() => {
                            this.$refs.wmsLayer.mapObject.setUrl(wmsUrl)
                        })
                        return wmsUrl
                    }
                }

                if (filters.co_cr || filters.co_funai) {
                    const [firstInput, secondInput] = this.layer.filters // Destructuring filter alias
                    const valueCo_cr = filters.co_cr.join(',')
                    const valueCo_funai = filters.co_funai.join(',')

                    if (filters.co_cr.length && filters.co_funai.length) {
                        wmsUrl += `&CQL_FILTER=${firstInput.filter_alias} IN (${
                            firstInput.filter_type == 'co_cr'
                                ? valueCo_cr
                                : valueCo_funai
                        }) AND ${secondInput.filter_alias} IN (${
                            secondInput.filter_type == 'co_funai'
                                ? valueCo_funai
                                : valueCo_cr
                        })`

                        this.$nextTick(() => {
                            this.$refs.wmsLayer.mapObject.setUrl(wmsUrl)
                        })
                        return wmsUrl
                    }

                    if (filters.co_cr.length) {
                        if (firstInput.filter_type == 'co_cr') {
                            wmsUrl += `&CQL_FILTER=${firstInput.filter_alias} IN (${valueCo_cr} )`
                        } else {
                            wmsUrl += `&CQL_FILTER=${secondInput.filter_alias} IN (${valueCo_cr} )`
                        }
                    }

                    if (filters.co_funai.length) {
                        // let list_funaiTi = filters.co_funai.join(',')
                        if (firstInput.filter_type == 'co_funai') {
                            wmsUrl += `&CQL_FILTER=${firstInput.filter_alias} IN (${valueCo_funai} )`
                        } else {
                            wmsUrl += `&CQL_FILTER=${secondInput.filter_alias} IN (${valueCo_funai} )`
                        }
                    }
                    this.$nextTick(() => {
                        this.$refs.wmsLayer.mapObject.setUrl(wmsUrl)
                    })
                    return wmsUrl
                }

                if (this.layer.cql) {
                    wmsUrl += `&CQL_FILTER=${this.layer.cql}`
                }

                this.$nextTick(() => {
                    this.$refs.wmsLayer.mapObject.setUrl(wmsUrl)
                })
                return wmsUrl
            }
        },
    },

    watch: {
        'layer.data': {
            handler(data) {
                if (data.length) {
                    this.createHeatLayer()
                }
            },
            deep: true,
        },
        'layer.visible': {
            handler(visible) {
                console.log(this.layer)
            },
            deep: true,
        },
    },

    mounted() {
        if (this.layer.active_on_init) {
            if (this.layer.layer_type === 'heatmap') {
                this.getHeatMapLayer({
                    id: this.layer.id,
                    filters: this.defaultFilters,
                })
            } else {
                if (this.layer.layer_type === 'wms') {
                    this.setLayerFilters({
                        id: this.layer.id,
                        filters: this.defaultFilters,
                    })
                }
                this.toggleLayerVisibility({
                    id: this.layer.id,
                    visible: true,
                })
            }
        }
    },

    methods: {
        createHeatLayer() {
            const areas = this.layer.data.map((data) => data.area_ha)
            const maxArea = Math.max.apply(null, areas)

            this.$refs.heatmap.mapObject.clearLayers()

            const heatData = []
            this.layer.data.forEach((data) => {
                heatData.push([
                    data.nu_latitude,
                    data.nu_longitude,
                    data.area_ha / maxArea, // normalize by maximum area
                ])
            })
            this.$L
                .heatLayer(heatData, {
                    minOpacity: 0.5,
                    maxZoom: 18,
                    radius: 20,
                    blur: 15,
                    zIndex: 4,
                })
                .addTo(this.$refs.heatmap.mapObject)
        },

        ...mapMutations('supportLayers', [
            'setLayerFilters',
            'toggleLayerVisibility',
        ]),

        ...mapActions('supportLayers', ['getHeatMapLayer']),
    },
}
</script>
