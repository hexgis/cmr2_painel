export const state = () => ({
  acessTotal: 0,
  activeUsers: 0,
  newAccessRequests: 0,
  newUsersRequest: [],
  tickets: [],
  ticketDetail: [],
  labels: []
});

export const mutations = {
  setAcessTotal(state, total){
    state.acessTotal = total
  },
  setNewAccessRequest(state, newAccessRequests) {
    state.newAccessRequests = newAccessRequests
  },
  setNewUsersRequest(state, usersRequest) {
    state.newUsersRequest = usersRequest
  },
  setActiveUsers(state, activeUsers) {
    state.activeUsers = activeUsers.active_users
  },
  setTickets(state, tickets) {
    state.tickets = tickets
  },
  setTicketDetail(state, ticketDetail) {
    state.ticketDetail = ticketDetail
  },

  setAllLabelsOptions(state, labelOptions) {
    state.labels = labelOptions
  },
  addTicket(state, ticket) {
    state.tickets.push(ticket)
  },
  setTicketDetail(state, ticketDetail) {
    state.ticketDetail = ticketDetail;
  },

};

export const actions = {
  async fetchAcessTotal({ commit }) {
    try {
      const currentYear = new Date().getFullYear()
      const { data } = await this.$api.get(
        `dashboard/get-all/?startDate=${currentYear}-01-01&endDate=&location=&type_device=&browser=`
      )
      const acessTotal = data.monthly_counts
        .filter(monthly => monthly.year === currentYear)
        .reduce((sum, monthly) => sum + monthly.count, 0)

      commit('setAcessTotal', acessTotal)
    } catch {
      console.error('Erro ao requisitar os dados de acesso.')
    }
  },

  fetchNewAccessRequest({ commit }, { newAccessRequests }) {
    commit('setNewAccessRequest', newAccessRequests)
  },

  async fetchRequestListAccess({commit, state}){
    const url = `/portal/aprovar-acesso/`
    const { data } = await this.$api.get(url)
    commit('setNewUsersRequest', data)
  },

  async fetchActiveUsers({commit, state}){
    const url = `/adm-panel/users/info/`
    const { data } = await this.$api.get(url)
    commit('setActiveUsers', data)
  },

  async fetchTickets({commit, state}){
    const url = `/adm-panel/tickets/`
    const { data } = await this.$api.get(url)
    commit('setTickets', data)
  },

  async fetchTicketDetail({commit, state}, { ticketId }){
    const url = `/adm-panel/tickets/${ticketId}/`
    const { data } = await this.$api.get(url)
    commit('setTicketDetail', data)
  },

  async fetchAllLabelOptions({commit, state}){
    const url = `/adm-panel/tickets/choices/`
    const { data } = await this.$api.get(url)
    commit('setAllLabelsOptions', data)
  },

  async sendCsvData({ commit, state }, {filteredData}) {
    const dataCode = []
    filteredData.forEach(data => {
      dataCode.push(data.code)
    })

    const url = `/adm-panel/tickets/download-tickets/`
    try {
      const response = await this.$api.post(url, {
        ticket_ids: dataCode
      }, { responseType: 'blob' })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const link = document.createElement('a')

      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', 'tickets.xlsx')

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error('Erro ao baixar o arquivo:', error)
    }
  },

  async createTicket({ commit }, {ticketData}) {
    console.log(ticketData)
    try {
      const response = await this.$axios.post('/adm-panel/tickets/', ticketData)
      commit('addTicket', response.data)
      return response.data
    } catch (error) {
      console.error("Erro ao enviar nova solicitação:", error)
      throw error
    }
  },

};

export const getters = {
  acessTotal: state => state.acessTotal,
  activeUsers: state => state.activeUsers,
  newAccessRequests: state => state.newAccessRequests,
  newUsersRequest: state => state.newUsersRequest,
  tickets: state => state.tickets,
  ticketDetail: state => state.ticketDetail,
  labels: state => state.labels
};
