<template>
  <div class="restricted-area pa-5">
    <h1 class="pb-5 text-uppercase">
      {{ $t('restricted-area') }}
    </h1>
    <StatusFilter
      :requestStatus="requestStatus"
      :selectedStatus="selectedStatus"
      :showFilters="showFilters"
      @status-changed="toggleStatus"
      @toggle-filters="toggleFilters"
    />
    <div v-if="showFilters" class="search mt-4">
      <SearchFilters :filters="filters" :reviewersList="reviewersList" :isNewAccessRequest="true"/>
    </div>
    <div class="card--wrapper mt-6">
      <RestrictedAreaCard
        v-for="(data, index) in filteredTestCases"
        :key="index"
        :userRequestData="data"
      />
    </div>
  </div>
</template>
<i18n>
  {
    "en": {
      "restricted-area": "Restricted Area"
    },
    "pt-br": {
      "restricted-area": "Área Restrita"
    }
  }
</i18n>
<script>
import { mapGetters } from 'vuex';
import SearchFilters from '@/components/admin/SearchFilters.vue'
import RestrictedAreaCard from '@/components/admin/RestrictedAreaCard.vue'
import StatusFilter from '@/components/admin/StatusFilter.vue'

export default {
  name: 'AreaRestrita',

  layout: 'admin',

  components: { RestrictedAreaCard, SearchFilters, StatusFilter },
  
  data: () => ({
    requestStatus: [],
    selectedStatus: null,
    showFilters: false,
    filters: {
      siape: '',
      servidor: '',
      coordenador: '',
      lotacao: '',
      dataInicial: null,
      dataFinal: null,
      avaliadoPor: '',
    },
    menuStartDate: false,
    menuEndDate: false,
  }),

  computed: {
    reviewersList() {
      const reviewers = this.newUsersRequest
        .map((testCase) => testCase.reviewed_by_name)
        .filter((name) => name);

      return [...new Set(reviewers)];
    },

    filteredTestCases() {
      return this.newUsersRequest.filter((testCase) => {
        const {
          siape, servidor, coordenador, lotacao, dataInicial, dataFinal, avaliadoPor,
        } = this.filters;

        const matchesStatus = !this.selectedStatus || testCase.status_name === this.selectedStatus;
        const matchesSIAPE = !siape || testCase.user_siape_registration.toString().includes(siape);
        const matchesServidor = !servidor || testCase.name.toLowerCase().includes(servidor.toLowerCase());
        const matchesCoordenador = !coordenador || testCase.coordinator_name.toLowerCase().includes(coordenador.toLowerCase());
        const matchesLotacao = !lotacao || testCase.department.toLowerCase().includes(lotacao.toLowerCase());

        const matchesDateRange = (!dataInicial || new Date(testCase.access_request.solicitation_date_formatted) >= new Date(dataInicial))
          && (!dataFinal || new Date(testCase.access_request.solicitation_date_formatted) <= new Date(dataFinal));

        const matchesAvaliadoPor = !avaliadoPor
          || (testCase.reviewed_by_name && testCase.reviewed_by_name.toLowerCase().includes(avaliadoPor.toLowerCase()));

        return matchesStatus && matchesSIAPE && matchesServidor && matchesCoordenador
              && matchesLotacao && matchesDateRange && matchesAvaliadoPor;
      });
    },

    ...mapGetters('admin', ['newUsersRequest']),
  },

  async mounted() {
    await this.$store.dispatch('admin/fetchRequestListAccess');
    this.requestStatus = [...new Set(this.newUsersRequest.map((testCase) => testCase.status_name))];
  },

  methods: {
    toggleStatus(status) {
      this.selectedStatus = this.selectedStatus === status ? null : status;
      this.applySearch();
    },

    applySearch() {
      this.filteredTestCases;
    },

    getStatusButtonStyle(status) {
      return {
        backgroundColor: status === this.selectedStatus ? '#9A9997' : '',
        color: status === this.selectedStatus ? '#FFFFFF' : '',
      };
    },

    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
  },
};
</script>

<style lang="sass" scoped>
  .search
    background: #FFFFFF
    border: 1px solid #9A999745
    padding: 2rem
    border-radius: 8px

  .restricted-area
    height: 100vh
    overflow-y: auto
    width: 100%

  .card--wrapper
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(350px,1fr))
    gap: 1rem

  .filter
    position: relative

    & > button:last-child
      position: absolute
      right: 1rem

    & > button + button
      margin-left: 1rem

</style>
