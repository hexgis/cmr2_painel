<template>
  <div>
    <v-card
      variant="outlined"
      class="py-1 mb-4"
    >
      <v-row>
        <v-col class="pt-4 ml-2 font-weight-medium">
          <span>{{ $t('last-update-label') }}</span>
        </v-col>
        <v-col
          cols="12"
          class="pb-2 pt-0 ml-6"
        >
          <span>{{
            formatDate(
              supportLayers[layerId].dt_atualizacao
            )
          }}</span>
        </v-col>
        <v-col
          cols="12"
          class="py-0 ml-2 font-weight-medium"
        >
          <span>Fonte:</span>
        </v-col>
        <v-col
          cols="6"
          class="pt-0 pb-2 ml-6"
        >
          <span>{{ fonte }}</span>
          <a
            v-if="link"
            :href="link"
            target="_blank"
          >
            <v-icon class="mb-1">mdi-open-in-new</v-icon>
          </a>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
<i18n>
  {
      "en": {
          "last-update-label": "Last update:"
      },
      "pt-br": {
          "last-update-label": "Última atualização:"
      }
  }
</i18n>

<script>
import { mapState } from 'vuex';

export default {
  name: 'SuporteMetadadosCamada',

  props: {
    layerId: {
      type: Number,
      required: true,
    },
  },

  computed: {
    fonte() {
      const layerInfo = this.supportLayers[this.layerId];
      const fonteRegex = /([^(]+)(?=\s*\()/;
      const fonteMatch = layerInfo.fonte.match(fonteRegex);
      return fonteMatch ? fonteMatch[0] : layerInfo.fonte;
    },

    link() {
      const layerInfo = this.supportLayers[this.layerId];
      const linkRegex = /\(([^)]+)\)/;
      const linkMatch = layerInfo.fonte.match(linkRegex);
      return linkMatch ? linkMatch[1] : '';
    },

    ...mapState('supportLayers', ['supportLayers']),
  },

  methods: {
    formatDate(value) {
      if (!value) return '';
      const [year, month, day] = value.split('-');
      return `${day}/${month}/${year}`;
    },
  },
};
</script>
