import jwtDecode from 'jwt-decode';

export const state = () => ({
  token: null,
  refresh: null,
  confirmationCode: null,
});

export const getters = {
  getToken(state) {
    return state.token;
  },

  getRefreshToken(state) {
    return state.refresh;
  },
};

export const mutations = {
  setAccessToken(state, token) {
    state.token = token;
  },

  setTokens(state, { token, refresh }) {
    state.token = token;
    state.refresh = refresh;
  },

  clearTokens(state) {
    state.token = null;
    state.refresh = null;
  },
  setConfirmationCode(state, code) {
    state.confirmationCode = code;
  },
};

export const actions = {
  async authenticate({ commit }, { username, password }) {
    return await this.$api
      .$post('auth/obtain_token/', { username, password })
      .then((data) => {
        commit('setTokens', {
          token: data.access,
          refresh: data.refresh,
        });
        this.$api.setHeader('Authorization', `Bearer ${data.access}`);

        this.$cookies.set('token', data.access, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
        this.$cookies.set('refresh', data.refresh, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
      });
  },

  refreshToken({ state, commit, dispatch }) {
    try {
      const decoded = jwtDecode(state.refresh);
      if (decoded.exp > Date.now() / 1000) {
        return this.$api
          .$post('auth/refresh_token/', { refresh: state.refresh })
          .then((data) => {
            commit('setAccessToken', data.access);
            this.$api.setHeader(
              'Authorization',
              `Bearer ${data.access}`,
            );

            this.$cookies.set('token', data.access, {
              path: '/',
              maxAge: 60 * 60 * 24 * 7,
            });

            return data;
          })
          .catch(() => {
            dispatch('logout');
          });
      }
      dispatch('logout');
    } catch (e) {
      dispatch('logout');
    }
  },

  logout({ commit }) {
    commit('clearTokens');
    this.$api.setHeader('Authorization', null);

    this.$cookies.remove('token');
    this.$cookies.remove('refresh');

    commit(
      'userProfile/setUser',
      {
        user: null,
      },
      { root: true },
    );

    this.$router.replace(this.localePath('login'));
  },

  tryAutoLogin({ commit, dispatch }) {
    const token = this.$cookies.get('token');
    const refresh = this.$cookies.get('refresh');
    if (token) {
      try {
        let decoded = jwtDecode(token);

        if (decoded.exp > Date.now() / 1000) {
          commit('setTokens', { token, refresh });
          this.$api.setHeader('Authorization', `Bearer ${token}`);
        } else {
          decoded = jwtDecode(refresh);
          if (decoded.exp > Date.now() / 1000) {
            commit('setTokens', { token, refresh });
            return dispatch('refreshToken');
          }
        }
      } catch (e) {
        dispatch('logout');
      }
    }
  },

  changeUserPassword(
    { commit },
    { oldPassword, newPassword1, newPassword2 },
  ) {
    return this.$api
      .$put('auth/change-password/', {
        oldPassword,
        newPassword1,
        newPassword2,
      })
      .then((data) => {
        commit('setTokens', {
          token: data.access,
          refresh: data.refresh,
        });
        this.$api.setHeader('Authorization', `Bearer ${data.access}`);
        this.$cookies.set('token', data.access, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
        this.$cookies.set('refresh', data.refresh, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        return data;
      })
      .catch((error) => Promise.reject(error));
  },
};
