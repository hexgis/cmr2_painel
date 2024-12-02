<template>
  <div>
    <v-card
      class="text-uppercase card"
      :class="{ 'card--selected': isSelected }"
      @click="toggleSelection"
    >
      <template v-if="isSelected">
        <div class="overlay">
          <v-btn color=primary dark @click.stop="deleteCard">
            <v-icon size="18" class="mr-4">mdi-delete</v-icon>
            Excluir
          </v-btn>
        </div>
      </template>
      <p class="text--lightgray">Grupo</p>
      <h4>{{ card.title }}</h4>
      <hr class="mb-4 mt-4" />
      <p class="text--lightgray">Tipo</p>
      <p>{{ card.type }}</p>
      <v-icon class="icon" @click.stop="editCard()">mdi-pencil</v-icon>
    </v-card>
    <CustomDialog v-model="dialog" title="Editar" :hasCta="true">
      <v-text-field class="pt-8" v-model="card.title" hide-details="auto" label="Nome do Grupo"></v-text-field>
      <PermissionManager
        :grantedPermissions="grantedPermissions"
        :revokedPermissions="revokedPermissions"
        @update-permissions="updatePermissions"
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
  },
  data() {
    return {
      dialog: false,
      isSelected: false,
      grantedPermissions: ['Permissão 1', 'Permissão 2', 'Permissão 8', 'Permissão 9','Permissão 10','Permissão 11','Permissão 12','Permissão 13'],
      revokedPermissions: ['Permissão 3', 'Permissão 4'],
    };
  },
  methods: {
    editCard() {
      this.dialog = true;
    },
    toggleSelection() {
      this.isSelected = !this.isSelected;
    },
    deleteCard() {
      this.$emit('delete', this.card);
    },
    updatePermissions({ grantedPermissions, revokedPermissions }) {
      this.grantedPermissions = grantedPermissions;
      this.revokedPermissions = revokedPermissions;
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
  border-radius: 8px
  background: #fff
  padding: 1.5rem
  position: relative
  cursor: pointer

.card--selected
  background: rgba(255, 0, 0, 0.1)

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
