<template>
  <v-card class="card pa-5"
    @click="openDialog"
  >
    <div v-if="userRequestData">
      <StatusBadge :status="userRequestData.status_name" />
      <UserInfo :user="userRequestData.access_request" />
      <br />
      <div class="d-flex align-center justify-space-between">
        <span>
          <CoordinatorInfo :coordinator="userRequestData.access_request" />
        </span>
        <ActionIcons :deniedDetails="userRequestData.denied_details" :hasFile="userRequestData.access_request?.attachment" />
      </div>
    </div>
    <v-divider class="mt-4 pb-4" />
    <RequestStatus :requestData="userRequestData" />
    <CustomDialog v-model="dialog" :title="$t('dialog-title')" :content="userRequestData" :hasCta="true">
      <div class="d-flex align-end justify-space-between pt-4">
        <UserInfo :user="userRequestData.access_request"/>
        <CoordinatorInfo :coordinator="userRequestData.access_request" />
        <RequestStatus :requestData="userRequestData" />
      </div>
      <v-divider class="mt-4 pb-4"/>
      <p>{{ $t('choose-user-bond')}}</p>
      <div class="d-flex flex-column">
        <span class="d-flex align-center" v-for="item in userGroup" :key="item">
          <input
            type="radio"
            :value="item"
            v-model="selectedGroup"
            name="userGroup"
            class="mr-2"
          />
          <label style="cursor: pointer;" @click="selectedGroup = item">{{ $t(item) }}</label>
        </span>
        <div v-if="selectedGroup === 'other-institutions'" class="mt-3">
          <v-text-field
            :label="$t('specify-institution')"
            v-model="otherInstitution"
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
import ActionIcons from './ActionIcons.vue';
import CoordinatorInfo from './CoordinatorInfo.vue';
import CustomDialog from './CustomDialog.vue';
import RequestStatus from './RequestStatus.vue';
import StatusBadge from './StatusBadge.vue';
import UserInfo from './UserInfo.vue';

export default {
  name: 'RestrictedAreaCard',
  props: {
    userRequestData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
      return {
        dialog: false,
        userGroup:[
          'coordination',
          'regional-coordination',
          'fpe',
          'indian-museum',
          'other-institutions'
        ],
        selectedGroup: null,
        otherInstitution: '',
        selectedOption: '',
      };
  },
  components: { StatusBadge, RequestStatus, ActionIcons, CoordinatorInfo, UserInfo, CustomDialog },
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
    statusBackground() {
      switch (this.userRequestData) {
        case 'Concedida':
          return '#12A844';
        case 'Pendente':
          return '#F58A1F';
        case 'Recusada':
          return '#D92B3F';
        default:
          return '#9A9997';
      }
    }
  },
  methods:{
    openDialog() {
      if (this.userRequestData.status_name === 'Pendente') {
        this.dialog = true;
      }
    },
  }
}
</script>

<style lang="sass" scoped>

.card
  width: 100%
  max-width: 750px
  min-height: 300px
  color: #5F5E5D
</style>
