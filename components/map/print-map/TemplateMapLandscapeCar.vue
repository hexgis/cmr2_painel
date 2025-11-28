<template>
  <BaseModal
    :value="showDialog"
    @close="handleClose"
    width="90%"
    max-width="1200px"
  >
    <!-- Logos e Título centralizados -->
    <v-row class="justify-center text-center ma-2">
      <v-col cols="6" class="d-flex justify-end align-end">
        <v-img
          contain
          :src="logo_funai"
          max-width="120px"
          max-height="60px"
        />
      </v-col>
      <v-col cols="6" class="mt-2">
        <v-img
          contain
          :src="logo_cmr"
          max-width="180px"
          max-height="60px"
        />
      </v-col>
      <v-col cols="12">
        <p class="font-title text-h6">{{ mapTitle }}</p>
      </v-col>
    </v-row>

    <div style="background-color: #fff;" class="teste-print">
      <!-- Conteúdo do mapa CAR -->
      <div
        id="map-for-print-container-car"
        style="width: 100%; height: 400px; border: 1px solid #ccc;"
        key="car-map-container"
      ></div>

      <!-- Lista de CARs encontrados -->
      <div v-if="carData.length > 0" class="car-list pa-4">
        <h3>Imóveis CAR Encontrados ({{ carData.length }})</h3>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th>#</th>
                <th>Município</th>
                <th>Terra Indígena</th>
                <th>Área (ha)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(car, index) in carData" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ getMunicipioName(car) }}</td>
                <td>{{ getTerraIndigenaName(car) }}</td>
                <td>{{ formatNumber(car.properties?.area_ha) }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>

      <div v-else class="car-list pa-4">
        <v-alert type="info">
          Nenhum imóvel CAR encontrado na área selecionada.
        </v-alert>
      </div>
    </div>

    <!-- Botões de ação -->
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="handleBack">
        {{ $t('input-button-back-second-step') }}
      </v-btn>
      <v-btn color="primary" @click="print">
        {{ $t('input-button-pdf-image') }}
      </v-btn>
    </v-card-actions>
  </BaseModal>
</template>

<i18n>
{
  "en": {
    "print-out": "Print Out",
    "legend": "Legend:",
    "text-address0": " | Print date: ",
    "text-address": " | Print date: ",
    "text-info": "The information may be distorted depending on the cartographic bases used.",
    "text-format": "Format-adapted map template ",
    "input-button-back-second-step": "Back",
    "input-button-pdf-image": "Generate PDF",
    "author-label": "Author: ",
    "clear-cut": "Clear Cut",
    "degradation": "Degradation",
    "forest-fire": "Forest Fire",
    "regeneration-deforestation": "Regeneration Deforestation",
    "burnt-scar": "Burnt Scar",
    "deforestation-veg": "Vegetation Deforestation",
    "disorderly-cs": "Disorderly Cs",
    "deforestation-cr": "Deforestation Cr",
    "geometric-cs": "Geometric Cs",
    "mining": "Mining",
    "land-use-print-label": "Year usage and occupancy data",
    "monitoring-print-label": "Daily Monitoring Data between",
    "alerts-print-label": "Daily Urgent Alerts Data between",
    "and": "and",
    "prodes-print-label": "Prodes data between",
    "deter-print-label": "Deter data between",
    "heat-focus-print-label": "Heat focus data between",
    "aqua-morning": "Aqua Modis Morning",
    "aqua-afternoon": "Aqua Modis Afternoon",
    "geodetic-system-info-part1": "The geospatial information presented in this report is referenced to the geodetic system in geographic coordinates",
    "geodetic-system-info-strong": "SIRGAS2000 (EPSG:4674)",
    "geodetic-system-info-part2": ". All coordinates, measurements and cartographic representations follow this datum."
  },
  "pt-br": {
    "print-out": "Impressão",
    "legend": "Legenda:",
    "text-address0": " | CENTRO DE MONITORAMENTO REMOTO - https://cmr.funai.gov.br ",
    "text-address": " | Data da impressão: ",
    "text-info": "As informações podem apresentar distorções em função das bases cartográficas utilizadas.",
    "text-format": "Modelo de mapa adaptado para formato ",
    "input-button-back-second-step": "Voltar",
    "input-button-pdf-image": "Gerar PDF",
    "author-label": "Autor: ",
    "clear-cut": "Corte Raso",
    "degradation": "Degradação",
    "forest-fire": "Fogo em Floresta",
    "regeneration-deforestation": "Desmatamento em Regeneração",
    "burnt-scar": "Cicatriz de Queimada",
    "deforestation-veg": "Desmatamento Veg",
    "disorderly-cs": "Cs Desordenado",
    "deforestation-cr": "Desmatamento Cr",
    "geometric-cs": "Cs Geométrico",
    "mining": "Mineração",
    "land-use-print-label": "Dados de Uso e Ocupação ano",
    "monitoring-print-label": "Dados de Monitoramento Diário entre",
    "alerts-print-label": "Dados de Alertas Urgente entre",
    "and": "e",
    "prodes-print-label": "Dados Prodes entre",
    "deter-print-label": "Dados Deter entre",
    "heat-focus-print-label": "Dados de Focos de Calor entre",
    "aqua-morning": "Aqua Modis Manhã",
    "aqua-afternoon": "Aqua Modis Tarde",
    "geodetic-system-info-part1": "As informações geoespaciais apresentadas neste relatório estão referenciadas ao sistema geodésico em coordenadas geográficas",
    "geodetic-system-info-strong": "SIRGAS2000 (EPSG:4674)",
    "geodetic-system-info-part2": ". Todas as coordenadas, medições e representações cartográficas seguem este datum."
  }
}
</i18n>

<script>
import { mapState, mapMutations } from 'vuex'
import BaseModal from '../../base/BaseModal.vue'

export default {
  name: 'MapLandscapeCar',
  components: {
    BaseModal,
  },

  data: () => ({
    logo_funai: process.env.DEFAULT_LOGO_IMAGE_FUNAI,
    logo_cmr: process.env.DEFAULT_LOGO_IMAGE_CMR,
    printMap: null,
    carLayer: null,
    mapInitialized: false,
    CAR_COLORS: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      '#F9E79F', '#A9DFBF', '#F5B7B1', '#AED6F1', '#E8DAEF',
      '#A3E4D7', '#FAD7A0', '#D2B4DE', '#A9CCE3', '#F9E79F',
      '#ABEBC6'
    ],
  }),

  computed: {
    ...mapState('map', ['carPrintData', 'showTemplateMapLandscapeCar']),

    showDialog() {
      return this.showTemplateMapLandscapeCar && this.carPrintData.visible;
    },

    mapTitle() {
      return this.carPrintData.mapTitle || '';
    },

    leafSize() {
      return this.carPrintData.leafSize || { type: 'A4' };
    },

    mapBounds() {
      return this.carPrintData.mapBounds;
    },

    selectedBaseMapUrl() {
      return this.carPrintData.selectedBaseMapUrl;
    },

    carData() {
      return this.carPrintData.carData || [];
    }
  },

  watch: {
    showDialog: {
      handler(newVal) {
        if (newVal) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.initializeMap();
              if (this.carData.length > 0) {
                this.displayCAROnMap(this.carData);
              }
            }, 300); // Aumentei o delay para garantir que o DOM esteja pronto
          });
        } else {
          this.cleanupMap();
        }
      },
      immediate: true
    }
  },

  methods: {
    ...mapMutations('map', ['setShowTemplateMapLandscapeCar', 'clearCarPrintData']),

    handleClose() {
      this.setShowTemplateMapLandscapeCar(false);
      this.clearCarPrintData();
      this.$emit('close');
    },

    handleBack() {
      this.setShowTemplateMapLandscapeCar(false);
      this.$emit('back');
    },

    initializeMap() {
      if (this.mapInitialized && this.printMap) {
        console.log('🗺️ Mapa já inicializado, recriando...');
        this.cleanupMap();
      }

      if (!this.printMap && this.mapBounds) {
        this.createPrintMap();
      }
    },

    createPrintMap() {
      const mapContainer = document.getElementById('map-for-print-container-car');
      if (!mapContainer) {
        console.error('Container do mapa CAR não encontrado');
        return;
      }

      try {
        // Verificar se já existe um mapa no container
        if (mapContainer._leaflet_map) {
          console.log('🗑️ Removendo mapa existente do container...');
          mapContainer._leaflet_map.remove();
        }

        // Criar novo mapa Leaflet
        this.printMap = L.map('map-for-print-container-car', {
          attributionControl: false,
          zoomControl: true
        });

        // Adicionar base map se disponível
        if (this.selectedBaseMapUrl) {
          L.tileLayer(this.selectedBaseMapUrl, {
            maxZoom: 19,
          }).addTo(this.printMap);
        } else {
          // Fallback para um base map padrão
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(this.printMap);
        }

        // Configurar a view baseada nos bounds salvos
        if (this.mapBounds) {
          const bounds = L.latLngBounds(
            [this.mapBounds.south, this.mapBounds.west],
            [this.mapBounds.north, this.mapBounds.east]
          );
          this.printMap.fitBounds(bounds);
          console.log('🗺️ Mapa configurado com bounds:', bounds);
        }

        this.mapInitialized = true;
        console.log('🗺️ Mapa de impressão CAR criado com sucesso!');
      } catch (error) {
        console.error('Erro ao criar mapa CAR:', error);
      }
    },

    displayCAROnMap(features) {
      if (!this.printMap || !features.length) {
        console.log('Mapa não disponível ou sem features para exibir');
        return;
      }

      console.log('🗺️ Adicionando CAR ao mapa de impressão...');

      // Remover layers anteriores
      this.removeCARFromMap();

      const validLayers = [];

      features.forEach((feature, index) => {
        try {
          const color = this.getCarColor(index);
          const numero = index + 1;

          const carStyle = {
            color,
            weight: 3,
            opacity: 0.9,
            fillColor: color,
            fillOpacity: 0.3,
          };

          const layer = L.geoJSON(feature, {
            style: carStyle,
          });

          // Verificar se a layer tem geometria válida
          let layerBounds;
          try {
            layerBounds = layer.getBounds();
            if (!layerBounds.isValid()) {
              console.warn(`Geometria inválida para CAR ${index + 1}`);
              return;
            }
          } catch (boundsError) {
            console.warn(`Erro ao obter bounds para CAR ${index + 1}:`, boundsError);
            return;
          }

          // Adicionar marcador numérico
          let numberMarker = null;
          try {
            const center = layerBounds.getCenter();
            numberMarker = L.marker(center, {
              icon: L.divIcon({
                className: 'car-number-marker',
                html: `<div style="
                  background-color: ${color};
                  color: white;
                  border: 2px solid white;
                  border-radius: 50%;
                  width: 30px;
                  height: 30px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 14px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">${numero}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
              }),
            });
          } catch (markerError) {
            console.warn(`Não foi possível criar marcador para CAR ${index + 1}:`, markerError);
          }

          const finalLayer = numberMarker ? L.layerGroup([layer, numberMarker]) : layer;
          validLayers.push(finalLayer);

        } catch (error) {
          console.warn(`Erro ao processar CAR ${index + 1}:`, error);
        }
      });

      if (validLayers.length > 0) {
        this.carLayer = L.layerGroup(validLayers);
        this.carLayer.addTo(this.printMap);

        console.log(`✅ ${validLayers.length} CARs adicionados ao mapa de impressão!`);

        // Ajustar view para mostrar todos os CARs
        this.adjustMapToCARs(validLayers);
      } else {
        console.log('⚠️ Nenhuma layer válida para exibir');
      }
    },

    adjustMapToCARs(layers) {
      if (!layers.length || !this.printMap) return;

      try {
        // Coletar todos os bounds válidos
        const allBounds = layers.map(layer => {
          try {
            return layer.getBounds ? layer.getBounds() : null;
          } catch (error) {
            console.warn('Erro ao obter bounds da layer:', error);
            return null;
          }
        }).filter(bounds => bounds && bounds.isValid());

        if (allBounds.length === 0) {
          console.log('⚠️ Nenhum bounds válido encontrado para ajustar o mapa');
          return;
        }

        // Criar um bounds que engloba todos os bounds individuais
        const groupBounds = allBounds.reduce((acc, bounds) => {
          return acc.extend(bounds);
        }, allBounds[0].clone());

        if (groupBounds.isValid()) {
          this.printMap.fitBounds(groupBounds.pad(0.1));
          console.log('🗺️ Mapa ajustado para mostrar todos os CARs');
        }
      } catch (error) {
        console.warn('Erro ao ajustar bounds do mapa:', error);
        // Fallback: usar os bounds originais do mapa
        if (this.mapBounds) {
          const bounds = L.latLngBounds(
            [this.mapBounds.south, this.mapBounds.west],
            [this.mapBounds.north, this.mapBounds.east]
          );
          this.printMap.fitBounds(bounds);
        }
      }
    },

    removeCARFromMap() {
      if (this.carLayer && this.printMap) {
        this.printMap.removeLayer(this.carLayer);
        this.carLayer = null;
      }
    },

    cleanupMap() {
      console.log('🧹 Limpando mapa CAR...');
      this.removeCARFromMap();
      if (this.printMap) {
        try {
          this.printMap.remove();
          this.printMap = null;
        } catch (error) {
          console.warn('Erro ao remover mapa:', error);
        }
      }
      this.mapInitialized = false;
    },

    getMunicipioName(carItem) {
      return carItem.properties?.no_municipio_car ||
             carItem.properties?.no_municipio || '-';
    },

    getTerraIndigenaName(carItem) {
      return carItem.properties?.no_terra_indigena ||
             carItem.properties?.nome ||
             'Nome não disponível';
    },

    getCarColor(index) {
      return this.CAR_COLORS[index % this.CAR_COLORS.length];
    },

    formatNumber(value) {
      if (value == null || value === '') return '-';

      try {
        const num = typeof value === 'string'
          ? parseFloat(value.replace(/\./g, '').replace(',', '.'))
          : Number(value);

        if (isNaN(num)) return '-';

        if (Number.isInteger(num)) {
          return num.toLocaleString('pt-BR');
        }

        const formatted = num.toLocaleString('pt-BR', {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        });

        return formatted;
      } catch {
        return '-';
      }
    },

    print() {
      window.print();
    }
  },

  beforeDestroy() {
    this.cleanupMap();
  }
}
</script>

<style scoped>
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .page-break {
    page-break-after: always;
    break-after: page;
    min-height: 100vh;
    padding: 20px;
    box-sizing: border-box;
  }

  .page-break:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  @page {
    margin: 10px;
    size: landscape;
  }

  .no-print {
    display: none !important;
  }
}

.car-number-marker {
  background: transparent !important;
  border: none !important;
}

#map-for-print-container-car {
  min-height: 400px;
}
</style>
