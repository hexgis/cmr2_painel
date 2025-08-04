<template>
  <v-row v-if="isNewAccessRequest">
    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-text-field
        v-model="filters.servidor"
        :label="$t('server')"
        text
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-text-field
        v-model="filters.siape"
        :label="$t('siapeRegistration')"
        text
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-text-field
        v-model="filters.lotacao"
        :label="$t('allocation')"
        text
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-text-field
        v-model="filters.coordenador"
        :label="$t('coordinator')"
        text
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-menu
        ref="menuStartDate"
        v-model="menuStartDate"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="filters.dataInicial"
            :label="$t('startDate')"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="attrs"
            outlined
            clearable
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="filters.dataInicial"
          @input="menuStartDate = false"
        />
      </v-menu>
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-menu
        ref="menuEndDate"
        v-model="menuEndDate"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="filters.dataFinal"
            :label="$t('endDate')"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="attrs"
            outlined
            clearable
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="filters.dataFinal"
          @input="menuEndDate = false"
        />
      </v-menu>
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-select
        v-model="filters.avaliadoPor"
        :items="reviewersList"
        :label="$t('reviewedBy')"
        text
        clearable
      />
    </v-col>
  </v-row>
  <v-row v-else>
    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-text-field
        v-model="filters.code"
        :label="$t('code')"
        type="number"
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-text-field
        v-model="filters.subject"
        :label="$t('subject')"
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-text-field
        v-model="filters.requesting"
        :label="$t('requester')"
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-select
        v-model="filters.type"
        :items="solicitationTypes"
        :label="$t('solicitationType')"
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-select
        v-model="filters.status"
        :items="statusList"
        :label="$t('status')"
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-select
        v-model="filters.priority"
        :items="priorityList"
        :label="$t('priority')"
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-select
        v-model="filters.analyzedBy"
        :items="reviewersList"
        :label="$t('reviewedBy')"
        clearable
      />
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-menu
        ref="menuStartDate"
        v-model="menuStartDate"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="filters.dataInicial"
            :label="$t('startDate')"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="attrs"
            outlined
            clearable
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="filters.dataInicial"
          @input="menuStartDate = false"
        />
      </v-menu>
    </v-col>

    <v-col
      cols="12"
      sm="6"
      md="4"
    >
      <v-menu
        ref="menuEndDate"
        v-model="menuEndDate"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="filters.dataFinal"
            :label="$t('endDate')"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="attrs"
            outlined
            clearable
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="filters.dataFinal"
          @input="menuEndDate = false"
        />
      </v-menu>
    </v-col>
  </v-row>
</template>
<i18n>
  {
  "en": {
    "server": "Server",
    "siapeRegistration": "SIAPE Registration",
    "allocation": "Allocation",
    "coordinator": "Coordinator",
    "startDate": "Start Date",
    "endDate": "End Date",
    "reviewedBy": "Reviewed By",
    "code": "Code",
    "subject": "Subject",
    "requester": "Requester",
    "solicitationType": "Solicitation Type",
    "status": "Status",
    "priority": "Priority"
  },
  "pt-br": {
    "server": "Servidor",
    "siapeRegistration": "Matrícula SIAPE",
    "allocation": "Lotação",
    "coordinator": "Coordenador",
    "startDate": "Data Inicial",
    "endDate": "Data Final",
    "reviewedBy": "Avaliado por",
    "code": "Código",
    "subject": "Assunto",
    "requester": "Solicitante",
    "solicitationType": "Tipo de Solicitação",
    "status": "Status",
    "priority": "Prioridade"
  }
}
</i18n>
<script>
export default {
  props: {
    filters: Object,
    reviewersList: Array,
    solicitationTypes: Array,
    statusList: Array,
    priorityList: Array,
    isNewAccessRequest: Boolean,
  },
  data() {
    return {
      menuStartDate: false,
      menuEndDate: false,
    };
  },
};
</script>
