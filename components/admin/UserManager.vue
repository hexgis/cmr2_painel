<template>
  <div class="d-flex justify-space-between mt-2">
    <div class="flex-grow-1 mr-2">
      <h5 class="text-subtitle-2 font-weight-small mb-2">
        {{ $t(title) }}
      </h5>
      <v-sheet
        outlined
        rounded
        class="overflow-hidden"
        height="210"
      >
        <v-list
          dense
          class="pa-0 fill-height"
          style="overflow-y: auto;"
        >
          <template v-if="loading">
            <v-skeleton-loader
              v-for="n in 5"
              :key="n"
              type="list-item"
              tile
            />
          </template>

          <template v-else>
            <v-list-item
              v-for="role in filteredAvailableRoles"
              :key="role.id"
              class="px-3"
              @click="selectRole(role)"
            >
              <v-list-item-title class="text-body-2">
                {{ role.name }}
              </v-list-item-title>
              <v-icon small>
                mdi-chevron-right
              </v-icon>
            </v-list-item>
          </template>
        </v-list>
      </v-sheet>
    </div>

    <div class="flex-grow-1 ml-2">
      <h5
        class="text-subtitle-2 font-weight-small mb-2"
      >
        {{ $t('selectedProfiles') }}
      </h5>
      <v-sheet
        outlined
        rounded
        class="overflow-hidden"
        height="210"
      >
        <v-list
          dense
          class="pa-0 fill-height"
          style="overflow-y: auto;"
        >
          <v-list-item
            v-for="role in selectedRoles"
            :key="role.id"
            class="px-3"
            @click="removeRole(role)"
          >
            <v-list-item-title class="text-body-2">
              {{ role.name }}
            </v-list-item-title>
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-list-item>
        </v-list>
      </v-sheet>
    </div>
  </div>
</template>

<i18n>
  {
      "en": {
          "availableProfiles": "Available Profiles",
          "selectProfiles": "Select profiles",
          "selectedProfiles": "Selected profile(s)"
      },
      "pt-br": {
          "availableProfiles": "Perfis disponíveis",
          "selectProfiles": "Selecione os perfis",
          "selectedProfiles": "Perfil(s) escolhido(s)"
      }
  }
</i18n>

<script>
export default {
  props: {
    availableRoles: {
      type: Array,
      default: () => [],
    },
    selectedRoles: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'edit',
      validator: (value) => ['edit', 'create'].includes(value),
    },
  },
  computed: {
    title() {
      return this.mode === 'edit' ? 'availableProfiles' : 'selectProfiles';
    },

    filteredAvailableRoles() {
      if (!this.availableRoles) return [];
      return this.availableRoles.filter((role) => !this.selectedRoles.some((r) => r.id === role.id));
    },
  },
  methods: {
    selectRole(role) {
      this.$emit('add-role', role);
    },
    removeRole(role) {
      this.$emit('remove-role', role);
    },
  },
};
</script>

<style lang="sass" scoped>
.flex-grow-1
  flex-basis: 48%
</style>
