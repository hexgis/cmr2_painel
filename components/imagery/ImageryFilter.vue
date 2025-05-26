<template>
  <v-form v-model="valid">
    <v-row
      dense
      class="pt-3"
    >
      <template v-if="isHighResSatellite">
        <DataUsage
          :data="dataUsage"
          class="pb-3"
        />
      </template>

      <v-col
        cols="12"
        class="pb-6"
      >
        <v-autocomplete
          v-model="filters.satellite"
          :label="$t('satellite-label')"
          :items="satellites"
          item-text="name"
          outlined
          hide-details
          return-object
          required
          :rules="[!!filters.satellite || $t('required-label')]"
        >
          <template #item="data">
            <v-list-item-content>
              <v-list-item-title class="ml-4">
                {{ data.item.name }}
              </v-list-item-title>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-col>

      <v-col cols="6">
        <BaseDateField
          v-model="filters.startDate"
          :label="$t('start-date-label')"
          :required="true"
          outlined
        />
      </v-col>

      <v-col cols="6">
        <BaseDateField
          v-model="filters.endDate"
          :label="$t('end-date-label')"
          :required="true"
          :min-date="filters.startDate"
          outlined
        />
      </v-col>

      <v-col cols="12">
        <v-row align="center">
          <v-col
            cols="8"
            class="pt-0 v-label theme--light"
          >
            {{ $t('cloud-cover-label') }}
          </v-col>

          <v-col
            cols="4"
            class="pt-0"
          >
            <v-text-field
              v-model="filters.cloudCover"
              v-mask="'###'"
              dense
              outlined
              suffix="%"
              hide-details
            />
          </v-col>
        </v-row>
        <v-slider
          v-model="filters.cloudCover"
          thumb-label
        />
      </v-col>

      <template v-if="isHighResSatellite">
        <v-col cols="12">
          <v-row align="center">
            <v-col
              cols="8"
              class="pt-0 v-label theme--light"
            >
              {{ $t('incidence-angle-label') }}
            </v-col>

            <v-col
              cols="4"
              class="pt-0"
            >
              <v-text-field
                v-model="filters.incidenceAngle"
                dense
                outlined
                suffix="%"
                hide-details
              />
            </v-col>
          </v-row>
          <v-slider
            v-model="filters.incidenceAngle"
            min="-50"
            max="50"
            thumb-label
          />
        </v-col>

        <v-col cols="12">
          <v-checkbox
            v-model="filters.streamOTF"
            :label="$t('streaming-label')"
            class="mt-0"
          />
        </v-col>
      </template>

      <v-col cols="12">
        <v-btn
          block
          color="accent"
          :loading="isLoadingScenes"
          :disabled="!valid"
          @click="submit"
        >
          {{ $t('search-button') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<i18n>
{
    "en": {
        "satellite-label": "Satellite",
        "start-date-label": "Start date",
        "end-date-label": "End date",
        "cloud-cover-label": "Max cloud cover",
        "incidence-angle-label": "Max incidence angle",
        "streaming-label": "Streaming on the fly",
        "search-button": "Search",
        "required-label": "Field is required",
        "satellite-api-error": "Error when acquiring satellite list."
    },
    "pt-br": {
        "satellite-label": "Satélite",
        "start-date-label": "Data inicial",
        "end-date-label": "Data final",
        "cloud-cover-label": "Taxa máxima de nuvens",
        "incidence-angle-label": "Ângulo de incidência máximo",
        "streaming-label": "Streaming on the fly",
        "search-button": "Pesquisar",
        "required-label": "Campo obrigatório",
        "satellite-api-error": "Não foi possível resgatar lista de satélites."
    }
}
</i18n>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

import BaseDateField from '@/components/base/BaseDateField';
import DataUsage from '@/components/data-usage/DataUsage';

export default {
  name: 'ImageryFilters',

  components: { BaseDateField, DataUsage },

  data() {
    return {
      valid: null,
      agencies: [],
      filters: {
        satellite: null,
        startDate: this.$moment()
          .subtract(30, 'days')
          .format('YYYY-MM-DD'),
        endDate: this.$moment().format('YYYY-MM-DD'),
        cloudCover: 100,
        incidenceAngle: 30,
        streamOTF: false,
      },
    };
  },

  computed: {
    isHighResSatellite() {
      return (
        this.filters.satellite
                && this.filters.satellite.agency === 'AIRBUS'
      );
    },
    satellites() {
      let satellites = [];
      this.agencies.forEach((agency, i) => {
        if (i !== 0) satellites.push({ divider: true });
        satellites.push({ header: agency.name });
        satellites = satellites.concat(agency.satellites);
      });
      return satellites;
    },
    maxUsage() {
      if (this.dataUsage) return this.dataUsage.max;
      return 0;
    },
    consumedUsage() {
      if (this.dataUsage) return this.dataUsage.consumed;
      return 0;
    },

    ...mapState('imagery', ['isLoadingScenes', 'dataUsage']),
    ...mapGetters('imagery', ['showScenes']),
  },

  watch: {
    isHighResSatellite(value) {
      if (value) this.getDataUsage();
      else this.clearDataUsage();
    },
  },

  created() {
    this.getSatellites();

    if (this.showScenes) {
      const storeFilters = this.$store.state.imagery.filters;
      this.filters.satellite = storeFilters.satellite;
      this.filters.startDate = storeFilters.startDate;
      this.filters.endDate = storeFilters.endDate;
      this.filters.cloudCover = storeFilters.cloudCover;
      this.filters.incidenceAngle = storeFilters.incidenceAngle;
      this.filters.streamOTF = storeFilters.streamOTF;
    }
  },

  methods: {
    async getSatellites() {
      try {
        this.agencies = await this.$apiSkynet.$get('area/agencies/');
      } catch (exception) {
        this.$store.commit('alert/addAlert', {
          message: this.$t('satellite-api-error'),
        });
      }
    },

    submit() {
      this.getScenes({ filters: this.filters });
      this.getBands(this.filters.satellite);
      this.getCompositions(this.filters.satellite);
      this.$emit('onSearch');
    },

    ...mapActions('imagery', [
      'getScenes',
      'getBands',
      'getCompositions',
      'getDataUsage',
      'clearDataUsage',
    ]),
  },
};
</script>

<style>
.v-input--slider .v-messages {
    display: none;
}
</style>
