<template>
  <v-app>
    <v-main>
      <div class="admin-panel">
        <v-card class="admin-panel--menu">
          <nuxt-link :to="localePath('/admin')">
            <img
              class="admin-panel--menu-img"
              src="\img\logo-cmr.svg"
              alt="Logo CMR"
            >
          </nuxt-link>
          <div
            v-for="tab in adminLabels"
            :key="tab.label"
            class="admin-panel--menu-tabs"
            :class="{ 'selected-tab': selectedRoute === tab.route }"
          >
            <nuxt-link
              :to="localePath(tab.route)"
              @click="setSelectedRoute(tab.route)"
            >
              {{ tab.label }}
            </nuxt-link>
          </div>
        </v-card>
        <nuxt />
      </div>
    </v-main>
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
export default {
  name: 'App',
  data() {
    return {
      // TODO: Menu when document functionality is implemented
      // { route: '/admin/documentos', label: this.$t('manage_documents') },
      adminLabels: [
        { route: '/views-chart', label: this.$t('dashboard') },
        { route: '/admin/usuarios', label: this.$t('manage_users') },
        { route: '/admin/area-restrita', label: this.$t('restricted_access') },
        { route: '/admin/permissoes', label: this.$t('manage_permissions') },
        { route: '/admin/camadas', label: this.$t('manage_layers') },
        { route: '/admin/criticas', label: this.$t('feedback') },
      ],
      selectedRoute: this.$route.path,
    };
  },
  head: () => ({
    title: 'CMR | Administrativo',
  }),
  watch: {
    $route(to) {
      this.selectedRoute = to.path;
    },
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
    border-radius: 0 1.5rem 1.5rem 0

    &-img
      width: 100%
      display: flex
      margin: 1rem 0 2rem 1rem

      img
        max-width: 200px

    &-tabs
      list-style: none
      text-decoration: none
      padding: 1rem
      cursor: pointer
      transition: all ease-in-out 0.5s

      a
        text-decoration: none
        color: #000000
        padding: 1rem 0

      &:last-child
        position: absolute
        bottom: 0
        width: 100%

      &:hover,
      &.selected-tab
        background-color: #D92B3F

        a
          color: #ffffff
</style>
