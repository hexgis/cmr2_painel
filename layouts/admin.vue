<template>
  <v-app>
    <v-main>
      <div class="admin-panel">
        <v-card
          v-if="shouldShowMenu"
          class="admin-panel--menu"
        >
          <nuxt-link :to="localePath('/admin')">
            <img
              class="admin-panel--menu-img"
              src="/img/logo-cmr.svg"
              alt="Logo CMR"
            >
          </nuxt-link>

          <nuxt-link
            v-for="tab in adminLabels"
            :key="tab.label"
            :to="localePath(tab.route)"
            class="admin-panel--menu-tabs"
            :class="{ 'selected-tab': selectedRoute === tab.route }"
            @click.native="setSelectedRoute(tab.route)"
          >
            {{ tab.label }}
          </nuxt-link>
        </v-card>

        <nuxt />
      </div>
    </v-main>
    <BaseAlert />
  </v-app>
</template>

<i18n>
{
  "pt-br": {
    "dashboard": "Visualizar Acessos",
    "manage_users": "Gerenciar Usuários",
    "restricted_access": "Acesso à Área Restrita",
    "manage_permissions": "Gerenciar Permissões",
    "manage_layers": "Gerenciar Camadas",
    "manage_documents": "Gerenciar Documentos",
    "feedback": "Críticas e Sugestões"
  },
  "en": {
    "dashboard": "View Accesses",
    "manage_users": "Manage Users",
    "restricted_access": "Restricted Area Access",
    "manage_permissions": "Manage Permissions",
    "manage_layers": "Manage Layers",
    "manage_documents": "Manage Documents",
    "feedback": "Feedback and Suggestions"
  }
}
</i18n>

<script>
import { mapState } from 'vuex';

import BaseAlert from '../components/base/BaseAlert.vue';

export default {
  name: 'App',
  components: {
    BaseAlert,
  },
  data() {
    return {
      selectedRoute: this.$route.path,
    };
  },
  head: () => ({
    title: 'CMR | Administrativo',
  }),
  computed: {
    ...mapState('userProfile', ['user']),

    showAnalysisFieldsAdmin() {
      return this.user && this.user.components && this.user.components.feedback_admin === true;
    },

    showAnalysisFieldsDev() {
      return this.user && this.user.components && this.user.components.feedback_dev === true;
    },

    isGestor() {
      return this.user && this.user.roles && this.user.roles.some((role) => role.name === 'Gestor');
    },

    isAdmin() {
      return this.user && (this.user.is_superuser || this.user.is_staff);
    },

    canAccessRestrictedArea() {
      return this.showAnalysisFieldsAdmin || this.showAnalysisFieldsDev
        || this.isGestor || this.isAdmin;
    },

    shouldShowMenu() {
      return this.user !== null;
    },

    adminLabels() {
      const allLabels = [
        { route: '/admin/criticas', label: this.$t('feedback') },
        { route: '/admin/area-restrita', label: this.$t('restricted_access') },
        { route: '/admin/camadas', label: this.$t('manage_layers') },
        { route: '/admin/permissoes', label: this.$t('manage_permissions') },
        { route: '/admin/usuarios', label: this.$t('manage_users') },
        { route: '/views-chart', label: this.$t('dashboard') },
      ];

      // Se for Administrador, mostra todos os campos
      if (this.isAdmin) {
        return allLabels;
      }

      // Se for Gestor, mostra apenas Críticas e Sugestões e Área Restrita
      if (this.isGestor) {
        return allLabels.filter((label) => label.route === '/admin/criticas'
          || label.route === '/admin/area-restrita');
      }

      if (this.user) {
        return allLabels.filter((label) => label.route === '/admin/criticas'
          || label.route === '/admin/area-restrita');
      }

      return [];
    },
  },

  watch: {
    $route(to) {
      this.selectedRoute = to.path;
    },
  },
  async mounted() {
    await this.$store.dispatch('userProfile/getUserData');
  },

  methods: {
    setSelectedRoute(route) {
      this.selectedRoute = route;
    },
  },
};
</script>

<style scoped lang="sass">
.admin-panel
  background-color: #F8F8F8
  width: 100%
  display: flex

  &--menu
    background-color: #ffffff
    width: 30%
    max-width: 300px
    min-height: 100vh
    position: relative

    &-img
      width: 100%
      display: flex
      margin: 1rem 0 2rem 1rem

    &-tabs
      display: block
      list-style: none
      text-decoration: none
      padding: 1rem
      cursor: pointer
      transition: all ease-in-out 0.5s
      color: #000000

      &:last-child
        position: absolute
        width: 100%

      &:hover,
      &.selected-tab
        background-color: #D92B3F
        color: #ffffff
</style>
