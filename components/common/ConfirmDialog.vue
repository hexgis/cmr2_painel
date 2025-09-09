<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    persistent
  >
    <v-card>
      <v-card-title class="headline error white--text">
        <v-icon left color="white">mdi-alert</v-icon>
        {{ title }}
      </v-card-title>
      
      <v-card-text class="pa-6">
        <p class="text-body-1 mb-0">{{ message }}</p>
      </v-card-text>
      
      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          text
          @click="cancel"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          color="error"
          @click="confirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirmar'
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    }
  },
  
  computed: {
    dialog: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  
  methods: {
    confirm() {
      this.$emit('confirm')
      this.dialog = false
    },
    
    cancel() {
      this.$emit('cancel')
      this.dialog = false
    }
  }
}
</script>
