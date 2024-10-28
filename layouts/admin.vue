<template>
  <v-app>
    <v-main>
      <div class="admin-panel">
        <v-card class="admin-panel--menu">
          <nuxt-link :to="localePath('/admin')">
            <img class="admin-panel--menu-img" src="\img\logo-cmr.svg" alt="Logo CMR">
          </nuxt-link>
          <div
            class="admin-panel--menu-tabs"
            v-for="tab in adminLabels"
            :key="tab.label"
            :class="{ 'selected-tab': selectedRoute === tab.route }"
          >
            <nuxt-link :to="localePath(tab.route)" @click="setSelectedRoute(tab.route)">
              {{ tab.label }}
            </nuxt-link>
          </div>
        </v-card>
        <nuxt />
      </div>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      adminLabels: [
        { route: '/dashboard', label: 'Visualizar Acessos' },
        { route: '/admin/usuarios', label: 'Gerenciar Usuários' },
        { route: '/admin/area-restrita', label: 'Conceder acesso à Área Restrita' },
        { route: '/admin/permissoes', label: 'Gerenciar Permissões' },
        { route: '/admin/camadas', label: 'Gerenciar Camadas' },
        { route: '/admin/documentos', label: 'Gerenciar Documentos' },
        { route: '/mapoteca', label: 'Mapoteca' },
        { route: '/admin/criticas', label: 'Críticas e Sugestões' },
      ],
      selectedRoute: this.$route.path,
    };
  },
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
  head: () => ({
    title: 'CMR | Administrativo',
  }),
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
    padding-left: 1rem
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
        width: 95%

      &:hover,
      &.selected-tab
        background-color: #D92B3F

        a
          color: #ffffff
</style>
