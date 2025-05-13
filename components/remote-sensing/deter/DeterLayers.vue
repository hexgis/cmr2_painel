<template>
    <div>
        <l-lwms-tile-layer 
            ref="wmsLayerMonitoring"
            :base-url="currentUrlWmsMonitoring"
            :layers="geoserverLayerMonitoring"
            format="image/png"
            :transparent="true"
            :z-index="3"
            :opacity="opacity / 100"
            :visible="showFeaturesMonitoring"
            :options="{...MonitoringWmsOptions, name: $t('name-layer')}"
            :pane="'monitoring-layers-map'"
        />
    </div>
</template>

<i18n>
    {
        "en": {
            "detail-api-error": "Error while retrieving polygon data, contact a system administrator in case it persists.",
            "name-layer": "Daily Monitoring",
            "name-layer-heatmap": "Daily Monitoring - Heatmap"
        },
        "pt-br": {
            "detail-api-error": "Não foi possível resgatar os dados do polígono, entre em contato com um administrador caso persista.",
            "name-layer": "Monitoramento Diário",
            "name-layer-heatmap": "Monitoramento Diário - Heatmap"
        }
    }
</i18n>

<script>
import { mapState, mapGetters } from 'vuex'

import BaseMetadataPopup from '@/components/base/BaseMetadataPopup'

export default {
    name: 'DeterLayers',

    components: {
        BaseMetadataPopup,
    },

    props: {
        map: {
            type: Object,
            default: null,
        },
    },

    data: () => ({
        selectedMonitoringFeature: null,
        heatmapLayer: null,
    }),

    computed: {
        ...mapState('deter', [
            'currentUrlWmsMonitoring',
            'showFeaturesMonitoring',
            'geoserverLayerMonitoring',
            'geoserverLayerMonitoringHeatmap',
            'MonitoringWmsOptions',
            'MonitoringWmsOptionsHeatmap',
            'resultsHeatmap',
            'resultsHeatmapOptions',
            // provavel delete
            'features',
            'opacity',
            'heatMap',
            'selectedStages',
        ]),
        ...mapGetters('deter', [
            'featuresLoaded',
            'getShowFeaturesMonitoring',
        ]),
    },

    watch: {
        features() {
            if (this.features && this.features.features) {
                this.addFeatures()
            } else {
                console.warn('No features to load')
            }
        },

        map() {
            this.addFeatures()
        },

        currentUrlWmsMonitoring() {
            if (this.$refs.wmsLayerMonitoring) {
                this.$refs.wmsLayerMonitoring.mapObject.setUrl(
                    this.currentUrlWmsMonitoring
                )
            }

            if (this.$refs.wmsLayerMonitoringHeatmap) {
                this.$refs.wmsLayerMonitoringHeatmap.mapObject.setUrl(
                    this.currentUrlWmsMonitoring
                )
            }
        },

        showFeaturesMonitoring(value) {
            if (value && this.heatMap) this.createMonitoramentoHeatLayer()
            else if (!value && this.heatmapLayer) this.map.removeLayer(this.heatmapLayer)
        },

        
    },

    methods: {
        addFeatures() {
            if (!this.features || !this.features.features) {
                console.warn('Features are not loaded yet')
                return
            }

            this.$refs.monitoringPolygons.mapObject.clearLayers()

            if (this.selectedStages.length === 0) {
                console.log('Nenhum estágio ativo, não adicionando camadas')
                return
            }

            if (this.features.features.length) {
                this.createMonitoramentoHeatLayer()
                if (this.getShowFeaturesMonitoring) {
                    this.flyTo()
                }
                this.$refs.monitoringPolygons.mapObject.addLayer(
                    this.createGeoJsonLayer()
                )
            }
        },

        createGeoJsonLayer() {
            const filteredFeatures = {
                ...this.features,
                features: this.features.features.filter((feature) =>
                    this.selectedStages.includes(feature.properties.no_estagio)
                ),
            }

            return this.$L.geoJSON(filteredFeatures, {
                style: (feature) => {
                    const appliedStyle = this.setMonitoringStyle(feature)
                    return appliedStyle
                },
                onEachFeature: this.onEachFeature,
            })
        },
        

        flyTo() {
            const bounds = this.$L.geoJSON(this.features && this.features.length).getBounds()
            if (bounds.getNorthEast() && bounds.getSouthWest()) {
                this.map.flyToBounds(bounds)
            }
        },
    },
}
</script>