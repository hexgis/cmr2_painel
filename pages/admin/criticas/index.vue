<template>
  <div class="critics">
    <span class="d-flex align-center justify-space-between">
      <h1>{{ $t('criticismsSuggestions') }}</h1>
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

    <v-row class="mt-4">
      <v-col>
        <GraphicBar
          v-for="(category, index) in storeCategories"
          :key="index"
          :category="category"
          :max-value="totalValue"
        />
      </v-col>
      <v-col class="d-flex flex-column justify-space-between">
        <v-btn
          color="error"
          dark
          rounded
          class="px-4 py-2"
          @click="showModal = true"
        >
          <strong>{{ $t('addNewRequest') }}</strong>

          <v-icon right>
            mdi-plus
          </v-icon>
        </v-btn>

        <CustomDialog
          v-model="showModal"
          title="Nova Solicitação"
          max-width="600px"
          :has-cta="true"
          :save-btn="saveTicket"
          :save-active="formValid"
          @save="saveTicket"
        >
          <v-card-text>
            <v-form
              ref="form"
              v-model="formValid"
            >
              <v-row dense>
                <v-col cols="6">
                  <v-text-field
                    v-model="user.username"
                    label="Solicitante"
                    disabled
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="user.email"
                    label="E-mail"
                    disabled
                  />
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="6">
                  <v-select
                    v-model="newTicketData.solicitation_type"
                    :label="$t('requestType')"
                    :items="solicitationInputTypeList"
                    item-text="solicitation_name"
                    item-value="solicitation_type"
                    :rules="[v => !!v || $t('field-required')]"
                    outlined
                    required
                  />
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="newTicketData.functionality"
                    :label="$t('functionality')"
                    :items="functionalityInputList"
                    item-text="functionality_name"
                    item-value="functionality_id"
                    :rules="[v => !!v || $t('field-required')]"
                    outlined
                    required
                  />
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model="newTicketData.subject"
                    :label="$t('subject')"
                    :rules="[
                      v => !!v || $t('field-required'),
                      v => (v && v.length <= 100) || $t('max-characters', { max: 100 })
                    ]"
                    outlined
                    required
                  />
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="12">
                  <v-textarea
                    v-model="newTicketData.description"
                    :label="$t('description')"
                    :rules="[
                      v => !!v || $t('field-required'),
                      v => (v && v.length <= 500) || $t('max-characters', { max: 500 })
                    ]"
                    outlined
                    required
                    rows="3"
                  />
                </v-col>
              </v-row>

              <v-row
                v-if="userData?.components?.feedback_admin === true"
                dense
              >
                <v-col cols="12">
                  <v-checkbox
                    v-model="checkbox"
                    :label="$t('approveRequestCreation')"
                  />
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="12">
                  <div class="file-upload-section">
                    <v-file-input
                      ref="fileInput"
                      v-model="tempFile"
                      :label="$t('attachFile')"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.xls,.xlsx,.csv"
                      :placeholder="$t('noFileSelected')"
                      prepend-icon="mdi-paperclip"
                      outlined
                      show-size
                      @change="addFiles"
                      hide-details
                    />
                    
                    <v-btn
                      v-if="newTicketData.attachments && newTicketData.attachments.length < 10"
                      icon
                      color="primary"
                      class="mt-2"
                      @click="triggerFileInput"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    
                    <div v-if="newTicketData.attachments && newTicketData.attachments.length > 0" class="mt-3">
                      <v-subheader class="pl-0">{{ $t('attachedFiles') }} ({{ newTicketData.attachments.length }}/10)</v-subheader>
                      <v-chip
                        v-for="(fileItem, index) in newTicketData.attachments"
                        :key="index"
                        class="ma-1"
                        close
                        @click:close="removeFile(index)"
                      >
                        <v-icon left small>mdi-file</v-icon>
                        {{ fileItem.name }}
                        <span class="ml-1 caption">({{ formatFileSize(fileItem.size) }})</span>
                      </v-chip>
                    </div>
                    
                    <p class="ml-4 caption grey--text">
                      Selecione seus arquivos (PDF, JPG, JPEG, PNG, DOC, DOCX, TXT, XLS, XLSX, CSV) - Máximo 10 arquivos de 10MB cada
                    </p>
                    <v-alert
                      v-if="fileErrorMessages.length > 0"
                      type="error"
                      dense
                      outlined
                      class="mt-2"
                    >
                      {{ fileErrorMessages.join(', ') }}
                    </v-alert>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </CustomDialog>

        <div class="d-flex justify-space-between align-center">
          <p class="text-uppercase">
            <strong>{{ $t('export') }}</strong> {{ $t('as') }}
          </p>
          <div class="d-flex">
            <div class="styled-btn">
              <SavePdf :active-cards="filteredCards" />
            </div>
            <div
              class="styled-btn"
              style="cursor: pointer;"
              @click="downloadCsv"
            >
              <v-img
                src="/img/icons/file-excel-box.png"
                max-width="50"
                max-height="50"
              />
            </div>
          </div>
        </div>
      </v-col>
      <CustomDialog
        v-model="sucessModal"
        :title="$t('success-request-title')"
        width="350px"
        :has-cta="false"
      >
        <span class="d-flex mt-2">
          <v-icon color="#12A844">mdi-check</v-icon>
          <h3 class="ml-2">{{ $t('success-request-message') }}</h3>
        </span>
      </CustomDialog>

      <CustomDialog
        v-model="errorModal"
        :title="$t('error-request-title')"
        width="350px"
        :has-cta="false"
      >
        <span class="d-flex mt-2">
          <v-icon color="#D92B3F">mdi-alert-circle</v-icon>
          <h3 class="ml-2">{{ $t('error-request-message') }}</h3>
        </span>
      </CustomDialog>
    </v-row>

    <div class="filter mt-4 mb-4">
      <StatusFilter
        :request-status="cardStatusList"
        :selected-status="selectedStatus"
        :show-filters="showFilters"
        @status-changed="toggleStatus"
        @toggle-filters="toggleFilters"
      />
    </div>

    <div
      v-if="showFilters"
      class="search mt-4"
    >
      <SearchFilters
        :filters="filters"
        :reviewers-list="reviewersList"
        :is-new-access-request="false"
        :solicitation-types="solicitationTypeList"
        :status-list="cardStatusList"
        :priority-list="priorityList"
      />
    </div>

    <div class="card--wrapper mt-6">
      <SuggestionsCard
        v-for="card in orderedCards"
        :key="card.code"
        :cards="card"
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
import SuggestionsCard from '/components/admin/SuggestionsCard.vue';
import GraphicBar from '/components/admin/GraphicBar.vue';
import StatusFilter from '/components/admin/StatusFilter.vue';
import SearchFilters from '/components/admin/SearchFilters.vue';
import CustomDialog from '/components/admin/CustomDialog.vue';
import SavePdf from '/components/admin/SavePdf.vue';

import { mapGetters } from 'vuex';

export default {
  name: 'CriticasSugestoes',
  components: {
    GraphicBar, SuggestionsCard, StatusFilter, SearchFilters, CustomDialog, SavePdf,
  },
  layout: 'admin',
  props: {
    category: {},
  },
  data() {
    return {
      progress: 0,
      selectedStatus: [],
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
        status_category: this.isAlreadyDeferred,
      },
      user: {
        username: '',
        email: '',
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
        { label: 'solicitações realizadas', total: 0, color: '#F58A1F' },
        { label: 'solicitações em andamento', total: 0, color: '#D92B3F' },
        { label: 'solicitações atendidas', total: 0, color: '#12A844' },
      ],
      fileErrorMessages: [],
      fileRules: [
        (files) => {
          if (!files || files.length === 0) return true;
          
          // Check maximum number of files
          if (files.length > 10) {
            this.fileErrorMessages = ['Máximo de 10 arquivos permitidos'];
            return false;
          }
          
          // Check file size (10MB limit)
          const maxSize = 10 * 1024 * 1024; // 10MB
          const oversizedFiles = files.filter(file => file.size > maxSize);
          if (oversizedFiles.length > 0) {
            this.fileErrorMessages = [`Arquivos muito grandes: ${oversizedFiles.map(f => f.name).join(', ')} (máximo 10MB)`];
            return false;
          }
          
          // Check file extensions
          const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.csv'];
          const invalidFiles = files.filter(file => {
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            return !validExtensions.includes(ext);
          });
          if (invalidFiles.length > 0) {
            this.fileErrorMessages = [`Extensões inválidas: ${invalidFiles.map(f => f.name).join(', ')}`];
            return false;
          }
          
          this.fileErrorMessages = [];
          return true;
        }
      ],
    };
  },
  async mounted() {
    await this.$store.dispatch('userProfile/getUserData');
    await this.$store.dispatch('admin/fetchTickets');
    await this.$store.dispatch('admin/fetchAllLabelOptions');

    this.updateStoreCategories();
    if (this.userData) {
      this.user = { ...this.user, username: this.userData.username, email: this.userData.email };
    }

    // Automatically select default statuses for administrators
    this.setDefaultStatusFiltersForAdmin();
  },

  computed: {
    ...mapGetters('admin', ['tickets', 'labels']),
    ...mapGetters('userProfile', ['userData']),

    showAnalysisFieldsAdmin() {
      return this.userData && this.userData.components && this.userData.components.feedback_admin === true;
    },

    showAnalysisFieldsDev() {
      return this.userData && this.userData.components && this.userData.components.feedback_dev === true;
    },

    orderedCards() {
      return [...this.filteredCards]
        .sort((a, b) => {
          const priorityOrder = { 'Não analisado': 2, Deferido: 1 };

          const statusA = a.ticket_status && a.ticket_status.formated_info && a.ticket_status.formated_info.status_category_display || '';
          const statusB = b.ticket_status && b.ticket_status.formated_info && b.ticket_status.formated_info.status_category_display || '';

          const priorityA = priorityOrder[statusA] || 3;
          const priorityB = priorityOrder[statusB] || 3;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          return b.code - a.code;
        });
    },

    isAlreadyDeferred() {
      return this.checkbox ? 'DEFERIDO' : 'NAO_ANALISADO';
    },

    cardStatusList() {
      return [...new Set(this.tickets
        .map((card) => card.ticket_status && card.ticket_status.formated_info && card.ticket_status.formated_info.status_category_display)
        .filter(Boolean)),
      ].sort();
    },

    solicitationTypeList() {
      return this.labels && this.labels.solicitation_type
        ? [...new Set(this.labels.solicitation_type
          .map((card) => card.label)
          .filter(Boolean)),
        ]
        : [];
    },

    solicitationInputTypeList() {
      return this.labels && this.labels.solicitation_type
        ? [...new Set(this.labels.solicitation_type
          .map((card) => ({
            solicitation_name: card.label,
            solicitation_type: card.value,
          }))
          .filter(Boolean)),
        ]
        : [];
    },

    functionalityInputList() {
      if (this.labels && this.labels.functionality && Array.isArray(this.labels.functionality)) {
        return [...new Set(
          this.labels.functionality
            .map((card) => ({
              functionality_name: card.func_name,
              functionality_id: card.id,
            }))
            .filter(Boolean),
        )];
      }
      return [];
    },
    priorityList() {
      return [...new Set(this.tickets
        .map((card) => card.ticket_status && card.ticket_status.formated_info && card.ticket_status.formated_info.priority_display)
        .filter(Boolean)),
      ];
    },

    reviewersList() {
      return [...new Set(this.tickets
        .map((card) => card.ticket_status && card.ticket_status.user_info && card.ticket_status.user_info.analyzer)
        .filter(Boolean)),
      ];
    },

    totalValue() {
      return this.storeCategories[0].total;
    },

    filteredCards() {
      const {
        code,
        subject,
        requesting,
        type,
        priority,
        analyzedBy,
        dataInicial,
        dataFinal,
      } = this.filters;

      // Utility function to compare text
      const matchesText = (text, filterValue) => !filterValue || text.toLowerCase().includes(filterValue.toLowerCase());

      // Utility function to compare dates
      const matchesDate = (dateStr, dateFilter, isEndDate = false) => {
        const cardDate = new Date(dateStr);
        const filterDate = new Date(dateFilter);
        return !dateFilter || (isEndDate ? cardDate <= filterDate : cardDate >= filterDate);
      }; return this.tickets.filter((card) => {
        const statusCategory = card.ticket_status && card.ticket_status.formated_info && card.ticket_status.formated_info.status_category_display || '';
        const analyzedByName = card.ticket_status && card.ticket_status.analyzed_by || '';
        const cardPriority = card.ticket_status && card.ticket_status.formated_info && card.ticket_status.formated_info.priority_display || '';

        // If ticket_status is not present, return false to not include the card
        if (!card.ticket_status) return false;

        const cardCode = card.code.toString();

        // Check if status matches selected statuses (support both array and single value)
        // If no status is selected (empty array or null), show all cards
        const statusMatches = !this.selectedStatus
      || (Array.isArray(this.selectedStatus)
        ? this.selectedStatus.length === 0 || this.selectedStatus.includes(statusCategory)
        : statusCategory === this.selectedStatus);

        return (
          (!code || cardCode.includes(code.toString()))
      && (!subject || matchesText(card.subject, subject))
      && (!requesting || matchesText(card.requesting, requesting))
      && (!type || matchesText(card.solicitation_name, type))
      && statusMatches
      && (!priority || cardPriority === priority)
      && (!analyzedBy || matchesText(analyzedByName, analyzedBy))
      && matchesDate(card.opened_in_formatted, dataInicial)
      && matchesDate(card.ticket_status.analyzed_in_formatted, dataFinal, true)
        );
      });
    },

  },
  methods: {
    getStatusButtonStyle(status) {
      return {
        backgroundColor: status === this.selectedStatus ? '#9A9997' : '',
        color: status === this.selectedStatus ? '#FFFFFF' : '',
      };
    },
    toggleStatus(status) {
      if (Array.isArray(this.selectedStatus)) {
        const index = this.selectedStatus.indexOf(status);
        if (index > -1) {
          // Remove status if already selected
          this.selectedStatus.splice(index, 1);
        } else {
          // Add status if not selected
          this.selectedStatus.push(status);
        }
      } else {
        // Legacy single selection mode
        this.selectedStatus = this.selectedStatus === status ? [] : [status];
      }
      this.applySearch();
    },
    updateStoreCategories() {
      this.tickets.forEach((ticket) => {
        if (ticket.ticket_status && ticket.ticket_status.formated_info && ticket.ticket_status.formated_info.status_category_display === 'Concluído') {
          this.storeCategories[2].total += 1;
        }
        if (ticket.ticket_status && ticket.ticket_status.formated_info && ticket.ticket_status.formated_info.status_category_display === 'Em Andamento') {
          this.storeCategories[1].total += 1;
        }
        this.storeCategories[0].total += 1;
      });
    },
    applySearch() {
      this.filteredCards;
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    async downloadCsv() {
      await this.$store.dispatch('admin/sendCsvData', { filteredData: this.filteredCards });
    },
    goToCardDetails(cardId) {
      this.$router.push(`/admin/criticas/${cardId}`);
    },
    async saveTicket() {
      try {
        this.newTicketData.status_category = this.isAlreadyDeferred;
        await this.$store.dispatch('admin/createTicket', { ticketData: this.newTicketData });
        this.sucessModal = true;
      } catch (error) {
        this.errorModal = true;
      } finally {
        this.showModal = !this.showModal;
        this.resetForm();
      }
    },
    resetForm() {
      this.newTicketData = {
        solicitation_type: '',
        functionality: '',
        subject: '',
        description: '',
        attachments: [],
      };
    },

    // Métodos para manipulação de arquivos
    addFiles(files) {
      if (!files) return;
      
      // Convert to array if single file
      const fileArray = Array.isArray(files) ? files : [files];
      
      // Add files to existing array
      fileArray.forEach(file => {
        if (this.newTicketData.attachments.length < 10) {
          // Validate file
          if (this.validateSingleFile(file)) {
            this.newTicketData.attachments.push(file);
          }
        }
      });
      
      // Clear the temp input
      this.tempFile = null;
      this.$refs.fileInput.reset();
    },
    
    removeFile(index) {
      this.newTicketData.attachments.splice(index, 1);
      this.fileErrorMessages = [];
    },
    
    triggerFileInput() {
      this.$refs.fileInput.$refs.input.click();
    },
    
    validateSingleFile(file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.csv'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (file.size > maxSize) {
        this.fileErrorMessages = [`Arquivo muito grande: ${file.name} (máximo 10MB)`];
        return false;
      }
      
      if (!validExtensions.includes(ext)) {
        this.fileErrorMessages = [`Extensão inválida: ${file.name}`];
        return false;
      }
      
      this.fileErrorMessages = [];
      return true;
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    setDefaultStatusFiltersForAdmin() {
    // Check if user is administrator based on role or is_admin flag
      const isAdmin = (this.userData && this.userData.is_admin)
                   || (this.userData && this.userData.roles && this.userData.roles.some((role) => role.name === 'Administrador'));

      if (isAdmin) {
      // Set default selected statuses for administrators
        this.selectedStatus = ['Aguardando Gestor', 'Não Analisado', 'Desenvolvido'];
      } else {
      // For non-admin users, start with empty filter (show all cards)
        this.selectedStatus = [];
      }
    },

  },
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
