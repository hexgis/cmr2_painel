<template>
  <v-card
    class="card pa-5"
    @click="openDialog"
  >
    <div v-if="userRequestData">
      <StatusBadge :status="userRequestData.status_name" />
      <UserInfo :user="userRequestData" />
      <br>
      <div class="d-flex align-center justify-space-between">
        <span>
          <CoordinatorInfo :coordinator="userRequestData" />
        </span>
      </div>
    </div>
    <v-divider class="mt-4 pb-4" />
    <RequestStatus :request-data="userRequestData" />
    <CustomDialog
      v-model="dialog"
      :title="$t('dialog-title')"
      :content="userRequestData"
      :has-cta="true"
    >
      <div class="d-flex align-end justify-space-between pt-4">
        <UserInfo :user="userRequestData" />
        <CoordinatorInfo :coordinator="userRequestData" />
        <RequestStatus :request-data="userRequestData" />
      </div>
      <v-divider class="mt-4 pb-4" />
      <p>{{ $t('choose-user-bond') }}</p>
      <v-row>
        <v-col>
          <div class="d-flex flex-column">
            <span
              v-for="item in groups"
              :key="item.id"
              class="d-flex align-center"
            >
              <input
                v-model="selectedGroup"
                type="radio"
                :value="item.id"
                name="userGroup"
                class="mr-2"
              >
              <label
                style="cursor: pointer;"
                @click="selectedGroup = item.id"
              >{{ $t(item.name) }}</label>
            </span>
            <div
              v-if="selectedGroup === 999"
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
        </v-col>
        <v-col>
          <div class="d-flex flex-column">
            <span
              v-for="item in roles"
              :key="item.id"
              class="d-flex align-center"
            >
              <input
                :id="`role-${item.id}`"
                v-model="selectedRoles"
                type="checkbox"
                :value="item.id"
                name="userGroup"
                class="mr-2"
              >
              <label
                :for="`role-${item.id}`"
                style="cursor: pointer;"
              >{{ $t(item.name) }}</label>
            </span>
          </div>
        </v-col>
        <v-col>
          <span
            v-for="(permission, index) in wrappedPermissionsList"
            :key="index"
            class="d-block"
          >
            <input
              type="radio"
              checked
              disabled
            >
            <label>{{ permission }}</label>
          </span>
        </v-col>
      </v-row>
      <div class="d-flex justify-end mt-4">
        <v-btn
          color="primary"
          @click="save"
        >
          Aprovar Usuário
        </v-btn>
        <v-btn
          text
          @click="showDeniedDetails = true"
        >
          Recusar
        </v-btn>
      </div>
    </CustomDialog>
    <CustomDialog
      v-model="showDeniedDetails"
      title="Motivo da Recusa"
      :has-cta="true"
      :save-btn="updateDeniedDetails"
      :save-active="!!deniedDetails"
    >
      <v-textarea
        v-model="deniedDetails"
        label="Detalhes da Recusa"
        outlined
        rows="5"
        dense
        class="mt-8"
      />
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
import UserInfo from './UserInfo.vue';

export default {
  name: 'RestrictedAreaCard',
  components: {
    StatusBadge, RequestStatus, ActionIcons, CoordinatorInfo, UserInfo, CustomDialog,
  },
  props: {
    userRequestData: {
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
      selectedRoles: [],
      otherInstitution: '',
      selectedOption: '',
      showDeniedDetails: false,
      deniedDetails: '',
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
    statusBackground() {
      switch (this.userRequestData.status) {
        case 'Concedida':
          return '#12A844';
        case 'Pendente':
          return '#F58A1F';
        case 'Recusada':
          return '#D92B3F';
        default:
          return '#9A9997';
      }
    },
    ...mapGetters('admin', ['institutionList', 'rolesList']),
    groups() {
      const institutionList = this.institutionList.map((group) => ({
        id: group.id,
        name: group.name,
        groups: group.groups,
      }));
      institutionList.push({
        id: 999,
        name: this.$t('other-institutions'),
        groups: [],
      });
      return institutionList;
    },
    roles() {
      return this.rolesList.map((role) => ({
        id: role.id,
        name: role.name,
      }));
    },
    updateList() {
      window.location.reload();
      return setTimeout(() => {
        this.$store.dispatch('admin/fetchRequestListAccess');
      }, 100);
    },
    wrappedPermissionsList() {
      return this.roles.filter((item) => this.selectedRoles.includes(item.id)).map((item) => item.name);
    },
  },
  async mounted() {
    await this.$store.dispatch('admin/fetchInstitutionList');
    await this.$store.dispatch('admin/fetchRolesList');
  },
  methods: {
    openDialog() {
      if (this.userRequestData.status_name === 'Pendente') {
        this.dialog = true;
      }
    },
    save() {
      try {
        this.$store.dispatch('admin/approveUser', {
          id: this.userRequestData.id,
          permissions: {
            selected_group: this.otherInstitution ? this.otherInstitution : this.selectedGroup,
            selected_roles: this.selectedRoles,
          },
        });
        this.dialog = false;
        this.updateList;
      } catch (error) {
        console.log(error);
      }
    },

    async updateDeniedDetails() {
      try {
        this.$store.dispatch('admin/deniedAccessRequest', { id: this.userRequestData.id, denied_details: this.deniedDetails });
        this.showDeniedDetails = false;
        this.dialog = false;
      } catch (error) {
        console.log(error);
      } finally {
        this.updateList;
      }
    },
  },
};
</script>

<style lang="sass" scoped>

.card
  width: 100%
  max-width: 750px
  min-height: 300px
  color: #5F5E5D
</style>
