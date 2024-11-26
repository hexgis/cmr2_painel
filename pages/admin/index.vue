<template>
  <div class="admin pa-5">
    <h1 class="pb-5 text-uppercase">{{ $t('title')}}</h1>
    <v-row>
      <v-col>
        <v-card class="pa-5 d-flex" :to="localePath('/dashboard')">
          <div class="card--wrapper">
            <p class="font-weight-bold text-h6"> {{ $t("acess-total", { acessTotal }) }}</p>
            <p class="text-h6">{{ $t("year", { currentYear }) }}</p>
            <a class="link">{{ $t("details") }}</a>
          </div>
          <div class="pl-4">
            <v-icon color="#D92B3F86">mdi-chart-box-multiple-outline</v-icon>
          </div>
        </v-card>
      </v-col>
      <v-col>
        <v-card class="pa-5 d-flex" :to="localePath('/admin/criticas')">
          <div class="card--wrapper">
            <p class="text-h5">{{ $t("reviews") }}</p>
            <p class="font-weight-bold text-h5">{{ $t("suggestions") }}</p>
          </div>
          <div class="pl-4">
            <v-icon color="#F58A1F86">mdi-comment-check-outline</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
        <v-card class="banner" @click.prevent="goToRescrictedArea">
          <span id="circle">
            <p>{{ newAccessRequests }}</p>
          </span>
          <div class="banner--content pl-2">
            <p class="mb-0 text-h6"><strong>{{ $t("new-requests") }} </strong>{{ $t("restricted-area-access") }}</p>
            <a class="link">{{ $t("review-requests") }}</a>
          </div>
        </v-card>
    </v-row>
    <v-row>
      <v-card class="ma-2 pt-2 pl-4 d-flex" style="width: 100%;" @click.prevent="goToHandleUsers">
        <v-col class="w-40" style="max-width: 40%;">
          <p class="text-h6"><strong>{{ $t("manage-users") }}</strong></p>
          <v-icon color="#D92B3F86">mdi-account-group</v-icon>
        </v-col>
        <v-col class="d-flex align-center" style="max-width: 60%;">
          <div class="card--separator pr-5 text-right">
            <p class="text-h6 mb-0 font-weight-bold">{{ $t("active-users", { activeUsers }) }}</p>
            <p class="text-h6">{{ $t("active") }}</p>
          </div>
          <a class="link text-h6 pl-5">{{ $t("add") }}<br/>{{ $t("new-user") }}</a>
        </v-col>
      </v-card>
    </v-row>
  </div>
</template>
<i18n>
  {
    "en": {
      "title": "Admin Panel",
      "acess-total": "{acessTotal} ACCESSES",
      "year": "IN {currentYear}.",
      "details": "view details",
      "reviews": "REVIEWS AND",
      "suggestions": "SUGGESTIONS",
      "new-requests": "NEW REQUESTS",
      "restricted-area-access": "FOR RESTRICTED AREA ACCESS",
      "review-requests": "review requests",
      "manage-users": "MANAGE USERS",
      "active-users": "{count} USERS",
      "active": "ACTIVE",
      "add": "add",
      "new-user": "new user"
    },
    "pt-br": {
      "title": "Painel Administrativo",
      "acess-total": "{acessTotal} ACESSOS",
      "year": "EM {currentYear}.",
      "details": "ver detalhes",
      "reviews": "CRÍTICAS E",
      "suggestions": "SUGESTÕES",
      "new-requests": "NOVAS SOLICITAÇÕES",
      "restricted-area-access": "DE ACESSO À AREA RESTRITA",
      "review-requests": "revisar solicitações",
      "manage-users": "GERENCIAR USUÁRIOS",
      "active-users": "{activeUsers} USUÁRIOS",
      "active":  "ATIVOS",
      "add": "adicionar",
      "new-user": "novo usuário"
    }
  }
</i18n>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Admin',
  layout: 'admin',

  async mounted(){
    await this.$store.dispatch('admin/fetchRequestListAccess');
    await this.$store.dispatch('admin/fetchAcessTotal');
    const pendingRequests = this.newUsersRequest.filter(newUsersRequest => newUsersRequest.status_name === "Pendente");
    await this.$store.dispatch('admin/fetchNewAccessRequest', { newAccessRequests: pendingRequests.length });
    await this.$store.dispatch('admin/fetchActiveUsers');
  },

  computed: {
    ...mapGetters('admin', ['acessTotal', 'activeUsers','newRequests', 'newAccessRequests', 'newUsersRequest']),
    currentYear(){
      return new Date().getFullYear();
    },
    goToRescrictedArea(){
      return () => this.$router.push(this.localePath('/admin/area-restrita'))
    },
    goToHandleUsers(){
      return () => this.$router.push(this.localePath('/admin/usuarios'))
    }
  }
}
</script>

<style lang="sass" scoped>
#circle
  background: #FFCE03
  padding: 1rem
  width: 45px
  height: 45px
  display: flex
  align-items: center
  justify-content: center
  border-radius: 50%
  margin-bottom: 1.5rem
  font-size: 26px
  font-weight: bold

.admin
  height: 100vh
  overflow-y: auto
  width: 100%
  max-width: 1200px

.v-icon
  font-size: 120px

.v-card
  cursor: pointer

.link
  color: #F58A1F
  font-weight: bold
  text-decoration: underline

.text-h6
  line-height: 1.5rem

p
  line-height: 20px
  margin-bottom: 0

.card
  &--wrapper
    max-width: 480px
    width: 100%
    min-height: 150px
    align-content: flex-end

  &--separator
    border-right: 4px solid #D92B3F

.banner
  background-image: url('/img/portal/sliderb_06.jpg')
  background-size: cover
  display: flex
  align-items: flex-end
  width: 100%
  height: 255px
  margin: 10px
  padding: 1rem

  & .v-icon
    align-items: flex-end
    padding-bottom: 1.5rem

  &--content
    max-width: 300px
    height: 100%
    color: white
    align-content: flex-end

  p
    line-height: 25px

</style>
