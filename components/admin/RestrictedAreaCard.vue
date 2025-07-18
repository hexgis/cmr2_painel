<template>
  <!-- ===== MAIN CARD ===== -->
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

    <!-- ===== MAIN MODAL ===== -->
    <v-dialog
      v-model="dialog"
      max-width="1400px"
      width="1400px"
      min-height="800px"
      persistent
      scrollable
    >
      <v-card class="modal-card">
        <!-- ===== MODAL HEADER ===== -->
        <v-card-title class="modal-header">
          <div class="d-flex align-center">
            <v-icon
              class="mr-5 header-icon"
              color="white"
              size="32"
            >
              mdi-account-details
            </v-icon>
            <div>
              <h3 class="modal-title">
                {{ $t('dialog-title') }}
              </h3>
              <p class="modal-subtitle mb-0">
                {{ $t('access-request-details') }}
              </p>
            </div>
          </div>
          <v-spacer />
          <v-btn
            icon
            color="white"
            class="close-btn"
            @click="dialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- ===== MAIN CONTENTL ===== -->
        <v-card-text class="modal-content">
          <!-- ===== SECTION: USER INFO ===== -->
          <div class="info-section">
            <div class="section-header" />
            <v-row class="user-info-row">
              <v-col
                cols="12"
                class="user-info-col"
              >
                <div class="info-card main-info-card">
                  <div class="info-header">
                    <v-icon
                      color="#D92B3F"
                      class="mr-2"
                      size="20"
                    >
                      mdi-account-circle
                    </v-icon>
                    <span class="info-label">{{ $t('user-information') }}</span>
                  </div>
                  <div class="user-info-content">
                    <v-row>
                      <!-- SUB-SECTION: user details -->
                      <v-col
                        cols="12"
                        md="4"
                        class="info-subsection"
                      >
                        <div class="subsection-header">
                          <v-icon
                            color="#D92B3F"
                            class="mr-2"
                            size="16"
                          >
                            mdi-account
                          </v-icon>
                          <span class="subsection-title">{{ $t('user-details') }}</span>
                        </div>
                        <div class="info-details">
                          <div class="info-item">
                            <strong>{{ $t('server') }}:</strong> {{ userRequestData.name }}
                          </div>
                          <div class="info-item">
                            <strong>{{ $t('email') }}:</strong> {{ userRequestData.email }}
                          </div>
                          <div class="info-item">
                            <strong>{{ $t('siape-registration') }}:</strong>
                            {{ userRequestData.user_siape_registration || 'N/A' }}
                          </div>
                          <div class="info-item">
                            <strong>{{ $t('institution') }}:</strong>
                            <v-tooltip bottom>
                              <template #activator="{ on, attrs }">
                                <span
                                  class="institution-acronym"
                                  v-bind="attrs"
                                  v-on="on"
                                >
                                  {{ userRequestData.institution_acronym ||
                                    userRequestData.institution }}
                                </span>
                              </template>
                              <span>{{ userRequestData.institution }}</span>
                            </v-tooltip>
                          </div>
                        </div>
                      </v-col>
                      <!-- SUB-SECTION: Coordination Info -->
                      <v-col
                        cols="12"
                        md="4"
                        class="info-subsection"
                      >
                        <div class="subsection-header">
                          <v-icon
                            color="#D92B3F"
                            class="mr-2"
                            size="16"
                          >
                            mdi-account-tie
                          </v-icon>
                          <span class="subsection-title">{{ $t('coordination-info') }}</span>
                        </div>
                        <div class="info-details">
                          <div class="info-item">
                            <strong>{{ $t('coordinator') }}:</strong>
                            {{ userRequestData.coordinator_name || 'N/A' }}
                          </div>
                          <div class="info-item">
                            <strong>{{ $t('email') }}:</strong>
                            {{ userRequestData.coordinator_email || 'N/A' }}
                          </div>
                          <div class="info-item">
                            <strong>{{ $t('coordinator_siape_registration') }}:</strong>
                            {{ userRequestData.coordinator_siape_registration || 'N/A' }}
                          </div>
                          <div class="info-item">
                            <strong>{{ $t('institution') }}:</strong>
                            <v-tooltip bottom>
                              <template #activator="{ on, attrs }">
                                <span
                                  class="institution-acronym"
                                  v-bind="attrs"
                                  v-on="on"
                                >
                                  {{ userRequestData.coordinator_institution_acronym ||
                                    userRequestData.coordinator_institution }}
                                </span>
                              </template>
                              <span>{{ userRequestData.coordinator_institution }}</span>
                            </v-tooltip>
                          </div>
                        </div>
                      </v-col>
                      <!-- SUB-SECTION: Solicitation Status -->
                      <v-col
                        cols="12"
                        md="4"
                        class="info-subsection"
                      >
                        <div class="subsection-header">
                          <v-icon
                            color="#D92B3F"
                            class="mr-2"
                            size="16"
                          >
                            mdi-clipboard-text
                          </v-icon>
                          <span class="subsection-title">{{ $t('request-status') }}</span>
                        </div>
                        <RequestStatus :request-data="userRequestData" />
                      </v-col>
                    </v-row>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-divider class="section-divider" />

          <!-- ===== SECTION: PERMISSIONS (Adms Only) ===== -->
          <template v-if="canSeeInstitutionSection">
            <div class="permission-section">
              <v-row class="permission-row">
                <!-- SUB-SECTION: Institution -->
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-card
                    class="selection-card institution-card"
                    outlined
                  >
                    <v-card-title class="card-title">
                      <v-icon
                        color="#D92B3F"
                        class="mr-2"
                      >
                        mdi-domain
                      </v-icon>
                      {{ $t('institution') }}
                    </v-card-title>
                    <v-card-text class="card-content">
                      <v-autocomplete
                        v-model="selectedInstitution"
                        :items="filteredInstitutions"
                        item-text="name"
                        item-value="id"
                        :label="$t('select-institution')"
                        :placeholder="$t('search-institution-placeholder')"
                        outlined
                        dense
                        clearable
                        :search-input.sync="institutionSearch"
                        :no-data-text="institutionSearch ?
                          $t('no-institutions-found') :
                          $t('type-to-search')"
                        prepend-inner-icon="mdi-magnify"
                        hide-selected
                        persistent-hint
                        :hint="$t('search-institution-hint')"
                        class="institution-select"
                      >
                        <template #item="{ item }">
                          <div class="institution-item">
                            <v-icon
                              color="#D92B3F"
                              class="mr-3"
                            >
                              mdi-domain
                            </v-icon>
                            <div>
                              <div class="institution-name">
                                {{ item.name }}
                              </div>
                              <div
                                v-if="item.description"
                                class="institution-description"
                              >
                                {{ item.description }}
                              </div>
                            </div>
                          </div>
                        </template>
                        <template #selection="{ item }">
                          <div class="institution-selection">
                            <v-icon
                              color="#D92B3F"
                              class="mr-2"
                              small
                            >
                              mdi-domain
                            </v-icon>
                            <span class="selected-institution">{{ item.name }}</span>
                          </div>
                        </template>
                      </v-autocomplete>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- SUB-SECTION: Roles  -->
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-card
                    class="selection-card roles-card"
                    outlined
                  >
                    <v-card-title class="card-title">
                      <v-icon
                        color="#D92B3F"
                        class="mr-2"
                      >
                        mdi-account-group
                      </v-icon>
                      {{ $t('roles') }}
                    </v-card-title>
                    <v-card-text class="card-content">
                      <div class="roles-container">
                        <v-checkbox
                          v-for="item in rolesList"
                          :key="item.id"
                          v-model="selectedRoles"
                          :value="item.id"
                          :label="item.name"
                          dense
                          class="role-checkbox"
                          hide-details
                        >
                          <template #label>
                            <div class="role-label">
                              <v-icon
                                small
                                color="#D92B3F"
                                class="mr-2"
                              >
                                mdi-account-check
                              </v-icon>
                              <span class="role-name">{{ item.name }}</span>
                            </div>
                          </template>
                        </v-checkbox>
                        <div
                          v-if="selectedRoles.length === 0"
                          class="roles-hint"
                        >
                          {{ $t('select-at-least-one-role') }}
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- SUB-SECTION: Final Summary -->
              <div class="summary-section">
                <v-card
                  class="summary-card"
                  :class="{ 'summary-visible': selectedInstitution || selectedRoles.length > 0 }"
                  color="grey lighten-5"
                >
                  <v-card-title class="summary-title">
                    <v-icon
                      small
                      color="#D92B3F"
                      class="mr-2"
                    >
                      mdi-check-circle
                    </v-icon>
                    {{ $t('selection-summary') }}
                  </v-card-title>
                  <v-card-text class="summary-content">
                    <div
                      v-if="selectedInstitution"
                      class="summary-item"
                    >
                      <v-chip
                        color="black"
                        outlined
                        class="summary-chip"
                      >
                        <v-icon
                          left
                          small
                          color="black"
                        >
                          mdi-domain
                        </v-icon>
                        {{ getInstitutionName(selectedInstitution) }}
                      </v-chip>
                    </div>
                    <div
                      v-if="selectedRoles.length > 0"
                      class="summary-item"
                    >
                      <v-chip
                        v-for="roleId in selectedRoles"
                        :key="roleId"
                        color="black"
                        outlined
                        class="summary-chip"
                      >
                        <v-icon
                          left
                          small
                          color="black"
                        >
                          mdi-account-check
                        </v-icon>
                        {{ getRoleName(roleId) }}
                      </v-chip>
                    </div>
                    <div
                      v-if="!selectedInstitution && selectedRoles.length === 0"
                      class="summary-placeholder"
                    >
                      {{ $t('no-selections-yet') }}
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </template>

          <!-- ===== SECTION: STATUS MESSAGES (Normal User/Gestor) ===== -->
          <template v-else>
            <div class="status-section">
              <v-card
                class="status-card"
                outlined
              >
                <v-card-text class="status-content">
                  <template
                    v-if="isGestor && userRequestData.status_name === 'Pendente'
                      && isSameInstitution"
                  >
                    <v-icon
                      color="info"
                      class="mr-2"
                    >
                      mdi-information
                    </v-icon>
                    <span>{{ $t('gestor-approval-message') }}</span>
                  </template>

                  <template
                    v-else-if="isAdministrator
                      && userRequestData.status_name === 'Concedida'"
                  >
                    <v-icon
                      color="success"
                      class="mr-2"
                    >
                      mdi-check-circle
                    </v-icon>
                    <span>{{ $t('request-already-granted') }}</span>
                  </template>

                  <template
                    v-else-if="isGestor && userRequestData.status_name === 'Pendente'
                      && !isSameInstitution"
                  >
                    <v-icon
                      color="warning"
                      class="mr-2"
                    >
                      mdi-alert
                    </v-icon>
                    <span>{{ $t('same-institution-only') }}</span>
                  </template>

                  <template v-else-if="isCommonUser">
                    <v-icon
                      color="info"
                      class="mr-2"
                    >
                      mdi-information
                    </v-icon>
                    <span>{{ $t('requests-under-review') }}</span>
                  </template>

                  <template v-else>
                    <v-icon
                      color="error"
                      class="mr-2"
                    >
                      mdi-block-helper
                    </v-icon>
                    <span>{{ $t('no-permission-to-interact') }}</span>
                  </template>
                </v-card-text>
              </v-card>
            </div>
          </template>
        </v-card-text>

        <!-- ===== ACTIONS (BUTTONS) ===== -->
        <v-card-actions class="modal-actions">
          <v-spacer />

          <!-- AÇÕES: Usuário Comum -->
          <template v-if="isCommonUser">
            <v-btn
              text
              color="grey darken-1"
              @click="dialog = false"
            >
              <v-icon left>
                mdi-close
              </v-icon>
              {{ $t('close') }}
            </v-btn>
          </template>

          <!-- AÇÕES: Gestor -->
          <template v-else-if="isGestor && userRequestData.status_name == 'Pendente'">
            <v-btn
              text
              color="error"
              @click="showGestorDeniedDetails = true"
            >
              <v-icon left>
                mdi-close-circle
              </v-icon>
              {{ $t('reject') }}
            </v-btn>
            <v-btn
              color="success"
              @click="gestorApprove"
            >
              <v-icon left>
                mdi-check-circle
              </v-icon>
              {{ $t('approve-as-gestor') }}
            </v-btn>
          </template>

          <!-- AÇÕES: Administrador -->
          <template v-else-if="isAdministrator">
            <template v-if="userRequestData.status_name === 'Aprovado pelo Gestor'">
              <v-btn
                text
                color="error"
                @click="showDeniedDetails = true"
              >
                <v-icon left>
                  mdi-close-circle
                </v-icon>
                {{ $t('reject') }}
              </v-btn>
              <v-btn
                color="success"
                :disabled="!selectedInstitution || selectedRoles.length === 0"
                @click="adminApprove"
              >
                <v-icon left>
                  mdi-shield-check
                </v-icon>
                {{ $t('grant-access') }}
              </v-btn>
            </template>

            <template v-else-if="userRequestData.status_name == 'Pendente'">
              <v-btn
                text
                color="error"
                @click="showDeniedDetails = true"
              >
                <v-icon left>
                  mdi-close-circle
                </v-icon>
                {{ $t('reject') }}
              </v-btn>
              <v-btn
                color="primary"
                :disabled="!selectedInstitution || selectedRoles.length === 0"
                @click="adminApprove"
              >
                <v-icon left>
                  mdi-shield-check
                </v-icon>
                {{ $t('approve-as-administrator') }}
              </v-btn>
            </template>

            <template v-else-if="userRequestData.status_name == 'Recusada'">
              <v-btn
                color="warning"
                @click="gestorApprove"
              >
                <v-icon left>
                  mdi-refresh
                </v-icon>
                {{ $t('reactivate-request') }}
              </v-btn>
            </template>
          </template>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOGS ===== -->
    <!-- Dialog: Motivo da Recusa (Gestor) -->
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

    <!-- Dialog: Motivo da Recusa (Administrador) -->
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
    "access-request-details": "Access Request Details",
    "user-information": "User Information",
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
    "search-institution-placeholder": "Search for an institution...",
    "search-institution-hint": "Type at least 2 characters to search",
    "type-to-search": "Type to search institutions",
    "no-institutions-found": "No institutions found",
    "select-at-least-one-role": "Select at least one role",
    "selection-summary": "Selection Summary",
    "gestor-approval-message": "Approving as manager. After approval, admin can grant access.",
    "request-already-granted": "This request has already been granted.",
    "same-institution-only": "You can only approve requests from users of your institution.",
    "requests-under-review": "Your requests are being reviewed by managers and administrators.",
    "no-permission-to-interact": "You do not have permission to interact with this request.",
    "close": "Close",
    "reject": "Reject",
    "approve-as-gestor": "Approve as Manager",
    "grant-access": "Grant Access",
    "approve-as-administrator": "Approve as Administrator",
    "reactivate-request": "Reactivate Request",
    "no-selections-yet": "No selections made yet",
    "user-details": "User Details",
    "coordination-info": "Coordination Information",
    "request-status": "Request Status",
    "server": "Server",
    "email": "Email",
    "siape-registration": "SIAPE Registration",
    "coordinator_siape_registration": "Coordinator SIAPE Registration",
    "coordinator": "Coordinator"
  },
  "pt-br": {
    "choose-user-bond": "Escolha um vínculo para o usuário:",
    "dialog-title": "Detalhes",
    "access-request-details": "Detalhes da Solicitação de Acesso",
    "user-information": "Informações do Usuário",
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
    "search-institution-placeholder": "Pesquisar instituição...",
    "search-institution-hint": "Digite pelo menos 2 caracteres para pesquisar",
    "type-to-search": "Digite para pesquisar instituições",
    "no-institutions-found": "Nenhuma instituição encontrada",
    "select-at-least-one-role": "Selecione pelo menos uma função",
    "selection-summary": "Resumo da Seleção",
    "gestor-approval-message": "Aprovando como gestor. Após aprovação, admin pode conceder acesso.",
    "request-already-granted": "Esta solicitação já foi concedida.",
    "same-institution-only": "Você só pode aprovar solicitações de usuários da sua instituição.",
    "requests-under-review": "Suas solicitações são analisadas pelos gestores e administradores.",
    "no-permission-to-interact": "Você não tem permissão para interagir com esta solicitação.",
    "close": "Fechar",
    "reject": "Recusar",
    "approve-as-gestor": "Aprovar como Gestor",
    "grant-access": "Conceder Acesso",
    "approve-as-administrator": "Aprovar como Administrador",
    "reactivate-request": "Reativar Solicitação",
    "no-selections-yet": "Nenhuma seleção feita ainda",
    "user-details": "Detalhes do Usuário",
    "coordination-info": "Informações de Coordenação",
    "request-status": "Status da Solicitação",
    "server": "Servidor",
    "email": "Email",
    "siape-registration": "Matrícula SIAPE",
    "coordinator_siape_registration": "Matrícula SIAPE Coordenador",
    "coordinator": "Coordenador"
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
    filteredInstitutions() {
      if (!this.institutionSearch || this.institutionSearch.length < 2) {
        return this.institutionOptions;
      }
      const searchTerm = this.institutionSearch.toLowerCase();
      return this.institutionOptions.filter((institution) => institution.name.toLowerCase()
        .includes(searchTerm)
        || (institution.description
          && institution.description.toLowerCase().includes(searchTerm)));
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
    // ===== CHECK PERMISSIONS =====
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
    // ===== CHECK ROLES =====
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
      if (!this.user || !this.user.institution) {
        return false;
      }
      if (this.userRequestData.institution_id) {
        const userInstitution = this.institutionList.find(
          (inst) => inst.name === this.user.institution,
        );
        if (userInstitution) {
          return userInstitution.id === this.userRequestData.institution_id;
        }
      }

      if (this.userRequestData.institution) {
        return this.user.institution === this.userRequestData.institution;
      }

      return false;
    },
    canInteract() {
      const statusName = this.userRequestData.status_name;
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
    dialog(newValue) {
      if (newValue) {
        this.initializeFormData();
      }
    },
  },
  methods: {
    initializeFormData() {
      // Pré-selecionar a instituição do usuário se disponível
      if (this.userRequestData && this.userRequestData.institution_id) {
        const userInstitution = this.institutionList.find(
          (inst) => inst.id === this.userRequestData.institution_id,
        );
        if (userInstitution) {
          this.selectedInstitution = userInstitution.id;
        }
      } else if (this.userRequestData && this.userRequestData.institution) {
        // Fallback: buscar pelo nome se não tiver o ID
        const userInstitution = this.institutionList.find(
          (inst) => inst.name === this.userRequestData.institution,
        );
        if (userInstitution) {
          this.selectedInstitution = userInstitution.id;
        }
      }

      this.selectedRoles = [];
    },
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
    // ===== APPROVE ACTIONS =====
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
    // ===== DENIED ACTIONS =====
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
    updateDeniedDetails() {
      try {
        // Dispatch the action to reject the access request
        this.$store.dispatch('admin/deniedAccessRequest', {
          id: this.userRequestData.id,
          denied_details: this.deniedDetails,
        }).then(() => {
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

/* ===== MAIN CARD STYLE ===== */
.card
  width: 100%
  max-width: 750px
  min-height: 300px
  color: #5F5E5D

/* ===== MODAL STYLE ===== */
.modal-card
  border-radius: 12px
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1)
  min-height: 800px
  width: 100%
  max-width: 1400px

/* ===== MODAL HEADER ===== */
.modal-header
  background: linear-gradient(135deg, #D92B3F 0%, #B71C1C 100%)
  color: white
  padding: 24px 32px
  border-radius: 12px 12px 0 0
  display: flex
  align-items: center
  justify-content: space-between
  min-height: 80px

.header-icon
  font-size: 32px !important

.close-btn
  position: absolute
  right: 20px
  top: 20px

.modal-title
  font-size: 1.6rem
  font-weight: 600
  margin: 0

.modal-subtitle
  font-size: 1rem
  opacity: 0.9
  margin-top: 6px

/* ===== MODAL CONTENT ===== */
.modal-content
  padding: 32px
  background: #fafafa
  min-height: 650px

.modal-actions
  padding: 20px 32px
  background: white
  border-top: 1px solid #e0e0e0

/* ===== SECTION STYLES ===== */
.info-section,
.permission-section,
.status-section
  margin-bottom: 32px

.section-header
  display: flex
  align-items: center
  margin-bottom: 24px

.section-title
  font-size: 1.3rem
  font-weight: 600
  color: #2c3e50
  margin: 0

.section-divider
  margin: 32px 0
  background: #e0e0e0

/* ===== USER INFO STYLES ===== */
.user-info-row
  padding: 0
  gap: 16px
  margin-top: 8px

.user-info-col
  display: flex
  flex-direction: column
  padding: 0

.info-card
  background: white
  border-radius: 12px
  padding: 20px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
  border-left: 4px solid #D92B3F
  height: 100%
  transition: all 0.3s ease

.info-card:hover
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12)
  transform: translateY(-2px)

.main-info-card
  border-left: 4px solid #D92B3F
  min-height: 220px

.info-header
  display: flex
  align-items: center
  margin-bottom: 16px
  padding-bottom: 12px
  border-bottom: 2px solid #f0f0f0

.info-label
  font-weight: 600
  color: #2c3e50
  font-size: 1rem

.user-info-content
  margin-top: 8px

.info-subsection
  padding: 12px
  margin-bottom: 8px

.subsection-header
  display: flex
  align-items: center
  margin-bottom: 12px
  padding-bottom: 8px
  border-bottom: 1px solid #e8e8e8

.subsection-title
  font-weight: 600
  color: #D92B3F
  font-size: 0.9rem

.info-details
  padding: 8px 0

.info-item
  margin-bottom: 8px
  line-height: 1.5
  font-size: 0.95rem
  color: #2c3e50

.info-item strong
  color: #D92B3F
  font-weight: 600

.institution-acronym
  color: #2c3e50
  font-weight: 500
  cursor: help
  text-decoration: underline
  text-decoration-style: dotted
  text-decoration-color: #D92B3F

.institution-acronym:hover
  color: #D92B3F

/* ===== SELECTION CARDS STYLES ===== */
.selection-card
  height: 100%
  border-radius: 12px
  transition: all 0.3s ease
  background: white

.selection-card:hover
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12)
  transform: translateY(-3px)

.card-title
  font-size: 1.2rem
  font-weight: 600
  color: #2c3e50
  padding: 20px 20px 0 20px

.card-content
  padding: 20px

.institution-card
  border-left: 4px solid #D92B3F

.roles-card
  border-left: 4px solid #D92B3F

/* ===== INSTITUTIONS STYLES ===== */
.institution-select
  margin-top: 12px

.institution-select .v-text-field__slot input
  color: #000000 !important
  font-size: 1rem

.institution-select .v-select__selection--comma
  color: #000000 !important

.institution-select .v-label
  color: #000000 !important

.institution-item
  display: flex
  align-items: center
  padding: 16px 20px
  border-radius: 8px
  transition: background-color 0.2s

.institution-item:hover
  background-color: #f8f8f8

.institution-name
  font-weight: 500
  color: #2c3e50
  font-size: 1rem

.institution-description
  font-size: 0.85rem
  color: #7d7d7d
  margin-top: 4px

.institution-selection
  display: flex
  align-items: center

.selected-institution
  font-weight: 500
  color: #000000
  font-size: 1rem

/* ===== FUNCTION STYLES ===== */
.roles-container
  max-height: 300px
  overflow-y: auto
  padding: 12px 0

.role-checkbox
  margin: 6px 0
  padding: 12px
  border-radius: 8px
  transition: background-color 0.2s

.role-checkbox:hover
  background-color: #f8f8f8

.role-label
  display: flex
  align-items: center

.role-name
  font-weight: 500
  color: #2c3e50
  font-size: 1rem

.roles-hint
  font-size: 0.9rem
  color: #7d7d7d
  text-align: center
  padding: 20px
  font-style: italic

/* ===== SUMMARY STYLES ===== */
.summary-section
  margin-top: 24px
  min-height: 140px

.summary-card
  border-radius: 12px
  border: 1px solid #fce4e6
  border-left: 4px solid #D92B3F
  opacity: 0.5
  transition: opacity 0.3s ease

.summary-card.summary-visible
  opacity: 1

.summary-title
  font-size: 1.1rem
  font-weight: 600
  color: #D92B3F
  padding: 16px 20px 0 20px

.summary-content
  padding: 20px
  min-height: 80px

.summary-item
  margin-bottom: 12px

.summary-chip
  margin: 4px 6px 4px 0
  font-weight: 500
  font-size: 0.9rem

.summary-placeholder
  color: #9e9e9e
  font-style: italic
  text-align: center
  padding: 20px
  font-size: 1rem

/* ===== STATUS STYLE ===== */
.status-card
  border-radius: 12px
  border-left: 4px solid #D92B3F

.status-content
  padding: 24px
  display: flex
  align-items: center
  font-size: 1.1rem
  color: #2c3e50

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1440px)
  .modal-card
    max-width: 95vw
    min-height: 700px

@media (max-width: 960px)
  .modal-content
    padding: 20px
    min-height: 500px

  .user-info-row
    gap: 12px

  .info-card
    padding: 16px

  .section-title
    font-size: 1.2rem

  .modal-title
    font-size: 1.4rem

  .close-btn
    right: 12px
    top: 12px

  .modal-header
    padding: 20px 24px
    min-height: 70px
</style>
