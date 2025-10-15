<template>
  <div class="permissions">
    <span class="d-flex align-center justify-space-between">
      <h1 class="text-uppercase pb-4">
        Gerenciar Permissões
      </h1>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            color="primary"
            text
            v-bind="attrs"
            v-on="on"
            @click="$router.push('/cmr')"
          >
            <v-icon color="primary">mdi-home</v-icon>
          </v-btn>
        </template>
        <span>Ir para o CMR</span>
      </v-tooltip>
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
        // {
        //   url: 'permissoes/grupos/',
        //   icon: 'mdi-group',
        //   optionLabel: 'Grupos',
        // },
        {
          url: 'permissoes/roles/',
          icon: 'mdi-account-cog',
          optionLabel: 'Perfil',
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
