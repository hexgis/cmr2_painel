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
        Tipo
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
        class="pt-8"
        hide-details="auto"
        outlined
        :label="label"
      />
      <v-text-field
        v-model="localCardDescription"
        class="pt-8"
        outlined
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
      default: 'Grupo',
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
        if (this.from === 'groups') {
          const activePermissions = this.card.layer_permissions.map((layer) => layer);
          this.grantedPermissions = activePermissions;
          const response = await this.$api.get(`user/group-diff/${this.card.id}/`);
          this.revokedPermissions = response.data.layer_permissions.map((permission) => permission);
        } else {
          const activePermissions = this.card.layers.map((layer) => layer);
          this.grantedPermissions = activePermissions;
          const response = await this.$api.get(
            `permission/layer-diff/${this.card.id}/`,
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
      if (this.from === 'groups') {
        try {
          await this.$api.patch(`/user/group/${this.card.id}/`, {
            name: this.cardName,
            description: this.localCardDescription,
            layer_permissions: this.grantedPermissions.map((layer) => layer.id),
          });
          this.dialog = false;
        } catch (e) {
          console.error('Erro ao salvar permissões:', e);
        } finally {
          this.$store.dispatch('admin/fetchGroupList');
        }
      } else {
        try {
          await this.$api.patch(`/permission/layer/${this.card.id}/`, {
            description: this.localCardDescription,
            layer_ids: this.grantedPermissions.map((layer) => layer.id),
          });
          this.dialog = false;
        } catch (e) {
          console.error('Erro ao salvar permissões:', e);
        } finally {
          this.$store.dispatch('admin/fetchGroupList');
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
