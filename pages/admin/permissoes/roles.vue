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
      <CardRole
        v-for="role in rolesList"
        :key="role.id"
        :card="role"
        from="roles"
      />
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
        class="pt-8"
        hide-details="auto"
        label="Nome do Papel"
      />
      <v-text-field
        v-model="cardDescription"
        class="pt-8"
        hide-details="auto"
        label="Descrição"
      />
      <PermissionManager
        :granted-permissions="grantedPermissions"
        :revoked-permissions="revokedPermissions"
        @update-permissions="updatePermissions"
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
      groupName: '',
      permissions: [],
      grantedPermissions: [],
      cardDescription: '',
    };
  },
  async mounted() {
    this.$store.dispatch('admin/fetchRolesList');
    this.permissions = await this.$api.get('user/group/');
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
    updatePermissions({ grantedPermissions, revokedPermissions }) {
      this.grantedPermissions = grantedPermissions;
      this.revokedPermissions = revokedPermissions;
    },
    async addCardPermission() {
      const response = await this.$api.post('user/role/', {
        name: this.roleName,
        description: this.cardDescription,
        layer_permissions: this.grantedPermissions.map((permission) => permission.id),
      });
      this.$store.dispatch('admin/fetchRolesList');
      this.dialog = false;
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
