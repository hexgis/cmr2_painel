<template>
  <v-tooltip top>
    <template #activator="{ on, attrs }">
      <span
        v-bind="attrs"
        @click="generatePDF"
        v-on="on"
      >
        <v-icon
          color="#D92B3F"
          size="40"
        >mdi-file-pdf-box</v-icon>
      </span>
    </template>
    <span>{{ $t('pdf') }}</span>
  </v-tooltip>
</template>

<script>
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from '@/utils/logoBase64';

export default {
  name: 'SavePdfUser',
  props: {
    users: {
      type: Array,
      required: true,
    },
  },

  methods: {
    generatePDF() {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Adiciona o logo e o título ao PDF
      const imgWidth = 65;
      const imgHeight = 15;
      doc.addImage(logoBase64(), 'PNG', 15, 10, imgWidth, imgHeight);
      doc.setFontSize(12);
      doc.text(this.$t('userList'), 90, 20);

      // Cria a tabela com os dados dos usuários
      autoTable(doc, {
        startY: 30,
        head: [[
          this.$t('headerUser'),
          this.$t('headerFirstName'),
          this.$t('headerLastName'),
          this.$t('headerEmail'),
          this.$t('headerAdmin'),
          this.$t('headerAccess'),
          this.$t('headerInstitution'),
        ]],
        body: this.users.map((user) => [
          user.username,
          user.first_name || '',
          user.last_name || '',
          user.email,
          user.is_admin ? this.$t('yes') : this.$t('no'),
          user.is_active ? this.$t('active') : this.$t('inactive'),
          (user.institution && user.institution.acronym) || (user.institution && user.institution.name) || '',
        ]),
        headStyles: {
          fillColor: '#D92B3F',
          textColor: [255, 255, 255],
        },
      });

      // Salva o PDF
      doc.save(this.$t('fileName'));
    },
  },
};
</script>

<i18n lang="json">
{
  "en": {
    "pdf": "PDF",
    "userList": "User List",
    "headerUser": "User",
    "headerFirstName": "First Name",
    "headerLastName": "Last Name",
    "headerEmail": "Email",
    "headerAdmin": "Administrator",
    "headerAccess": "Access Allowed",
    "headerInstitution": "Institution",
    "yes": "Yes",
    "no": "No",
    "active": "Active",
    "inactive": "Inactive",
    "fileName": "user_list.pdf"
  },
  "pt-br": {
    "pdf": "PDF",
    "userList": "Lista de Usuários",
    "headerUser": "Usuário",
    "headerFirstName": "Primeiro Nome",
    "headerLastName": "Último Nome",
    "headerEmail": "Email",
    "headerAdmin": "Administrador",
    "headerAccess": "Acesso Permitido",
    "headerInstitution": "Instituição",
    "yes": "Sim",
    "no": "Não",
    "active": "Ativo",
    "inactive": "Inativo",
    "fileName": "lista_de_usuarios.pdf"
  }
}
</i18n>

<style scoped>
span {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

span:hover {
  opacity: 0.8;
}
</style>
