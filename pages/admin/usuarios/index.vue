<template>
  <div class="user">
    <span class="d-flex align-center justify-space-between">
      <h1>{{ $t('manageUsers') }}</h1>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            color="primary"
            text
            v-bind="attrs"
            v-on="on"
            @click="$router.push('/cmr')"
          >
            <v-icon color="primary">mdi-home</v-icon>
          </v-btn>
        </template>
        <span>Ir para o CMR</span>
      </v-tooltip>
    </span>
    <v-row class="mt-4">
      <v-col>
        <v-card
          class="pa-5 pb-2"
          style="max-width: 750px"
        >
          <GraphicBar
            v-for="(category, index) in storeCategories"
            :key="index"
            :category="category"
            :max-value="totalValue"
          />
        </v-card>
      </v-col>
      <v-col class="d-flex flex-column justify-space-between">
        <v-btn
          color="#FFCE03"
          width="100%"
          class="pa-5"
          @click="showModal = true"
        >
          <strong>{{ $t('addNewUser') }}</strong>
          <v-spacer />
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <CustomDialog
          v-model="showModal"
          title="Novo Usuário"
          max-width="500px"
          :has-cta="true"
          :save-active="formValid"
          @save="addUser"
        >
          <v-card-text>
            <v-form
              ref="form"
              v-model="formValid"
            >
              <v-row class="pa-3">
                <v-text-field
                  v-model="newUser.username"
                  label="Nome"
                  :rules="[requiredRule]"
                />
                <v-spacer />
                <v-text-field
                  v-model="newUser.email"
                  label="E-mail"
                  :rules="[requiredRule, emailRule]"
                />
              </v-row>
              <v-select
                v-model="newUser.institution_id"
                :label="$t('institution')"
                :items="institutionList"
                item-text="name"
                item-value="id"
                :rules="[requiredRule]"
                required
              />

              <UserManager
                :available-roles="rolesList"
                :selected-roles="newUser.roles || []"
                mode="create"
                @add-role="addRoleToNewUser"
                @remove-role="removeRoleFromNewUser"
              />
            </v-form>
          </v-card-text>
        </CustomDialog>
        <div class="d-flex justify-space-between align-center">
          <p class="text-uppercase">
            <strong>{{ $t('export') }}</strong> {{ $t('as') }}
          </p>
          <div class="d-flex">
            <div class="styled-btn">
              <SavePdfUser :users="filteredUsers" />
            </div>
            <div class="line-separator" />
            <div
              class="styled-btn"
              style="cursor: pointer"
              @click="generateCSV"
            >
              <v-img src="/img/icons/file-excel-box.svg" />
              <p class="text-center">
                CSV
              </p>
            </div>
          </div>
        </div>
        <CustomDialog
          v-model="showLogsModal"
          title="Logs do Usuário"
          width="1200"
          :has-cta="false"
        >
         <p class="text-h6">
            <strong>Registro de acesso do usuário</strong>
          </p>
          <v-card-text>
        <v-simple-table dense class="mt-6">
  <thead>
    <tr>
      <th>Data de Login</th>
      <th>IP</th>
      <th>Localização</th>
      <th>Dispositivo</th>
      <th>Navegador</th>
      <th>Latitude</th>
      <th>Longitude</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="login in userLoginHistory" :key="login.id">
      <td>{{ login.last_date_login }}</td>
      <td>{{ login.ip }}</td>
      <td>{{ login.location }}</td>
      <td>{{ login.type_device }}</td>
      <td>{{ login.browser }}</td>
      <td>{{ login.latitude }}</td>
      <td>{{ login.longitude }}</td>
    </tr>
  </tbody>
</v-simple-table>
</v-card-text>

<div v-if="!userLoginHistory.length" class="text-center mt-2">
  Nenhum histórico de login encontrado.
</div>
 <p class="text-h6">
            <strong>Dados Cadastrais</strong>
          </p>
          <v-card-text>
            <v-simple-table dense>
              <thead>
                <tr>
                  <th>Alterado por</th>
                  <th>Alterado em</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Instituição</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in userLogs" :key="log.id">
                  <td>{{ log.alterado_por }}</td>
                  <td>{{ new Date(log.action_time).toLocaleString('pt-BR') }}</td>
                  <td>{{ log.username }}</td>
                  <td>{{ log.email }}</td>
                  <td>{{ log.institution }}</td>
                  <td>
                    <v-icon
                      :color="log.is_active ? 'green' : 'red'"
                      small
                    >
                      {{ log.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                    {{ log.is_active ? 'Ativo' : 'Inativo' }}
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
            <div
              v-if="!userLogs || !userLogs.length"
              class="text-center mt-4"
            >
              Nenhum log encontrado para este usuário.
            </div>
          </v-card-text>

          <p class="text-h6">
  <strong>Histórico de Alterações de Papéis de Acesso</strong>
</p>
<v-card-text>
  <v-simple-table dense>
    <thead>
      <tr>
        <th>Alterado Por</th>
        <th>Data/Hora</th>
        <th>Ação</th>
        <th>Papel</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="change in userRoleChanges" :key="change.id">
        <td>{{ change.changed_by }}</td>
        <td>{{ change.changed_at }}</td>
        <td>{{ change.action }}</td>
        <td>{{ change.role }}</td>
      </tr>
    </tbody>
  </v-simple-table>
  <div v-if="!userRoleChanges.length" class="text-center mt-4">
    Nenhuma alteração de grupo encontrada para este usuário.
  </div>
</v-card-text>
        </CustomDialog>
        <CustomDialog
          v-model="showModalEdit"
          title="Editar Usuário"
          max-width="500px"
          :has-cta="true"
          :save-active="formValid"
          @save="editUser"
        >
          <v-card-text>
            <v-form
              ref="form"
              v-model="formValid"
            >
              <v-row class="pa-3">
                <v-text-field
                  v-model="editUserData.username"
                  label="Nome"
                  :rules="[requiredRule]"
                />
                <v-spacer />
                <v-text-field
                  v-model="editUserData.email"
                  label="E-mail"
                  :rules="[requiredRule, emailRule]"
                />
              </v-row>
              <v-select
                v-model="editUserData.institution_id"
                :label="$t('institution')"
                :items="institutionList"
                item-text="name"
                item-value="id"
                :rules="[requiredRule]"
                required
              />
              <v-checkbox
                v-model="editUserData.is_inactive"
                label="Inativo"
                class="mt-n2"
              />
              <UserManager
                :available-roles="rolesList"
                :selected-roles="editUserData.roles || []"
                mode="edit"
                @add-role="addRoleToUser"
                @remove-role="removeRoleFromUser"
              />
            </v-form>
          </v-card-text>
        </CustomDialog>
      </v-col>
    </v-row>
    <div
      v-if="showFilters"
      class="search mt-4"
    >
      <SearchFiltersUser :filters="filters" />
    </div>
    <v-card class="mt-4 pa-4">
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="font-weight-bold">Usuários</span>

        <!-- botão para escolher colunas -->
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <v-btn text small v-bind="attrs" v-on="on">
              Selecionar colunas
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item v-for="h in headers" :key="h.value">
              <v-list-item-action>
                <v-checkbox
                  v-model="visibleColumns"
                  :value="h.value"
                  dense
                  hide-details
                />
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ h.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
         <!-- pesquisa geral -->
         <v-text-field
           v-model="searchAll"
           placeholder="Pesquisar tudo"
           append-icon="mdi-magnify"
           clearable
           dense
           hide-details
           class="ml-4"
           @click.stop
         />
      </div>

      <v-data-table
        v-if="filteredUsers.length"
        :headers="filteredHeaders"
        :items="filteredByColumns"
        class="elevation-1 mt-4"
        dense
        :search="search"
      >
        <!-- filtro Nome -->
<template #header.username="{ header }">
  <v-menu
    v-model="usernameMenu"
    offset-y
    :close-on-content-click="false"
  >
    <template #activator="{ on, attrs }">
      <v-btn text small v-bind="attrs" v-on="on">
        {{ header.text }}<v-icon small>mdi-filter-variant</v-icon>
      </v-btn>
    </template>
    <v-card style="width:250px">
      <v-text-field
        v-model="searchUsername"
        placeholder="Pesquisar..."
        outlined dense hide-details clearable
        class="mx-3 mt-3" @click.stop
      />
      <v-divider/>
      <v-list dense class="filter-list">
        <v-list-item
          v-for="name in filteredUsernameList" :key="name"
        >
          <v-checkbox
            v-model="columnFilters.username"
            :value="name" :label="name"
            dense @change="usernameMenu = false"
          />
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<!-- filtro Email -->
<template #header.email="{ header }">
  <v-menu
    v-model="emailMenu"
    offset-y
    :close-on-content-click="false"
  >
    <template #activator="{ on, attrs }">
      <v-btn text small v-bind="attrs" v-on="on">
        {{ header.text }}<v-icon small>mdi-filter-variant</v-icon>
      </v-btn>
    </template>
    <v-card style="width:250px">
      <v-text-field
        v-model="searchEmail"
        placeholder="Pesquisar..."
        outlined dense hide-details clearable
        class="mx-3 mt-3" @click.stop
      />
      <v-divider/>
      <v-list dense class="filter-list">
        <v-list-item
          v-for="mail in filteredEmailList" :key="mail"
        >
          <v-checkbox
            v-model="columnFilters.email"
            :value="mail" :label="mail"
            dense @change="emailMenu = false"
          />
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<!-- filtro Administrador -->
<template #header.is_staff="{ header }">
  <v-menu offset-y>
    <template #activator="{ on, attrs }">
      <v-btn text small v-bind="attrs" v-on="on">
        {{ header.text }}
        <v-icon small class="ml-1">mdi-filter-variant</v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item>
        <v-checkbox
          v-model="columnFilters.is_staff"
          :value="true"
          label="Sim"
          dense
        />
      </v-list-item>
      <v-list-item>
        <v-checkbox
          v-model="columnFilters.is_staff"
          :value="false"
          label="Não"
          dense
        />
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<!-- filtro Acesso Permitido -->
<template #header.is_active="{ header }">
  <v-menu offset-y>
    <template #activator="{ on, attrs }">
      <v-btn text small v-bind="attrs" v-on="on">
        {{ header.text }}
        <v-icon small class="ml-1">mdi-filter-variant</v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item>
        <v-checkbox
          v-model="columnFilters.is_active"
          :value="true"
          label="Ativo"
          dense
        />
      </v-list-item>
      <v-list-item>
        <v-checkbox
          v-model="columnFilters.is_active"
          :value="false"
          label="Inativo"
          dense
        />
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<!-- filtro Instituição -->
<template #header.institution="{ header }">
  <v-menu
    v-model="institutionMenu"
    offset-y
    :close-on-content-click="false"
  >
    <template #activator="{ on, attrs }">
      <v-btn text small v-bind="attrs" v-on="on">
        {{ header.text }}
        <v-icon small class="ml-1">mdi-filter-variant</v-icon>
      </v-btn>
    </template>
    <v-card style="width:250px">
      <v-text-field
        v-model="searchInstitution"
        placeholder="Pesquisar..."
        outlined
        dense
        hide-details
        clearable
        class="mx-3 mt-3"
        @click.stop
      />
      <v-divider/>
      <v-list dense class="filter-list">
        <v-list-item
          v-for="inst in filteredInstitutionList"
          :key="inst.id"
        >
          <v-checkbox
            v-model="columnFilters.institution"
            :value="inst.name"
            :label="inst.name"
            dense
            @change="institutionMenu = false"
          />
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

        <template #item.actions="{ item }">
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn icon small color="grey darken-2" v-bind="attrs" v-on="on" @click="openEditDialog(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Editar</span>
            </v-tooltip>
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn icon small color="primary" v-bind="attrs" v-on="on" @click="openLogsDialog(item)">
                  <v-icon>mdi-menu</v-icon>
                </v-btn>
              </template>
              <span>Logs</span>
            </v-tooltip>
          </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<i18n>
    {
        "en": {
        "manageUsers": "Manage Users",
        "addNewUser": "Add new user",
        "export": "Export",
        "as": "As",
        "noFileSelected": "No file selected",
        "attachFile": "Attach File",
        "approveRequestCreation": "Approve request upon creation",
        "description": "Description",
        "subject": "Subject",
        "institution": "institution",
        "requestType": "Request Type",
        "field-required": "Field Required",
        "max-characters": "Maximum of {max} characters allowed.",
        "add-user": "User added successfully!",
        "erro-add-user": "Error adding user",
        "changed-user": "User changed successfully!",
        "erro-create-user": "Error creating user"

        },
        "pt-br": {
        "manageUsers": "Gerenciar Usuários",
        "addNewUser": "Adicionar novo usuário",
        "export": "Exportar",
        "as": "Como",
        "noFileSelected": "Nenhum arquivo selecionado",
        "attachFile": "Anexar Arquivo",
        "approveRequestCreation": "Deferir solicitação na criação",
        "description": "Descrição",
        "subject": "Assunto",
        "institution": "Instituição",
        "requestType": "Tipo de Solicitação",
        "field-required": "Campo obrigatório",
        "max-characters": "Máximo de {max} caracteres permitido.",
        "add-user": "Usuário adicionado com sucesso!",
        "erro-add-user": "Erro ao adicionar usuário",
        "changed-user": "Usuário alterado com sucesso!",
        "erro-create-user": "Erro ao criar usuário"
        }
    }
</i18n>

<script>
import { mapState, mapActions } from 'vuex';
import GraphicBar from '/components/admin/GraphicBar.vue';
import SearchFiltersUser from '/components/admin/SearchFiltersUser.vue';
import CustomDialog from '/components/admin/CustomDialog.vue';
import SavePdfUser from '/components/admin/SavePdfUser.vue';
import UserManager from '/components/admin/UserManager.vue';

export default {
  name: 'Usuarios',
  components: {
    GraphicBar,
    SearchFiltersUser,
    CustomDialog,
    SavePdfUser,
    UserManager,
  },
  layout: 'admin',

  data() {
    return {
          userLoginHistory: [], // novo array
      showLogsModal: false,
      userLogs: [],
      selectedUserLogs: null,
      search: '',
      showModalEdit: false,
      selectedInstitution: null,
      users: [],
      filteredUsers: [],
      showLogsModal: false,
      userLogs: [],
      selectedUserLogs: null,
      headers: [
        { text: 'Nome', value: 'username' },
        { text: 'Email', value: 'email' },
        { text: 'Administrador', value: 'is_staff' },
        { text: 'Acesso Permitido', value: 'is_active' },
        { text: 'Instituição', value: 'institution' },
        { text: 'Ações', value: 'actions', align: 'center' },
      ],
      filters: {
        active: false,
        inactive: false,
        adm: false,
        common: false,
      },
      showFilters: false,
      showModal: false,
      formValid: false,
      newUser: {
        username: '',
        email: '',
        institution_id: null,
        roles: [],
      },
      editUserData: {
        id: null,
        username: '',
        email: '',
        institution_id: null,
      },
      storeCategories: [
        { label: 'usuários ativos', total: 0, color: '#12A844' },
        { label: 'usuários inativos', total: 0, color: '#D92B3F' },
        { label: 'usuários admin', total: 0, color: '#F58A1F' },
      ],
      requiredRule: (v) => !!v || 'Campo obrigatório',
      emailRule: (v) => /.+@.+\..+/.test(v) || 'E-mail inválido',
      userRoleChanges: [],
      visibleColumns: ['username','email','is_staff','is_active','institution','actions'],
      columnFilters: {
        is_staff: [],    // [true, false]
        is_active: [],   // [true, false]
        institution: [],
        username: [],
        email: [],
      },
      searchInstitution: '',
      institutionMenu: false,
      usernameMenu: false,
      emailMenu: false,
      searchUsername: '',
      searchEmail: '',
      searchAll: '',
    };
  },
  watch: {
    searchAll(val) {
      this.search = val;
    }
  },
  computed: {
    totalValue() {
      return this.storeCategories.reduce(
        (acc, category) => acc + category.total,
        0,
      );
    },

    filteredHeaders() {
      return this.headers.filter(h => this.visibleColumns.includes(h.value));
    },

    filteredByColumns() {
      return this.filteredUsers.filter(user => {
        // para cada filtro de coluna
        return Object.entries(this.columnFilters).every(([col, vals]) => {
          return !vals.length || vals.includes(user[col]);
        });
      });
    },

    filteredInstitutionList() {
      const term = (this.searchInstitution || '').toLowerCase();
      return this.institutionList.filter(inst =>
        inst.name.toLowerCase().includes(term)
      );
    },

    filteredUsernameList() {
      const term = (this.searchUsername||'').toLowerCase();
      return [...new Set(this.filteredUsers.map(u=>u.username))]
        .filter(v => v.toLowerCase().includes(term));
    },

    filteredEmailList() {
      const term = (this.searchEmail||'').toLowerCase();
      return [...new Set(this.filteredUsers.map(u=>u.email))]
        .filter(v => v.toLowerCase().includes(term));
    },

    ...mapState('admin', ['institutionList', 'rolesList']),
  },

  async mounted() {
    await this.fetchInstitutionList();
    await this.fetchRoles();
    this.fetchUsers();
  },

  methods: {
     parseChangedFields(changeMessage) {
    try {
      const parsed = JSON.parse(changeMessage);
      if (Array.isArray(parsed) && parsed[0]?.changed?.fields) {
        return parsed[0].changed.fields;
      }
      return [];
    } catch (e) {
      return [];
    }
  },
    async openLogsDialog(user) {
      this.selectedUserLogs = user;
      this.showLogsModal = true;

      try {
        const [logsResponse, loginResponse, roleChangesResponse] = await Promise.all([
          this.$api.get(`/history/logs/?user_id=${user.id}`),
          this.$api.get(`/dashboard/get-user-login/?user_id=${user.id}`),
          this.$api.get(`/history/role-changes/?user_id=${user.id}`)
        ]);

        this.userLogs = logsResponse.data;
        this.userLoginHistory = loginResponse.data;
        this.userRoleChanges = roleChangesResponse.data;

      } catch (e) {
        this.userLogs = [];
        this.userLoginHistory = [];
        this.userRoleChanges = [];
      }

    },
    async fetchRoles() {
      try {s
        const response = await this.$api.get('/user/role/');
        this.$store.commit('admin/setRolesList', response.data);
      } catch (error) {
        console.error('Erro ao carregar roles:', error);
      }
    },

    applyFilters(filters) {
      this.filters = filters;
      this.filterUsers();
    },

    filterUsers() {
      this.filteredUsers = this.users.filter((user) => {
        const matchesActive = this.filters.active
          ? user.is_active
          : true;
        const matchesInactive = this.filters.inactive
          ? !user.is_active
          : true;
        const matchesAdm = this.filters.adm ? user.is_staff : true;
        const matchesCommon = this.filters.common
          ? !user.is_staff
          : true;
        return (
          matchesActive
                    && matchesInactive
                    && matchesAdm
                    && matchesCommon
        );
      });
    },

    async fetchUsers() {
      try {
        const response = await this.$api.get('/user/');
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.users = response.data;
          this.filteredUsers = this.users;
          this.updateStoreCategories();
        } else {
          console.warn('Nenhum usuário encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    },

    updateStoreCategories() {
      const activeUsers = this.users.filter(
        (user) => user.is_active,
      ).length;
      const inactiveUsers = this.users.filter(
        (user) => !user.is_active,
      ).length;
      const adminUser = this.users.filter((user) => user.is_staff).length;
      this.storeCategories[0].total = activeUsers;
      this.storeCategories[1].total = inactiveUsers;
      this.storeCategories[2].total = adminUser;
    },

    addRoleToNewUser(role) {
      if (!this.newUser.roles) {
        this.$set(this.newUser, 'roles', []);
      }
      if (!this.newUser.roles.some((r) => r.id === role.id)) {
        this.newUser.roles.push(role);
      }
    },

    removeRoleFromNewUser(role) {
      this.newUser.roles = this.newUser.roles.filter((r) => r.id !== role.id);
    },

    addRoleToUser(role) {
      if (!this.editUserData.roles.some(r => r.id === role.id)) {
        this.editUserData.roles = [...this.editUserData.roles, role];
      }
    },

    removeRoleFromUser(role) {
      this.editUserData.roles = this.editUserData.roles.filter(r => r.id !== role.id);
    },

    async addUser() {
      try {
        const payload = {
          username: this.newUser.username,
          email: this.newUser.email,
          institution_id: this.newUser.institution_id,
          roles: this.newUser.roles.map((role) => role.id),
        };

        const response = await this.$api.post('/user/', payload);

        if (response.status === 201) {
          this.showModal = false;
          this.fetchUsers();
          this.resetForm();
          this.$store.commit('alert/addAlert', {
            timeout: 3000,
            message: this.$t('add-user'),
          });
        }
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
        this.$store.commit('alert/addAlert', {
          timeout: 3000,
          message: this.$t('erro-add-user'),
        });
      }
    },

    resetForm() {
      this.newUser = {
        username: '',
        email: '',
        institution_id: null,
        roles: [],
      };
      this.editUserData = {
        id: null,
        username: '',
        email: '',
        institution_id: null,
        is_inactive: false,
        roles: [],
      };
      this.selectedInstitution = null;
      this.$refs.form.resetValidation();
    },

    async editUser() {
      try {
        if (!this.editUserData.id) {
          throw new Error('ID do usuário não definido.');
        }

        const payload = {
          username: this.editUserData.username,
          email: this.editUserData.email,
          institution_id: this.editUserData.institution_id,
          is_active: !this.editUserData.is_inactive,
          roles: this.editUserData.roles.map((role) => role.id),
        };

        const response = await this.$api.patch(
          `/user/${this.editUserData.id}/`,
          payload,
        );

        if (response.status === 200) {
          this.showModalEdit = false;
          this.fetchUsers();
          this.resetForm();
          this.$store.commit('alert/addAlert', {
            timeout: 3000,
            message: this.$t('changed-user'),
          });
        } else {
          throw new Error('Resposta inesperada da API.');
        }
      } catch (error) {
        console.error('Erro ao editar usuário:', error);
        this.$store.commit('alert/addAlert', {
          timeout: 3000,
          message: this.$t('erro-create-user'),
        });
      }
    },

    async openEditDialog(user) {
      try {
      // Busca os dados do usuário e as roles disponíveis simultaneamente
        const [userResponse, rolesResponse] = await Promise.all([
          this.$api.get(`/user/${user.id}/`),
          this.$api.get('/user/role/'),
        ]);

        const userData = userResponse.data;
        const rolesList = rolesResponse.data;

        this.editUserData = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          institution_id: userData.institution_id,
          is_inactive: !userData.is_active,
          roles: userData.roles || [],
        };

        // Atualiza a lista de roles disponíveis no store
        this.$store.commit('admin/setRolesList', rolesList);

        this.showModalEdit = true;
      } catch (error) {
        console.error('Erro ao buscar dados:', error);

        this.editUserData = {
          id: user.id,
          username: user.username,
          email: user.email,
          institution_id: user.institution_id,
          is_inactive: !user.is_active,
          roles: user.roles || [],
        };
        this.showModalEdit = true;
      }
    },

    generateCSV() {
      // Cabeçalho do CSV
      const headers = ['Nome', 'Email', 'Acesso Permitido', 'Instituição'];
      const rows = this.filteredUsers.map(user => [
        user.username,
        user.email,
        user.is_active ? 'Ativo' : 'Inativo',
        user.institution,
      ]);
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'usuarios.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    },

    ...mapActions('admin', ['fetchInstitutionList']),
  }
};
</script>

<style lang="sass" scoped>
.line-separator
    border: 1px solid #9A9997
    margin: 1rem 0

.user
    height: 100vh
    overflow-y: auto
    width: 100%
    padding: 2rem

.styled-btn
    padding: 1rem 1rem 0
    border-radius: 8px

.styled-btn:hover
    opacity: 0.8

.card--wrapper
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr))
    gap: 1rem

.wrapper
    display: flex
    flex-direction: row
    align-items: center
    justify-content: space-between

.filter-list
    max-height: 200px
    overflow-y: auto
</style>
