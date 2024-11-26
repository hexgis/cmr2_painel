<template>
  <div class="critics">
    <span class="d-flex align-center justify-space-between">
      <h1>{{ $t('criticismsSuggestions') }}</h1>
      <v-btn color="primary" text @click="$router.back()">
        <v-icon color="primary">mdi-keyboard-backspace</v-icon>
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
        <CustomDialog title="Nova Solicitação" v-model="showModal" max-width="500px" :hasCta=true :saveBtn="saveTicket" >
            <v-card-text>
              <v-form ref="form">
                <v-row>
                  <v-select
                    :label="$t('requestType')"
                    v-model="newTicketData.solicitation_type"
                    :items="solicitationInputTypeList"
                    item-text="solicitation_name"
                    item-value="solicitation_type"
                    required
                  ></v-select>
                  <v-spacer></v-spacer>
                  <v-select
                    :label="$t('functionality')"
                    v-model="newTicketData.functionality"
                    :items="functionalityInputList"
                    item-text="functionality_name"
                    item-value="functionality_id"
                    required
                  ></v-select>
                </v-row>
                <v-row class="pa-3">
                  <v-text-field label="Solicitante" v-model="user.username" disabled></v-text-field>
                  <v-spacer></v-spacer>
                  <v-text-field label="E-mail" v-model="user.email" disabled></v-text-field>
                </v-row>
                <v-text-field
                  :label="$t('subject')"
                  v-model="newTicketData.subject"
                  required
                ></v-text-field>
                <v-textarea
                  :label="$t('description')"
                  v-model="newTicketData.description"
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
                  <p class="ml-8 file-input--legend">Selecione seu arquivo (PDF, JPG, JPEG, PNG)</p>
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
      "criticismsSuggestions": "Criticisms and Suggestions"
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
      "criticismsSuggestions": "Críticas e Sugestões"
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
        .map(card => card.ticket_status?.formated_info.status_category_display)
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
        .map(card => card.ticket_status?.formated_info.priority_display)
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
    return this.tickets.filter(card => {
        const { code, subject, requesting, status, type, priority, analyzedBy, dataInicial, dataFinal } = this.filters;
        const matchesCode = !code || card.code.toString().includes(code.toString());
        const matchesSubject = !subject || card.subject.toLowerCase().includes(subject.toLowerCase());
        const matchesRequesting = !requesting || card.requesting.toLowerCase().includes(requesting.toLowerCase());
        const matchesType = !type || card.solicitation_name.toLowerCase() === type.toLowerCase();
        const matchesStatusBar = !this.selectedStatus || card.ticket_status.formated_info.status_category_display === this.selectedStatus;
        const matchesStatus = !status || card.ticket_status.formated_info.status_category_display === status;
        const matchesPriority = !priority || card.ticket_status.formated_info.priority_display === priority;
        const matchesAnalyzedBy = !analyzedBy || (card.ticket_status.analyzed_by && card.ticket_status.analyzed_by.toLowerCase().includes(analyzedBy.toLowerCase()));

        const matchesDateRange =
            (!dataInicial || new Date(card.opened_in_formatted) >= new Date(dataInicial)) &&
            (!dataFinal || new Date(card.ticket_status.analyzed_in_formatted) <= new Date(dataFinal));

        return matchesCode && matchesSubject && matchesRequesting && matchesType &&
               matchesStatus && matchesStatusBar && matchesPriority && matchesAnalyzedBy && matchesDateRange;
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
        if (ticket.ticket_status.formated_info.status_category_display === 'Concluído'){
          this.storeCategories[2].total += 1
        }
        if (ticket.ticket_status.formated_info.status_category_display === 'Em Andamento'){
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
      console.log("Solicitação criada com sucesso!");
    } catch (error) {
      console.log("Erro ao criar nova solicitação:", error);
      console.error("Erro ao criar solicitação.");
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
