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
            </v-form>
          </v-card-text>
        </CustomDialog>
      </v-col>
    </v-row>
    <div class="filter mt-4 mb-4">
      <StatusFilterUser
        @toggle-filters="toggleFilters"
        @filters-changed="applyFilters"
      />
    </div>
    <div
      v-if="showFilters"
      class="search mt-4"
    >
      <SearchFiltersUser :filters="filters" />
    </div>
    <div class="card--wrapper">
      <v-card>
        <v-card-title>
          Usuários
          <v-spacer />
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          />
        </v-card-title>
        <v-data-table
          v-if="filteredUsers.length"
          :headers="headers"
          :items="filteredUsers"
          class="elevation-1 mt-4"
          dense
          :search="search"
        >
          <template #item.is_staff="{ item }">
            <span>{{ item.is_staff ? 'ADM' : 'Comum' }}</span>
          </template>
          <template #item.is_active="{ item }">
            <div class="ml-8">
              <v-icon
                v-if="item.is_active"
                color="green"
              >
                mdi-check-circle
              </v-icon>
              <v-icon
                v-else
                color="red"
              >
                mdi-close-circle
              </v-icon>
            </div>
          </template>

          <template #item.editar="{ item }">
            <v-icon
              color="#000"
              @click="openEditDialog(item)"
            >
              mdi-pencil
            </v-icon>
          </template>

          <!-- <template v-slot:item.logs="{ item }">
                        <v-icon color="#000" @click="openLogsDialog(item)">
                            mdi-menu
                        </v-icon>
                    </template> -->
        </v-data-table>
      </v-card>
    </div>
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
        "max-characters": "Maximum of {max} characters allowed."
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
        "max-characters": "Máximo de {max} caracteres permitido."
        }
    }
</i18n>

<script>
import { mapState, mapActions } from 'vuex';
import GraphicBar from '/components/admin/GraphicBar.vue';
import StatusFilterUser from '/components/admin/StatusFilterUser.vue';
import SearchFiltersUser from '/components/admin/SearchFiltersUser.vue';
import CustomDialog from '/components/admin/CustomDialog.vue';
import SavePdfUser from '/components/admin/SavePdfUser.vue';

export default {
  name: 'Usuarios',
  components: {
    GraphicBar,
    StatusFilterUser,
    SearchFiltersUser,
    CustomDialog,
    SavePdfUser,
  },
  layout: 'admin',
  data() {
    return {
      search: '',
      showModalEdit: false,
      selectedInstitution: null,
      users: [],
      filteredUsers: [],
      headers: [
        { text: 'Nome', value: 'username' },
        { text: 'Email', value: 'email' },
        { text: 'Tipo de usuário', value: 'is_staff' },
        { text: 'Acesso Permitido', value: 'is_active' },
        { text: 'Instituição', value: 'institution' },
        { text: 'Editar', value: 'editar' },
        // { text: 'Logs', value: 'logs' },
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
    };
  },

  async mounted() {
    await this.fetchInstitutionList();
    this.fetchUsers();
  },

  computed: {
    totalValue() {
      return this.storeCategories.reduce(
        (acc, category) => acc + category.total,
        0,
      );
    },

    ...mapState('admin', ['institutionList']),
  },

  methods: {
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

    async addUser() {
      try {
        const response = await this.$api.post(
          '/user/',
          {
            username: this.newUser.username,
            email: this.newUser.email,
            institution_id: this.newUser.institution_id,
          },
        );
        if (response.status === 201) {
          this.showModal = false;
          this.fetchUsers();
          this.resetForm();
        }
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
      }
    },

    resetForm() {
      this.newUser = { username: '', email: '', institution: '' };
      this.editUserData = {
        id: null,
        username: '',
        email: '',
        institution_id: null,
        is_inactive: false,
      };
      this.selectedInstitution = null;
      this.$refs.form.resetValidation();
    },

    async editUser() {
      try {
        if (!this.editUserData.id) {
          throw new Error('ID do usuário não definido.');
        }
        const response = await this.$api.patch(
          `/user/${this.editUserData.id}/`,
          {
            username: this.editUserData.username,
            email: this.editUserData.email,
            institution_id: this.editUserData.institution_id,
            is_active: !this.editUserData.is_inactive,
          },
        );

        if (response.status === 200) {
          this.showModalEdit = false;
          this.fetchUsers();
          this.resetForm();
        } else {
          throw new Error('Resposta inesperada da API.');
        }
      } catch (error) {
        console.error('Erro ao editar usuário:', error);
      }
    },

    openEditDialog(user) {
      this.editUserData = {
        id: user.id,
        username: user.username,
        email: user.email,
        institution_id: user.institution_id,
        is_inactive: !user.is_active,
      };
      this.selectedInstitution = user.institution;
      this.showModalEdit = true;
    },

    toggleFilters() {
      this.showFilters = !this.showFilters;
    },

    generateCSV() {
      // Cabeçalho do CSV
      const headers = ['Nome', 'Email', 'Acesso Permitido', 'Instituição'];
      const rows = this.filteredUsers.map((user) => [
        user.username,
        user.email,
        user.is_active ? 'Ativo' : 'Inativo',
        user.institution,
      ]);

      // Cria o conteúdo do CSV
      const csvContent = [
        headers.join(','), // Cabeçalho
        ...rows.map((row) => row.join(',')), // Dados
      ].join('\n');

      // Cria um link para download
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'usuarios.csv'; // Nome do arquivo
      link.click(); // Dispara o download
      URL.revokeObjectURL(link.href); // Limpa o objeto URL
    },

    ...mapActions('admin', ['fetchInstitutionList']),
  },
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
    grid-template-columns: repeat(auto-fit, minmax(350px,1fr))
    gap: 1rem

.wrapper
    display: flex
    flex-direction: row
    align-items: center
    justify-content: space-between

</style>
