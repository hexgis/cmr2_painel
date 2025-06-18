<template>
  <v-tabs
    v-model="activeTab"
    vertical
    optional
    background-color="primary"
    class="right-tabs fill-height"
  >
    <v-tab
      v-for="(tab, i) in tabs"
      :key="i"
      :to="localePath(tab.route)"
      nuxt
      :disabled="showTableDialog"
    >
      <v-tooltip
        left
        color="grey darken-4"
      >
        <template #activator="{ on }">
          <v-icon
            class="tab-icon"
            v-on="on"
          >
            {{ tab.icon }}
          </v-icon>
        </template>
        <span>{{ tab.name }}</span>
      </v-tooltip>
    </v-tab>

    <v-tab-item
      :transition="false"
      :reverse-transition="false"
    >
      <div
        id="img-wrapper"
        class="d-flex justify-center"
      >
        <v-img
          contain
          :src="logo_funai"
        />
      </div>
      <nuxt-child keep-alive />

      <div
        v-if="isBaseRoute"
        class="info d-flex flex-column align-content-space-between"
        style="height: 90%;"
      >
        <v-list class="pt-0">
          <v-list-item
            v-for="(tab, i) in tabs"
            :key="i"
            :to="localePath(tab.route)"
          >
            <v-list-item-title class="text-right">
              {{ tab.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </v-tab-item>

    <!-- <div class="flex-grow-1 flex-shrink-1" /> -->
    <ProfilePanel
      v-model="settings"
      class="mb-2"
    />
  </v-tabs>
</template>

<i18n>
{
  "en": {
    "analytics-tab": "Analytics",
    "catalog-tab": "My Image Database",
    "search-tab": "Monitoring",
    "layers-tab": "Layers",
    "high-resolution-mosaics-tab": "High Resolution and Mosaics",
    "support-fire-tab": "Fire Hazard and Hot Spots (INPE)",
    "landuse-tab": "Land Use And Occupation",
    "inpe-tab": "INPE",
    "urgent-alerts-tab": "Urgent Alerts",
    "priority-tab": "Priorities",
    "document-tab": "Document",
    "mapoteca-tab": "Map Library",
    "deter-tab": "Deter",
    "logs-tab": "Graphics View"
  },
  "pt-br": {
    "analytics-tab": "Analítico",
    "catalog-tab": "Meu acervo de imagens",
    "search-tab": "Monitoramento Diário",
    "layers-tab": "Camadas de Sobreposição",
    "high-resolution-mosaics-tab": "Alta Resolução e Mosaicos",
    "support-fire-tab": "Risco de Fogo e Focos de Calor (INPE)",
    "landuse-tab": "Uso e Ocupação do Solo",
    "inpe-tab": "INPE",
    "urgent-alerts-tab": "Alerta Urgente",
    "priority-tab": "Polígonos Prioritários",
    "document-tab": "Documental",
    "mapoteca-tab": "Mapoteca",
    "deter-tab": "Deter",
    "logs-tab": "Gráficos de Acesso"
  }
}
</i18n>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import ProfilePanel from '@/components/profile/ProfilePanel';

export default {
  name: 'MapLayersPanel',

  components: { ProfilePanel },

  data() {
    return {
      logo_funai: process.env.DEFAULT_LOGO_IMAGE_CMR,
      activeTab: 0,
      compareTabIndex: null,
      settings: false,
    };
  },

  computed: {
    isBaseRoute() {
      return this.getRouteBaseName() === 'cmr';
    },
    allTabs() {
      /*
        TODO: Commented modules will be added post-launch cmr2

        {
          name: this.$t('priority-tab'),
          icon: 'mdi-map-marker-alert',
          route: '/priority',
          show: process.env.ROUTE_PRIORITY === 'true',
        },
        {
          name: this.$t('document-tab'),
          icon: 'mdi-file-document',
          route: '/document',
          show: process.env.ROUTE_DOCUMENT === 'true',
        },
        {
          name: this.$t('deter-tab'),
          icon: 'mdi-leaf',
          route: '/deter',
          show: process.env.ROUTE_DETER === 'true',
        },

           {
          name: this.$t('catalog-tab'),
          icon: 'mdi-folder-multiple-image',
          route: '/catalog',
          show: process.env.ROUTE_CATALOG === 'true',
        },

        */

      return [
        {
          name: this.$t('layers-tab'),
          icon: 'mdi-layers',
          route: '/cmr/support',
          requiredLogin: false,
          show: process.env.ROUTE_SUPPORT === 'true',
        },

        {
          name: this.$t('search-tab'),
          icon: 'mdi-map-search',
          route: '/cmr/monitoring',
          requiredLogin: true,
          show: process.env.ROUTE_MONITORING === 'true',
          componentKey: 'monitoring',
        },
        {
          name: this.$t('high-resolution-mosaics-tab'),
          icon: 'mdi-book-open-page-variant',
          route: '/cmr/support-raster',
          requiredLogin: true,
          show: process.env.ROUTE_SUPPORT_RASTER === 'true',
          componentKey: 'layers_mosaics',
        },

        {
          name: this.$t('landuse-tab'),
          icon: 'mdi-sprout',
          route: '/cmr/land-use',
          requiredLogin: true,
          show: process.env.ROUTE_LAND_USE === 'true',
          componentKey: 'land_use',
        },
        {
          name: this.$t('mapoteca-tab'),
          icon: 'mdi-dresser',
          route: '/cmr/mapoteca',
          requiredLogin: true,
          show: process.env.ROUTE_MAPOTECA === 'true',
          componentKey: null,
        },
        {
          name: this.$t('inpe-tab'),
          icon: 'mdi-satellite-variant',
          route: '/cmr/inpe',
          requiredLogin: true,
          show: process.env.ROUTE_SUPPORT_PRODES === 'true',
        },
        {
          name: this.$t('analytics-tab'),
          icon: 'mdi-chart-box-outline',
          route: '/cmr/statistics',
          requiredLogin: true,
          show: process.env.ROUTE_ANALYTICS === 'true',
          componentKey: 'analytics',
        },


      ];
    },
    tabs() {
      return this.allTabs.filter((tab) => (tab.show
      && (!tab.requiredLogin || this.isLoggedIn)
      && this.userCanAccess(tab.componentKey)
      ));
    },
    ...mapState('catalog', ['isComparing']),
    ...mapState('tableDialog', ['showTableDialog']),
    ...mapState('userProfile', ['user']),
    ...mapGetters('auth', ['isLoggedIn']),
  },

  watch: {
    isComparing: 'handleCompareTab',
  },

  created() {
    if (process.env.IMAGERY === 'false') {
      this.tabs.splice(1, 1);
    }
    this.handleCompareTab();
    if (this.$route.path === '/statistics') {
      this.settings = true;
    }
  },

  methods: {
    userCanAccess(componentKey) {
      if (this.user?.is_superuser || this.user?.is_staff) {
        return true;
      }
      if (!componentKey) {
        return true;
      }
      return this.user?.components?.[componentKey] === true;
    },
    handleCompareTab() {

      if (this.isComparing) {
        this.tabs.push({
          name: this.$t('compare-tab'),
          icon: 'mdi-compare',
          route: '/catalog/comparator',
        });
        this.compareTabIndex = this.tabs.length - 1;
        this.$router.push(this.localePath('/catalog/comparator'));
      } else if (this.compareTabIndex !== null) {
        this.tabs.splice(this.compareTabIndex, 1);
        this.compareTabIndex = null;
      }
    },
    closeRightDrawer() {
      this.closeDrawer();
    },
    ...mapMutations('userProfile', ['closeDrawer']),
  },
};
</script>

<style lang="sass">
  .tab-icon
    padding-top: 4px
    color: white !important
    font-size: 180% !important

  .right-tabs
    flex-direction: row-reverse
    position: relative
    min-height: 350px

    > .v-slide-group > .v-slide-group__wrapper > .v-slide-group__content
      min-height: 350px
      > .v-tab
        min-width: 0px

    > .v-tabs-slider-wrapper
      left: 52px !important

    > .v-window, > .v-window > .v-window__container > .v-window-item
      overflow-y: auto
      height: 100%
      display: block !important
      margin-bottom: 50px

  .scroll-y-transition-enter-active,
  .scroll-y-transition-leave-active
    transition: 0.15s cubic-bezier(0.25, 0.8, 0.5, 1) !important

  .back-mobile-button
    min-width: 0 !important
    display: block
    border-radius: none
    box-shadow: none
    height: 64px !important
    background-color: transparent !important
    color: white !important

  .v-dialog > .v-card > .v-card__title
    background: #DA2A3F
    color: whitesmoke
    padding: 8px 16px

    > .v-btn--icon
      color: whitesmoke

  #img-wrapper
    position: absolute
    bottom: 0
    width: 100%
    height: 50px
    background: #F5F5F5
    padding: 5px 0

  @media (max-width: 768px)
    .v-list-item__title
      font-size: 0.9rem !important

    .tab-icon
      padding-top: 4px
      color: white !important
      font-size: 150% !important

  @media (max-height: 620px)
    .v-list-item
      min-height: 42px

    .v-tabs--vertical > .v-tabs-bar .v-tab
      height: 42px

</style>
