<template>
  <v-container class="d-flex flex-column">
    <div class="tab-header flex justify-space-between">
      <h4 class="subtitle-2 text-uppercase font-weight-regular">
        {{ $t('title') }}
      </h4>
    </div>
    <v-card-text>
      <p>{{ $t('description') }}</p>

      <v-list-item-content style="list-style: circle">
        <v-list-item-title class="list__text mb-4 font-weight-black">
          {{ $t('available-actions') }}
        </v-list-item-title>
        <ul
          v-for="(item, index) in items"
          :key="index"
        >
          <li>{{ item.value }}</li>
        </ul>
      </v-list-item-content>
    </v-card-text>

    <v-btn
      color="primary"
      small
      outlined
      @click="showDialog(true)"
    >
      {{ $t('input-label') }}
    </v-btn>
    <div v-if="showDialogDocument">
      <DocumentDialog />
    </div>
  </v-container>
</template>

<i18n>
    {
        "en": {
            "title": "Document",
            "analytics-label": "Analytics",
            "map-label": "Map",
            "description": "Document search environment according to actions.",
            "available-actions": "Available Actions:",
            "input-label": "Search",
            "table-name": "Monitoring Table",
            "urgent-alerts": "Urgent Alerts",
            "fip-dgm": "FIP DGM",
            "enforcement-2016": "Enforcement (2016)",
            "enforcement-2017": "Enforcement (2017)",
            "amazon-fund": "Amazon Fund",
            "territorial-management": "Territorial and Environmental Management",
            "prevention-2016": "Prevention (2016)",
            "prevention-2017": "Prevention (2017)",
            "undp-project": "UNDP Project (Vulnerable TIs)",
            "surveillance": "Surveillance"
        },
        "pt-br": {
            "title": "Documental",
            "analytics-label": "Analítico",
            "map-label": "Mapa",
            "description": "Ambiente de pesquisa de documentos de acordo com as ações.",
            "available-actions": "Ações Disponíveis:",
            "input-label": "Pesquisar",
            "table-name": "Tabela de Monitoramento",
            "urgent-alerts": "Alertas Urgentes",
            "fip-dgm": "FIP DGM",
            "enforcement-2016": "Fiscalização (2016)",
            "enforcement-2017": "Fiscalização (2017)",
            "amazon-fund": "Fundo Amazônia",
            "territorial-management": "Gestão Territorial e Ambiental",
            "prevention-2016": "Prevenção (2016)",
            "prevention-2017": "Prevenção (2017)",
            "undp-project": "Projeto PNUD (TIs Vulneráveis)",
            "surveillance": "Vigilância"
        }
    }
</i18n>

<script>
import { mapMutations, mapState } from 'vuex';
import DocumentDialog from '@/components/document-dialog/DocumentDialog';

export default {
  components: { DocumentDialog },
  data() {
    return {
      items: [
        { value: 'Alertas Urgentes', translationKey: 'urgent-alerts' },
        { value: 'FIP DGM', translationKey: 'fip-dgm' },
        { value: 'Fiscalização (2016)', translationKey: 'enforcement-2016' },
        { value: 'Fiscalização (2017)', translationKey: 'enforcement-2017' },
        { value: 'Fundo Amazônia', translationKey: 'amazon-fund' },
        { value: 'Gestão Territorial e Ambiental', translationKey: 'territorial-management' },
        { value: 'Prevenção (2016)', translationKey: 'prevention-2016' },
        { value: 'Prevenção (2017)', translationKey: 'prevention-2017' },
        { value: 'Projeto PNUD (TIs Vulveráveis)', translationKey: 'undp-project' },
        { value: 'Vigilância', translationKey: 'surveillance' },
      ],
    };
  },
  computed: {
    ...mapState('document', [
      'showDialogDocument',
      'showFeatures',
      'features',
    ]),
  },
  methods: {
    showDialog(value) {
      this.setShowDialogDocument(value);
    },

    ...mapMutations('document', ['setShowDialogDocument']),
  },
};
</script>

<style scoped>
.list__text {
    font-size: 0.875rem;
    margin-bottom: 3px;
    list-style: circle !important;
}
</style>
