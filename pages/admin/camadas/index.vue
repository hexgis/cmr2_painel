<template>
  <div class="layers">
    <span class="d-flex align-center justify-space-between">
      <h1 class="text-uppercase pb-4">
        Gerenciar Camadas
      </h1>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            text
            v-bind="attrs"
            v-on="on"
            @click="$router.push('/')"
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
        :key="label.to"
        :props="label"
      />
    </v-col>
  </div>
</template>

<script>
import FullCard from '/components/admin/FullCard.vue';

export default {
  name: 'Gerenciar Permissões',
  components: { FullCard },
  layout: 'admin',
  data() {
    return {
      props: [
        // TODO: Enable the menus below when the features are developed
        /*   {
                    url: 'camadas/geoserver',
                    icon: 'mdi-web',
                    optionLabel: 'Geoservers',
                }, */
        {
          url: 'camadas/layers',
          icon: 'mdi-layers',
          optionLabel: 'Camadas',
        },
        /* {
                    url: 'camadas/abas',
                    icon: 'mdi-label-outline',
                    optionLabel: 'Abas',
                }, */
      ],
    };
  },
};
</script>

<style lang="sass" scoped>
.layers
  height: 100vh
  overflow-y: auto
  width: 100%
  padding: 2rem
</style>
