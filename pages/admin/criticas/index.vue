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
                    <!-- Hidden file input -->
                    <v-file-input
                      ref="fileInput"
                      v-model="tempFile"
                      style="display: none"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.xls,.xlsx,.csv"
                      multiple
                      @change="addFiles"
                    />

                    <!-- Main upload area -->
                    <v-card
                      outlined
                      class="upload-card pa-4"
                      :class="{ 'upload-card--active': newTicketData.attachments && newTicketData.attachments.length < 10 }"
                      @click="triggerFileInput"
                    >
                      <div class="text-center">
                        <v-icon
                          size="32"
                          color="primary"
                          class="mb-2"
                        >
                          mdi-cloud-upload
                        </v-icon>
                        <p class="mb-1">
                          {{ $t('chooseFile') }}
                        </p>
                        <p class="caption grey--text mb-0">
                          {{ $t('selectYourFile') }}
                        </p>
                      </div>
                    </v-card>

                    <!-- Files list -->
                    <div
                      v-if="newTicketData.attachments && newTicketData.attachments.length > 0"
                      class="mt-3"
                    >
                      <div class="d-flex justify-space-between align-center mb-2">
                        <v-subheader class="pl-0 font-weight-medium">
                          {{ $t('attachedFiles') }} ({{ newTicketData.attachments.length }}/10)
                        </v-subheader>
                        <v-btn
                          v-if="newTicketData.attachments.length > 3"
                          text
                          small
                          color="primary"
                          @click="showAllFiles = !showAllFiles"
                        >
                          {{ showAllFiles ? $t('showLess') : $t('showAll') }}
                          <v-icon
                            small
                            class="ml-1"
                          >
                            {{ showAllFiles ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                          </v-icon>
                        </v-btn>
                      </div>

                      <!-- File grid for better visualization -->
                      <div
                        v-if="newTicketData.attachments.length <= 3 || showAllFiles"
                        class="files-grid"
                      >
                        <v-card
                          v-for="(fileItem, index) in sortedFiles"
                          :key="index"
                          outlined
                          class="file-card ma-1"
                        >
                          <div class="file-preview">
                            <!-- Image preview for image files -->
                            <div
                              v-if="isImageFile(fileItem.name)"
                              class="image-preview"
                            >
                              <img
                                :src="getImagePreview(fileItem)"
                                :alt="fileItem.name"
                                class="preview-image"
                                @error="onImageError"
                              >
                            </div>
                            <!-- Icon for other files -->
                            <div
                              v-else
                              class="icon-preview"
                            >
                              <v-icon
                                size="40"
                                :color="getFileIconColor(fileItem.name)"
                              >
                                {{ getFileIcon(fileItem.name) }}
                              </v-icon>
                            </div>
                          </div>

                          <v-card-text class="pa-2">
                            <div class="file-info">
                              <p
                                class="file-name text-body-2 mb-1"
                                :title="fileItem.name"
                              >
                                {{ truncateFileName(fileItem.name, 20) }}
                              </p>
                              <p class="file-size caption grey--text mb-0">
                                {{ formatFileSize(fileItem.size) }}
                              </p>
                              <p class="file-type caption grey--text mb-0">
                                {{ getFileType(fileItem.name) }}
                              </p>
                            </div>
                          </v-card-text>

                          <v-card-actions class="pa-1">
                            <v-spacer />
                            <v-btn
                              icon
                              x-small
                              color="error"
                              @click="removeFile(index)"
                            >
                              <v-icon x-small>
                                mdi-close
                              </v-icon>
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </div>

                      <!-- Collapsed view for many files -->
                      <div
                        v-else
                        class="files-collapsed"
                      >
                        <v-list
                          dense
                          class="py-0"
                        >
                          <v-list-item
                            v-for="(fileItem, index) in newTicketData.attachments.slice(0, 3)"
                            :key="index"
                            class="px-0"
                          >
                            <v-list-item-avatar size="32">
                              <v-icon
                                size="20"
                                :color="getFileIconColor(fileItem.name)"
                              >
                                {{ getFileIcon(fileItem.name) }}
                              </v-icon>
                            </v-list-item-avatar>
                            <v-list-item-content>
                              <v-list-item-title class="text-body-2">
                                {{ truncateFileName(fileItem.name, 30) }}
                              </v-list-item-title>
                              <v-list-item-subtitle class="caption">
                                {{ formatFileSize(fileItem.size) }} • {{ getFileType(fileItem.name) }}
                              </v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                              <v-btn
                                icon
                                x-small
                                color="error"
                                @click="removeFile(index)"
                              >
                                <v-icon x-small>
                                  mdi-close
                                </v-icon>
                              </v-btn>
                            </v-list-item-action>
                          </v-list-item>
                        </v-list>
                        <v-divider />
                        <div class="text-center pa-2">
                          <span class="caption grey--text">
                            {{ $t('andMoreFiles', { count: newTicketData.attachments.length - 3 }) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Error messages -->
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
      "error-request-message": "Something went wrong with your request creation. Please try again.",
      "attachedFiles": "Attached files:",
      "chooseFile": "Choose files",
      "selectYourFile": "Select your files (PDF, JPG, JPEG, PNG, XLS, XLSX, CSV, DOC, DOCX, TXT) - Multiple selection",
      "showAll": "Show all",
      "showLess": "Show less",
      "andMoreFiles": "and {count} more files"
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
      "error-request-message": "Algo deu errado na criação da sua solicitação. Tente novamente.",
      "attachedFiles": "Arquivos anexados:",
      "chooseFile": "Escolher Arquivos",
      "selectYourFile": "Selecione seus arquivos (múltipla seleção)",
      "showAll": "Mostrar todos",
      "showLess": "Mostrar menos",
      "andMoreFiles": "e mais {count} arquivos"
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
      showAllFiles: false,
      tempFile: null,
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

    sortedFiles() {
      if (!this.newTicketData.attachments || this.newTicketData.attachments.length === 0) return [];

      return [...this.newTicketData.attachments].sort((a, b) => {
        // First sort by file type
        const typeA = this.getFileType(a.name);
        const typeB = this.getFileType(b.name);
        if (typeA !== typeB) {
          return typeA.localeCompare(typeB);
        }
        // Then sort by name
        return a.name.localeCompare(b.name);
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

    getFileIcon(fileName) {
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      switch (ext) {
        case '.pdf':
          return 'mdi-file-pdf-box';
        case '.doc':
        case '.docx':
          return 'mdi-file-word-box';
        case '.xls':
        case '.xlsx':
          return 'mdi-file-excel-box';
        case '.jpg':
        case '.jpeg':
        case '.png':
          return 'mdi-file-image-box';
        case '.txt':
          return 'mdi-file-document-box';
        case '.csv':
          return 'mdi-file-delimited-box';
        default:
          return 'mdi-file-box';
      }
    },

    getFileIconColor(fileName) {
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      switch (ext) {
        case '.pdf':
          return '#F44336';
        case '.doc':
        case '.docx':
          return '#2196F3';
        case '.xls':
        case '.xlsx':
          return '#4CAF50';
        case '.jpg':
        case '.jpeg':
        case '.png':
          return '#FF9800';
        case '.txt':
          return '#9E9E9E';
        case '.csv':
          return '#607D8B';
        default:
          return '#616161';
      }
    },

    getFileType(fileName) {
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      switch (ext) {
        case '.pdf':
          return 'PDF';
        case '.doc':
        case '.docx':
          return 'Word';
        case '.xls':
        case '.xlsx':
          return 'Excel';
        case '.jpg':
        case '.jpeg':
        case '.png':
          return 'Imagem';
        case '.txt':
          return 'Texto';
        case '.csv':
          return 'CSV';
        default:
          return 'Arquivo';
      }
    },

    isImageFile(fileName) {
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    },

    getImagePreview(file) {
      if (file && typeof file === 'object') {
        return URL.createObjectURL(file);
      }
      return '';
    },

    onImageError(event) {
      // Hide broken image and show icon instead
      const { target } = event;
      target.style.display = 'none';
    },

    truncateFileName(fileName, maxLength) {
      if (fileName.length <= maxLength) return fileName;

      const ext = fileName.substring(fileName.lastIndexOf('.'));
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      const availableLength = maxLength - ext.length - 3; // 3 for "..."

      if (availableLength <= 0) return fileName;

      return `${nameWithoutExt.substring(0, availableLength)}...${ext}`;
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

// File upload styles
.files-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))
  gap: 8px
  max-height: 300px
  overflow-y: auto

.file-card
  border-radius: 8px
  transition: all 0.2s ease
  cursor: default

  &:hover
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

.file-preview
  height: 60px
  display: flex
  align-items: center
  justify-content: center
  background-color: #f5f5f5
  border-radius: 8px 8px 0 0

.image-preview
  width: 100%
  height: 100%
  display: flex
  align-items: center
  justify-content: center
  overflow: hidden
  border-radius: 8px 8px 0 0

.preview-image
  max-width: 100%
  max-height: 100%
  object-fit: cover
  border-radius: 4px

.icon-preview
  display: flex
  align-items: center
  justify-content: center

.file-info
  min-height: 60px
  display: flex
  flex-direction: column
  justify-content: space-between

.file-name
  font-weight: 500
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.file-size, .file-type
  font-size: 10px
  line-height: 1.2

.files-collapsed
  background-color: #fafafa
  border-radius: 8px
  padding: 8px

.upload-card
  cursor: pointer
  transition: all 0.2s ease
  border: 2px dashed #e0e0e0
  background-color: #fafafa

  &:hover
    border-color: #1976d2
    background-color: #f3f8ff

  &--active
    border-color: #1976d2
    background-color: #f3f8ff
</style>
