import Vue from 'vue'

export const state = () => ({
    showFeatures: false,
    supportLayersGroups: {},
    supportLayers: {},
    supportCategoryGroupsFire: {},
    supportCategoryGroupsRaster: {},
    supportCategoryGroupsBase: {},
    supportCategoryGroupsAntropismo: {},
    loading: false,
    supportLayersCategoryFire: {},
    supportLayersCategoryBase: {},
    supportLayersCategoryRaster: {},
    supportLayersCategoryAntropismo: {},
    filters: {
        categoryBase: 1,
        categoryRaster: 3,
        categoryFire: 2,
        categoryAntropismo: 5,
    },
    filterOptions: {
        regionalFilters: [],
        tiFilters: [],
    },
})

export const getters = {
    activeLayerIds(state) {
        const activeLayerIds = []
        for (const layer of Object.values(state.supportLayers)) {
            if (layer.visible) {
                activeLayerIds.push(layer.id)
            }
        }
        return activeLayerIds
    },

    activeLayerIds(state) {
        const activeLayerIds = []
        for (const layer of Object.values(state.supportLayersCategoryRaster)) {
            if (layer.visible) {
                activeLayerIds.push(layer.id)
            }
        }
        return activeLayerIds
    },

    activeLayerIds(state) {
        const activeLayerIds = []
        for (const layer of Object.values(state.supportLayersCategoryFire)) {
            if (layer.visible) {
                activeLayerIds.push(layer.id)
            }
        }
        return activeLayerIds
    },

    activeLayerIds(state) {
        const activeLayerIds = []
        for (const layer of Object.values(
            state.supportLayersCategoryAntropismo
        )) {
            if (layer.visible) {
                activeLayerIds.push(layer.id)
            }
        }
        return activeLayerIds
    },
}

export const mutations = {
    setShowFeatures(state, showFeatures) {
        state.showFeatures = showFeatures
    },

    setSupportLayersGroups(state, layersGroups) {
        state.supportLayersGroups = {}
        state.supportLayers = {}

        for (const group of layersGroups) {
            const layers = group.layers
            group.layers = []

            for (const layer of layers) {
                layer.visible = false

                if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
                    layer.opacity = layer.wms.default_opacity
                } else {
                    layer.opacity = 100
                }

                layer.loading = false
                layer.filters = []
                layer.data = []

                group.layers.push(layer.id)
                Vue.set(state.supportLayers, layer.id, layer)
            }

            Vue.set(state.supportLayersGroups, group.id, group)
        }
    },

    setSupportCategoryGroupsFire(state, categoryGroups) {
        state.supportCategoryGroupsFire = {}
        state.supportLayersCategoryFire = {}

        for (const group of categoryGroups) {
            const layers = group.layers
            group.layers = []

            for (const layer of layers) {
                layer.visible = false

                if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
                    layer.opacity = layer.wms.default_opacity
                } else {
                    layer.opacity = 100
                }

                layer.loading = false
                layer.filters = []
                layer.data = []

                group.layers.push(layer.id)
                Vue.set(state.supportLayersCategoryFire, layer.id, layer)
            }

            Vue.set(state.supportCategoryGroupsFire, group.id, group)
        }
    },
    setSupportCategoryGroupsAntropismo(state, categoryGroups) {
        state.supportCategoryGroupsAntropismo = {}
        state.supportLayersCategoryAntropismo = {}

        for (const group of categoryGroups) {
            const layers = group.layers
            group.layers = []

            for (const layer of layers) {
                layer.visible = false

                if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
                    layer.opacity = layer.wms.default_opacity
                } else {
                    layer.opacity = 100
                }

                layer.loading = false
                layer.filters = []
                layer.data = []

                group.layers.push(layer.id)
                Vue.set(state.supportLayersCategoryAntropismo, layer.id, layer)
            }

            Vue.set(state.supportCategoryGroupsAntropismo, group.id, group)
        }
    },
    setSupportCategoryGroupsRaster(state, categoryGroups) {
        state.supportCategoryGroupsRaster = {}
        state.supportLayersCategoryRaster = {}

        for (const group of categoryGroups) {
            const layers = group.layers
            group.layers = []

            for (const layer of layers) {
                layer.visible = false

                if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
                    layer.opacity = layer.wms.default_opacity
                } else {
                    layer.opacity = 100
                }

                layer.loading = false
                layer.filters = []
                layer.data = []

                group.layers.push(layer.id)
                Vue.set(state.supportLayersCategoryRaster, layer.id, layer)
            }

            Vue.set(state.supportCategoryGroupsRaster, group.id, group)
        }
    },
    setSupportCategoryGroupsBase(state, categoryGroups) {
        state.supportCategoryGroupsBase = {}
        state.supportLayers = {}

        for (const group of categoryGroups) {
            const layers = group.layers
            group.layers = []

            for (const layer of layers) {
                layer.visible = false

                if (layer.layer_type === 'wms' && layer.wms.default_opacity) {
                    layer.opacity = layer.wms.default_opacity
                } else {
                    layer.opacity = 100
                }

                layer.loading = false
                layer.filters = []
                layer.data = []

                group.layers.push(layer.id)
                Vue.set(state.supportLayers, layer.id, layer)
            }

            Vue.set(state.supportCategoryGroupsBase, group.id, group)
        }
    },

    setLayerFilters(state, { id, filters }) {
        state.supportLayers[id].filters = {
            ...state.supportLayers[id].filters,
            ...filters,
        }
    },
    setLayerFiltersRaster(state, { id, filters }) {
        state.supportLayersCategoryRaster[id].filters = {
            ...state.supportLayersCategoryRaster[id].filters,
            ...filters,
        }
    },
    setFilterOptions(state, data) {
        state.filterOptions = data
    },
    setLayerFiltersFire(state, { id, filters }) {
        state.supportLayersCategoryFire[id].filters = {
            ...state.supportLayersCategoryFire[id].filters,
            ...filters,
        }
    },
    setLayerFiltersAntropismo(state, { id, filters }) {
        state.supportLayersCategoryAntropismo[id].filters = {
            ...state.supportLayersCategoryAntropismo[id].filters,
            ...filters,
        }
    },

    toggleLayerVisibility(state, { id, visible }) {
        state.supportLayers[id].visible = visible
    },
    toggleLayerVisibilityFire(state, { id, visible }) {
        state.supportLayersCategoryFire[id].visible = visible
    },
    toggleLayerVisibilityAntropismo(state, { id, visible }) {
        state.supportLayersCategoryAntropismo[id].visible = visible
    },
    toggleLayerVisibilityRaster(state, { id, visible }) {
        state.supportLayersCategoryRaster[id].visible = visible
    },

    setLayerOpacity(state, { id, opacity }) {
        state.supportLayers[id].opacity = opacity
    },
    setLayerOpacityRaster(state, { id, opacity }) {
        state.supportLayersCategoryRaster[id].opacity = opacity
    },
    setLayerOpacityFire(state, { id, opacity }) {
        state.supportLayersCategoryFire[id].opacity = opacity
    },
    setLayerOpacityAntropismo(state, { id, opacity }) {
        state.supportLayersCategoryAntropismo[id].opacity = opacity
    },

    setLayerLoading(state, { id, loading }) {
        state.supportLayers[id].loading = loading
    },
    setLayerLoadingFire(state, { id, loading }) {
        state.supportLayersCategoryFire[id].loading = loading
    },
    setLayerLoadingAntropismo(state, { id, loading }) {
        state.supportLayersCategoryAntropismo[id].loading = loading
    },
    setLayerLoadingRaster(state, { id, loading }) {
        state.supportLayersCategoryRaster[id].loading = loading
    },

    setHeatLayerData(state, { id, data }) {
        state.supportLayers[id].data = data
        state.supportLayers[id].visible = true
    },
    setHeatLayerDataRaster(state, { id, data }) {
        state.supportLayersCategoryRaster[id].data = data
        state.supportLayersCategoryRaster[id].visible = true
    },
    setHeatLayerDataFire(state, { id, data }) {
        state.supportLayersCategoryFire[id].data = data
        state.supportLayersCategoryFire[id].visible = true
    },

    setLoading(state, loading) {
        state.loading = loading
    },
}

export const actions = {
    async getLayersGroups({ commit }) {
        commit('setLoading', true)

        try {
            const response = await this.$api.$get('support/layers-groups/')

            commit('setSupportLayersGroups', response)
            commit('setShowFeatures', true)
        } catch (exception) {
            commit(
                'alert/addAlert',
                {
                    message: this.$i18n.t('default-error', {
                        action: this.$i18n.t('retrieve'),
                        resource: this.$i18n.tc('layer', 2),
                    }),
                },
                { root: true }
            )
        } finally {
            commit('setLoading', false)
        }
    },
    async getTiOptions({ commit, state }, cr) {
        const params = {
            co_cr: cr.toString(),
        }

        const tis = await this.$api.$get('funai/ti/', { params })

        if (tis)
            commit('setFilterOptions', {
                ...state.filterOptions,
                tiFilters: tis.sort((a, b) => a.no_ti > b.no_ti),
            })
    },
    async getCategoryGroupsRasters({ commit }) {
        commit('setLoading', true)
        const params = {
            category: 3,
        }
        try {
            const response = await this.$api.$get('support/layers-groups/', {
                params,
            })

            commit('setSupportCategoryGroupsRaster', response)
            commit('setShowFeatures', true)
        } catch (exception) {
            commit(
                'alert/addAlert',
                {
                    message: this.$i18n.t('default-error', {
                        action: this.$i18n.t('retrieve'),
                        resource: this.$i18n.tc('layer', 2),
                    }),
                },
                { root: true }
            )
        } finally {
            commit('setLoading', false)
        }
    },
    async getCategoryGroupsFire({ commit }) {
        commit('setLoading', true)
        const params = {
            category: 2,
        }
        try {
            const response = await this.$api.$get('support/layers-groups/', {
                params,
            })

            commit('setSupportCategoryGroupsFire', response)
            commit('setShowFeatures', true)
        } catch (exception) {
            commit(
                'alert/addAlert',
                {
                    message: this.$i18n.t('default-error', {
                        action: this.$i18n.t('retrieve'),
                        resource: this.$i18n.tc('layer', 2),
                    }),
                },
                { root: true }
            )
        } finally {
            commit('setLoading', false)
        }
    },
    async getCategoryGroupsAntropismo({ commit }) {
        commit('setLoading', true)
        const params = {
            category: 5,
        }
        try {
            const response = await this.$api.$get('support/layers-groups/', {
                params,
            })

            commit('setSupportCategoryGroupsAntropismo', response)
            commit('setShowFeatures', true)
        } catch (exception) {
            commit(
                'alert/addAlert',
                {
                    message: this.$i18n.t('default-error', {
                        action: this.$i18n.t('retrieve'),
                        resource: this.$i18n.tc('layer', 2),
                    }),
                },
                { root: true }
            )
        } finally {
            commit('setLoading', false)
        }
    },
    async getCategoryGroupsBase({ commit }) {
        commit('setLoading', true)
        const params = {
            category: 1,
        }
        try {
            const response = await this.$api.$get('support/layers-groups/', {
                params,
            })

            commit('setSupportCategoryGroupsBase', response)
            commit('setShowFeatures', true)
        } catch (exception) {
            commit(
                'alert/addAlert',
                {
                    message: this.$i18n.t('default-error', {
                        action: this.$i18n.t('retrieve'),
                        resource: this.$i18n.tc('layer', 2),
                    }),
                },
                { root: true }
            )
        } finally {
            commit('setLoading', false)
        }
    },

    async getHeatMapLayer({ state, commit }, { id, filters }) {
        const heatLayer = state.supportLayers[id]
        const params = {
            ...filters,
            type: heatLayer.heatmap.heatmap_type.identifier,
        }

        commit('setLayerLoading', { id, loading: true })

        try {
            const data = await this.$api.$get('monitoring/heatmap/', {
                params,
            })

            commit('setHeatLayerData', { id, data })
            commit('setLayerLoading', { id, loading: false })
            commit('setShowFeatures', true)
        } catch (exception) {
            commit(
                'alert/addAlert',
                {
                    message: this.$i18n.t('default-error', {
                        action: this.$i18n.t('retrieve'),
                        resource: this.$i18n.tc('layer', 1),
                    }),
                },
                { root: true }
            )
        }
    },
    async getHeatMapLayerRaster({ state, commit }, { id, filters }) {
        const heatLayer = state.supportLayersCategoryRaster[id]
        const params = {
            ...filters,
            type: heatLayer.heatmap.heatmap_type.identifier,
        }

        commit('setLayerLoadingRaster', { id, loading: true })

        try {
            const data = await this.$api.$get('monitoring/heatmap/', {
                params,
            })

            commit('setHeatLayerDataRaster', { id, data })
            commit('setLayerLoadingRaster', { id, loading: false })
            commit('setShowFeatures', true)
        } catch (exception) {
            commit(
                'alert/addAlert',
                {
                    message: this.$i18n.t('default-error', {
                        action: this.$i18n.t('retrieve'),
                        resource: this.$i18n.tc('layer', 1),
                    }),
                },
                { root: true }
            )
        }
    },
    async getHeatMapLayerFire({ state, commit }, { id, filters }) {
        const heatLayer = state.supportLayersCategoryFire[id]
        const params = {
            ...filters,
            type: heatLayer.heatmap.heatmap_type.identifier,
        }

        commit('setLayerLoadingFire', { id, loading: true })

        try {
            const data = await this.$api.$get('monitoring/heatmap/', {
                params,
            })

            commit('setHeatLayerDataFire', { id, data })
            commit('setLayerLoadingFire', { id, loading: false })
            commit('setShowFeatures', true)
        } catch (exception) {
            commit(
                'alert/addAlert',
                {
                    message: this.$i18n.t('default-error', {
                        action: this.$i18n.t('retrieve'),
                        resource: this.$i18n.tc('layer', 1),
                    }),
                },
                { root: true }
            )
        }
    },
    async getFilterOptions({ commit }) {
        const regional_coordinators = await this.$api.$get('funai/cr/')

        const data = {}

        if (regional_coordinators) {
            data.regionalFilters = regional_coordinators.sort(
                (a, b) => a.ds_cr > b.ds_cr
            )
        }

        commit('setFilterOptions', data)
    },
}
