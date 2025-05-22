<template>
    <div>
        <l-lwms-tile-layer
            v-if="currentUrlWmsProdes && showFeaturesProdes"
            ref="wmsLayerProdes"
            :base-url="currentUrlWmsProdes"
            :layers="geoserverLayerProdes"
            format="image/png"
            :transparent="true"
            :z-index="3"
            :opacity="opacity / 100"
            :visible="showFeaturesProdes"
            :options="{ ...ProdesWmsOptions, name: $t('name-layer') }"
        />
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import BaseMetadataPopup from '@/components/base/BaseMetadataPopup'

export default {
    name: 'ProdesLayers',

    components: {
        BaseMetadataPopup,
    },

    props: {
        map: {
            type: Object,
            default: null,
        },
    },

    computed: {
        ...mapState('prodes', [
            'ProdesWmsOptions',
            'currentUrlWmsProdes',
            'showFeaturesProdes',
            'geoserverLayerProdes',
            'features',
            'opacity',
        ]),
        ...mapGetters('prodes', ['featuresLoaded']),
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

        currentUrlWmsProdes() {
            if (this.$refs.wmsLayerProdes) {
                this.$refs.wmsLayerProdes.mapObject.setUrl(
                    this.currentUrlWmsProdes
                )
            }
        },
    },

    methods: {
        addFeatures() {
            if (!this.features || !this.features.features) {
                return
            }
        },

        createGeoJsonLayer() {
            const filteredFeatures = { ...this.features }

            return this.$L.geoJSON(filteredFeatures, {
                style: (feature) => {
                    const appliedStyle = this.setProdesStyle(feature)
                    return appliedStyle
                },
            })
        },

        flyTo() {
            const bounds = this.$L
                .geoJSON(this.features && this.features.length)
                .getBounds()
            if (bounds.getNorthEast() && bounds.getSouthWest()) {
                this.map.flyToBounds(bounds)
            }
        },
    },
}
</script>

<i18n>
    {
        "en": {
            "detail-api-error": "Error while retrieving polygon data, contact a system administrator in case it persists." ,
            "name-layer": "Prodes"    
        },
        "pt-br": {
            "detail-api-error": "Não foi possível resgatar os dados do polígono, entre em contato com um administrador caso persista.",          
            "name-layer": "Prodes"
        }
    }
</i18n>