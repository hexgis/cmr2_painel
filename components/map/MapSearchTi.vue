<template>
    <div>
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
                        @click.stop="toggleSearch"
                    >
                        <v-icon>mdi-image-search-outline</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t('search-label') }}</span>
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
                        @click.stop="resetSearchQuery"
                    >
                        <template v-slot:item="item">
                            <div
                                v-html="formatItem(item)"
                                @click="handleItemClick(item)"
                            ></div>
                        </template>
                    </v-autocomplete>
                </transition>
            </div>
        </div>
        <BaseTiMetadata
            v-if="isItemSelected"
            @close="handleCardClose"
            @tab-selected="handleTabSelection"
            class="infoDialog"
        />
    </div>
</template>
  
<i18n>
  {
    "en": { "search-label": "Search for Indigenous Lands" },
    "pt-br": { "search-label": "Pesquisar por Terras Indígenas" }
  }
</i18n>
  
<script>
import { mapState, mapActions } from 'vuex'
import { convertTextToHtml, convertHtmlToText } from '@/utils/formatText'
import BaseTiMetadata from '../base/BaseTiMetadata.vue'

export default {
    name: 'MapSearchTi',

    components: {
        BaseTiMetadata,
    },

    props: {
        map: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            searchQuery: '',
            searchResults: [],
            isLoading: false,
            isSearching: false,
            searchTimeout: null,
            polygons: [],
            isItemSelected: false,
        }
    },

    watch: {
        searchQuery(newQuery) {
            if (!newQuery || newQuery.length < 3) {
                this.clearSearch()
                return
            }
            clearTimeout(this.searchTimeout)
            this.searchTimeout = setTimeout(
                () => this.searchOnProvider(newQuery),
                1000
            )
        },
    },

    computed: {
        ...mapState('map', [
            'indigenousLand',
            'savedSelectedItems',
            'selectedItems',
        ]),
    },

    methods: {
        ...mapActions('map', ['fetchSearchResults', 'addSelectedItem']),

        handleTabSelection(item) {
            if (item && item.id) {
                this.goToIndigenousLands(item)
            }
        },

        handleCardClose() {
            this.polygons.forEach((polygon) => {
                this.map.removeLayer(polygon)
            })
            this.polygons = []
        },

        toggleSearch() {
            if (this.isSearching) {
                this.clearSearch()
            }
            this.isSearching = !this.isSearching
        },

        resetSearchQuery() {
            this.searchQuery = ''
        },

        clearSearch() {
            this.searchResults = []
            this.isLoading = false
        },

        async searchOnProvider(query) {
            try {
                this.isLoading = true
                const data = await this.fetchSearchResults(query)
                this.searchResults = data.map((item) =>
                    this.formatSearchResult(item)
                )
                this.$store.commit('map/setSelectedItems', data)
                this.isLoading = false
            } catch (error) {
                console.error('Error fetching results:', error)
                this.isLoading = false
            }
        },

        formatSearchResult(item) {
            return `**Terra Indígena:** ${item?.no_ti || '-'}
          **Município:** ${item?.no_municipio || '-'}
          **Coordenação Regional:** ${item?.ds_cr || '-'}`
        },

        formatItem(item) {
            return convertTextToHtml(item)
        },

        removeAccents(text) {
            return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        },

        filterItems(item, query, text) {
            const normalizedQuery = this.removeAccents(query).toLowerCase()
            const normalizedText = this.removeAccents(text).toLowerCase()
            return normalizedText.includes(normalizedQuery)
        },

        async goToIndigenousLands(matchingLand) {
            try {
                const data = await this.$api.$get(
                    `/funai/busca-geo-ti/?id=${matchingLand.id}`
                )
                if (data?.features?.length) {
                    this.displayPolygonsOnMap(data.features)
                }
            } catch (error) {
                console.error('Error fetching geo data:', error)
            }
        },

        displayPolygonsOnMap(features) {
            let bounds = L.latLngBounds()
            features.forEach((feature) => {
                feature.geometry.coordinates.forEach((polygon) => {
                    const latLngs = polygon[0].map((coord) => [
                        coord[1],
                        coord[0],
                    ])
                    bounds.extend(latLngs)
                    const polygonLayer = L.polygon(latLngs).addTo(this.map)
                    this.polygons.push(polygonLayer) // Armazena o polígono
                })
            })
            this.map?.flyToBounds(bounds)
        },

        handleItemClick(item) {
            this.searchQuery = item.label
            const selectedItem = this.$store.state.map.selectedItems.find(
                (ti) =>
                    ti.no_ti ===
                    item.item.match(/(?<=\*\*Terra Indígena:\*\*\s).*/)?.[0]
            )

            if (selectedItem) {
                this.addSelectedItem(selectedItem)
                this.$emit('item-selected', this.savedSelectedItems)
                this.goToIndigenousLands(selectedItem)
                this.isItemSelected = true
            }
            this.isSearching = false
            this.resetSearchQuery()
        },
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
        
.infoDialog
    position: fixed
    top: 45%
    height: 230px
    width: 400px
</style>
  