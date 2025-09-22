<template>
  <v-card
    v-if="layer"
    flat
    outlined
    class="pa-2"
    style="height: 100%;"
  >
    <v-chip
      x-small
      :color="side === 'left' ? 'blue' : 'red'"
      text-color="white"
      class="mb-2"
    >
      <v-icon
        v-if="side === 'left'"
        left
        x-small
      >
        mdi-arrow-left
      </v-icon>
      {{ side === 'left' ? 'Esquerda' : 'Direita' }}
      <v-icon
        v-if="side === 'right'"
        right
        x-small
      >
        mdi-arrow-right
      </v-icon>
    </v-chip>

    <div class="layer-name-compact mb-2">
      {{ layer.name }}
    </div>

    <!-- Preview Image with fallback -->
    <v-img
      :src="layerPreview || 'data:image/svg+xml;base64,'"
      height="80"
      class="mb-2 rounded"
      contain
    >
      <template #placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular
            indeterminate
            size="20"
            color="grey lighten-5"
          />
        </v-row>
      </template>
      <template #error>
        <div class="preview-fallback">
          <v-icon
            size="32"
            color="grey lighten-2"
          >
            mdi-layers-outline
          </v-icon>
          <div class="caption grey--text mt-1">
            Preview não disponível
          </div>
        </div>
      </template>
    </v-img>

    <!-- Layer Details -->
    <div class="layer-details-compact">
      <div class="text-caption grey--text">
        <strong>Tipo:</strong> {{ layerType }}
      </div>
      <div class="text-caption grey--text">
        <strong>Grupo:</strong> {{ layerGroup ? layerGroup.name : 'N/A' }}
      </div>
    </div>
  </v-card>

  <!-- Empty Layer Slot -->
  <v-card
    v-else
    flat
    outlined
    class="pa-2 text-center"
    style="height: 100%; min-height: 200px;"
  >
    <div class="d-flex flex-column align-center justify-center fill-height">
      <v-icon
        size="32"
        color="grey lighten-2"
        class="mb-1"
      >
        mdi-image-off-outline
      </v-icon>
      <div class="caption grey--text">
        Camada {{ side === 'left' ? 'esquerda' : 'direita' }}
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'LayerCard',

  props: {
    layer: {
      type: Object,
      default: null,
    },
    side: {
      type: String,
      required: true,
      validator: (value) => ['left', 'right'].includes(value),
    },
    layerPreview: {
      type: String,
      default: null,
    },
    layerType: {
      type: String,
      default: 'Desconhecido',
    },
    layerGroup: {
      type: Object,
      default: null,
    },
  },
};
</script>

<style scoped>
.layer-name-compact {
  font-weight: 500;
  font-size: 12px;
  line-height: 1.2;
  color: #333;
  height: 32px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-details-compact {
  font-size: 10px;
}

.preview-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  border: 1px dashed #ccc;
  border-radius: 4px;
}
</style>
