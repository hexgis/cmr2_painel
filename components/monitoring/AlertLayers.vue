<template>
  <l-layer-group
    name="alert"
    :visible="showFeaturesUrgentAlerts"
  >
    <l-layer-group
      ref="alertHeat"
      :visible="heatMap"
    />
    <l-feature-group ref="alertPolygons">
      <l-popup
        ref="popup"
        :options="{
          minWidth: 500,
          className: 'card-popup',
        }"
      >
        <BaseMetadataPopup
          ref="popupComponent"
          :feature="selectedAlertFeature"
        />
      </l-popup>
      <l-geo-json
        v-if="featuresLoaded"
        :geojson="features"
        :options="{ onEachFeature }"
      />
    </l-feature-group>
  </l-layer-group>
</template>

<i18n>
{
    "en": {
        "detail-api-error": "Error while retrieving polygon data, contact a system administrator in case it persists."
    },
    "pt-br": {
        "detail-api-error": "Não foi possível resgatar os dados do polígono, entre em contato com um administrador caso persista."
    }
}
</i18n>

<script>
import { mapState, mapGetters } from 'vuex';

import BaseMetadataPopup from '@/components/base/BaseMetadataPopup';

export default {
  name: 'AlertLayers',

  components: {
    BaseMetadataPopup,
  },

  props: {
    map: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    selectedAlertFeature: null,
    heatmapLayer: null,
  }),

  computed: {
    ...mapState('urgent-alerts', [
      'features',
      'opacity',
      'heatMap',
      'showFeaturesUrgentAlerts',
      'selectedStages',
    ]),
    ...mapGetters('urgent-alerts', [
      'featuresLoaded',
      'getShowFeaturesUrgentAlerts',
    ]),
  },

  watch: {
    features() {
      if (this.features && this.features.features) {
        this.addFeatures();
      } else {
        console.warn('No features to load');
      }
    },

    map() {
      this.addFeatures();
    },

    opacity() {
      this.$refs.alertPolygons.mapObject.invoke(
        'setStyle',
        this.setUrgentAlertsStyle,
      );
    },
  },

  methods: {
    addFeatures() {
      if (!this.features || !this.features.features) {
        console.warn('Features are not loaded yet');
        return;
      }

      this.$refs.alertPolygons.mapObject.clearLayers();

      if (this.selectedStages.length === 0) {
        console.log('Nenhum estágio ativo, não adicionando camadas');
        return;
      }

      if (this.features.features.length) {
        this.createUrgentAlertsHeatLayer();
        if (this.getShowFeaturesUrgentAlerts) {
          this.flyTo();
        }
        this.$refs.alertPolygons.mapObject.addLayer(
          this.createGeoJsonLayer(),
        );
      }
    },

    createGeoJsonLayer() {
      const filteredFeatures = {
        ...this.features,
        features: this.features.features.filter((feature) => this.selectedStages.includes(feature.properties.no_estagio)),
      };

      return this.$L.geoJSON(filteredFeatures, {
        style: (feature) => {
          const appliedStyle = this.setUrgentAlertsStyle(feature);
          return appliedStyle;
        },
        onEachFeature: this.onEachFeature,
      });
    },
    onEachFeature(feature, layer) {
      layer.setStyle(this.setUrgentAlertsStyle(feature));
      layer.on('click', () => {
        this.getFeatureDetails(feature.properties.id);
      });
    },

    setUrgentAlertsStyle(feature) {
      const estagio = feature.properties.no_estagio;
      const style = {
        weight: 3,
        fill: true,
        fillOpacity: this.opacity / 100,
      };

      switch (estagio) {
        case 'CR': // Corte Raso
          style.color = '#ff3333';
          style.fillColor = '#ff3333';
          break;
        case 'DG': // Degradação
          style.color = '#ff8000';
          style.fillColor = '#ff8000';
          break;
        case 'FF': // Fogo em Floresta
          style.color = '#b35900';
          style.fillColor = '#b35900';
          break;
        case 'DR': // Desmatamento em Regeneração
          style.color = '#990099';
          style.fillColor = '#990099';
          break;
        default: // Estilo padrão
          style.color = '#000000';
          style.fillColor = '#000000';
      }

      return style;
    },

    async getFeatureDetails(featureId) {
      this.selectedAlertFeature = null;
      try {
        this.selectedAlertFeature = await this.$api.$get(
          `alerts/detail/${featureId}/`,
        );
      } catch (exception) {
        this.$store.commit('alert/addAlert', {
          message: this.$t('detail-api-error'),
        });
      }
    },

    flyTo() {
      const bounds = this.$L.geoJSON(this.features).getBounds();
      if (bounds.getNorthEast() && bounds.getSouthWest()) {
        this.map.flyToBounds(bounds);
      }
    },

    createUrgentAlertsHeatLayer() {
      const areas = this.features.features.map(
        (feature) => feature.properties.area_ha,
      );
      const maxArea = Math.max.apply(null, areas);

      const heatData = [];
      this.features.features.forEach((feature) => {
        heatData.push([
          feature.properties.nu_latitude,
          feature.properties.nu_longitude,
          feature.properties.nu_area_km2 / maxArea,
        ]);
      });

      if (this.heatmapLayer) {
        this.heatmapLayer.removeFrom(this.$refs.alertHeat.mapObject);
      }
      this.heatmapLayer = this.$L.heatLayer(heatData, {
        minOpacity: 0.5,
        maxZoom: 18,
        radius: 20,
        blur: 15,
        zIndex: 4,
      });
      this.heatmapLayer.addTo(this.$refs.alertHeat.mapObject);
    },
  },
};
</script>
