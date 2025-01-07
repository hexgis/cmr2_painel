<template>
    <l-layer-group v-if="layer.geometry">
        <l-feature-group ref="features">
            <l-geo-json
                :geojson="layer.geometry"
                :visible="visible"
                :options-style="opacity"
                :options="{ onEachFeature, pointToLayer }"
            />
            <l-popup
                :options="{
                    minWidth: 420,
                    maxHeight: 420,
                    className: 'card-popup',
                }"
            >
                <v-card>
                    <v-tabs
                        v-if="true"
                        background-color="primary"
                        dark
                        class="fill-height"
                    >
                        <v-tab>
                            {{ layer.name }}
                        </v-tab>
                        <v-tab-item>
                            <v-card-text>
                                <v-row
                                    v-for="(value, field) in info"
                                    :key="field"
                                    :align="field.align"
                                    class="mx-0 list-separator"
                                    dense
                                >
                                    <v-col cols="5" class="text-right">
                                        {{ field }}:
                                    </v-col>
                                    <v-col
                                        cols="7"
                                        class="text-subtitle-2"
                                        style="overflow-wrap: anywhere"
                                    >
                                        {{ value || '-' }}
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-tab-item>
                    </v-tabs>
                </v-card>
            </l-popup>
        </l-feature-group>
    </l-layer-group>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
    name: 'SupportUserLayersItem',

    props: {
        layer: {
            type: Object,
            required: true,
        },
    },

    data() {
        return {
            feature: null,
            info: null,
            color1: this.getRandomColor(),
        }
    },

    computed: {
        visible() {
            return this.layer.visible
        },
        opacity() {
            return { fillOpacity: this.layer.opacity / 100 }
        },
        ...mapState('supportLayersUser', ['popupInfo']),
        ...mapGetters('supportLayersUser', ['selectedColor']),
    },

    methods: {
        onEachFeature(feature, layer) {
            if (layer instanceof L.Path) {
                layer.setStyle(this.setStyle(feature))
            }

            layer.on('click', () => {
                if (!this.popupInfo[feature.properties.id]) {
                    this.getInfo(feature.properties.id)
                } else {
                    this.info = this.popupInfo[feature.properties.id]
                }
            })
        },

        pointToLayer(feature, latlng) {
            const markerColor =
                feature.properties?.properties?.color || this.color1
            if (feature.geometry && feature.geometry.type === 'Point') {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'svg-marker',
                        html: ` <svg id="Layer_1" style="enable-background:new 0 0 91 91;" version="1.1" viewBox="0 0 91 91" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <path d="M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z
                            M37,41.4c0-5.2,4.3-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5c0,5.2-4.2,9.5-9.5,9.5C41.3,50.9,37,46.6,37,41.4z" fill="${markerColor}" stroke="${markerColor}" stroke-width="2" />
                        </g>
                    </svg>`,
                        iconSize: [54, 54],
                        iconAnchor: [28, 45],
                    }),
                })
            }
        },

        setStyle(feature) {
            if (feature.geometry && feature.geometry.type === 'Point') {
                const fillColor =
                feature.properties.properties.color || this.color
                return {
                    fillColor: fillColor,
                    weight: 2,
                    color: fillColor,
                    radius: 6,
                }
            } else {
                return {
                    fillColor: this.color1,
                    weight: 2,
                    color: this.color1,
                    radius: 6,
                }
            }
        },

        rgbToHex(color) {
            const hexColor = color.toString(16)
            return hexColor.length < 2 ? `0${hexColor}` : hexColor
        },

        getRandomColor() {
            const COLORDIFF = 40
            const value = [
                Math.random() * 255,
                Math.random() * 255,
                Math.random() * 255,
            ]

            const red = value[0] > COLORDIFF ? value[0] - COLORDIFF : 0
            const green = value[1] > COLORDIFF ? value[1] - COLORDIFF : 0
            const blue = value[2] > COLORDIFF ? value[2] - COLORDIFF : 0

            return `#${this.rgbToHex(parseInt(red))}${this.rgbToHex(
                parseInt(green)
            )}${this.rgbToHex(parseInt(blue))}`
        },

        async getInfo(id) {
            await this.getLayersDetail({ id })
            this.info = this.popupInfo[id]
        },
        ...mapActions('supportLayersUser', ['getLayersDetail']),
    },
}
</script>

<style scoped>
.svg-marker {
    background: transparent;
    border: none;
}
</style>


