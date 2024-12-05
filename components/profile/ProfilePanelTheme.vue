<template>
  <v-form class="fill-height">
    <v-card class="px-3 py-3" elevation="0">
      <v-row>
        <v-col cols="12">
          <v-switch
            :label="$t('info-message')"
            @click="toggleTheme"
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
import { mapState} from 'vuex';

export default {
  name: 'ProfilePanelSettingsMap',
  props: {
    newBoundingBox: {
      type: Object,
      default: () => null,
    },
  },

  computed: {
    ...mapState({
      token: state => state.auth.token
    })
  },

  mounted() {
    const theme = localStorage.getItem('useDarkTheme');
    if (theme) {
      this.$vuetify.theme.dark = theme === 'true';
    }
  },

  methods: {
    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem('useDarkTheme', this.$vuetify.theme.dark.toString());
      this.updateThemeSettings(this.$vuetify.theme.dark);
    },

    async updateThemeSettings(isDark) { 
      try {
        const response = await this.$axios.patch('/user/update-settings/', {
          theme_mode: isDark
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
      } catch (error) {
        console.error('Erro ao atualizar a configuração de tema:', error.response ? error.response.data : error.message);
      }
    }
  }
};
</script>