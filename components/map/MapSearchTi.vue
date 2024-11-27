<template>
    <div class="d-flex">
        <v-tooltip right :disabled="isSearching">
            <template #activator="{ on }">
                <v-btn
                    fab
                    ripple
                    height="36"
                    width="36"
                    class="search-button"
                    :loading="isLoading"
                    v-on="on"
                    @click.stop="isSearching = !isSearching"
                >
                    <v-icon> mdi-image-search-outline </v-icon>
                </v-btn>
            </template>
            <span> {{ $t('search-label') }} </span>
        </v-tooltip>
        <div class="search-input-container">
            <transition name="slide-x">
                <v-autocomplete
                    v-if="isSearching"
                    :label="$t('search-label')"
                    :loading="isLoading"
                    :items="searchResults"
                    :search-input.sync="searchQuery"
                    background-color="white"
                    class="search-input"
                    flat
                    auto-select-first
                    height="40px"
                    hide-no-data
                    hide-details
                    item-text="label"
                    solo
                    :filter="filterItems"
                    @click.stop="searchQuery = ''"
                >
                    <template v-slot:item="searchResults">
                        <div
                            v-html="formatItem(searchResults)"
                            @click="handleItemClick(searchResults)"
                        ></div>
                    </template>
                </v-autocomplete>
            </transition>
        </div>
    </div>
</template>

<i18n>
{
  "en": {
      "search-label": "Search for Indigenous Lands"
  },
  "pt-br": {
      "search-label": "Pesquisar por Terras Indígenas"
  }
}
</i18n>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { convertTextToHtml, convertHtmlToText } from '@/utils/formatText'

export default {
    name: 'MapSearchTi',

    props: {
        map: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            searchQuery: null,
            searchResults: [],
            isLoading: false,
            isSearching: false,
        }
    },

    watch: {
        searchQuery() {
            if (!this.searchQuery || !(this.searchQuery.length >= 1)) {
                this.searchResults = []
                this.isLoading = false
                return
            }
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
            }
            this.searchTimeout = setTimeout(
                () => this.searchOnProvider(this.searchQuery),
                1000
            )
        },
    },

    computed: {
        ...mapState('map', ['indigenousLand']),
    },

    methods: {
        async searchOnProvider(response) {
            try {
                const data = await this.fetchSearchResults(response)
                data.map((item) =>
                    this.searchResults.push(
                        `**Terra Indígena:** ${item?.no_ti || '-'}
                  **Município:** ${item?.no_municipio || '-'}
                  **Coordenação Regional:** ${item?.ds_cr || '-'}`
                    )
                )
            } catch (error) {
                console.error('Erro ao buscar os resultados:', error)
            }
        },

        formatItem(text) {
            return convertTextToHtml(text)
        },

        removeAccents(text) {
            return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        },

        filterItems(item, searchQuery, textToFilter) {
            const normalizedQuery =
                this.removeAccents(searchQuery).toLowerCase()
            const normalizedText =
                this.removeAccents(textToFilter).toLowerCase()
            return normalizedText.includes(normalizedQuery)
        },

        clearItem(text) {
            this.searchQuery = convertHtmlToText(text)
        },

        findMatchingLandIndex(item) {
            const itemName = item.toLowerCase()
            for (let i = 0; i < this.indigenousLand.length; i++) {
                if (
                    itemName.includes(
                        this.indigenousLand[i].no_ti.toLowerCase()
                    ) &&
                    itemName.includes(
                        this.indigenousLand[i].ds_cr.toLowerCase()
                    )
                ) {
                    return i
                }
            }
            return -1
        },

        async goToIndigenousLands({ item }) {
            const index = this.findMatchingLandIndex(item)
            if (index === -1) {
                console.error('No matching indigenous land found.')
                return
            }
            const matchingLand = this.indigenousLand[index]
            try {
                const data = await this.$api.$get(
                    `/funai/busca-geo-ti/?id=${matchingLand.id}`
                )
                if (data && data.features && data.features.length > 0) {
                    let bounds = L.latLngBounds()
                    let polygons = []

                    data.features.forEach((feature) => {
                        feature.geometry.coordinates.forEach((polygon) => {
                            let latLngs = polygon[0].map((coordinate) => {
                                bounds.extend(
                                    L.latLng(coordinate[1], coordinate[0])
                                )
                                return [coordinate[1], coordinate[0]]
                            })
                            polygons.push(latLngs)
                        })
                    })

                    if (this.map) {
                        this.map.flyToBounds(bounds)
                        polygons.forEach((latLngs) => {
                            L.polygon(latLngs).addTo(this.map)
                        })
                    } else {
                        console.error('O objeto do mapa não está definido.')
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar os resultados:', error)
            }
        },

        handleItemClick(item) {
            this.searchQuery = item.label
            this.goToIndigenousLands(item)
            this.clearItem(item)
        },

        ...mapActions('map', ['fetchSearchResults']),
    },
}
</script>

<style lang="sass">
.search-button
    z-index: 5

.search-input-container
    overflow: hidden
    margin-left: -20px !important
    height: 36px
    font-size: 20px

.v-input__control
    min-height: 36px !important

div[role=listbox] > div:nth-child(n):not(:last-child)
    border-bottom: 1px solid lightgray
    margin-bottom: 10px
</style>
