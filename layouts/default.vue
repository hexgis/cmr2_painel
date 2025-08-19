<template>
  <v-app>
    <v-snackbar
      v-if="hasFirstOrLastName"
      v-model="snackbar"
      :timeout="timeout"
    >
      <span>
        {{
          `${$t('welcome')}${
            !!user.first_name ? ` ${user.first_name}` : ''
          }${!!user.last_name ? ` ${user.last_name}` : ''}!`
        }}
      </span>
      <template #action="{ attrs }">
        <v-btn
          v-bind="attrs"
          text
          @click="snackbar = false"
        >
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar
      v-else
      v-model="snackbar"
      :timeout="timeout"
    >
      {{ $t('no-expected') }}
      <template #action="{ attrs }">
        <v-btn
          v-bind="attrs"
          text
          @click="snackbar = false"
        >
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Privacy Agreement Modal -->
    <PrivacyAgreementModal
      v-model="showPrivacyAgreementModal"
      @accepted="onPrivacyAgreementAccepted"
      @rejected="onPrivacyAgreementRejected"
    />

    <div>
      <v-btn
        ripple
        class="right-drawer-btn maior"
        :class="{ 'drawer-btn-opened': layerDrawer }"
        color="secondary"
        @click.stop="layerDrawer ? closeDrawer() : openDrawer()"
      >
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">
              {{
                layerDrawer
                  ? 'mdi-chevron-right'
                  : 'mdi-chevron-left'
              }}
            </v-icon>
          </template>
          <span> {{ $t('tooltip') }} </span>
        </v-tooltip>
      </v-btn>
      <v-overlay :value="showTableDialog" />
      <v-navigation-drawer
        v-model="layerDrawer"
        absolute
        right
        clipped
        app
        disable-resize-watcher
        class="elevation-4 navigation-drawer"
        stateless
        @input="changeControlsStyle()"
      >
        <nuxt />
      </v-navigation-drawer>
    </div>
    <div v-if="$store.state.priority.visualizationStage == 'map'">
      <v-main class="pa-0">
        <Map
          @mapCreated="
            getLeafletControlRef()
            changeControlsStyle()
          "
        />
      </v-main>
    </div>
    <div v-if="$store.state.priority.visualizationStage == 'chart'">
      <v-main class="pa-0">
        <AnalyticsPCDashboard />
      </v-main>
    </div>
    <BaseAlert />
  </v-app>
</template>

<i18n>
{
  "en": {
      "tooltip": "Search menu",
      "no-expected": "Welcome!",
      "welcome": "Welcome,"
  },
  "pt-br": {
      "tooltip": "Search menu",
      "no-expected": "Bem vindo!",
      "welcome": "Bem vindo,"
  }
}
</i18n>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import Map from '@/components/map/Map';
import BaseAlert from '@/components/base/BaseAlert';
import AnalyticsPCDashboard from '@/components/analytical-cmr/AnalyticsPriorConsolidDashboard';
import PrivacyAgreementModal from '@/components/privacy-agreement/PrivacyAgreementModal';

export default {
  name: 'App',

  components: {
    Map,
    BaseAlert,
    AnalyticsPCDashboard,
    PrivacyAgreementModal,
  },

  data: () => ({
    leafletRightControl: null,
    snackbar: true,
    timeout: 3000,
    windowWidth: 0,
    showPrivacyAgreementModal: false,
    privacyAgreementChecked: false,
  }),

  async fetch() {
    if (this.isLoggedIn && !this.$store.state.userProfile.user) {
      await this.$store.dispatch('userProfile/getUserData');
    }
    await this.$store.dispatch('map/getGeoserverConfig');
  },

  head: () => ({
    title: 'CMR',
  }),

  computed: {
    layerDrawer: {
      get() {
        return this.showDrawer;
      },
      set(val) {
        return val;
      },
    },

    hasFirstOrLastName() {
      return this.user && (this.user.first_name || this.user.last_name);
    },

    isCheckingPrivacyAgreement() {
      return this.$store.state.privacyAgreement && this.$store.state.privacyAgreement.isChecking;
    },

    ...mapState('userProfile', ['user', 'showDrawer']),
    ...mapState('priority', ['visualizationStage']),
    ...mapState('monitoring', ['visualizationStageMonitoring']),
    ...mapState('tableDialog', ['showTableDialog']),
    ...mapGetters('auth', ['isLoggedIn']),
  },

  watch: {
    // verify term only when the user logs in (not on every change)
    isLoggedIn(newVal, oldVal) {
      if (newVal && !oldVal) {
        this.privacyAgreementChecked = false;
        this.checkPrivacyAgreement();
      } else if (!newVal && oldVal) {
        this.$store.dispatch('privacyAgreement/reset');
        this.showPrivacyAgreementModal = false;
        this.privacyAgreementChecked = false;
      }
    },

    windowWidth() {
      if (window.innerWidth > 768) {
        this.windowWidth = window.innerWidth;
      } else {
        this.windowWidth = window.innerWidth;
      }
    },
  },

  async created() {
    this.$store.dispatch('supportLayers/getCategoryGroupsBase');

    if (this.isLoggedIn) {
      const needsCheck = this.$store.getters['privacyAgreement/needsCheck'];
      if (needsCheck) {
        await this.checkPrivacyAgreement();
      } else {
        console.log('Termo já verificado recentemente, pulando...');
      }
    }
  },

  mounted() {
    window.addEventListener('resize', this.updateWindowWidth);
    this.updateWindowWidth();

    this.$nextTick(() => {
      this.getLeafletControlRef();

      if (
        window.innerWidth > 768
                && this.user
                && this.user.settings.drawer_open_on_init
      ) {
        this.openDrawer();
      }
    });
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateWindowWidth);
  },

  methods: {
    ...mapMutations('userProfile', ['openDrawer', 'closeDrawer']),

    async checkPrivacyAgreement() {
      if (!this.isLoggedIn) {
        return;
      }

      if (this.privacyAgreementChecked) {
        console.log('Privacy agreement already checked in this session, skipping...');
        return;
      }

      const needsCheck = this.$store.getters['privacyAgreement/needsCheck'];

      if (!needsCheck) {
        console.log('Privacy agreement recently verified in store, skipping verification');
        this.privacyAgreementChecked = true;
        return;
      }

      try {
        console.log('Checking privacy agreement status...');
        this.privacyAgreementChecked = true;

        const hasAccepted = await this.$store.dispatch('privacyAgreement/checkStatus');

        if (!hasAccepted) {
          this.showPrivacyAgreementModal = true;
        }
      } catch (error) {
        console.error('Error checking privacy agreement:', error);
        if (this.$store.state.privacyAgreement.hasAccepted === null) {
          this.showPrivacyAgreementModal = true;
        }
      }
    },

    onPrivacyAgreementAccepted() {
      this.showPrivacyAgreementModal = false;
      this.$store.dispatch('privacyAgreement/markAsAccepted');
    },

    onPrivacyAgreementRejected() {
      this.showPrivacyAgreementModal = false;
      this.$store.dispatch('privacyAgreement/markAsRejected');
    },

    getLeafletControlRef() {
      this.leafletRightControl = document.getElementsByClassName('leaflet-right');
    },

    changeControlsStyle() {
      if (this.showDrawer && this.leafletRightControl) {
        Array.from(this.leafletRightControl).forEach((element) => {
          element.classList.add('leaflet-right-drawer--offset');
        });
      } else if (!this.showDrawer && this.leafletRightControl) {
        Array.from(this.leafletRightControl).forEach((element) => {
          element.classList.remove('leaflet-right-drawer--offset');
        });
      }
    },
    updateWindowWidth() {
      this.windowWidth = window.innerWidth;
    },
  },
};
</script>

<style lang="sass">
html,
body,
.map-container
  height: 100vh
  width: 100vw
  overflow: hidden !important
  padding: 0

.leaflet-pane
  z-index: 2 !important

.leaflet-bottom
  z-index: 3 !important

.leaflet-popup-pane
  z-index: 10000 !important

.leaflet-overlay-pane
  z-index: 900 !important

.leaflet-marker-pane
  z-index: 901 !important

.leaflet-left,
.leaflet-right,
.leaflet-top
  z-index: 3 !important

.leaflet-right
  transition: right .2s
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)

.leaflet-right-drawer--offset
  right: 420px!important

.tab-header
  width: 100%
  min-height: 64px
  display: flex
  align-items: center
  font-size: .9375rem
  padding: 16px 24px
  border-bottom: solid 1px rgba(0,0,0,.2)
  box-shadow: 0px 3px 3px -3px rgba(0, 0, 0, 0.2) !important

.list-separator:not(:first-child)
  border-top: solid 1px rgba(0,0,0,.12)
</style>

<style scoped lang="sass">
.navigation-drawer
  z-index: 5 !important

.vertical-divider
  height: 40px
  min-height: 0
  margin: 8px -14px 0px 24px

.right-drawer-btn
  padding: 0 !important
  width: 34px !important
  min-width: 34px !important
  height: 64px !important
  position: absolute
  border-radius: 0
  top: 0
  z-index: 4
  right: 0px
  transition: right .2s
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)

.navigation-drawer
  width: 420px !important

.drawer-btn-opened
  right: 420px

@media (max-width: 768px)

  .navigation-drawer
    width: 300px !important

  .drawer-btn-opened
    right: 300px
</style>
