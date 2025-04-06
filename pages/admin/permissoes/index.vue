<template>
  <div class="permissions">
    <span class="d-flex align-center justify-space-between">
      <h1 class="text-uppercase pb-4">
        Gerenciar Permissões
      </h1>
      <v-btn
        color="primary"
        text
        @click="$router.push('/')"
      >
        <v-icon color="primary">mdi-home</v-icon>
      </v-btn>
    </span>
    <v-col cols="4">
      <FullCard
        v-for="label in props"
        :key="label.url"
        :props="label"
      />
    </v-col>
  </div>
</template>

<script>
import FullCard from '/components/admin/FullCard.vue';

export default {
  name: 'GerenciarPermissoes',
  components: { FullCard },
  layout: 'admin',
  data() {
    return {
      props: [
        {
          url: 'permissoes/grupos/',
          icon: 'mdi-group',
          optionLabel: 'Grupos',
        },
        {
          url: 'permissoes/instituicoes/',
          icon: 'mdi-office-building',
          optionLabel: 'Instituições',
        },
        // {
        //   url: 'permissoes/fpe/',
        //   icon: 'mdi-tree',
        //   optionLabel: 'FPE - Frente de Proteção Etnoambiental',
        // },
      ],
    };
  },
};
</script>

<style lang="sass" scoped>
.permissions
  height: 100vh
  overflow-y: auto
  width: 100%
  padding: 2rem
</style>
