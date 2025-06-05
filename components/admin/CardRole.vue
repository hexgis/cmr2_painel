<template>
  <div>
    <v-card
      class="text-uppercase card"
      @click="toggleSelection"
    >
      <p class="text--lightgray">
        {{ label }}
      </p>
      <h4>{{ cardName }}</h4>
      <hr class="mb-4 mt-4">
      <p class="text--lightgray">
        Descrição
      </p>
      <p>{{ card.description }}</p>
      <v-icon
        class="icon"
        @click.stop="editCard"
      >
        mdi-pencil
      </v-icon>
    </v-card>
    <CustomDialog
      v-model="dialog"
      title="Editar"
      :has-cta="true"
      :save-active="true"
      width="800px"
      @save="saveCard"
    >
      <v-text-field
        v-model="cardName"
        outlined
        class="pt-8"
        hide-details="auto"
        :label="label"
      />
      <v-text-field
        v-model="localCardDescription"
        outlined
        class="pt-8"
        hide-details="auto"
        label="Descrição"
      />
      <PermissionManager
        :granted-permissions="grantedPermissions"
        :revoked-permissions="revokedPermissions"
        granted-title="Grupos Associados"
        revoked-title="Grupos Não Associados"
        @update-permissions="$emit('update-permissions', $event)"
      />

      <PermissionManager
        :granted-permissions="grantedRoleUsers"
        :revoked-permissions="revokedRoleUsers"
        granted-title="Usuários Associados"
        revoked-title="Usuários Não Associados"
      />
    </CustomDialog>
  </div>
</template>

<script>
import CustomDialog from './CustomDialog.vue';
import PermissionManager from './PermissionManager.vue';

export default {
  components: { CustomDialog, PermissionManager },
  props: {
    card: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      default: 'Papel',
    },
    isPermissionChanged: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      dialog: false,
      isSelected: false,
      grantedPermissions: [],
      revokedPermissions: [],
      grantedRoleUsers: [],
      revokedRoleUsers: [],
      localCardDescription: '',
    };
  },
  computed: {
    cardName() {
      return this.card.roles
        ? this.card.name || this.card.roles[0].name
        : this.card.name;
    },
    cardDescription: {
      get() {
        return this.card.description;
      },
      set(value) {
        this.card.description = value;
      },
    },
  },
  watch: {
    card: {
      handler(newVal) {
        this.localCardDescription = newVal.description;
      },
      deep: true,
      immediate: true,
    },
  },
  async mounted() {
    await this.loadPermissions();
  },
  methods: {
    async loadPermissions() {
      try {
        if (this.from === 'roles') {
          // Load all users and groups data in a single call
          const [groupResponse, userResponse] = await Promise.all([
            this.$api.get(`user/role-diff/${this.card.id}/`),
            this.$api.get(`permission/role/${this.card.id}/users/`),
          ]);

          // Set granted and revoked groups
          this.grantedPermissions = this.card.groups.map((group) => group);
          this.revokedPermissions = groupResponse.data.unassociated_groups;

          // Set granted and revoked users
          this.grantedRoleUsers = userResponse.data.associated_users.map((user) => ({
            id: user.id,
            email: user.email,
            institution: user.institution,
          }));

          this.revokedRoleUsers = userResponse.data.unassociated_users.map((user) => ({
            id: user.id,
            email: user.email,
            institution: user.institution,
          }));
        } else {
          // Original layer permission logic
          const activePermissions = this.card.groups.map((groups) => groups);
          this.grantedPermissions = activePermissions;
          const response = await this.$api.get(
            `permission/role-diff/${this.card.id}/`,
          );
          this.revokedPermissions = response.data;
        }
      } catch (e) {
        console.error('Erro ao carregar permissões:', e);
      }
    },

    editCard() {
      this.dialog = true;
    },
    toggleSelection() {
      this.isSelected = !this.isSelected;
    },
    async saveCard() {
      if (this.from === 'roles') {
        try {
          await this.$api.patch(`/user/role/${this.card.id}/`, {
            name: this.cardName,
            description: this.localCardDescription,
            associated_groups: this.grantedPermissions.map((group) => group.id),
            associated_users: this.grantedRoleUsers.map((user) => user.id),
          });
          this.dialog = false;
          await this.$store.dispatch('admin/fetchRolesList');
        } catch (e) {
          console.error('Erro ao salvar permissões:', e);
        }
      } else {
        // Original layer permission save logic
        try {
          await this.$api.patch(`/permission/layer/${this.card.id}/`, {
            description: this.localCardDescription,
            layer_ids: this.grantedPermissions.map((groups) => groups.id),
          });
          this.dialog = false;
          await this.$store.dispatch('admin/fetchRolesList');
        } catch (e) {
          console.error('Erro ao salvar permissões:', e);
        }
      }
    },
  },
};
</script>

<style lang="sass" scoped>
p
  margin-bottom: 0

.card
  width: 100%
  min-width: 350px
  min-height: 200px
  border-radius: 8px
  background: #fff
  padding: 1.5rem
  position: relative
  cursor: pointer

.text--lightgray
  color: #9A9997
  font-size: 12px

.icon
  position: absolute
  top: 10px
  right: 20px
  z-index: 10

.overlay
  position: absolute
  top: 0
  left: 0
  right: 0
  bottom: 0
  display: flex
  justify-content: center
  align-items: center
  background: #D92B3F46
  z-index: 15
</style>
