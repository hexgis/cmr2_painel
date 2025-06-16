<template>
  <div class="institution">
    <span class="d-flex align-center justify-space-between">
      <h1>{{ $t('manageInstitutions') }}</h1>
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

    <div class="d-flex justify-space-between align-center mb-2 mt-4">
      <div class="d-flex align-center">
        <!-- botão para escolher colunas -->
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <v-btn text small v-bind="attrs" v-on="on">
              Selecionar colunas
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item v-for="h in headers" :key="h.value">
              <v-list-item-action>
                <v-checkbox
                  v-model="visibleColumns"
                  :value="h.value"
                  dense
                  hide-details
                />
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ h.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- pesquisa geral -->
        <v-text-field
          v-model="searchAll"
          placeholder="Pesquisar tudo"
          append-icon="mdi-magnify"
          clearable
          dense
          outlined
          hide-details
          class="ml-4"
          style="width: 350px;"
          @click.stop
        />

        <!-- Export section -->
        <div class="d-flex align-center ml-3">
          <div class="export-icons">
            <div class="export-label text-uppercase mr-2">
              {{ $t('export') }}
            </div>

            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  color="#D92B3F"
                  v-bind="attrs"
                  v-on="on"
                  class="mr-2"
                  @click="generatePDF"
                >
                  <v-icon size="40">mdi-file-pdf-box</v-icon>
                </v-btn>
              </template>
              <span>PDF</span>
            </v-tooltip>

            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  color="#43A047"
                  @click="generateCSV"
                  class="mr-3"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon size="40">mdi-file-excel-box</v-icon>
                </v-btn>
              </template>
              <span>CSV</span>
            </v-tooltip>
          </div>
        </div>
      </div>

      <!-- botão adicionar nova instituição -->
      <v-btn
        color="error"
        dark
        rounded
        class="add-institution-btn"
        :class="{ 'collapsed': isButtonCollapsed }"
        @click="showModal = true"
        @mouseenter="expandButton"
        @mouseleave="collapseButtonIfNeeded"
      >
        <v-icon>mdi-plus</v-icon>
        <span class="button-text ml-2">{{ $t('addNewInstitution') }}</span>
      </v-btn>
    </div>

    <v-data-table
      v-if="filteredInstitutions.length"
      :headers="filteredHeaders"
      :items="filteredByColumns"
      class="elevation-1 mt-4"
      dense
      :search="search"
    >
      <!-- filtro Nome -->
      <template #header.name="{ header }">
        <v-menu
          v-model="nameMenu"
          offset-y
          :close-on-content-click="false"
        >
          <template #activator="{ on, attrs }">
            <v-btn text small v-bind="attrs" v-on="on">
              {{ header.text }}<v-icon small>mdi-filter-variant</v-icon>
            </v-btn>
          </template>
          <v-card style="width:250px">
            <v-text-field
              v-model="searchName"
              placeholder="Pesquisar..."
              outlined dense hide-details clearable
              class="mx-3 mt-3" @click.stop
            />
            <v-divider/>
            <v-list dense class="filter-list">
              <v-list-item
                v-for="name in filteredNameList" :key="name"
              >
                <v-checkbox
                  v-model="columnFilters.name"
                  :value="name" :label="name"
                  dense @change="nameMenu = false"
                />
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>

      <!-- filtro Tipo -->
      <template #header.institution_type="{ header }">
        <v-menu
          v-model="typeMenu"
          offset-y
          :close-on-content-click="false"
        >
          <template #activator="{ on, attrs }">
            <v-btn text small v-bind="attrs" v-on="on">
              {{ header.text }}<v-icon small>mdi-filter-variant</v-icon>
            </v-btn>
          </template>
          <v-card style="width:250px">
            <v-text-field
              v-model="searchType"
              placeholder="Pesquisar..."
              outlined dense hide-details clearable
              class="mx-3 mt-3" @click.stop
            />
            <v-divider/>
            <v-list dense class="filter-list">
              <v-list-item
                v-for="type in filteredTypeList" :key="type"
              >
                <v-checkbox
                  v-model="columnFilters.institution_type"
                  :value="type" :label="type"
                  dense @change="typeMenu = false"
                />
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>

      <template #item.actions="{ item }">
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <v-btn icon small color="grey darken-2" v-bind="attrs" v-on="on" @click="openEditDialog(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Editar</span>
        </v-tooltip>
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <v-btn icon small color="red" v-bind="attrs" v-on="on" @click="deleteInstitution(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Excluir</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <CustomDialog
      v-model="showModal"
      title="Nova Instituição"
      max-width="500px"
      :has-cta="true"
      :save-active="formValid"
      @save="addInstitution"
    >
      <v-card-text>
        <v-form
          ref="form"
          v-model="formValid"
        >
          <v-text-field
            v-model="newInstitution.name"
            label="Nome da Instituição"
            outlined
            :rules="[requiredRule]"
          />
          <v-select
            v-model="newInstitution.institution_type"
            label="Tipo da Instituição"
            :items="institutionTypes"
            outlined
            :rules="[requiredRule]"
          />
        </v-form>
      </v-card-text>
    </CustomDialog>

    <CustomDialog
      v-model="showEditModal"
      title="Editar Instituição"
      max-width="500px"
      :has-cta="true"
      :save-active="formValid"
      @save="editInstitution"
    >
      <v-card-text>
        <v-form
          ref="editForm"
          v-model="formValid"
        >
          <v-text-field
            v-model="editInstitutionData.name"
            label="Nome da Instituição"
            outlined
            :rules="[requiredRule]"
          />
          <v-select
            v-model="editInstitutionData.institution_type"
            label="Tipo da Instituição"
            :items="institutionTypes"
            outlined
            :rules="[requiredRule]"
          />
        </v-form>
      </v-card-text>
    </CustomDialog>
  </div>
</template>

<i18n>
{
  "en": {
    "manageInstitutions": "Manage Institutions",
    "addNewInstitution": "Add new institution",
    "export": "Export:",
    "add-institution": "Institution added successfully!",
    "erro-add-institution": "Error adding institution",
    "changed-institution": "Institution updated successfully!",
    "erro-edit-institution": "Error updating institution",
    "deleted-institution": "Institution deleted successfully!",
    "erro-delete-institution": "Error deleting institution"
  },
  "pt-br": {
    "manageInstitutions": "Gerenciar Instituições",
    "addNewInstitution": "Adicionar nova instituição",
    "export": "Exportar:",
    "add-institution": "Instituição adicionada com sucesso!",
    "erro-add-institution": "Erro ao adicionar instituição",
    "changed-institution": "Instituição alterada com sucesso!",
    "erro-edit-instituição": "Erro ao alterar instituição",
    "deleted-institution": "Instituição excluída com sucesso!",
    "erro-delete-instituição": "Erro ao excluir instituição"
  }
}
</i18n>

<script>
import CustomDialog from '/components/admin/CustomDialog.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'Instituicoes',
  components: { CustomDialog },
  layout: 'admin',

  data() {
    return {
      showModal: false,
      showEditModal: false,
      formValid: false,
      search: '',
      searchAll: '',
      searchName: '',
      searchType: '',
      nameMenu: false,
      typeMenu: false,
      isButtonCollapsed: true,
      buttonCollapseTimeout: null,

      headers: [
        { text: 'Nome', value: 'name' },
        { text: 'Tipo', value: 'institution_type' },
        { text: 'Ações', value: 'actions', align: 'center' },
      ],

      visibleColumns: ['name', 'institution_type', 'actions'],

      columnFilters: {
        name: [],
        institution_type: [],
      },

      newInstitution: {
        name: '',
        institution_type: '',
      },

      editInstitutionData: {
        id: null,
        name: '',
        institution_type: '',
      },

      institutionTypes: [
     'FUNAI Sede',
     'Outros'
      ],

      requiredRule: (v) => !!v || 'Campo obrigatório',
    };
  },

  computed: {
    ...mapGetters('admin', ['institutionList']),

    filteredInstitutions() {
      return this.institutionList || [];
    },

    filteredHeaders() {
      return this.headers.filter(h => this.visibleColumns.includes(h.value));
    },

    filteredByColumns() {
      return this.filteredInstitutions.filter(institution => {
        return Object.entries(this.columnFilters).every(([col, vals]) => {
          return !vals.length || vals.includes(institution[col]);
        });
      });
    },

    filteredNameList() {
      const term = (this.searchName || '').toLowerCase();
      return [...new Set(this.filteredInstitutions.map(i => i.name))]
        .filter(v => v.toLowerCase().includes(term));
    },

    filteredTypeList() {
      const term = (this.searchType || '').toLowerCase();
      return [...new Set(this.filteredInstitutions.map(i => i.institution_type))]
        .filter(v => v && v.toLowerCase().includes(term));
    },
  },

  watch: {
    searchAll(val) {
      this.search = val;
    }
  },

  async mounted() {
    await this.$store.dispatch('admin/fetchInstitutionList');

    // Start with button expanded for 2 seconds, then collapse
    this.isButtonCollapsed = false;
    setTimeout(() => {
      this.isButtonCollapsed = true;
    }, 2000);
  },

  methods: {
    async addInstitution() {
      try {
        const response = await this.$api.post('user/institution/', {
          name: this.newInstitution.name,
          institution_type: this.newInstitution.institution_type,
        });

        if (response.status === 201) {
          this.showModal = false;
          await this.$store.dispatch('admin/fetchInstitutionList');
          this.resetForm();
          this.$store.commit('alert/addAlert', {
            timeout: 3000,
            message: this.$t('add-institution'),
          });
        }
      } catch (error) {
        console.error('Erro ao criar instituição:', error);
        this.$store.commit('alert/addAlert', {
          timeout: 3000,
          message: this.$t('erro-add-institution'),
        });
      }
    },

    async editInstitution() {
      try {
        const response = await this.$api.patch(`user/institution/${this.editInstitutionData.id}/`, {
          name: this.editInstitutionData.name,
          institution_type: this.editInstitutionData.institution_type,
        });

        if (response.status === 200) {
          this.showEditModal = false;
          await this.$store.dispatch('admin/fetchInstitutionList');
          this.resetForm();
          this.$store.commit('alert/addAlert', {
            timeout: 3000,
            message: this.$t('changed-institution'),
          });
        }
      } catch (error) {
        console.error('Erro ao editar instituição:', error);
        this.$store.commit('alert/addAlert', {
          timeout: 3000,
          message: this.$t('erro-edit-institution'),
        });
      }
    },

    async deleteInstitution(institution) {
      if (confirm('Tem certeza que deseja excluir esta instituição?')) {
        try {
          await this.$api.delete(`user/institution/${institution.id}/`);
          await this.$store.dispatch('admin/fetchInstitutionList');
          this.$store.commit('alert/addAlert', {
            timeout: 3000,
            message: this.$t('deleted-institution'),
          });
        } catch (error) {
          console.error('Erro ao excluir instituição:', error);
          this.$store.commit('alert/addAlert', {
            timeout: 3000,
            message: this.$t('erro-delete-institution'),
          });
        }
      }
    },

    openEditDialog(institution) {
      this.editInstitutionData = {
        id: institution.id,
        name: institution.name,
        institution_type: institution.institution_type || '',
      };
      this.showEditModal = true;
    },

    resetForm() {
      this.newInstitution = {
        name: '',
        institution_type: '',
      };
      this.editInstitutionData = {
        id: null,
        name: '',
        institution_type: '',
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
      if (this.$refs.editForm) {
        this.$refs.editForm.resetValidation();
      }
    },

    expandButton() {
      if (this.buttonCollapseTimeout) {
        clearTimeout(this.buttonCollapseTimeout);
        this.buttonCollapseTimeout = null;
      }
      this.isButtonCollapsed = false;
    },

    collapseButtonIfNeeded() {
      this.buttonCollapseTimeout = setTimeout(() => {
        this.isButtonCollapsed = true;
      }, 500);
    },

    generateCSV() {
      const headers = ['Nome', 'Tipo'];
      const rows = this.filteredByColumns.map(institution => [
        institution.name,
        institution.institution_type || '',
      ]);
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'instituicoes.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    },

    generatePDF() {
      // Similar to users PDF generation
      import('jspdf').then(({ default: jsPDF }) => {
        import('jspdf-autotable').then(({ default: autoTable }) => {
          const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
          });

          doc.setFontSize(12);
          doc.text('Lista de Instituições', 15, 20);

          autoTable(doc, {
            startY: 30,
            head: [['Nome', 'Tipo']],
            body: this.filteredByColumns.map((institution) => [
              institution.name,
              institution.institution_type || '',
            ]),
            headStyles: {
              fillColor: '#D92B3F',
              textColor: [255, 255, 255],
            },
          });

          doc.save('lista_de_instituicoes.pdf');
        });
      });
    },
  },
};
</script>

<style lang="sass" scoped>
.institution
  height: 100vh
  overflow-y: auto
  width: 100%
  padding: 2rem

.filter-list
  max-height: 200px
  overflow-y: auto

.export-label
  letter-spacing: 0.5px
  font-size: 0.8rem
  display: flex
  align-items: center

.add-institution-btn
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)
  overflow: hidden
  white-space: nowrap
  min-width: 40px
  padding: 8px 16px

  .button-text
    transition: opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), margin 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)
    opacity: 1
    transform: translateX(0)
    margin-left: 8px

  &.collapsed
    padding: 8px

    .button-text
      opacity: 0
      width: 0
      margin: 0
      transform: translateX(-20px)
      margin-left: 0

.export-icons
  display: flex
  align-items: center
  gap: 0.25rem
</style>
