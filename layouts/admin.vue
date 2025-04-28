<template>
  <v-app>
    <v-main>
      <div class="admin-panel"
>

        <v-card class="admin-panel--menu"
  v-if="showAnalysisFieldsAdmin || showAnalysisFieldsDev"

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
    "restricted_access": "Conceder acesso à Área Restrita",
    "manage_permissions": "Gerenciar Permissões",
    "manage_layers": "Gerenciar Camadas",
    "manage_documents": "Gerenciar Documentos",
    "feedback": "Críticas e Sugestões"
  },
  "en": {
    "dashboard": "View Accesses",
    "manage_users": "Manage Users",
    "restricted_access": "Grant Access to Restricted Area",
    "manage_permissions": "Manage Permissions",
    "manage_layers": "Manage Layers",
    "manage_documents": "Manage Documents",
    "feedback": "Feedback and Suggestions"
  }
}
</i18n>

<script>
import { mapState } from 'vuex';
import BaseAlert from '@/components/base/BaseAlert';
export default {
  name: 'App',
  components: {
    BaseAlert,
  },
  
  data() {
    return {
      adminLabels: [
        { route: '/admin/criticas', label: this.$t('feedback') },
        { route: '/admin/area-restrita', label: this.$t('restricted_access') },
        { route: '/admin/camadas', label: this.$t('manage_layers') },
        { route: '/admin/permissoes', label: this.$t('manage_permissions') },
        { route: '/admin/usuarios', label: this.$t('manage_users') },
        { route: '/views-chart', label: this.$t('dashboard') },
      ],
      selectedRoute: this.$route.path,
    };
  },
  head: () => ({
    title: 'CMR | Administrativo',
  }),
  computed: {
        ...mapState('userProfile', ['user']),

        showAnalysisFieldsAdmin() {
            return this.user?.components?.feedback_admin === true
        },

        showAnalysisFieldsDev() {
            return this.user?.components?.feedback_dev === true
        },
      },

  watch: {
    $route(to) {
      this.selectedRoute = to.path;
    },
  },
  async mounted() {
    await this.$store.dispatch('userProfile/getUserData')
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
