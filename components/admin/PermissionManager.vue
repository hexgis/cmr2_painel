<template>
  <div class="permissions-container">
    <div class="permission-list">
      <h5>Permissões Não Concedidas</h5>
      <v-list dense>
        <v-list-item
          v-for="(permission, index) in revokedPermissions"
          :key="`revoked-${index}`"
          @click="moveToGranted(index)"
        >
          <v-list-item-content>
            <v-list-item-title>{{ permission }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>

    <div class="permission-list">
      <h5>Permissões Concedidas</h5>
      <v-list dense>
        <v-list-item
          v-for="(permission, index) in grantedPermissions"
          :key="`granted-${index}`"
          @click="moveToRevoked(index)"
        >
          <v-list-item-content>
            <v-list-item-title>{{ permission }}</v-list-item-title>
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
  },
  methods: {
    moveToRevoked(index) {
      const [permission] = this.grantedPermissions.splice(index, 1);
      this.revokedPermissions.push(permission);
      this.$emit("update-permissions", {
        grantedPermissions: [...this.grantedPermissions],
        revokedPermissions: [...this.revokedPermissions],
      });
    },
    moveToGranted(index) {
      const [permission] = this.revokedPermissions.splice(index, 1);
      this.grantedPermissions.push(permission);
      this.$emit("update-permissions", {
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
</style>

