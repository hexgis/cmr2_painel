<template>
  <div class="restricted-area pa-5">
    <span class="d-flex align-center justify-space-between">
      <h1 class="pb-5 text-uppercase">
        {{ $t('restricted-area') }}
      </h1>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            color="primary"
            text
            v-bind="attrs"
            v-on="on"
            @click="$router.push('/cmr')"
          >
            <v-icon color="primary">mdi-home</v-icon>
          </v-btn>
        </template>
        <span>Ir para o CMR</span>
      </v-tooltip>
    </span>
    <StatusFilter
      :request-status="requestStatus"
      :selected-status="selectedStatus"
      :show-filters="showFilters"
      @status-changed="toggleStatus"
      @toggle-filters="toggleFilters"
    />
    <div
      v-if="showFilters"
      class="search mt-4"
    >
      <SearchFilters
        :filters="filters"
        :reviewers-list="reviewersList"
        :is-new-access-request="true"
      />
    </div>
    <div class="card--wrapper mt-6">
      <RestrictedAreaCard
        v-for="(data, index) in filteredTestCases"
        :key="index"
        :user-request-data="data"
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
import { mapGetters, mapState } from 'vuex';
import SearchFilters from '@/components/admin/SearchFilters.vue';
import RestrictedAreaCard from '@/components/admin/RestrictedAreaCard.vue';
import StatusFilter from '@/components/admin/StatusFilter.vue';

export default {
  name: 'AreaRestrita',
  components: { RestrictedAreaCard, SearchFilters, StatusFilter },
  layout: 'admin',
  middleware: 'admin',

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
    ...mapGetters('admin', ['newUsersRequest']),
    ...mapState('userProfile', ['user']),
    
    isAdministrator() {
      return this.user && this.user.roles && this.user.roles.some((role) => role.name === 'Administrador');
    },
    
    isGestor() {
      return this.user && this.user.roles && this.user.roles.some((role) => role.name === 'Gestor');
    },
    
    isCommonUser() {
      return this.user && (!this.user.roles || this.user.roles.length === 0 || 
             !this.user.roles.some(role => role.name === 'Gestor' || role.name === 'Administrador'));
    },

    reviewersList() {
      const reviewers = this.newUsersRequest
        .map((testCase) => testCase.reviewed_by_name)
        .filter((name) => name);

      return [...new Set(reviewers)];
    },

    filteredTestCases() {
      let requests = this.newUsersRequest;

      // Apply role-based filtering
      if (this.isCommonUser) {
        // Common users can only see their own requests
        requests = requests.filter((request) => request.email === this.user.email);
      } else if (this.isGestor && !this.isAdministrator) {
        // Gestores can only see requests from their institution
        requests = requests.filter((request) => {
          if (!this.user.institution || !request.institution) return false;
          return request.institution === this.user.institution;
        });
      }
      // Administrators can see all requests (no filtering)

      // Apply search filters
      return requests.filter((testCase) => {
        const {
          siape, servidor, coordenador, lotacao, dataInicial, dataFinal, avaliadoPor,
        } = this.filters;

        const matchesStatus = !this.selectedStatus || testCase.status_name === this.selectedStatus;
        const matchesSIAPE = !siape || testCase.user_siape_registration.toString().includes(siape);
        const matchesServidor = !servidor || testCase.name.toLowerCase().includes(servidor.toLowerCase());
        const matchesCoordenador = !coordenador || testCase.coordinator_name.toLowerCase().includes(coordenador.toLowerCase());
        const matchesLotacao = !lotacao || testCase.institution.toLowerCase().includes(lotacao.toLowerCase());

        const matchesDateRange = (!dataInicial || new Date(testCase.access_request.solicitation_date_formatted) >= new Date(dataInicial))
          && (!dataFinal || new Date(testCase.access_request.solicitation_date_formatted) <= new Date(dataFinal));

        const matchesAvaliadoPor = !avaliadoPor
          || (testCase.reviewed_by_name && testCase.reviewed_by_name.toLowerCase().includes(avaliadoPor.toLowerCase()));

        return matchesStatus && matchesSIAPE && matchesServidor && matchesCoordenador
              && matchesLotacao && matchesDateRange && matchesAvaliadoPor;
      });
    },
  },

  async mounted() {
    await this.$store.dispatch('admin/fetchRequestListAccess');
    await this.$store.dispatch('admin/fetchInstitutionList');
    await this.$store.dispatch('admin/fetchRolesList');
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
