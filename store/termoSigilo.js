// store/termoSigilo.js
export const state = () => ({
  hasAccepted: null, // null = não verificado, true = aceito, false = não aceito
  isChecking: false,
  lastCheck: null,
  checkInterval: 5 * 60 * 1000,
  termoData: null,
});

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
};

export const getters = {
  needsCheck(state) {
    if (state.hasAccepted === null) return true;

    if (!state.lastCheck) return true;

    if (state.isChecking) return false;

    if (state.hasAccepted === false) return false;

    const timeSinceLastCheck = Date.now() - state.lastCheck;
    return timeSinceLastCheck > state.checkInterval;
  },

  shouldShowModal(state) {
    return state.hasAccepted === false;
  },

  isCurrentlyChecking(state) {
    return state.isChecking;
  },
};

export const actions = {
  async checkStatus({ commit, getters, state }) {
    if (state.isChecking) {
      console.log('Já está verificando termo, aguardando...');
      while (state.isChecking) {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
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
    if (state.termoData) {
      console.log('usando cache do termo');
      return state.termoData;
    }

    const termoData = {
      title: 'Termo de Sigilo e Confidencialidade',
      text: `Para utilizar o serviço do Centro de Monitoramento Remoto da Fundação Nacional do Índio o servidor deve ler e concordar com o Termo de Serviço:

1. Cada servidor designado poderá criar apenas uma conta, de uso pessoal e intransferível. É expressamente proibida a utilização por mais de uma pessoa, empréstimo, divulgação, cessão ou qualquer forma de transferência de conta, NOME DE USUÁRIO e SENHA DE ACESSO.

2. O SERVIDOR se compromete a notificar o CMR imediatamente, mediante envio de correio eletrônico ao endereço "cmr@funai.gov.br", sempre que tiver ciência de qualquer uso não autorizado de seu NOME DE USUÁRIO, e-mail e/ou SENHA DE ACESSO.

3. O SERVIDOR assume o compromisso de manter confidencialidade e sigilo sobre todas as informações técnicas, científicas, metodológicas, processos e observações apresentadas e discutidas no âmbito do Centro de Monitoramento Remoto da Fundação Nacional do Índio.

4. As informações e dados disponibilizados no sistema são de propriedade da FUNAI e são fornecidos exclusivamente para fins de trabalho oficial.

5. É vedado o uso das informações para fins comerciais, pessoais ou qualquer outro propósito que não seja relacionado às atividades oficiais da FUNAI.

6. O descumprimento deste termo pode resultar em medidas disciplinares e/ou legais conforme a legislação vigente.

7. O acesso às informações está condicionado ao cumprimento integral dos termos aqui estabelecidos e à legislação vigente sobre proteção de dados e informações públicas.

8. Este termo entra em vigor na data de sua aceitação e permanece válido enquanto o usuário mantiver acesso ao sistema.`,
      version: '2.0',
    };

    console.log('[Store] Carregando termo hardcoded do frontend');

    commit('SET_TERMO_DATA', termoData);
    console.log('[Store] Termo carregado e armazenado no cache');

    return termoData;
  },

  async acceptTermo({ commit }, { version }) {
    try {
      const response = await this.$axios.post('/user/termo-sigilo/accept/', {
        accepted: true, // Campo obrigatório
        version: version || '2.0',
      });
      commit('SET_HAS_ACCEPTED', true);
      return response.data;
    } catch (error) {
      console.error('Erro ao aceitar termo:', error);
      if (error.response && error.response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      throw error;
    }
  },

  async rejectTermo({ commit }) {
    try {
      const response = await this.$axios.post('/user/termo-sigilo/reject/');
      commit('SET_HAS_ACCEPTED', false);
      return response.data;
    } catch (error) {
      commit('SET_HAS_ACCEPTED', false);
      throw error;
    }
  },

  markAsAccepted({ commit }) {
    commit('SET_HAS_ACCEPTED', true);
  },

  markAsRejected({ commit }) {
    commit('SET_HAS_ACCEPTED', false);
  },

  reset({ commit }) {
    commit('RESET_STATE');

    if (process.client) {
      try {
        localStorage.removeItem('termo-aceito');
        localStorage.removeItem('termoSigilo');
        sessionStorage.removeItem('termo-aceito');
        sessionStorage.removeItem('termoSigilo');
      } catch (error) {
        console.warn('Erro ao limpar storage do termo:', error);
      }
    }
  },
};
