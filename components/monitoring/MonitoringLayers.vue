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
            :visible="showFeaturesMonitoring && !heatMap"
            :options="{...MonitoringWmsOptions, name: $t('name-layer')}"
            :pane="'monitoring-layers-map'"
        />
        <l-lwms-tile-layer
            ref="wmsLayerMonitoringHeatmap"
            :base-url="currentUrlWmsMonitoring"
            :layers="geoserverLayerMonitoringHeatmap"
            format="image/png"
            :transparent="true"
            :z-index="3"
            :opacity="opacity / 100"
            :visible="showFeaturesMonitoring && heatMap"
            :options="{...MonitoringWmsOptionsHeatmap, name: $t('name-layer-heatmap')}"
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
    name: 'MonitoringLayers',

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
        ...mapState('monitoring', [
            'currentUrlWmsMonitoring',
            'showFeaturesMonitoring',
            'geoserverLayerMonitoring',
            'geoserverLayerMonitoringHeatmap',
            'MonitoringWmsOptions',
            'MonitoringWmsOptionsHeatmap',
            // provavel delete
            'features',
            'opacity',
            'heatMap',
            'selectedStages',
        ]),
        ...mapGetters('monitoring', [
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
        onEachFeature(feature, layer) {
            layer.setStyle(this.setMonitoringStyle(feature))
            layer.on('click', () => {
                this.getFeatureDetails(feature.properties.id)
            })
        },

        setMonitoringStyle(feature) {
            const estagio = feature.properties.no_estagio
            const style = {
                weight: 3,
                fill: true,
                fillOpacity: this.opacity / 100,
            }

            switch (estagio) {
                case 'CR': // Corte Raso
                    style.color = '#ff3333'
                    style.fillColor = '#ff3333'
                    break
                case 'DG': // Degradação
                    style.color = '#ff8000'
                    style.fillColor = '#ff8000'
                    break
                case 'FF': // Fogo em Floresta
                    style.color = '#b35900'
                    style.fillColor = '#b35900'
                    break
                case 'DR': // Desmatamento em Regeneração
                    style.color = '#990099'
                    style.fillColor = '#990099'
                    break
                default: // Estilo padrão
                    style.color = '#000000'
                    style.fillColor = '#000000'
            }

            return style
        },

        async getFeatureDetails(featureId) {
            this.selectedMonitoringFeature = null
            try {
                this.selectedMonitoringFeature = await this.$api.$get(
                    `monitoring/consolidated/detail/${featureId}/`
                )
            } catch (exception) {
                this.$store.commit('alert/addAlert', {
                    message: this.$t('detail-api-error'),
                })
            }
        },

        flyTo() {
            const bounds = this.$L.geoJSON(this.features).getBounds()
            if (bounds.getNorthEast() && bounds.getSouthWest()) {
                this.map.flyToBounds(bounds)
            }
        },

        createMonitoramentoHeatLayer() {
            const areas = this.features.features.map(
                (feature) => feature.properties.nu_area_km2
            )
            const maxArea = Math.max.apply(null, areas)
            const heatData = []
            this.features.features.forEach((feature) => {
                heatData.push([
                    feature.properties.nu_latitude,
                    feature.properties.nu_longitude,
                    feature.properties.nu_area_km2 / maxArea,
                ])
            })
            if (this.heatmapLayer) {
                this.heatmapLayer.removeFrom(
                    this.$refs.monitoringHeat.mapObject
                )
            }
            this.heatmapLayer = this.$L.heatLayer(heatData, {
                minOpacity: 0.5,
                maxZoom: 18,
                radius: 20,
                blur: 15,
                zIndex: 4,
            })
            this.heatmapLayer.addTo(this.$refs.monitoringHeat.mapObject)
        },
    },
}
</script>