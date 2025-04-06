<template>
  <div class="group">
    <span class="d-flex align-center justify-space-between">
      <h1 class="text-uppercase">Gerenciamento de Grupos</h1>
      <v-btn
        color="primary"
        text
        @click="$router.back()"
      >
        <v-icon color="primary">mdi-arrow-left</v-icon>
      </v-btn>
    </span>
    <span class="card--wrapper mt-4">
      <CardGroup v-for="group in groupList" :key="group.id" :card="group" from="groups"/>
    </span>
    <div class="add--btn">
      <v-btn height="50" color="primary" rounded @click="dialog = !dialog">
        <v-icon size="20">mdi-plus</v-icon>
      </v-btn>
    </div>
    <CustomDialog v-model="dialog" title="Adicionar" :hasCta="true" :saveActive="true" width="800px" @save="addCardPermission">
      <v-text-field class="pt-8" hide-details="auto" v-model="groupName" label="Nome do Grupo"></v-text-field>
      <v-text-field
                class="pt-8"
                v-model="cardDescription"
                hide-details="auto"
                label="Descrição"
            />
      <PermissionManager
        :grantedPermissions="grantedPermissions"
        :revokedPermissions="revokedPermissions"
        @update-permissions="updatePermissions"
      />
    </CustomDialog>
  </div>
</template>

<script>
import CustomDialog from '/components/admin/CustomDialog.vue'
import CardGroup from '/components/admin/CardGroup.vue'
import PermissionManager from '/components/admin/PermissionManager.vue';
import { mapGetters } from 'vuex'


export default {
  components: { CardGroup, CustomDialog, PermissionManager},
  name: 'Grupos',
  layout: 'admin',
  data(){
    return {
      dialog: false,
      groupName: '',
      permissions: [],
      grantedPermissions: [],
      cardDescription: ''
    }
  },
  async mounted(){
    this.$store.dispatch('admin/fetchGroupList')
    this.permissions = await this.$api.get(`permission/`)
  },
  computed: {
    ...mapGetters('admin', ['groupList']),

    revokedPermissions: {
        get() {
            return this.permissions.data
        },
        set(value) {
          this.permissions.data = value
        },
    },

  },
  methods: {
    updatePermissions({ grantedPermissions, revokedPermissions }) {
      this.grantedPermissions = grantedPermissions;
      this.revokedPermissions = revokedPermissions;
    },
    async addCardPermission() {
      const response = await this.$api.post('user/group/', {
        name: this.groupName,
        description: this.cardDescription,
        layer_permissions: this.grantedPermissions.map(permission => permission.id),
      })
      this.$store.dispatch('admin/fetchGroupList')
      this.dialog = false;
    },
    },
}

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
