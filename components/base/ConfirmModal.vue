<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    persistent
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="primary white--text pa-4">
        <div class="w-100 text-center">
          <v-icon
            v-if="icon"
            left
            size="24"
            color="white"
          >
            {{ icon }}
          </v-icon>
          <span class="text-h6 font-weight-bold">
            {{ title }}
          </span>
        </div>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6">
        <div class="text-body-1 text-center">
          {{ message }}
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          outlined
          color="grey"
          :disabled="loading"
          @click="onCancel"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          :loading="loading"
          @click="onConfirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConfirmModal',
  
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirmação'
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
    },
    confirmColor: {
      type: String,
      default: 'primary'
    },
    icon: {
      type: String,
      default: 'mdi-help-circle'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    showDialog: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },

  methods: {
    onConfirm() {
      this.$emit('confirm')
    },

    onCancel() {
      this.$emit('cancel')
      this.showDialog = false
    }
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px !important;
}
</style>
