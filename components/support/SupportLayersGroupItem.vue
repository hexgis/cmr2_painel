<template>
  <div>
    <v-list-group
      v-if="layer"
      v-model="isOpen"
      append-icon=""
      active-class="active"
      :disabled="
        !(
          layer.layer_type === 'wms' &&
          (layer.visible || layer.wms.has_detail)
        )
      "
    >
      <template #activator>
        <v-list-item-avatar
          v-if="
            !hidePreview &&
              ((layer.layer_type == 'wms' && layer.wms.has_preview) ||
                layer.layer_type == 'tms')
          "
          tile
          size="40"
        >
          <v-img
            :src="layerPreview"
            :lazy-src="layerPreview"
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="text-wrap">
            <span class="text-cursor">
              {{ layer.name }}
            </span>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action
          v-if="layer.visible && layer.filters.length != 0"
          @click.stop=""
        >
          <v-icon
            :class="{ 'red--text': showFilter }"
            @click="toggleFilter"
          >
            {{ icon_filter }}
          </v-icon>
        </v-list-item-action>
        <v-list-item-action
          class="pl-2"
          @click.stop=""
        >
          <v-icon
            :class="{ 'red--text': showMetadata }"
            @click="toggleMetadata"
          >
            {{ icon }}
          </v-icon>
        </v-list-item-action>
        <v-list-item-action @click.stop="">
          <v-switch
            :input-value="layer.visible"
            :loading="layer.loading"
            @change="toggleLayer"
          />
        </v-list-item-action>
      </template>
      <v-container class="py-0 mt-2">
        <SupportLayerMetadata
          v-if="showMetadata"
          :layer-id="layerId"
        />
      </v-container>
      <v-container class="py-0">
        <SupportLayerFilters
          v-if="layer.filters && showFilters"
          :layer="layer"
        />
        <v-col
          v-if="layer.wms.has_metadata"
          cols="12"
        >
          <v-btn
            :loading="isLoadingTable"
            icon
            fab
            small
            color="accent"
            @click="dispatchOpenTableDialog"
          >
            <v-tooltip left>
              <template #activator="{ on }">
                <v-icon v-on="on">
                  mdi-table
                </v-icon>
              </template>
              <span>{{ $t('table-label') }}</span>
            </v-tooltip>
          </v-btn>
        </v-col>
        <v-row
          v-if="
            layer.layer_type === 'wms' &&
              layer.visible &&
              layer.wms.has_opacity
          "
          class="black--text text--lighten-2"
          align="center"
        >
          <v-col
            cols="4"
            class="grey--text text--darken-2"
          >
            Opacidade
          </v-col>
          <v-col cols="8">
            <v-slider
              :value="layer.opacity"
              class="mb-n4"
              thumb-label
              @input="updateLayerOpacity($event)"
            />
          </v-col>
        </v-row>
        <v-row
          v-if="layer.layer_type === 'wms' && layer.wms.has_detail"
          justify="center"
          class=""
        >
          <v-col>
            <SubLayers
              v-if="layer.wms && layer.wms.has_sublayers"
              :layer="layer"
            />
            <v-img
              v-else
              contain
              :src="layerPreview"
              :lazy-src="layerPreview"
              :max-width="layer.wms.detail_width"
              position="center center"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-list-group>

    <TableDialog
      v-if="showTableDialog"
      :table="showTableDialog"
      :headers="tableHeaders"
      :value="transformTableData"
      :loading-table="isLoadingTable"
      :loading-csv="false"
      :f-download-csv="downloadCSV"
      :f-close-table="closeTableDialog"
      :table-name="layer.name"
    />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import tmsLegend from '@/assets/tmsLegend.png';
import ti from '@/assets/ti.png';

import SupportLayerFilters from '@/components/support/SupportLayerFilters';
import SupportLayerMetadata from '@/components/support/SupportLayerMetadata';
import SubLayers from './SubLayers.vue';
import TableDialog from '../table-dialog/TableDialog.vue';

export default {
  name: 'SupportLayersGroupItem',

  components: {
    SupportLayerFilters,
    SupportLayerMetadata,
    SubLayers,
    TableDialog,
  },

  props: {
    layerId: {
      type: Number,
      required: true,
    },

    hidePreview: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    isOpen: false,
    showMetadata: false,
    showFilter: false,
    showFilters: true,
    isLoadingTable: false,
  }),

  computed: {
    ...mapState('supportLayers', [
      'supportLayers',
      'showTableDialog',
      'tableData',
      'tableHeaders',
      'loadingTable',
    ]),

    icon() {
      return this.showMetadata
        ? 'mdi-information-off-outline'
        : 'mdi-information';
    },

    icon_filter() {
      return this.showFilters
        ? 'mdi-filter-remove-outline'
        : 'mdi-filter-outline';
    },

    layer() {
      console.log(this.supportLayers, this.layerId);

      return this.supportLayers[this.layerId] || null;
    },

    layerPreview() {
      if (this.layer.layer_type === 'tms') return tmsLegend;

      if (this.layer.wms.geoserver_layer_name === 'lim_terra_indigena_a') {
        return ti;
      }

      return (
        this.layer.wms.geoserver.preview_url
        + this.layer.wms.geoserver_layer_name
      );
    },

    disabledHeatmap() {
      return (
        this.layer.filters.length > 0
        && this.layer.layer_type === 'heatmap'
        && Object.keys(this.layer.filters).length === 0
        && !this.layer.loading
      );
    },

    transformTableData() {
      const transformed = (this.tableData.features || []).map((feature) => ({
        ...feature.properties,
        properties: feature.properties,
      }));
      console.log('Dados transformados para TableDialog:', transformed);
      return transformed;
    },
  },

  methods: {
    ...mapMutations('supportLayers', [
      'toggleLayerVisibility',
      'setLayerOpacity',
      'setTableDialog',
    ]),

    ...mapActions('supportLayers', ['openTableDialog']),

    dispatchOpenTableDialog() {
      console.log('Despachando openTableDialog para layerId:', this.layerId);
      this.openTableDialog({ layerId: this.layerId });
    },

    closeTableDialog() {
      console.log('Fechando diálogo da tabela');
      this.setTableDialog({
        show: false, data: { features: [] }, headers: [], loading: false,
      });
    },

    downloadCSV() {
      console.log('Download CSV não implementado');
    },

    toggleMetadata() {
      this.showMetadata = !this.showMetadata;
      this.isOpen = this.layer.visible;
    },

    toggleFilter() {
      this.showFilters = !this.showFilters;
      this.isOpen = this.layer.visible;
    },

    toggleLayer() {
      this.toggleLayerVisibility({
        id: this.layerId,
        visible: !this.layer.visible,
      });

      this.isOpen = this.layer.visible;
    },

    updateLayerOpacity(opacity) {
      this.setLayerOpacity({
        id: this.layerId,
        opacity,
      });
    },
  },
};
</script>

<i18n>
{
  "en": {
    "table-label": "Table"
  },
  "pt-br": {
    "table-label": "Tabela"
  }
}
</i18n>
