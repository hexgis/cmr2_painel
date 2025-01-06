<template>
  <span @click="generatePDF">
    <v-img src="/img/icons/file-pdf-box.svg"/>
    <p class="text-center">PDF</p>
  </span>
</template>

<script>
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logoBase64 } from '@/utils/logoBase64';
import { mapGetters } from "vuex";

export default {
  name: "GeneratePDF",
  props: {
    activeCards: {
      type: Array,
      required: true,
    },
  },
  methods: {
    async fetchData(ticketId) {
      try {
        const response = await this.$api.get(`adm-panel/tickets/${ticketId}/`);
        return response.data;
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
        return null;
      }
    },
    formatDate(value) {
          if (!value) return ''
          const [year, month, day] = value.split('-')
          return `${day}/${month}/${year}`
    },
    async generatePDF() {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const tableData = [];

      for (const card of this.activeCards) {
        const ticketData = await this.fetchData(card.code);

        if (ticketData) {
          tableData.push([
            ticketData.code,
            ticketData.complexity_code,
            ticketData.functionality.func_name,
            ticketData.requesting,
            ticketData.subject,
            ticketData.description,
            ticketData.opened_in_formatted,
            ticketData.ticket_status.formated_info.status_category_display,
            ticketData.ticket_status.formated_info.priority_display,
            this.formatDate(ticketData.ticket_status.due_on),
          ]);
        }
      }
      const imgWidth = 65;
      const imgHeight = 15;
      doc.addImage(logoBase64(), "PNG", 15, 10, imgWidth, imgHeight);
      doc.setFontSize(12);
      doc.text("Relatório de Tickets - CMR", 90, 20);

      autoTable(doc, {
        startY: 30,
        head: [
          [
            "Código",
            "Complexidade",
            "Funcionalidade",
            "Solicitante",
            "Assunto",
            "Descrição",
            "Data de Abertura",
            "Status",
            "Prioridade",
            "Previsão de Entrega"
          ],
        ],
        body: tableData,
        headStyles: {
          fillColor: `#D92B3F`,
          textColor: [255, 255, 255],
        },
      });

      doc.save("tickets_CMR.pdf");
    },
  },
  computed: {
    ...mapGetters("admin", ["ticketDetail"]),
  }
};
</script>

<style scoped>
span {
  cursor: pointer;
}
</style>
