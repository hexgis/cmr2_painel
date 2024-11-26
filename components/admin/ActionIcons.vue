<template>
  <span class="card--actions">
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          @click="dialog = true"
          v-if="deniedDetails"
          size="40px"
          v-bind="attrs"
          v-on="on"
          color="#D92B3F"
        >
            mdi-alert-octagram
        </v-icon>
      </template>
      <span>{{ $t('showRejectionReason') }}</span>
    </v-tooltip>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          v-on="on"
          v-if="hasFile"
          size="40px"
          color="#5F5E5D"
          @click="viewFileDetails"
        >
          mdi-clipboard-text
        </v-icon>
      </template>
      <span>{{ $t('showFile') }}</span>
    </v-tooltip>
    <CustomDialog v-model="dialog" title="Motivo da Recusa" :content="deniedDetails" :hasCta="false" />
  </span>
</template>
<i18n>
  {
      "en": {
          "selectLocale": "Select language",
          "showRejectionReason": "Show Rejection Reason",
          "showFile": "Show File"
      },
      "pt-br": {
          "selectLocale": "Selecione o idioma",
          "showRejectionReason": "Mostrar Motivo da Recusa",
          "showFile": "Mostrar Arquivo"
      }
  }
</i18n>
<script>
import CustomDialog from './CustomDialog.vue';

export default {
  name: 'ActionIcons',
  components: {
    CustomDialog,
  },
  props: {
    hasFile: {
      type: String,
    },
    deniedDetails: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    viewFileDetails(){
      if (this.hasFile) {
      window.open(this.hasFile, '_blank');
    } else {
      console.warn("Nenhum arquivo disponível para visualização.");
    }
    }
  }
};
</script>

<style lang="sass" scoped>
.card
  width: 100%
  max-width: 500px
  min-height: 300px
  color: #5F5E5D

  &--actions
    padding: 0.2rem
    cursor: pointer

    & > i
      padding-left: 1rem
</style>
