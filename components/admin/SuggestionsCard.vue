<template>
  <v-card
    class="card pa-5"
    @click="openDialog"
  >
    <div v-if="cards">
      <StatusBadge :status="cards.ticket_status?.formated_info?.status_category_display" />
      <TicketInfo :info="cards" />
      <div class="d-flex align-center justify-space-between">
        <ActionIcons
          :denied-details="cards.denied_details"
          :has-file="cards.access_request?.attachment"
        />
      </div>
    </div>
    <v-divider class="mt-4 pb-4" />
    <RequestStatus :request-data="cards" />
    <CustomDialog
      v-model="dialog"
      :title="$t('dialog-title')"
      :content="cards"
      :has-cta="true"
    >
      <div class="d-flex align-end justify-space-between pt-4">
        <UserInfo :user="cards.access_request" />
        <CoordinatorInfo :coordinator="cards.access_request" />
        <RequestStatus :request-data="cards" />
      </div>
      <v-divider class="mt-4 pb-4" />
      <p>{{ $t('choose-user-bond') }}</p>
      <div class="d-flex flex-column">
        <span
          v-for="item in userGroup"
          :key="item"
          class="d-flex align-center"
        >
          <input
            v-model="selectedGroup"
            type="radio"
            :value="item"
            name="userGroup"
            class="mr-2"
          >
          <label
            style="cursor: pointer;"
            @click="selectedGroup = item"
          >{{ $t(item) }}</label>
        </span>
        <div
          v-if="selectedGroup === 'other-institutions'"
          class="mt-3"
        >
          <v-text-field
            v-model="otherInstitution"
            :label="$t('specify-institution')"
            :placeholder="$t('enter-institution-name')"
            dense
          />
        </div>
      </div>
    </CustomDialog>
  </v-card>
</template>
<i18n>
 {
  "en": {
    "choose-user-bond": "Choose an affiliation for the user:",
    "dialog-title": "Details",
    "coordination": "Coordination",
    "regional-coordination": "Regional Coordination",
    "fpe": "Front for Ethnoenvironmental Protection (FPE)",
    "indian-museum": "Museum of the Indian",
    "other-institutions": "Other institutions",
    "specify-institution": "Specify the institution",
    "enter-institution-name": "Enter the institution name"
  },
  "pt-br": {
    "choose-user-bond": "Escolha um vínculo para o usuário:",
    "dialog-title": "Detalhes",
    "coordination": "Coordenação",
    "regional-coordination": "Coordenação Regional",
    "fpe": "Frente de proteção Etnoambiental (FPE)",
    "indian-museum": "Museu do Índio",
    "other-institutions": "Outras instituições",
    "specify-institution": "Especifique a instituição",
    "enter-institution-name": "Digite o nome da instituição"
  }
}
</i18n>
<script>
import { mapGetters } from 'vuex';
import ActionIcons from './ActionIcons.vue';
import CoordinatorInfo from './CoordinatorInfo.vue';
import CustomDialog from './CustomDialog.vue';
import RequestStatus from './RequestStatus.vue';
import StatusBadge from './StatusBadge.vue';
import TicketInfo from './TicketInfo.vue';

export default {
  name: 'RestrictedAreaCard',
  components: {
    StatusBadge, RequestStatus, ActionIcons, CoordinatorInfo, CustomDialog, TicketInfo,
  },
  props: {
    cards: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      dialog: false,
      userGroup: [
        'coordination',
        'regional-coordination',
        'fpe',
        'indian-museum',
        'other-institutions',
      ],
      selectedGroup: null,
      otherInstitution: '',
      selectedOption: '',
    };
  },
  watch: {
    selectedGroup(newValue) {
      if (newValue !== 'other-institutions') {
        this.selectedOption = newValue;
        this.otherInstitution = '';
      } else {
        this.selectedOption = '';
      }
    },
    otherInstitution(newValue) {
      if (this.selectedGroup === 'other-institutions') {
        this.selectedOption = newValue;
      }
    },
  },
  computed: {
    ...mapGetters('admin', ['suggestionsCards', 'tickets']),
    statusBackground() {
      switch (this.cards.status_category_name) {
        case 'Aguardando Gestor':
          return '#D66A00';
        case 'Concluído':
          return '#12A844';
        case 'Desenvolvido':
          return '#1A535C';
        case 'Deferido':
          return '#FFCE03';
        case 'Em Desenvolvimento':
          return '#F58A1F';
        case 'Recusado':
          return '#D92B3F';

        default:
          return '#9A9997';
      }
    },
  },
  methods: {
    openDialog() {
      if (this.cards.status_name === 'Pendente') {
        this.dialog = true;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.card
  display: flex
  flex-direction: column
  justify-content: space-around
  width: 100%
  max-width: 750px
  min-height: 300px
  color: #5F5E5D
</style>
