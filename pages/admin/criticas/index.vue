<template>
  <div class="critics">
    <span class="d-flex align-center justify-space-between">
      <h1>{{ $t('criticismsSuggestions') }}</h1>
      <v-btn color="primary" text @click="$router.push('/')">
        <v-icon color="primary">mdi-home</v-icon>
      </v-btn>
    </span>
    <v-row class="mt-4">
      <v-col>
        <v-card class="pa-5 pb-2" style="max-width: 750px;">
          <GraphicBar v-for="(category, index) in storeCategories" :key="index" :category="category" :maxValue="totalValue"/>
        </v-card>
      </v-col>
      <v-col class="d-flex flex-column justify-space-between">
        <v-btn color="#FFCE03" width="100%" class="pa-5" @click="showModal = true">
          <strong>{{ $t('addNewRequest') }}</strong>
          <v-spacer></v-spacer>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <CustomDialog  @save="saveTicket" title="Nova Solicitação" v-model="showModal" max-width="500px" :hasCta=true :saveBtn="saveTicket" :saveActive="formValid">
            <v-card-text>
              <v-form ref="form" v-model="formValid">
                <v-row>
                  <v-select
                    :label="$t('requestType')"
                    v-model="newTicketData.solicitation_type"
                    :items="solicitationInputTypeList"
                    item-text="solicitation_name"
                    item-value="solicitation_type"
                    :rules="[v => !!v || $t('field-required')]"
                    required
                  ></v-select>
                  <v-spacer></v-spacer>
                  <v-select
                    :label="$t('functionality')"
                    v-model="newTicketData.functionality"
                    :items="functionalityInputList"
                    item-text="functionality_name"
                    item-value="functionality_id"
                    :rules="[v => !!v || $t('field-required')]"
                    required
                  ></v-select>
                </v-row>
                <v-row class="pa-3">
                  <v-text-field
                    label="Solicitante"
                    v-model="user.username"
                    disabled
                  ></v-text-field>
                  <v-spacer></v-spacer>
                  <v-text-field
                    label="E-mail"
                    v-model="user.email"
                    disabled
                  ></v-text-field>
                </v-row>
                <v-text-field
                  :label="$t('subject')"
                  v-model="newTicketData.subject"
                  :rules="[
                    v => !!v || $t('field-required'),
                    v => (v && v.length <= 100) || $t('max-characters', { max: 100 })
                  ]"
                  required
                ></v-text-field>
                <v-textarea
                  :label="$t('description')"
                  v-model="newTicketData.description"
                  :rules="[
                    v => !!v || $t('field-required'),
                    v => (v && v.length <= 500) || $t('max-characters', { max: 500 })
                  ]"
                  required
                ></v-textarea>
                <v-checkbox
                  :label="$t('approveRequestCreation')"
                  v-model="checkbox"
                ></v-checkbox>
                <span class="file-input">
                  <v-file-input
                    :label="$t('attachFile')"
                    v-model="newTicketData.attachments"
                    accept=".pdf,.png,.jpg, .jpeg"
                    :placeholder="$t('noFileSelected')"
                    prepend-icon="mdi-paperclip"
                    multiple
                  ></v-file-input>
                  <p class="ml-8 file-input--legend">
                    Selecione seu arquivo (PDF, JPG, JPEG, PNG)
                  </p>
                </span>
              </v-form>
            </v-card-text>
        </CustomDialog>
        <div class="d-flex justify-space-between align-center">
          <p class="text-uppercase"><strong>{{ $t('export') }}</strong> {{ $t('as') }}</p>
          <div class="d-flex">
            <div class="styled-btn">
              <SavePdf :activeCards="filteredCards" />
            </div>
            <div class="line-separator"></div>
            <div class="styled-btn" @click="downloadCsv" style="cursor: pointer;">
              <v-img src="/img/icons/file-excel-box.svg"/>
              <p class="text-center">CSV</p>
            </div>
          </div>
        </div>
      </v-col>
      <CustomDialog :title="$t('success-request-title')" v-model="sucessModal" width="350px" :hasCta="false">
        <span class="d-flex mt-2">
          <v-icon color="#12A844">mdi-check</v-icon>
          <h3 class="ml-2">{{ $t('success-request-message') }}</h3>
        </span>
      </CustomDialog>

      <CustomDialog :title="$t('error-request-title')" v-model="errorModal" width="350px" :hasCta="false">
        <span class="d-flex mt-2">
          <v-icon color="#D92B3F">mdi-alert-circle</v-icon>
          <h3 class="ml-2">{{ $t('error-request-message') }}</h3>
        </span>
      </CustomDialog>
    </v-row>
    <div class="filter mt-4 mb-4">
      <StatusFilter
        :requestStatus="cardStatusList"
        :selectedStatus="selectedStatus"
        :showFilters="showFilters"
        @status-changed="toggleStatus"
        @toggle-filters="toggleFilters"
      />
    </div>
    <div v-if="showFilters" class="search mt-4">
      <SearchFilters
        :filters="filters"
        :reviewersList="reviewersList"
        :isNewAccessRequest="false"
        :solicitationTypes="solicitationTypeList"
        :statusList="cardStatusList"
        :priorityList="priorityList"
      />
    </div>
    <div class="card--wrapper mt-6">
      <SuggestionsCard
        v-for="card in orderedCards"
        :cards="card"
        :key="card.code"
        @click.native="goToCardDetails(card.code)"
      />
    </div>
  </div>
</template>
<i18n>
  {
    "en": {
      "export": "Export",
      "as": "As",
      "noFileSelected": "No file selected",
      "attachFile": "Attach File",
      "approveRequestCreation": "Approve request upon creation",
      "description": "Description",
      "subject": "Subject",
      "functionality": "Functionality",
      "requestType": "Request Type",
      "addNewRequest": "Add new request",
      "criticismsSuggestions": "Criticisms and Suggestions",
      "field-required": "Field Required",
      "max-characters": "Maximum of {max} characters allowed.",
      "success-request-title": "We have received your request!",
      "success-request-message": "Request successfully created!",
      "error-request-title": "Request error",
      "error-request-message": "Something went wrong with your request creation. Please try again."
    },
    "pt-br": {
      "export": "Exportar",
      "as": "Como",
      "noFileSelected": "Nenhum arquivo selecionado",
      "attachFile": "Anexar Arquivo",
      "approveRequestCreation": "Deferir solicitação na criação",
      "description": "Descrição",
      "subject": "Assunto",
      "functionality": "Funcionalidade",
      "requestType": "Tipo de Solicitação",
      "addNewRequest": "Adicionar nova solicitação",
      "criticismsSuggestions": "Críticas e Sugestões",
      "field-required": "Campo obrigatório",
      "max-characters": "Máximo de {max} caracteres permitido.",
      "success-request-title": "Recebemos sua solicitação!",
      "success-request-message": "Solicitação criada com sucesso!",
      "error-request-title": "Erro na solicitação",
      "error-request-message": "Algo deu errado na criação da sua solicitação. Tente novamente."
    }
  }
</i18n>
<script>
import SuggestionsCard from '/components/admin/SuggestionsCard.vue'
import GraphicBar from '/components/admin/GraphicBar.vue'
import StatusFilter from '/components/admin/StatusFilter.vue'
import SearchFilters from '/components/admin/SearchFilters.vue'
import CustomDialog from '/components/admin/CustomDialog.vue'
import SavePdf from '/components/admin/SavePdf.vue'

import { mapGetters } from 'vuex'

export default {
  components: { GraphicBar, SuggestionsCard, StatusFilter, SearchFilters, CustomDialog, SavePdf },
  name: 'CriticasSugestoes',
  layout: 'admin',
  data(){
    return {
      progress: 0,
      selectedStatus: null,
      showFilters: false,
      showModal: false,
      formValid: false,
      sucessModal: false,
      errorModal: false,
      checkbox: false,
      newTicketData: {
        solicitation_type: '',
        functionality: '',
        subject: '',
        description: '',
        attachments: [],
        status_category: this.isAlreadyDeferred
      },
      user:{
        username: '',
        email: ''
      },
      filters: {
        code: '',
        subject: '',
        requesting: '',
        type: '',
        status: null,
        priority: null,
        analyzedBy: '',
        dataInicial: '',
        dataFinal: '',
      },
      storeCategories: [
        {label: "solicitações realizadas", total: 0, color: "#F58A1F" },
        {label: "solicitações em andamento", total: 0, color: "#D92B3F" },
        {label: "solicitações atendidas", total: 0, color: "#12A844" },
    ]
    };
  },
  props: {
    category: {},
  },
  async mounted() {
    await this.$store.dispatch('userProfile/getUserData')
    await this.$store.dispatch('admin/fetchTickets')
    await this.$store.dispatch('admin/fetchAllLabelOptions')

    this.updateStoreCategories()
    if (this.userData) {
      this.user = { ...this.user, username: this.userData.username, email: this.userData.email}
    }
  },

  computed:{
    ...mapGetters('admin', ['tickets', 'labels']),
    ...mapGetters('userProfile', ['userData']),


    orderedCards() {
    return [...this.filteredCards]
        .sort((a, b) => {
            const priorityOrder = { "Não analisado": 2, "Deferido": 1 };

            const statusA = a.ticket_status?.formated_info?.status_category_display || '';
            const statusB = b.ticket_status?.formated_info?.status_category_display || '';

            const priorityA = priorityOrder[statusA] || 3;
            const priorityB = priorityOrder[statusB] || 3;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            return b.code - a.code;
        });
    },


    isAlreadyDeferred(){
      return this.checkbox ? 'DEFERIDO' : "NAO_ANALISADO"
    },

    cardStatusList() {
      return [...new Set(this.tickets
        .map(card => card.ticket_status?.formated_info?.status_category_display)
        .filter(Boolean))
      ];
    },

    solicitationTypeList() {
      return this.labels?.solicitation_type ?
      [...new Set(this.labels?.solicitation_type
        .map(card => card.label)
        .filter(Boolean))
      ]
      : []
    },

    solicitationInputTypeList() {
      return this.labels?.solicitation_type ?
       [...new Set(this.labels?.solicitation_type
        .map(card => ({
          solicitation_name: card.label,
          solicitation_type: card.value
        }))
        .filter(Boolean))
      ]
      : [];
    },

    functionalityInputList() {
      if (Array.isArray(this.labels?.functionality)) {
        return [...new Set(
          this.labels.functionality
            .map(card => ({
              functionality_name: card.func_name,
              functionality_id: card.id
          }))
            .filter(Boolean)
        )];
      }
      return [];
    },
    priorityList() {
      return [...new Set(this.tickets
        .map(card => card.ticket_status?.formated_info?.priority_display)
        .filter(Boolean))
      ];
    },

    reviewersList() {
      return [...new Set(this.tickets
        .map(card => card.ticket_status?.user_info.analyzer)
        .filter(Boolean))
      ];
    },

    totalValue(){
      return this.storeCategories[0].total
    },

    filteredCards() {
  const { code, subject, requesting, status, type, priority, analyzedBy, dataInicial, dataFinal } = this.filters;

  // Utility function to compare text
  const matchesText = (text, filterValue) => !filterValue || text.toLowerCase().includes(filterValue.toLowerCase());

  // Utility function to compare dates
  const matchesDate = (dateStr, dateFilter, isEndDate = false) => {
    const cardDate = new Date(dateStr);
    const filterDate = new Date(dateFilter);
    return !dateFilter || (isEndDate ? cardDate <= filterDate : cardDate >= filterDate);
  };

  return this.tickets.filter(card => {
    const statusCategory = card.ticket_status?.formated_info?.status_category_display || '';
    const analyzedByName = card.ticket_status?.analyzed_by || '';
    const cardPriority = card.ticket_status?.formated_info?.priority_display || '';

    // If ticket_status is not present, return false to not include the card
    if (!card.ticket_status) return false;

    const cardCode = card.code.toString();

    return (
      (!code || cardCode.includes(code.toString())) &&
      (!subject || matchesText(card.subject, subject)) &&
      (!requesting || matchesText(card.requesting, requesting)) &&
      (!type || matchesText(card.solicitation_name, type)) &&
      (!status || statusCategory === status) &&
      (!this.selectedStatus || statusCategory === this.selectedStatus) &&
      (!priority || cardPriority === priority) &&
      (!analyzedBy || matchesText(analyzedByName, analyzedBy)) &&
      matchesDate(card.opened_in_formatted, dataInicial) &&
      matchesDate(card.ticket_status.analyzed_in_formatted, dataFinal, true)
    );
  });
}

  },
  methods:{
    getStatusButtonStyle(status) {
      return {
        backgroundColor: status === this.selectedStatus ? '#9A9997' : '',
        color: status === this.selectedStatus ? '#FFFFFF' : '',
      };
    },
    toggleStatus(status) {
      this.selectedStatus = this.selectedStatus === status ? null : status;
      this.applySearch();
    },
    updateStoreCategories(){
      this.tickets.forEach((ticket)=> {
        if (ticket.ticket_status?.formated_info?.status_category_display === 'Concluído'){
          this.storeCategories[2].total += 1
        }
        if (ticket.ticket_status?.formated_info?.status_category_display === 'Em Andamento'){
          this.storeCategories[1].total += 1
        }
        this.storeCategories[0].total += 1
      })
    },
    applySearch() {
      this.filteredCards;
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    async downloadCsv(){
      await this.$store.dispatch('admin/sendCsvData', {filteredData: this.filteredCards});
    },
    goToCardDetails(cardId) {
    this.$router.push(`/admin/criticas/${cardId}`);
  },
  async saveTicket() {
    try {
      this.newTicketData.status_category = this.isAlreadyDeferred;
      await this.$store.dispatch('admin/createTicket',  {ticketData: this.newTicketData});
      this.sucessModal = true
    } catch (error) {
      console.log("Erro ao criar nova solicitação:", error);
      console.error("Erro ao criar solicitação.");
      this.errorModal = true
    } finally {
      this.showModal = !this.showModal
      this.resetForm();
    }
  },
  resetForm() {
    this.newTicketData = {
      solicitation_type: '',
      functionality: '',
      subject: '',
      description: '',
      attachments: []
    };
  }

  }
};

</script>

<style lang="sass" scoped>
.line-separator
  border:  1px solid #9A9997
  margin: 1rem 0

.critics
  height: 100vh
  overflow-y: auto
  width: 100%
  padding: 2rem


.styled-btn
  padding: 1rem 1rem 0
  border-radius: 8px

.card--wrapper
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(350px,1fr))
  gap: 1rem

.wrapper
  display: flex
  flex-direction: row
  align-items: center
  justify-content: space-between

.container
  justify-content: center
  gap: 10px

.full-bar
  height: 7px
  background: #d9d9d9
  border-radius: 4px

.progress-bar
  height: 7px
  transition: width 2s ease
  border-radius: 4px
  max-width: 750px

.file-input
  position: relative

.file-input--legend
  position: absolute
  bottom: -20px
  font-size: 12px
</style>
