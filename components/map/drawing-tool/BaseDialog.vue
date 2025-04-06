<template>
  <v-dialog
    v-model="showDialog"
    width="400"
    content-class="drawing-tool-dialog"
  >
    <v-card>
      <v-card-title>
        {{ $t('save-label') }}
        <v-spacer />
        <v-btn
          icon
          class="mr-n5 mt-n5"
          @click="$emit('close')"
        >
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="py-6">
        <p>{{ $t('info-text') }}</p>
        <v-row>
          <v-col>
            <v-text-field
              v-model="name"
              :label="$t('field-label')"
              outlined
              required
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          color="accent"
          :disabled="!name"
          @click="$emit('action', {name, type})"
        >
          {{ label }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<i18n>
{
  "en": {
    "save-label": "Save",
    "info-text": "Enter layer name",
    "download-label": "Download",
    "field-label": "Name"
  },
  "pt-br": {
    "save-label": "Salvar",
    "info-text": "Digite o nome da camada",
    "download-label": "Baixar",
    "field-label": "Nome"
  }
}
</i18n>

<script>
export default ({
  name: 'BaseDialog',

  props: {
    label: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
  },

  data: () => ({
    showDialog: true,
    name: null,
  }),
});
</script>

<style lang="sass">
.drawing-tool-dialog
  overflow-y: visible
</style>
