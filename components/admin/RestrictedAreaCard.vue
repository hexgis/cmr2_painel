<template>
  <v-card
    class="card pa-5"
    style="cursor: pointer;"
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
    <v-dialog
      v-model="dialog"
      width="730px"
      persistent
    >
      <v-card>
        <v-card-title
          class="headline d-flex justify-space-between"
          style="background: #D92B3F; color: #FFFFFF;"
        >
          <p class="mb-0 text-subtitle-1 font-weight-bold">
            {{ $t('dialog-title') }}
          </p>
          <v-icon
            color="white"
            @click="dialog = false"
          >
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <div class="d-flex align-end justify-space-between pt-4">
            <UserInfo :user="userRequestData" />
            <CoordinatorInfo :coordinator="userRequestData" />
            <RequestStatus :request-data="userRequestData" />
          </div>
          <v-divider class="mt-4 pb-4" />

          <!-- Only show permission selection for administrators -->
          <template v-if="canSeeInstitutionSection">
            <p>{{ $t('choose-user-bond') }}</p>
            <v-row>
              <v-col>
                <div class="d-flex flex-column">
                  <span
                    v-for="item in institutionList"
                    :key="item.id"
                    class="d-flex align-center"
                  >
                    <input
                      v-model="selectedInstitution"
                      type="radio"
                      :value="item.id"
                      name="userInstitution"
                      class="mr-2"
                    >
                    <label
                      style="cursor: pointer;"
                      @click="selectedInstitution = item.id"
                    >{{ item.name }}</label>
                  </span>
                </div>
              </v-col>
              <v-col>
                <div class="d-flex flex-column">
                  <span
                    v-for="item in rolesList"
                    :key="item.id"
                    class="d-flex align-center"
                  >
                    <input
                      :id="`role-${item.id}`"
                      v-model="selectedRoles"
                      type="checkbox"
                      :value="item.id"
                      name="userRoles"
                      class="mr-2"
                    >
                    <label
                      :for="`role-${item.id}`"
                      style="cursor: pointer;"
                    >{{ item.name }}</label>
                  </span>
                </div>
              </v-col>
            </v-row>
          </template>

          <!-- Gestor approval message -->
          <template v-else-if="isGestor && userRequestData.status_name === 'Pendente' && isSameInstitution">
            <p>
              Você está aprovando esta solicitação como gestor. Após sua aprovação,
              um administrador poderá conceder o acesso final.
            </p>
          </template>

          <!-- Status messages for different scenarios -->
          <template v-else-if="isAdministrator && userRequestData.status_name === 'Concedida'">
            <p>Esta solicitação já foi concedida.</p>
          </template>

          <template v-else-if="isGestor && userRequestData.status_name === 'Pendente' && !isSameInstitution">
            <p>Você só pode aprovar solicitações de usuários da sua instituição.</p>
          </template>

          <template v-else-if="isCommonUser">
            <p>Suas solicitações são analisadas pelos gestores e administradores.</p>
          </template>

          <template v-else>
            <p>Você não tem permissão para interagir com esta solicitação.</p>
          </template>
        </v-card-text>
        <v-card-actions>
          <div class="d-flex justify-end mt-4">
            <!-- Usuário comum - apenas visualização -->
            <template v-if="isCommonUser">
              <v-btn
                text
                @click="dialog = false"
              >
                Fechar
              </v-btn>
            </template>

            <!-- Gestor actions - only for same institution and pending status -->
            <template v-if="(isAdministrator || isGestor) && userRequestData.status_name == 'Pendente'">
              <v-btn
                color="primary"
                @click="gestorApprove"
              >
                Aprovar como Gestor
              </v-btn>
              <v-btn
                text
                @click="showGestorDeniedDetails = true"
              >
                Recusar
              </v-btn>
            </template>
            <!-- Administrator actions for status_name 2 (Approved by Gestor) -->
            <template v-if="isAdministrator && userRequestData.status_name === 'Aprovado pelo Gestor'">
              <v-btn
                color="primary"
                :disabled="!selectedInstitution || selectedRoles.length === 0"
                @click="adminApprove"
              >
                Conceder Acesso
              </v-btn>
              <v-btn
                text
                @click="showDeniedDetails = true"
              >
                Recusar
              </v-btn>
            </template>

            <!-- Administrator actions for status_name 1 (Pending) -->
            <template v-if="isAdministrator && userRequestData.status_name == 'Pendente'">
              <v-btn
                color="primary"
                :disabled="!selectedInstitution || selectedRoles.length === 0"
                @click="adminApprove"
              >
                Aprovar como Administrador
              </v-btn>
              <v-btn
                text
                @click="showDeniedDetails = true"
              >
                Recusar
              </v-btn>
            </template>

            <!-- Administrator actions for status_name 3 (Rejected) -->
            <template v-if="isAdministrator && userRequestData.status_name == 'Recusada'">
              <v-btn
                color="primary"
                @click="gestorApprove"
              >
                Reativar Solicitação
              </v-btn>
            </template>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <CustomDialog
      v-model="showGestorDeniedDetails"
      title="Motivo da Recusa (Gestor)"
      :has-cta="true"
      :save-btn="updateGestorDeniedDetails"
      :save-active="!!gestorDeniedDetails"
    >
      <v-textarea
        v-model="gestorDeniedDetails"
        label="Detalhes da Recusa"
        outlined
        rows="5"
        dense
        class="mt-8"
      />
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
import { mapGetters, mapState } from 'vuex';
import CoordinatorInfo from './CoordinatorInfo.vue';
import CustomDialog from './CustomDialog.vue';
import RequestStatus from './RequestStatus.vue';
import StatusBadge from './StatusBadge.vue';
import UserInfo from './UserInfo.vue';

export default {
  name: 'RestrictedAreaCard',
  components: {
    StatusBadge, RequestStatus, CoordinatorInfo, UserInfo, CustomDialog,
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
      selectedInstitution: null,
      selectedRoles: [],
      otherInstitution: '',
      selectedOption: '',
      showDeniedDetails: false,
      deniedDetails: '',
      showGestorDeniedDetails: false,
      gestorDeniedDetails: '',
    };
  },
  watch: {
    selectedInstitution(newValue) {
      if (newValue) {
        this.selectedOption = newValue;
      }
    },
    otherInstitution(newValue) {
      if (newValue) {
        this.selectedOption = newValue;
      }
    },
  },
  computed: {
    statusBackground() {
      switch (this.userRequestData.status_name) {
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
    ...mapState('userProfile', ['user']),
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
    isGestor() {
      return this.user && this.user.roles
        && this.user.roles.some((role) => role.name === 'Gestor');
    },
    isAdministrator() {
      const result = this.user && this.user.roles
        && this.user.roles.some((role) => role.name === 'Administrador');
      console.log('aaaaaaaaaaaaaa', this.user.roles.some((role) => role.name === 'Gestor'));
      return result;
    },
    isCommonUser() {
      return this.user && (!this.user.roles || this.user.roles.length === 0
             || !this.user.roles.some((role) => role.name === 'Gestor' || role.name === 'Administrador'));
    },
    canSeeInstitutionSection() {
      // Only administrators can see the institution and role selection section
      return this.isAdministrator && ['Pendente', 'Aprovado pelo Gestor', 'Recusada'].includes(this.userRequestData.status_name);
    },
    canGestorInteract() {
      // Gestor can interact with status 'Pendente' and same institution
      return this.isGestor && this.userRequestData.status_name === 'Pendente'
             && this.isSameInstitution;
    },
    canAdminInteract() {
      // Administrator can interact with all statuses
      return this.isAdministrator && ['Pendente', 'Aprovado pelo Gestor', 'Recusada', 'Concedida'].includes(this.userRequestData.status_name);
    },
    isSameInstitution() {
      // Check if the current user is from the same institution as the request
      if (!this.user || !this.user.institution || !this.userRequestData.institution) {
        return false;
      }
      return this.user.institution === this.userRequestData.institution;
    },
    canInteract() {
      const { status_name } = this.userRequestData;
      // Gestor pode interagir com status 'Pendente' e mesma instituição
      // Administrador pode interagir com qualquer status
      return (this.isGestor && status_name === 'Pendente' && this.isSameInstitution)
        || (this.isAdministrator && ['Pendente', 'Aprovado pelo Gestor', 'Recusada', 'Concedida'].includes(status_name));
    },
    wrappedPermissionsList() {
      return this.roles.filter((item) => this.selectedRoles.includes(item.id))
        .map((item) => item.name);
    },
  },
  methods: {
    openDialog() {
      // Sempre abrir a modal para visualizar os detalhes
      console.log('Opening dialog with user data:', this.userRequestData);
      console.log('Current user:', this.user);
      console.log('Is Gestor:', this.isGestor);
      console.log('Is Administrator:', this.isAdministrator);
      console.log('Is Common User:', this.isCommonUser);
      console.log('Can see institution section:', this.canSeeInstitutionSection);
      console.log('Same institution:', this.isSameInstitution);
      console.log('Request status:', this.userRequestData.status);
      console.log('Request status_name:', this.userRequestData.status_name);
      console.log('Status comparison (Pendente):', this.userRequestData.status === 'Pendente');
      console.log('Status comparison (status_name Pendente):', this.userRequestData.status_name === 'Pendente');
      this.dialog = true;
    },
    async gestorApprove() {
      try {
        console.log('Tentando aprovar como gestor, ID:', this.userRequestData.id);
        console.log('Dados do usuário:', this.userRequestData);
        console.log('Usuário atual:', this.user);
        console.log('É gestor?', this.isGestor);
        console.log('É administrador?', this.isAdministrator);

        await this.$store.dispatch('admin/gestorApproveRequest', {
          id: this.userRequestData.id,
        });

        console.log('Aprovação realizada com sucesso');
        this.dialog = false;
        this.$store.dispatch('admin/fetchRequestListAccess');
      } catch (error) {
        console.error('Erro ao aprovar:', error);
        console.error('Detalhes do erro:', error.response);
      }
    },
    async updateGestorDeniedDetails() {
      try {
        await this.$store.dispatch('admin/gestorRejectRequest', {
          id: this.userRequestData.id,
          denied_details: this.gestorDeniedDetails,
        });
        this.showGestorDeniedDetails = false;
        this.dialog = false;
        this.$store.dispatch('admin/fetchRequestListAccess');
      } catch (error) {
        console.log(error);
      }
    },
    async adminApprove() {
      try {
        await this.$store.dispatch('admin/adminApproveRequest', {
          id: this.userRequestData.id,
          permissions: {
            selected_group: this.selectedInstitution,
            selected_roles: this.selectedRoles,
          },
        });

        // Atualizar os dados do usuário se for o usuário logado
        if (this.userRequestData.email === this.user.email) {
          await this.$store.dispatch('userProfile/getUserData');
        }

        this.dialog = false;
        this.$store.dispatch('admin/fetchRequestListAccess');
      } catch (error) {
        console.error('Erro ao aprovar:', error);
        console.error('Detalhes do erro:', error.response && error.response.data ? error.response.data : error.response);
      }
    },
    async updateDeniedDetails() {
      try {
        await this.$store.dispatch('admin/deniedAccessRequest', {
          id: this.userRequestData.id,
          denied_details: this.deniedDetails,
        });
        this.showDeniedDetails = false;
        this.dialog = false;
        this.$store.dispatch('admin/fetchRequestListAccess');
      } catch (error) {
        console.log(error);
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
