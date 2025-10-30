<template>
  <v-card
    flat
    class="ma-2 text-center"
  >
    <v-card-text class="pa-4">
      <v-icon
        :size="iconSize"
        :color="iconColor"
        class="mb-2"
      >
        {{ icon }}
      </v-icon>
      <div class="grey--text">
        {{ message }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'EmptyState',

  props: {
    message: {
      type: String,
      default: 'Nenhum item disponível',
    },
    icon: {
      type: String,
      default: 'mdi-image-off',
    },
    iconSize: {
      type: [String, Number],
      default: 48,
    },
    iconColor: {
      type: String,
      default: 'grey lighten-1',
    },
  },
};
</script>
