<template>
  <div v-if="info">
    <div class="info--wrapper">
      <p class="light--text">#{{info.code}}</p>
      <p class="text-h6 font-weight-bold">{{ info.subject }}</p>
      <p class="light--text">{{info.solicitation_name}}</p>
    </div>
    <v-container fluid class="d-flex align-start pa-0">
      <StatusBadge class="badge" :status="info.ticket_status.formated_info.sub_status_display" />
    </v-container>
    <div class="d-flex align-start flex-lg-row mt-2">
      <PriorityBadge :priority="info.ticket_status.formated_info.priority_display"/>
      <span  class="vertical-separator ml-5">
        <p v-if="dueOn" class="light--text">{{ $t('deliveryForecast') }}</p>
        <p v-else class="light--text">{{ $t('requestedOn') }}</p>
        <p>{{ dueDate }}</p>
      </span>
    </div>
  </div>
</template>
<i18n>
  {
      "en": {
          "deliveryForecast": "Delivery forecast",
          "requestedOn": "Requested on"
      },
      "pt-br": {
          "deliveryForecast": "Previsão de entrega",
          "requestedOn": "Solicitado em"
      }
  }
</i18n>
<script>
import PriorityBadge from './PriorityBadge.vue';
import StatusBadge from './StatusBadge.vue';

export default {
  name: 'UserInfo',
  props: {
    info: {
      type: Object,
      default: null,
    },
  },
  components: { StatusBadge, PriorityBadge },
  computed:{
    dueDate(){
      return this.dueOn
        ? this.formattedDate(this.dueOn)
        : this.info.opened_in_formatted
    },
    dueOn(){
      return this.info.ticket_status.due_on
    }
  },
  methods: {
    formattedDate(date){
      if (date){
        const [year, month, day] = date.split('-')
        return `${day}/${month}/${year}`
      }
    }
  }
}
</script>
<style lang="sass" scoped>
p
  margin: 0

.info--wrapper
  min-height: 5rem

.badge
  float: left
  padding: 0 1rem
  font-size: 0.8rem

.v-application .text-h6
  line-height: 1.2rem

.vertical-separator
  border-left: 1px solid #9A9997
  padding-left: 1rem

.light--text
  color: #9A9997
  font-size: 12px
</style>
