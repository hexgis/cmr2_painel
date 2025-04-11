<template>
  <div
    class="hero--banner"
    :style="{ backgroundImage: `url(${backgroundImage})`, 'background-size': 'cover'}"
  >
    <div
      v-if="$vuetify.breakpoint.smAndDown"
      class="d-flex justify-space-between pa-6"
    >
      <a :href="localePath('/')">
        <v-img
          max-width="180"
          :src="logo"
        />
      </a>
      <v-btn
        icon
        dark
        @click="drawer = !drawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-navigation-drawer
        v-model="drawer"
        absolute
      >
        <div
          class="d-flex flex-column justify-space-between pb-4"
          style="height: 100vh"
        >
          <v-list>
            <template v-for="route in routes">
              <v-list-group
                v-if="route.submenu"
                :key="route.title"
              >
                <template #activator>
                  <v-list-group-title style="color: #d92b3f;">
                    {{ route.title }}
                  </v-list-group-title>
                </template>
                <v-list-item
                  v-for="subroute in route.submenu"
                  :key="subroute.title"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      <a :href="localePath(subroute.route)">{{ subroute.title }}</a>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-group>

              <v-list-item
                v-else
                :key="route.title"
              >
                <a :href="localePath(route.route)">{{ route.title }}</a>
              </v-list-item>
            </template>
          </v-list>

          <div class="pa-4 d-flex flex-column justify-end">
            <ChangeLocation dark />

            <v-btn
              rounded
              class="hero--btn mt-4"
              to="/login"
            >
              <v-icon> mdi-account-key </v-icon>{{ $t('btn-restricted-area') }}
            </v-btn>
          </div>
        </div>
      </v-navigation-drawer>
    </div>
    <div class="d-flex justify-md-center align-sm-flex-start">
      <div
        v-if="$vuetify.breakpoint.mdAndUp"
        class="hero--logged-area"
      >
        <ChangeLocation />
        <v-btn
          rounded
          class="hero--btn"
          to="/login"
        >
          <v-icon> mdi-account-key </v-icon>{{ $t('btn-restricted-area') }}
        </v-btn>
      </div>
      <div class="hero--wrapper flex-column justify-md-space-between align-sm-center">
        <v-row
          v-if="$vuetify.breakpoint.mdAndUp"
          class="hero--wrapper-row d-flex pa-md-10 justify-md-space-between align-sm-center"
        >
          <a :href="localePath('/')">
            <v-img
              max-width="305"
              :src="logo"
            />
          </a>
          <div
            width="100"
            class="hero--nav-bar"
          >
            <template v-for="route in routes">
              <div
                v-if="route.submenu"
                :key="route.title"
                class="menu-with-submenu"
                @mouseover="route.showSubmenu = true"
                @mouseleave="delayedMouseLeave(route)"
              >
                <a :class="{ 'hovered': route.showSubmenu }">{{ route.title }}</a>
                <div
                  v-if="route.showSubmenu"
                  class="submenu"
                >
                  <a
                    v-for="(submenu, index) in route.submenu"
                    :key="index"
                    :href="localePath(submenu.route)"
                    class="submenu-item"
                  >
                    {{ submenu.title }}
                  </a>
                </div>
              </div>
              <a
                v-else
                :key="route.title"
                :href="localePath(route.route)"
              >{{ route.title }}</a>
            </template>
          </div>
        </v-row>
        <div class="hero--content">
          <v-row>
            <h1 :class="!heroSubtitle ? 'hero--centralized-title' : '' ">
              {{ heroTitle }}
            </h1>
          </v-row>
          <v-row>
            <p>{{ heroSubtitle }}</p>
          </v-row>
          <v-row v-if="hasCTA">
            <a :href="localePath('/terras-indigenas')">» {{ $t('btn-see-more') }}</a>
          </v-row>
        </div>
      </div>
    </div>
  </div>
</template>

<i18n>
  {
    "en": {
      "tab-project": "The Project",
      "tab-how-it-works": "How it Works",
      "tab-interactive-map": "Interactive Map",
      "tab-contact": "Contact",
      "btn-restricted-area": "Restricted Area",
      "btn-see-more": "see more",
      "submenu-project-1": "Learn About the Project",
      "submenu-project-2": "Indigenous Lands",
      "submenu-how-it-works-1": "More Information",
      "submenu-how-it-works-2": "Meet the CMR"
    },
    "pt-br": {
      "tab-project": "O Projeto",
      "tab-how-it-works": "Como Funciona",
      "tab-interactive-map": "Mapa Interativo",
      "tab-contact": "Contato",
      "btn-restricted-area": "Área Restrita",
      "btn-see-more": "saiba mais",
      "submenu-project-1": "Conheça o Projeto",
      "submenu-project-2": "Terras Indígenas",
      "submenu-how-it-works-1": "Mais Informações",
      "submenu-how-it-works-2": "Conheça o CMR"
    }
  }
  </i18n>

<script>
import ChangeLocation from '@/components/map/ChangeLocation.vue';

export default {
  name: 'HeroBanner',
  components: {
    ChangeLocation,
  },
  props: {
    heroTitle: {
      type: String,
      required: true,
    },
    heroSubtitle: {
      type: String,
    },
    backgroundImage: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: '/img/logo-inteira-antiga-branca.svg',
    },
    hasCTA: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      drawer: false,
      routes: [
        {
          title: this.$t('tab-project'),
          submenu: [
            { title: this.$t('submenu-project-1'), route: '/projeto' },
            { title: this.$t('submenu-project-2'), route: '/terras-indigenas' },
          ],
          showSubmenu: false,
        },
        {
          title: this.$t('tab-how-it-works'),
          submenu: [
            { title: this.$t('submenu-how-it-works-1'), route: '/como-funciona' },
            { title: this.$t('submenu-how-it-works-2'), route: '/video' },
          ],
          showSubmenu: false,
        },
        {
          title: this.$t('tab-interactive-map'),
          route: '/cmr',
        },
        {
          title: this.$t('tab-contact'),
          route: '/contato',
        },
      ],
    };
  },
  methods: {
    delayedMouseLeave(route) {
      if (this.mouseLeaveTimeout) {
        clearTimeout(this.mouseLeaveTimeout);
      }
      this.mouseLeaveTimeout = setTimeout(() => {
        route.showSubmenu = false;
      }, 300);
    },
  },
};
</script>

<style lang="sass" scoped>
a
  font-weight: bold
  text-decoration: none

.hero
  &--centralized-title
    font-size: 38px!important
    padding-top: 4rem

  &--logged-area
    position: absolute
    display: flex
    gap: 1rem
    right: 10%
    top: 10px

    .v-btn > .v-btn__content .v-icon
      padding-right: 0.5rem

  &--btn
    background-color: #FFCC00 !important

  &--nav-bar
    display: flex
    gap: 2rem

    a
      position: relative
      margin-bottom: 5px
      color: #FFCC00

      &:hover
        color: #f0f0f0

      &.hovered
        color: #f0f0f0
        border-bottom: 2px solid #F58A1F

.hero--logged-area
  position: absolute
  right: 10%
  top: 5px

.hero--btn
  background-color: #FFCC00 !important

.hero--nav-bar
  display: flex
  gap: 2rem

.hero--content
  max-width: 450px
  margin: 2% 6%

  h1
    color: #FFCC00
    line-height: 1.2
    font-size: 22px
    font-weight: 600

  p
    color: white
    font-size: 14px
    line-height: 22px
    padding-top: 1rem

.hero--banner
  height: 700px
  background-position: bottom

.hero--wrapper
  width: 80%

  &-row
    width: 100%
    margin: 0 2%

.menu-with-submenu
  position: relative

.submenu
  position: absolute
  top: 110%
  left: 0
  background-color: white
  width: 250px
  border: 1px solid #ccc
  border-radius: 8px
  padding: 0.5rem
  display: flex
  flex-direction: column
  border-top: 5px solid #F58A1F

  .submenu-item
    padding: 0.5rem 1rem
    color: #333
    text-decoration: none
    transition: all ease-in-out 0.5s

    &:hover
      background-color: #F58A1F
      border-radius: 8px
      color: white
</style>
