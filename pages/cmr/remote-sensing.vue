<template>
  <v-container class="pa-0">
    <div
      v-if="tab === 'tab-1'"
      class="tab-header justify-space-between"
    >
      <v-row>
        <h6
          class="subtitle-2 text-uppercase font-weight-regular header-title"
        >
          {{ $t('title') }}
        </h6>

        <v-tooltip>
          <template #activator="{ on }">
            <v-icon
              class="infoIconMargin"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            {{ $t('prodes-description-line1') }}
            <br>
            {{ $t('prodes-description-line2') }}
            <br>
            {{ $t('prodes-description-line3') }}
            <br>
            {{ $t('prodes-description-line4') }}
            <br>
            {{ $t('prodes-description-line5') }}
          </span>
        </v-tooltip>
      </v-row>
    </div>
    <div
      v-else-if="tab === 'tab-2'"
      class="tab-header justify-space-between"
    >
      <v-row>
        <h4
          class="subtitle-2 text-uppercase font-weight-regular header-title"
        >
          {{ $t('title-deter') }}
        </h4>
        <v-tooltip>
          <template #activator="{ on }">
            <v-icon
              class="infoIconMargin"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            {{ $t('tooltip') }}
          </span>
        </v-tooltip>
      </v-row>
    </div>
    <div
      v-else-if="tab === 'tab-3'"
      class="tab-header justify-space-between"
    >
      <v-row>
        <h4
          class="subtitle-2 text-uppercase font-weight-regular header-title"
        >
          {{ $t('title-fogo') }}
        </h4>
        <v-tooltip>
          <template #activator="{ on }">
            <v-icon
              class="infoIconMargin"
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
    <v-tabs
      v-model="tab"
      background-color="#D42A3E"
      centered
      dark
      icons-and-text
    >
      <v-tabs-slider />
      <v-tab
        href="#tab-1"
        class="tab-item"
      >
        Prodes<br>(INPE)
        <v-icon>mdi-view-dashboard</v-icon>
      </v-tab>

      <v-tab
        href="#tab-2"
        class="tab-item"
      >
        Deter
        <v-icon>mdi-leaf</v-icon>
      </v-tab>

      <v-tab
        href="#tab-3"
        class="tab-item"
        style="font-size: 12px; line-height: 1.2"
      >
        Risco e foco<br>de calor
        <v-icon>mdi-fire</v-icon>
      </v-tab>
    </v-tabs>

    <div class="list-container">
      <v-tabs-items v-model="tab">
        <v-tab-item value="tab-1">
          <ProdesFilters />
          <v-list
            v-if="orderedSupportLayersGroups.length"
            class="pt-0"
          >
            <template v-for="group in orderedSupportLayersGroups">
              <SupportLayersGroupBase
                :key="group.id"
                :group="group"
                :selected-layers="showFeatures"
              />
            </template>
          </v-list>
        </v-tab-item>
        <v-tab-item value="tab-2">
          <DeterFilters />
        </v-tab-item>
        <v-tab-item value="tab-3">
          <RiscoFocoFilters />
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>

<i18n>
{
  "en": {
      "title": "Layer Prodes (INPE)",
      "prodes-description-line1": "PRODES is a project that uses",
      "prodes-description-line2": "the Landsat, CBERS, and IRS-2 satellites,",
      "prodes-description-line3": "and detects areas larger than 6.25 ha.",
      "prodes-description-line4": "The detections covered by PRODES",
      "prodes-description-line5": "start from the year 2005.",

      "title-deter": "Deter Polygons (INPE)",
      "tooltip": "INPE emphasizes that DETER is an alert system developed to support deforestation enforcement.",

      "title-fogo": "Layers Hazard (INPE)",
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
      "title": "Camada Prodes (INPE)",
      "prodes-description-line1": "PRODES é um projeto que utiliza os",
      "prodes-description-line2": "satélites Landsat, CBERS e IRS-2,",
      "prodes-description-line3": "e detecta áreas maiores que 6,25 ha.",
      "prodes-description-line4": "As detecções contempladas pelo PRODES",
      "prodes-description-line5": "são a partir do ano de 2005.",

      "title-deter": "Polígonos Deter (INPE)",
      "tooltip": "O INPE enfatiza que o DETER é um sistema de alerta desenvolvido para suporte à fiscalização de desmatamento.",

      "title-fogo": "Camadas Fogo (INPE)",
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

import DeterFilters from '../../components/remote-sensing/deter/DeterFilters.vue';
import ProdesFilters from '../../components/remote-sensing/prodes/ProdesFilters.vue';
import RiscoFocoFilters from '../../components/remote-sensing/risco-foco/RiscoFocoFilters.vue';

export default {
  name: 'SupportProdes',

  components: { DeterFilters, ProdesFilters, RiscoFocoFilters},

  transition: 'scroll-y-transition',

  data() {
    return {
      tab: 'tab-1',
      dialog: false,
    };
  },

  async fetch() {
    if (!Object.keys(this.supportCategoryGroupsProdes).length) {
      await this.$store.dispatch('supportLayers/getCategoryGroupsProdes');
    }
  },

  computed: {
    orderedSupportLayersGroups() {
      return _.sortBy(this.supportCategoryGroupsProdes, 'order');
    },
    showFeatures: {
      get() {
        return this.$store.state.supportLayers
          .showFeaturesSupportLayersProdes;
      },
      set(value) {
        this.$store.commit(
          'supportLayers/setshowFeaturesSupportLayersProdes',
          value,
        );
      },
    },

    ...mapState('supportLayers', [
      'supportCategoryGroupsProdes',
      'loading',
      'showFeaturesSupportLayersProdes',
    ]),
  },
};
</script>

<style scoped>
.tab-item {
  flex: 1; /* Distribui o espaço igualmente */
  text-align: center;
  white-space: nowrap; /* Evita que o texto quebre */
  min-width: 100px; /* Define um tamanho mínimo */
  max-width: 150px; /* Limita o tamanho */
}
</style>
