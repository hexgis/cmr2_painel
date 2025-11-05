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
                      <v-img
                        src="/img/icons/terras_indigenas_search.svg"
                        contain
                        height="12"
                        width="12"
                      ></v-img>
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

<i18n lang="json">
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
import { mapState, mapActions } from 'vuex'
import { convertTextToHtml } from '@/utils/formatText'
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
            'currentTiData'
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
            this.isItemSelected = false
            this.$store.commit('map/setCurrentTiData', null)
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
          const emEstudo = item?.is_estudo ? 'Sim' : 'Não'

          return `**Terra Indígena:** ${item?.no_ti || '-'}
            **Município:** ${item?.no_municipio || '-'}
            **Coordenação Regional:** ${item?.ds_cr || '-'}
            **Em Estudo:** ${emEstudo}`
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
                const layerName = matchingLand.layername;
                const namespace = matchingLand.namespace;
                const tiName = matchingLand.no_ti;
                
                if (!layerName || !tiName) {
                    console.error('❌ Dados insuficientes para buscar a TI');
                    return;
                }

                const geoserverUrl = this.$store.state.map.geoserverUrl;
                const fullLayerName = `${namespace}:${layerName}`;
                
                // Buscar o polígono completo da layer específica usando CQL_FILTER
                const url = `${geoserverUrl}service=WFS&version=1.1.0&request=GetFeature&typeName=${fullLayerName}&outputFormat=application/json&cql_filter=no_ti='${encodeURIComponent(tiName)}'`;

                console.log('🔍 Buscando polígono completo:', url);
                
                const response = await this.$axios.$get(url);
                
                if (response?.features?.length) {
                    console.log('✅ Polígono encontrado:', response.features[0].properties);
                    this.displayPolygonsOnMap(response.features);
                    
                    // Atualiza os dados no store para o popup usar
                    this.$store.commit('map/setCurrentTiData', response.features[0].properties);
                } else {
                    console.warn('⚠️ Nenhum polígono encontrado para:', tiName);
                }
            } catch (error) {
                console.error('Error fetching geo data:', error);
            }
        },

        displayPolygonsOnMap(features) {
    // Limpa polígonos anteriores
    this.polygons.forEach((polygon) => {
        this.map.removeLayer(polygon);
    });
    this.polygons = [];

    let bounds = L.latLngBounds();
    
    features.forEach((feature) => {
        // Extrai as propriedades reais do polígono
        const realProperties = feature.properties;
        console.log('📋 Dados reais do polígono:', realProperties);
        
        // Atualiza os dados no store
        this.$store.commit('map/setCurrentTiData', realProperties);
        
        // Processa a geometria baseada no tipo
        if (feature.geometry.type === 'Point') {
            // TRATAMENTO PARA PONTOS (is_estudo = true)
            const coordinates = feature.geometry.coordinates;
            const point = L.marker([coordinates[1], coordinates[0]]).addTo(this.map);
            
            // Adiciona popup ao ponto
            point.bindPopup(`
                <strong>${realProperties.no_ti || 'Terra Indígena'}</strong><br/>
                Município: ${realProperties.no_municipio || 'N/A'}<br/>
                Status: Em Estudo
            `);
            
            this.polygons.push(point);
            bounds.extend([coordinates[1], coordinates[0]]);
            
        } else if (feature.geometry.type === 'Polygon') {
            // TRATAMENTO EXISTENTE PARA POLÍGONOS (is_estudo = false)
            const latLngs = feature.geometry.coordinates[0].map((coord) => [
                coord[1], coord[0]
            ]);
            bounds.extend(latLngs);
            const polygonLayer = L.polygon(latLngs, { 
                color: 'blue',
                weight: 2,
                fillColor: 'lightblue',
                fillOpacity: 0.3
            }).addTo(this.map);
            this.polygons.push(polygonLayer);
            
        } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach((polygon) => {
                const latLngs = polygon[0].map((coord) => [
                    coord[1], coord[0]
                ]);
                bounds.extend(latLngs);
                const polygonLayer = L.polygon(latLngs, {
                    color: 'blue',
                    weight: 2,
                    fillColor: 'lightblue',
                    fillOpacity: 0.3
                }).addTo(this.map);
                this.polygons.push(polygonLayer);
            });
        }
    });
    
    // Ajusta o zoom para mostrar todos os elementos
    if (bounds.isValid()) {
        // Para pontos únicos, usa zoom mais próximo
        if (features.length === 1 && features[0].geometry.type === 'Point') {
            this.map?.flyTo(bounds.getCenter(), 14); // Zoom nível 14 para pontos
        } else {
            this.map?.flyToBounds(bounds, { padding: [20, 20] });
        }
    }
},

        handleItemClick(item) {
            this.searchQuery = item.label;
            const selectedItem = this.$store.state.map.selectedItems.find(
                (ti) =>
                    ti.no_ti ===
                    item.item.match(/(?<=\*\*Terra Indígena:\*\*\s).*/)?.[0]
            );

            if (selectedItem) {
                this.addSelectedItem(selectedItem);
                this.$emit('item-selected', this.savedSelectedItems);
                
                // Primeiro define os dados básicos no store
                this.$store.commit('map/setCurrentTiData', selectedItem);
                
                // Depois busca o polígono completo
                this.goToIndigenousLands(selectedItem);
                this.isItemSelected = true;
            }
            this.isSearching = false;
            this.resetSearchQuery();
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
