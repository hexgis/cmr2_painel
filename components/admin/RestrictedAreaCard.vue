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
            <div class="permission-selection-container">
              <h3 class="mb-4 text-h6 font-weight-medium">
                {{ $t('choose-user-bond') }}
              </h3>

              <v-row class="mb-4">
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-card
                    outlined
                    class="pa-4"
                  >
                    <h4 class="mb-3 text-subtitle-1 font-weight-medium">
                      <v-icon
                        color="primary"
                        class="mr-2"
                      >
                        mdi-domain
                      </v-icon>
                      {{ $t('institution') }}
                    </h4>
                    <v-select
                      v-model="selectedInstitution"
                      :items="institutionOptions"
                      item-text="name"
                      item-value="id"
                      :label="$t('select-institution')"
                      outlined
                      dense
                      clearable
                      :search-input.sync="institutionSearch"
                      :filter="filterInstitutions"
                      :no-data-text="$t('no-institutions-found')"
                      prepend-inner-icon="mdi-magnify"
                    >
                      <template #item="{ item }">
                        <div class="d-flex align-center">
                          <v-icon
                            color="grey"
                            class="mr-3"
                          >
                            mdi-domain
                          </v-icon>
                          <div>
                            <div class="font-weight-medium">
                              {{ item.name }}
                            </div>
                            <div
                              v-if="item.description"
                              class="text-caption grey--text"
                            >
                              {{ item.description }}
                            </div>
                          </div>
                        </div>
                      </template>
                    </v-select>
                  </v-card>
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-card
                    outlined
                    class="pa-4"
                  >
                    <h4 class="mb-3 text-subtitle-1 font-weight-medium">
                      <v-icon
                        color="secondary"
                        class="mr-2"
                      >
                        mdi-account-group
                      </v-icon>
                      {{ $t('roles') }}
                    </h4>
                    <div class="roles-container">
                      <v-checkbox
                        v-for="item in rolesList"
                        :key="item.id"
                        v-model="selectedRoles"
                        :value="item.id"
                        :label="item.name"
                        dense
                        class="ma-0 role-checkbox"
                        hide-details
                      >
                        <template #label>
                          <div class="d-flex align-center">
                            <v-icon
                              small
                              color="grey"
                              class="mr-2"
                            >
                              mdi-account-check
                            </v-icon>
                            <span>{{ item.name }}</span>
                          </div>
                        </template>
                      </v-checkbox>
                      <div
                        v-if="selectedRoles.length === 0"
                        class="text-caption grey--text mt-2"
                      >
                        {{ $t('select-at-least-one-role') }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Summary of selected options -->
              <v-card
                v-if="selectedInstitution || selectedRoles.length > 0"
                color="grey lighten-5"
                class="pa-3"
              >
                <h5 class="mb-2 text-subtitle-2 font-weight-medium">
                  <v-icon
                    small
                    class="mr-1"
                  >
                    mdi-check-circle
                  </v-icon>
                  {{ $t('selection-summary') }}
                </h5>
                <div
                  v-if="selectedInstitution"
                  class="mb-1"
                >
                  <v-chip
                    small
                    color="primary"
                    outlined
                  >
                    <v-icon
                      left
                      small
                    >
                      mdi-domain
                    </v-icon>
                    {{ getInstitutionName(selectedInstitution) }}
                  </v-chip>
                </div>
                <div v-if="selectedRoles.length > 0">
                  <v-chip
                    v-for="roleId in selectedRoles"
                    :key="roleId"
                    small
                    color="secondary"
                    outlined
                    class="mr-1 mb-1"
                  >
                    <v-icon
                      left
                      small
                    >
                      mdi-account-check
                    </v-icon>
                    {{ getRoleName(roleId) }}
                  </v-chip>
                </div>
              </v-card>
            </div>
          </template>

          <!-- Gestor approval message -->
          <template
            v-else-if="isGestor && userRequestData.status_name === 'Pendente' && isSameInstitution"
          >
            <p>
              Você está aprovando esta solicitação como gestor. Após sua aprovação,
              um administrador poderá conceder o acesso final.
            </p>
          </template>

          <!-- Status messages for different scenarios -->
          <template v-else-if="isAdministrator && userRequestData.status_name === 'Concedida'">
            <p>Esta solicitação já foi concedida.</p>
          </template>

          <template
            v-else-if="isGestor && userRequestData.status_name === 'Pendente' && !isSameInstitution"
          >
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
            <template
              v-if="isGestor && userRequestData.status_name == 'Pendente'"
            >
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
            <template
              v-if="isAdministrator && userRequestData.status_name === 'Aprovado pelo Gestor'"
            >
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
      :save-active="!!gestorDeniedDetails"
      @save="updateGestorDeniedDetails"
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
      :save-active="!!deniedDetails"
      @save="updateDeniedDetails"
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
    "enter-institution-name": "Enter the institution name",
    "institution": "Institution",
    "roles": "Roles",
    "select-institution": "Select an institution",
    "no-institutions-found": "No institutions found",
    "select-at-least-one-role": "Select at least one role",
    "selection-summary": "Selection Summary"
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
    "enter-institution-name": "Digite o nome da instituição",
    "institution": "Instituição",
    "roles": "Funções",
    "select-institution": "Selecione uma instituição",
    "no-institutions-found": "Nenhuma instituição encontrada",
    "select-at-least-one-role": "Selecione pelo menos uma função",
    "selection-summary": "Resumo da Seleção"
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
      institutionSearch: '',
    };
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
    institutionOptions() {
      return this.institutionList.map((institution) => ({
        id: institution.id,
        name: institution.name,
        description: institution.description || '',
      }));
    },
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
      const statusName = this.userRequestData.status_name;
      // Gestor pode interagir com status 'Pendente' e mesma instituição
      // Administrador pode interagir com qualquer status
      return (this.isGestor && statusName === 'Pendente' && this.isSameInstitution)
        || (this.isAdministrator && ['Pendente', 'Aprovado pelo Gestor', 'Recusada', 'Concedida'].includes(statusName));
    },
    wrappedPermissionsList() {
      return this.roles.filter((item) => this.selectedRoles.includes(item.id))
        .map((item) => item.name);
    },
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
  methods: {
    filterInstitutions(item, queryText) {
      const text = queryText || '';
      return item.name.toLowerCase().includes(text.toLowerCase());
    },
    getInstitutionName(institutionId) {
      const institution = this.institutionList.find((inst) => inst.id === institutionId);
      return institution ? institution.name : '';
    },
    getRoleName(roleId) {
      const role = this.rolesList.find((r) => r.id === roleId);
      return role ? role.name : '';
    },
    openDialog() {
      this.dialog = true;
    },
    async gestorApprove() {
      try {
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
    updateDeniedDetails() {
      try {
        // Dispatch the action to reject the access request
        this.$store.dispatch('admin/deniedAccessRequest', {
          id: this.userRequestData.id,
          denied_details: this.deniedDetails,
        }).then((response) => {
          console.log('Request denied successfully!');

          // Close the dialog and refresh the request list
          this.showDeniedDetails = false;
          this.dialog = false;
          console.log('Refreshing the request list');
          return this.$store.dispatch('admin/fetchRequestListAccess');
        }).catch((error) => {
          console.error('Error while denying the request:', error);
          console.error('Error details:', error.response);
        });
      } catch (error) {
        console.error('Error in updateDeniedDetails method:', error);
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

.permission-selection-container
  padding: 16px 0

.roles-container
  max-height: 300px
  overflow-y: auto

.role-checkbox
  padding: 4px 0

.role-checkbox >>> .v-input__control
  min-height: 32px

.permission-selection-container .v-card
  border: 1px solid #e0e0e0
  border-radius: 8px
  transition: all 0.3s ease

.permission-selection-container .v-card:hover
  box-shadow: 0 4px 8px rgba(0,0,0,0.1)

.v-chip
  margin: 2px
</style>
