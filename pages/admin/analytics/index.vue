<template>
  <div style="width: 100%;">
    <div class="pa-4 px-8">
      <div class="d-flex align-center justify-end mx-4 mb-4">
        <v-btn
          color="primary"
          @click="navigateTo(localePath('/admin/analytics/add'))"
        >
          <v-icon left>
            mdi-plus
          </v-icon>
          {{ $t('add-button-label') }}
        </v-btn>
      </div>

      <v-data-table
        class="table"
        fixed-header
        :headers="headers"
        :items="analytics"
        :loading="loadingAnalytics"
      >
        <template #loading>
          <v-skeleton-loader type="table-row@10" />
        </template>

        <template #item.name="{ item }">
          {{ item.name }}
        </template>

        <template #item.url="{ item }">
          {{ item.url }}
        </template>

        <template #item.date_created="{ item }">
          {{ formatDate(item.date_created) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            color="accent"
            icon
            small
            @click="openModal(item)"
          >
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            @click="handleEdit(item.id)"
          >
            <v-icon>mdi-eye-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </div>

    <v-dialog
      v-model="dialog"
      width="auto"
    >
      <v-card max-width="400">
        <v-card-title>
          <v-icon left>
            mdi-alert
          </v-icon>
          {{ $t('title-alert') }}
        </v-card-title>
        <v-card-text>
          {{ $t('confirm-delete') }} ({{ handleAnalytic ? handleAnalytic.name : '' }}) ?
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="accent"
            @click="closeModal"
          >
            {{ $t('modal-cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            @click="deleteAnalytic"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<i18n>
{
  "en": {
    "add-button-label": "Add",
    "error-message-getAnalytics": "Failed to get analytics list",
    "date-format": "YYYY-MM-DD",
    "confirm-delete": "Are you sure you want to delete this analytic",
    "modal-cancel": "Cancel",
    "error-message-delete-analytic": "Failed to delete analytic",
    "success-message-delete-analytic": "Analytic deleted successfully",
    "title-alert": "Alert"
  },
  "pt-br": {
    "add-button-label": "Adicionar",
    "error-message-getAnalytics": "Falha ao obter lista das análises",
    "date-format": "DD/MM/YYYY",
    "confirm-delete": "Tem certeza que deseja excluir esta análise",
    "modal-cancel": "Cancelar",
    "error-message-delete-analytic": "Falha ao excluir análise",
    "success-message-delete-analytic": "Análise excluída com sucesso",
    "title-alert": "Alerta"
  }
}
</i18n>

<script>
export default {
  name: 'AdminAnalytics',
  layout: 'admin',
  data() {
    return {
      dialog: false,
      handleAnalytic: null,
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Tooltip', value: 'tooltip' },
        { text: 'Date Created', value: 'date_created' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    analytics() {
      return this.$store.state.statistics.data || [];
    },
    loadingAnalytics() {
      return this.$store.state.statistics.isLoading;
    },
    localePath() {
      return this.$nuxt.$localePath || ((path) => path);
    },
  },
  mounted() {
    this.$store.dispatch(
      'statistics/getAnalytics',
      this.$t('error-message-getAnalytics'),
    );
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      const locale = this.$i18n.locale === 'pt-BR' ? 'pt-BR' : 'en-US';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString(locale, options);
    },
    openModal(item) {
      this.handleAnalytic = item;
      this.dialog = true;
    },
    closeModal() {
      this.dialog = false;
      this.handleAnalytic = null;
    },
    async deleteAnalytic() {
      this.$store.dispatch(
        'statistics/deleteAnalytics',
        { id: this.handleAnalytic.id, messageError: this.$t('error-message-delete-analytic') },
      );
      this.closeModal();
    },
    async handleEdit(id) {
      this.$router.push(this.localePath(`/admin/analytics/edit/${id}`));
    },
    navigateTo(path) {
      this.$router.push(path);
    },
  },
};
</script>

<style scoped>
.table {
  width: 100%;
  height: calc(100vh - 200px) !important;
}
</style>
