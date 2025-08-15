<template>
  <div v-if="loading">
    <v-skeleton-loader
      v-for="i in 3"
      :key="i"
      class="pa-2 mt-0 pt-0"
      type="text"
    />
  </div>
  <div
    v-else
    class="pb-6"
  >
    <div
      v-for="category of layer.sublayers"
      :key="category.name"
      class="mt-n5"
    >
      <v-row class="mb-n12 mr-2 ml-1">
        <v-col
          class="d-flex align-center justify-end"
          cols="3"
        >
          <v-card
            outlined
            color="transparent"
            class="my-card d-flex"
          >
            <v-img
              :src="category.image"
              style="max-width: 100%; max-height: 100%"
              contain
            />
          </v-card>
        </v-col>

        <v-col
          class="d-flex align-center justify-start sub-layer-title"
          cols="6"
        >
          <v-col cols="12">
            <v-row class="d-flex align-center justify-space-between">
              <v-col
                class="pa-0"
                cols="10"
              >
                <span>{{ category.label }}</span>
              </v-col>
              <v-col
                class="d-flex justify-end pa-0"
                cols="2"
              >
                <v-tooltip
                  bottom
                  color="grey darken-4"
                  content-class="custom-tooltip"
                >
                  <template #activator="{ on, attrs }">
                    <v-icon
                      v-bind="attrs"
                      v-on="on"
                    >
                      mdi-information
                    </v-icon>
                  </template>
                  <span>{{ category.tooltip }}</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-col>
        </v-col>
        <v-col
          cols="3"
          class="d-flex justify-start"
        >
          <v-switch
            :input-value="category.visible"
            @change="setCql(category.name)"
          />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<i18n>
{
    "en": {
        "legend": "legends"
    },
    "pt-br": {
        "legend": "legendas"
    }
}
</i18n>

<script>
import { mapMutations } from 'vuex';

export default {
  props: {
    layer: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    value: true,
    img: null,
    loading: false,
    descriptions: {
      declarada: 'Fase em que o processo é submetido à apreciação do Ministro da Justiça, que decidirá sobre o tema e, caso entenda cabível, declarará os limites e determinará a a demarcação física da referida área objeto do procedimento demarcatório, mediante Portaria publicada no Diário Oficial da União.',
      restricao_uso: 'Área com restrição de uso por proteção ambiental.',
      regularizada: 'Áreas que se encontram em procedimento administrativo de constituição de reserva (compra direta, desapropriação ou doação) já finalizado e a área registrada em cartório imobiliário em nome da União, com usufruto indígena.',
      encaminhada_ri: 'Áreas que se encontram em procedimento administrativo de constituição de reserva (compra direta, desapropriação ou doação) ainda não finalizado.',
      homologada: 'Fase em que há a publicação dos limites materializados e georreferenciados da área, através de Decreto Presidencial, passando a ser constituída como terra indígena.',
      delimitada: 'Fase na qual há a conclusão dos estudos e que estes foram aprovados pela Presidência da Funai através de publicação no Diário Oficial da União e do Estado em que se localiza o objeto sob processo de demarcação.',
    },
  }),

  mounted() {
    this.getCategory();
  },

  methods: {
    setCql(category) {
      this.setCqlLayer({
        id: this.layer.id,
        category,
      });
    },

    async getCategory() {
      try {
        this.loading = true;
        const legendData = await this.fetchLegendData();

        if (this.hasValidLegend(legendData)) {
          const sublayers = this.processLegendRules(legendData.Legend[0].rules);
          this.updateLayerWithSublayers(sublayers);
        }
      } catch (error) {
        this.handleLegendError(error);
      } finally {
        this.loading = false;
      }
    },

    async fetchLegendData() {
      const url = `${this.layer.wms.geoserver.wms_url}&service=WMS&version=1.1.0&request=GetLegendGraphic&layer=${this.layer.wms.geoserver_layer_namespace}:${this.layer.wms.geoserver_layer_name}&format=application/json`;
      const response = await this.$axios.get(url);
      return response.data;
    },

    hasValidLegend(data) {
      return data.Legend?.[0]?.rules?.length > 1;
    },

    processLegendRules(rules) {
      const sublayers = {};

      rules.forEach((rule, index) => {
        if (!rule.filter || (!rule.name && !rule.title)) return;

        const sublayer = this.createSublayerFromRule(rule, index);
        sublayers[`field${index}`] = sublayer;
      });

      return sublayers;
    },

    createSublayerFromRule(rule, index) {
      const cql = rule.filter.slice(1, -1);
      const rawName = rule.name || rule.title || '';
      const geomType = Object.keys(rule.symbolizers[0])[0];

      return {
        name: rawName,
        label: this.capitalizeFirstLetter(rawName.toLowerCase()),
        visible: rawName === '2km', // Ativa apenas o 2km
        image: this.getSublayerImage(rule.symbolizers, geomType),
        cql,
        tooltip: this.getSublayerTooltip(rawName)
      };
    },

    getSublayerImage(symbolizers, geomType) {
      const isPointIcon = this.layer.wms.wms_layer_type === 'Point-Icon' && geomType !== 'Polygon';
      return isPointIcon
        ? this.getImg(symbolizers)
        : this.createImg(symbolizers);
    },

    getSublayerTooltip(rawName) {
      const key = rawName.toLowerCase().replace(/\s/g, '_');
      return this.descriptions[key] || 'Sem dados/descrição disponível.';
    },

    updateLayerWithSublayers(sublayers) {
      // Encontra o CQL do sublayer '2km'
      const activeCql = Object.values(sublayers).find(s => s.name === '2km')?.cql || '';

      this.setSublayers({
        id: this.layer.id,
        sublayers,
      });

      this.$store.commit('supportLayers/setLayerCql', {
        id: this.layer.id,
        cql: activeCql
      });
    },

    handleLegendError(error) {
      console.error('Error fetching sublayers:', error);
      this.$store.commit('alert/addAlert', {
        message: this.$i18n.t('default-error', {
          action: this.$i18n.t('retrieve'),
          resource: this.$t('legend'),
        }),
      }, { root: true });
},

    createImg(obj) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = this.getColor(obj, 'fill') || this.getColor(obj, 'stroke');
      ctx.fillRect(50, 15, 150, 150);
      const dataURL = canvas.toDataURL('image/png');
      const img = new Image();
      img.src = dataURL;
      document.body.appendChild(img);
      return img.src;
    },

    getColor(obj, field) {
      const regex = new RegExp(`"${field}":"([^"]*)"`);
      const color = JSON.stringify(obj).match(regex);
      return color ? color[1] : null;
    },

    getImg(obj) {
      const field = 'url';
      const regex = new RegExp(`"${field}":"([^"]*)"`);
      const image = JSON.stringify(obj).match(regex);
      return image ? image[1] : null;
    },

    capitalizeFirstLetter(str) {
      if (str.toLowerCase() === 'encaminhada ri') {
        return 'Encaminhada RI';
      }
      return str.charAt(0).toUpperCase() + str.substring(1);
    },
    ...mapMutations('supportLayers', ['setCqlLayer', 'setSublayers']),
  },
};
</script>

<style scoped>
.my-card {
    height: 40px !important;
    width: 40px !important ;
}

.sub-layer-title {
    font-size: 14px;
    padding: 0px;
    line-height: 1;
}

.custom-tooltip {
  max-width: 400px !important;
  white-space: normal !important;
}
</style>
