<template>
  <v-dialog
    v-model="dialog"
    :width="width"
    persistent
  >
    <v-card>
      <v-card-title
        class="headline d-flex justify-space-between"
        color="#D92B3F"
      >
        <p class="mb-0 text-subtitle-1 font-weight-bold">
          {{ title }}
        </p>
        <v-icon
          class="ml-auto"
          color="white"
          @click="closeDialog"
        >
          mdi-close
        </v-icon>
      </v-card-title>
      <v-card-text>
        <slot>
          <p class="mt-5">
            {{ content }}
          </p>
        </slot>
      </v-card-text>
      <v-card-actions v-if="hasCta">
        <v-spacer />

        <v-btn
          color="#9A9997"
          plain
          @click="dialog = false"
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          id="save-btn"
          color="#D92B3F"
          :disabled="!saveActive"
          style="color: #FFFFFF"
          elevated
          @click="$emit('save')"
        >
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<i18n>
  {
      "en": {
          "cancel": "Cancel",
          "save": "Save"
      },
      "pt-br": {
          "cancel": "Cancelar",
          "save": "Salvar"
      }
  }
</i18n>
<script>
export default {
  name: 'CustomDialog',
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: [Object, String],
      default: '',
    },
    width: {
      type: String,
      default: '730px',
    },
    value: {
      type: Boolean,
    },
    hasCta: {
      type: Boolean,
      required: true,
    },
    saveBtn: {
      type: [Function, Promise],
    },
    saveActive: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    dialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
  methods: {
    closeDialog() {
      this.dialog = false;
    },
  },
};
</script>
<style scoped lang="sass">
.headline
  background: #D92B3F
  color: #FFFFFF
</style>
