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

    <!-- Botão Área Restrita -->
    <div
      v-if="isLoggedIn"
      style="position: relative; display: inline-block;"
    >
      <v-btn
        icon
        large
        class="mx-2"
        @click="goToRestrictedArea"
      >
        <v-tooltip left>
          <template #activator="{ on: onTooltip }">
            <v-icon
              color="white"
              v-on="onTooltip"
            >
              mdi-key
            </v-icon>
          </template>
          <span>{{ $t('restricted-area-tooltip') }}</span>
        </v-tooltip>
      </v-btn>

      <!-- Badge com contador de solicitações pendentes -->
      <span
        v-if="pendingRequestsCount > 0"
        class="pending-count-badge"
      >
        {{ pendingRequestsCount }}
      </span>
    </div>

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
    "restricted-area-tooltip": "Restricted Area",
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
    "restricted-area-tooltip": "Área Restrita",
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
    pendingRequestsCount: 0,
  }),

  watch: {
    settings(value) {
      this.settingsOpened = value;
    },

    settingsOpened(value) {
      this.$emit('update', value);
    },
  },

  async mounted() {
    if (this.isLoggedIn && this.user) {
      await this.fetchPendingRequestsCount();
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

    goToAdmin() {
      this.$router.push(this.localePath('/admin'));
    },

    goToRestrictedArea() {
      this.$router.push(this.localePath('/admin/area-restrita'));
    },

    openSettings() {
      this.settingsOpened = true;
    },

    async fetchPendingRequestsCount() {
      try {

        if (!this.user) {
          console.log('Usuário não encontrado');
          this.pendingRequestsCount = 0;
          return;
        }

        const url = `/user/restricted-access/pending-count/`;
        console.log('URL da requisição:', url);

        const response = await this.$axios.get(url);
        console.log('Resposta da API:', response.data);

        this.pendingRequestsCount = response.data.count || 0;
        console.log('Contador atualizado para:', this.pendingRequestsCount);
      } catch (error) {
        console.error('Erro ao buscar contador de solicitações pendentes:', error);
        this.pendingRequestsCount = 0;
      }
    },

    async goToMain() {
      await this.fetchPendingRequestsCount();
      this.$router.replace(this.localePath('/'));
    },

    async goToManual() {
      window.location.href = `${process.env.API_URL}adm-panel/manual/`;
    },

    goToCriticisms() {
      this.$router.push(this.localePath('/admin/criticas'));
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

.pending-count-badge
  position: absolute
  top: -5px
  right: -5px
  background: #ff1744 !important
  color: white !important
  border-radius: 50%
  padding: 4px 8px
  font-size: 0.8rem
  font-weight: bold
  min-width: 20px
  height: 20px
  display: flex !important
  align-items: center
  justify-content: center
  z-index: 1000
  box-shadow: 0 2px 8px rgba(0,0,0,0.5)
  border: 2px solid white

.username
  pointer-events: none
  padding: 12px
  font-size: 1.1em
  background: black
  color: whitesmoke
</style>
