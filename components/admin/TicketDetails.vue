<template>
  <div>
    <div class="d-flex w-100 justify-space-between align-center ml-2">
      <v-btn
        v-if="!!closedSolicitation"
        outlined
        color="primary"
        @click="reopenSolicitation"
      >
        {{ $t('reopenRequest') }}
      </v-btn>
      <div
        v-else
        class="d-flex align-start flex-lg-row mt-2"
      >
        <PriorityBadge
          :priority="ticketDetail.ticket_status &&
            ticketDetail.ticket_status.formated_info &&
            ticketDetail.ticket_status.formated_info.priority_display"
        />
        <span class="vertical-separator ml-5">
          <p
            v-if="dueOn"
            class="light--text"
          >{{ $t('deliveryForecast') }}</p>
          <p
            v-else
            class="light--text"
          >{{ $t('requestedOn') }}</p>
          <p>
            <strong>{{ dueDate }}</strong>
          </p>
        </span>
      </div>
      <div class="text-right text-uppercase mr-4">
        <p class="text-h6">
          {{ $t('request') }} <strong>#{{ ticketDetail.code }}</strong>
        </p>
        <p class="text-highlighted-lightgray-2">
          {{ $t('requestType') }}
        </p>
        <p class="text-subtitle-1 text-highlighted-lightgray">
          <strong>{{ ticketDetail.solicitation_name }}</strong>
        </p>
      </div>
    </div>
    <v-card
      class="details--wrapper"
      elevated
    >
      <div class="d-flex justify-space-between align-center">
        <v-row>
          <v-col>
            <span>
              <p class="text-highlighted-red">{{ $t('subject') }}</p>
              <h2 class="text-highlighted-red">
                {{ ticketDetail.subject }}
              </h2>
              <p class="text-highlighted-lightgray">
                <strong> {{ $t('functionality') }} </strong>{{ ticketDetail.functionality?.func_name }} -
                <strong>{{ticketDetail.ticket_status?.formated_info?.status_category_display }}</strong> </br>
              </p>
            </span>
            <p class="text-highlighted-red">
              {{ $t('requestCreatedOn') }} {{ ticketDetail.opened_in_formatted }}
            </p>
          </v-col>
          <v-col class="d-flex justify-space-between align-center">
            <span>
              <p><strong>{{ $t('requestedBy') }}</strong></p>
              <p>
                {{ ticketDetail.requesting }}
              </p>
              <!-- <p>
                                <i>{{ ticketDetail.requesting_email }}</i>
                            </p> -->
            </span>
            <span class="d-flex flex-column align-center">
              <StatusBadge
                :status="ticketDetail.ticket_status?.formated_info.status_category_display"
              />
              <p v-if="isReviewed">
                <strong>{{ $t('complexity') }} {{ ticketDetail.complexity_code }}</strong>
              </p>
            </span>
          </v-col>
        </v-row>
      </div>
      <v-divider class="mt-2 mb-2" />
      <div>
        <p><strong>{{ $t('description') }}</strong></p>
        <p>{{ ticketDetail.description }}</p>
      </div>
      <v-row class="mt-4">
        <v-col>
          <p
            v-if="ticketDetail.ticket_status?.user_info.analyzer"
            class="text-highlighted-lightgray"
          >
            {{ $t('analyzedBy') }}
            <strong>{{ ticketDetail.ticket_status?.user_info.analyzer }}</strong>
            <br>
            em {{ ticketDetail.ticket_status?.formated_info.analyzed_in_formatted }}.
          </p>
          <p v-else>
            {{ $t('notAnalyzed') }}
          </p>
        </v-col>
        <v-col>
          <div v-if="ticketDetail?.attachments?.length">
            <div class="attachments-header mb-3">
              <v-icon
                small
                color="primary"
                class="mr-2"
              >
                mdi-paperclip
              </v-icon>
              <strong class="text-primary">
                {{ $t('attachedFiles') }} ({{ ticketDetail.attachments.length }})
              </strong>
            </div>

            <!-- Files grid for better visualization -->
            <div class="attachments-grid">
              <v-card
                v-for="(attachedFile, index) in ticketDetail.attachments"
                :key="index"
                outlined
                class="attachment-card ma-1 pa-2"
                hover
                @click="downloadAttachedFile(attachedFile)"
              >
                <div class="d-flex align-center">
                  <v-icon
                    :color="getFileIconColor(attachedFile.name_file)"
                    class="mr-3"
                    size="24"
                  >
                    {{ getFileIcon(attachedFile.name_file) }}
                  </v-icon>
                  <div class="attachment-info flex-grow-1">
                    <div
                      class="attachment-name text-body-2 font-weight-medium"
                      :title="attachedFile.name_file"
                    >
                      {{ truncateFileName(attachedFile.name_file, 30) }}
                    </div>
                    <div class="attachment-type caption grey--text">
                      {{ getFileType(attachedFile.name_file) }}
                    </div>
                  </div>
                  <v-btn
                    icon
                    small
                    color="primary"
                    @click.stop="downloadAttachedFile(attachedFile)"
                  >
                    <v-icon small>
                      mdi-download
                    </v-icon>
                  </v-btn>
                </div>
              </v-card>
            </div>
          </div>

          <v-textarea
            v-if="this.ticketDetail?.ticket_analysis_history?.length"
            :class="ticketDetail?.attachments?.length ? 'mt-6' : ''"
            :value="lastComment"
            :label="$t('analysisComment')"
            outlined
            readonly
            rows="3"
          />
        </v-col>
      </v-row>
      <div
        v-if="showAnalysisFieldsAdmin || showAnalysisFieldsDev"
        class="mt-4"
      >
        <h3 class="text-uppercase">
          {{ $t('analyzeRequest') }}
        </h3>
        <v-divider />
        <v-row class="mt-6 mb-0">
          <v-col
            cols="12"
            md="6"
          >
            <v-select
              v-model="status"
              :items="statusLabelOptions"
              label="Status"
              outlined
            />
          </v-col>
          <v-col
            v-if="showPriorityField"
            cols="12"
            md="6"
          >
            <v-select
              v-model="priority"
              :items="priorityLabelOptions"
              :label="$t('priority')"
              outlined
            />
          </v-col>

          <v-col
            v-if="showAnalysisFieldsAdmin || showAnalysisFieldsDev"
            cols="12"
            md="6"
            class="relative-input"
          >
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
                :class="{ 'upload-card--active': file && file.length < 10 }"
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
                v-if="file && file.length > 0"
                class="mt-3"
              >
                <div class="d-flex justify-space-between align-center mb-2">
                  <v-subheader class="pl-0 font-weight-medium">
                    {{ $t('attachedFiles') }} ({{ file.length }}/10)
                  </v-subheader>
                  <v-btn
                    v-if="file.length > 3"
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
                  v-if="file.length <= 3 || showAllFiles"
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
                      v-for="(fileItem, index) in file.slice(0, 3)"
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
                      {{ $t('andMoreFiles', { count: file.length - 3 }) }}
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
          <v-col
            v-if="showAnalysisFieldsDev"
            cols="12"
            md="6"
          >
            <v-select
              v-model="complexity"
              :items="complexityLabelOptions"
              :label="$t('complexityLabel')"
              outlined
            />
          </v-col>

          <v-col
            v-if="showAnalysisFieldsAdmin || (showAnalysisFieldsDev ||
              status == 'EM_DESENVOLVIMENTO')"
            cols="12"
            md="6"
          >
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template
                v-if="showAnalysisFieldsDev"
                #activator="{ on, attrs }"
              >
                <v-text-field
                  v-model="date"
                  :label="$t('deliveryDate')"
                  prepend-icon="mdi-calendar"
                  readonly
                  outlined
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="date"
                locale="pt-BR"
                @input="menu = false"
              />
            </v-menu>
          </v-col>

          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-if="showAnalysisFieldsAdmin || showAnalysisFieldsDev"
            cols="12"
          >
            <v-checkbox
              v-model="checkbox"
              :label="$t('sendEmailToUser')"
              outlined
              required
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            v-if="showAnalysisFieldsAdmin || showAnalysisFieldsDev"
            cols="12"
          >
            <v-textarea
              v-model="text"
              :label="$t('comment')"
              outlined
              required
              rows="3"
            />
          </v-col>
        </v-row>
        <span class="d-flex justify-end">
          <v-btn
            color="primary"
            :disabled="!isSaveEnabled"
            @click="handleSave"
          >
            Salvar
          </v-btn>
        </span>
      </div>
      <Timeline :ticket="ticketDetail" />
    </v-card>
    <v-overlay v-if="isLoading">
      <LoadingIconVue />
    </v-overlay>

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

    <v-card-actions>
      <v-btn
        color="primary"
        text
        @click="$router.back()"
      >
        {{ $t('back') }}
      </v-btn>
    </v-card-actions>
  </div>
</template>
<i18n>
  {
      "en": {
          "reopenRequest": "REOPEN REQUEST",
          "deliveryForecast": "Delivery forecast",
          "requestedOn": "Requested on",
          "request": "Request",
          "requestType": "Request type:",
          "subject": "Subject:",
          "delivery": "Delivery forecast:",
          "functionality": "Functionality:",
          "requestedBy": "Requested by",
          "complexity": "Complexity:",
          "requestCreatedOn": "Request created on",
          "analyzedBy": "Analyzed by",
          "notAnalyzed": "Not analyzed",
          "attachedFiles": "Attached files:",
          "analysisComment": "Analysis comment",
          "analyzeRequest": "Analyze request",
          "priority": "Priority",
          "deliveryDate": "Delivery date",
          "complexityLabel": "Complexity",
          "functionalityLabel": "Functionality",
          "chooseFile": "Choose files",
          "sendEmailToUser": "Send email to user",
          "comment": "Comment",
          "selectYourFile": "Select your files (PDF, JPG, JPEG, PNG, XLS, XLSX, CSV, DOC, DOCX, TXT) - Multiple selection",
          "back": "Back",
          "description": "Description:",
          "error-request-title": "Request error",
          "error-request-message": "Something went wrong. Please try again.",
          "showAll": "Show all",
          "showLess": "Show less",
          "andMoreFiles": "and {count} more files"
      },
      "pt-br": {
          "reopenRequest": "REABRIR SOLICITAÇÃO",
          "deliveryForecast": "Previsão de entrega",
          "requestedOn": "Solicitado em",
          "request": "Solicitação",
          "requestType": "Tipo da solicitação:",
          "subject": "Assunto:",
          "delivery": "Previsão de entrega:",
          "functionality": "Funcionalidade:",
          "requestedBy": "Solicitado por",
          "complexity": "Complexidade:",
          "requestCreatedOn": "Solicitação criada em",
          "analyzedBy": "Analisado por",
          "notAnalyzed": "Não analisado",
          "attachedFiles": "Arquivos anexados:",
          "analysisComment": "Comentário da análise",
          "analyzeRequest": "Analisar solicitação",
          "priority": "Prioridade",
          "deliveryDate": "Data de entrega",
          "complexityLabel": "Complexidade",
          "functionalityLabel": "Funcionalidade",
          "chooseFile": "Escolher Arquivos",
          "sendEmailToUser": "Enviar e-mail ao usuário",
          "comment": "Comentário",
          "selectYourFile": "Selecione seus arquivos (múltipla seleção)",
          "back": "Voltar",
          "description": "Descrição:",
          "error-request-title": "Erro na solicitação",
          "error-request-message": "Algo deu errado. Tente novamente.",
          "showAll": "Mostrar todos",
          "showLess": "Mostrar menos",
          "andMoreFiles": "e mais {count} arquivos"
      }
  }
</i18n>

<script>
import { mapGetters, mapState } from 'vuex';
import LoadingIconVue from '../map/file-loader/LoadingIcon.vue';
import PriorityBadge from './PriorityBadge.vue';
import StatusBadge from './StatusBadge.vue';
import Timeline from './Timeline.vue';
import CustomDialog from './CustomDialog.vue';

export default {
  components: {
    PriorityBadge, StatusBadge, Timeline, LoadingIconVue, CustomDialog,
  },
  layout: 'admin',
  props: {
    cardId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      menu: false,
      date: null,
      status: null,
      complexity: null,
      functionality: null,
      priority: null,
      file: [],
      tempFile: null,
      checkbox: false,
      teste: null,
      text: '',
      isLoading: false,
      errorModal: false,
      showAllFiles: false,
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
          const oversizedFiles = files.filter((file) => file.size > maxSize);
          if (oversizedFiles.length > 0) {
            this.fileErrorMessages = [`Arquivos muito grandes: ${oversizedFiles.map((f) => f.name).join(', ')} (máximo 10MB)`];
            return false;
          }

          // Check file extensions
          const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.csv'];
          const invalidFiles = files.filter((file) => {
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            return !validExtensions.includes(ext);
          });
          if (invalidFiles.length > 0) {
            this.fileErrorMessages = [`Extensões inválidas: ${invalidFiles.map((f) => f.name).join(', ')}`];
            return false;
          }

          this.fileErrorMessages = [];
          return true;
        },
      ],
    };
  },
  watch: {
    // Watch for changes in ticketDetail to set priority
    ticketDetail: {
      handler() {
        this.setInitialPriority();
      },
      deep: true,
    },
  },
  async mounted() {
    await this.$store.dispatch('admin/fetchTicketDetail', {
      ticketId: this.cardId,
    });
    await this.$store.dispatch('admin/fetchAllLabelOptions');

    // Set initial priority if it exists
    this.setInitialPriority();
  },
  computed: {
    ...mapGetters('admin', ['ticketDetail', 'labels']),
    ...mapState('userProfile', ['user']),

    showAnalysisFieldsAdmin() {
      return this.user && this.user.components && this.user.components.feedback_admin === true;
    },

    showAnalysisFieldsDev() {
      return this.user && this.user.components && this.user.components.feedback_dev === true;
    },

    isSaveEnabled() {
      return this.text.trim().length > 0 && this.status;
    },

    isCompletedCard() {
      return (
        this.ticketDetail.ticket_status
                && this.ticketDetail.ticket_status.formated_info
                && this.ticketDetail.ticket_status.formated_info.status_category_display === 'Concluído'
      );
    },
    dueDate() {
      return this.dueOn
        ? this.formattedDate(this.dueOn)
        : this.ticketDetail.opened_in_formatted;
    },
    dueOn() {
      return this.ticketDetail.ticket_status && this.ticketDetail.ticket_status.due_on;
    },
    statusLabelOptions() {
      const availableTransitions = this.ticketDetail
                && this.ticketDetail.ticket_status
                && this.ticketDetail.ticket_status.formated_info
                && this.ticketDetail.ticket_status.formated_info.available_status_transitions || [];

      if (availableTransitions.length > 0) {
        return availableTransitions.map((transition) => ({
          text: transition.label,
          value: transition.value,
        }));
      }

      return this.labels && this.labels.status_category && this.labels.status_category.map((label) => ({
        text: label.label,
        value: label.value,
        disabled: label.label === 'Não Analisado',
      })) || [];
    },

    complexityLabelOptions() {
      return this.labels && this.labels.complexity && this.labels.complexity.map((label) => ({
        text: label.label,
        value: label.value,
      }));
    },
    solicitationTypeLabelOptions() {
      return this.labels && this.labels.solicitation_type && this.labels.solicitation_type.map((label) => ({
        text: label.label,
        value: label.value,
      }));
    },
    priorityLabelOptions() {
      return this.labels && this.labels.priority_code && this.labels.priority_code.map((label) => ({
        text: label.label,
        value: label.value,
      }));
    },
    lastComment() {
      return this.ticketDetail && this.ticketDetail.ticket_analysis_history && this.ticketDetail.ticket_analysis_history.length
        ? this.ticketDetail.ticket_analysis_history[0].comment
        : 'Nenhum comentário disponível.';
    },
    closedSolicitation() {
      const status = this.ticketDetail.ticket_status
                && this.ticketDetail.ticket_status.formated_info
                && this.ticketDetail.ticket_status.formated_info.status_category_display;
      return status === 'Recusado' || status === 'Inviável';
    },
    isReviewed() {
      return (this.ticketDetail.ticket_status
                && this.ticketDetail.ticket_status.formated_info
                && this.ticketDetail.ticket_status.formated_info.status_category_display !== 'Não Analisado');
    },

    sortedFiles() {
      if (!this.file || this.file.length === 0) return [];

      return [...this.file].sort((a, b) => {
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

    showPriorityField() {
      const isDeferido = this.status === 'DEFERIDO'
        || (this.ticketDetail.ticket_status
          && this.ticketDetail.ticket_status.formated_info
          && this.ticketDetail.ticket_status.formated_info.status_category_display === 'Deferido');

      return this.showAnalysisFieldsAdmin && isDeferido;
    },
  },
  methods: {
    setInitialPriority() {
      if (this.ticketDetail
          && this.ticketDetail.ticket_status
          && this.ticketDetail.ticket_status.formated_info
          && this.ticketDetail.ticket_status.formated_info.priority_display
          && !this.priority) {
        const currentPriority = this.ticketDetail.ticket_status.formated_info.priority_display;

        const priorityOption = this.priorityLabelOptions.find(
          (option) => option.text === currentPriority,
        );

        if (priorityOption) {
          this.priority = priorityOption.value;
        }
      }
    },

    formattedDate(date) {
      if (date) {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
      }
      return '';
    },

    async sendEmail() {
      try {
        if (this.checkbox) {
          await this.$api.post('/adm-panel/tickets/send-email/', {
            requesting: this.ticketDetail.requesting,
            ticket_id: this.ticketDetail.code,
            status: this.status || (this.ticketDetail.ticket_status && this.ticketDetail.ticket_status.formated_info && this.ticketDetail.ticket_status.formated_info.status_category_display),
            comment: this.text,
          });
        }
      } catch (error) {
        console.error('Erro ao enviar o email:', error);
      }
    },
    async handleSave() {
      this.isLoading = true;
      try {
        const updatedData = {
          ticket_status: {
            due_on: this.date,
            formated_info: {
              status_category_display: this.status,
              priority_display: this.priority,
            },
          },
          complexity_code: this.complexity,
          solicitation_type: this.functionality,
          comment: this.text,
        };

        const formData = new FormData();
        Object.entries(updatedData).forEach(([key, value]) => {
          formData.append(
            key,
            typeof value === 'object'
              ? JSON.stringify(value)
              : value,
          );
        });

        if (this.file) {
          [...this.file].forEach((file) => formData.append('attachments', file));
        }

        await this.updateStatusAndSendEmail(formData);

        await this.$store.dispatch('admin/fetchTicketDetail', {
          ticketId: this.cardId,
        });
        this.text = '';
      } catch (error) {
        this.errorModal = true;
        console.error(
          'Erro ao salvar informações:',
          error.response && error.response.data || error.message,
        );
      } finally {
        this.isLoading = false;
      }
    },

    async updateStatusAndSendEmail(formData) {
      try {
        await this.$api.patch(
          `/adm-panel/tickets/status-update/${this.cardId}/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
        this.sendEmail();
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    },

    async reopenSolicitation() {
      this.isLoading = true;
      try {
        const updatedData = {
          ticket_status: {
            formated_info: {
              status_category_display: 'NAO_ANALISADO',
            },
          },
          comment: 'A solicitação foi reaberta para nova análise.',
        };

        const formData = new FormData();
        Object.entries(updatedData).forEach(([key, value]) => {
          formData.append(
            key,
            typeof value === 'object'
              ? JSON.stringify(value)
              : value,
          );
        });

        await this.$api.patch(
          `/adm-panel/tickets/status-update/${this.cardId}/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        await this.$store.dispatch('admin/fetchTicketDetail', {
          ticketId: this.cardId,
        });

        this.text = '';
      } catch (error) {
        console.error('Erro ao solicitar', error);
      } finally {
        this.isLoading = false;
      }
    },

    addFiles(files) {
      if (!files) return;

      // Convert to array if single file
      const fileArray = Array.isArray(files) ? files : [files];

      // Add files to existing array
      fileArray.forEach((file) => {
        if (this.file.length < 10) {
          // Validate file
          if (this.validateSingleFile(file)) {
            this.file.push(file);
          }
        }
      });

      // Clear the temp input
      this.tempFile = null;
      this.$refs.fileInput.reset();
    },

    removeFile(index) {
      this.file.splice(index, 1);
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
      return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
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

    downloadAttachedFile(file) {
      const downloadUrl = `${this.$api}/adm-panel/tickets/download/${file.id || file.name_file}`;
      window.open(downloadUrl, '_blank');
    },

    truncateFileName(fileName, maxLength) {
      if (fileName.length <= maxLength) return fileName;

      const ext = fileName.substring(fileName.lastIndexOf('.'));
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      const availableLength = maxLength - ext.length - 3; // 3 for "..."

      if (availableLength <= 0) return fileName;

      return `${nameWithoutExt.substring(0, availableLength)}...${ext}`;
    },
  },
};
</script>

<style lang="sass" scoped>
p
  margin-bottom: 0 !important

.text-highlighted
  &-red
    color: #D92B3F

  &-lightgray
    color: #5F5E5D

  &-lightgray-2
    color: #9A9997
    line-height: 0.8rem
    padding-top: 0.5rem

.col-md-6.col-12
  padding: 0 1rem

.vertical-separator
  border-left: 1px solid #9A9997
  padding-left: 1rem

.light--text
  color: #9A9997
  font-size: 12px

.details--wrapper
  margin-top: 1rem
  padding: 2rem
  border-radius: 1rem

.relative-input
  position: relative

.absolute-input
  position: absolute
  bottom: 0
  left: 45px
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

// Attachment styles (same as Timeline.vue)
.attachments-header
  display: flex
  align-items: center
  margin-bottom: 8px

.attachments-grid
  display: grid
  grid-template-columns: 1fr
  gap: 8px
  max-height: 200px
  overflow-y: auto

.attachment-card
  cursor: pointer
  transition: all 0.2s ease
  border-radius: 8px

  &:hover
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
    transform: translateY(-1px)

.attachment-info
  min-width: 0

.attachment-name
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  line-height: 1.2

.attachment-type
  line-height: 1
</style>
