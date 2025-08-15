// store/termoSigilo.js
export const state = () => ({
  hasAccepted: null, // null = não verificado, true = aceito, false = não aceito
  isChecking: false,
  lastCheck: null,
  checkInterval: 5 * 60 * 1000, // 5 minutos em ms
  termoData: null, // Cache dos dados do termo
})

export const mutations = {
  SET_HAS_ACCEPTED(state, value) {
    state.hasAccepted = value;
    state.lastCheck = Date.now();
  },

  SET_IS_CHECKING(state, value) {
    state.isChecking = value;
  },

  SET_TERMO_DATA(state, data) {
    state.termoData = data;
  },

  RESET_STATE(state) {
    state.hasAccepted = null;
    state.isChecking = false;
    state.lastCheck = null;
    state.termoData = null;
  },
}

export const getters = {
  needsCheck(state) {
    // Se nunca foi verificado, precisa verificar
    if (state.hasAccepted === null) return true
    
    // Se não tem lastCheck, precisa verificar
    if (!state.lastCheck) return true
    
    // Se está verificando, não precisa verificar novamente
    if (state.isChecking) return false
    
    // Se foi rejeitado, não precisa verificar mais
    if (state.hasAccepted === false) return false
    
    // Se foi aceito recentemente (menos de 5 minutos), não precisa verificar
    const timeSinceLastCheck = Date.now() - state.lastCheck
    return timeSinceLastCheck > state.checkInterval
  },

  shouldShowModal(state) {
    return state.hasAccepted === false
  },

  isCurrentlyChecking(state) {
    return state.isChecking
  }
}

export const actions = {
  async checkStatus({ commit, getters, state }) {
    // Evitar múltiplas requisições simultâneas
    if (state.isChecking) {
      console.log('Já está verificando termo, aguardando...');
      // Aguardar a verificação atual terminar
      while (state.isChecking) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return state.hasAccepted;
    }

    // Se não precisa verificar, retornar estado atual
    if (!getters.needsCheck) {
      console.log('Não precisa verificar termo, usando cache');
      return state.hasAccepted;
    }

    try {
      commit('SET_IS_CHECKING', true);
      console.log('Fazendo requisição para verificar termo...');
      
      const response = await this.$axios.get('/user/termo-sigilo/status/');
      const hasAccepted = response.data.has_accepted;
      
      commit('SET_HAS_ACCEPTED', hasAccepted);
      console.log('Status do termo:', hasAccepted ? 'aceito' : 'não aceito');
      
      return hasAccepted;
    } catch (error) {
      console.error('Erro ao verificar termo de sigilo:', error);
      // Em caso de erro, assumir que não aceitou apenas se nunca foi verificado
      if (state.hasAccepted === null) {
        commit('SET_HAS_ACCEPTED', false);
        return false;
      }
      // Se já tinha um estado, manter o estado anterior
      return state.hasAccepted;
    } finally {
      commit('SET_IS_CHECKING', false);
    }
  },

  async loadTermoText({ commit, state }) {
    // Se já tem os dados em cache, usar cache
    if (state.termoData) {
      console.log('Usando cache do termo');
      return state.termoData;
    }

    try {
      console.log('Carregando texto do termo...');
      const response = await this.$axios.get('/user/termo-sigilo/text/');
      const termoData = {
        title: response.data.title,
        text: response.data.text,
        version: response.data.version
      };
      
      commit('SET_TERMO_DATA', termoData);
      return termoData;
    } catch (error) {
      console.error('Erro ao carregar texto do termo:', error);
      throw error;
    }
  },

  async acceptTermo({ commit }, { version }) {
    try {
      await this.$axios.post('/user/termo-sigilo/accept/', {
        accepted: true, // Campo obrigatório
        version: version
      });
      commit('SET_HAS_ACCEPTED', true);
    } catch (error) {
      console.error('Erro ao aceitar termo:', error);
      throw error;
    }
  },

  async rejectTermo({ commit }) {
    try {
      await this.$axios.post('/user/termo-sigilo/reject/')
      commit('SET_HAS_ACCEPTED', false)
    } catch (error) {
      console.error('Erro ao rejeitar termo:', error)
      throw error
    }
  },

  markAsAccepted({ commit }) {
    commit('SET_HAS_ACCEPTED', true);
  },

  markAsRejected({ commit }) {
    commit('SET_HAS_ACCEPTED', false);
  },

  reset({ commit }) {
    console.log('Resetando estado do termo de sigilo');
    commit('RESET_STATE');
  }
}
