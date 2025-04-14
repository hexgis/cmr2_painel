<template>
    <div>
        <div class="d-flex w-100 justify-space-between align-center ml-2">
            <v-btn
                v-if="!!closedSolicitation"
                outlined
                color="primary"
                @click="reopenSolicitation"
                >{{ $t('reopenRequest') }}</v-btn
            >
            <div v-else class="d-flex align-start flex-lg-row mt-2">
                <PriorityBadge
                    :priority="ticketDetail.ticket_status?.formated_info?.priority_display"/>
                <span class="vertical-separator ml-5">
                    <p v-if="dueOn" class="light--text">{{ $t('deliveryForecast') }}</p>
                    <p v-else class="light--text">{{ $t('requestedOn') }}</p>
                    <p>
                        <strong>{{ dueDate }}</strong>
                    </p>
                </span>
            </div>
            <div class="text-right text-uppercase mr-4">
                <p class="text-h6">
                  {{ $t('request') }} <strong>#{{ ticketDetail.code }}</strong>
                </p>
                <p class="text-highlighted-lightgray-2">{{ $t('requestType') }}</p>
                <p class="text-subtitle-1 text-highlighted-lightgray">
                    <strong>{{ ticketDetail.solicitation_name }}</strong>
                </p>
            </div>
        </div>
        <v-card class="details--wrapper" elevated>
            <div class="d-flex justify-space-between align-center">
                <v-row>
                    <v-col>
                        <span>
                            <p class="text-highlighted-red">{{ $t('subject') }}</p>
                            <h2 class="text-highlighted-red">
                                {{ ticketDetail.subject }}
                            </h2>
                            <p class="text-highlighted-lightgray">
                              {{ $t('functionality') }} {{ ticketDetail.functionality?.func_name }} -
                              <strong>{{ticketDetail.ticket_status?.formated_info?.sub_status_display }}</strong>
                            </p>
                            {{ $t('delivery') }}  <strong>{{ dueDate }}</strong>
                        </span>
                    </v-col>
                    <v-col class="d-flex justify-space-between align-center">
                        <span>
                            <p><strong>{{ $t('requestedBy') }}</strong></p>
                            <p >
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
            <v-divider class="mt-2 mb-2"></v-divider>
            <div>
                <p><strong>{{ $t('description') }}</strong></p>
                <p>{{ ticketDetail.description }}</p>
            </div>
            <v-row class="mt-4">
                <v-col>
                    <p class="text-highlighted-red">
                      {{ $t('requestCreatedOn') }} {{ ticketDetail.opened_in_formatted }}
                    </p>
                    <p
                        v-if="ticketDetail.ticket_status?.user_info.analyzer"
                        class="text-highlighted-lightgray"
                    >
                        {{ $t('analyzedBy') }}
                        <strong>{{ ticketDetail.ticket_status?.user_info.analyzer }}</strong>
                        <br />
                        em {{ ticketDetail.ticket_status?.formated_info.analyzed_in_formatted }}.
                    </p>
                    <p v-else>{{ $t('notAnalyzed') }}</p>
                </v-col>
                <v-col>
                    <p v-if="ticketDetail?.attachments?.length">
                        <strong>{{ $t('attachedFiles') }}</strong>
                    </p>
                    <span
                        v-for="(file, index) in ticketDetail.attachments"
                        :key="index"
                    >
                        <a :href="`${this.$api}//adm-panel/tickets/download/`" target="_blank"> {{ file.name_file }}</a>
                        <br />
                    </span>
                    <v-text-field
                        v-if="this.ticketDetail?.ticket_analysis_history?.length"
                        :class="ticketDetail?.attachments?.length ? 'mt-6' : ''"
                        :value="lastComment"
                        :label="$t('analysisComment')"
                        outlined
                        multi-line
                        readonly
                    ></v-text-field>
                </v-col>
            </v-row>
            <div class="mt-4" v-if="showAnalysisFieldsAdmin || showAnalysisFieldsDev">
                <h3 class="text-uppercase">{{ $t('analyzeRequest') }}</h3>
                <v-divider></v-divider>
                <v-row class="mt-6 mb-0">
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="status"
                            :items="statusLabelOptions"
                            label="Status"
                            outlined
                        ></v-select>
                    </v-col>
                    <v-col v-if="(showAnalysisFieldsAdmin || this.status == 'DEFERIDO') &&
                                showAnalysisFieldsDev"
                        cols="12"
                        md="6"
                    >
                        <v-select
                            v-model="priority"
                            :items="priorityLabelOptions"
                            :label="$t('priority')"
                            outlined
                        ></v-select>
                    </v-col>

                    <v-col v-if="showAnalysisFieldsAdmin || showAnalysisFieldsDev" cols="12" md="6">
                        <v-select
                            v-model="substatus"
                            :items="substatusLabelOptions"
                            label="Substatus"
                            outlined
                        ></v-select>
                    </v-col>

                    <v-col v-if="showAnalysisFieldsAdmin || showAnalysisFieldsDev"
                        cols="12"
                        md="6"
                        class="relative-input"
                    >
                        <v-file-input
                            v-model="file"
                            :label="$t('chooseFile')"
                            multiple
                            outlined
                            prepend-icon="mdi-paperclip"
                        ></v-file-input>
                        <p class="absolute-input">{{ $t('selectYourFile') }}</p>
                    </v-col>
                    <v-col v-if=" showAnalysisFieldsAdmin || (showAnalysisFieldsDev ||
                                this.substatus == 'EM_DESENVOLVIMENTO')"
                        cols="12"
                        md="6"
                    >
                        <v-select
                            v-model="complexity"
                            :items="complexityLabelOptions"
                            :label="$t('complexityLabel')"
                            outlined
                        ></v-select>
                    </v-col>

                    <v-col v-if="showAnalysisFieldsAdmin || (showAnalysisFieldsDev ||
                                this.substatus == 'EM_DESENVOLVIMENTO')"
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
                            <template v-if="showAnalysisFieldsDev" v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    v-model="date"
                                    :label="$t('deliveryDate')"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    outlined
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                v-model="date"
                                locale="pt-BR"
                                @input="menu = false"
                            ></v-date-picker>
                        </v-menu>
                    </v-col>

                    <v-col v-if=" showAnalysisFieldsAdmin"
                        cols="12"
                        md="6"
                    >
                        <v-select
                            v-model="functionality"
                            :items="solicitationTypeLabelOptions"
                            :label="$t('functionalityLabel')"
                            outlined
                        ></v-select>
                    </v-col>

                </v-row>

                <v-row>
                    <v-col v-if="showAnalysisFieldsAdmin || showAnalysisFieldsDev"
                        cols="12"
                    >
                        <v-checkbox
                            v-model="checkbox"
                            :label="$t('sendEmailToUser')"
                            outlined
                            required
                        ></v-checkbox>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col v-if="showAnalysisFieldsAdmin || showAnalysisFieldsDev"
                        cols="12"
                    >
                        <v-text-field
                            v-model="text"
                            :label="$t('comment')"
                            outlined
                            multi-line
                            required
                        ></v-text-field>
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

        <CustomDialog :title="$t('error-request-title')" v-model="errorModal" width="350px" :hasCta="false">
          <span class="d-flex mt-2">
            <v-icon color="#D92B3F">mdi-alert-circle</v-icon>
            <h3 class="ml-2">{{ $t('error-request-message') }}</h3>
          </span>
        </CustomDialog>

        <v-card-actions>
            <v-btn color="primary" text @click="$router.back()">{{ $t('back') }}</v-btn>
        </v-card-actions>
    </div>
</template>
<i18n>
  {
      "en": {
          "reopenRequest": "REOPEN REQUEST",
          "deliveryForecast": "Delivery Forecast",
          "requestedOn": "Requested on",
          "request": "Request",
          "requestType": "Request Type:",
          "subject": "Subject:",
          "delivery": "Delivery Forecast:",
          "functionality": "Functionality:",
          "requestedBy": "Requested By",
          "complexity": "Complexity:",
          "requestCreatedOn": "Request Created on",
          "analyzedBy": "Analyzed By",
          "notAnalyzed": "Not Analyzed",
          "attachedFiles": "Attached Files:",
          "analysisComment": "Analysis Comment",
          "analyzeRequest": "Analyze Request",
          "priority": "Priority",
          "deliveryDate": "Delivery Date",
          "complexityLabel": "Complexity",
          "functionalityLabel": "Functionality",
          "chooseFile": "Choose File",
          "sendEmailToUser": "Send Email to user",
          "comment": "Comment",
          "selectYourFile": "Select your file (PDF, JPG, JPEG, PNG, XLS, XLSX, CSV)",
          "back": "Back",
          "description": "Description:",
          "error-request-title": "Request error",
          "error-request-message": "Something went wrong. Please try again."
      },
      "pt-br": {
          "reopenRequest": "REABRIR SOLICITAÇÃO",
          "deliveryForecast": "Previsão de entrega",
          "requestedOn": "Solicitado em",
          "request": "Solicitação",
          "requestType": "Tipo da Solicitação:",
          "subject": "Assunto:",
          "delivery": "Previsão de entrega:",
          "functionality": "Funcionalidade:",
          "requestedBy": "Solicitado por",
          "complexity": "Complexidade:",
          "requestCreatedOn": "Solicitação criada em",
          "analyzedBy": "Analisado por",
          "notAnalyzed": "Não analisado",
          "attachedFiles": "Arquivos Anexados:",
          "analysisComment": "Comentário da Análise",
          "analyzeRequest": "Analisar solicitação",
          "priority": "Prioridade",
          "deliveryDate": "Data de entrega",
          "complexityLabel": "Complexidade",
          "functionalityLabel": "Funcionalidade",
          "chooseFile": "Escolher Arquivo",
          "sendEmailToUser": "Enviar e-mail ao usuário",
          "comment": "Comentário",
          "selectYourFile": "Selecione seu arquivo (PDF, JPG, JPEG, PNG, XLS, XLSX, CSV)",
          "back": "Voltar",
          "description": "Descrição:",
          "error-request-title": "Erro na solicitação",
          "error-request-message": "Algo deu errado. Tente novamente."
      }
  }
</i18n>

<script>
import LoadingIconVue from '../map/file-loader/LoadingIcon.vue';
import PriorityBadge from './PriorityBadge.vue'
import StatusBadge from './StatusBadge.vue'
import { mapGetters, mapState } from 'vuex'
import Timeline from './Timeline.vue'
import CustomDialog from './CustomDialog.vue';
export default {
    layout: 'admin',
    components: { PriorityBadge, StatusBadge, Timeline, LoadingIconVue, CustomDialog },
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
            substatus: null,
            priority: null,
            file: null,
            checkbox: false,
            teste: null,
            text: '',
            isLoading: false,
            errorModal: false
        }
    },
    async mounted() {
        await this.$store.dispatch('admin/fetchTicketDetail', {
            ticketId: this.cardId,
        })
        await this.$store.dispatch('admin/fetchAllLabelOptions')
    },
    computed: {
        ...mapGetters('admin', ['ticketDetail', 'labels']),
        ...mapState('userProfile', ['user']),

        showAnalysisFieldsAdmin() {
            return this.user?.components?.feedback_admin === true
        },

        showAnalysisFieldsDev() {
            return this.user?.components?.feedback_dev === true
        },


        isSaveEnabled() {
  return this.text.trim().length > 0 && this.status && this.substatus;
},

        isCompletedCard() {
            return (
                this.ticketDetail.ticket_status?.formated_info
                    ?.status_category_display === 'Concluído'
            )
        },
        dueDate() {
            return this.dueOn
                ? this.formattedDate(this.dueOn)
                : this.ticketDetail.opened_in_formatted
        },
        dueOn() {
            return this.ticketDetail.ticket_status?.due_on
        },
        statusLabelOptions() {
            return this.labels?.status_category?.map((label) => ({
                text: label.label,
                value: label.value,
                disabled: label.label === 'Não Analisado',
            }))
        },
        substatusLabelOptions() {
            const substatusMapping = {
                EM_ANDAMENTO: ['Aguardando Gestor', 'Em Desenvolvimento'],
                CONCLUIDO: ['Concluído', 'Em Teste'],
                RECUSADO: ['Inviável', 'Indeferido'],
                DEFERIDO: ['Deferido'],
            }
            const allowedSubstatus = substatusMapping[this.status] || []
            return this.labels?.sub_status
                ?.filter((label) => allowedSubstatus.includes(label.label))
                ?.map((label) => ({
                    text: label.label,
                    value: label.value,
                    disabled: label.value === 'Não Analisado',
                }))
        },
        complexityLabelOptions() {
            return this.labels?.complexity?.map((label) => ({
                text: label.label,
                value: label.value,
            }))
        },
        solicitationTypeLabelOptions() {
            return this.labels?.solicitation_type?.map((label) => ({
                text: label.label,
                value: label.value,
            }))
        },
        priorityLabelOptions() {
            return this.labels?.priority_code?.map((label) => ({
                text: label.label,
                value: label.value,
            }))
        },
        lastComment() {
            return this.ticketDetail?.ticket_analysis_history?.length
                ? this.ticketDetail?.ticket_analysis_history[0]?.comment
                : 'Nenhum comentário disponível.'
        },
        closedSolicitation() {
            const status =
                this.ticketDetail.ticket_status?.formated_info
                    ?.status_category_display
            return status === 'Recusado' || status === 'Inviável'
        },
        isReviewed() {
            return (this.ticketDetail.ticket_status?.formated_info?.sub_status_display !== 'Não Analisado')
        },
    },
    methods: {
        formattedDate(date) {
            if (date) {
                const [year, month, day] = date.split('-')
                return `${day}/${month}/${year}`
            }
        },

        async sendEmail() {
            try {
                if (this.checkbox) {
                    await this.$api.post(`/adm-panel/tickets/send-email/`, {
                        requesting: this.ticketDetail.requesting,
                        ticket_id: this.ticketDetail.code,
                        status: this.status || this.ticketDetail?.ticket_status?.formated_info?.status_category_display,
                        comment: this.text,
                    })
                }
            } catch (error) {
                console.error('Erro ao enviar o email:', error)
            }
        },
        async handleSave() {

            this.isLoading = true
            try {
                const updatedData = {
                    ticket_status: {
                        due_on: this.date,
                        formated_info: {
                            status_category_display: this.status,
                            sub_status_display: this.substatus,
                            priority_display: this.priority,
                        },
                    },
                    complexity_code: this.complexity,
                    solicitation_type: this.functionality,
                    comment: this.text,
                }

                const formData = new FormData()
                Object.entries(updatedData).forEach(([key, value]) => {
                    formData.append(
                        key,
                        typeof value === 'object'
                            ? JSON.stringify(value)
                            : value
                    )
                })

                if (this.file) {
                    [...this.file].forEach((file) => formData.append('attachments', file))
                }

                await this.updateStatusAndSendEmail(formData)

                await this.$store.dispatch('admin/fetchTicketDetail', {
                    ticketId: this.cardId,
                })
                this.text = ''

            } catch (error) {
                this.errorModal = true
                console.error(
                    'Erro ao salvar informações:',
                    error.response?.data || error.message
                )
            } finally {
              this.isLoading = false
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
                    }
                );
                this.sendEmail();
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
            }
        },

        async reopenSolicitation() {
            this.isLoading = true
            try {
                const updatedData = {
                    ticket_status: {
                        formated_info: {
                            status_category_display: 'NAO_ANALISADO',
                            sub_status_display: 'NAO_ANALISADO',
                        },
                    },
                    comment: 'A solicitação foi reaberta para nova análise.',
                }

                const formData = new FormData()
                Object.entries(updatedData).forEach(([key, value]) => {
                    formData.append(
                        key,
                        typeof value === 'object'
                            ? JSON.stringify(value)
                            : value
                    )
                })

                await this.$api.patch(
                    `/adm-panel/tickets/status-update/${this.cardId}/`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )

                await this.$store.dispatch('admin/fetchTicketDetail', {
                    ticketId: this.cardId,
                })

                this.text = ''
            } catch {
                console.error('Erro ao solicitar')
            } finally {
              this.isLoading = false
            }
        },
    },
}
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
</style>
