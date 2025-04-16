<template>
  <l-lwms-tile-layer
    v-if="layer.layer_type == 'wms'"
    ref="wmsLayer"
    :base-url="wmsBaseUrl"
    :layers="geoserverLayer"
    format="image/png"
    :transparent="true"
    :z-index="3"
    :visible="layer.visible"
    :options="wmsOptions"
  />

  <l-tile-layer
    v-else-if="layer.layer_type == 'tms'"
    :url="layer.tms?.url"
    :visible="layer.visible"
    :z-index="3"
    :options="{
      maxNativeZoom: layer.tms?.max_native_zoom
        ? layer.tms?.max_native_zoom
        : 15,
    }"
  />

  <l-layer-group
    v-else-if="layer.layer_type == 'heatmap'"
    ref="heatmap"
    :visible="layer.visible"
  />
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'SupportLayerItem',

  props: {
    layer: {
      type: Object,
      required: true,
    },
    cql_filter: {
      type: String,
      required: true,
    },
  },

  computed: {
    geoserverLayer() {
      if (
        this.layer.wms
                && this.layer.wms.geoserver_layer_namespace
                && this.layer.wms.geoserver_layer_name
      ) {
        return (
          `${this.layer.wms.geoserver_layer_namespace
          }:${
            this.layer.wms.geoserver_layer_name}`
        );
      } return '';
    },

    wmsOptions() {
      let cql = this.cql_filter;
      if (this.requestTool !== 'SearchInArea') {
        const support = Object.values(this.supportLayers)
          .filter((item) => item.id === this.layer.id);
        cql = support.length && support[0].cql ? `${this.cql_filter} AND (${support[0].cql})` : this.cql_filter;
      }
      let options = {};
      if (this.layer.layer_type === 'wms') {
        options = {
          name: this.layer.name,
          maxZoom: 21,
          maxNativeZoom: 19,
          queryable: this.layer.wms.queryable,
          cql_filter: cql,
        };
      }
      return options;
    },

    wmsBaseUrl() {
      let wmsUrl = '';
      if (this.layer.layer_type === 'wms') {
        if (this.layer.filters) {
          wmsUrl = `${this.layer.wms.geoserver.wms_url
          }&env=opacity:${
            this.layer.opacity / 100}`;
          if (Object.keys(this.layer.filters).length) {
            wmsUrl += '&viewparams=';

            for (const filter in this.layer.filters) {
              wmsUrl += `${filter}:${this.layer.filters[filter]};`;
            }
          }
        } else {
          wmsUrl = `${this.layer.wms.geoserver.wms_url
          }&env=opacity:${
            this.layer.opacity / 100}`;
        }

        this.$nextTick(() => this.$refs.wmsLayer.mapObject.setUrl(wmsUrl));
      }
      return wmsUrl;
    },
    ...mapState('supportLayers', [
      'supportLayers',
    ]),
    ...mapState('searchInArea', [
      'requestTool',
    ]),
  },
};
</script>
