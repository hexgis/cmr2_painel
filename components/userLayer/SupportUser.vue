<template>
  <v-list-group>
    <template #activator>
      <v-list-item-content>
        <v-list-item-title class="text-wrap">
          <span class="text-cursor">
            {{ $t('title') }}
          </span>
        </v-list-item-title>
      </v-list-item-content>
    </template>

    <v-container class="py-0 my-0">
      <template v-if="Object.keys(supportLayerUser).length">
        <v-list expand>
          <template v-for="layer in supportLayerUser">
            <SupportUserLayers
              :key="layer.id"
              :layer="layer"
            />
          </template>
        </v-list>
      </template>
      <template v-else>
        <div class="text-layer">
          {{ $t('text-layer') }}
        </div>
      </template>
    </v-container>
    <v-divider />
  </v-list-group>
</template>

<i18n>
{
    "en": {
        "title": "User Layers",
        "text-layer":"Layers can be added to the 'User Layers' group by drawing a polygon with the drawing tool and subsequently saving it as a new layer. Alternatively, an external file can be uploaded through the 'Upload a File' option. Both functionalities are avaiable in the left sidebar menu."
    },
    "pt-br": {
        "title": "Camadas do Usuário",
        "text-layer":"Para adicionar camadas ao grupo 'Camadas do Usuário', desenhe um polígono utilizando a ferramenta de desenho e, em seguida, salve como uma nova camada. Alternativamente, é possível também carregar um arquivo externo por meio da opção 'Carregar um Arquivo'. Ambas funcionalidades estão disponíveis no menu lateral esquerdo."
    }
}
</i18n>

<script>
import { mapState, mapMutations } from 'vuex';
import SupportUserLayers from './SupportUserLayers.vue';

export default {
  name: 'SupportUser',

  components: { SupportUserLayers },

  async fetch() {
    if (!Object.keys(this.supportLayerUser).length && this.user) {
      await this.$store.dispatch('supportLayersUser/getLayersUser');
    }
  },

  computed: {
    ...mapState('supportLayersUser', ['supportLayerUser']),
    ...mapState('map', ['hasAddLayer']),
    ...mapState('userProfile', ['user']),
  },

  watch: {
    hasAddLayer: {
      deep: true,
      handler(newLayer, oldLayer) {
        if (newLayer) {
          this.getInfo();
        }
      },
    },
  },
  created() {
    this.getInfo();
  },
  methods: {
    async getInfo() {
      await this.$store.dispatch('supportLayersUser/getLayersUser');
      this.setHasLayer(false);
    },
    ...mapMutations('map', ['setHasLayer']),
  },

};
</script>

<style scoped>
.text-layer{
  font-size: 12px;
  padding: 6px;
  margin-left: 4px;
  margin-right: 6px;
  margin-bottom: 4px;
  text-align: justify;
  background: #d7dae766;
}
</style>
