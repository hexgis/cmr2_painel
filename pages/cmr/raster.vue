<template>
  <v-container class="pa-0">
    <div class="tab-header justify-space-between pb-2">
      <div class="d-flex align-center">
        <h4 class="subtitle-2 text-uppercase font-weight-regular">
          {{ $t('title') }}
        </h4>
        <v-tooltip
          bottom
          max-width="400"
          color="grey darken-4"
        >
          <template #activator="{ on }">
            <v-icon
              class="ml-2"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            {{ $t('data-source-label') }}
          </span>
        </v-tooltip>
      </div>
      <v-switch
        v-show="!loading"
        v-model="showFeatures"
        class="mt-n1 justify-self-end"
        hide-details
      />
    </div>
    <v-tabs
      v-model="tab"
      background-color="#D42A3E"
      centered
      dark
      icons-and-text
    >
      <v-tabs-slider />
      <v-tab href="#tab-1">
        Landsat/Sentinel
        <v-icon>mdi-satellite-variant</v-icon>
      </v-tab>

      <v-tab href="#tab-2">
        Planet
        <v-icon>mdi-earth</v-icon>
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item value="tab-1">
        <v-card flat>
          <v-col
            cols="12"
            class="pb-0 mb-n8"
          >
            <v-autocomplete
              v-model="selectedLayers"
              :label="$t('search-label')"
              multiple
              clearable
              :items="orderedSupportLayersGroupsItens"
              :item-text="(layer) => layer.name"
              outlined
              :search-input.sync="searchInput"
              @input="searchInput = null"
              @click:clear="clearInput"
            />
          </v-col>
          <v-col
            cols="12"
            class="pb-0 mb-n6"
          >
            <v-autocomplete
              v-model="selectedYears"
              :label="$t('search-label-years')"
              multiple
              clearable
              :items="years"
              outlined
              :search-input.sync="searchInputYears"
              @input="searchInputYears = null"
              @click:clear="clearInput"
            />
          </v-col>
          <div>
            <v-list
              v-if="!$fetchState.pending"
              expand
              class="pt-0"
            >
              <template v-for="group in filteredGroups">
                <LayersGroupRaster
                  :key="group.id"
                  :group="group"
                  :open-group="searchLayer"
                  :is-planet="false"
                />
              </template>
            </v-list>
          </div>
        </v-card>
      </v-tab-item>
      <v-tab-item value="tab-2">
        <v-card flat>
          <v-col
            cols="12"
            class="pb-0 mb-n8"
          >
            <v-autocomplete
              v-model="selectedLayers"
              :label="$t('search-label-month')"
              multiple
              clearable
              :items="orderedSupportLayersGroupsItensPlanet"
              :item-text="(layer) => layer.name"
              outlined
              :search-input.sync="searchInput"
              @input="searchInput = null"
              @click:clear="clearInput"
            />
          </v-col>
          <v-col
            cols="12"
            class="pb-0 mb-n6"
          >
            <v-autocomplete
              v-model="selectedYears"
              :label="$t('search-label-years')"
              multiple
              clearable
              :items="yearsPlanet"
              outlined
              :search-input.sync="searchInputYears"
              @input="searchInputYears = null"
              @click:clear="clearInput"
            />
          </v-col>
          <div class="list-container">
            <v-list
              v-if="!$fetchState.pending"
              class="pt-0 list-scroll"
              expand
            >
              <template v-for="group in filteredGroups">
                <LayersGroupRaster
                  :key="group.id"
                  :group="group"
                  :open-group="searchLayer"
                  :is-planet="true"
                />
              </template>
            </v-list>
          </div>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
    <div v-if="$fetchState.pending">
      <v-skeleton-loader
        v-for="i in 6"
        :key="i"
        type="text"
        class="mx-4 my-5"
      />
    </div>

    <!-- Compare Dialog -->
    <RasterCompare
      v-model="showCompareDialog"
      @update="closeComparator"
    />
  </v-container>
</template>

<i18n>
{
  "en": {
    "search-label": "Search layer",
    "search-label-years": "Search layer years",
    "search-label-month": "Search layer month",
    "title": "High Resolution and Mosaics",
    "data-source-label": "Datasource: Geoserver - FUNAI"
  },
  "pt-br": {
    "search-label": "Buscar camada",
    "search-label-years": "Buscar camada por ano",
    "search-label-month": "Buscar camada por mês",
    "title": "Alta Resolução e Mosaicos",
    "data-source-label": "Mosaicos de imagens de média resolução - satélites da série Landsat e Sentinel. Mosaicos de alta resolução - satélites Spot e Planet"
  }
}
</i18n>

<script>
import { mapState, mapMutations } from 'vuex';
import _ from 'lodash';
import LayersGroupRaster from '@/components/raster/LayersGroupRaster';
import RasterCompare from '@/components/raster/RasterCompare';

export default {
  name: 'SupportRaster',
  components: { LayersGroupRaster, RasterCompare },

  data: () => ({
    showFooter: process.env.SHOW_FOOTER === 'true',
    selectedLayers: [],
    searchInput: '',
    searchLayer: false,
    selectedYears: [],
    searchInputYears: '',
    searchInputMonths: '',
    tab: null,
  }),

  async fetch() {
    if (!Object.keys(this.supportCategoryGroupsRaster).length) {
      await this.$store.dispatch('raster/getCategoryGroupsRasters');
    }
  },

  computed: {
    years() {
      const groupsWithContent = this.orderedSupportLayersGroups.filter(
        (group) => group.layers && group.layers.length > 0 && !group.name.includes('Planet'),
      );
      const yearsWithContent = groupsWithContent
        .map((group) => {
          const match = group.name.match(/\d{4}$/);
          return match ? parseInt(match[0]) : null;
        })
        .filter((year) => year !== null);
      return Array.from(new Set(yearsWithContent)).sort((a, b) => a - b);
    },

    yearsPlanet() {
      const groupsWithContent = this.orderedSupportLayersGroups.filter(
        (group) => group.layers
                    && group.layers.length > 0
                    && group.name.includes('Planet'),
      );

      const yearsWithContent = groupsWithContent
        .map((group) => {
          const match = group.name.match(/\d{4}$/);
          return match ? parseInt(match[0]) : null;
        })
        .filter((year) => year !== null);

      return Array.from(new Set(yearsWithContent)).sort((a, b) => a - b);
    },

    orderedSupportLayersGroups() {
      return _.sortBy(this.supportCategoryGroupsRaster, 'order');
    },

    orderedSupportLayersGroupsItens() {
      return _.sortBy(this.supportLayersCategoryRaster, 'order');
    },

    orderedSupportLayersGroupsItensPlanet() {
      return _.chain(this.supportLayersCategoryRaster)
        .filter((item) => /^\d{2} - /.test(item.name))
        .sortBy('order')
        .value();
    },
    visibleLayers() {
      const rasterLayers = this.$store.state.raster && this.$store.state.raster.supportLayersCategoryRaster;
      if (Array.isArray(rasterLayers)) {
        return rasterLayers.filter((layer) => layer.visible);
      }
      return [];
    },

    showFeatures: {
      get() {
        return this.$store.state.raster.showFeaturesSupportLayersRaster;
      },
      set(value) {
        this.$store.commit(
          'raster/setshowFeaturesSupportLayersRaster',
          value,
        );
      },
    },

    groupsFilteredByYear() {
      if (!this.selectedYears.length) {
        return this.orderedSupportLayersGroups.filter(
          (group) => group.layers && group.layers.length > 0,
        );
      }

      return this.orderedSupportLayersGroups.filter((group) => {
        const groupYearMatch = group.name.match(/\d{4}$/);
        const groupYear = groupYearMatch
          ? parseInt(groupYearMatch[0])
          : null;
        return (
          groupYear
                    && this.selectedYears.includes(groupYear)
                    && group.layers
                    && group.layers.length > 0
        );
      });
    },

    groupsFilteredByLayer() {
      if (this.selectedLayers.length) {
        this.setSearchLayer(true);

        const filteredItens = this.orderedSupportLayersGroupsItens.filter(
          (layer) => this.selectedLayers.includes(layer.name),
        );

        const filteredLayersId = filteredItens.map((item) => item.id);

        const filteredGroup = this.orderedSupportLayersGroups.filter((group) => group.layers
          && group.layers.some((layerId) => filteredLayersId.includes(layerId)));

        this.setFilteredLayers(filteredLayersId);
        return filteredGroup;
      }
      this.setSearchLayer(false);
      this.setFilteredLayers(null);
      return _.sortBy(this.orderedSupportLayersGroups, 'order');
    },

    filteredGroups() {
      const yearFilteredGroups = this.groupsFilteredByYear;
      const layerFilteredGroups = this.groupsFilteredByLayer;

      return yearFilteredGroups.filter((group) => layerFilteredGroups.includes(group));
    },

    showCompareDialog: {
      get() {
        return this.$store.state.raster.openCompare;
      },
      set(value) {
        this.$store.commit('raster/setOpenCompare', value);
      },
    },

    ...mapState('raster', [
      'supportCategoryGroupsRaster',
      'supportLayersCategoryRaster',
      'loading',
      'showFeaturesSupportLayersRaster',
      'layersToCompare',
    ]),
  },

  methods: {
    ...mapMutations('raster', {
      setFilteredLayers: 'setFilteredLayers',
      setSearchLayer: 'setSearchLayer',
    }),
    clearInput() {
      this.selectedLayers = [];
      this.searchInput = '';
    },

    closeComparator() {
      this.$store.commit('raster/clearLayersToCompare');
    },
  },
};
</script>

<style scoped lang="scss">
.infoIconMargin {
    margin-left: 4px;
}

@media (max-width: 768px) {
    .infoIconMargin {
        margin-left: 2px;
    }

    .switch-margin {
        margin-top: 10px;
        margin-left: 0px;
    }
}
</style>
