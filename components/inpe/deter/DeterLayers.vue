<template>
    
       <div>
    <l-lwms-tile-layer 
      v-if="currentUrlWmsDeter && showFeaturesDeter"
      ref="wmsLayerDeter"
      :base-url="currentUrlWmsDeter"
      :layers="geoserverLayerDeter"
      format="image/png"
      :transparent="true"
      :z-index="3"
      :opacity="opacity / 100"
      :visible="showFeaturesDeter"
      :options="{...DeterWmsOptions, name: $t('name-layer')}"
    />
  </div>
   
</template>

<i18n>
    {
        "en": {
            "detail-api-error": "Error while retrieving polygon data, contact a system administrator in case it persists." ,
            "name-layer": "Deter"    
        },
        "pt-br": {
            "detail-api-error": "Não foi possível resgatar os dados do polígono, entre em contato com um administrador caso persista.",          
             "name-layer": "Deter"
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

    computed: {
        ...mapState('deter', [
            'DeterWmsOptions',
            'currentUrlWmsDeter',
            'showFeaturesDeter',
            'geoserverLayerDeter',           
            'features',
            'opacity',
        ]),
        ...mapGetters('deter', [
            'featuresLoaded',            
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

        currentUrlWmsDeter() {
            if (this.$refs.wmsLayerDeter) {
                this.$refs.wmsLayerDeter.mapObject.setUrl(
                    this.currentUrlWmsDeter
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
            
        },

        createGeoJsonLayer() {
            const filteredFeatures = {...this.features}

            return this.$L.geoJSON(filteredFeatures, {
                style: (feature) => {
                    const appliedStyle = this.setDeterStyle(feature)
                    return appliedStyle
                },               
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