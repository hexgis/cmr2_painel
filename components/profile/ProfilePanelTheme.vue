<template>
  <v-form class="fill-height">
    <v-card
      class="px-3 py-3"
      elevation="0"
    >
      <v-row>
        <v-col cols="12">
          <v-switch
            :label="$t('info-message')"
            :loading="loadingUpdateTheme"
            :disabled="loadingUpdateTheme"
            :input-value="darkMode"
            @change="toggleTheme"
          />
        </v-col>
      </v-row>
    </v-card>
  </v-form>
</template>

<i18n>
{
    "en": {
        "Theme": "Display theme",
        "info-message": "Change system visual theme: [Black] or [Light] for a view according to your needs."
    },
    "pt-br": {
        "Theme": "Tema de visualização",
        "info-message": "Troque o tema visual do sistema: [Escuro] ou [Claro] para uma visualização de acordo com suas necessidades."
    }
}
</i18n>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'ProfilePanelSettingsMap',

  computed: {
    darkMode() {
      return this.user.settings.dark_mode_active || false;
    },

    ...mapState('userProfile', ['user', 'loadingUpdateTheme']),
  },

  methods: {
    async toggleTheme(value) {
      const isUpdated = await this.updateThemeSettings(value);
      if (isUpdated) this.$vuetify.theme.dark = value;
    },

    ...mapActions('userProfile', ['updateThemeSettings']),
  },
};
</script>
