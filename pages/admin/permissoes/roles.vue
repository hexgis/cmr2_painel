<template>
  <div class="group">
    <span class="d-flex align-center justify-space-between">
      <h1 class="text-uppercase">Gerenciamento de Papéis</h1>
      <v-btn
        color="primary"
        text
        @click="$router.back()"
      >
        <v-icon color="primary">mdi-arrow-left</v-icon>
      </v-btn>
    </span>
    <span class="card--wrapper mt-4">
      <template v-if="loadingRoles">
        <v-skeleton-loader
          v-for="n in 6"
          :key="n"
          type="card"
          class="ma-2"
          height="200"
          width="300"
        />
      </template>
      <template v-else>
        <CardRole
          v-for="role in rolesList"
          :key="role.id"
          :card="role"
          from="roles"
        />
      </template>
    </span>
    <div class="add--btn">
      <v-btn
        height="50"
        color="primary"
        rounded
        @click="dialog = !dialog"
      >
        <v-icon size="20">
          mdi-plus
        </v-icon>
      </v-btn>
    </div>
    <CustomDialog
      v-model="dialog"
      title="Adicionar"
      :has-cta="true"
      :save-active="true"
      width="800px"
      @save="addCardPermission"
    >
      <v-text-field
        v-model="roleName"
        outlined
        class="pt-8"
        hide-details="auto"
        label="Nome do Papel"
      />
      <v-text-field
        v-model="cardDescription"
        outlined
        class="pt-8"
        hide-details="auto"
        label="Descrição"
      />
      <PermissionManager
        :granted-permissions="grantedPermissions"
        :revoked-permissions="revokedPermissions"
        @update-permissions="updatePermissions"
      />

      <PermissionManager
        :granted-permissions="grantedRoleUsers"
        :revoked-permissions="revokedRoleUsers"
        granted-title="Usuários Associados"
        revoked-title="Usuários Não Associados"
        @update-permissions="updateUserPermissions"
      />
    </CustomDialog>
  </div>
</template>

<script>
import CustomDialog from '/components/admin/CustomDialog.vue';
import CardRole from '/components/admin/CardRole.vue';
import PermissionManager from '/components/admin/PermissionManager.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'Papeis',
  components: { CardRole, CustomDialog, PermissionManager },
  layout: 'admin',
  data() {
    return {
      dialog: false,
      loadingRoles: false,
      roleName: '',
      permissions: [],
      grantedPermissions: [],
      grantedRoleUsers: [],
      revokedRoleUsers: [],
      cardDescription: '',
      users: [],
    };
  },
  async mounted() {
    this.loadingRoles = true;
    try {
      await this.loadUsers();
      await this.$store.dispatch('admin/fetchRolesList');
      this.permissions = await this.$api.get('user/group/');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.$store.commit('alert/addAlert', {
        timeout: 5000,
        message: 'Erro ao carregar dados dos papéis',
      });
    } finally {
      this.loadingRoles = false;
    }
  },
  computed: {
    ...mapGetters('admin', ['rolesList']),

    revokedPermissions: {
      get() {
        return this.permissions.data;
      },
      set(value) {
        this.permissions.data = value;
      },
    },

  },
  methods: {
    async loadUsers() {
      try {
        const response = await this.$api.get('user/');
        // Initially all users are in revoked (non-associated)
        this.revokedRoleUsers = response.data.map((user) => ({
          id: user.id,
          name: user.username || user.email,
          email: user.email,
        }));
        this.grantedRoleUsers = [];
      } catch (error) {
        console.error('Error loading users:', error);
      }
    },

    updatePermissions({ grantedPermissions, revokedPermissions }) {
      this.grantedPermissions = grantedPermissions;
      this.revokedPermissions = revokedPermissions;
    },

    updateUserPermissions({ grantedPermissions, revokedPermissions }) {
      this.grantedRoleUsers = grantedPermissions;
      this.revokedRoleUsers = revokedPermissions;
    },

    async addCardPermission() {
      try {
        const { roleName } = this; // Salva o nome antes de resetar
        const usersCount = this.grantedRoleUsers.length;

        const response = await this.$api.post('user/role/', {
          name: this.roleName,
          description: this.cardDescription,
          associated_groups: this.grantedPermissions.map((permission) => permission.id),
          associated_users: this.grantedRoleUsers.map((user) => user.id),
        });

        if (response.status === 201) {
          await this.$store.dispatch('admin/fetchRolesList');
          this.dialog = false;

          this.roleName = '';
          this.cardDescription = '';
          this.grantedPermissions = [];
          this.grantedRoleUsers = [];
          await this.loadUsers();

          this.$store.commit('alert/addAlert', {
            timeout: 5000,
            message: `Papel "${roleName}" foi criado com sucesso! ${usersCount > 0 ? `Usuários associados: ${usersCount}.` : 'Nenhum usuário associado.'}`,
          });
        }
      } catch (error) {
        console.error('Error creating role:', error);

        let errorMessage = 'Erro ao criar papel.';
        if (error.response && error.response.data) {
          if (error.response.data.name && error.response.data.name.includes('already exists')) {
            errorMessage = 'Já existe um papel com este nome.';
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }

        this.$store.commit('alert/addAlert', {
          timeout: 5000,
          message: errorMessage,
        });
      }
    },
  },
};
</script>
<style lang="sass" scoped>
.group
  width: 100%
  padding: 1.5rem

.card
  &--wrapper
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(350px,1fr))
    gap: 1rem

.add--btn
  position: absolute
  bottom: 20px
  right: 20px
  z-index: 3
</style>
