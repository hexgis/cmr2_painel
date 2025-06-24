<template>
  <div>
    <div>
      <AlertFilter @onSearch="search()" />
    </div>
    <div
      v-if="showFeaturesUrgentAlerts && !isLoadingFeatures"
      class="mx-4"
    >
      <v-divider />
      <p class="font-weight-regular pt-2 grey--text text--darken-2">
        {{ $t('legend') }}
      </p>
      <v-col class="grey--text text--darken-2">
        <v-row>
          <v-col>
            <v-icon
              class="mr-2"
              color="#990099"
            >
              mdi-square
            </v-icon>
            <span class="grey--text text--darken-2">
              {{ $t('recovery-deforestation') }}
            </span>
          </v-col>
          <v-col
            cols="3"
            class="px-0 d-flex justify-end"
          >
            <v-switch
              v-model="dr"
              class="mt-0 pt-0"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-icon
              class="mr-2"
              color="#b35900"
            >
              mdi-square
            </v-icon>
            <span class="grey--text text--darken-2">
              {{ $t('forest-fire') }}
            </span>
          </v-col>
          <v-col
            cols="3"
            class="px-0 d-flex justify-end"
          >
            <v-switch
              v-model="ff"
              class="mt-0 pt-0"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-icon
              class="mr-2"
              color="#ff8000"
            >
              mdi-square
            </v-icon>

            <span class="grey--text text--darken-2">
              {{ $t('degradation') }}
            </span>
          </v-col>
          <v-col
            cols="3"
            class="px-0 d-flex justify-end"
          >
            <v-switch
              v-model="dg"
              class="mt-0 pt-0"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-icon
              class="mr-2"
              color="#ff3333"
            >
              mdi-square
            </v-icon>
            <span class="grey--text text--darken-2">
              {{ $t('clear-cutting') }}
            </span>
          </v-col>
          <v-col
            cols="3"
            class="px-0 d-flex justify-end"
          >
            <v-switch
              v-model="cr"
              class="mt-0 pt-0"
            />
          </v-col>
        </v-row>

        <v-spacer />
      </v-col>
    </div>
  </div>
</template>

<i18n>
{
    "en": {
        "legend": "Legend:",

        "recovery-deforestation": "Regenerating Deforestation",
        "forest-fire": "Forest Fire",
        "degradation": "Degradation",
        "clear-cutting": "Clear-Cutting"
    },
    "pt-br": {
        "legend": "Legenda:",

        "recovery-deforestation": "Desmatamento em Regeneração",
        "forest-fire": "Fogo em Floresta",
        "degradation": "Degradação",
        "clear-cutting": "Corte Raso"
    }
}
</i18n>

<script>
import { mapActions, mapState } from 'vuex';
import AlertFilter from '@/components/monitoring-alerts/urgent-alerts/AlertFilter';

export default {
  components: { AlertFilter },

  data() {
    return {
      checkNewFilters: false,
      dr: true,
      ff: true,
      dg: true,
      cr: true,
    };
  },

  watch: {
    dr(newValue) {
      this.handleCheckboxChange(newValue, 'DR');
    },
    ff(newValue) {
      this.handleCheckboxChange(newValue, 'FF');
    },
    dg(newValue) {
      this.handleCheckboxChange(newValue, 'DG');
    },
    cr(newValue) {
      this.handleCheckboxChange(newValue, 'CR');
    },
  },

  computed: {
    featuresUrgentAlerts: {
      get() {
        return this.$store.state.urgent - alerts.showFeaturesUrgentAlerts;
      },

      set(value) {
        this.$store.commit(
          'urgent-alerts/setshowFeaturesUrgentAlerts',
          value,
        );
      },
    },

    ...mapState('urgent-alerts', [
      'showFeaturesUrgentAlerts',
      'features',
      'table',
      'isLoadingFeatures',
      'tableDialogAlert',
      'stageItemActive',
      'selectedStages',
      'setStageItemActive',
    ]),
  },

  methods: {
    async handleCheckboxChange(newValue, description) {
      if (newValue) {
        await this.updateDescription(description);
      } else {
        await this.removeDescription(description);
      }
    },

    updateStageItemList() {
      const stageItemActive = [];
      this.features.features.map((item) => {
        this.selectedStages.map((stageActive) => {
          stageActive === item.properties.no_estagio
            ? stageItemActive.push(item)
            : '';
        });
      });
      this.$store.commit('urgent-alerts/setStageItemActive', stageItemActive);
    },

    async updateDescription(value) {
      this.updateStageItemList();
      this.$store.commit('urgent-alerts/setSelectedStages', value);
      await this.updateFeatures();
    },

    async removeDescription(value) {
      this.$store.commit('urgent-alerts/removeSelectedStages', value);
      this.updateStageItemList();
      await this.updateFeatures();
    },

    search() {
      if (this.tableDialogAlert) {
        this.checkNewFilters = true;
        this.getDataTable();
      }
      if (!this.tableDialogAlert) this.getFeatures();
    },

    ...mapActions('urgent-alerts', [
      'getFeatures',
      'updateFeatures',
      'getDataTable',
    ]),
  },
};
</script>

<style scoped lang="scss">
.container-height {
    max-height: 90vh;
}

.selected {
    background-color: red;
}

.infoIconMargin {
    margin-left: 14px;
    margin-top: 16px;
}

@media (max-width: 768px) {
    .infoIconMargin {
        margin-left: 2px;
    }
}
</style>
