<template>
  <div class="layers">
    <h1 class="text-uppercase pb-4">
      Gerenciar Camadas
    </h1>
    <FullCard
      v-for="label in props"
      :key="label.to"
      :props="label"
    />
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
  width: 100%
  max-width: 800px
  padding: 1rem 1.5rem
</style>
