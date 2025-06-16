<template>
  <span @click="generatePDF">
    <v-img
      src="/img/icons/file-pdf-box.png"
      max-width="50"
      max-height="50"
    />
  </span>
</template>

<script>
import jsPDF from 'jspdf';
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
      doc.text('Lista de Usuários', 90, 20);

      // Cria a tabela com os dados dos usuários
      autoTable(doc, {
        startY: 30,
        head: [['Nome', 'Email', 'Administrador', 'Acesso Permitido', 'Instituição']],
        body: this.users.map((user) => [
          user.username,
          user.email,
          user.is_staff ? 'Sim' : 'Não',
          user.is_active ? 'Sim' : 'Não',
          user.institution,
        ]),
        headStyles: {
          fillColor: '#D92B3F',
          textColor: [255, 255, 255],
        },
      });

      // Salva o PDF
      doc.save('lista_de_usuarios.pdf');
    },
  },
};
</script>

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
