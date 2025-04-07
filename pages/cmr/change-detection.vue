<template>
  <v-container class="pa-0 fill-height align-start">
    <v-expansion-panels
      v-model="showFilters"
      class="filter-container"
      flat
      focusable
    >
      <v-expansion-panel
        :class="{
          'elevation-2':
            showChangeDetections && showFilters === undefined,
          'elevation-6': showChangeDetections && showFilters === 0,
        }"
      >
        <v-expansion-panel-header
          ripple
          class="fixed-expansion-header"
          :color="showChangeDetections ? 'grey lighten-3' : ''"
        >
          <h4 class="subtitle-2 text-uppercase font-weight-regular">
            {{
              showChangeDetections ? $t('alt-title') : $t('title')
            }}
          </h4>

          <v-switch
            v-show="!!showChangeDetections"
            v-model="showFeatures"
            class="mt-n1 ml-5"
            hide-details
            @click.native.stop
            @mousedown.stop
          />
        </v-expansion-panel-header>

        <v-divider />

        <v-expansion-panel-content>
          <ChangeDetectionFilter
            @onSearch="showFilters = undefined"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="result-container fill-height">
      <v-fade-transition hide-on-leave>
        <ChangeDetectionList
          v-show="showChangeDetections && !isLoadingDetections"
        />
      </v-fade-transition>

      <v-fade-transition hide-on-leave>
        <div v-show="isLoadingDetections">
          <template v-for="i in 4">
            <v-sheet
              :key="i"
              class="px-3"
            >
              <v-row>
                <v-col
                  v-for="j in 2"
                  :key="j"
                  cols="5"
                  class="py-4"
                >
                  <v-skeleton-loader
                    type="image"
                    width="100"
                    height="100"
                    class="mx-auto mb-4"
                  />
                  <v-skeleton-loader
                    type="text"
                    class="mb-2"
                  />
                  <v-skeleton-loader type="text" />
                </v-col>
                <v-col cols="2">
                  <div
                    class="fill-height d-flex flex-column justify-space-between"
                  >
                    <div class="py-6">
                      <v-skeleton-loader type="button" />
                    </div>
                    <div class="py-6">
                      <v-skeleton-loader type="button" />
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-sheet>
            <v-divider :key="i + '_d'" />
          </template>
        </div>
      </v-fade-transition>
    </div>
  </v-container>
</template>

<i18n>
{
    "en": {
        "title": "Change detection",
        "alt-title": "Search again"
    },
    "pt-br": {
        "title": "Change detection",
        "alt-title": "Pesquisar novamente"
    }
}
</i18n>

<script>
import { mapState, mapGetters } from 'vuex';

import ChangeDetectionFilter from '@/components/change-detection/ChangeDetectionFilter';
import ChangeDetectionList from '@/components/change-detection/ChangeDetectionList';

export default {
  name: 'ChangeDetection',

  components: {
    ChangeDetectionFilter,
    ChangeDetectionList,
  },

  data: () => ({
    showFilters: 0,
  }),

  computed: {
    ...mapState('change-detection', ['isLoadingDetections']),
    ...mapGetters('change-detection', ['showChangeDetections']),
    showFeatures: {
      get() {
        return this.$store.state['change-detection'].showFeatures;
      },
      set(value) {
        this.$store.commit('change-detection/setShowFeatures', value);
      },
    },
  },

  mounted() {
    if (this.showChangeDetections) {
      this.showFilters = undefined;
    }
  },
};
</script>

<style scoped lang="sass">
.filter-container
    position: absolute
    width: 100%

    .v-expansion-panel-header--active:before
        opacity: 0 !important

.result-container
    margin-top: 64px
    height: calc(100% - 64px)
    width: 100%
    overflow-y: auto

.fixed-expansion-header
    min-height: 64px
    box-shadow: 0px 4px 3px -3px rgba(0, 0, 0, 0.2) !important
</style>
