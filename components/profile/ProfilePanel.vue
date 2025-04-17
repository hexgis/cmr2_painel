<template>
  <div class="bottom-buttons d-flex flex-column">
    <v-btn
      v-if="isLoggedIn"
      icon
      large
      class="mx-auto"
      @click="goToCriticisms"
    >
      <v-tooltip left>
        <template #activator="{ on: onTooltip }">
          <v-icon
            color="white"
            v-on="onTooltip"
          >
            mdi-comment-text-multiple
          </v-icon>
        </template>
        <span>{{ $t('criticisms-suggestions-tooltip') }}</span>
      </v-tooltip>
    </v-btn>

    <!-- Botão Administrador -->
    <v-btn
      v-if="userCanAccess('admin_panel')"
      icon
      large
      class="mx-2"
      @click="goToAdmin"
    >
      <v-tooltip left>
        <template #activator="{ on: onTooltip }">
          <v-icon
            color="white"
            v-on="onTooltip"
          >
            mdi-shield-account
          </v-icon>
        </template>
        <span>{{ $t('admin-panel-tooltip') }}</span>
      </v-tooltip>
    </v-btn>

    <v-menu
      v-if="isLoggedIn"
      left
      offset-x
    >
      <template #activator="{ on: onMenu }">
        <v-btn
          icon
          large
          class="mx-auto"
          v-on="onMenu"
        >
          <v-tooltip left>
            <template #activator="{ on: onTooltip }">
              <v-icon
                color="white"
                v-on="onTooltip"
              >
                mdi-account-circle
              </v-icon>
            </template>
            <span>{{ $t('profile-tooltip') }}</span>
          </v-tooltip>
        </v-btn>
      </template>
      <v-card>
        <v-card-title
          v-if="hasFirstOrLastName"
          class="username"
        >
          <v-icon dark>
            mdi-account
          </v-icon>
          <span
            v-if="!!user.first_name"
            class="pl-2"
          >
            {{ user.first_name }}
          </span>
          <span
            v-if="!!user.last_name"
            class="pl-2"
          >
            {{ user.last_name }}
          </span>
        </v-card-title>
        <v-list-item @click="goToMain()">
          <v-icon> mdi-home </v-icon>
          <span class="pl-2">
            {{ $t('home-button') }}
          </span>
        </v-list-item>
        <v-list-item @click="openSettings()">
          <v-icon> mdi-cog </v-icon>
          <span class="pl-2">
            {{ $t('preferences-button') }}
          </span>
        </v-list-item>
        <v-list-item @click="goToManual()">
          <v-icon> mdi-book-open-outline </v-icon>
          <span class="pl-2">
            {{ $t('manual-button') }}
          </span>
        </v-list-item>
        <v-list-item @click="logout()">
          <v-icon> mdi-logout </v-icon>
          <span class="pl-2">
            {{ $t('logout-button') }}
          </span>
        </v-list-item>
      </v-card>
    </v-menu>

    <!-- Botão Login -->
    <v-btn
      v-if="!isLoggedIn"
      icon
      large
      class="mx-2"
      @click="$router.push(localePath('/login'))"
    >
      <v-tooltip left>
        <template #activator="{ on: onTooltip }">
          <v-icon
            color="white"
            v-on="onTooltip"
          >
            mdi-account-circle
          </v-icon>
        </template>
        <span>{{ $t('login-button') }}</span>
      </v-tooltip>
    </v-btn>

    <ProfilePanelSettings
      v-if="settingsOpened"
      @onDialogClose="settingsOpened = false"
    />
  </div>
</template>

<i18n>

{
  "en": {
    "criticisms-suggestions-tooltip": "Criticisms and suggestions",
    "profile-tooltip": "Profile",
    "preferences-button": "Preferences",
    "logout-button": "Log out",
    "home-button": "Home",
    "admin-panel-tooltip": "Admin Panel",
    "login-button": "Log In",
    "manual-button": "Manual"
  },
  "pt-br": {
    "criticisms-suggestions-tooltip":"Criticas e sugestões",
    "profile-tooltip": "Perfil",
    "preferences-button": "Preferências",
    "logout-button": "Sair",
    "home-button": "Início",
    "admin-panel-tooltip": "Painel do Administrador",
    "login-button": "Login",
    "manual-button": "Manual"
  }
}
</i18n>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

import ProfilePanelSettings from '@/components/profile/ProfilePanelSettings';

export default {
  name: 'ProfileButtons',

  components: {
    ProfilePanelSettings,
  },

  model: {
    prop: 'settings',
    event: 'update',
  },

  props: {
    settings: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    settingsOpened: false,
    hasAnalytics: process.env.ANALYTICS === 'true',
  }),

  watch: {
    settings(value) {
      this.settingsOpened = value;
    },

    settingsOpened(value) {
      this.$emit('update', value);
    },
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

    goToAdmin() {
      this.$router.push(this.localePath('/admin'));
    },

    openSettings() {
      this.settingsOpened = true;
    },

    goToMain() {
      this.$router.replace(this.localePath('/'));
    },

    async goToManual() {
      window.location.href = `${process.env.API_URL}adm-panel/manual/`;
    },

    goToCriticisms() {
      window.location.href = this.localePath('/admin/criticas');
    },

    ...mapActions('auth', ['logout']),
  },

  computed: {
    hasFirstOrLastName() {
      return this.user && (this.user.first_name || this.user.last_name);
    },
    ...mapState('userProfile', ['user']),
    ...mapGetters('auth', ['isLoggedIn']),
  },
};
</script>

<style lang="sass">
.bottom-buttons
  position: absolute
  display: flex
  width: 100%
  bottom: 0
  padding: 3px 0

.username
  pointer-events: none
  padding: 12px
  font-size: 1.1em
  background: black
  color: whitesmoke
</style>
