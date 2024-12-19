<template>
  <v-container class="pa-0">
    <div class="tab-header">
      <v-row>
        <h4 class="subtitle-2 text-uppercase font-weight-regular">
          {{ $t('title') }}
        </h4>
        <v-tooltip>
          <template #activator="{ on }">
            <v-icon
              class="mr-2 ml-2"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            {{ $t('data-source') }}
            <br>
            {{ $t('data-provided') }}
            <br>
            {{ $t('available-at') }}
            <br>
            {{ $t('access') }}
            <br>
            {{ $t('heat-sources') }}
            <br>
            {{ $t('heat-sources-description') }}
            <br>
            {{ $t('fire-risk') }}
            <br>
            {{ $t('fire-risk-description') }}
            <br>
            {{ $t('methodology-link') }}
          </span>
        </v-tooltip>
      </v-row>
    </div>
    <v-list
      v-if="!$fetchState.pending"
      expand
    >
      <template v-for="group in orderedSupportLayersGroups">
        <SupportLayersGroupHazard
          :key="group.id"
          :group="group"
        />
      </template>
    </v-list>
    <div v-if="$fetchState.pending">
      <template v-for="i in 6">
        <v-skeleton-loader
          :key="i"
          type="text"
          class="mx-4 my-5"
        />
      </template>
    </div>

  </v-container>
</template>

<i18n>
{
    "en": {
        "title": "Layers Hazard (INPE)",
        "data-source": "INPE - National Institute for Space Research, 2020.",
        "data-provided": "Data provided by the Burned Areas and Forest Fires Monitoring Portal.",
        "available-at": "Available at http://www.inpe.br/queimadas.",
        "access": "Access: Data updated yesterday.",
        "heat-sources": "* HEAT SOURCES",
        "heat-sources-description": "Description: Mapping of heat points detected by the AQUA M-M and AQUA M-T satellites.",
        "fire-risk": "* FIRE RISK",
        "fire-risk-description": "Description: Product resulting from the methodology created by the INPE Burned Areas Program.",
        "methodology-link": "Methodology at https://queimadas.dgi.inpe.br/~rqueimadas/documentos/RiscoFogo_Sucinto.pdf"
    },
    "pt-br": {
        "title": "Camadas Fogo (INPE)",
        "data-source": "INPE - Instituto Nacional de Pesquisas Espaciais, 2020.",
        "data-provided": "Dados fornecidos pelo Portal do Monitoramento de Queimadas e Incêndios Florestais.",
        "available-at": "Disponível em http://www.inpe.br/queimadas.",
        "access": "Acesso: Dado atualizado ontem.",
        "heat-sources": "* FOCOS DE CALOR",
        "heat-sources-description": "Descrição: Mapeamento dos pontos de foco de calor aferidos pelos satélites AQUA M-M e AQUA M-T.",
        "fire-risk": "* RISCO DE FOGO",
        "fire-risk-description": "Descrição: Produto resultado da metodologia criada pelo Programa Queimadas do INPE.",
        "methodology-link": "Metodologia em https://queimadas.dgi.inpe.br/~rqueimadas/documentos/RiscoFogo_Sucinto.pdf"
    }
}
</i18n>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';

import SupportLayersGroupHazard from '@/components/support/SupportLayersGroupHazard';

export default {
  name: 'SupportHazard',

  components: { SupportLayersGroupHazard },

  transition: 'scroll-y-transition',

  async fetch() {
    if (!Object.keys(this.supportCategoryGroupsFire).length) {
      await this.$store.dispatch('supportLayers/getCategoryGroupsFire');
    }
  },

  computed: {
    orderedSupportLayersGroups() {
      return _.sortBy(this.supportCategoryGroupsFire, 'order');
    },
    showFeatures: {
      get() {
        return this.$store.state.supportLayers.showFeaturesSupportLayersHazard;
      },
      set(value) {
        this.$store.commit(
          'supportLayers/setshowFeaturesSupportLayersHazard',
          value,
        );
      },
    },

    ...mapState('supportLayers', ['supportCategoryGroupsFire', 'loading', 'showFeaturesSupportLayersHazard']),
  },
};
</script>

<style scoped></style>
