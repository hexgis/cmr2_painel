<template>
  <div class="permissions-container">
    <div class="permission-list">
      <h5>{{ title }}</h5>
      <v-list dense>
        <v-list-item
          v-for="role in filteredAvailableRoles"
          :key="role.id"
          @click="selectRole(role)"
        >
          <v-list-item-title>{{ role.name }}</v-list-item-title>
          <v-icon>mdi-chevron-right</v-icon>
        </v-list-item>
      </v-list>
    </div>

    <div class="permission-list">
      <h5>Perfil(s) escolhido(s)</h5>
      <v-list dense>
        <v-list-item
          v-for="role in selectedRoles"
          :key="role.id"
          @click="removeRole(role)"
        >
          <v-list-item-title>{{ role.name }}</v-list-item-title>
          <v-icon>mdi-chevron-left</v-icon>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    availableRoles: {
      type: Array,
      default: () => []
    },
    selectedRoles: {
      type: Array,
      default: () => []
    },
    mode: {
      type: String,
      default: 'edit',
      validator: value => ['edit', 'create'].includes(value)
    }
  },
  computed: {
    title() {
      return this.mode === 'edit' ? 'Perfis disponíveis' : 'Selecione os perfis';
    },

    filteredAvailableRoles() {
      if (!this.availableRoles) return [];
      return this.availableRoles.filter(role => 
        !this.selectedRoles.some(r => r.id === role.id)
      );
    }
  },
  methods: {
    selectRole(role) {
      this.$emit('add-role', role);
    },
    removeRole(role) {
      this.$emit('remove-role', role);
    }
  }
}
</script>

<style lang="sass" scoped>
.permissions-container
  display: flex
  justify-content: space-between
  margin-top: 20px

.permission-list
  width: 48%
  padding: 1rem

h5
  margin-bottom: 10px

.v-list
  border-radius: 8px
  border: 1px solid #9A9997
  height: 210px
  overflow-y: auto
</style>