<template>
  <div class="permissions-container">
    <div class="permission-list">
      <h5>{{ revokedTitle }}</h5>
      <v-text-field
        v-model="revokedSearch"
        outlined
        dense
        hide-details
        prepend-icon="mdi-magnify"
        label="Pesquisar"
        class="mb-2"
      />
      <v-list dense>
        <v-list-item
          v-for="(permission, index) in filteredRevokedPermissions"
          :key="`revoked-${index}`"
          @click="moveToGranted(index)"
        >
          <v-list-item-content>
            <v-list-item-title v-if="permission.group_name">
              {{ permission.group_name }} | {{ permission.name }}
            </v-list-item-title>
            <v-list-item-title v-else-if="permission.email">
              {{ permission.email }} | {{ permission.institution }}
            </v-list-item-title>
            <v-list-item-title v-else>
              {{ permission.name }} | {{ permission.description }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>

    <div class="permission-list">
      <h5>{{ grantedTitle }}</h5>
      <v-text-field
        v-model="grantedSearch"
        outlined
        dense
        hide-details
        prepend-icon="mdi-magnify"
        label="Pesquisar"
        class="mb-2"
      />
      <v-list dense>
        <v-list-item
          v-for="(permission, index) in filteredGrantedPermissions"
          :key="`granted-${index}`"
          @click="moveToRevoked(index)"
        >
          <v-list-item-content>
            <v-list-item-title v-if="permission.group_name">
              {{ permission.group_name }} | {{ permission.name }}
            </v-list-item-title>
            <v-list-item-title v-else-if="permission.email">
              {{ permission.email }} | {{ permission.institution }}
            </v-list-item-title>
            <v-list-item-title v-else>
              {{ permission.name }} | {{ permission.description }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    grantedPermissions: {
      type: Array,
      required: true,
    },
    revokedPermissions: {
      type: Array,
      required: true,
    },
    grantedTitle: {
      type: String,
      default: 'Permissões Concedidas',
    },
    revokedTitle: {
      type: String,
      default: 'Permissões Não Concedidas',
    },
  },
  data() {
    return {
      grantedSearch: '',
      revokedSearch: '',
    };
  },
  computed: {
    filteredGrantedPermissions() {
      return this.filterPermissions(this.grantedPermissions, this.grantedSearch);
    },
    filteredRevokedPermissions() {
      return this.filterPermissions(this.revokedPermissions, this.revokedSearch);
    },
  },
  methods: {
    filterPermissions(permissions, search) {
      if (!search) return permissions;

      const searchLower = search.toLowerCase();
      return permissions.filter((permission) => {
        if (permission.email) {
          return permission.email.toLowerCase().includes(searchLower)
                 || permission.institution.toLowerCase().includes(searchLower);
        }
        if (permission.group_name) {
          return permission.group_name.toLowerCase().includes(searchLower)
                 || permission.name.toLowerCase().includes(searchLower);
        }
        return permission.name.toLowerCase().includes(searchLower)
               || (permission.description || '').toLowerCase().includes(searchLower);
      });
    },
    moveToRevoked(index) {
      const [permission] = this.grantedPermissions.splice(index, 1);
      this.revokedPermissions.push(permission);
      this.$emit('update-permissions', {
        grantedPermissions: [...this.grantedPermissions],
        revokedPermissions: [...this.revokedPermissions],
      });
    },
    moveToGranted(index) {
      const [permission] = this.revokedPermissions.splice(index, 1);
      this.grantedPermissions.push(permission);
      this.$emit('update-permissions', {
        grantedPermissions: [...this.grantedPermissions],
        revokedPermissions: [...this.revokedPermissions],
      });
    },
  },
};
</script>
<style lang="sass" scoped>
.permissions-container
  display: flex
  justify-content: space-between
  margin-top: 20px

.permission-list
  width: 50%
  padding: 1rem

h5
  margin-bottom: 10px

v-list
  max-height: 200px
  overflow-y: auto
  border: 1px solid #ddd
  border-radius: 4px
  padding: 8px

.v-list
  border-radius: 8px
  border: 1px solid #9A9997
  height: 210px
  overflow-y: auto

.v-text-field
  font-size: 14px
  margin-bottom: 8px
</style>
