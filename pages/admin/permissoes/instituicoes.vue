<template>
  <div class="institution">
      <span class="d-flex align-center justify-space-between">
      <h1 class="text-uppercase">Gerenciamento de Instituições</h1>
      <v-btn
        color="primary"
        text
        @click="$router.back()"
      >
        <v-icon color="primary">mdi-arrow-left</v-icon>
      </v-btn>
    </span>
      <span class="card--wrapper mt-4">
          <Institutions
              v-for="institution in institutionList"
              :key="institution.id"
              :card="institution"
              from="institutions"
          />
      </span>
      <div class="add--btn">
          <v-btn
              height="50"
              color="primary"
              rounded
              @click="dialog = !dialog"
          >
              <v-icon size="20">mdi-plus</v-icon>
          </v-btn>
      </div>
      <CustomDialog
          v-model="dialog"
          title="Adicionar"
          :hasCta="true"
          :saveActive="true"
          width="800px"
          @save="addInstitution"
      >
          <v-text-field
              class="pt-8"
              hide-details="auto"
              v-model="institutionName"
              label="Nome da Instituição"
          ></v-text-field>
      </CustomDialog>
  </div>
</template>

<script>
import CustomDialog from '/components/admin/CustomDialog.vue'
import Institutions from '/components/admin/Institutions.vue'

import { mapGetters } from 'vuex'

export default {
  components: { Institutions, CustomDialog },
  name: 'Instituicao',
  layout: 'admin',
  data() {
      return {
          dialog: false,
          institutionName: '',
      }
  },
  async mounted() {
      this.$store.dispatch('admin/fetchInstitutionList')
      
  },
  computed: {
      ...mapGetters('admin', ['institutionList']),
  },
  methods: {
      async addInstitution() {
          await this.$api.post('user/institution/', {
              name: this.institutionName,
          })
          this.$store.dispatch('admin/fetchInstitutionList')
          this.dialog = false
      },
  },
}
</script>


<style lang="sass" scoped>
.institution
  width: 100%
  padding: 1.5rem

.card
  &--wrapper
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(350px,1fr))
    gap: 1rem

.add--btn
  position: absolute
  bottom: 20px
  right: 20px
  z-index: 3
</style>
