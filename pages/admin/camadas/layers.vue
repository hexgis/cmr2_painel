<template>
  <div class="group">
    <span class="d-flex align-center justify-space-between">
      <h1 class="text-uppercase">Gerenciamento de Camadas</h1>
      <v-btn
        color="primary"
        text
        @click="$router.back()"
      >
        <v-icon color="primary">mdi-arrow-left</v-icon>
      </v-btn>
    </span>
    <span class="card--wrapper mt-4">
      <template v-if="loadingLayers">
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
        <CardGroup
          v-for="group in response"
          :key="group.id"
          :card="group"
          label="Camada"
          :granted-permissions="grantedPermissions"
          :revoked-permissions="revokedPermissions"
          :is-permission-changed="isPermissionChanged"
          @update-permissions="updatePermissions"
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
      width="800px"
      :save-btn="addCardPermission"
      :save-active="isFilled"
    >
      <v-text-field
        v-model="groupName"
        outlined
        class="pt-8"
        hide-details="auto"
        label="Nome da Camada"
      />
      <v-text-field
        v-model="cardDescription"
        outlined
        required
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
import CardGroup from '/components/admin/CardGroup.vue';
import PermissionManager from '/components/admin/PermissionManager.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'Layers',
  components: { CardGroup, CustomDialog, PermissionManager },
  layout: 'admin',
  data() {
    return {
      dialog: false,
      groupName: '',
      cardDescription: '',
      response: [],
      grantedPermissions: [],
      revokedPermissions: [],
      isPermissionChanged: false,
      loadingLayers: false,
      id: '',
    };
  },
  async mounted() {
    this.loadingLayers = true;
    this.$store.dispatch('admin/fetchGroupList');
    try {
      const responsePermissions = await this.$api.get('layer/');
      const response = await this.$api.get('permission/layer/');
      this.response = response.data;
      this.revokedPermissions = responsePermissions.data;
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingLayers = false;
    }
  },
  computed: {
    ...mapGetters('admin', ['groupList']),
    isFilled() {
      return !!this.groupName && !!this.cardDescription && this.grantedPermissions.length > 0;
    },
  },
  methods: {
    getPermissionsForCard(group) {
      return this.responsePermissions.filter((permission) => group.layers.some((layer) => layer.name === permission.name));
    },
    async addCardPermission() {
      const response = await this.$api.post('permission/layer/', {
        name: this.groupName,
        description: this.cardDescription,
        layer_ids: this.grantedPermissions.map((permission) => permission.id),
      });
      this.response.push(response.data);
      this.dialog = false;
    },
    updatePermissions({ grantedPermissions, revokedPermissions }) {
      this.grantedPermissions = grantedPermissions;
      this.revokedPermissions = revokedPermissions;
      this.isPermissionChanged = true;
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
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr))
    gap: 1rem

.add--btn
  position: absolute
  bottom: 20px
  right: 20px
  z-index: 3
</style>
