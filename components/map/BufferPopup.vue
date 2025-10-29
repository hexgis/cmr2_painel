<template>
  <div class="pa-2">
    <div>
      <span class="font-weight-bold">
        Buffer:
      </span>
      {{ distanceKm }} km
    </div>
    <div class="multicontrol">
      <div class="d-block">
        <div class="d-flex">
          <v-spacer />
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                icon
                small
                v-on="on"
                @click="removeBuffer"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('delete-buffer') }}</span>
          </v-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<i18n>
{
  "en": {
    "delete-buffer": "Delete buffer"
  },
  "pt-br": {
    "delete-buffer": "Apagar buffer"
  }
}
</i18n>

<script>
export default {
  name: 'BufferPopup',

  props: {
    layer: {
      type: Object,
      required: true,
    },
    bufferDistance: {
      type: Number,
      required: true,
    },
  },

  computed: {
    distanceKm() {
      return (this.bufferDistance / 1000).toFixed(1);
    },
  },

  methods: {
    removeBuffer() {
      this.$emit('remove-buffer', this.layer);
    },
  },
};
</script>

<style lang="sass" scoped>
.multicontrol
  width: 270px
</style>
