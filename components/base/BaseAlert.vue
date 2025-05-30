<template>
  <v-snackbar
    v-if="showAlert && currentAlert"
    v-model="showAlert"
    :timeout="currentAlert.timeout || 5000"
  >
    <span>
      {{ currentAlert.message || $t('generic-error') }}
    </span>
    <template #action>
      <v-btn
        v-if="currentAlert && currentAlert.action"
        color="accent"
        text
        @click="action"
      >
        {{ currentAlert.actionLabel }}
      </v-btn>
      <v-btn
        icon
        text
        @click="closeAlert"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'BaseAlert',

  data: () => ({
    showAlert: false,
    delay: 500,
  }),

  computed: {
    ...mapState('alert', ['alerts']),

    currentAlert() {
      return this.alerts.length ? this.alerts[0] : null;
    },
  },

  watch: {
    showAlert(val, old) {
      if (!val && old) {
        setTimeout(() => {
          this.popAlert();
        }, this.delay);
      }
    },

    alerts(newAlerts) {
      if (newAlerts.length > 0 && !this.showAlert) {
        this.showAlert = true;
      } else if (newAlerts.length === 0) {
        this.showAlert = false;
      }
    },
  },

  methods: {
    action() {
      if (this.currentAlert && this.currentAlert.action) {
        this.currentAlert.action(this.currentAlert.payload);
      }
      this.closeAlert();
    },

    closeAlert() {
      this.showAlert = false;
    },

    ...mapMutations('alert', ['popAlert']),
  },
};
</script>

<i18n>
{
  "en": {
    "generic-error": "An error has occurred, contact the system administrator if it persists."
  },
  "pt-br": {
    "generic-error": "Ocorreu um erro, entre em contato com o administrador caso persista."
  }
}
</i18n>
