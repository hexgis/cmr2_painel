<template>
  <div class="group">
    <h1 class="text-uppercase">Gerenciamento de Grupos</h1>
    <span class="card--wrapper mt-4">
      <CardGroup v-for="card in groupCards" :key="card.title" :card="card"/>
    </span>
    <div class="add--btn">
      <v-btn height="50" color="primary" rounded @click="dialog = !dialog">
        <v-icon size="20">mdi-plus</v-icon>
      </v-btn>
    </div>
    <CustomDialog v-model="dialog" title="Adicionar" :hasCta="true">
      <v-text-field class="pt-8" hide-details="auto" v-model="groupName" label="Nome do Grupo"></v-text-field>
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


export default {
  components: { CardGroup, CustomDialog, PermissionManager },
  name: 'Grupos',
  layout: 'admin',
  data(){
    return {
      dialog: false,
      groupName: '',
      groupCards:[
        {
          id: 1,
          title: 'Teste',
          type: 'Desenvolvedor'
        },
        {
          id: 2,
          title: 'Teste 2',
          type: 'Visualizar'
        },
        {
          id: 3,
          title: 'Teste 3',
          type: 'Inserir Mapas'
        },
      ],
      grantedPermissions: ['Permissão Add 1', 'Permissão Add 2', 'Permissão Add 8', 'Permissão Add 9','Permissão Add 10','Permissão Add 11','Permissão Add 12','Permissão Add 13','Permissão Add 3', 'Permissão Add 4'],
      revokedPermissions: [],
    }
  },
  methods: {
    updatePermissions({ grantedPermissions, revokedPermissions }) {
      this.grantedPermissions = grantedPermissions;
      this.revokedPermissions = revokedPermissions;
    },
  }
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
